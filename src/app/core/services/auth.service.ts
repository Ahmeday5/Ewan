import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, firstValueFrom } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  StoredUser,
  AuthResponse,
} from '../../features/auth/models/login.model';
import { environment } from '../../../environments/environment.development';
import { Router } from '@angular/router';
import { DeviceService } from './device.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user$ = new BehaviorSubject<StoredUser | null>(null);
  private refreshTimeout: any;
  private BASE_URL = environment.apiBaseUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private deviceService: DeviceService,
  ) {
    this.restoreSession();
  }

  // ====================== LOGIN ======================
  // === تسجيل الدخول ===
  login(email: string, password: string, rememberMe = true) {
    const body = {
      email,
      password,
      rememberMe,
      deviceInfo: this.deviceService.getDeviceInfo(),
      deviceId: this.deviceService.getDeviceId(),
    };

    return firstValueFrom(
      this.http.post<AuthResponse>(`${this.BASE_URL}/api/Auth/login`, body),
    ).then((res) => {
      const user = this.mapUser(res.data);
      this.saveSession(user);

      if (rememberMe) {
        localStorage.setItem('savedEmail', email);
      }

      return user;
    });
  }

  // ====================== REFRESH TOKEN (يستدعى تلقائياً في الـ Interceptor) ======================
  // === تجديد التوكن ===
  async refresh(): Promise<StoredUser> {
    const current = this.user$.value;

    if (!current?.refreshToken) {
      await this.logoutCurrent(); // بدل logout() القديم
      throw new Error('No refresh token available');
    }

    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.BASE_URL}/api/Auth/refresh`, {
          refreshToken: current.refreshToken,
        }),
      );

      const user = this.mapUser(res.data);
      this.saveSession(user); // 🔥 مهم جداً لتحديث session
      return user;
    } catch (error) {
      await this.logoutCurrent();
      throw error;
    }
  }

  // ====================== LOGOUT (يستدعى من الـ UI) ======================
  // === تسجيل الخروج ===
  // ================= LOGOUT CURRENT =================
  logoutCurrent(): Promise<void> {
    const token = this.user$.value?.refreshToken;

    if (token) {
      this.http
        .post(`${this.BASE_URL}/api/Auth/logout`, {
          refreshToken: token,
        })
        .subscribe();
    }

    this.handleClientLogout();
    return Promise.resolve();
  }

  // ================= LOGOUT ALL =================
  logoutAll(): Promise<void> {
    this.http.post(`${this.BASE_URL}/api/Auth/logout-all`, {}).subscribe();

    this.handleClientLogout();
    return Promise.resolve();
  }

  // ================= LOGOUT OTHERS =================
  logoutOthers(): Promise<void> {
    const deviceId = this.deviceService.getDeviceId();

    this.http
      .post(`${this.BASE_URL}/api/Auth/logout-others?deviceId=${deviceId}`, {})
      .subscribe();

    // ❗ هنا مهم: منعملش logout للجهاز الحالي
    return Promise.resolve();
  }

  private handleClientLogout() {
    this.deviceService.clearDeviceData(); // يمسح deviceInfo بس
    this.clearSession();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  // ================= HELPERS =================

  private mapUser(data: any): StoredUser {
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAtUtc: data.expiresAtUtc,

      userId: data.userId,
      email: data.email,
      userName: data.userName,
      userType: data.userType,
    };
  }

  private saveSession(user: StoredUser) {
    this.user$.next(user);
    localStorage.setItem('user', JSON.stringify(user));
    this.startAutoRefresh();
  }

  private clearSession() {
    this.user$.next(null);
    localStorage.removeItem('user');
    clearTimeout(this.refreshTimeout);
  }

  private async restoreSession() {
    const data = localStorage.getItem('user');
    if (!data) return;

    const user = JSON.parse(data) as StoredUser;
    this.user$.next(user);

    if (this.isExpired(user.expiresAtUtc)) {
      try {
        await this.refresh();
      } catch {
        await this.logoutCurrent();
      }
    } else {
      this.startAutoRefresh();
    }
  }

  private isExpired(date: string): boolean {
    return new Date(date).getTime() < Date.now();
  }

  getAccessToken() {
    return this.user$.value?.accessToken;
  }

  // ================= AUTO REFRESH =================
  private startAutoRefresh() {
    clearTimeout(this.refreshTimeout);

    const user = this.user$.value;
    if (!user) return;

    const expires = new Date(user.expiresAtUtc).getTime();
    const timeout = expires - Date.now() - 2 * 60 * 1000; // قبلها بدقيقتين

    this.refreshTimeout = setTimeout(() => {
      this.refresh();
    }, timeout);
  }
}

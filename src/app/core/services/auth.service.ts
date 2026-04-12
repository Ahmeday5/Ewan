import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  firstValueFrom,
  filter,
  take,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  StoredUser,
  AuthResponse,
} from '../../features/auth/models/login.model';
import { environment } from '../../../environments/environment.development';
import { DeviceService } from './device.service';

@Injectable({ providedIn: 'root' })
export class AuthService implements OnDestroy {
  private readonly BASE_URL = environment.apiBaseUrl;
  private readonly REFRESH_BUFFER_MS = 2 * 60 * 1000;

  // ── Separate storage keys — sessions never overwrite each other ──
  private readonly ADMIN_KEY = 'ewan_admin';
  private readonly OWNER_KEY = 'ewan_owner';

  // ── Admin session ────────────────────────────────────────────────
  private adminUser$ = new BehaviorSubject<StoredUser | null>(null);
  private isAdminRefreshing = false;
  private adminRefreshSubject$ = new BehaviorSubject<StoredUser | null>(null);
  private adminRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  // ── Owner session (no refresh token — no refresh machinery needed)
  private ownerUser$ = new BehaviorSubject<StoredUser | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router,
    private deviceService: DeviceService,
  ) {
    this.restoreAdminSession();
    this.restoreOwnerSession();
    this.setupVisibilityHandler();
  }

  ngOnDestroy(): void {
    if (this.adminRefreshTimer) clearTimeout(this.adminRefreshTimer);
  }

  // ================================================================
  // LOGIN
  // ================================================================

  /** Admin portal login — email + password + rememberMe. */
  login(email: string, password: string, rememberMe = true): Promise<StoredUser> {
    return firstValueFrom(
      this.http.post<AuthResponse>(`${this.BASE_URL}/api/Auth/login`, {
        email,
        password,
        rememberMe,
        deviceInfo: this.deviceService.getDeviceInfo(),
        deviceId: this.deviceService.getDeviceId(),
      }),
    ).then((res) => {
      const user = this.mapUser(res.data);
      this.saveAdminSession(user);
      if (rememberMe) localStorage.setItem('savedEmail', email);
      return user;
    });
  }

  /** Owner portal login — phone + password only. Stored under a separate key. */
  ownerLogin(phoneNumber: string, password: string): Promise<StoredUser> {
    return firstValueFrom(
      this.http.post<AuthResponse>(
        `${this.BASE_URL}/api/Auth/property-owner-login`,
        { phoneNumber, password },
      ),
    ).then((res) => {
      const user = this.mapUser(res.data);
      this.saveOwnerSession(user);
      return user;
    });
  }

  // ================================================================
  // 401 HANDLING (called by the interceptor)
  // ================================================================

  /**
   * Admin 401 — queues concurrent requests behind a single /refresh call.
   * Multiple simultaneous 401s result in exactly ONE refresh HTTP request;
   * all others wait on adminRefreshSubject$ and retry with the new token.
   */
  handleAdminUnauthorized(): Observable<StoredUser> {
    if (!this.isAdminRefreshing) {
      this.startAdminRefresh();
    }
    return this.adminRefreshSubject$.pipe(
      filter((u): u is StoredUser => u !== null),
      take(1),
    );
  }

  /**
   * Owner 401 — owners have no refresh token.
   * Immediately clears the owner session and redirects to owner login.
   */
  handleOwnerUnauthorized(): void {
    this.handleOwnerLogout();
  }

  // ================================================================
  // LOGOUT — admin
  // ================================================================

  logoutCurrent(): void {
    const token = this.adminUser$.value?.refreshToken;
    if (token) {
      this.http
        .post(`${this.BASE_URL}/api/Auth/logout`, { refreshToken: token })
        .subscribe({ error: () => {} });
    }
    this.handleAdminLogout();
  }

  logoutAll(): void {
    this.http
      .post(`${this.BASE_URL}/api/Auth/logout-all`, {})
      .subscribe({ error: () => {} });
    this.handleAdminLogout();
  }

  logoutOthers(): void {
    const deviceId = this.deviceService.getDeviceId();
    this.http
      .post(`${this.BASE_URL}/api/Auth/logout-others?deviceId=${deviceId}`, {})
      .subscribe({ error: () => {} });
    // Do NOT call handleAdminLogout — current device stays logged in.
  }

  // ================================================================
  // LOGOUT — owner
  // ================================================================

  ownerLogout(): void {
    this.handleOwnerLogout();
  }

  // ================================================================
  // ACCESSORS
  // ================================================================

  get adminCurrentUser$(): Observable<StoredUser | null> {
    return this.adminUser$.asObservable();
  }

  get ownerCurrentUser$(): Observable<StoredUser | null> {
    return this.ownerUser$.asObservable();
  }

  /** Token used by the interceptor for admin-portal API calls. */
  getAdminToken(): string | undefined {
    return this.adminUser$.value?.accessToken;
  }

  /** Token used by the interceptor for owner-portal API calls. */
  getOwnerToken(): string | undefined {
    return this.ownerUser$.value?.accessToken;
  }

  get adminUserValue(): StoredUser | null {
    return this.adminUser$.value;
  }

  get ownerUserValue(): StoredUser | null {
    return this.ownerUser$.value;
  }

  // ================================================================
  // PRIVATE — session persistence
  // ================================================================

  private saveAdminSession(user: StoredUser): void {
    this.adminUser$.next(user);
    localStorage.setItem(this.ADMIN_KEY, JSON.stringify(user));
    this.scheduleAdminProactiveRefresh(user);
  }

  private saveOwnerSession(user: StoredUser): void {
    this.ownerUser$.next(user);
    localStorage.setItem(this.OWNER_KEY, JSON.stringify(user));
    // No proactive refresh — owner has no refresh token.
  }

  private clearAdminSession(): void {
    this.adminUser$.next(null);
    localStorage.removeItem(this.ADMIN_KEY);
    if (this.adminRefreshTimer) {
      clearTimeout(this.adminRefreshTimer);
      this.adminRefreshTimer = null;
    }
  }

  private clearOwnerSession(): void {
    this.ownerUser$.next(null);
    localStorage.removeItem(this.OWNER_KEY);
  }

  private handleAdminLogout(): void {
    this.deviceService.clearDeviceData();
    this.clearAdminSession();
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }

  private handleOwnerLogout(): void {
    this.clearOwnerSession();
    this.router.navigate(['/ownerProperties/login'], { replaceUrl: true });
  }

  private mapUser(data: AuthResponse['data']): StoredUser {
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

  // ================================================================
  // PRIVATE — admin token refresh
  // ================================================================

  private startAdminRefresh(): void {
    const current = this.adminUser$.value;

    if (!current?.refreshToken) {
      this.handleAdminLogout();
      return;
    }

    this.isAdminRefreshing = true;
    this.adminRefreshSubject$.next(null);

    this.http
      .post<AuthResponse>(`${this.BASE_URL}/api/Auth/refresh`, {
        refreshToken: current.refreshToken,
        deviceInfo: this.deviceService.getDeviceInfo(),
        deviceId: this.deviceService.getDeviceId(),
      })
      .subscribe({
        next: (res) => {
          const user = this.mapUser(res.data);
          this.saveAdminSession(user);        // also re-arms the proactive timer
          this.isAdminRefreshing = false;
          this.adminRefreshSubject$.next(user); // unblocks all queued interceptors
        },
        error: () => {
          this.isAdminRefreshing = false;
          this.handleAdminLogout();
        },
      });
  }

  // ================================================================
  // PRIVATE — session restoration on app start
  // ================================================================

  private restoreAdminSession(): void {
    const raw = localStorage.getItem(this.ADMIN_KEY);
    if (!raw) return;

    let user: StoredUser;
    try {
      user = JSON.parse(raw) as StoredUser;
    } catch {
      localStorage.removeItem(this.ADMIN_KEY);
      return;
    }

    this.adminUser$.next(user);

    if (this.isExpired(user.expiresAtUtc)) {
      this.startAdminRefresh();
    } else {
      this.scheduleAdminProactiveRefresh(user);
    }
  }

  private restoreOwnerSession(): void {
    const raw = localStorage.getItem(this.OWNER_KEY);
    if (!raw) return;

    let user: StoredUser;
    try {
      user = JSON.parse(raw) as StoredUser;
    } catch {
      localStorage.removeItem(this.OWNER_KEY);
      return;
    }

    if (this.isExpired(user.expiresAtUtc)) {
      // Token expired and no refresh token — silently clear the stale session.
      localStorage.removeItem(this.OWNER_KEY);
      return;
    }

    this.ownerUser$.next(user);
  }

  // ================================================================
  // PRIVATE — proactive refresh scheduling + visibility handling
  // ================================================================

  private scheduleAdminProactiveRefresh(user: StoredUser): void {
    if (this.adminRefreshTimer) clearTimeout(this.adminRefreshTimer);
    if (!user.refreshToken) return;

    const delay = Math.max(
      0,
      new Date(user.expiresAtUtc).getTime() - Date.now() - this.REFRESH_BUFFER_MS,
    );

    this.adminRefreshTimer = setTimeout(() => {
      if (!this.isAdminRefreshing) this.startAdminRefresh();
    }, delay);
  }

  /**
   * Re-arms the admin proactive-refresh timer whenever the tab becomes visible.
   * Browsers throttle/pause setTimeout in background tabs so we must re-check
   * on focus to avoid serving stale tokens after the device wakes from sleep.
   */
  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;

      const admin = this.adminUser$.value;
      if (admin) {
        if (this.isExpired(admin.expiresAtUtc) || this.isExpiringSoon(admin.expiresAtUtc)) {
          if (!this.isAdminRefreshing) this.startAdminRefresh();
        } else {
          this.scheduleAdminProactiveRefresh(admin);
        }
      }

      // Owner: token is short-lived, no proactive refresh.
      // If it expired while tab was hidden, the next API call will 401
      // → handleOwnerUnauthorized() → redirect to owner login.
    });
  }

  private isExpired(date: string): boolean {
    return new Date(date).getTime() <= Date.now();
  }

  private isExpiringSoon(date: string): boolean {
    return new Date(date).getTime() - Date.now() < this.REFRESH_BUFFER_MS;
  }
}

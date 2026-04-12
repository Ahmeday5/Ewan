import { inject, Injectable } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { postResponse } from '../../../core/model/apiResponse.model';
import {
  AdminUser,
  CreateAdminUserRequest,
  UpdateAdminUserRequest,
} from '../model/admin.model';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/users';

  private readonly TTL = 10 * 60 * 1000;
  private readonly CACHE_PREFIX = 'ewan_admins_';

  private buildKey(pageIndex: number, pageSize: number, search = ''): string {
    return `${this.CACHE_PREFIX}${pageIndex}|${pageSize}|${search}`;
  }

  private getEntry<T>(key: string): CacheEntry<T> | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() - entry.timestamp > this.TTL) {
        localStorage.removeItem(key);
        return null;
      }
      return entry;
    } catch {
      return null;
    }
  }

  private setEntry(key: string, data: any): void {
    try {
      localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch {}
  }

  invalidateCache(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }

  getAll(pageIndex = 1, pageSize = 10, search?: string) {
    const key = this.buildKey(pageIndex, pageSize, search);
    const cached = this.getEntry<any>(key);

    if (cached) return of(cached.data);

    return this.api
      .get<any>(this.endpoint, { pageIndex, pageSize, Search: search })
      .pipe(
        map((res) => ({
          users: res.data.data as AdminUser[],
          totalPages: res.data.totalPages,
          totalCount: res.data.count,
        })),
        tap((data) => this.setEntry(key, data)),
      );
  }

  getById(id: string): Observable<AdminUser> {
    return this.api
      .get<{ data: AdminUser }>(`${this.endpoint}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(body: CreateAdminUserRequest): Observable<postResponse> {
    this.invalidateCache();
    return this.api.post<postResponse>(this.endpoint, body);
  }

  update(body: UpdateAdminUserRequest): Observable<postResponse> {
    this.invalidateCache();
    return this.api.put<postResponse>(this.endpoint, body);
  }

  delete(id: string): Observable<postResponse> {
    this.invalidateCache();
    return this.api.delete<postResponse>(`${this.endpoint}/${id}`);
  }
}

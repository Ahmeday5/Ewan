import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import {
  properties,
  UpdateOwnerCredentialsRequest,
} from '../models/Properties.model';
import { map, Observable, of, tap } from 'rxjs';
import { postResponse } from '../../../core/model/apiResponse.model';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class PropertiesService {
  private readonly api = inject(ApiService);
  private readonly endpoint = '/api/dashboard/properties';

  private readonly TTL = 10 * 60 * 1000; // 10 minutes
  private readonly CACHE_PREFIX = 'ewan_props_';

  private buildKey(
    pageIndex: number,
    pageSize: number,
    search = '',
    type = '',
  ): string {
    return `${this.CACHE_PREFIX}${pageIndex}|${pageSize}|${search}|${type}`;
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
      localStorage.setItem(
        key,
        JSON.stringify({ data, timestamp: Date.now() }),
      );
    } catch {
      // localStorage full — تجاهل
    }
  }

  invalidateCache(): void {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(this.CACHE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  }

  getAll(pageIndex = 1, pageSize = 10, search?: string, propertyType?: string) {
    const key = this.buildKey(pageIndex, pageSize, search, propertyType);
    const cached = this.getEntry<any>(key);

    if (cached) {
      return of(cached.data);
    }

    return this.api
      .get<any>(this.endpoint, {
        pageIndex,
        pageSize,
        Search: search,
        PropertyType: propertyType,
      })
      .pipe(
        map((res) => ({
          properties: res.data.properties.data,
          totalPages: res.data.properties.totalPages,
          totalCount: res.data.properties.count,
          typeCounts: res.data.typeCounts,
        })),
        tap((data) => this.setEntry(key, data)),
      );
  }

  getById(id: number): Observable<properties> {
    return this.api
      .get<{ data: properties }>(`${this.endpoint}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(formData: FormData): Observable<postResponse> {
    this.invalidateCache();
    return this.api.post<postResponse>(this.endpoint, formData);
  }

  update(formData: FormData): Observable<postResponse> {
    this.invalidateCache();
    return this.api.put<postResponse>(`${this.endpoint}`, formData);
  }

  delete(id: number): Observable<postResponse> {
    this.invalidateCache();
    return this.api.delete<postResponse>(`${this.endpoint}/${id}`);
  }

  updateOwnerCredentials(
    id: number,
    body: UpdateOwnerCredentialsRequest,
  ): Observable<postResponse> {
    return this.api.patch<postResponse>(
      `${this.endpoint}/${id}/owner-credentials`,
      body,
    );
  }
}

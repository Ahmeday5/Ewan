import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  constructor() {}

  // ====================== GET ======================
  get<T>(endpoint: string, params?: any): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ''
        ) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  // ====================== POST (يدعم FormData + JSON) ======================
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  // ====================== PUT ======================
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  // ====================== DELETE ======================
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  // ====================== Error Handler موحد (بروفيشنال) ======================
  private handleError(err: HttpErrorResponse): Observable<never> {
    let errorMsg = 'حدث خطأ غير متوقع';

    if (err.status === 0)
      errorMsg = 'خطأ في الاتصال بالسيرفر. تحقق من الإنترنت';
    else if (err.status === 400)
      errorMsg = err.error?.message || 'البيانات غير صحيحة';
    else if (err.status === 401)
      errorMsg = 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى';
    else if (err.status === 500) errorMsg = 'خطأ داخلي في السيرفر';

    console.error('API Error:', err);
    return throwError(() => new Error(errorMsg));
  }
}

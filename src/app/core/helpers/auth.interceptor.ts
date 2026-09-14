import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError, switchMap, tap, finalize, shareReplay } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '@/environments/environment';
import { AuthService } from '@/app/features/auth/services/auth.service';

let isRefreshing = false;
let refreshToken$: Observable<any> | null = null;

export const authInterceptor: HttpInterceptorFn = (
    req: HttpRequest<any>,
    next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const token = localStorage.getItem('access_token');

    const isApiUrl = req.url.startsWith(environment.apiUrlConsult);
    const isExcluded = req.url.includes('login/update_session/') || req.url.includes('login/refresh/');

    let authReq = req;

    if (token && isApiUrl && !isExcluded) {
        authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && token && !req.url.includes('login/')) {
                // If a refresh is already in progress, reuse that observable
                if (!isRefreshing) {
                    isRefreshing = true;
                    refreshToken$ = authService.refreshToken().pipe(
                        tap((res: any) => {
                            localStorage.setItem('access_token', res.access);
                            if (res.refresh) {
                                localStorage.setItem('refresh_token', res.refresh);
                            }
                        }),
                        catchError((refreshErr) => {
                            isRefreshing = false;
                            refreshToken$ = null;
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            router.navigate(['/auth/login']);
                            return throwError(() => refreshErr);
                        }),
                        finalize(() => {
                            isRefreshing = false;
                            refreshToken$ = null;
                        }),
                        shareReplay(1)
                    );
                }

                // All requests wait for the same refreshToken$
                return refreshToken$!.pipe(
                    switchMap((res: any) => {
                        const retryReq = req.clone({
                            setHeaders: { Authorization: `Bearer ${res.access}` }
                        });
                        return next(retryReq);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};
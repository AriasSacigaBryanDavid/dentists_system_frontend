import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {

    private http = inject(HttpClient);
    private router = inject(Router);
    private currentUserSubject = new BehaviorSubject<any>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        this.restoreSession();
    }

    private restoreSession() {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decodedPayload = jwtDecode(token);
                this.currentUserSubject.next(decodedPayload);
            } catch (error) {
                this.logout();
            }
        }
    }

    public get currentUserValue(): any {
        return this.currentUserSubject.value;
    }

    public hasValidSession(): boolean {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;
        try {
            const decoded: any = jwtDecode(refreshToken);
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp > currentTime;
        } catch {
            return false;
        }
    }

    login(username: string, password: string): Observable<any> {
        const payload = { username, password };
        return this.http.post<any>(`${environment.apiUrlConsult}login/`, payload).pipe(
            tap(response => {
                if (response.access) {
                    this.saveTokens(response.access, response.refresh);
                }
            })
        );
    }

    refreshToken(): Observable<any> {
        const refresh = localStorage.getItem('refresh_token');
        return this.http.post<any>(`${environment.apiUrlConsult}login/refresh/`, { refresh });
    }

    private saveTokens(access: string, refresh: string) {
        localStorage.setItem('access_token', access);
        if (refresh) {
            localStorage.setItem('refresh_token', refresh);
        }
        // We decode the message and notify the entire app that someone has logged in
        this.currentUserSubject.next(jwtDecode(access));
    }

    logout(): void {
        // We clean the tokens
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Please note that the user is no longer available.
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }


}
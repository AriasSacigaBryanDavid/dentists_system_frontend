import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, map, catchError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '@/app/features/auth/services/auth.service';

export const authGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
): Observable<boolean | UrlTree> | boolean | UrlTree => {

const router = inject(Router);
    const authService = inject(AuthService);

    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    // If there is no token at all, go straight to the login page
    if (!token) {
        return router.createUrlTree(['/auth/login']);
    }

    try {
        const decodedPayload: any = jwtDecode(token);
        const currentTime = Math.floor(Date.now() / 1000);

        // We check whether the token has already expired mathematically
        if (currentTime >= decodedPayload.exp) {

            // If it has expired but we have a refresh_token, we try to keep the session alive
            if (refreshToken) {
                return authService.refreshToken().pipe(
                    map((res: any) => {
                        // We save the new token
                        localStorage.setItem('access_token', res.access);
                        if (res.refresh) localStorage.setItem('refresh_token', res.refresh);

                        // We decode the NEW token to read the updated permissions
                        const newDecoded: any = jwtDecode(res.access);
                        return checkRoutePermissions(route, newDecoded, router);
                    }),
                    catchError(() => {
                        // If the refresh also fails, we log out
                        authService.logout();
                        return of(router.createUrlTree(['/auth/login']));
                    })
                );
            } else {
                // It has expired and there's no way to refresh it
                authService.logout();
                return router.createUrlTree(['/auth/login']);
            }
        }

        // If the token is active, we simply check the permissions
        return checkRoutePermissions(route, decodedPayload, router);

    } catch (error) {
        // If the token is malformed
        authService.logout();
        return router.createUrlTree(['/auth/login']);
    }
};

const checkRoutePermissions = (route: ActivatedRouteSnapshot, payload: any, router: Router): boolean | UrlTree => {
    const routeRoles = route.data['roles'] as string[];

    if (routeRoles && routeRoles.length > 0) {
        const userPermissions = payload.permissions || [];

        // Check whether the user has at least one of the roles required by the path
        const isAuthorized = routeRoles.some((role: string) => userPermissions.includes(role));

        if (!isAuthorized) {
            return router.createUrlTree(['/not-authorized']);
        }
    }

    return true;
};
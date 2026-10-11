import { inject } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemFilter } from '@core/interfaces';

export abstract class CommonCrudService<T> {

    protected http = inject(HttpClient);

    protected abstract baseUrl: string;

    protected defaultHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    });

    setHeaders(headers: HttpHeaders): void {
        this.defaultHeaders = headers;
    }

    protected getHeadersForPayload(data: any): HttpHeaders {
        if (data instanceof FormData) {
            return new HttpHeaders({ 'Accept': 'application/json' });
        }
        return this.defaultHeaders;
    }

    getItems(fields: string[], routeExtra?: string): Observable<T[]> {
        const fullUrl = routeExtra ? `${this.baseUrl}/${routeExtra}` : `${this.baseUrl}`;
        const fieldsJsonString = JSON.stringify(fields);
        const params = new HttpParams().set('fields', fieldsJsonString);
        return this.http.get<T[]>(`${fullUrl}/`, {
            params
        });
    }

    getItem(uuid: string, fields: string[], routeExtra?: string): Observable<T> {
        const fullUrl = routeExtra ? `${this.baseUrl}/${routeExtra}` : `${this.baseUrl}`;
        const fieldsJsonString = JSON.stringify(fields);
        const params = new HttpParams().set('fields', fieldsJsonString);
        return this.http.get<T>(`${fullUrl}/${uuid}/`, {
            params
        });
    }

    createItem(data: any, routeExtra?: string): Observable<T> {
        const fullUrl = routeExtra ? `${this.baseUrl}/${routeExtra}` : `${this.baseUrl}`;
        return this.http.post<T>(`${fullUrl}/`, data, {
            headers: this.getHeadersForPayload(data)
        });
    }

    updateItem(uuid: string, data: any, routeExtra?: string): Observable<T> {
        return this.patchItem(uuid, data, routeExtra);
    }

    deleteItem(uuid: string, routeExtra?: string): Observable<T> {
        const fullUrl = routeExtra ? `${this.baseUrl}/${routeExtra}` : `${this.baseUrl}`;
        return this.http.delete<T>(`${fullUrl}/${uuid}/`, {
            headers: this.defaultHeaders
        });
    }

    restoreItem(uuid: string, routeExtra?: string): Observable<T> {
        return this.patchItem(uuid, { status: 1 }, routeExtra);
    }

    patchItem(uuid: string, data: any, routeExtra?: string, bypassGlobalError: boolean = true): Observable<T> {
        const fullUrl = routeExtra ? `${this.baseUrl}/${routeExtra}` : `${this.baseUrl}`;
        return this.http.patch<T>(`${fullUrl}/${uuid}/`, data, {
            headers: this.getHeadersForPayload(data),
        }); 
    }

    getItemsPaginated(page: number, pageSize: number, status: string, fields: string[], routeExtra?: string): Observable<T[]> {
        const fullUrl = routeExtra ? `${this.baseUrl}/${routeExtra}` : `${this.baseUrl}`;
        const fieldsJsonString = JSON.stringify(fields);
        let params = new HttpParams()
        .set('page', page.toString())
        .set('page_size', pageSize.toString())
        .set('status', status.toString())
        .set('fields', fieldsJsonString);
        return this.http.get<T[]>(`${fullUrl}/paginated/`, {
            params, 
        });
    }

    getFilteredPaginatedItems(
        page: number,
        pageSize: number,
        status: string,
        filters: ItemFilter,
        fields: string[],
        routeExtra?: string,
        bypassGlobalError: boolean = true
    ): Observable<T[]> {
        const fullUrl = routeExtra ? `${this.baseUrl}/${routeExtra}` : `${this.baseUrl}`;
        const fieldsJsonString = JSON.stringify(fields);

        let params = new HttpParams()
        .set('page', page.toString())
        .set('page_size', pageSize.toString())
        .set('status', status.toString())
        .set('fields', fieldsJsonString);

        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (value !== undefined && value !== null && value !== '') {
                if (Array.isArray(value)) {
                    params = params.set(key, value.join(','));
                } else {
                    params = params.set(key, value.toString());
                }
            }
        });

        return this.http.get<T[]>(`${fullUrl}/filter/paginated/`, {
            params
        });
    }

}
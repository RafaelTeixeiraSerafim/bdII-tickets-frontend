import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/** Identifiable entity (all API models expose a numeric `id`). */
export interface Entity {
  id: number;
}

/**
 * Generic REST client for the TicketsCrud API. Subclasses set `path` to the
 * collection segment (e.g. 'tickets'). The auth interceptor adds the token.
 */
export abstract class CrudService<T extends Entity> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly path: string;

  private get base(): string {
    return `${environment.apiBaseUrl}/${this.path}`;
  }

  list(): Observable<T[]> {
    return this.http.get<T[]>(this.base);
  }

  get(id: number): Observable<T> {
    return this.http.get<T>(`${this.base}/${id}`);
  }

  create(body: Partial<T>): Observable<T> {
    return this.http.post<T>(this.base, body);
  }

  update(id: number, body: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.base}/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

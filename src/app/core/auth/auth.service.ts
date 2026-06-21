import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse, Usuario } from '../models';

const TOKEN_KEY = 'tickets.token';
const USER_KEY = 'tickets.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private readonly _user = signal<Usuario | null>(this.readStoredUser());
  readonly currentUser = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  readonly role = computed(() => this._user()?.role ?? null);
  readonly userId = computed(() => this._user()?.id ?? null);
  readonly isAdmin = computed(() => this.role() === 'admin');
  readonly isTecnico = computed(() => this.role() === 'tecnico');
  readonly isCliente = computed(() => this.role() === 'cliente');
  /** Technician or admin — i.e. staff, as opposed to a client. */
  readonly isStaff = computed(() => this.isAdmin() || this.isTecnico());

  login(email: string, senha: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/login`, { email, senha })
      .pipe(tap((res) => this.persistSession(res)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private persistSession(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    // Strip the hash before storing the user locally.
    const { senha_hash, ...safeUser } = res.usuario;
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
    this._user.set(safeUser as Usuario);
  }

  private readStoredUser(): Usuario | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw || !localStorage.getItem(TOKEN_KEY)) {
      return null;
    }
    try {
      return JSON.parse(raw) as Usuario;
    } catch {
      return null;
    }
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

import { environment } from '../../environments/environment';

interface Token {
  access: string;
  refresh: string;
}

interface DecodedToken {
  username: string;
  exp: number;
  user_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'tesoreria_token';
  private refreshTokenKey = 'tesoreria_refresh_token';
  private loggedIn = new BehaviorSubject<boolean>(false);
  private currentUser = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.checkToken();
  }

  login(username: string, password: string): Observable<Token> {
    return this.http.post<Token>(`${this.apiUrl}/auth/login/`, { username, password }).pipe(
      tap(response => {
        this.setTokens(response.access, response.refresh);
        this.loggedIn.next(true);
        this.decodeAndSetUser(response.access);
      }),
      catchError(error => {
        return throwError(() => new Error('Credenciales inválidas'));
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/registro/`, userData).pipe(
      catchError(error => {
        return throwError(() => new Error('Error en el registro'));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.loggedIn.next(false);
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }

  refreshToken(): Observable<Token> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No hay token de refresco'));
    }

    return this.http.post<Token>(`${this.apiUrl}/api/token/refresh/`, { refresh: refreshToken }).pipe(
      tap(response => {
        this.setTokens(response.access, response.refresh);
        this.decodeAndSetUser(response.access);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => new Error('Error al refrescar el token'));
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const decoded = jwtDecode<DecodedToken>(token);
    const isExpired = decoded.exp < Date.now() / 1000;
    return !isExpired;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.username;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.user_id;
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  get currentUser$(): Observable<any> {
    return this.currentUser.asObservable();
  }

  private checkToken(): void {
    const token = this.getToken();
    if (token) {
      const decoded = jwtDecode<DecodedToken>(token);
      const isExpired = decoded.exp < Date.now() / 1000;
      
      if (!isExpired) {
        this.loggedIn.next(true);
        this.decodeAndSetUser(token);
      } else {
        this.refreshToken().subscribe({
          next: () => console.log('Token refrescado'),
          error: () => this.logout()
        });
      }
    }
  }

  private setTokens(access: string, refresh: string): void {
    localStorage.setItem(this.tokenKey, access);
    localStorage.setItem(this.refreshTokenKey, refresh);
  }

  private decodeAndSetUser(token: string): void {
    const decoded = jwtDecode<DecodedToken>(token);
    this.currentUser.next({
      username: decoded.username,
      userId: decoded.user_id
    });
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Category {
  id?: number;
  nombre: string;
  tipo: 'INGRESO' | 'EGRESO';
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/tesoreria/categorias/`;
  private categoriaUrlBase = `${environment.apiUrl}/tesoreria/categorias`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getIncomeCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/?tipo=INGRESO`);
  }

  getExpenseCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/?tipo=EGRESO`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.categoriaUrlBase}/${id}/`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.categoriaUrlBase}/${id}/`);
  }
}
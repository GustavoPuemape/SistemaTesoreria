import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface Movement {
  id?: number;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  fecha: string;
  descripcion?: string;
  categoria: number;
  categoria_nombre?: string;
  creado_en?: string;
}

export interface ReportData {
  fecha_inicio: string;
  fecha_fin: string;
}

export interface ReportResult {
  saldo_inicial: number;
  saldo_final: number;
  ingresos: number;
  egresos: number;
  movimientos: Movement[];
}

export interface DashboardData {
  saldo_total: number;
  ingresos_mes: number;
  egresos_mes: number;
  ultimos_movimientos: Movement[];
}

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private apiUrl = `${environment.apiUrl}/tesoreria/movimientos/`;
  private movimientoUrlBase = `${environment.apiUrl}/tesoreria/movimientos`;

  constructor(private http: HttpClient) {}

  getMovements(): Observable<Movement[]> {
    return this.http.get<Movement[]>(this.apiUrl);
  }

  createMovement(movement: Movement): Observable<Movement> {
    return this.http.post<Movement>(this.apiUrl, movement);
  }

  updateMovement(id: number, movement: Movement): Observable<Movement> {
    return this.http.put<Movement>(`${this.movimientoUrlBase}/${id}/`, movement);
  }

  deleteMovement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.movimientoUrlBase}/${id}/`);
  }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${environment.apiUrl}/tesoreria/dashboard/`);
  }

  generateReport(data: ReportData): Observable<ReportResult> {
    return this.http.post<ReportResult>(`${environment.apiUrl}/tesoreria/reporte/`, data);
  }
}
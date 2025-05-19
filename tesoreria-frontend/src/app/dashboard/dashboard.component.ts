import { Component, OnInit } from '@angular/core';
import { MovementService } from '../movements/movement.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  dashboardData: any = null;
  loading = true;
  
  displayedColumns: string[] = ['fecha', 'descripcion', 'categoria', 'monto'];
  
  

  constructor(
    private movementService: MovementService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.movementService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('Error al cargar datos del dashboard', 'Cerrar', {
          duration: 3000
        });
        console.error('Error loading dashboard data:', err);
      }
    });
  }

  getBalanceClass(): string {
    if (!this.dashboardData) return '';
    return this.dashboardData.saldo_total >= 0 ? 'positive' : 'negative';
  }

  
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovementService } from '../movements/movement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  reportForm: FormGroup;
  reportData: any = null;
  loading = false;
  displayedColumns: string[] = ['fecha', 'descripcion', 'categoria', 'monto'];
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private movementService: MovementService,
    private snackBar: MatSnackBar
  ) {
    const firstDay = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    
    this.reportForm = this.fb.group({
      fecha_inicio: [firstDay, Validators.required],
      fecha_fin: [this.today, Validators.required]
    });
  }

  ngOnInit(): void {}

  generateReport(): void {
    if (this.reportForm.valid) {
      this.loading = true;
      const formData = this.reportForm.value;
      
      // Formatear fechas como strings YYYY-MM-DD
      const reportData = {
        fecha_inicio: moment(formData.fecha_inicio).format('YYYY-MM-DD'),
        fecha_fin: moment(formData.fecha_fin).format('YYYY-MM-DD')
      };

      this.movementService.generateReport(reportData).subscribe({
        next: (data) => {
          this.reportData = data;
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open('Error al generar el reporte', 'Cerrar', {
            duration: 3000
          });
          console.error('Error generating report:', err);
        }
      });
    }
  }

  getTotalIngresos(): number {
    return this.reportData?.ingresos || 0;
  }

  getTotalEgresos(): number {
    return this.reportData?.egresos || 0;
  }

  getDiferencia(): number {
    return this.getTotalIngresos() - this.getTotalEgresos();
  }
}
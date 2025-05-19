import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovementFormComponent } from '../movement-form/movement-form.component';
import { MovementService, Movement } from '../movement.service';



@Component({
  selector: 'app-movement-list',
  standalone: false,
  templateUrl: './movement-list.component.html',
  styleUrls: ['./movement-list.component.scss']
})
export class MovementListComponent implements OnInit {
  movements: Movement[] = [];
  displayedColumns: string[] = ['fecha', 'descripcion', 'categoria', 'monto', 'actions'];
  loading = true;

  constructor(
    private movementService: MovementService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.loading = true;
    this.movementService.getMovements().subscribe({
      next: (movements) => {
        this.movements = movements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar movimientos', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  openForm(movement?: Movement): void {
    const dialogRef = this.dialog.open(MovementFormComponent, {
      width: '500px',
      data: movement ? { ...movement } : null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMovements();
      }
    });
  }

  deleteMovement(id: number): void {
    if (confirm('¿Estás seguro de eliminar este movimiento?')) {
      this.movementService.deleteMovement(id).subscribe({
        next: () => {
          this.snackBar.open('Movimiento eliminado', 'Cerrar', {
            duration: 2000
          });
          this.loadMovements();
        },
        error: () => {
          this.snackBar.open('Error al eliminar movimiento', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }
}
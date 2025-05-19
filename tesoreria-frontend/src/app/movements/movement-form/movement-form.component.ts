import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryService, Category } from '../../categories/category.service';
import { MovementService } from '../movement.service';
import moment from 'moment';



export interface Movement {
  id?: number;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  fecha: string;
  descripcion?: string;
  categoria: number;
}

@Component({
  selector: 'app-movement-form',
  standalone: false,
  templateUrl: './movement-form.component.html',
  styleUrls: ['./movement-form.component.scss']
})
export class MovementFormComponent implements OnInit {
  movementForm: FormGroup;
  isEdit = false;
  loading = false;
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  maxDate = new Date();

  constructor(
    private fb: FormBuilder,
    private movementService: MovementService,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<MovementFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Movement
  ) {
    this.isEdit = !!data;
    this.movementForm = this.fb.group({
      tipo: [data?.tipo || 'INGRESO', Validators.required],
      monto: [data?.monto || null, [Validators.required, Validators.min(0.01)]],
      fecha: [data?.fecha ? new Date(data.fecha) : new Date(), Validators.required],
      descripcion: [data?.descripcion || ''],
      categoria: [data?.categoria || null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.onTypeChange();
    
    this.movementForm.get('tipo')?.valueChanges.subscribe(() => {
      this.onTypeChange();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.onTypeChange();
      },
      error: () => {
        this.snackBar.open('Error al cargar categorías', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  onTypeChange(): void {
    const tipo = this.movementForm.get('tipo')?.value;
    this.filteredCategories = this.categories.filter(cat => cat.tipo === tipo);
    
    // Reset categoria if it doesn't match the new type
    const currentCatId = this.movementForm.get('categoria')?.value;
    if (currentCatId) {
      const currentCat = this.categories.find(c => c.id === currentCatId);
      if (!currentCat || currentCat.tipo !== tipo) {
        this.movementForm.get('categoria')?.setValue(null);
      }
    }
  }

  onSubmit(): void {
    if (this.movementForm.valid) {
      this.loading = true;
      const formData = this.movementForm.value;
      
      // Format date as YYYY-MM-DD
      const movementData: Movement = {
        ...formData,
        fecha: moment(formData.fecha).format('YYYY-MM-DD')
      };

      const operation = this.isEdit
        ? this.movementService.updateMovement(this.data.id!, movementData)
        : this.movementService.createMovement(movementData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Movimiento ${this.isEdit ? 'actualizado' : 'creado'} correctamente`,
            'Cerrar',
            { 
              duration: 3000,
              panelClass: ['success-snackbar']
            }
          );
          this.dialogRef.close(true);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open(
            `Error al ${this.isEdit ? 'actualizar' : 'crear'} el movimiento`,
            'Cerrar',
            { 
              duration: 3000,
              panelClass: ['error-snackbar']
            }
          );
          this.loading = false;
        }
      });
    }
  }

  get tipo() {
    return this.movementForm.get('tipo');
  }

  get monto() {
    return this.movementForm.get('monto');
  }

  get fecha() {
    return this.movementForm.get('fecha');
  }

  get categoria() {
    return this.movementForm.get('categoria');
  }
}
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CategoryService, Category } from '../category.service';

@Component({
  selector: 'app-category-form',
  standalone: false,
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.scss']
})
export class CategoryFormComponent {
  categoryForm: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<CategoryFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: Category
  ) {
    this.isEdit = !!data;
    this.categoryForm = this.fb.group({
      nombre: [data?.nombre || '', Validators.required],
      tipo: [data?.tipo || 'INGRESO', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.categoryForm.valid) {
      this.loading = true;
      const categoryData = this.categoryForm.value;

      const operation = this.isEdit
        ? this.categoryService.updateCategory(this.data.id!, categoryData)
        : this.categoryService.createCategory(categoryData);

      operation.subscribe({
        next: () => {
          this.snackBar.open(
            `Categoría ${this.isEdit ? 'actualizada' : 'creada'} correctamente`,
            'Cerrar',
            { duration: 3000 }
          );
          this.dialogRef.close(true);
          this.loading = false;
        },
        error: () => {
          this.snackBar.open(
            `Error al ${this.isEdit ? 'actualizar' : 'crear'} la categoría`,
            'Cerrar',
            { duration: 3000 }
          );
          this.loading = false;
        }
      });
    }
  }
}
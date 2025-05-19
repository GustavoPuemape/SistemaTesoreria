import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoryFormComponent } from '../category-form/category-form.component';
import { CategoryService, Category } from '../category.service';

@Component({
  selector: 'app-category-list',
  standalone: false,
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  displayedColumns: string[] = ['nombre', 'tipo', 'actions'];
  loading = true;
  filterValue = 'TODAS';

  constructor(
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.applyFilter(this.filterValue);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar categorías', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  applyFilter(filter: string): void {
    this.filterValue = filter;
    if (filter === 'TODAS') {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(cat => cat.tipo === filter);
    }
  }

  openForm(category?: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '450px',
      data: category ? { ...category } : null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCategories();
      }
    });
  }

  deleteCategory(id: number): void {
    const confirmSnackbar = this.snackBar.open('¿Está seguro de eliminar esta categoría?', 'Eliminar', {
      duration: 5000,
      panelClass: ['confirm-snackbar']
    });

    confirmSnackbar.onAction().subscribe(() => {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.snackBar.open('Categoría eliminada', 'Cerrar', {
            duration: 2000,
            panelClass: ['success-snackbar']
          });
          this.loadCategories();
        },
        error: () => {
          this.snackBar.open('Error al eliminar categoría', 'Cerrar', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    });
  }
}
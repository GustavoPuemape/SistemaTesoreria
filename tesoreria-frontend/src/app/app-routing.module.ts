import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CategoryListComponent } from './categories/category-list/category-list.component';
import { MovementListComponent } from './movements/movement-list/movement-list.component';
import { ReportComponent } from './report/report.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'movimientos', component: MovementListComponent, canActivate: [AuthGuard] },
  { path: 'categorias', component: CategoryListComponent, canActivate: [AuthGuard] },
  { path: 'reporte', component: ReportComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },  
  { path: '**', redirectTo: '/login' }                    
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

from django.urls import path
from .views import (
    CategoriaListCreateView, CategoriaRetrieveUpdateDestroyView,
    MovimientoListCreateView, MovimientoRetrieveUpdateDestroyView,
    DashboardView, ReporteView
)

urlpatterns = [
    path('categorias/', CategoriaListCreateView.as_view(), name='categoria-list-create'),
    path('categorias/<int:pk>/', CategoriaRetrieveUpdateDestroyView.as_view(), name='categoria-detail'),
    path('movimientos/', MovimientoListCreateView.as_view(), name='movimiento-list-create'),
    path('movimientos/<int:pk>/', MovimientoRetrieveUpdateDestroyView.as_view(), name='movimiento-detail'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('reporte/', ReporteView.as_view(), name='reporte'),
]
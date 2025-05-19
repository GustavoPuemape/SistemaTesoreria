from django.urls import path
from .views import RegistroUsuarioView, CustomTokenObtainPairView

urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
]
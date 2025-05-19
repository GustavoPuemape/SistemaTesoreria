from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound
from django.db.models import Sum
from django.utils import timezone
from django.db.models import ProtectedError
from .models import Categoria, Movimiento
from .serializers import CategoriaSerializer, MovimientoSerializer, ReporteSerializer

# CATEGORÍA
class CategoriaListCreateView(generics.ListCreateAPIView):
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Categoria.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class CategoriaRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Categoria.objects.filter(usuario=self.request.user)

# MOVIMIENTO
class MovimientoListCreateView(generics.ListCreateAPIView):
    serializer_class = MovimientoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Movimiento.objects.filter(usuario=self.request.user).select_related('categoria')

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class MovimientoRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MovimientoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Movimiento.objects.filter(usuario=self.request.user)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except NotFound:
            return Response({'error': 'Movimiento no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        except ProtectedError:
            return Response({'error': 'No se puede eliminar este movimiento porque está relacionado con otros datos.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DASHBOARD
class DashboardView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user
        hoy = timezone.now().date()
        inicio_mes = hoy.replace(day=1)

        ingresos = Movimiento.objects.filter(usuario=usuario, tipo='INGRESO').aggregate(total=Sum('monto'))['total'] or 0
        egresos = Movimiento.objects.filter(usuario=usuario, tipo='EGRESO').aggregate(total=Sum('monto'))['total'] or 0
        saldo_total = ingresos - egresos

        ingresos_mes = Movimiento.objects.filter(usuario=usuario, tipo='INGRESO', fecha__gte=inicio_mes, fecha__lte=hoy).aggregate(total=Sum('monto'))['total'] or 0
        egresos_mes = Movimiento.objects.filter(usuario=usuario, tipo='EGRESO', fecha__gte=inicio_mes, fecha__lte=hoy).aggregate(total=Sum('monto'))['total'] or 0

        ultimos_movimientos = Movimiento.objects.filter(usuario=usuario).order_by('-fecha', '-creado_en')[:5]
        serializer = MovimientoSerializer(ultimos_movimientos, many=True)

        return Response({
            'saldo_total': saldo_total,
            'ingresos_mes': ingresos_mes,
            'egresos_mes': egresos_mes,
            'ultimos_movimientos': serializer.data
        })

# REPORTE
class ReporteView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ReporteSerializer(data=request.data)
        if serializer.is_valid():
            usuario = request.user
            fecha_inicio = serializer.validated_data['fecha_inicio']
            fecha_fin = serializer.validated_data['fecha_fin']

            ingresos_inicial = Movimiento.objects.filter(usuario=usuario, tipo='INGRESO', fecha__lt=fecha_inicio).aggregate(total=Sum('monto'))['total'] or 0
            egresos_inicial = Movimiento.objects.filter(usuario=usuario, tipo='EGRESO', fecha__lt=fecha_inicio).aggregate(total=Sum('monto'))['total'] or 0
            saldo_inicial = ingresos_inicial - egresos_inicial

            movimientos = Movimiento.objects.filter(usuario=usuario, fecha__gte=fecha_inicio, fecha__lte=fecha_fin).order_by('fecha')
            ingresos_periodo = movimientos.filter(tipo='INGRESO').aggregate(total=Sum('monto'))['total'] or 0
            egresos_periodo = movimientos.filter(tipo='EGRESO').aggregate(total=Sum('monto'))['total'] or 0
            saldo_final = saldo_inicial + ingresos_periodo - egresos_periodo

            movimientos_serializer = MovimientoSerializer(movimientos, many=True)

            return Response({
                'saldo_inicial': saldo_inicial,
                'saldo_final': saldo_final,
                'ingresos': ingresos_periodo,
                'egresos': egresos_periodo,
                'movimientos': movimientos_serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

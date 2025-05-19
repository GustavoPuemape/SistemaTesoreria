from rest_framework import serializers
from .models import Categoria, Movimiento
from usuarios.models import Usuario

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'tipo']
        read_only_fields = ['id']

class MovimientoSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.CharField(source='categoria.nombre', read_only=True)
    
    class Meta:
        model = Movimiento
        fields = [
            'id', 'tipo', 'monto', 'fecha', 'descripcion', 
            'categoria', 'categoria_nombre', 'creado_en'
        ]
        read_only_fields = ['id', 'creado_en', 'usuario']
    
    def create(self, validated_data):
        usuario = self.context['request'].user
        validated_data['usuario'] = usuario
        return super().create(validated_data)

class ReporteSerializer(serializers.Serializer):
    fecha_inicio = serializers.DateField()
    fecha_fin = serializers.DateField()
    saldo_inicial = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    saldo_final = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    ingresos = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    egresos = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    movimientos = MovimientoSerializer(many=True, read_only=True)
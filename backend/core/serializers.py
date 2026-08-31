from rest_framework import serializers

from .models import (
    Medicamentos,
    Pacientes,
    Roles,
    Usuarios,
    HistoriaClinicas,
    Enfermedades,
    Diagnosticos,
    Tratamientos,
    TratamientoMedicamento,
    Inventario,
    EntregaMedica,
    DetalleEntregaMedicamento,
    MovimientoMedicamento,
    AplicacionMedicamento,
    TipoInsumo,
    Insumos,
    DetalleEntregaInsumos,
    EntregaInsumo,
    MovimientoInsumo,
    Bitacora,
    Actividades,
    SignosVitales,
    TipoEvento,
    TipoEmergencia,
    EventosAdversos,
    ImagenesEventoAdverso,
    AsignacionPacienteCuidador,
    Turnos,
    AsignacionTurnoUsuario,
    Permisos,
    PermisosRol,
)


class PacientesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pacientes
        fields = '__all__'


class MedicamentosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamentos
        fields = '__all__'


class RolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roles
        fields = '__all__'


class UsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = '__all__'


class HistoriaClinicasSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriaClinicas
        fields = '__all__'


class EnfermedadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enfermedades
        fields = '__all__'


class DiagnosticosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosticos
        fields = '__all__'


class TratamientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tratamientos
        fields = '__all__'


class TratamientoMedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TratamientoMedicamento
        fields = '__all__'


class InventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inventario
        fields = '__all__'


class EntregaMedicaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntregaMedica
        fields = '__all__'


class DetalleEntregaMedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleEntregaMedicamento
        fields = '__all__'


class MovimientoMedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoMedicamento
        fields = '__all__'


class AplicacionMedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AplicacionMedicamento
        fields = '__all__'


class TipoInsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoInsumo
        fields = '__all__'


class InsumosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insumos
        fields = '__all__'


class DetalleEntregaInsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleEntregaInsumos
        fields = '__all__'


class EntregaInsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EntregaInsumo
        fields = '__all__'


class MovimientoInsumoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoInsumo
        fields = '__all__'


class BitacoraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bitacora
        fields = '__all__'


class ActividadesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actividades
        fields = '__all__'


class SignosVitalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SignosVitales
        fields = '__all__'


class TipoEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEvento
        fields = '__all__'


class TipoEmergenciaSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoEmergencia
        fields = '__all__'


class EventosAdversosSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventosAdversos
        fields = '__all__'


class ImagenesEventoAdversoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagenesEventoAdverso
        fields = '__all__'


class AsignacionPacienteCuidadorSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignacionPacienteCuidador
        fields = '__all__'


class TurnosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Turnos
        fields = '__all__'


class AsignacionTurnoUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = AsignacionTurnoUsuario
        fields = '__all__'

class PermisosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permisos
        fields = '__all__'

class PermisosRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = PermisosRol
        fields = '__all__'

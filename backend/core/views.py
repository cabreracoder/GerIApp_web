from rest_framework import viewsets
from .models import HistoriaClinicas, Pacientes, Medicamentos,Roles, Usuarios, Enfermedades, Diagnosticos, Tratamiento, TratamientoMedicamento, Inventario
from .models import EntregaMedica, DetalleEntregaMedicamento, MovimientoMedicamento, AplicacionMedicamento, TipoInsumo, Insumos, DetalleEntregaInsumos
from .models import EntregaInsumo, MovimientoInsumo, Bitacora, Actividades, SignosVitales, TipoEvento, TipoEmergencia, EventosAdversos, ImagenesEventoAdverso   
from .models import AsignacionPacienteCuidador, Turnos, AsignacionTurnoUsuario  

from .serializers import DiagnosticosSerializer, EnfermedadesSerializer, MedicamentosSerializer, PacientesSerializer, RolesSerializer, TratamientoSerializer
from .serializers import  TratamientoSerializer, UsuariosSerializer,HistoriaClinicasSerializer, TratamientoMedicamentoSerializer, InventarioSerializer 
from .serializers import EntregaMedicaSerializer, DetalleEntregaMedicamentoSerializer, MovimientoMedicamentoSerializer
from .serializers import AplicacionMedicamentoSerializer, TipoInsumoSerializer, InsumosSerializer, DetalleEntregaInsumoSerializer
from .serializers import EntregaInsumoSerializer, MovimientoInsumoSerializer, BitacoraSerializer, ActividadesSerializer, SignosVitalesSerializer, TipoEventoSerializer  
from .serializers import TipoEmergenciaSerializer, EventosAdversosSerializer, ImagenesEventoAdversoSerializer
from .serializers import AsignacionPacienteCuidadorSerializer, TurnosSerializer, AsignacionTurnoUsuarioSerializer

class PacientesViewSet(viewsets.ModelViewSet):
    queryset = Pacientes.objects.all()
    serializer_class = PacientesSerializer

class MedicamentosViewSet(viewsets.ModelViewSet):
    queryset = Medicamentos.objects.all()
    serializer_class = MedicamentosSerializer

class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer

class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer

class HistoriaClinicasViewSet(viewsets.ModelViewSet):
    queryset = HistoriaClinicas.objects.all()
    serializer_class = HistoriaClinicasSerializer

class EnfermedadesViewSet(viewsets.ModelViewSet):
    queryset = Enfermedades.objects.all()
    serializer_class = EnfermedadesSerializer

class DiagnosticosViewSet(viewsets.ModelViewSet):
    queryset = Diagnosticos.objects.all()
    serializer_class = DiagnosticosSerializer

class TratamientoViewSet(viewsets.ModelViewSet):
    queryset = Tratamiento.objects.all()
    serializer_class = TratamientoSerializer

class TratamientoMedicamentoViewSet(viewsets.ModelViewSet):
    queryset = TratamientoMedicamento.objects.all()
    serializer_class = TratamientoMedicamentoSerializer

class InventarioViewSet(viewsets.ModelViewSet):
    queryset = Inventario.objects.all()
    serializer_class = InventarioSerializer

class EntregaMedicaViewSet(viewsets.ModelViewSet):
    queryset = EntregaMedica.objects.all()
    serializer_class = EntregaMedicaSerializer

class DetalleEntregaMedicamentoViewSet(viewsets.ModelViewSet):
    queryset = DetalleEntregaMedicamento.objects.all()
    serializer_class = DetalleEntregaMedicamentoSerializer

class MovimientoMedicamentoViewSet(viewsets.ModelViewSet):
    queryset = MovimientoMedicamento.objects.all()
    serializer_class = MovimientoMedicamentoSerializer

class AplicacionMedicamentoViewSet(viewsets.ModelViewSet):
    queryset = AplicacionMedicamento.objects.all()
    serializer_class = AplicacionMedicamentoSerializer

class TipoInsumoViewSet(viewsets.ModelViewSet):
    queryset = TipoInsumo.objects.all()
    serializer_class = TipoInsumoSerializer

class InsumosViewSet(viewsets.ModelViewSet):
    queryset = Insumos.objects.all()
    serializer_class = InsumosSerializer

class DetalleEntregaInsumoViewSet(viewsets.ModelViewSet):
    queryset = DetalleEntregaInsumos.objects.all()
    serializer_class = DetalleEntregaInsumoSerializer

class EntregaInsumoViewSet(viewsets.ModelViewSet):
    queryset = EntregaInsumo.objects.all()
    serializer_class = EntregaInsumoSerializer

class MovimientoInsumoViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInsumo.objects.all()
    serializer_class = MovimientoInsumoSerializer

class BitacoraViewSet(viewsets.ModelViewSet):
    queryset = Bitacora.objects.all()
    serializer_class = BitacoraSerializer

class ActividadesViewSet(viewsets.ModelViewSet):
    queryset = Actividades.objects.all()
    serializer_class = ActividadesSerializer

class SignosVitalesViewSet(viewsets.ModelViewSet):
    queryset = SignosVitales.objects.all()
    serializer_class = SignosVitalesSerializer

class TipoEventoViewSet(viewsets.ModelViewSet):
    queryset = TipoEvento.objects.all()
    serializer_class = TipoEventoSerializer

class TipoEmergenciaViewSet(viewsets.ModelViewSet):
    queryset = TipoEmergencia.objects.all()
    serializer_class = TipoEmergenciaSerializer

class EventosAdversosViewSet(viewsets.ModelViewSet):
    queryset = EventosAdversos.objects.all()
    serializer_class = EventosAdversosSerializer

class ImagenesEventoAdversoViewSet(viewsets.ModelViewSet):
    queryset = ImagenesEventoAdverso.objects.all()
    serializer_class = ImagenesEventoAdversoSerializer

class AsignacionPacienteCuidadorViewSet(viewsets.ModelViewSet):
    queryset = AsignacionPacienteCuidador.objects.all()
    serializer_class = AsignacionPacienteCuidadorSerializer

class TurnosViewSet(viewsets.ModelViewSet):
    queryset =Turnos.objects.all()
    serializer_class = TurnosSerializer

class AsignacionTurnoUsuarioViewSet(viewsets.ModelViewSet):
    queryset = AsignacionTurnoUsuario.objects.all()
    serializer_class = AsignacionTurnoUsuarioSerializer


    
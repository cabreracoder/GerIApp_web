from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import DiagnosticosViewSet, PacientesViewSet, MedicamentosViewSet,RolesViewSet, TratamientoViewSet
from .views import UsuariosViewSet, HistoriaClinicasViewSet, EnfermedadesViewSet, TratamientoMedicamentoViewSet, InventarioViewSet, EntregaMedicaViewSet
from .views import DetalleEntregaMedicamentoViewSet, MovimientoMedicamentoViewSet,AplicacionMedicamentoViewSet, TipoInsumoViewSet
from .views import InsumosViewSet, DetalleEntregaInsumoViewSet, EntregaInsumoViewSet, MovimientoInsumoViewSet, BitacoraViewSet
from .views import ActividadesViewSet, SignosVitalesViewSet, TipoEventoViewSet, TipoEmergenciaViewSet, EventosAdversosViewSet, ImagenesEventoAdversoViewSet 
from .views import AsignacionPacienteCuidadorViewSet,TurnosViewSet, AsignacionTurnoUsuarioViewSet

router = DefaultRouter()

router.register(r'pacientes', PacientesViewSet)
router.register(r'medicamentos', MedicamentosViewSet)
router.register(r'roles', RolesViewSet)
router.register(r'usuarios', UsuariosViewSet)
router.register(r'historia_clinicas', HistoriaClinicasViewSet)
router.register(r'enfermedades' , EnfermedadesViewSet)
router.register(r'diagnosticos', DiagnosticosViewSet)
router.register(r'tratamientos', TratamientoViewSet) 
router.register(r'tratamiento_medicamento', TratamientoMedicamentoViewSet)
router.register(r'inventario', InventarioViewSet)
router.register(r'entrega_medica', EntregaMedicaViewSet)
router.register(r'detalle_entrega_medicamento', DetalleEntregaMedicamentoViewSet)
router.register(r'movimiento_medicamento', MovimientoMedicamentoViewSet)
router.register(r'aplicacion_medicamento', AplicacionMedicamentoViewSet)
router.register(r'tipo_insumo', TipoInsumoViewSet)
router.register(r'insumos', InsumosViewSet)
router.register(r'detalle_entrega_insumo', DetalleEntregaInsumoViewSet)
router.register(r'entrega_insumo', EntregaInsumoViewSet)
router.register(r'movimiento_insumo', MovimientoInsumoViewSet)
router.register(r'bitacora', BitacoraViewSet)  
router.register(r'actividades', ActividadesViewSet)
router.register(r'signos_vitales', SignosVitalesViewSet)
router.register(r'tipo_evento', TipoEventoViewSet) 
router.register(r'tipo_emergencia', TipoEmergenciaViewSet)
router.register(r'eventos_adversos', EventosAdversosViewSet)
router.register(r'imagenes_evento_adverso', ImagenesEventoAdversoViewSet)
router.register(r'asignacion_paciente_cuidador',AsignacionPacienteCuidadorViewSet)
router.register(r'turnos',TurnosViewSet)
router.register(r'asignacion_turno_usuario',AsignacionTurnoUsuarioViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
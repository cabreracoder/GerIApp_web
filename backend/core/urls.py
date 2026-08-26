from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PacientesViewSet, MedicamentosViewSet,RolesViewSet


router = DefaultRouter()

router.register(r'pacientes', PacientesViewSet)
router.register(r'medicamentos', MedicamentosViewSet)
router.register(r'roles', RolesViewSet)


urlpatterns = [
    path('', include(router.urls)),
]
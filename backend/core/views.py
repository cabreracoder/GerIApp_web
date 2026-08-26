from rest_framework import viewsets
from .models import Pacientes, Medicamentos,Roles
from .serializers import MedicamentosSerializer, PacientesSerializer, RolesSerializer


class PacientesViewSet(viewsets.ModelViewSet):
    queryset = Pacientes.objects.all()
    serializer_class = PacientesSerializer

class MedicamentosViewSet(viewsets.ModelViewSet):
    queryset = Medicamentos.objects.all()
    serializer_class = MedicamentosSerializer

class RolesViewSet(viewsets.ModelViewSet):
    queryset = Roles.objects.all()
    serializer_class = RolesSerializer
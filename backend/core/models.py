# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AdministracionMedicamento(models.Model):
    id_admin_medicamento = models.AutoField(primary_key=True)
    fecha = models.DateTimeField()
    estado = models.CharField()
    observaciones = models.CharField()
    id_horario = models.ForeignKey('HorarioMedicamento', models.DO_NOTHING, db_column='id_horario', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'administracion_medicamento'


class Alertas(models.Model):
    id_alerta = models.AutoField(primary_key=True)
    tipo = models.CharField()
    titulo = models.CharField()
    descripcion = models.CharField()
    fecha = models.DateTimeField()
    hora = models.DateTimeField()
    prioridad = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'alertas'


class AplicacionMedicamentos(models.Model):
    id_aplicacion = models.AutoField(primary_key=True)
    fecha = models.CharField()
    hora = models.CharField()
    estado = models.CharField()
    observaciones = models.CharField()
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'aplicacion_medicamentos'


class Bitacora(models.Model):
    id_bitacora = models.AutoField(primary_key=True)
    accion = models.CharField()
    modulo = models.CharField()
    descripcion = models.CharField()
    fecha = models.DateTimeField()
    hora = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'bitacora'


class Cuidados(models.Model):
    id_cuidado = models.AutoField(primary_key=True)
    detalle = models.CharField()
    fecha = models.DateTimeField()
    hora = models.DateTimeField()
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'cuidados'


class Emergencias(models.Model):
    id_emergencia = models.AutoField(primary_key=True)
    fecha = models.DateTimeField()
    causa = models.CharField()
    urgencia = models.CharField()
    signos_vitales = models.CharField()
    registro_fotografico = models.CharField()
    ambulancia = models.CharField()

    class Meta:
        managed = False
        db_table = 'emergencias'


class Enfermedades(models.Model):
    id_enfermedad = models.AutoField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'enfermedades'


class Eventos(models.Model):
    id_evento = models.AutoField(primary_key=True)
    tipo = models.CharField()
    observacion = models.CharField()
    fecha = models.DateTimeField()
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'eventos'


class HistoriaClinicas(models.Model):
    id_historia_clinica = models.AutoField(primary_key=True)
    fecha_apertura = models.DateTimeField()
    antecedentes = models.CharField()
    alergias = models.CharField()
    observaciones = models.CharField()
    estado = models.BooleanField()
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'historia_clinicas'


class HorarioMedicamento(models.Model):
    id_horario = models.AutoField(primary_key=True)
    hora = models.DateTimeField()
    estado = models.CharField()
    observaciones = models.CharField()
    id_tratamiento = models.ForeignKey('Tratamiento', models.DO_NOTHING, db_column='id_tratamiento', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'horario_medicamento'


class InventarioInsumos(models.Model):
    id_innventario_insumos = models.AutoField(primary_key=True)
    nombre = models.CharField()
    categoria = models.CharField()
    cantidad = models.IntegerField()
    fecha_ingreso = models.DateTimeField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'inventario_\x1finsumos'


class Medicacion(models.Model):
    id_medicacion = models.AutoField(primary_key=True)
    dosis = models.CharField()
    horario = models.CharField()

    class Meta:
        managed = False
        db_table = 'medicacion'


class Medicamentos(models.Model):
    id_medicamentos = models.AutoField(primary_key=True)
    nombre = models.CharField()
    vencimiento = models.CharField()
    cantidad = models.CharField()
    descripcion = models.CharField()

    class Meta:
        managed = False
        db_table = 'medicamentos'


class Notificaciones(models.Model):
    id_notificaciones = models.AutoField(primary_key=True)
    fecha = models.TextField()  # This field type is a guess.
    mensaje = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'notificaciones'


class PacienteEnfermedad(models.Model):
    id_paciente_enfermedad = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)
    id_enfermedad = models.ForeignKey(Enfermedades, models.DO_NOTHING, db_column='id_enfermedad', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'paciente_enfermedad'


class Pacientes(models.Model):
    id_paciente = models.AutoField(primary_key=True)
    nombre = models.CharField()
    apellido = models.CharField()
    eps = models.CharField()
    sede = models.CharField()
    fecha_nacimiento = models.DateTimeField()
    cedula = models.IntegerField()
    edad = models.IntegerField()
    fecha_ingreso = models.DateTimeField()
    habitacion = models.IntegerField()
    responsable = models.CharField()
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes'


class Recomendaciones(models.Model):
    id_recomendacion = models.AutoField(primary_key=True)
    indicacion = models.CharField()
    fecha = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'recomendaciones'


class Roles(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'roles'


class StockMedicamentos(models.Model):
    id_stock_medicamentos = models.AutoField(primary_key=True)
    cantidad = models.CharField()
    nombre = models.CharField()
    fecha_actualizacion = models.CharField()
    id_medicacion = models.ForeignKey(Medicacion, models.DO_NOTHING, db_column='id_medicacion', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'stock_medicamentos'


class Tareas(models.Model):
    id_tareas = models.AutoField(primary_key=True)
    titulo = models.CharField()
    descripcion = models.CharField()
    estado = models.CharField()
    fecha_creacion = models.CharField()
    fecha_limite = models.CharField()
    hora_limite = models.CharField()

    class Meta:
        managed = False
        db_table = 'tareas'


class Tratamiento(models.Model):
    id_tratamiento = models.CharField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    dosis = models.CharField()
    frecuencia = models.CharField(blank=True, null=True)
    id_paciente = models.ForeignKey(Pacientes, models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)
    id_medicacion = models.ForeignKey(Medicacion, models.DO_NOTHING, db_column='id_medicacion', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tratamiento'


class Turnos(models.Model):
    id_turno = models.AutoField(primary_key=True)
    fecha = models.CharField()
    hora_inicio = models.CharField()
    hora_fin = models.CharField(blank=True, null=True)
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'turnos'


class Usuarios(models.Model):
    nombre = models.CharField()
    apellido = models.CharField()
    correo = models.CharField()
    contraseña = models.CharField()
    fecha_ingreso = models.CharField()
    estado = models.BooleanField()
    id_usuario = models.AutoField(primary_key=True)
    id_rol = models.ForeignKey(Roles, models.DO_NOTHING, db_column='id_rol', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios'

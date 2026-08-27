# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Actividades(models.Model):
    id_actividad = models.AutoField(primary_key=True)
    id_bitacora = models.ForeignKey('Bitacora', models.DO_NOTHING, db_column='id_bitacora', blank=True, null=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    fecha_hora = models.DateTimeField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'actividades'


class AplicacionMedicamento(models.Model):
    id_aplicacion = models.AutoField(primary_key=True)
    id_medicamento_medicamento = models.ForeignKey('TratamientoMedicamento', models.DO_NOTHING, db_column='id_medicamento_medicamento', blank=True, null=True)
    id_inventario = models.ForeignKey('Inventario', models.DO_NOTHING, db_column='id_inventario', blank=True, null=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)
    fecha_hora = models.DateTimeField()
    dosis_administrada = models.CharField()
    via_administracion = models.CharField()
    estado = models.BooleanField()
    observacion = models.CharField()

    class Meta:
        managed = False
        db_table = 'aplicacion_medicamento'


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


class AsignacionPacienteCuidador(models.Model):
    id_asignacion = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    estado = models.CharField()
    observaciones = models.CharField()

    class Meta:
        managed = False
        db_table = 'asignacion_paciente_cuidador'


class AsignacionTurnoUsuario(models.Model):
    id_asignacion_turno_usuario = models.AutoField(primary_key=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)
    id_turno = models.ForeignKey('Turnos', models.DO_NOTHING, db_column='id_turno', blank=True, null=True)
    fecha = models.DateField()
    estado = models.CharField()

    class Meta:
        managed = False
        db_table = 'asignacion_turno_usuario'


class Bitacora(models.Model):
    id_bitacora = models.AutoField(primary_key=True)
    estado = models.BooleanField()
    tipo_registro = models.CharField()
    descripcion = models.CharField()
    fecha_hora = models.DateTimeField()
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'bitacora'


class DetalleEntregaInsumos(models.Model):
    id_detalle_entrega_insumos = models.AutoField(primary_key=True)
    id_insumo = models.ForeignKey('Insumos', models.DO_NOTHING, db_column='id_insumo', blank=True, null=True)
    cantidad = models.IntegerField()
    fecha_vencimiento = models.DateField()
    id_entrega_insumo = models.ForeignKey('EntregaInsumo', models.DO_NOTHING, db_column='id_entrega_insumo', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'detalle_entrega_insumos'


class DetalleEntregaMedicamento(models.Model):
    id_detalle_entrega_medicamento = models.AutoField(primary_key=True)
    id_entrega_medica = models.ForeignKey('EntregaMedica', models.DO_NOTHING, db_column='id_entrega_medica', blank=True, null=True)
    id_medicamentos = models.ForeignKey('Medicamentos', models.DO_NOTHING, db_column='id_medicamentos', blank=True, null=True)
    cantidad = models.IntegerField()
    fecha_vencimiento = models.DateField()

    class Meta:
        managed = False
        db_table = 'detalle_entrega_medicamento'


class Diagnosticos(models.Model):
    id_diagnostico = models.AutoField(primary_key=True)
    id_historia_clinica = models.ForeignKey('HistoriaClinicas', models.DO_NOTHING, db_column='id_historia_clinica', blank=True, null=True)
    id_enfermedad = models.ForeignKey('Enfermedades', models.DO_NOTHING, db_column='id_enfermedad', blank=True, null=True)
    descripcion = models.CharField()
    estado = models.BooleanField()
    fecha_diagnostico = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'diagnosticos'


class Enfermedades(models.Model):
    id_enfermedad = models.AutoField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'enfermedades'


class EntregaInsumo(models.Model):
    id_entrega_insumo = models.AutoField(primary_key=True)
    fehca_entrega = models.DateTimeField()
    observaciones = models.CharField()
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'entrega_insumo'


class EntregaMedica(models.Model):
    id_entrega_medica = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)
    fecha_entrega = models.DateTimeField()
    observaciones = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'entrega_medica'


class EventosAdversos(models.Model):
    id_evento_adverso = models.AutoField(primary_key=True)
    id_bitacora = models.ForeignKey(Bitacora, models.DO_NOTHING, db_column='id_bitacora', blank=True, null=True)
    id_evento = models.ForeignKey('TipoEvento', models.DO_NOTHING, db_column='id_evento', blank=True, null=True)
    id_tipo_emergencia = models.ForeignKey('TipoEmergencia', models.DO_NOTHING, db_column='id_tipo_emergencia', blank=True, null=True)
    fecha_hora = models.DateTimeField()
    descripcion = models.CharField()
    acciones_realizadas = models.CharField()
    estado = models.CharField()

    class Meta:
        managed = False
        db_table = 'eventos_adversos'


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


class ImagenesEventoAdverso(models.Model):
    id_imagen = models.AutoField(primary_key=True)
    id_evento_adverso = models.ForeignKey(EventosAdversos, models.DO_NOTHING, db_column='id_evento_adverso', blank=True, null=True)
    url_imagen = models.CharField()
    descripcion = models.CharField()
    fecha_subida = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'imagenes_evento_adverso'


class Insumos(models.Model):
    id_insumo = models.AutoField(primary_key=True)
    id_tipo_insumo = models.ForeignKey('TipoInsumo', models.DO_NOTHING, db_column='id_tipo_insumo', blank=True, null=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    unidad_medida = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'insumos'


class Inventario(models.Model):
    id_inventario = models.AutoField(primary_key=True)
    id_paciente = models.ForeignKey('Pacientes', models.DO_NOTHING, db_column='id_paciente', blank=True, null=True)
    id_medicamentos = models.ForeignKey('Medicamentos', models.DO_NOTHING, db_column='id_medicamentos', blank=True, null=True)
    cantidad_actual = models.IntegerField()
    cantidad_minima = models.IntegerField()
    fecha_ultimo_ingreso = models.DateTimeField()
    fecha_vencimiento = models.DateField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'inventario'


class Medicamentos(models.Model):
    id_medicamentos = models.AutoField(primary_key=True)
    nombre = models.CharField()
    vencimiento = models.DateField()
    descripcion = models.CharField()
    principio_activo = models.CharField()
    concentracion = models.CharField()
    presentacion = models.CharField()
    estado = models.BooleanField()
    unidad_medida = models.CharField()

    class Meta:
        managed = False
        db_table = 'medicamentos'


class MovimientoInsumo(models.Model):
    id_movimiento_insumo = models.AutoField(primary_key=True)
    id_insumo = models.ForeignKey(Insumos, models.DO_NOTHING, db_column='id_insumo', blank=True, null=True)
    id_detalle_entrega_insumos = models.ForeignKey(DetalleEntregaInsumos, models.DO_NOTHING, db_column='id_detalle_entrega_insumos', blank=True, null=True)
    tipo_insumo = models.CharField()
    cantidad = models.IntegerField()
    fecha_movimiento = models.DateTimeField()
    observacion = models.CharField()

    class Meta:
        managed = False
        db_table = 'movimiento_insumo'


class MovimientoMedicamento(models.Model):
    id_movimiento = models.AutoField(primary_key=True)
    id_inventario = models.ForeignKey(Inventario, models.DO_NOTHING, db_column='id_inventario', blank=True, null=True)
    id_detalle_entrega_medicamento = models.ForeignKey(DetalleEntregaMedicamento, models.DO_NOTHING, db_column='id_detalle_entrega_medicamento', blank=True, null=True)
    cantidad = models.IntegerField()
    fecha_movimiento = models.DateTimeField()
    observaciones = models.CharField()

    class Meta:
        managed = False
        db_table = 'movimiento_medicamento'


class Pacientes(models.Model):
    id_paciente = models.AutoField(primary_key=True)
    nombre = models.CharField()
    apellido = models.CharField()
    eps = models.CharField()
    sede = models.CharField()
    fecha_ingreso = models.DateTimeField()
    habitacion = models.IntegerField()
    responsable = models.CharField()
    id_usuario = models.ForeignKey('Usuarios', models.DO_NOTHING, db_column='id_usuario', blank=True, null=True)
    tipo_documento = models.CharField()
    numero_documento = models.CharField()
    fecha_nacimiento = models.DateField()
    sexo = models.CharField()
    telefono = models.CharField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pacientes'


class Roles(models.Model):
    id_rol = models.AutoField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'roles'


class SignosVitales(models.Model):
    id_signos_vitales = models.AutoField(primary_key=True)
    id_bitacora = models.ForeignKey(Bitacora, models.DO_NOTHING, db_column='id_bitacora', blank=True, null=True)
    temperatura = models.CharField()
    presion_sistolica = models.CharField()
    presion_diastolica = models.CharField()
    frecuencia_cardiaca = models.CharField()
    frecuencia_respiratoria = models.CharField()
    saturacion_oxigeno = models.CharField()
    peso = models.CharField()
    fecha_hora = models.DateTimeField()
    observaciones = models.CharField()

    class Meta:
        managed = False
        db_table = 'signos_vitales'


class TipoEmergencia(models.Model):
    id_tipo_emergencia = models.AutoField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    nivel = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'tipo_emergencia'


class TipoEvento(models.Model):
    id_evento = models.CharField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'tipo_evento'


class TipoInsumo(models.Model):
    id_tipo_insumo = models.AutoField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    estado = models.CharField()

    class Meta:
        managed = False
        db_table = 'tipo_insumo'


class Tratamiento(models.Model):
    id_tratamiento = models.CharField(primary_key=True)
    nombre = models.CharField()
    descripcion = models.CharField()
    dosis = models.CharField()
    frecuencia = models.CharField(blank=True, null=True)
    id_diagnostico = models.ForeignKey(Diagnosticos, models.DO_NOTHING, db_column='id_diagnostico', blank=True, null=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    indicaciones = models.CharField()

    class Meta:
        managed = False
        db_table = 'tratamiento'


class TratamientoMedicamento(models.Model):
    id_medicamento_medicamento = models.AutoField(primary_key=True)
    id_tratamiento = models.ForeignKey(Tratamiento, models.DO_NOTHING, db_column='id_tratamiento', blank=True, null=True)
    id_medicamentos = models.ForeignKey(Medicamentos, models.DO_NOTHING, db_column='id_medicamentos', blank=True, null=True)
    dosis = models.CharField()
    frecuencia = models.CharField()
    via_administracion = models.CharField()
    duracion = models.CharField()
    cantidad_prescrita = models.IntegerField()
    observaciones = models.CharField()
    estado = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'tratamiento_medicamento'


class Turnos(models.Model):
    id_turno = models.AutoField(primary_key=True)
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField(blank=True, null=True)
    estado = models.BooleanField()
    nombre = models.CharField()
    descripcion = models.CharField()

    class Meta:
        managed = False
        db_table = 'turnos'


class Usuarios(models.Model):
    nombres = models.CharField()
    apellidos = models.CharField()
    correo = models.CharField()
    contrasena = models.CharField()
    fecha_ingreso = models.DateTimeField()
    estado = models.BooleanField()
    id_usuario = models.AutoField(primary_key=True)
    id_rol = models.ForeignKey(Roles, models.DO_NOTHING, db_column='id_rol', blank=True, null=True)
    tipo_documento = models.CharField()
    numero_documento = models.CharField()
    telefono = models.CharField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuarios'

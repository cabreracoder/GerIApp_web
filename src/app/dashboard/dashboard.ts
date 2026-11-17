
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface EstadoSalud {
  nombre: string;
  cantidad: number;
  icono: string;
  clase: string;
}

interface AsignacionCuidador {
  iniciales: string;
  nombre: string;
  pacientes: number;
  porcentaje: number;
}

interface Periodo {
  inicio: Date;
  fin: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})

export class DashboardComponent implements OnInit {

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  // =====================================================
  // AUTENTICACIÓN
  // =====================================================

  private opcionesAutenticadas() {

    const token = localStorage.getItem('token');

    if (!token) {
      console.error('No se encontró el token de autenticación.');
      return {};
    }

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef
  ) { }

  // =====================================================
  // INFORMACIÓN GENERAL
  // =====================================================

  fechaActual = '';

  usuario = {
    nombres: ''
  };

  nombreFundacion = '';

  // =====================================================
  // PERIODO
  // =====================================================

  mesSeleccionadoIndex = new Date().getMonth();

  anioSeleccionado = new Date().getFullYear();

  mesSeleccionado = '';

  fechaInicioPeriodo = '';

  fechaFinPeriodo = '';

  progresoMes = 0;

  private readonly nombresMeses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  // =====================================================
  // 1. OCUPACIÓN ACTUAL DEL CENTRO
  // =====================================================

  capacidadMaxima = 0;

  pacientesActuales = 0;

  camasOcupadas = 0;

  habitacionesOcupadas = 0;
  habitacionesDisponibles = 0;
  camasDisponibles = 0;

  porcentajeOcupacion = 0;

  ocupacionDashArray = '0 263.89';
  // =====================================================
  // 2. PUNTUALIDAD
  // =====================================================

  porcentajePuntualidad = 0;

  totalRegistrosPuntualidad = 0;

  cuidadoresPuntuales = 0;

  cuidadoresConRetraso = 0;

  promedioRetraso: string | number = '—';

  // =====================================================
  // 3. CUMPLIMIENTO DE TURNOS
  // =====================================================

  totalTurnosProgramados = 0;

  turnosFinalizados = 0;

  turnosEnCurso = 0;

  turnosPendientesCierre = 0;

  porcentajeTurnosFinalizados = 0;

  porcentajeTurnosEnCurso = 0;

  porcentajeTurnosPendientes = 0;

  // =====================================================
  // 4. ESTADO GENERAL DE SALUD
  // =====================================================

  estadosSalud: EstadoSalud[] = [
    {
      nombre: 'Clasificación clínica pendiente',
      cantidad: 0,
      icono: 'info',
      clase: 'observation-health'
    }
  ];

  totalPacientesEvaluados = 0;

  // =====================================================
  // 5. CÁMARAS Y EVENTOS IA
  // =====================================================

  totalEventosIa = 0;

  eventosRiesgoAlto = 0;

  eventosRiesgoMedio = 0;

  eventosRiesgoBajo = 0;

  totalNotificacionesEventos = 0;

  eventosRiesgoGradient =
    'conic-gradient(#edf1f7 0deg 360deg)';

  // =====================================================
  // 6. ASIGNACIONES DE CUIDADORES
  // =====================================================

  asignacionesCuidadores: AsignacionCuidador[] = [];

  totalPacientesAsignados = 0;

  cuidadoresActivosAsignacion = 0;

  // =====================================================
  // ESTADO DE CARGA
  // =====================================================

  cargando = false;

  errorCarga = false;

  // =====================================================
  // INICIO
  // =====================================================

  ngOnInit(): void {

    this.cargarUsuario();

    this.cargarFechaActual();

    this.actualizarPeriodo();

    this.cargarDatosDashboard();

  }

  // =====================================================
  // USUARIO AUTENTICADO
  // =====================================================

  private cargarUsuario(): void {

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      return;
    }

    try {

      const usuario = JSON.parse(usuarioGuardado);

      this.usuario = {
        nombres: usuario.nombres ?? ''
      };

    } catch (error) {

      console.error(
        'Error cargando usuario:',
        error
      );

    }

  }

  // =====================================================
  // FECHA ACTUAL
  // =====================================================

  private cargarFechaActual(): void {

    const fecha = new Date();

    this.fechaActual = fecha.toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
    );

  }

  // =====================================================
  // ACTUALIZAR PERIODO
  // =====================================================

  private obtenerPeriodo(): Periodo {

    const inicio = new Date(
      this.anioSeleccionado,
      this.mesSeleccionadoIndex,
      1,
      0, 0, 0, 0
    );

    const fin = new Date(
      this.anioSeleccionado,
      this.mesSeleccionadoIndex + 1,
      0,
      23, 59, 59, 999
    );

    return { inicio, fin };

  }

  private actualizarPeriodo(): void {

    const periodo = this.obtenerPeriodo();

    this.mesSeleccionado =
      `${this.nombresMeses[this.mesSeleccionadoIndex]} ${this.anioSeleccionado}`;

    this.fechaInicioPeriodo =
      this.formatearFecha(periodo.inicio);

    this.fechaFinPeriodo =
      this.formatearFecha(periodo.fin);

    this.progresoMes =
      (this.mesSeleccionadoIndex / 11) * 100;

  }

  private formatearFecha(fecha: Date): string {

    return fecha.toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );

  }

  // =====================================================
  // SELECCIONAR MES
  // =====================================================

  seleccionarMes(indice: number): void {

    if (indice < 0 || indice > 11) {
      return;
    }

    this.mesSeleccionadoIndex = indice;

    this.actualizarPeriodo();

    this.cargarDatosDashboard();

  }

  // =====================================================
  // CAMBIAR MES DESDE LA BARRA
  // =====================================================

  cambiarMes(event: MouseEvent): void {

    const barra =
      event.currentTarget as HTMLElement;

    const rectangulo =
      barra.getBoundingClientRect();

    const posicion =
      (event.clientX - rectangulo.left) /
      rectangulo.width;

    const porcentaje = Math.max(
      0,
      Math.min(posicion, 1)
    );

    const indice = Math.round(
      porcentaje * 11
    );

    this.seleccionarMes(indice);

  }

  // =====================================================
  // UTILIDADES DE CONSULTA
  // =====================================================

  private obtenerLista(respuesta: any): any[] {

    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (Array.isArray(respuesta?.results)) {
      return respuesta.results;
    }

    return [];

  }

  private idRelacion(valor: any): number | null {

    if (valor === null || valor === undefined) {
      return null;
    }

    const id =
      typeof valor === 'object'
        ? valor.id_usuario ??
        valor.id_paciente ??
        valor.id_cama ??
        valor.id_habitacion ??
        valor.id_turno ??
        valor.id_tipo_evento ??
        valor.id_asignacion_turno_usuario ??
        valor.id
        : valor;

    const numero = Number(id);

    return Number.isFinite(numero)
      ? numero
      : null;

  }

  private estaEnPeriodo(
    fecha: any,
    periodo: Periodo
  ): boolean {

    if (!fecha) {
      return false;
    }

    const valor = new Date(fecha);

    if (Number.isNaN(valor.getTime())) {
      return false;
    }

    return (
      valor >= periodo.inicio &&
      valor <= periodo.fin
    );

  }

  private normalizarEstado(valor: any): string {

    return String(valor ?? '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  }

  private consultar(endpoint: string) {

    return this.http.get<any>(
      `${this.apiUrl}/${endpoint}/`,
      this.opcionesAutenticadas()
    ).pipe(
      catchError(error => {

        console.error(
          `Error consultando ${endpoint}:`,
          error
        );

        return of([]);

      })
    );

  }

  // =====================================================
  // CARGAR INFORMACIÓN DEL DASHBOARD
  // =====================================================

  private cargarDatosDashboard(): void {

    this.cargando = true;

    this.errorCarga = false;

    forkJoin({

      camas: this.consultar('camas'),

      habitaciones: this.consultar('habitaciones'),
      asignacionesHabitacion: this.consultar('asignacion_habitacion'),
      turnos:
        this.consultar('asignacion_turno_usuario'),

      cierres:
        this.consultar('cierre_turno'),

      pacientes:
        this.consultar('pacientes'),

      usuarios:
        this.consultar('usuarios'),

      asignacionesCuidadores:
        this.consultar('asignacion_paciente_cuidador'),

      eventos:
        this.consultar('eventos_ia'),

      tiposEventos:
        this.consultar('tipos_evento_ia'),

      notificaciones:
        this.consultar('notificaciones')

    }).subscribe({


      next: datos => {

        const periodo = this.obtenerPeriodo();

        const camas =
          this.obtenerLista(datos.camas);

        const habitaciones =
          this.obtenerLista(datos.habitaciones);

        // ASIGNACIONES DE HABITACIONES
        const asignacionesHabitacion =
          this.obtenerLista(datos.asignacionesHabitacion);

        const turnos =
          this.obtenerLista(datos.turnos);

        const cierres =
          this.obtenerLista(datos.cierres);

        const pacientes =
          this.obtenerLista(datos.pacientes);

        const usuarios =
          this.obtenerLista(datos.usuarios);

        const asignacionesCuidadores =
          this.obtenerLista(datos.asignacionesCuidadores);

        const eventos =
          this.obtenerLista(datos.eventos);

        const tiposEventos =
          this.obtenerLista(datos.tiposEventos);

        const notificaciones =
          this.obtenerLista(datos.notificaciones);

        // COMPROBACIÓN DE DATOS
        console.log('CAMAS:', camas);
        console.log('HABITACIONES:', habitaciones);
        console.log('ASIGNACIONES HABITACIÓN:', asignacionesHabitacion);

        // 1. OCUPACIÓN DEL CENTRO
        this.calcularCapacidad(
          camas,
          habitaciones,
          pacientes,
          periodo
        );
        // 2. CUMPLIMIENTO DE TURNOS
        this.calcularCumplimiento(
          turnos,
          cierres,
          periodo
        );

        // 3. EVENTOS IA
        this.calcularEventosIA(
          eventos,
          tiposEventos,
          notificaciones,
          periodo
        );

        // 4. ASIGNACIONES DE CUIDADORES
        this.calcularAsignaciones(
          asignacionesCuidadores,
          usuarios,
          pacientes,
          periodo
        );

        // 5. INDICADORES NO DISPONIBLES
        this.calcularPuntualidadNoDisponible();

        this.calcularSaludNoDisponible();

        this.cargando = false;

        this.cd.detectChanges();
        console.log('PACIENTES RECIBIDOS:', pacientes);
        console.log(
          'DETALLE COMPLETO DE PACIENTES:',
          JSON.stringify(pacientes, null, 2)
        );
        console.log('ASIGNACIONES HABITACIÓN:', asignacionesHabitacion);
      },


      error: error => {

        console.error(
          'Error general del dashboard:',
          error
        );

        this.cargando = false;

        this.errorCarga = true;

        this.cd.detectChanges();

      }

    });

  }

  private calcularCapacidad(
    camas: any[],
    habitaciones: any[],
    pacientes: any[],
    periodo: Periodo
  ): void {

    // 1. CAMAS ACTIVAS
    const camasActivas = camas.filter(
      cama => cama.estado === true
    );

    this.capacidadMaxima = camasActivas.length;

    const idsCamasActivas = new Set<number>(
      camasActivas.map(cama => Number(cama.id_cama))
    );

    // 2. HABITACIONES ACTIVAS
    const habitacionesActivas = habitaciones.filter(
      habitacion => habitacion.estado === true
    );

    const idsHabitacionesActivas = new Set<number>(
      habitacionesActivas.map(
        habitacion => Number(habitacion.id_habitacion)
      )
    );

    // 3. PACIENTES QUE INGRESARON EN EL MES SELECCIONADO
    const pacientesPeriodo = pacientes.filter(paciente => {

      const ingreso = paciente.fecha_ingreso
        ? new Date(paciente.fecha_ingreso)
        : null;

      if (!ingreso || Number.isNaN(ingreso.getTime())) {
        return false;
      }

      return ingreso <= periodo.fin;
    });

    // 4. IDENTIFICAR CAMAS Y HABITACIONES OCUPADAS
    const idsCamasOcupadas = new Set<number>();
    const idsHabitacionesOcupadas = new Set<number>();

    pacientesPeriodo.forEach(paciente => {

      // Solo pacientes activos
      if (paciente.estado !== true) {
        return;
      }

      const camaId = this.idRelacion(paciente.cama);

      const habitacionId = this.idRelacion(
        paciente.habitacion
      );

      if (
        camaId !== null &&
        idsCamasActivas.has(camaId)
      ) {
        idsCamasOcupadas.add(camaId);
      }

      if (
        habitacionId !== null &&
        idsHabitacionesActivas.has(habitacionId)
      ) {
        idsHabitacionesOcupadas.add(habitacionId);
      }

    });

    // 5. RESULTADOS
    this.camasOcupadas = idsCamasOcupadas.size;

    this.habitacionesOcupadas =
      idsHabitacionesOcupadas.size;

    this.camasDisponibles = Math.max(
      this.capacidadMaxima - this.camasOcupadas,
      0
    );

    this.habitacionesDisponibles = Math.max(
      habitacionesActivas.length - this.habitacionesOcupadas,
      0
    );

    this.pacientesActuales = this.camasOcupadas;

    // 6. PORCENTAJE DE OCUPACIÓN
    this.porcentajeOcupacion =
      this.capacidadMaxima > 0
        ? Math.round(
          (this.camasOcupadas / this.capacidadMaxima) * 100
        )
        : 0;

    // 7. GRÁFICO CIRCULAR
    const radio = 42;
    const circunferencia = 2 * Math.PI * radio;

    const ocupado =
      (this.porcentajeOcupacion / 100) * circunferencia;

    const restante = circunferencia - ocupado;

    this.ocupacionDashArray =
      `${ocupado} ${restante}`;

    console.log('OCUPACIÓN DEL CENTRO:', {
      mes: this.mesSeleccionado,
      camasOcupadas: this.camasOcupadas,
      camasDisponibles: this.camasDisponibles,
      habitacionesOcupadas: this.habitacionesOcupadas,
      habitacionesDisponibles: this.habitacionesDisponibles,
      porcentaje: this.porcentajeOcupacion
    });

  }

  // =====================================================
  // 2. PUNTUALIDAD
  // =====================================================

  private calcularPuntualidadNoDisponible(): void {

    // El modelo AsignacionTurnoUsuario registra
    // fecha y estado, pero no una hora real de llegada.
    // No se debe calcular puntualidad con la hora de cierre.

    this.porcentajePuntualidad = 0;

    this.totalRegistrosPuntualidad = 0;

    this.cuidadoresPuntuales = 0;

    this.cuidadoresConRetraso = 0;

    this.promedioRetraso = '—';

  }

  // =====================================================
  // 3. CUMPLIMIENTO DE TURNOS
  // =====================================================

  private calcularCumplimiento(
    turnos: any[],
    cierres: any[],
    periodo: Periodo
  ): void {

    const turnosPeriodo = turnos.filter(
      turno => this.estaEnPeriodo(
        turno.fecha,
        periodo
      )
    );

    this.totalTurnosProgramados =
      turnosPeriodo.length;

    const idsCerrados = new Set(
      cierres
        .filter(cierre =>
          this.estaEnPeriodo(
            cierre.fecha_hora,
            periodo
          )
        )
        .map(cierre =>
          this.idRelacion(
            cierre.id_asignacion_turno_usuario
          )
        )
        .filter(id => id !== null)
    );

    this.turnosFinalizados = 0;

    this.turnosEnCurso = 0;

    this.turnosPendientesCierre = 0;

    turnosPeriodo.forEach(turno => {

      const id =
        Number(turno.id_asignacion_turno_usuario);

      const estado =
        this.normalizarEstado(turno.estado);

      const finalizado =
        idsCerrados.has(id) ||
        estado === 'finalizado' ||
        estado === 'finalizado con exito';

      if (finalizado) {

        this.turnosFinalizados++;

      } else if (
        estado === 'asignado' ||
        estado === 'en curso' ||
        estado === 'iniciado'
      ) {

        this.turnosEnCurso++;

      } else if (
        estado.includes('pendiente') ||
        estado.includes('cierre')
      ) {

        this.turnosPendientesCierre++;

      }

    });

    const total = this.totalTurnosProgramados;

    this.porcentajeTurnosFinalizados =
      total > 0
        ? (this.turnosFinalizados / total) * 100
        : 0;

    this.porcentajeTurnosEnCurso =
      total > 0
        ? (this.turnosEnCurso / total) * 100
        : 0;

    this.porcentajeTurnosPendientes =
      total > 0
        ? (this.turnosPendientesCierre / total) * 100
        : 0;

  }

  // =====================================================
  // 4. ESTADO DE SALUD
  // =====================================================

  private calcularSaludNoDisponible(): void {

    // No se asignan categorías clínicas automáticamente.
    // Los modelos actuales no contienen un campo
    // estable / intermedio / crítico.

    this.totalPacientesEvaluados = 0;

    this.estadosSalud = [
      {
        nombre: 'Clasificación clínica pendiente',
        cantidad: 0,
        icono: 'info',
        clase: 'observation-health'
      }
    ];

  }

  // =====================================================
  // 5. CÁMARAS Y EVENTOS IA
  // =====================================================

  private calcularEventosIA(
    eventos: any[],
    tiposEventos: any[],
    notificaciones: any[],
    periodo: Periodo
  ): void {

    const eventosPeriodo = eventos.filter(
      evento => this.estaEnPeriodo(
        evento.fecha_hora,
        periodo
      )
    );

    this.totalEventosIa =
      eventosPeriodo.length;

    this.eventosRiesgoAlto = 0;

    this.eventosRiesgoMedio = 0;

    this.eventosRiesgoBajo = 0;

    const tiposPorId = new Map<number, string>();

    tiposEventos.forEach(tipo => {

      tiposPorId.set(
        Number(tipo.id_tipo_evento),
        this.normalizarEstado(tipo.nivel_riesgo)
      );

    });

    eventosPeriodo.forEach(evento => {

      const idTipo =
        this.idRelacion(evento.id_tipo_evento);

      const riesgo =
        idTipo !== null
          ? tiposPorId.get(idTipo) ?? ''
          : '';

      if (
        riesgo.includes('alto') ||
        riesgo.includes('critico')
      ) {

        this.eventosRiesgoAlto++;

      } else if (
        riesgo.includes('medio') ||
        riesgo.includes('moderado')
      ) {

        this.eventosRiesgoMedio++;

      } else if (
        riesgo.includes('bajo')
      ) {

        this.eventosRiesgoBajo++;

      }

    });

    // Solo notificaciones identificadas explícitamente
    // como relacionadas con IA o cámaras.
    const notificacionesIA =
      notificaciones.filter(notificacion => {

        if (!this.estaEnPeriodo(
          notificacion.fecha_hora,
          periodo
        )) {
          return false;
        }

        const tipo =
          this.normalizarEstado(notificacion.tipo);

        return (
          tipo.includes('ia') ||
          tipo.includes('camara')
        );

      });

    this.totalNotificacionesEventos =
      notificacionesIA.length;

    this.actualizarGraficaEventos();

  }

  private actualizarGraficaEventos(): void {

    const totalClasificado =
      this.eventosRiesgoAlto +
      this.eventosRiesgoMedio +
      this.eventosRiesgoBajo;

    if (totalClasificado === 0) {

      this.eventosRiesgoGradient =
        'conic-gradient(#edf1f7 0deg 360deg)';

      return;

    }

    const gradosAlto =
      (this.eventosRiesgoAlto / totalClasificado) * 360;

    const gradosMedio =
      (this.eventosRiesgoMedio / totalClasificado) * 360;

    const gradosBajo =
      (this.eventosRiesgoBajo / totalClasificado) * 360;

    const finAlto = gradosAlto;

    const finMedio =
      gradosAlto + gradosMedio;

    const finBajo =
      gradosAlto + gradosMedio + gradosBajo;

    this.eventosRiesgoGradient =
      `conic-gradient(
    var(--color-danger) 0deg ${finAlto}deg,
    #3B5BDB ${finAlto}deg ${finMedio}deg,
    #AFC7F7 ${finMedio}deg ${finBajo}deg
  )`;

  }

  // =====================================================
  // 6. ASIGNACIONES DE CUIDADORES
  // =====================================================

  private calcularAsignaciones(
    asignaciones: any[],
    usuarios: any[],
    pacientes: any[],
    periodo: Periodo
  ): void {

    const asignacionesPeriodo =
      asignaciones.filter(asignacion => {

        const estado =
          this.normalizarEstado(asignacion.estado);

        const inicio =
          new Date(asignacion.fecha_inicio);

        const fin = asignacion.fecha_fin
          ? new Date(asignacion.fecha_fin)
          : null;

        if (estado !== 'activo') {
          return false;
        }

        if (Number.isNaN(inicio.getTime())) {
          return false;
        }

        return (
          inicio <= periodo.fin &&
          (!fin || fin >= periodo.inicio)
        );

      });

    const cuidadoresMap =
      new Map<number, Set<number>>();

    asignacionesPeriodo.forEach(asignacion => {

      const idUsuario =
        this.idRelacion(asignacion.id_usuario);

      const idPaciente =
        this.idRelacion(asignacion.id_paciente);

      if (idUsuario === null || idPaciente === null) {
        return;
      }

      if (!cuidadoresMap.has(idUsuario)) {
        cuidadoresMap.set(
          idUsuario,
          new Set<number>()
        );
      }

      cuidadoresMap.get(idUsuario)!.add(idPaciente);

    });

    const usuariosMap = new Map<number, any>();

    usuarios.forEach(usuario => {

      usuariosMap.set(
        Number(usuario.id_usuario),
        usuario
      );

    });

    this.asignacionesCuidadores = [];

    cuidadoresMap.forEach((pacientesSet, idUsuario) => {

      const usuario = usuariosMap.get(idUsuario);

      if (!usuario) {
        return;
      }

      const nombre =
        `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`.trim();

      const iniciales = nombre
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(parte => parte.charAt(0).toUpperCase())
        .join('');

      this.asignacionesCuidadores.push({

        iniciales: iniciales || 'C',

        nombre: nombre || 'Cuidador',

        pacientes: pacientesSet.size,

        porcentaje: 0

      });

    });

    this.asignacionesCuidadores.sort(
      (a, b) => b.pacientes - a.pacientes
    );

    const maximo = Math.max(
      ...this.asignacionesCuidadores.map(c => c.pacientes),
      1
    );

    this.asignacionesCuidadores =
      this.asignacionesCuidadores.map(cuidador => ({
        ...cuidador,
        porcentaje:
          (cuidador.pacientes / maximo) * 100
      }));

    this.totalPacientesAsignados =
      asignacionesPeriodo
        .map(a => this.idRelacion(a.id_paciente))
        .filter(id => id !== null)
        .filter((id, index, array) =>
          array.indexOf(id) === index
        ).length;

    this.cuidadoresActivosAsignacion =
      this.asignacionesCuidadores.length;

  }

}

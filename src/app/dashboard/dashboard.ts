
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  HttpClientModule,
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface EstadoSalud {
  nombre: string;
  cantidad: number;
  icono: string;
  clase: string;
  porcentaje: number;
}

interface AsignacionCuidador {
  iniciales: string;
  nombre: string;
  pacientes: number;
  porcentaje: number;
}

interface Periodo {
  inicio: Date;
  // Límites visibles del mes completo (día 1 al último día).
  fin: Date;
  // Límite real para consultar datos: hoy en el mes actual,
  // fin de mes en meses pasados y null en meses futuros.
  finDatos: Date | null;
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
      this.mostrarAlertaCarga(
        'Sesión no disponible',
        'No fue posible verificar tu sesión. Inicia sesión nuevamente.'
      );
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

  // Sede del administrador autenticado.
  private idSedeUsuario: number | null = null;

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

  // Resumen de puntualidad agrupado en cuatro periodos del mes.
  graficaPuntualidadSemanal: Array<{
    etiqueta: string;
    rango: string;
    porcentaje: number;
    aTiempo: number;
    conRetraso: number;
    x: number;
    y: number;
  }> = [];

  rutaPuntualidad = '';
  areaPuntualidad = '';

  // =====================================================
  // 3. CUMPLIMIENTO DE TURNOS
  // =====================================================

  totalTurnosProgramados = 0;

  turnosAsignados = 0;

  turnosEnCurso = 0;

  turnosFinalizados = 0;

  turnosNoCumplidos = 0;

  porcentajeTurnosAsignados = 0;

  porcentajeTurnosEnCurso = 0;

  porcentajeTurnosFinalizados = 0;

  porcentajeTurnosNoCumplidos = 0;

  // =====================================================
  // 4. ESTADO GENERAL DE SALUD
  // =====================================================

  estadosSalud: EstadoSalud[] = [
    {
      nombre: 'Críticos',
      cantidad: 0,
      icono: 'warning',
      clase: 'critical-health',
      porcentaje: 0
    },
    {
      nombre: 'Estables',
      cantidad: 0,
      icono: 'favorite',
      clase: 'nominal-health',
      porcentaje: 0
    }
  ];

  totalPacientesEvaluados = 0;

  // Gradiente dinámico de la gráfica circular de estado de salud.
  saludGrafico = 'conic-gradient(#edf1f7 0deg 360deg)';

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

  private alertaCargaMostrada = false;

  // =====================================================
  // ALERTAS DE CARGA - DISEÑO GLOBAL GERIAPP
  // =====================================================

  private mostrarAlertaCarga(titulo: string, mensaje: string): void {
    if (this.alertaCargaMostrada) {
      return;
    }

    this.alertaCargaMostrada = true;

    Swal.fire({
      html: `
        <div class="geri-alerta">
          <div class="geri-alerta__contenido">
            <img src="/Logo-GerIApp.png" alt="GeriApp" class="geri-alerta__logo">
            <h2 class="geri-alerta__titulo">${this.escaparHtml(titulo)}</h2>
            <p class="geri-alerta__mensaje">${this.escaparHtml(mensaje)}</p>
          </div>
        </div>
      `,
      width: 700,
      padding: 0,
      showConfirmButton: true,
      confirmButtonText: 'Aceptar',
      buttonsStyling: false,
      allowOutsideClick: false,
      allowEscapeKey: true,
      backdrop: 'rgba(33, 37, 41, 0.48)',
      customClass: {
        popup: 'geri-swal-popup',
        htmlContainer: 'geri-swal-html',
        actions: 'geri-swal-actions',
        confirmButton: 'geri-swal-btn geri-swal-btn--azul'
      }
    });
  }

  private escaparHtml(valor: string): string {
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =====================================================
  // INICIO
  // =====================================================

  ngOnInit(): void {

    this.cargarFechaActual();

    this.actualizarPeriodo();

    // Primero se resuelve la sede desde el mismo endpoint que utiliza Layout.
    // cargarDatosDashboard se ejecuta cuando termina esa consulta.
    this.cargarUsuario();

  }

  // =====================================================
  // USUARIO AUTENTICADO
  // =====================================================

  private cargarUsuario(): void {

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      console.error('No hay un usuario guardado en localStorage.');
      this.idSedeUsuario = null;
      this.cargarDatosDashboard();
      return;
    }

    try {

      const usuario = JSON.parse(usuarioGuardado);

      this.usuario = {
        nombres: usuario.nombres ?? ''
      };

      const idUsuario = Number(usuario.id_usuario);

      if (!Number.isFinite(idUsuario) || idUsuario <= 0) {
        console.error(
          'El usuario guardado no contiene un id_usuario válido:',
          usuario
        );
        this.idSedeUsuario = null;
        this.cargarDatosDashboard();
        return;
      }

      console.log('DASHBOARD - USUARIO DESDE LOCALSTORAGE:', usuario);
      console.log(
        'DASHBOARD - CONSULTANDO SEDE DEL USUARIO:',
        idUsuario
      );

      // Igual que Layout: consultar /usuarios/{id_usuario}/ y obtener id_sede.
      // No dependemos de que id_sede esté guardado en localStorage.
      this.http
        .get<any>(
          `${this.apiUrl}/usuarios/${idUsuario}/`,
          this.opcionesAutenticadas()
        )
        .subscribe({

          next: (respuesta) => {

            const sedeRelacionada = respuesta?.id_sede;

            const idSede =
              typeof sedeRelacionada === 'object' && sedeRelacionada !== null
                ? sedeRelacionada.id_sede ?? sedeRelacionada.id ?? sedeRelacionada.pk
                : sedeRelacionada;

            this.idSedeUsuario = this.idRelacion(idSede);

            console.log('SEDE DEL ADMINISTRADOR - RESPUESTA API:', respuesta);
            console.log('SEDE DEL ADMINISTRADOR (resuelta):', {
              idUsuario,
              sedeOriginal: sedeRelacionada,
              idSede: this.idSedeUsuario
            });

            if (this.idSedeUsuario === null) {
              console.error(
                'La API de usuarios no devolvió una sede válida. ' +
                'No se clasificarán pacientes de otras sedes.'
              );
            }

            // Cargar después de resolver la sede para no clasificar con null.
            this.cargarDatosDashboard();

          },

          error: (error) => {

            console.error(
              'Error al consultar el usuario y su sede desde el Dashboard:',
              error
            );

            this.idSedeUsuario = null;
            this.cargarDatosDashboard();

          }

        });

    } catch (error) {

      console.error(
        'Error cargando usuario desde localStorage:',
        error
      );

      this.idSedeUsuario = null;
      this.cargarDatosDashboard();

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

    const ultimoInstanteMes = new Date(
      this.anioSeleccionado,
      this.mesSeleccionadoIndex + 1,
      0,
      23, 59, 59, 999
    );

    const ahora = new Date();
    const inicioMesActual = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1,
      0, 0, 0, 0
    );

    const esMesActual =
      this.anioSeleccionado === ahora.getFullYear() &&
      this.mesSeleccionadoIndex === ahora.getMonth();

    const esMesFuturo = inicio > inicioMesActual;

    // La barra siempre representa el mes completo.
    // La consulta se corta hoy para el mes actual y queda vacía
    // para meses futuros.
    const finDatos = esMesFuturo
      ? null
      : esMesActual
        ? ahora
        : ultimoInstanteMes;

    return { inicio, fin: ultimoInstanteMes, finDatos };

  }

  private actualizarPeriodo(): void {

    const periodo = this.obtenerPeriodo();

    this.mesSeleccionado =
      `${this.nombresMeses[this.mesSeleccionadoIndex]} ${this.anioSeleccionado}`;

    this.fechaInicioPeriodo =
      this.formatearFecha(periodo.inicio);

    this.fechaFinPeriodo =
      this.formatearFecha(periodo.fin);

    // La escala siempre cubre los doce meses: enero (0%) a diciembre (100%).
    this.progresoMes = (this.mesSeleccionadoIndex / 11) * 100;

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

    // Se permite recorrer los doce meses del año seleccionado.
    if (!Number.isInteger(indice) || indice < 0 || indice > 11) {
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

    // La barra completa representa enero-diciembre, incluso los meses futuros.
    const indice = Math.round(porcentaje * 11);

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
        valor.id_bitacora ??
        valor.id_cama ??
        valor.id_habitacion ??
        valor.id_turno ??
        valor.id_asignacion ??
        valor.id_tipo_evento ??
        valor.id_asignacion_turno_usuario ??
        valor.id_sede ??
        valor.id_sede_id ??
        valor.sede_id ??
        valor.sedeId ??
        valor.idSede ??
        valor.pk ??
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

    // Un mes futuro no debe reutilizar ni mostrar registros de otro mes.
    if (!periodo.finDatos) return false;

    return (
      valor >= periodo.inicio &&
      valor <= periodo.finDatos
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

        this.mostrarAlertaCarga(
          'No se pudo cargar la información',
          `Ocurrió un problema al consultar ${endpoint}. Verifica tu conexión e inténtalo nuevamente.`
        );

        return of([]);

      })
    );

  }

  // =====================================================
  // CARGAR INFORMACIÓN DEL DASHBOARD
  // =====================================================

  private cargarDatosDashboard(): void {

    this.alertaCargaMostrada = false;

    this.cargando = true;

    this.errorCarga = false;

    forkJoin({

      camas: this.consultar('camas'),

      habitaciones: this.consultar('habitaciones'),
      asignacionesHabitacion: this.consultar('asignacion_habitacion'),
      turnos:
        this.consultar('asignacion_turno_usuario'),

      catalogoTurnos:
        this.consultar('turnos'),

      cierres:
        this.consultar('cierre_turno'),

      pacientes:
        this.consultar('pacientes'),

      // Seguimiento clínico real del paciente.
      bitacoras:
        this.consultar('bitacora'),

      signosVitales:
        this.consultar('signos_vitales'),

      historiasClinicas:
        this.consultar('historia_clinicas'),

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

        const catalogoTurnos =
          this.obtenerLista(datos.catalogoTurnos);

        const cierres =
          this.obtenerLista(datos.cierres);

        const pacientes =
          this.obtenerLista(datos.pacientes);

        const bitacoras =
          this.obtenerLista(datos.bitacoras);

        const signosVitales =
          this.obtenerLista(datos.signosVitales);

        const historiasClinicas =
          this.obtenerLista(datos.historiasClinicas);

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
          asignacionesHabitacion,
          periodo
        );
        // 2. CUMPLIMIENTO DE TURNOS
        this.calcularCumplimiento(
          turnos,
          catalogoTurnos,
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

        // 5. PUNTUALIDAD DE CUIDADORES
        this.calcularPuntualidad(turnos, catalogoTurnos, periodo);

        // 6. ESTADO GENERAL DE SALUD
        this.calcularEstadoGeneralSalud(
          pacientes,
          bitacoras,
          signosVitales,
          historiasClinicas,
          periodo
        );

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

        this.mostrarAlertaCarga(
          'Error al cargar el Dashboard',
          'No fue posible cargar la información del panel. Verifica tu conexión e inténtalo nuevamente.'
        );

        this.cargando = false;

        this.errorCarga = true;

        this.cd.detectChanges();

      }

    });

  }
  private calcularPuntualidad(
    turnos: any[],
    catalogoTurnos: any[],
    periodo: Periodo
  ): void {
    const ahora = new Date();
    const finMes = new Date(
      periodo.fin.getFullYear(),
      periodo.fin.getMonth(),
      periodo.fin.getDate(), 23, 59, 59, 999
    );

    // En meses futuros se conserva la estructura de la gráfica,
    // pero no se cuentan turnos ni llegadas.
    if (!periodo.finDatos) {
      this.cuidadoresPuntuales = 0;
      this.cuidadoresConRetraso = 0;
      this.totalRegistrosPuntualidad = 0;
      this.porcentajePuntualidad = 0;
      this.promedioRetraso = '—';
      const semanasVacias = [
        { etiqueta: 'Sem. 1', desde: 1, hasta: 7 },
        { etiqueta: 'Sem. 2', desde: 8, hasta: 14 },
        { etiqueta: 'Sem. 3', desde: 15, hasta: 21 },
        { etiqueta: 'Sem. 4', desde: 22, hasta: finMes.getDate() }
      ];
      this.graficaPuntualidadSemanal = semanasVacias.map((semana, indice) => ({
        ...semana,
        rango: `${semana.desde}–${semana.hasta}`,
        aTiempo: 0,
        conRetraso: 0,
        porcentaje: 0,
        x: 35 + indice * 90,
        y: 110
      }));
      this.rutaPuntualidad = '';
      this.areaPuntualidad = '';
      return;
    }
    const inicioMes = new Date(
      periodo.inicio.getFullYear(),
      periodo.inicio.getMonth(),
      periodo.inicio.getDate(), 0, 0, 0, 0
    );

    const semanas = [
      { etiqueta: 'Sem. 1', desde: 1, hasta: 7 },
      { etiqueta: 'Sem. 2', desde: 8, hasta: 14 },
      { etiqueta: 'Sem. 3', desde: 15, hasta: 21 },
      { etiqueta: 'Sem. 4', desde: 22, hasta: finMes.getDate() }
    ].map((semana, indice) => ({
      ...semana,
      rango: `${semana.desde}–${semana.hasta}`,
      aTiempo: 0,
      conRetraso: 0,
      porcentaje: 0,
      x: 35 + indice * 90,
      y: 110
    }));

    this.cuidadoresPuntuales = 0;
    this.cuidadoresConRetraso = 0;

    let totalLlegadasValidas = 0;
    let totalMinutosRetraso = 0;
    let cantidadLlegadasTardias = 0;
    let sinHorario = 0;

    turnos.forEach(turno => {
      const fechaProgramada = this.obtenerFechaProgramadaTurno(turno);
      if (!fechaProgramada || fechaProgramada < inicioMes || fechaProgramada > periodo.finDatos!) {
        return;
      }

      // Solo se evalúan turnos con llegada real registrada.
      if (!turno.fecha_hora_llegada) return;

      const llegada = new Date(turno.fecha_hora_llegada);
      if (Number.isNaN(llegada.getTime()) || llegada > ahora) return;

      const horario = this.obtenerHorarioProgramado(turno, catalogoTurnos);
      if (!horario) {
        sinHorario++;
        return;
      }

      // La tolerancia es de cinco minutos: hasta +5 min cuenta como puntual.
      const retrasoMinutos = Math.max(
        0,
        (llegada.getTime() - horario.inicio.getTime()) / 60000
      );
      const indiceSemana = Math.min(3, Math.floor((fechaProgramada.getDate() - 1) / 7));
      const semana = semanas[indiceSemana];

      totalLlegadasValidas++;
      if (retrasoMinutos <= 5) {
        semana.aTiempo++;
        this.cuidadoresPuntuales++;
      } else {
        semana.conRetraso++;
        this.cuidadoresConRetraso++;
        totalMinutosRetraso += retrasoMinutos;
        cantidadLlegadasTardias++;
      }
    });

    semanas.forEach(semana => {
      const totalSemana = semana.aTiempo + semana.conRetraso;
      semana.porcentaje = totalSemana > 0
        ? Math.round((semana.aTiempo / totalSemana) * 100)
        : 0;
      // Escala SVG: 0% en y=110 y 100% en y=25.
      semana.y = 110 - (semana.porcentaje * 0.85);
    });

    this.totalRegistrosPuntualidad = totalLlegadasValidas;
    this.porcentajePuntualidad = totalLlegadasValidas > 0
      ? Math.round((this.cuidadoresPuntuales / totalLlegadasValidas) * 100)
      : 0;
    this.promedioRetraso = cantidadLlegadasTardias > 0
      ? Math.round((totalMinutosRetraso / cantidadLlegadasTardias) * 10) / 10
      : '—';

    this.graficaPuntualidadSemanal = semanas;
    this.rutaPuntualidad = semanas
      .map((semana, indice) => `${indice === 0 ? 'M' : 'L'} ${semana.x} ${semana.y}`)
      .join(' ');
    this.areaPuntualidad = `${this.rutaPuntualidad} L 305 120 L 35 120 Z`;

    console.log('PUNTUALIDAD DE CUIDADORES:', {
      mesSeleccionado: this.mesSeleccionado,
      toleranciaMinutos: 5,
      totalLlegadasValidas,
      aTiempo: this.cuidadoresPuntuales,
      conRetraso: this.cuidadoresConRetraso,
      porcentajePuntualidad: this.porcentajePuntualidad,
      promedioRetraso: this.promedioRetraso,
      semanas,
      asignacionesSinHorario: sinHorario
    });

    if (sinHorario > 0) {
      console.warn(
        `${sinHorario} llegadas no se pudieron evaluar porque no se encontró la hora programada en el catálogo de turnos.`
      );
    }
  }
  /**
   * Devuelve la fecha de corte de la ocupación:
   * - Mes pasado: último instante de ese mes.
   * - Mes actual: momento actual.
   * - Mes futuro: null (todavía no hay ocupación que mostrar).
   */
  private obtenerFechaCorteOcupacion(periodo: Periodo): Date | null {

    const ahora = new Date();

    const inicioMesActual = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      1,
      0, 0, 0, 0
    );

    if (periodo.inicio > inicioMesActual) {
      return null;
    }

    const esMesActual =
      periodo.inicio.getFullYear() === ahora.getFullYear() &&
      periodo.inicio.getMonth() === ahora.getMonth();

    return esMesActual ? ahora : periodo.fin;
  }

  private calcularCapacidad(
    camas: any[],
    habitaciones: any[],
    asignacionesHabitacion: any[],
    periodo: Periodo
  ): void {

    // La capacidad se toma del catálogo de camas y habitaciones activas.
    // Estos modelos no contienen historial de altas/bajas de capacidad.
    const camasActivas = camas.filter(
      cama => cama.estado === true
    );

    this.capacidadMaxima = camasActivas.length;

    const idsCamasActivas = new Set<number>(
      camasActivas.map(cama => Number(cama.id_cama))
    );

    const habitacionesActivas = habitaciones.filter(
      habitacion => habitacion.estado === true
    );

    const idsHabitacionesActivas = new Set<number>(
      habitacionesActivas.map(
        habitacion => Number(habitacion.id_habitacion)
      )
    );

    const fechaCorte = this.obtenerFechaCorteOcupacion(periodo);

    const idsCamasOcupadas = new Set<number>();
    const idsHabitacionesOcupadas = new Set<number>();
    let asignacionesContadas = 0;

    // En meses futuros no se proyectan ocupaciones.
    if (fechaCorte !== null) {

      asignacionesHabitacion.forEach(asignacion => {

        if (!asignacion.fecha_inicio) {
          return;
        }

        const fechaInicio = new Date(asignacion.fecha_inicio);

        if (Number.isNaN(fechaInicio.getTime())) {
          return;
        }

        // La asignación debe haber comenzado antes o en la fecha de corte.
        if (fechaInicio > fechaCorte) {
          return;
        }

        const fechaFin = asignacion.fecha_fin
          ? new Date(asignacion.fecha_fin)
          : null;

        if (
          fechaFin !== null &&
          Number.isNaN(fechaFin.getTime())
        ) {
          return;
        }

        /*
         * La asignación se interpreta como un intervalo [inicio, fin):
         * - Si tiene fecha_fin, ocupa hasta antes de ese instante.
         * - Si no tiene fecha_fin, solo se considera abierta si estado=true.
         *
         * No filtramos por el estado actual del paciente: un paciente
         * puede estar inactivo hoy y haber ocupado una cama en meses pasados.
         * Tampoco exigimos estado=true a asignaciones cerradas, porque
         * necesitamos conservarlas para reconstruir el historial.
         */
        const ocupaEnFechaCorte = fechaFin
          ? fechaFin > fechaCorte
          : asignacion.estado === true;

        if (!ocupaEnFechaCorte) {
          return;
        }

        const camaId = this.idRelacion(asignacion.id_cama);
        const habitacionId = this.idRelacion(asignacion.id_habitacion);

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

        if (camaId !== null || habitacionId !== null) {
          asignacionesContadas++;
        }

      });

    }

    // Resultados del corte seleccionado.
    this.camasOcupadas = idsCamasOcupadas.size;
    this.habitacionesOcupadas = idsHabitacionesOcupadas.size;

    this.camasDisponibles = Math.max(
      this.capacidadMaxima - this.camasOcupadas,
      0
    );

    this.habitacionesDisponibles = Math.max(
      habitacionesActivas.length - this.habitacionesOcupadas,
      0
    );

    this.pacientesActuales = this.camasOcupadas;

    this.porcentajeOcupacion =
      this.capacidadMaxima > 0
        ? Math.round(
          (this.camasOcupadas / this.capacidadMaxima) * 100
        )
        : 0;

    const radio = 42;
    const circunferencia = 2 * Math.PI * radio;
    const ocupado =
      (this.porcentajeOcupacion / 100) * circunferencia;
    const restante = circunferencia - ocupado;

    this.ocupacionDashArray = `${ocupado} ${restante}`;

    console.log('OCUPACIÓN HISTÓRICA DEL CENTRO:', {
      mesSeleccionado: this.mesSeleccionado,
      fechaCorte: fechaCorte?.toISOString() ?? 'Mes futuro: sin datos',
      camasOcupadas: this.camasOcupadas,
      camasDisponibles: this.camasDisponibles,
      habitacionesOcupadas: this.habitacionesOcupadas,
      habitacionesDisponibles: this.habitacionesDisponibles,
      asignacionesContadas,
      porcentaje: this.porcentajeOcupacion
    });

  }

  // =====================================================
  // 3. CUMPLIMIENTO DE TURNOS
  // =====================================================

  /**
   * Obtiene la fecha programada de la asignación.
   * No se usa created_at como sustituto: la fecha de creación del
   * registro no necesariamente es la fecha en que debe cumplirse el turno.
   */
  private obtenerFechaProgramadaTurno(turno: any): Date | null {
    const posiblesFechas = [
      turno.fecha,
      turno.fecha_turno,
      turno.fecha_asignacion,
      turno.fecha_programada,
      turno.fecha_inicio_programada,
      turno.fecha_hora_inicio
    ];

    for (const valor of posiblesFechas) {
      if (!valor) continue;

      // Los campos Date del backend suelen llegar como YYYY-MM-DD.
      // Se construyen en hora local para evitar que UTC los desplace al día anterior.
      const textoFecha = String(valor);
      const soloFecha = textoFecha.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const fecha = soloFecha
        ? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]), 0, 0, 0, 0)
        : new Date(valor);
      if (!Number.isNaN(fecha.getTime())) {
        return fecha;
      }
    }

    return null;
  }

  /**
   * Obtiene la definición del turno (Diurno/Nocturno) y construye
   * el intervalo real. Si la hora fin es menor o igual a la de inicio,
   * se entiende que el turno termina al día siguiente (p. ej. 19:00–07:00).
   */
  private obtenerHorarioProgramado(
    turno: any,
    catalogoTurnos: any[]
  ): { inicio: Date; fin: Date } | null {
    const fechaBase = this.obtenerFechaProgramadaTurno(turno);
    if (!fechaBase) return null;

    const idTurno = this.idRelacion(turno.id_turno);
    const definicion = catalogoTurnos.find(
      item => Number(item.id_turno) === idTurno
    );

    if (!definicion?.hora_inicio || !definicion?.hora_fin) {
      return null;
    }

    const parsearHora = (valor: string): number[] | null => {
      const partes = String(valor).split(':').map(Number);
      if (
        partes.length < 2 ||
        partes.length > 3 ||
        partes.some(n => !Number.isFinite(n)) ||
        partes[0] < 0 || partes[0] > 23 ||
        partes[1] < 0 || partes[1] > 59 ||
        (partes[2] ?? 0) < 0 || (partes[2] ?? 0) > 59
      ) {
        return null;
      }
      return partes;
    };

    const horaInicio = parsearHora(definicion.hora_inicio);
    const horaFin = parsearHora(definicion.hora_fin);
    if (!horaInicio || !horaFin) return null;

    const inicio = new Date(fechaBase);
    inicio.setHours(
      horaInicio[0], horaInicio[1], horaInicio[2] ?? 0, 0
    );

    const fin = new Date(fechaBase);
    fin.setHours(
      horaFin[0], horaFin[1], horaFin[2] ?? 0, 0
    );

    // Turno nocturno: termina al día siguiente.
    if (fin.getTime() <= inicio.getTime()) {
      fin.setDate(fin.getDate() + 1);
    }

    return { inicio, fin };
  }

  private calcularCumplimiento(
    turnos: any[],
    catalogoTurnos: any[],
    cierres: any[],
    periodo: Periodo
  ): void {
    const ahora = new Date();

    // Solo se incluyen asignaciones cuya fecha programada pertenece al mes elegido.
    const turnosPeriodo = turnos.filter(turno => {
      const fecha = this.obtenerFechaProgramadaTurno(turno);
      return periodo.finDatos !== null &&
        fecha !== null &&
        fecha >= periodo.inicio &&
        fecha <= periodo.finDatos;
    });

    const idsCerrados = new Set<number>(
      cierres
        .map(cierre =>
          this.idRelacion(cierre.id_asignacion_turno_usuario)
        )
        .filter((id): id is number => id !== null)
    );

    this.turnosAsignados = 0;
    this.turnosEnCurso = 0;
    this.turnosFinalizados = 0;
    this.turnosNoCumplidos = 0;

    turnosPeriodo.forEach(turno => {
      const idAsignacion = this.idRelacion(
        turno.id_asignacion_turno_usuario ?? turno.id
      );

      const estado = this.normalizarEstado(turno.estado);
      const horario = this.obtenerHorarioProgramado(
        turno,
        catalogoTurnos
      );

      const llegadaValor = turno.fecha_hora_llegada;
      const fechaLlegada = llegadaValor
        ? new Date(llegadaValor)
        : null;

      const tieneLlegada =
        fechaLlegada !== null &&
        !Number.isNaN(fechaLlegada.getTime()) &&
        fechaLlegada <= ahora;

      const tieneCierre =
        idAsignacion !== null && idsCerrados.has(idAsignacion);

      const finalizado =
        tieneCierre ||
        estado === 'finalizado' ||
        estado === 'finalizado con exito';

      // El cierre tiene prioridad: nunca permanece como asignado/en curso.
      if (finalizado) {
        this.turnosFinalizados++;
        return;
      }

      // Con llegada registrada, se considera en curso hasta registrar cierre.
      if (tieneLlegada) {
        this.turnosEnCurso++;
        return;
      }

      /*
       * Sin llegada y sin cierre:
       * - Antes de que termine el horario programado: sigue asignado/vigente.
       * - Después de la hora de fin: queda como no cumplido.
       * - Si no se puede determinar el horario por falta de datos, no se
       *   marca como incumplido; permanece asignado y se deja advertencia.
       */
      if (horario && ahora.getTime() > horario.fin.getTime()) {
        this.turnosNoCumplidos++;
      } else {
        this.turnosAsignados++;
      }
    });

    const total = turnosPeriodo.length;

    this.totalTurnosProgramados = total;

    this.porcentajeTurnosAsignados = total
      ? (this.turnosAsignados / total) * 100
      : 0;

    this.porcentajeTurnosEnCurso = total
      ? (this.turnosEnCurso / total) * 100
      : 0;

    this.porcentajeTurnosFinalizados = total
      ? (this.turnosFinalizados / total) * 100
      : 0;

    this.porcentajeTurnosNoCumplidos = total
      ? (this.turnosNoCumplidos / total) * 100
      : 0;

    const asignacionesSinHorario = turnosPeriodo.filter(turno =>
      !this.obtenerHorarioProgramado(turno, catalogoTurnos)
    );

    console.log('CUMPLIMIENTO DE TURNOS:', {
      mesSeleccionado: this.mesSeleccionado,
      total,
      asignados: this.turnosAsignados,
      enCurso: this.turnosEnCurso,
      finalizados: this.turnosFinalizados,
      noCumplidos: this.turnosNoCumplidos,
      porcentajeAsignados: this.porcentajeTurnosAsignados,
      porcentajeEnCurso: this.porcentajeTurnosEnCurso,
      porcentajeFinalizados: this.porcentajeTurnosFinalizados,
      porcentajeNoCumplidos: this.porcentajeTurnosNoCumplidos,
      asignacionesSinHorario: asignacionesSinHorario.slice(0, 10),
      muestraAsignaciones: turnosPeriodo.slice(0, 10)
    });

    if (asignacionesSinHorario.length) {
      console.warn(
        'Algunas asignaciones no tienen fecha programada o id_turno/hora_inicio/hora_fin reconocibles. No se clasificaron como no cumplidas para evitar falsos incumplimientos.',
        asignacionesSinHorario
      );
    }
  }

  private calcularEstadoGeneralSalud(
    pacientes: any[],
    bitacoras: any[],
    signosVitales: any[],
    historiasClinicas: any[],
    periodo: Periodo
  ): void {

    const COLORES = {
      criticos: '#E94B64',
      estables: '#75B8ED',
      vacio: '#edf1f7'
    };

    const conteo = {
      criticos: 0,
      estables: 0
    };

    const pacientesEvaluados: any[] = [];
    const pacientesPendientes: any[] = [];

    const obtenerFecha = (registro: any): number => {
      const valor =
        registro?.fecha_hora ??
        registro?.fecha ??
        registro?.fecha_apertura;

      if (!valor) return 0;

      const fecha = new Date(valor).getTime();

      return Number.isNaN(fecha) ? 0 : fecha;
    };

    // 1. Pacientes activos pertenecientes a la sede del administrador.
    const pacientesDeSede = pacientes.filter(paciente => {

      const idSedePaciente = this.idRelacion(
        paciente?.id_sede ??
        paciente?.id_sede_id ??
        paciente?.sede_id ??
        paciente?.sede
      );

      return (
        this.idSedeUsuario !== null &&
        idSedePaciente === this.idSedeUsuario &&
        paciente?.estado !== false
      );
    });

    // 2. Crear índice de bitácoras para encontrar el paciente.
    const bitacorasPorId = new Map<number, any>();

    bitacoras.forEach(bitacora => {

      const id = Number(bitacora?.id_bitacora);

      if (Number.isFinite(id)) {
        bitacorasPorId.set(id, bitacora);
      }

    });

    // 3. Agrupar los signos vitales por paciente.
    const signosPorPaciente = new Map<number, any[]>();

    signosVitales.forEach(signo => {

      const idBitacora = this.idRelacion(signo?.id_bitacora);

      if (idBitacora === null) return;

      const bitacora = bitacorasPorId.get(idBitacora);

      if (!bitacora) return;

      const idPaciente = this.idRelacion(bitacora.id_paciente);

      if (idPaciente === null) return;

      // Respetar el mes seleccionado.
      if (!this.estaEnPeriodo(
        signo?.fecha_hora ?? signo?.fecha,
        periodo
      )) {
        return;
      }

      if (!signosPorPaciente.has(idPaciente)) {
        signosPorPaciente.set(idPaciente, []);
      }

      signosPorPaciente.get(idPaciente)!.push({
        ...signo,
        id_paciente_resuelto: idPaciente
      });

    });

    // 4. Evaluar el último registro de cada paciente.
    pacientesDeSede.forEach(paciente => {

      const idPaciente = Number(paciente?.id_paciente);

      if (!Number.isFinite(idPaciente)) return;

      const nombre =
        `${paciente.nombre ?? ''} ${paciente.apellido ?? ''}`.trim() ||
        `Paciente ${idPaciente}`;

      // Debe existir una historia clínica activa.
      const historia = historiasClinicas
        .filter(item =>
          this.idRelacion(item?.id_paciente) === idPaciente &&
          item?.estado !== false
        )
        .sort((a, b) => obtenerFecha(b) - obtenerFecha(a))[0] ?? null;

      // Obtener todos los signos vitales del paciente.
      const registrosPaciente =
        signosPorPaciente.get(idPaciente) ?? [];

      // Si no hay historia o signos, no se clasifica.
      if (!historia || registrosPaciente.length === 0) {

        pacientesPendientes.push({
          id_paciente: idPaciente,
          nombre,
          motivo: !historia
            ? 'No tiene historia clínica.'
            : 'No tiene registros de signos vitales.'
        });

        return;
      }

      // Ordenar del más reciente al más antiguo.
      registrosPaciente.sort(
        (a, b) => obtenerFecha(b) - obtenerFecha(a)
      );

      // Último registro real del paciente.
      const ultimoSigno = registrosPaciente[0];

      // Leer la alerta generada por el backend.
      const alertaGenerada =
        String(ultimoSigno.alerta_generada ?? '').trim();

      const tieneAlerta = alertaGenerada.length > 0;

      // 5. Clasificación definitiva.
      const clasificacion = tieneAlerta
        ? 'Críticos'
        : 'Estables';

      if (tieneAlerta) {
        conteo.criticos++;
      } else {
        conteo.estables++;
      }

      const idBitacora = this.idRelacion(ultimoSigno.id_bitacora);

      const bitacora = idBitacora !== null
        ? bitacorasPorId.get(idBitacora)
        : null;

      pacientesEvaluados.push({

        id_paciente: idPaciente,
        nombre,

        id_historia_clinica: historia.id_historia_clinica,

        id_bitacora: idBitacora,

        id_signos_vitales: ultimoSigno.id_signos_vitales,

        fecha_ultimo_registro:
          ultimoSigno.fecha_hora ?? ultimoSigno.fecha,

        tipo_registro: bitacora?.tipo_registro ?? '',

        descripcion: bitacora?.descripcion ?? '',

        alerta_generada: alertaGenerada || null,

        signos_vitales: ultimoSigno,

        clasificacion

      });

    });

    // 6. Actualizar indicadores.
    this.totalPacientesEvaluados = pacientesEvaluados.length;

    const total = this.totalPacientesEvaluados;

    this.estadosSalud = [
      {
        nombre: 'Críticos',
        cantidad: conteo.criticos,
        icono: 'warning',
        clase: 'critical-health',
        porcentaje: total > 0
          ? Math.round((conteo.criticos / total) * 100)
          : 0
      },
      {
        nombre: 'Estables',
        cantidad: conteo.estables,
        icono: 'favorite',
        clase: 'nominal-health',
        porcentaje: total > 0
          ? Math.round((conteo.estables / total) * 100)
          : 0
      }
    ];

    // 7. Actualizar gráfica circular.
    if (total === 0) {

      this.saludGrafico =
        `conic-gradient(${COLORES.vacio} 0deg 360deg)`;

    } else {

      const gradosCriticos =
        (conteo.criticos / total) * 360;

      this.saludGrafico = `conic-gradient(
      ${COLORES.criticos} 0deg ${gradosCriticos}deg,
      ${COLORES.estables} ${gradosCriticos}deg 360deg
    )`;

    }

    // 8. Consola de verificación.
    console.log(
      'ESTADO GENERAL DE SALUD - CLASIFICACIÓN POR ÚLTIMA ALERTA:',
      {
        sedeAdministrador: this.idSedeUsuario,
        mesSeleccionado: this.mesSeleccionado,

        pacientesRecibidos: pacientes.length,
        pacientesDeLaSede: pacientesDeSede.length,

        historiasClinicasRecibidas: historiasClinicas.length,
        bitacorasRecibidas: bitacoras.length,
        signosVitalesRecibidos: signosVitales.length,

        pacientesClasificados: total,

        conteo,

        pacientesPendientes,

        detalle: pacientesEvaluados
      }
    );

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
      periodo.finDatos === null
        ? []
        : asignaciones.filter(asignacion => {

          const estado =
            this.normalizarEstado(asignacion.estado);

          const inicio =
            new Date(asignacion.fecha_inicio);

          const fin = asignacion.fecha_fin
            ? new Date(asignacion.fecha_fin)
            : null;

          if (Number.isNaN(inicio.getTime())) {
            return false;
          }

          // Para meses históricos también cuentan asignaciones ya cerradas,
          // siempre que su intervalo se cruce con el mes consultado.
          // Una asignación abierta solo cuenta si continúa activa.
          if (!fin && estado !== 'activo' && asignacion.estado !== true) {
            return false;
          }

          return (
            inicio <= periodo.finDatos! &&
            (!fin || (!Number.isNaN(fin.getTime()) && fin >= periodo.inicio))
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
console.log('CLAVES DE SEDE Y USUARIO');

Object.keys(localStorage)
  .filter(k => /usuario|sede|perfil/i.test(k))
  .forEach(k => {
    const valor = localStorage.getItem(k);

    if (/token|password/i.test(k)) return;

    console.log(k, valor);
  });

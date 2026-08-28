import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Mes {
  nombre: string;
  activo: boolean;
}

interface Paciente {
  nombre: string;
  habitacion: string;
  documento: string;
  iniciales: string;
  estado: string;
  cuidador: string;
  avatarClass: string;
  badgeClass: string;
  colorEstado: string;
}

interface Cuidador {
  nombre: string;
  iniciales: string;
  especialidad: string;
  estado: string;
  turno: string;
  pacientes: number;
  estadoClase: string;
  badgeClass: string;
}

interface Turno {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  cuidadores: number;
}

interface EstadoSalud {
  nombre: string;
  cantidad: number;
  icono: string;
  clase: string;
}

interface IndicadorBienestar {
  nombre: string;
  porcentaje: number;
  icono: string;
  iconoClase: string;
  valorClase: string;
  progresoClase: string;
}

interface PuntoTendencia {
  x: number;
  y: number;
}

interface MesTendencia {
  nombre: string;
  activo: boolean;
}

interface Alerta {
  titulo: string;
  descripcion: string;
  tiempo: string;
  icono: string;
  clase: string;
  noLeida: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  // =====================================================
  // INFORMACIÓN GENERAL
  // =====================================================

  nombreAdministrador = '';

  nombreFundacion = '';

  fechaActual = '';

  mesActual = '';


  // =====================================================
  // MESES
  // =====================================================

  meses: Mes[] = [];

  progresoMes = 0;


  // =====================================================
  // PACIENTES
  // =====================================================

  totalPacientes = 0;

  pacientesActuales = 0;

  capacidadMaxima = 0;

  porcentajeOcupacion = 0;

  pacientesEstables = 0;

  pacientesCriticos = 0;

  altasDelMes = 0;

  porcentajeEstables = 0;

  porcentajeCriticos = 0;

  porcentajeAltas = 0;

  pacientesRecientes: Paciente[] = [];


  // =====================================================
  // CUIDADORES
  // =====================================================

  totalCuidadores = 0;

  cuidadoresEnTurno = 0;

  cuidadoresLibres = 0;

  ingresosCuidadores = 0;

  ratioCuidadorPaciente = '0 : 0';

  cuidadores: Cuidador[] = [];


  // =====================================================
  // OCUPACIÓN
  // =====================================================

  metaOcupacion = 0;

  ocupacionDashArray = '0 264';


  // =====================================================
  // TURNO ACTUAL
  // =====================================================

  turnoActual: Turno = {
    nombre: '',
    horaInicio: '',
    horaFin: '',
    cuidadores: 0
  };


  // =====================================================
  // ESTADOS DE SALUD
  // =====================================================

  estadosSalud: EstadoSalud[] = [];


  // =====================================================
  // TENDENCIA
  // =====================================================

  tendenciaTexto = '';

  mesesTendencia: MesTendencia[] = [];

  puntosTendencia: PuntoTendencia[] = [];

  tendenciaLinePath = '';

  tendenciaAreaPath = '';


  // =====================================================
  // INDICADORES DE BIENESTAR
  // =====================================================

  indicadoresBienestar: IndicadorBienestar[] = [];


  // =====================================================
  // ALERTAS
  // =====================================================

  alertasSinLeer = 0;

  totalAlertas = 0;

  alertasCriticas = 0;

  alertasAvisos = 0;

  alertasInfo = 0;

  alertas: Alerta[] = [];


  // =====================================================
  // INICIO
  // =====================================================

  ngOnInit(): void {
    this.obtenerFechaActual();
  }


  // =====================================================
  // FECHA ACTUAL
  // =====================================================

  private obtenerFechaActual(): void {

    const fecha = new Date();

    this.fechaActual = fecha.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    this.mesActual = fecha.toLocaleDateString('es-CO', {
      month: 'long'
    });

  }


  // =====================================================
  // CÁLCULO DE OCUPACIÓN
  // =====================================================

  private calcularPorcentajeOcupacion(): void {

    if (this.capacidadMaxima <= 0) {
      this.porcentajeOcupacion = 0;
      return;
    }

    this.porcentajeOcupacion =
      Math.round(
        (this.pacientesActuales / this.capacidadMaxima) * 100
      );

    this.porcentajeOcupacion =
      Math.min(this.porcentajeOcupacion, 100);

    this.actualizarOcupacionGrafica();

  }


  // =====================================================
  // GRÁFICA DE OCUPACIÓN
  // =====================================================

  private actualizarOcupacionGrafica(): void {

    const circunferencia = 264;

    const porcentaje =
      Math.max(0, Math.min(this.porcentajeOcupacion, 100));

    const progreso =
      (porcentaje / 100) * circunferencia;

    const restante =
      circunferencia - progreso;

    this.ocupacionDashArray =
      `${progreso} ${restante}`;

  }


  // =====================================================
  // CÁLCULO DE PORCENTAJES DE PACIENTES
  // =====================================================

  private calcularPorcentajesPacientes(): void {

    if (this.totalPacientes <= 0) {
      this.porcentajeEstables = 0;
      this.porcentajeCriticos = 0;
      this.porcentajeAltas = 0;
      return;
    }

    this.porcentajeEstables =
      Math.round(
        (this.pacientesEstables / this.totalPacientes) * 100
      );

    this.porcentajeCriticos =
      Math.round(
        (this.pacientesCriticos / this.totalPacientes) * 100
      );

    this.porcentajeAltas =
      Math.round(
        (this.altasDelMes / this.totalPacientes) * 100
      );

  }


  // =====================================================
  // CÁLCULO DEL RATIO CUIDADOR / PACIENTE
  // =====================================================

  private calcularRatioCuidadorPaciente(): void {

    if (this.totalCuidadores <= 0) {
      this.ratioCuidadorPaciente = '0 : 0';
      return;
    }

    this.ratioCuidadorPaciente =
      `1 : ${Math.ceil(
        this.totalPacientes / this.totalCuidadores
      )}`;

  }


  // =====================================================
  // GRÁFICA DE TENDENCIA
  // =====================================================

  private generarGraficaTendencia(): void {

    if (this.puntosTendencia.length === 0) {
      this.tendenciaLinePath = '';
      this.tendenciaAreaPath = '';
      return;
    }

    this.tendenciaLinePath =
      this.puntosTendencia
        .map((punto, index) => {

          const comando =
            index === 0 ? 'M' : 'L';

          return `${comando}${punto.x},${punto.y}`;

        })
        .join(' ');

    const primerPunto =
      this.puntosTendencia[0];

    const ultimoPunto =
      this.puntosTendencia[
        this.puntosTendencia.length - 1
      ];

    this.tendenciaAreaPath = `
      ${this.tendenciaLinePath}
      L${ultimoPunto.x},100
      L${primerPunto.x},100
      Z
    `;

  }

}
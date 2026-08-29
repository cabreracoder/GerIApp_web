import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Mes {
  nombre: string;
  activo: boolean;
}

interface PacienteReciente {
  iniciales: string;
  nombre: string;
  habitacion: string;
  documento: string;
  estado: string;
  badgeClass: string;
  avatarClass: string;
  colorEstado: string;
  cuidador: string;
}

interface Cuidador {
  iniciales: string;
  nombre: string;
  especialidad: string;
  estado: string;
  estadoClase: string;
  badgeClass: string;
  turno: string;
  pacientes: number;
}

interface EstadoSalud {
  nombre: string;
  cantidad: number;
  icono: string;
  clase: string;
}

interface MesTendencia {
  nombre: string;
  activo: boolean;
}

interface PuntoTendencia {
  x: number;
  y: number;
}

interface IndicadorBienestar {
  nombre: string;
  icono: string;
  iconoClase: string;
  porcentaje: number;
  valorClase: string;
  progresoClase: string;
}

interface Alerta {
  titulo: string;
  descripcion: string;
  tiempo: string;
  icono: string;
  clase: string;
  noLeida: boolean;
}

interface Turno {
  nombre: string;
  horaInicio: string;
  horaFin: string;
  cuidadores: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  /* =====================================================
     INFORMACIÓN DEL DASHBOARD
  ===================================================== */

  fechaActual = '';
  nombreAdministrador = '';
  nombreFundacion = '';

  mesActual = '';

  /* =====================================================
     PACIENTES
  ===================================================== */

  totalPacientes = 0;
  pacientesActuales = 0;
  capacidadMaxima = 0;

  pacientesEstables = 0;
  pacientesCriticos = 0;
  altasDelMes = 0;

  porcentajeOcupacion = 0;
  porcentajeEstables = 0;
  porcentajeCriticos = 0;
  porcentajeAltas = 0;

  progresoMes = 0;

  meses: Mes[] = [];

  pacientesRecientes: PacienteReciente[] = [];

  /* =====================================================
     CUIDADORES
  ===================================================== */

  totalCuidadores = 0;
  cuidadoresEnTurno = 0;
  cuidadoresLibres = 0;
  ingresosCuidadores = 0;

  cuidadores: Cuidador[] = [];

  ratioCuidadorPaciente = '—';

  /* =====================================================
     OCUPACIÓN
  ===================================================== */

  metaOcupacion = 0;

  turnoActual: Turno = {
    nombre: '',
    horaInicio: '',
    horaFin: '',
    cuidadores: 0
  };

  ocupacionDashArray = '0 263.89';

  /* =====================================================
     ANÁLISIS DE SALUD
  ===================================================== */

  estadosSalud: EstadoSalud[] = [];

  /* =====================================================
     TENDENCIA
  ===================================================== */

  tendenciaTexto = '—';

  mesesTendencia: MesTendencia[] = [];

  puntosTendencia: PuntoTendencia[] = [];

  tendenciaLinePath = '';

  tendenciaAreaPath = '';

  /* =====================================================
     INDICADORES DE BIENESTAR
  ===================================================== */

  indicadoresBienestar: IndicadorBienestar[] = [];

  /* =====================================================
     ALERTAS
  ===================================================== */

  alertasSinLeer = 0;
  totalAlertas = 0;

  alertasCriticas = 0;
  alertasAvisos = 0;
  alertasInfo = 0;

  alertas: Alerta[] = [];

  /* =====================================================
     INICIO
  ===================================================== */

  ngOnInit(): void {
    this.cargarFechaActual();
    this.calcularOcupacion();
  }

  /* =====================================================
     FECHA ACTUAL
  ===================================================== */

  private cargarFechaActual(): void {
    const fecha = new Date();

    this.fechaActual = fecha.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    this.mesActual = fecha.toLocaleDateString('es-CO', {
      month: 'long'
    });

    this.mesActual =
      this.mesActual.charAt(0).toUpperCase() +
      this.mesActual.slice(1);
  }

  /* =====================================================
     CÁLCULO DE OCUPACIÓN
  ===================================================== */

  private calcularOcupacion(): void {

    if (this.capacidadMaxima <= 0) {
      this.porcentajeOcupacion = 0;
      this.ocupacionDashArray = '0 263.89';
      return;
    }

    this.porcentajeOcupacion = Math.round(
      (this.pacientesActuales / this.capacidadMaxima) * 100
    );

    const radio = 42;
    const circunferencia = 2 * Math.PI * radio;

    const porcentaje = Math.min(
      Math.max(this.porcentajeOcupacion, 0),
      100
    );

    const ocupado =
      (porcentaje / 100) * circunferencia;

    const restante =
      circunferencia - ocupado;

    this.ocupacionDashArray =
      `${ocupado} ${restante}`;
  }
}
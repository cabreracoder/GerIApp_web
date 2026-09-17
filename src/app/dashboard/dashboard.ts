
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
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
  imports: [CommonModule, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})


export class DashboardComponent implements OnInit {

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';
  /* =====================================================
     INFORMACIÓN DEL DASHBOARD
  ===================================================== */

  fechaActual = '';

  usuario = {
    nombres: ''
  };

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
  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private cd: ChangeDetectorRef

  ) { }

  /* =====================================================
     INICIO
  ===================================================== */

  ngOnInit(): void {

    // Cargar el usuario que inició sesión
    this.cargarUsuario();

    // Cargar fecha actual
    this.cargarFechaActual();

    //calcular pacientes
    this.cargarPacientes();
    this.cargarCuidadores();




  }


  /* =====================================================
     CARGAR USUARIO AUTENTICADO
  ===================================================== */

  private cargarUsuario(): void {

    const usuarioGuardado = localStorage.getItem('usuario');

    // Verificar si existe un usuario guardado
    if (!usuarioGuardado) {

      console.warn(
        'No hay un usuario guardado en localStorage.'
      );

      return;
    }

    try {

      // Convertir el texto almacenado en objeto
      const usuario = JSON.parse(usuarioGuardado);

      // Cargar los datos del usuario
      this.usuario = {
        nombres: usuario.nombres ?? ''
      };

      console.log(
        'Usuario cargado en el Dashboard:',
        this.usuario
      );

    } catch (error) {

      console.error(
        'Error al leer el usuario de localStorage:',
        error
      );

    }
  }


  /* =====================================================
     FECHA ACTUAL
  ===================================================== */

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

    this.mesActual = fecha.toLocaleDateString(
      'es-CO',
      {
        month: 'long'
      }
    );

    this.mesActual =
      this.mesActual.charAt(0).toUpperCase() +
      this.mesActual.slice(1);
  }


  /* =====================================================
      CARGAR PACIENTES DESDE API
 ===================================================== */

  private cargarPacientes(): void {

    this.http.get<any[]>(
      `${this.apiUrl}/pacientes/`
    )
      .subscribe({

        next: (pacientes) => {

          const activos = pacientes.filter(
            paciente => paciente.estado === true
          );

          const inactivos = pacientes.filter(
            paciente => paciente.estado === false
          );


          this.totalPacientes = activos.length;

          this.pacientesActuales = activos.length;

          this.altasDelMes = inactivos.length;
          this.calcularOcupacion();

          this.cd.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error cargando pacientes:',
            error
          );

        }

      });

  }
  private cargarCuidadores(): void {

    this.http.get<any[]>(
      `${this.apiUrl}/usuarios/`
    )
      .subscribe({

        next: (usuarios) => {


          const cuidadores = usuarios.filter(
            usuario => usuario.id_rol === 5
          );


          // Total registrados
          this.totalCuidadores =
            cuidadores.length;



          // Ingresos del mes actual
          const fechaActual = new Date();

          this.ingresosCuidadores =
            cuidadores.filter(cuidador => {

              if (!cuidador.fecha_ingreso) {
                return false;
              }


              const fechaIngreso =
                new Date(cuidador.fecha_ingreso);


              return (
                fechaIngreso.getMonth() === fechaActual.getMonth() &&
                fechaIngreso.getFullYear() === fechaActual.getFullYear()
              );

            }).length;



          this.cd.detectChanges();

        },


        error: (error) => {

          console.error(
            'Error cargando cuidadores:',
            error
          );

        }

      });

  }
  private calcularOcupacion(): void {

    if (this.capacidadMaxima <= 0) {

      this.porcentajeOcupacion = 0;

      this.ocupacionDashArray = '0 263.89';

      return;
    }


    this.porcentajeOcupacion = Math.round(
      (
        this.pacientesActuales /
        this.capacidadMaxima
      ) * 100
    );


    const radio = 42;

    const circunferencia =
      2 * Math.PI * radio;


    const porcentaje = Math.min(
      Math.max(
        this.porcentajeOcupacion,
        0
      ),
      100
    );


    const ocupado =
      (porcentaje / 100) *
      circunferencia;


    const restante =
      circunferencia -
      ocupado;


    this.ocupacionDashArray =
      `${ocupado} ${restante}`;

  }

}


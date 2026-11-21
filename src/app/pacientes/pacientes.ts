import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
// =====================================================
// ALERTAS
// =====================================================
type Tono = 'rojo' | 'ambar' | 'azul' | 'verde';
const TONOS: Record<Tono, { panel: string; boton: string }> = {
  rojo: {
    panel: 'bg-linear-to-b from-red-500 to-red-700',
    boton: 'bg-red-600 hover:bg-red-700'
  },
  ambar: {
    panel: 'bg-linear-to-b from-amber-500 to-amber-700',
    boton: 'bg-amber-600 hover:bg-amber-700'
  },
  azul: {
    panel: 'bg-linear-to-b from-blue-500 to-blue-700',
    boton: 'bg-blue-600 hover:bg-blue-700'
  },
  verde: {
    panel: 'bg-linear-to-b from-emerald-500 to-emerald-700',
    boton: 'bg-emerald-600 hover:bg-emerald-700'
  }
};
const svgIcono = (trazos: string): string =>
  `<svg class="h-11 w-11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</svg>`;
const ICONOS = {
  papelera: svgIcono(
    '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>'
  ),
  prohibido: svgIcono(
    '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'
  ),
  lapiz: svgIcono(
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>'
  ),
  check: svgIcono(
    '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'
  ),
  equis: svgIcono(
    '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'
  ),
  alerta: svgIcono(
    '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'
  )
};
function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function inicialesAlerta(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) {
    return '?';
  }
  if (partes.length === 1) {
    return partes[0].slice(0, 2).toUpperCase();
  }
  return (
    partes[0][0] +
    partes[partes.length - 1][0]
  ).toUpperCase();
}
interface ConfigAlerta {
  tono: Tono;
  icono: 'warning' | 'question' | 'success' | 'error';
  iconoSvg: string;
  titulo: string;
  html?: string;
  confirmar: string;
  cancelar?: string;
  confirmarIzquierda?: boolean;
  enfocarCancelar?: boolean;
  autoCerrar?: boolean;
}
function mostrarAlerta(c: ConfigAlerta) {
  const conBotones = !c.autoCerrar;
  const conCancelar = !!c.cancelar;

  return Swal.fire({
    html: `
      <div class="geri-alerta">
        <div class="geri-alerta__onda"></div>

        <div class="geri-alerta__contenido">
          <img
            src="/Logo-GerIApp.png"
            class="geri-alerta__logo"
            alt="GeriApp"
            onerror="this.style.display='none'"
          >

          ${c.autoCerrar && c.icono === 'success'
        ? '<div class="geri-alerta__check">✓</div>'
        : ''}
       <h2
  class="geri-alerta__titulo"
  style="
    font-weight: 900 !important;
    -webkit-text-stroke: 0.5px currentColor;
  "
>
  ${escaparHtml(c.titulo)}
</h2>
          ${c.html
        ? `<div class="geri-alerta__mensaje">${c.html}</div>`
        : ''}
        </div>
      </div>
    `,

    showConfirmButton: conBotones,
    showCancelButton: conCancelar,
    confirmButtonText: c.confirmar,
    cancelButtonText: c.cancelar,
    reverseButtons: !c.confirmarIzquierda,
    focusCancel: !!c.enfocarCancelar,
    timer: c.autoCerrar ? 1800 : undefined,

    buttonsStyling: false,
    backdrop: 'rgba(15, 23, 42, 0.65)',

    customClass: {
      popup: 'geri-swal-popup',
      htmlContainer: 'geri-swal-html',
      actions: 'geri-swal-actions',
      confirmButton: `geri-swal-btn geri-swal-btn--${c.tono}`,
      cancelButton: 'geri-swal-btn geri-swal-btn--cancelar'
    }
  });
}
function alertaConfirmar(c: {
  tono: Tono;
  icono: 'warning' | 'question';
  iconoSvg: string;
  verbo: string;
  entidad: string;
  nombre: string;
  subtitulo: string;
  confirmar: string;
  confirmarIzquierda?: boolean;
  enfocarCancelar?: boolean;
}) {
  const html = `
    <p class="m-0 text-[1.1rem] leading-snug text-slate-400">
      ${escaparHtml(c.subtitulo)}
    </p>
    <div class="mt-4 flex items-center gap-3.5">
      <span class="flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
        ${escaparHtml(inicialesAlerta(c.nombre))}
      </span>
      <p class="m-0 text-[1.15rem] leading-snug text-slate-700">
        ¿${c.verbo} a
        <strong class="font-bold">
          ${escaparHtml(c.nombre)}
        </strong>?
      </p>
    </div>
  `;
  return mostrarAlerta({
    tono: c.tono,
    icono: c.icono,
    iconoSvg: c.iconoSvg,
    titulo: `${c.verbo} ${c.entidad}`,
    html,
    confirmar: c.confirmar,
    cancelar: 'Cancelar',
    confirmarIzquierda: c.confirmarIzquierda,
    enfocarCancelar: c.enfocarCancelar
  });
}
function alertaEliminar(
  nombre: string,
  entidad = 'paciente'
) {
  return alertaConfirmar({
    tono: 'rojo',
    icono: 'warning',
    iconoSvg: ICONOS.papelera,
    verbo: 'Eliminar',
    entidad,
    nombre,
    subtitulo: 'Acción permanente · no se puede deshacer',
    confirmar: 'Sí, eliminar',
    enfocarCancelar: true
  });
}
function alertaDesactivar(
  nombre: string,
  entidad = 'paciente'
) {
  return alertaConfirmar({
    tono: 'ambar',
    icono: 'warning',
    iconoSvg: ICONOS.prohibido,
    verbo: 'Desactivar',
    entidad,
    nombre,
    subtitulo: 'Cambio reversible · puedes reactivarlo luego',
    confirmar: 'Sí, desactivar'
  });
}
function alertaEditar(
  nombre: string,
  entidad = 'paciente'
) {
  return alertaConfirmar({
    tono: 'azul',
    icono: 'question',
    iconoSvg: ICONOS.lapiz,
    verbo: 'Editar',
    entidad,
    nombre,
    subtitulo: 'Se abrirá el formulario de edición',
    confirmar: 'Sí, editar',
    confirmarIzquierda: true
  });
}
function alertaActivar(
  nombre: string,
  entidad = 'paciente'
) {
  return alertaConfirmar({
    tono: 'verde',
    icono: 'question',
    iconoSvg: ICONOS.check,
    verbo: 'Activar',
    entidad,
    nombre,
    subtitulo: 'Volverá a estar activo · puedes desactivarlo luego',
    confirmar: 'Sí, activar',
    confirmarIzquierda: true
  });
}
function htmlMensaje(
  mensaje?: string
): string | undefined {
  return mensaje
    ? `<p class="m-0 text-[1.15rem] leading-snug text-slate-700">${escaparHtml(mensaje)}</p>`
    : undefined;
}
function alertaExito(
  titulo: string,
  mensaje?: string
) {
  return mostrarAlerta({
    tono: 'verde',
    icono: 'success',
    iconoSvg: ICONOS.check,
    titulo,
    html: htmlMensaje(mensaje),
    confirmar: 'Aceptar',
    autoCerrar: true
  });
}
function alertaError(
  titulo: string,
  mensaje?: string
) {
  return mostrarAlerta({
    tono: 'rojo',
    icono: 'error',
    iconoSvg: ICONOS.equis,
    titulo,
    html: htmlMensaje(mensaje),
    confirmar: 'Aceptar'
  });
}
function alertaAdvertencia(
  titulo: string,
  mensaje?: string
) {
  return mostrarAlerta({
    tono: 'ambar',
    icono: 'warning',
    iconoSvg: ICONOS.alerta,
    titulo,
    html: htmlMensaje(mensaje),
    confirmar: 'Aceptar'
  });
}
// =====================================================
// INTERFACES
// =====================================================
interface Sede {
  id_sede: number;
  nombre: string;
  estado: boolean;
}
interface Habitacion {
  id_habitacion: number;
  nombre: string;
  numero: string;
  descripcion?: string | null;
  estado: boolean;
  id_sede: number | null;
}
interface Cama {
  id_cama: number;
  nombre: string;
  numero: string;
  estado: boolean;
  id_habitacion: number | null;
}
interface PatientForm {
  nombre: string;
  apellidos: string;
  tipoIdentificacion: string;
  documento: string;
  nacimiento: string;
  edad: number | null;
  genero: string;
  grupoSanguineo: string;
  rh: string;
  eps: string;
  fechaIngreso: string;
  foto: File | null;
  fotoUrl: string | null;
  familiarNombres: string;
  familiarApellidos: string;
  parentesco: string;
  telefono1: string;
  telefono2: string;
  direccion: string;
  correoElectronico: string;
  municipio: string;
  sede: string;
  idSede: string;
  habitacion: string;
  cama: string;
  estado: string;
}
// =====================================================
// COMPONENTE
// =====================================================
@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './pacientes.html',
  styleUrl: './pacientes.css'
})
export class Pacientes {
  // =====================================================
  // API
  // =====================================================
  private readonly apiUrl =
    'https\://geriapp-backend.onrender.com/api';
  // =====================================================
  // PACIENTES
  // =====================================================
  patients: any[] = [];
  patientsPaginaActual: any[] = [];
  patientsPorPagina = 10;
  paginaActual = 1;
  totalPaginas = 1;
  paginas: number[] = [];
  searchText = '';
  // =====================================================
  // HABITACIONES Y CAMAS
  // =====================================================
  sedes: Sede[] = [];
  sedesActivas: Sede[] = [];
  habitaciones: Habitacion[] = [];
  camas: Cama[] = [];
  habitacionesActivas: Habitacion[] = [];
  camasActivas: Cama[] = [];

  // Sede correspondiente al usuario autenticado
private idSedeUsuario: number | null = null;
  // =====================================================
  // MODALES
  // =====================================================
  modalOpen = false;
  viewModalOpen = false;
  editingId: number | null = null;
  selectedPatient: any = null;
  // =====================================================
  // FORMULARIO
  // =====================================================
  form: PatientForm = this.formularioVacio();
  fotoPreview: string | null = null;
  nombreFoto: string | null = null;
  eliminarFotoPendiente = false;
  // =====================================================
  // CONSTRUCTOR
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }
  // =====================================================
  // INICIO
  // =====================================================
  ngOnInit(): void {
    this.listar();
    this.cargarSedeUsuario();
    this.cargarSedes();
    this.cargarHabitaciones();
    this.cargarCamas();
  }
  // =====================================================
  // CARGAR SEDES ACTIVAS
  // =====================================================
  cargarSedes(): void {
    this.http.get<Sede[]>(`${this.apiUrl}/sedes/`)
      .subscribe({
        next: (respuesta) => {

          this.sedes = respuesta || [];

          this.sedesActivas = this.sedes.filter(
            sede => sede.estado === true
          );

          if (!this.editar) {
            this.asignarSedeUsuario();
          } else {
            this.actualizarHabitacionesPorSede();
          }
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error al cargar sedes:', error);

          this.sedes = [];
          this.sedesActivas = [];
          this.habitacionesActivas = [];
          this.camasActivas = [];

          this.cdr.detectChanges();
        }
      });
  }
  // =====================================================
// CARGAR SEDE DEL ADMINISTRADOR AUTENTICADO
// =====================================================

cargarSedeUsuario(): void {

  const usuarioGuardado = localStorage.getItem('usuario');

  if (!usuarioGuardado) {
    console.error('No se encontró el usuario autenticado.');
    return;
  }

  let usuarioSesion: any;

  try {
    usuarioSesion = JSON.parse(usuarioGuardado);
  } catch (error) {
    console.error('No fue posible leer el usuario:', error);
    return;
  }

  const idUsuario = Number(usuarioSesion?.id_usuario);

  if (!idUsuario) {
    console.error('No se encontró el ID del usuario autenticado.');
    return;
  }

  // Consultar el usuario directamente en el backend.
  this.http.get<any>(
    `${this.apiUrl}/usuarios/${idUsuario}/`
  ).subscribe({

    next: (usuario) => {

      const sedeRelacionada = usuario.id_sede;

      const idSede =
        typeof sedeRelacionada === 'object' && sedeRelacionada !== null
          ? sedeRelacionada.id_sede
          : sedeRelacionada;

      if (!idSede) {

        this.idSedeUsuario = null;
        this.form.idSede = '';
        this.form.sede = '';

        this.habitacionesActivas = [];
        this.camasActivas = [];

        console.error('El usuario no tiene una sede asignada.');

        this.cdr.detectChanges();
        return;
      }

      this.idSedeUsuario = Number(idSede);

      console.log(
        'ID SEDE DEL ADMINISTRADOR:',
        this.idSedeUsuario
      );

      // Si las sedes ya fueron cargadas, asignarla.
      this.asignarSedeUsuario();

      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error(
        'Error al consultar la sede del administrador:',
        error
      );

    }

  });
}


// =====================================================
// ASIGNAR SEDE DEL USUARIO AL FORMULARIO
// =====================================================

asignarSedeUsuario(): void {

  if (!this.idSedeUsuario || this.editar) {
    return;
  }

  const sedeUsuario = this.sedesActivas.find(
    sede => Number(sede.id_sede) === this.idSedeUsuario
  );

  if (!sedeUsuario) {

    this.form.idSede = '';
    this.form.sede = '';

    this.habitacionesActivas = [];
    this.camasActivas = [];

    console.error(
      'La sede del administrador no está disponible o está inactiva.'
    );

    return;
  }

  this.form.idSede = String(sedeUsuario.id_sede);
  this.form.sede = sedeUsuario.nombre;

  console.log('SEDE ASIGNADA:', sedeUsuario.nombre);

  this.actualizarHabitacionesPorSede();

  this.cdr.detectChanges();
}
  // =====================================================
  // FORMULARIO VACÍO
  // =====================================================
  formularioVacio(): PatientForm {
    return {
      nombre: '',
      apellidos: '',
      tipoIdentificacion: '',
      documento: '',
      nacimiento: '',
      edad: null,
      genero: '',
      grupoSanguineo: '',
      rh: '',
      eps: '',
      fechaIngreso: '',
      foto: null,
      fotoUrl: null,
      familiarNombres: '',
      familiarApellidos: '',
      parentesco: '',
      telefono1: '',
      telefono2: '',
      direccion: '',
      correoElectronico: '',
      municipio: '',
      sede: '',
      idSede: '',
      habitacion: '',
      cama: '',
      estado: 'active'
    };
  }
  // =====================================================
  // LISTAR PACIENTES
  // =====================================================
  listar() {
    this.http.get<any[]>(
      `${this.apiUrl}/pacientes/`
    ).subscribe({
      next: (respuesta) => {
        this.patients = [...respuesta].sort(
          (a, b) => (a.id_paciente ?? 0) - (b.id_paciente ?? 0)
        );
        // =====================================================
        // ACTUALIZAR CAMAS DISPONIBLES
        // =====================================================
        // Si el formulario está abierto, actualizar el listado
        // de camas según las asignaciones actuales.
        if (
          this.modalOpen &&
          this.form.habitacion &&
          this.habitacionesActivas.length > 0
        ) {
          this.actualizarCamasPorHabitacion();
        }
        this.http.get<any[]>(
          `${this.apiUrl}/familiar_responsable/`
        ).subscribe({
          next: (familiares) => {
            this.patients = this.patients.map(patient => {
              const familiar = familiares.find(
                item => item.id_paciente === patient.id_paciente
              );
              return {
                ...patient,
                correo: familiar?.correo || 'Sin correo registrado'
              };
            });
            console.log(
              'PACIENTES CON CORREO:',
              this.patients
            );
            this.actualizarPaginacion();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error(
              'Error al obtener familiares:',
              error
            );
            this.patients = this.patients.map(patient => ({
              ...patient,
              correo: 'Sin correo registrado'
            }));
            this.actualizarPaginacion();
            this.cdr.detectChanges();
          }
        });
      },
      error: (error) => {
        console.error(
          'Error al obtener los pacientes:',
          error
        );
      }
    });
  }
  // =====================================================
  // FILTRAR PACIENTES
  // =====================================================
  get filteredPatients(): any[] {
    const texto =
      this.searchText
        .trim()
        .toLowerCase();
    if (!texto) {
      return this.patients;
    }
    return this.patients.filter(
      (patient) => {
        const nombreCompleto =
          `${patient.nombre || ''} ${patient.apellido || ''}`
            .toLowerCase();
        const documento =
          (patient.numero_documento || '')
            .toString()
            .toLowerCase();
        return (
          nombreCompleto.includes(texto) ||
          documento.includes(texto)
        );
      }
    );
  }
  // =====================================================
  // PAGINACIÓN
  // =====================================================
  actualizarPaginacion(): void {
    this.totalPaginas = Math.ceil(
      this.filteredPatients.length /
      this.patientsPorPagina
    );
    this.paginas = Array.from(
      {
        length: this.totalPaginas
      },
      (_, i) => i + 1
    );
    if (
      this.paginaActual >
      this.totalPaginas
    ) {
      this.paginaActual =
        this.totalPaginas || 1;
    }
    const inicio =
      (this.paginaActual - 1) *
      this.patientsPorPagina;
    const fin =
      inicio +
      this.patientsPorPagina;
    this.patientsPaginaActual =
      this.filteredPatients.slice(
        inicio,
        fin
      );
  }
  cambiarPagina(
    pagina: number
  ): void {
    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }
    this.paginaActual = pagina;
    this.actualizarPaginacion();
  }
  // =====================================================
  // EDAD
  // =====================================================
  calcularEdadPaciente(
    fechaNacimiento: string
  ): number {
    if (!fechaNacimiento) {
      return 0;
    }
    const nacimiento =
      new Date(fechaNacimiento);
    const hoy =
      new Date();
    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear();
    const mes =
      hoy.getMonth() -
      nacimiento.getMonth();
    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() <
        nacimiento.getDate()
      )
    ) {
      edad--;
    }
    return edad;
  }
  calcularEdad(): void {
    if (!this.form.nacimiento) {

      this.form.edad = null;
      return;
    }
    const nacimiento =
      new Date(
        this.form.nacimiento
      );
    const hoy =
      new Date();
    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear();
    const mes =
      hoy.getMonth() -
      nacimiento.getMonth();
    if (
      mes < 0 ||
      (
        mes === 0 &&
        hoy.getDate() <
        nacimiento.getDate()
      )
    ) {
      edad--;
    }
    this.form.edad = edad;
  }
  // =====================================================
  // HABITACIONES
  // =====================================================
  // =====================================================
  // CARGAR HABITACIONES
  // =====================================================
  cargarHabitaciones(): void {
    this.http.get<Habitacion[]>(`${this.apiUrl}/habitaciones/`)
      .subscribe({
        next: (respuesta) => {

          this.habitaciones = respuesta || [];

          this.actualizarHabitacionesPorSede();

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Error al cargar habitaciones:', error);

          this.habitaciones = [];
          this.habitacionesActivas = [];
          this.camasActivas = [];
          this.cdr.detectChanges();
        }
      });
  }


  // =====================================================
  // FILTRAR HABITACIONES POR SEDE
  // =====================================================
  actualizarHabitacionesPorSede(): void {

    const idSede = Number(this.form.idSede);

    this.habitacionesActivas = this.habitaciones.filter(
      habitacion =>
        habitacion.estado === true &&
        Number(habitacion.id_sede) === idSede &&
        this.sedesActivas.some(
          sede => sede.id_sede === idSede
        )
    );

    const habitacionValida = this.habitacionesActivas.some(
      habitacion =>
        habitacion.id_habitacion === Number(this.form.habitacion)
    );

    if (!habitacionValida) {
      this.form.habitacion = '';
      this.form.cama = '';
      this.camasActivas = [];
    } else {
      this.actualizarCamasPorHabitacion();
    }

    this.cdr.detectChanges();
  }


  // =====================================================
  // CUANDO EL USUARIO CAMBIA LA SEDE
  // =====================================================
  cambiarSede(): void {

    this.form.habitacion = '';
    this.form.cama = '';

    this.habitacionesActivas = [];
    this.camasActivas = [];

    const sedeSeleccionada = this.sedesActivas.find(
      sede => sede.id_sede === Number(this.form.idSede)
    );

    this.form.sede = sedeSeleccionada?.nombre || '';

    this.actualizarHabitacionesPorSede();
  }
  // =====================================================
  // CAMAS
  // =====================================================
  cargarCamas(): void {
    this.http.get<Cama[]>(`${this.apiUrl}/camas/`).subscribe({
      next: (respuesta) => {
        // Guardar todas las camas recibidas del backend.
        this.camas = respuesta || [];
        // Si el formulario está abierto y tiene
        // una habitación seleccionada, recalcular
        // cuáles camas están realmente disponibles.
        if (this.modalOpen && this.form.habitacion) {
          this.actualizarCamasPorHabitacion();
        } else {
          // Sin una habitación seleccionada,
          // no mostrar camas disponibles.
          this.camasActivas = [];
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al cargar camas:', error);
        this.camas = [];
        this.camasActivas = [];
      }
    });
  }
  actualizarCamasPorHabitacion(): void {
    const idHabitacion = Number(this.form.habitacion);
    // Si no se seleccionó una habitación, limpiar las camas.
    if (!idHabitacion) {
      this.camasActivas = [];
      this.form.cama = '';
      return;
    }
    // Comprobar que la habitación esté activa.
    const habitacionDisponible = this.habitacionesActivas.some(
      habitacion =>
        habitacion.id_habitacion === idHabitacion
    );
    if (!habitacionDisponible) {
      this.camasActivas = [];
      this.form.cama = '';
      return;
    }
    // Obtener las camas que ya están asignadas
    // a otros pacientes.
    const camasOcupadas = new Set(
      this.patients
        .filter(patient =>
          Number(patient.cama) > 0 &&
          Number(patient.id_paciente) !== this.editingId
        )
        .map(patient => Number(patient.cama))
    );
    // Mostrar únicamente camas activas,
    // de la habitación seleccionada y desocupadas.
    this.camasActivas = this.camas.filter(cama =>
      cama.estado === true &&
      Number(cama.id_habitacion) === idHabitacion &&
      !camasOcupadas.has(Number(cama.id_cama))
    );
    // Si la cama seleccionada ya no está disponible,
    // limpiar la selección.
    const camaDisponible = this.camasActivas.some(
      cama =>
        Number(cama.id_cama) === Number(this.form.cama)
    );
    if (!camaDisponible) {
      this.form.cama = '';
    }
    this.cdr.detectChanges();
  }

  // =====================================================
  // NUEVO PACIENTE
  // =====================================================
  nuevo(): void {
    this.form = this.formularioVacio();

    this.fotoPreview = null;
    this.nombreFoto = null;
    this.eliminarFotoPendiente = false;
    this.editingId = null;

    this.habitacionesActivas = [];
    this.camasActivas = [];

    this.modalOpen = true;

    if (this.sedesActivas.length > 0) {
      this.asignarSedeUsuario();
    }
  }

  // =====================================================
  // SELECCIONAR FOTO
  // =====================================================
  seleccionarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    if (!archivo.type.startsWith('image/')) {
      alertaAdvertencia('Archivo no válido', 'Selecciona un archivo de imagen.');
      input.value = '';
      return;
    }
    this.form.foto = archivo;
    this.eliminarFotoPendiente = false;
    this.form.fotoUrl = null;
    this.nombreFoto = archivo.name;
    const lector = new FileReader();
    lector.onload = () => {
      this.fotoPreview = lector.result as string;
      this.cdr.detectChanges();
    };
    lector.onerror = () => {
      console.error('No fue posible leer la imagen.');
      this.fotoPreview = null;
    };
    lector.readAsDataURL(archivo);
  }

  async solicitarEliminarFoto(): Promise<void> {

    const resultado = await mostrarAlerta({
      tono: 'rojo',
      icono: 'warning',
      iconoSvg: ICONOS.papelera,
      titulo: 'Eliminar foto de perfil',

      html: `
      <p class="m-0 text-[1.1rem] leading-snug text-slate-400">
        La foto se eliminará permanentemente al guardar los cambios.
      </p>
    `,

      confirmar: 'Sí, eliminar foto',
      cancelar: 'Cancelar',
      enfocarCancelar: true
    });

    if (!resultado.isConfirmed) {
      return;
    }

    // Marcar eliminación pendiente
    this.eliminarFotoPendiente = true;

    // Limpiar foto del formulario
    this.form.foto = null;
    this.form.fotoUrl = null;

    // Limpiar vista previa
    this.fotoPreview = null;
    this.nombreFoto = null;

    this.cdr.detectChanges();
  }
  obtenerNombreFoto(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      const ruta = new URL(url, window.location.origin);
      const nombre = ruta.pathname.split('/').pop();
      return nombre ? decodeURIComponent(nombre) : 'Foto de perfil';
    } catch {
      return 'Foto de perfil';
    }
  }

  // =====================================================
  // EDITAR PACIENTE
  // =====================================================
  editarPaciente(
    patient: any
  ): void {
    this.editingId =
      patient.id_paciente;

    const habitacionActual = this.habitaciones.find(
      habitacion =>
        Number(habitacion.id_habitacion) === Number(patient.habitacion)
    );

    const sedeActual = this.sedes.find(
      sede =>
        sede.nombre.trim().toLowerCase() ===
        String(patient.sede || '').trim().toLowerCase()
    );

    const idSedeActual =
      patient.id_sede ??
      habitacionActual?.id_sede ??
      sedeActual?.id_sede ??
      '';

    this.form = {

      nombre:
        patient.nombre || '',
      apellidos:
        patient.apellido || '',
      tipoIdentificacion:
        patient.tipo_documento || '',
      documento:
        patient.numero_documento || '',
      nacimiento:
        patient.fecha_nacimiento || '',
      edad: null,
      genero:
        patient.genero || '',
      grupoSanguineo:
        patient.grupo_sanguineo || '',
      rh:
        patient.rh || '',
      eps:
        patient.eps || '',
      fechaIngreso:
        patient.fecha_ingreso
          ? patient.fecha_ingreso.substring(0, 10)
          : '',
      foto: null,
      fotoUrl: patient.foto || null,
      familiarNombres: '',
      familiarApellidos: '',
      parentesco: '',
      telefono1: '',
      telefono2: '',
      direccion: '',
      correoElectronico: '',
      municipio: '',
      sede:
        patient.sede || '',
      idSede:
        idSedeActual !== '' && idSedeActual != null
          ? String(idSedeActual)
          : '',
      habitacion:
        patient.habitacion !== null &&
          patient.habitacion !== undefined
          ? String(patient.habitacion)
          : '',
      cama:
        patient.cama !== null &&
          patient.cama !== undefined
          ? String(patient.cama)
          : '',
      estado:
        patient.estado
          ? 'active'
          : 'inactive'
    };
    // Mostrar las habitaciones de la sede asignada
    // y las camas disponibles de la habitación actual.
    this.actualizarHabitacionesPorSede();
    this.nombreFoto = this.obtenerNombreFoto(patient.foto);
    this.fotoPreview = patient.foto || null;
    this.eliminarFotoPendiente = false;
    if (this.form.nacimiento) {
      this.calcularEdad();
    }
    // ===================================================
    // CARGAR FAMILIAR
    // ===================================================
    this.http
      .get<any[]>(
        `${this.apiUrl}/familiar_responsable/`
      )
      .subscribe({
        next: (familiares) => {
          const familiar =
            familiares.find(
              item =>
                item.id_paciente ===
                patient.id_paciente
            );
          if (familiar) {
            this.form.familiarNombres =
              familiar.nombres || '';
            this.form.familiarApellidos =
              familiar.apellidos || '';
            this.form.parentesco =
              familiar.parentesco || '';
            this.form.telefono1 =
              familiar.telefono_uno || '';
            this.form.telefono2 =
              familiar.telefono_dos || '';
            this.form.direccion =
              familiar.direccion || '';
            this.form.correoElectronico =
              familiar.correo || '';
            this.form.municipio =
              familiar.municipio || '';
          }
          this.modalOpen = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'Error al obtener el familiar responsable:',
            error
          );
          this.modalOpen = true;
          this.cdr.detectChanges();
        }
      });
  }
  // =====================================================
  // GUARDAR
  // =====================================================
  guardar(): void {

    if (!this.form.idSede) {
      alertaAdvertencia(
        'Sede requerida',
        'Debes seleccionar una sede para el paciente.'
      );
      return;
    }

    if (!this.form.habitacion || !this.form.cama) {
      alertaAdvertencia(
        'Ubicación incompleta',
        'Debes seleccionar una habitación y una cama.'
      );
      return;
    }

    if (this.editar) {
      this.actualizar();
    } else {
      this.crear();
    }
  }

  // =====================================================
  // ASIGNACIONES DE HABITACIÓN
  // =====================================================

  /**
   * Consulta todas las asignaciones del paciente.
   * También contempla respuestas paginadas de Django REST Framework.
   */
  private async obtenerAsignacionesPaciente(
    idPaciente: number
  ): Promise<any[]> {
    let url: string | null =
      `${this.apiUrl}/asignacion_habitacion/`;

    const asignaciones: any[] = [];

    while (url) {
      const respuesta: any = await firstValueFrom(
        this.http.get<any>(url)
      );

      const resultados: any[] = Array.isArray(respuesta)
        ? respuesta
        : Array.isArray(respuesta?.results)
          ? respuesta.results
          : [];

      asignaciones.push(
        ...resultados.filter(
          asignacion =>
            Number(asignacion.id_paciente) === Number(idPaciente)
        )
      );

      url = Array.isArray(respuesta)
        ? null
        : respuesta?.next || null;
    }

    return asignaciones;
  }

  /**
   * Convierte la fecha de ingreso (input date) a un valor
   * DateTime que acepta el serializer de Django REST Framework.
   */
  private fechaHoraAsignacion(
    fecha?: string | null
  ): string {
    if (!fecha) {
      return new Date().toISOString();
    }

    const valor = String(fecha);

    if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return `${valor}T00:00:00`;
    }

    return valor;
  }

  /**
   * Cierra una asignación vigente sin eliminar el historial.
   */
  private async cerrarAsignacionHabitacion(
    asignacion: any
  ): Promise<void> {
    if (!asignacion?.id_asignacion) {
      throw new Error(
        'La asignación no contiene un identificador válido.'
      );
    }

    await firstValueFrom(
      this.http.patch(
        `${this.apiUrl}/asignacion_habitacion/${asignacion.id_asignacion}/`,
        {
          fecha_fin: new Date().toISOString(),
          estado: false
        }
      )
    );
  }

  /**
   * Crea una asignación activa para el paciente.
   */
  private async crearAsignacionHabitacion(
    idPaciente: number,
    idHabitacion: number,
    idCama: number,
    fechaInicio?: string | null
  ): Promise<void> {
    const asignacion = {
      fecha_inicio: this.fechaHoraAsignacion(fechaInicio),
      fecha_fin: null,
      estado: true,
      id_paciente: Number(idPaciente),
      id_habitacion: Number(idHabitacion),
      id_cama: Number(idCama)
    };

    await firstValueFrom(
      this.http.post(
        `${this.apiUrl}/asignacion_habitacion/`,
        asignacion
      )
    );
  }

  /**
   * Sincroniza la ubicación del paciente con su historial.
   *
   * - Si ya existe una asignación vigente en la misma ubicación,
   *   no crea otra.
   * - Si cambió habitación o cama, cierra la anterior y crea otra.
   * - Si no existe una asignación vigente, crea una.
   * - Si el paciente está inactivo, cierra las asignaciones vigentes.
   */
  private async sincronizarAsignacionHabitacion(
    idPaciente: number,
    idHabitacion: number,
    idCama: number,
    pacienteActivo: boolean,
    fechaIngreso?: string | null
  ): Promise<void> {
    const asignaciones =
      await this.obtenerAsignacionesPaciente(idPaciente);

    const asignacionesVigentes = asignaciones.filter(
      asignacion =>
        (
          asignacion.estado === true ||
          asignacion.estado === 1 ||
          asignacion.estado === 'true'
        ) &&
        (
          asignacion.fecha_fin === null ||
          asignacion.fecha_fin === undefined ||
          asignacion.fecha_fin === ''
        )
    );

    // Si el paciente se desactiva, cerrar todas sus asignaciones vigentes.
    if (!pacienteActivo) {
      for (const asignacion of asignacionesVigentes) {
        await this.cerrarAsignacionHabitacion(asignacion);
      }
      return;
    }

    const asignacionCoincidente =
      asignacionesVigentes.find(
        asignacion =>
          Number(asignacion.id_habitacion) === Number(idHabitacion) &&
          Number(asignacion.id_cama) === Number(idCama)
      );

    // Si ya está asignado a esa habitación y cama,
    // conservar una asignación y cerrar posibles duplicados.
    if (asignacionCoincidente) {
      for (const asignacion of asignacionesVigentes) {
        if (
          Number(asignacion.id_asignacion) !==
          Number(asignacionCoincidente.id_asignacion)
        ) {
          await this.cerrarAsignacionHabitacion(asignacion);
        }
      }
      return;
    }

    // Si tenía otra ubicación, cerrar primero el historial anterior.
    for (const asignacion of asignacionesVigentes) {
      await this.cerrarAsignacionHabitacion(asignacion);
    }

    // Si había una asignación anterior, el nuevo ingreso comienza ahora.
    // Si no había ninguna, se utiliza la fecha de ingreso del paciente.
    const fechaInicio = asignaciones.length > 0
      ? new Date().toISOString()
      : this.fechaHoraAsignacion(fechaIngreso);

    await this.crearAsignacionHabitacion(
      idPaciente,
      idHabitacion,
      idCama,
      fechaInicio
    );
  }

  /**
   * Crea o actualiza el familiar responsable de un paciente.
   */
  private async guardarFamiliarResponsable(
    idPaciente: number
  ): Promise<void> {
    const familiares = await firstValueFrom(
      this.http.get<any[]>(
        `${this.apiUrl}/familiar_responsable/`
      )
    );

    const familiar = (familiares || []).find(
      item =>
        Number(item.id_paciente) === Number(idPaciente)
    );

    const datosFamiliar = {
      nombres: this.form.familiarNombres,
      apellidos: this.form.familiarApellidos,
      parentesco: this.form.parentesco,
      telefono_uno: this.form.telefono1,
      telefono_dos: this.form.telefono2 || null,
      direccion: this.form.direccion || null,
      correo: this.form.correoElectronico || null,
      municipio: this.form.municipio || null,
      id_paciente: idPaciente
    };

    if (familiar) {
      await firstValueFrom(
        this.http.put(
          `${this.apiUrl}/familiar_responsable/${familiar.id_familiar_responsable}/`,
          datosFamiliar
        )
      );
    } else {
      await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/familiar_responsable/`,
          datosFamiliar
        )
      );
    }
  }

  /**
   * Convierte los errores de la API en un mensaje legible.
   */
  private detalleErrorApi(
    error: any,
    mensajePredeterminado: string
  ): string {
    if (typeof error?.error === 'string') {
      return error.error;
    }

    if (
      error?.error &&
      typeof error.error === 'object'
    ) {
      const mensajes = Object.entries(error.error).map(
        ([campo, valor]: [string, any]) =>
          Array.isArray(valor)
            ? `${campo}: ${valor.join(', ')}`
            : `${campo}: ${valor}`
      );

      if (mensajes.length > 0) {
        return mensajes.join(' | ');
      }
    }

    return error?.message || mensajePredeterminado;
  }

  // =====================================================
  // CREAR
  // =====================================================
  async crear(): Promise<void> {
    const paciente = {
      nombre: this.form.nombre,
      apellido: this.form.apellidos,
      eps: this.form.eps,
      sede: this.form.sede,
      id_sede: Number(this.form.idSede),
      fecha_ingreso: this.form.fechaIngreso,
      habitacion: Number(this.form.habitacion),
      id_usuario: null,
      tipo_documento: this.form.tipoIdentificacion,
      numero_documento: this.form.documento,
      fecha_nacimiento: this.form.nacimiento,
      genero: this.form.genero,
      grupo_sanguineo: this.form.grupoSanguineo || null,
      rh: this.form.rh || null,
      cama: Number(this.form.cama),
      estado: this.form.estado === 'active'
    };

    const datosPaciente = new FormData();

    Object.entries(paciente).forEach(
      ([campo, valor]) => {
        if (valor !== null && valor !== undefined) {
          datosPaciente.append(campo, String(valor));
        }
      }
    );

    if (this.form.foto) {
      datosPaciente.append('foto', this.form.foto);
    }

    try {
      // 1. Crear primero el registro principal del paciente.
      const respuesta: any = await firstValueFrom(
        this.http.post<any>(
          `${this.apiUrl}/pacientes/`,
          datosPaciente
        )
      );

      const idPaciente = Number(respuesta?.id_paciente);

      if (!idPaciente) {
        throw new Error(
          'El paciente se creó, pero la API no devolvió id_paciente.'
        );
      }

      let errorAsignacion: any = null;
      let errorFamiliar: any = null;

      // 2. Registrar la asignación únicamente si el paciente queda activo.
      if (paciente.estado) {
        try {
          await this.sincronizarAsignacionHabitacion(
            idPaciente,
            Number(this.form.habitacion),
            Number(this.form.cama),
            true,
            this.form.fechaIngreso
          );
        } catch (error) {
          errorAsignacion = error;
          console.error(
            'El paciente se creó, pero falló el registro de asignación:',
            error
          );
        }
      }

      // 3. Guardar el familiar aunque haya fallado la asignación.
      const familiar = {
        nombres: this.form.familiarNombres,
        apellidos: this.form.familiarApellidos,
        parentesco: this.form.parentesco,
        telefono_uno: this.form.telefono1,
        telefono_dos: this.form.telefono2 || null,
        direccion: this.form.direccion || null,
        correo: this.form.correoElectronico || null,
        municipio: this.form.municipio || null,
        id_paciente: idPaciente
      };

      try {
        await firstValueFrom(
          this.http.post(
            `${this.apiUrl}/familiar_responsable/`,
            familiar
          )
        );
      } catch (error) {
        errorFamiliar = error;
        console.error(
          'Error al crear familiar:',
          error
        );
      }

      this.listar();
      this.closeModal();

      if (errorAsignacion || errorFamiliar) {
        const observaciones: string[] = [];

        if (errorAsignacion) {
          observaciones.push(
            `No se pudo registrar la asignación: ${this.detalleErrorApi(
              errorAsignacion,
              'Error al guardar habitación y cama.'
            )
            }`
          );
        }

        if (errorFamiliar) {
          observaciones.push(
            `No se pudo guardar el familiar responsable: ${this.detalleErrorApi(
              errorFamiliar,
              'Error al guardar los datos del familiar.'
            )
            }`
          );
        }

        alertaAdvertencia(
          'Paciente creado con observaciones',
          observaciones.join(' ')
        );
        return;
      }

      alertaExito(
        'Paciente registrado correctamente',
        'Se guardaron los datos del paciente, su ubicación y la asignación de habitación.'
      );

    } catch (error: any) {
      console.error(
        'Error al crear paciente:',
        error
      );

      alertaError(
        'Error al registrar el paciente',
        this.detalleErrorApi(
          error,
          'No se pudo guardar el paciente.'
        )
      );
    }
  }
  // =====================================================
  // ACTUALIZAR
  // =====================================================
  async actualizar(): Promise<void> {
    if (this.editingId === null) {
      return;
    }

    const idPaciente = Number(this.editingId);

    const paciente = {
      nombre: this.form.nombre,
      apellido: this.form.apellidos,
      eps: this.form.eps,
      sede: this.form.sede,
      id_sede: Number(this.form.idSede),
      fecha_ingreso: this.form.fechaIngreso,
      habitacion: Number(this.form.habitacion),
      id_usuario: null,
      tipo_documento: this.form.tipoIdentificacion,
      numero_documento: this.form.documento,
      fecha_nacimiento: this.form.nacimiento,
      genero: this.form.genero,
      grupo_sanguineo: this.form.grupoSanguineo || null,
      rh: this.form.rh || null,
      cama: Number(this.form.cama),
      estado: this.form.estado === 'active'
    };

    const datosPaciente = new FormData();

    Object.entries(paciente).forEach(
      ([campo, valor]) => {
        if (valor !== null && valor !== undefined) {
          datosPaciente.append(campo, String(valor));
        }
      }
    );

    if (this.form.foto) {
      datosPaciente.append('foto', this.form.foto);
    }

    if (this.eliminarFotoPendiente) {
      datosPaciente.append('eliminar_foto', 'true');
    }

    try {
      // 1. Actualizar los datos principales del paciente.
      await firstValueFrom(
        this.http.put(
          `${this.apiUrl}/pacientes/${idPaciente}/`,
          datosPaciente
        )
      );
    } catch (error: any) {
      console.error(
        'Error al actualizar paciente:',
        error
      );

      alertaError(
        'Error al actualizar el paciente',
        this.detalleErrorApi(
          error,
          'No fue posible actualizar los datos del paciente.'
        )
      );
      return;
    }

    let errorAsignacion: any = null;
    let errorFamiliar: any = null;

    // 2. Sincronizar la asignación.
    // Si no existe una asignación vigente, se recupera usando la fecha de ingreso.
    // Si cambió habitación o cama, se cierra la anterior y la nueva inicia ahora.
    try {
      await this.sincronizarAsignacionHabitacion(
        idPaciente,
        Number(this.form.habitacion),
        Number(this.form.cama),
        paciente.estado,
        this.form.fechaIngreso
      );
    } catch (error) {
      errorAsignacion = error;
      console.error(
        'El paciente se actualizó, pero falló la sincronización de asignación:',
        error
      );
    }

    // 3. Mantener el comportamiento actual del familiar responsable.
    try {
      await this.guardarFamiliarResponsable(idPaciente);
    } catch (error) {
      errorFamiliar = error;
      console.error(
        'Error al guardar familiar responsable:',
        error
      );
    }

    this.listar();
    this.closeModal();

    if (errorAsignacion || errorFamiliar) {
      const observaciones: string[] = [];

      if (errorAsignacion) {
        observaciones.push(
          `No se pudo actualizar el historial de habitación: ${this.detalleErrorApi(
            errorAsignacion,
            'Error al registrar la asignación.'
          )
          }`
        );
      }

      if (errorFamiliar) {
        observaciones.push(
          `No se pudo guardar el familiar responsable: ${this.detalleErrorApi(
            errorFamiliar,
            'Error al guardar los datos del familiar.'
          )
          }`
        );
      }

      alertaAdvertencia(
        'Paciente actualizado con observaciones',
        observaciones.join(' ')
      );
      return;
    }

    alertaExito(
      'Paciente actualizado correctamente',
      'Los datos del paciente y su asignación de habitación están actualizados.'
    );
  }
  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================
  cambiarEstado(
    patient: any
  ): void {
    const nuevoEstado = !patient.estado;

    const nombre =
      `${patient.nombre} ${patient.apellido}`.trim();

    const pregunta = nuevoEstado
      ? alertaActivar(nombre, 'paciente')
      : alertaDesactivar(nombre, 'paciente');

    pregunta.then(async (resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      const pacienteActualizado = {
        ...patient,
        estado: nuevoEstado
      };

      try {
        // 1. Actualizar el estado del paciente.
        await firstValueFrom(
          this.http.put(
            `${this.apiUrl}/pacientes/${patient.id_paciente}/`,
            pacienteActualizado
          )
        );
      } catch (error) {
        console.error(
          'Error al cambiar estado:',
          error
        );

        alertaError(
          'Error',
          'No fue posible cambiar el estado del paciente.'
        );
        return;
      }

      // 2. Al desactivar, cerrar la asignación.
      // Al reactivar, crear una nueva asignación desde el momento de reactivación.
      try {
        await this.sincronizarAsignacionHabitacion(
          Number(patient.id_paciente),
          Number(patient.habitacion),
          Number(patient.cama),
          nuevoEstado,
          nuevoEstado ? new Date().toISOString() : null
        );

        patient.estado = nuevoEstado;
        this.listar();
        this.cdr.detectChanges();

        alertaExito(
          'Estado actualizado',
          nuevoEstado
            ? 'El paciente ha sido activado y se registró su nueva asignación.'
            : 'El paciente ha sido desactivado y se cerró su asignación vigente.'
        );

      } catch (error) {
        // El estado del paciente ya se actualizó; avisar que la asignación no.
        patient.estado = nuevoEstado;
        this.listar();
        this.cdr.detectChanges();

        console.error(
          'El estado del paciente cambió, pero falló la actualización de asignación:',
          error
        );

        alertaAdvertencia(
          'Estado actualizado con observaciones',
          `El estado del paciente cambió, pero no se pudo actualizar su historial de habitación: ${this.detalleErrorApi(
            error,
            'Error al registrar el movimiento de habitación.'
          )
          }`
        );
      }
    });
  }
  // =====================================================
  // EDITANDO
  // =====================================================
  get editar(): boolean {
    return this.editingId !== null;
  }
  // =====================================================
  // ABRIR MODAL
  // =====================================================
  openModal(
    mode: 'new' | 'edit',
    patientId?: number
  ): void {
    if (mode === 'new') {
      this.nuevo();
      return;
    }
    if (
      patientId !== undefined
    ) {
      const patient =
        this.patients.find(
          item =>
            item.id_paciente ===
            patientId
        );
      if (patient) {
        this.editarPaciente(
          patient
        );
      }
    }
  }
  // =====================================================
  // CERRAR MODAL
  // =====================================================
  closeModal(): void {
    this.modalOpen = false;
    this.editingId = null;
    this.form = this.formularioVacio();
    this.fotoPreview = null;
    this.nombreFoto = null;
    this.camasActivas = [];
    this.eliminarFotoPendiente = false;
  }

  // =====================================================
  // CERRAR CON FONDO
  // =====================================================
  closeOnBackdrop(
    event: MouseEvent
  ): void {
    if (
      event.target ===
      event.currentTarget
    ) {
      this.closeModal();
    }
  }
  // =====================================================
  // GUARDAR DESDE HTML
  // =====================================================
  savePatient(): void {
    this.guardar();
  }
  // =====================================================
  // VER PACIENTE
  // =====================================================
  viewPatient(
    id: number
  ): void {
    const patient =
      this.patients.find(
        item =>
          item.id_paciente === id
      );
    if (!patient) {
      return;
    }
    this.selectedPatient = {
      ...patient,
      familiarNombres:
        'No registrado',
      familiarApellidos:
        'No registrado',
      parentesco:
        'No registrado',
      telefono1:
        'No registrado',
      telefono2:
        'No registrado',
      direccion:
        'No registrado',
      correoElectronico:
        'No registrado',
      municipio:
        'No registrado'
    };
    this.http
      .get<any[]>(
        `${this.apiUrl}/familiar_responsable/`
      )
      .subscribe({
        next: (familiares) => {
          const familiar =
            familiares.find(
              item =>
                item.id_paciente === id
            );
          if (familiar) {
            this.selectedPatient.familiarNombres =
              familiar.nombres ||
              'No registrado';
            this.selectedPatient.familiarApellidos =
              familiar.apellidos ||
              'No registrado';
            this.selectedPatient.parentesco =
              familiar.parentesco ||
              'No registrado';
            this.selectedPatient.telefono1 =
              familiar.telefono_uno ||
              'No registrado';
            this.selectedPatient.telefono2 =
              familiar.telefono_dos ||
              'No registrado';
            this.selectedPatient.direccion =
              familiar.direccion ||
              'No registrado';
            this.selectedPatient.correoElectronico =
              familiar.correo ||
              'No registrado';
            this.selectedPatient.municipio =
              familiar.municipio ||
              'No registrado';
          }
          this.viewModalOpen = true;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(
            'Error al obtener familiar:',
            error
          );
          this.viewModalOpen = true;
          this.cdr.detectChanges();
        }
      });
  }
  // =====================================================
  // NOMBRE HABITACIÓN
  // =====================================================
  obtenerNombreHabitacion(
    id: any
  ): string {
    const habitacion =
      this.habitaciones.find(
        h =>
          h.id_habitacion ===
          Number(id)
      );
    if (!habitacion) {
      return 'No registrado';
    }
    return `${habitacion.nombre} - ${habitacion.numero}`;
  }
  // =====================================================
  // NOMBRE CAMA
  // =====================================================
  obtenerNombreCama(
    id: any
  ): string {
    const cama =
      this.camas.find(
        c =>
          c.id_cama ===
          Number(id)
      );
    if (!cama) {
      return 'No registrado';
    }
    return `${cama.nombre} - ${cama.numero}`;
  }
  // =====================================================
  // CERRAR MODAL VER
  // =====================================================
  closeViewModal(): void {
    this.viewModalOpen = false;
    this.selectedPatient = null;
  }
  // =====================================================
  // TÍTULO MODAL
  // =====================================================
  get modalTitle(): string {
    return this.editar
      ? 'Editar paciente'
      : 'Nuevo paciente';
  }
  // =====================================================
  // TEXTO BOTÓN
  // =====================================================
  get saveButtonText(): string {
    return this.editar
      ? 'Guardar cambios'
      : 'Guardar paciente';
  }
  obtenerIniciales(nombre?: string): string {
    if (!nombre) {
      return 'PA';
    }
    const partes = nombre.trim().split(' ');
    if (partes.length >= 2) {
      return (
        partes[0][0] +
        partes[1][0]
      ).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }
}

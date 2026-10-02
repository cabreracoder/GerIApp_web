import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';

// =====================================================
// ALERTAS (SweetAlert2 + Tailwind)
// =====================================================

type Tono = 'rojo' | 'ambar' | 'azul' | 'verde';

const TONOS: Record<Tono, { panel: string; boton: string }> = {
  rojo: { panel: 'bg-linear-to-b from-red-500 to-red-700', boton: 'bg-red-600 hover:bg-red-700' },
  ambar: { panel: 'bg-linear-to-b from-amber-500 to-amber-700', boton: 'bg-amber-600 hover:bg-amber-700' },
  azul: { panel: 'bg-linear-to-b from-blue-500 to-blue-700', boton: 'bg-blue-600 hover:bg-blue-700' },
  verde: { panel: 'bg-linear-to-b from-emerald-500 to-emerald-700', boton: 'bg-emerald-600 hover:bg-emerald-700' },
};

// Iconos blancos del panel (papelera, prohibido, lápiz, check, equis, alerta)
const svgIcono = (trazos: string): string =>
  `<svg class="h-11 w-11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</svg>`;

const ICONOS = {
  papelera: svgIcono('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
  prohibido: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'),
  lapiz: svgIcono('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>'),
  check: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  equis: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  alerta: svgIcono('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
};

// Evita que un nombre del backend inyecte HTML
function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inicialesAlerta(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

interface ConfigAlerta {
  tono: Tono;
  icono: 'warning' | 'question' | 'success' | 'error';
  iconoSvg: string;
  titulo: string;
  html?: string;
  confirmar: string;
  cancelar?: string;
  confirmarIzquierda?: boolean;   // true = "Sí, ..." a la izquierda (como en Editar)
  enfocarCancelar?: boolean;
  autoCerrar?: boolean;           // true = sin botones, se cierra a los 1,8 s
}

// Motor único: todas las alertas pasan por aquí.
// Las clases con "!" ganan sobre el CSS que SweetAlert2 trae por defecto.
function mostrarAlerta(c: ConfigAlerta) {

  const tono = TONOS[c.tono];
  const conBotones = !c.autoCerrar;
  const conCancelar = !!c.cancelar;
  const botonSolo = conBotones && !conCancelar;
  const tituloSinPie = !conBotones && !c.html;

  return Swal.fire({
    icon: c.icono,
    iconHtml: c.iconoSvg,
    title: escaparHtml(c.titulo),
    html: c.html,

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
      popup: '!grid-cols-[26%_1fr] !w-[34rem] !max-w-[92vw] !p-0 !rounded-[2.2rem] !overflow-hidden !bg-white',
      icon: `col-start-1 row-start-1 row-span-3 !m-0 !flex !h-auto !w-auto !items-center !justify-center !rounded-none !border-0 !animate-none ${tono.panel}`,
      title: `col-start-2 row-start-1 !m-0 !px-7 !pt-8 ${tituloSinPie ? '!pb-8' : '!pb-0'} !text-left !text-[1.6rem] !leading-tight !font-extrabold !text-slate-900`,
      htmlContainer: `col-start-2 row-start-2 !m-0 !px-7 !pt-0 ${conBotones ? '!pb-0' : '!pb-8'} !justify-start !overflow-visible !text-left !text-base !font-normal`,
      actions: `col-start-2 row-start-3 !m-0 !w-auto !flex-nowrap !gap-3 !px-7 !pt-6 !pb-8 ${botonSolo ? '!justify-end' : '!justify-stretch'}`,
      confirmButton: `${botonSolo ? 'w-[calc(50%-0.375rem)]' : 'flex-1'} cursor-pointer rounded-2xl px-4 py-3 text-[1.1rem] font-bold text-white transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 ${tono.boton}`,
      cancelButton: 'flex-1 cursor-pointer rounded-2xl bg-slate-100 px-4 py-3 text-[1.1rem] font-bold text-slate-600 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300',
    },
  });
}

// ---- Confirmaciones: subtítulo gris + avatar con iniciales + pregunta ----

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
    <p class="m-0 text-[1.1rem] leading-snug text-slate-400">${escaparHtml(c.subtitulo)}</p>
    <div class="mt-4 flex items-center gap-3.5">
      <span class="flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">${escaparHtml(inicialesAlerta(c.nombre))}</span>
      <p class="m-0 text-[1.15rem] leading-snug text-slate-700">¿${c.verbo} a <strong class="font-bold">${escaparHtml(c.nombre)}</strong>?</p>
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
    enfocarCancelar: c.enfocarCancelar,
  });
}

// Imagen 1: rojo
function alertaEliminar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'rojo', icono: 'warning', iconoSvg: ICONOS.papelera,
    verbo: 'Eliminar', entidad, nombre,
    subtitulo: 'Acción permanente · no se puede deshacer',
    confirmar: 'Sí, eliminar',
    enfocarCancelar: true,
  });
}

// Imagen 2: ámbar
function alertaDesactivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.prohibido,
    verbo: 'Desactivar', entidad, nombre,
    subtitulo: 'Cambio reversible · puedes reactivarlo luego',
    confirmar: 'Sí, desactivar',
  });
}

// Imagen 3: azul ("Sí, editar" va a la izquierda)
function alertaEditar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'azul', icono: 'question', iconoSvg: ICONOS.lapiz,
    verbo: 'Editar', entidad, nombre,
    subtitulo: 'Se abrirá el formulario de edición',
    confirmar: 'Sí, editar',
    confirmarIzquierda: true,
  });
}

// Misma forma que Editar, en verde
function alertaActivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'verde', icono: 'question', iconoSvg: ICONOS.check,
    verbo: 'Activar', entidad, nombre,
    subtitulo: 'Volverá a estar activo · puedes desactivarlo luego',
    confirmar: 'Sí, activar',
    confirmarIzquierda: true,
  });
}

// ---- Avisos: mismo panel, título y texto; un solo botón a la derecha ----

function htmlMensaje(mensaje?: string): string | undefined {
  return mensaje
    ? `<p class="m-0 text-[1.15rem] leading-snug text-slate-700">${escaparHtml(mensaje)}</p>`
    : undefined;
}

// Se cierra solo a los 1,8 s (sin botones)
function alertaExito(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'verde', icono: 'success', iconoSvg: ICONOS.check,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar', autoCerrar: true,
  });
}

// Siempre lleva botón, para que no se pierda
function alertaError(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'rojo', icono: 'error', iconoSvg: ICONOS.equis,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
  });
}

function alertaAdvertencia(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.alerta,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
  });
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
  familiarNombres: string;
  familiarApellidos: string;
  parentesco: string;
  telefono1: string;
  telefono2: string;
  direccion: string;
  correoElectronico: string;
  municipio: string;
  sede: string;
  habitacion: string;
  cama: string;
  estado: string;
}

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

  // =========================================================
  // URL BASE DE LA API
  // =========================================================

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  // =========================================================
  // VARIABLES
  // =========================================================

  patients: any[] = [];
  patientsPaginaActual: any[] = [];

  patientsPorPagina = 10;

  paginaActual = 1;

  totalPaginas = 1;

  paginas: number[] = [];
  searchText = '';

  modalOpen = false;
  viewModalOpen = false;

  editingId: number | null = null;

  selectedPatient: any = null;

  form: PatientForm = this.formularioVacio();

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit() {
    this.listar();
  }

  // =========================================================
  // FORMULARIO VACÍO
  // =========================================================

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
      familiarNombres: '',
      familiarApellidos: '',
      parentesco: '',
      telefono1: '',
      telefono2: '',
      direccion: '',
      correoElectronico: '',
      municipio: '',
      sede: '',
      habitacion: '',
      cama: '',
      estado: 'active'
    };
  }

  // =========================================================
  // LISTAR PACIENTES
  // =========================================================

  listar() {
    this.http.get<any[]>(
      `${this.apiUrl}/pacientes/`
).subscribe({
      next: (respuesta) => {
        console.log('Pacientes recibidos:', respuesta);
        this.patients = [...respuesta].sort(
          (a, b) => (a.id_paciente ?? 0) - (b.id_paciente ?? 0)
        );
        console.log('TOTAL PACIENTES:', this.patients.length);
        console.log('PRIMER PACIENTE:', this.patients[0]);
         this.actualizarPaginacion();
        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error al obtener los pacientes:',
          error
        );

      }
    });
  }

  // =========================================================
  // FILTRAR PACIENTES
  // =========================================================

  get filteredPatients(): any[] {

    const texto =
      this.searchText
        .trim()
        .toLowerCase();

    if (!texto) {
      return this.patients;
    }

    return this.patients.filter((patient) => {

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

    });
  }
  // =========================================================
  // ACTUALIZAR PAGINACIÓN
  // =========================================================

  actualizarPaginacion(): void {


    this.totalPaginas = Math.ceil(
      this.filteredPatients.length /
      this.patientsPorPagina
    );


    this.paginas = Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );


    if (this.paginaActual > this.totalPaginas) {

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


  // =========================================================
  // CAMBIAR PÁGINA
  // =========================================================

  cambiarPagina(pagina: number): void {


    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }


    this.paginaActual = pagina;


    this.actualizarPaginacion();

  }

  // =========================================================
  // CALCULAR EDAD DE UN PACIENTE
  // =========================================================

  calcularEdadPaciente(
    fechaNacimiento: string
  ): number {

    if (!fechaNacimiento) {
      return 0;
    }

    const nacimiento =
      new Date(fechaNacimiento);

    const hoy = new Date();

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

  // =========================================================
  // NUEVO PACIENTE
  // =========================================================

  nuevo() {

    this.form =
      this.formularioVacio();

    this.editingId = null;

    this.modalOpen = true;
  }

  // =========================================================
  // EDITAR PACIENTE
  // =========================================================

  editarPaciente(patient: any) {

    this.editingId =
      patient.id_paciente;

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

      habitacion:
        patient.habitacion !== null &&
          patient.habitacion !== undefined
          ? patient.habitacion.toString()
          : '',

      cama:
        patient.cama !== null &&
          patient.cama !== undefined
          ? patient.cama.toString()
          : '',

      estado:
        patient.estado
          ? 'active'
          : 'inactive'
    };

    if (this.form.nacimiento) {
      this.calcularEdad();
    }

    this.http.get<any[]>(
      `${this.apiUrl}/familiar_responsable/`
    ).subscribe({

      next: (familiares) => {

        console.log(
          'Familiares recibidos:',
          familiares
        );

        const familiar =
          familiares.find(
            item =>
              item.id_paciente ===
              patient.id_paciente
          );

        console.log(
          'Familiar del paciente:',
          familiar
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
      }

    });
  }

  // =========================================================
  // GUARDAR
  // =========================================================

  guardar() {

    if (this.editar) {
      this.actualizar();
    } else {
      this.crear();
    }

  }

  // =========================================================
  // CREAR PACIENTE
  // =========================================================

  crear() {

    const paciente = {

      nombre:
        this.form.nombre,

      apellido:
        this.form.apellidos,

      eps:
        this.form.eps,

      sede:
        this.form.sede,

      fecha_ingreso:
        this.form.fechaIngreso,

      habitacion:
        Number(this.form.habitacion),

      id_usuario:
        null,

      tipo_documento:
        this.form.tipoIdentificacion,

      numero_documento:
        this.form.documento,

      fecha_nacimiento:
        this.form.nacimiento,

      genero:
        this.form.genero,

      grupo_sanguineo:
        this.form.grupoSanguineo || null,

      rh:
        this.form.rh || null,

      cama:
        Number(this.form.cama),

      estado:
        this.form.estado === 'active'
    };

    console.log(
      'Paciente que se enviará:',
      paciente
    );

    this.http.post<any>(
      `${this.apiUrl}/pacientes/`,
      paciente
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'Paciente creado:',
          respuesta
        );

        const idPaciente =
          respuesta.id_paciente;

        console.log(
          'ID del paciente creado:',
          idPaciente
        );

        const familiar = {

          nombres:
            this.form.familiarNombres,

          apellidos:
            this.form.familiarApellidos,

          parentesco:
            this.form.parentesco,

          telefono_uno:
            this.form.telefono1,

          telefono_dos:
            this.form.telefono2 || null,

          direccion:
            this.form.direccion || null,

          correo:
            this.form.correoElectronico || null,

          municipio:
            this.form.municipio || null,

          id_paciente:
            idPaciente
        };

        console.log(
          'Familiar que se enviará:',
          familiar
        );

        this.http.post(
          `${this.apiUrl}/familiar_responsable/`,
          familiar
        ).subscribe({

          next: (respuestaFamiliar) => {

            console.log(
              'Familiar creado:',
              respuestaFamiliar
            );

            alertaExito('Paciente registrado correctamente');

            this.listar();

            this.closeModal();
          },

          error: (error) => {

            console.error(
              'Error al crear el familiar responsable:',
              error
            );

            console.error(
              'Detalle del error:',
              error.error
            );

            alertaAdvertencia('Paciente creado, pero hubo un problema', 'No se pudo guardar el familiar responsable.');

            this.listar();
          }

        });
      },

      error: (error) => {
        console.error(
          'Error al crear paciente:',
          error
        );

        console.error(
          'Detalle del error:',
          error.error
        );

        let detalle = 'No se pudo guardar el paciente.';

        if (error.error && typeof error.error === 'object') {

          const mensajes = Object.entries(error.error).map(
            ([campo, valor]: [string, any]) =>
              Array.isArray(valor)
                ? `${campo}: ${valor.join(', ')}`
                : `${campo}: ${valor}`
          );

          if (mensajes.length > 0) {
            detalle = mensajes.join(' | ');
          }

        } else if (typeof error.error === 'string') {
          detalle = error.error;
        }

        alertaError('Error al registrar el paciente', detalle);
      }

    });
  }

  // =========================================================
  // ACTUALIZAR PACIENTE
  // =========================================================

  actualizar() {

    if (this.editingId === null) {
      return;
    }

    const paciente = {

      nombre:
        this.form.nombre,

      apellido:
        this.form.apellidos,

      eps:
        this.form.eps,

      sede:
        this.form.sede,

      fecha_ingreso:
        this.form.fechaIngreso,

      habitacion:
        Number(this.form.habitacion),

      id_usuario:
        null,

      tipo_documento:
        this.form.tipoIdentificacion,

      numero_documento:
        this.form.documento,

      fecha_nacimiento:
        this.form.nacimiento,

      genero:
        this.form.genero,

      grupo_sanguineo:
        this.form.grupoSanguineo || null,

      rh:
        this.form.rh || null,

      cama:
        Number(this.form.cama),

      estado:
        this.form.estado === 'active'
    };

    console.log(
      'Paciente que se actualizará:',
      paciente
    );

    this.http.put(
      `${this.apiUrl}/pacientes/${this.editingId}/`,
      paciente
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'Paciente actualizado:',
          respuesta
        );

        this.http.get<any[]>(
          `${this.apiUrl}/familiar_responsable/`
        ).subscribe({

          next: (familiares) => {

            const familiar =
              familiares.find(
                item =>
                  item.id_paciente ===
                  this.editingId
              );

            console.log(
              'Familiar encontrado:',
              familiar
            );

            if (familiar) {

              const familiarActualizado = {

                nombres:
                  this.form.familiarNombres,

                apellidos:
                  this.form.familiarApellidos,

                parentesco:
                  this.form.parentesco,

                telefono_uno:
                  this.form.telefono1,

                telefono_dos:
                  this.form.telefono2 || null,

                direccion:
                  this.form.direccion || null,

                correo:
                  this.form.correoElectronico || null,

                municipio:
                  this.form.municipio || null,

                id_paciente:
                  this.editingId
              };

              console.log(
                'Familiar que se actualizará:',
                familiarActualizado
              );

              this.http.put(
                `${this.apiUrl}/familiar_responsable/${familiar.id_familiar_responsable}/`,
                familiarActualizado
              ).subscribe({

                next: (respuestaFamiliar) => {

                  console.log(
                    'Familiar actualizado:',
                    respuestaFamiliar
                  );

                  alertaExito('Paciente actualizado correctamente');

                  this.listar();

                  this.closeModal();
                },

                error: (error) => {

                  console.error(
                    'Error al actualizar el familiar responsable:',
                    error
                  );

                  console.error(
                    'Detalle del error:',
                    error.error
                  );

                 alertaAdvertencia('Paciente actualizado', 'El paciente se actualizó, pero hubo un problema con el familiar responsable.');

                  this.listar();
                }

              });

            } else {

              console.warn(
                'No se encontró familiar responsable para el paciente, se creará uno nuevo:',
                this.editingId
              );

              const nuevoFamiliar = {
                nombres: this.form.familiarNombres,
                apellidos: this.form.familiarApellidos,
                parentesco: this.form.parentesco,
                telefono_uno: this.form.telefono1,
                telefono_dos: this.form.telefono2 || null,
                direccion: this.form.direccion || null,
                correo: this.form.correoElectronico || null,
                municipio: this.form.municipio || null,
                id_paciente: this.editingId
              };

              this.http.post(
                `${this.apiUrl}/familiar_responsable/`,
                nuevoFamiliar
              ).subscribe({

                next: (respuestaFamiliar) => {

                  console.log(
                    'Familiar responsable creado en edición:',
                    respuestaFamiliar
                  );

                 alertaExito('Paciente actualizado correctamente');

                  this.listar();
                  this.closeModal();
                },

                error: (errorFamiliar) => {

                  console.error(
                    'Error al crear el familiar responsable en edición:',
                    errorFamiliar
                  );

                 alertaAdvertencia('Paciente actualizado', 'El paciente se actualizó, pero no se pudo guardar el familiar responsable.');

                  this.listar();
                  this.closeModal();
                }
              });
            }

          },

          error: (error) => {

            console.error(
              'Error al obtener los familiares:',
              error
            );

            alertaAdvertencia('Paciente actualizado', 'El paciente se actualizó, pero no se pudo consultar el familiar responsable.');

            this.listar();
          }

        });

      },

      error: (error) => {

        console.error(
          'Error al actualizar paciente:',
          error
        );

        console.error(
          'Detalle del error:',
          error.error
        );

        alertaError('Error al actualizar el paciente');

      }

    });
  }

  // =========================================================
  // CAMBIAR ESTADO
  // =========================================================

cambiarEstado(patient: any) {

  const nuevoEstado = !patient.estado;
  const nombre = `${patient.nombre} ${patient.apellido}`.trim();

  const pregunta = nuevoEstado
    ? alertaActivar(nombre, 'paciente')
    : alertaDesactivar(nombre, 'paciente');

  pregunta.then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    const pacienteActualizado = {
      ...patient,
      estado: nuevoEstado
    };

    this.http.put(
      `${this.apiUrl}/pacientes/${patient.id_paciente}/`,
      pacienteActualizado
    ).subscribe({

      next: () => {

        patient.estado = nuevoEstado;
        this.cdr.detectChanges();

        alertaExito(
          'Estado actualizado',
          nuevoEstado ? 'El paciente ha sido activado.' : 'El paciente ha sido desactivado.'
        );
      },

      error: (error) => {
        console.error('Error al cambiar el estado del paciente:', error);
        alertaError('Error', 'No fue posible cambiar el estado del paciente.');
      }

    });

  });
}

  // =========================================================
  // INDICAR SI ESTÁ EDITANDO
  // =========================================================

  get editar(): boolean {
    return this.editingId !== null;
  }

  // =========================================================
  // ABRIR MODAL
  // =========================================================

  openModal(
    mode: 'new' | 'edit',
    patientId?: number
  ) {

    if (mode === 'new') {

      this.nuevo();

      return;
    }

    if (patientId !== undefined) {

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

  // =========================================================
  // CERRAR MODAL
  // =========================================================

  closeModal() {

    this.modalOpen = false;

    this.editingId = null;

    this.form =
      this.formularioVacio();
  }

  // =========================================================
  // CERRAR MODAL AL HACER CLIC EN EL FONDO
  // =========================================================

  closeOnBackdrop(
    event: MouseEvent
  ) {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.closeModal();

    }
  }

  // =========================================================
  // GUARDAR PACIENTE
  // =========================================================

  savePatient() {

    this.guardar();

  }

  // =========================================================
  // VER PACIENTE
  // =========================================================

  viewPatient(id: number) {

    const patient =
      this.patients.find(
        item =>
          item.id_paciente ===
          id
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

    this.http.get<any[]>(
      `${this.apiUrl}/familiar_responsable/`
    ).subscribe({

      next: (familiares) => {

        console.log(
          'Familiares recibidos para consultar:',
          familiares
        );

        const familiar =
          familiares.find(
            item =>
              item.id_paciente ===
              id
          );

        console.log(
          'Familiar del paciente:',
          familiar
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
          'Error al obtener el familiar responsable:',
          error
        );

        this.viewModalOpen = true;

        this.cdr.detectChanges();
      }

    });
  }

  // =========================================================
  // CERRAR MODAL DE VISUALIZACIÓN
  // =========================================================

  closeViewModal() {

    this.viewModalOpen = false;

    this.selectedPatient = null;
  }

  // =========================================================
  // CALCULAR EDAD
  // =========================================================

  calcularEdad() {

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

  // =========================================================
  // TÍTULO DEL MODAL
  // =========================================================

  get modalTitle(): string {

    return this.editar
      ? 'Editar paciente'
      : 'Nuevo paciente';
  }

  // =========================================================
  // TEXTO DEL BOTÓN GUARDAR
  // =========================================================

  get saveButtonText(): string {

    return this.editar
      ? 'Guardar cambios'
      : 'Guardar paciente';
  }

}
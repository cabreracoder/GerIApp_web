import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Catalogo {
  nombre: string;
}

interface Medicamento {
  id_medicamentos?: number;
  nombre: string;
  descripcion: string;
  principio_activo: string;
  concentracion: string;
  presentacion: string;
  estado: boolean;
  unidad_medida: string;
}

interface TipoInsumo {
  id_tipo_insumo?: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

interface Insumo {
  id_insumo?: number;
  id_tipo_insumo: number | null;
  nombre: string;
  descripcion: string;
  unidad_medida: string;
  estado: boolean;
}

interface Turno {
  id_turno?: number;
  hora_inicio: string;
  hora_fin: string | null;
  estado: boolean;
  nombre: string;
  descripcion: string;
}

interface Habitacion {
  id_habitacion?: number;
  nombre: string;
  numero: string;
  descripcion: string | null;
  estado: boolean;
}

interface Cama {
  id_cama?: number;
  nombre: string;
  numero: string;
  estado: boolean;
  id_habitacion: number | null;
}

interface GrupoMedicacion {
  id_grupo?: number;
  nombre: string;
  descripcion: string | null;
  hora_rango_inicial: string;
  hora_rango_final: string;
  estado: boolean;
}

// =====================================================
// ALERTAS (SweetAlert2 + Tailwind)
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
  },
};

// Iconos blancos del panel
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
  ),
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

// Motor único de alertas
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

// Confirmaciones
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
    enfocarCancelar: c.enfocarCancelar,
  });
}

// Alerta eliminar
function alertaEliminar(
  nombre: string,
  entidad = 'encargado'
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
    enfocarCancelar: true,
  });
}

// Alerta desactivar
function alertaDesactivar(
  nombre: string,
  entidad = 'encargado'
) {
  return alertaConfirmar({
    tono: 'ambar',
    icono: 'warning',
    iconoSvg: ICONOS.prohibido,
    verbo: 'Desactivar',
    entidad,
    nombre,
    subtitulo: 'Cambio reversible · puedes reactivarlo luego',
    confirmar: 'Sí, desactivar',
  });
}

// Alerta editar
function alertaEditar(
  nombre: string,
  entidad = 'encargado'
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
    confirmarIzquierda: true,
  });
}

// Alerta activar
function alertaActivar(
  nombre: string,
  entidad = 'encargado'
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
    confirmarIzquierda: true,
  });
}

// Avisos
function htmlMensaje(mensaje?: string): string | undefined {
  return mensaje
    ? `<p class="m-0 text-[1.15rem] leading-snug text-slate-700">${escaparHtml(mensaje)}</p>`
    : undefined;
}

// Éxito
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
    autoCerrar: true,
  });
}

// Error
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
    confirmar: 'Aceptar',
  });
}

// Advertencia
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
    confirmar: 'Aceptar',
  });
}

@Component({
  selector: 'app-banco-datos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './banco-datos.html',
  styleUrl: './banco-datos.css'
})
export class BancoDatos implements OnInit {

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  habitaciones: Habitacion[] = [];

  // =========================================================
  // CATÁLOGOS
  // =========================================================

  catalogos: Catalogo[] = [
    {
      nombre: 'Medicamentos'
    },
    {
      nombre: 'Tipos de insumo'
    },
    {
      nombre: 'Insumos'
    },
    {
      nombre: 'Turnos'
    },
    {
      nombre: 'Habitaciones'
    },
    {
      nombre: 'Camas'
    },
    {
      nombre: 'Grupos de medicación'
    }
  ];

  catalogoSeleccionado = 'Medicamentos';

  // =========================================================
  // ESTADOS GENERALES
  // =========================================================

  cargando = false;

  cargandoMedicamentos = false;
  cargandoTiposInsumo = false;
  cargandoInsumos = false;
  cargandoTurnos = false;
  cargandoHabitaciones = false;
  cargandoCamas = false;
  cargandoGruposMedicacion = false;

  mensajeExito = '';
  mensajeError = '';

  // =========================================================
  // MEDICAMENTOS
  // =========================================================

  medicamentos: Medicamento[] = [];

  medicamentoForm: Medicamento = {
    nombre: '',
    descripcion: '',
    principio_activo: '',
    concentracion: '',
    presentacion: '',
    estado: true,
    unidad_medida: ''
  };

  medicamentoEditando: number | null = null;
  private medicamentoOriginal: Medicamento | null = null;

  mostrandoFormulario = false;
  modoEdicion = false;

  // =========================================================
  // TIPOS DE INSUMO
  // =========================================================

  tiposInsumo: TipoInsumo[] = [];

  tipoInsumoForm: TipoInsumo = {
    nombre: '',
    descripcion: '',
    estado: 'Activo'
  };

  tipoInsumoEditando: number | null = null;
  private tipoInsumoOriginal: TipoInsumo | null = null;

  mostrandoFormularioTipoInsumo = false;
  modoEdicionTipoInsumo = false;

  // =========================================================
  // INSUMOS
  // =========================================================

  insumos: Insumo[] = [];

  insumoForm: Insumo = {
    id_tipo_insumo: null,
    nombre: '',
    descripcion: '',
    unidad_medida: '',
    estado: true
  };

  insumoEditando: number | null = null;
  private insumoOriginal: Insumo | null = null;

  mostrandoFormularioInsumo = false;
  modoEdicionInsumo = false;

  // =========================================================
  // TURNOS
  // =========================================================

  turnos: Turno[] = [];

  turnoForm: Turno = {
    hora_inicio: '',
    hora_fin: null,
    estado: true,
    nombre: '',
    descripcion: ''
  };

  turnoEditando: number | null = null;
  private turnoOriginal: Turno | null = null;

  mostrandoFormularioTurno = false;
  modoEdicionTurno = false;

  // =========================================================
  // HABITACIONES
  // =========================================================

  mostrandoFormularioHabitacion = false;
  modoEdicionHabitacion = false;

  habitacionEditando: number | null = null;
  private habitacionOriginal: Habitacion | null = null;

  habitacionForm: Habitacion = {
    nombre: '',
    numero: '',
    descripcion: '',
    estado: true
  };

  // =========================================================
  // CAMAS
  // =========================================================

  camas: Cama[] = [];

  mostrandoFormularioCama = false;
  modoEdicionCama = false;

  camaEditando: number | null = null;
  private camaOriginal: Cama | null = null;

  camaForm: Cama = {
    nombre: '',
    numero: '',
    estado: true,
    id_habitacion: null
  };

  // =========================================================
  // GRUPOS DE MEDICACIÓN
  // =========================================================

  gruposMedicacion: GrupoMedicacion[] = [];

  mostrandoFormularioGrupoMedicacion = false;
  modoEdicionGrupoMedicacion = false;

  grupoMedicacionEditando: number | null = null;
  private grupoMedicacionOriginal: GrupoMedicacion | null = null;

  grupoMedicacionForm: GrupoMedicacion = {
    nombre: '',
    descripcion: '',
    hora_rango_inicial: '',
    hora_rango_final: '',
    estado: true
  };

  // =========================================================
  // COMPATIBILIDAD CON EL HTML
  // =========================================================

  get medicamentoActual(): Medicamento {
    return this.medicamentoForm;
  }

  set medicamentoActual(valor: Medicamento) {
    this.medicamentoForm = valor;
  }

  get tipoInsumoActual(): TipoInsumo {
    return this.tipoInsumoForm;
  }

  set tipoInsumoActual(valor: TipoInsumo) {
    this.tipoInsumoForm = valor;
  }

  get insumoActual(): Insumo {
    return this.insumoForm;
  }

  set insumoActual(valor: Insumo) {
    this.insumoForm = valor;
  }

  get turnoActual(): Turno {
    return this.turnoForm;
  }

  set turnoActual(valor: Turno) {
    this.turnoForm = valor;
  }

  get habitacionActual(): Habitacion {
    return this.habitacionForm;
  }

  set habitacionActual(valor: Habitacion) {
    this.habitacionForm = valor;
  }

  get camaActual(): Cama {
    return this.camaForm;
  }

  set camaActual(valor: Cama) {
    this.camaForm = valor;
  }

  get grupoMedicacionActual(): GrupoMedicacion {
    return this.grupoMedicacionForm;
  }

  set grupoMedicacionActual(valor: GrupoMedicacion) {
    this.grupoMedicacionForm = valor;
  }

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

  ngOnInit(): void {
    this.seleccionarCatalogo('Medicamentos');
  }

  // =========================================================
  // SELECCIONAR CATÁLOGO
  // =========================================================

  seleccionarCatalogo(nombre: string): void {

    this.catalogoSeleccionado = nombre;

    this.limpiarMensajes();
    this.cerrarTodosLosFormularios();

    switch (nombre) {

      case 'Medicamentos':
        this.cargarMedicamentos();
        break;

      case 'Tipos de insumo':
        this.cargarTiposInsumo();
        break;

      case 'Insumos':
        this.cargarTiposInsumo();
        this.cargarInsumos();
        break;

      case 'Turnos':
        this.cargarTurnos();
        break;

      case 'Habitaciones':
        this.cargarHabitaciones();
        break;

      case 'Camas':
        this.cargarHabitaciones();
        this.cargarCamas();
        break;

      case 'Grupos de medicación':
        this.cargarGruposMedicacion();
        break;
    }
  }

  // =========================================================
  // CERRAR TODOS LOS FORMULARIOS
  // =========================================================

  cerrarTodosLosFormularios(): void {

    this.mostrandoFormulario = false;
    this.mostrandoFormularioTipoInsumo = false;
    this.mostrandoFormularioInsumo = false;
    this.mostrandoFormularioTurno = false;
    this.mostrandoFormularioHabitacion = false;
    this.mostrandoFormularioCama = false;
    this.mostrandoFormularioGrupoMedicacion = false;

    this.modoEdicion = false;
    this.modoEdicionTipoInsumo = false;
    this.modoEdicionInsumo = false;
    this.modoEdicionTurno = false;
    this.modoEdicionHabitacion = false;
    this.modoEdicionCama = false;
    this.modoEdicionGrupoMedicacion = false;
  }

  // =========================================================
  // MEDICAMENTOS - ABRIR NUEVO
  // =========================================================

  abrirNuevoMedicamento(): void {

    this.limpiarFormularioMedicamento();
    this.limpiarMensajes();

    this.modoEdicion = false;
    this.mostrandoFormulario = true;
  }

  // =========================================================
  // MEDICAMENTOS - CERRAR
  // =========================================================

  cerrarFormulario(): void {

    this.limpiarFormularioMedicamento();

    this.mostrandoFormulario = false;
    this.modoEdicion = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // MEDICAMENTOS - LISTAR
  // =========================================================

  cargarMedicamentos(): void {

    this.cargando = true;
    this.cargandoMedicamentos = true;

    this.http.get<Medicamento[]>(
      `${this.apiUrl}/medicamentos/`
    ).subscribe({

      next: (respuesta) => {

        this.medicamentos = respuesta || [];

        this.cargando = false;
        this.cargandoMedicamentos = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        this.cargando = false;
        this.cargandoMedicamentos = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los medicamentos.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // MEDICAMENTOS - GUARDAR
  // =========================================================

  guardarMedicamento(): void {

    this.limpiarMensajes();

    if (!this.validarMedicamento()) {
      return;
    }

    if (
      this.medicamentoEditando !== null &&
      this.medicamentoOriginal &&
      !this.huboCambios(
        this.medicamentoOriginal,
        this.medicamentoForm,
        [
          'nombre',
          'descripcion',
          'principio_activo',
          'concentracion',
          'presentacion',
          'estado',
          'unidad_medida'
        ]
      )
    ) {
      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo del medicamento.'
      );
      return;
    }

    this.cargando = true;

    const datosMedicamento = {
      nombre: this.medicamentoForm.nombre,
      descripcion: this.medicamentoForm.descripcion,
      principio_activo: this.medicamentoForm.principio_activo,
      concentracion: this.medicamentoForm.concentracion,
      presentacion: this.medicamentoForm.presentacion,
      estado: this.medicamentoForm.estado,
      unidad_medida: this.medicamentoForm.unidad_medida
    };

    if (this.medicamentoEditando !== null) {

      this.http.patch(
        `${this.apiUrl}/medicamentos/${this.medicamentoEditando}/`,
        datosMedicamento
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Medicamento actualizado',
            'Medicamento actualizado correctamente.'
          );

          this.limpiarFormularioMedicamento();

          this.mostrandoFormulario = false;
          this.modoEdicion = false;

          this.cargarMedicamentos();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL ACTUALIZAR MEDICAMENTO:',
            error
          );

          alertaError(
            'Error al actualizar',
            this.obtenerMensajeError(
              error,
              'No se pudo actualizar el medicamento.'
            )
          );
        }
      });

    } else {

      this.http.post(
        `${this.apiUrl}/medicamentos/`,
        datosMedicamento
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Medicamento creado',
            'Medicamento creado correctamente.'
          );

          this.limpiarFormularioMedicamento();

          this.mostrandoFormulario = false;
          this.modoEdicion = false;

          this.cargarMedicamentos();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL CREAR MEDICAMENTO:',
            error
          );

          console.error(
            'RESPUESTA DEL SERVIDOR:',
            error.error
          );

          alertaError(
            'Error al crear',
            this.obtenerMensajeError(
              error,
              'No se pudo crear el medicamento.'
            )
          );
        }
      });
    }
  }

  // =========================================================
  // MEDICAMENTOS - EDITAR
  // =========================================================

  editarMedicamento(
    medicamento: Medicamento
  ): void {

    this.medicamentoEditando =
      medicamento.id_medicamentos ?? null;

    this.medicamentoForm = {
      id_medicamentos: medicamento.id_medicamentos,
      nombre: medicamento.nombre,
      descripcion: medicamento.descripcion,
      principio_activo: medicamento.principio_activo,
      concentracion: medicamento.concentracion,
      presentacion: medicamento.presentacion,
      estado: medicamento.estado,
      unidad_medida: medicamento.unidad_medida
    };

    this.medicamentoOriginal = {
      ...medicamento
    };

    this.limpiarMensajes();

    this.modoEdicion = true;
    this.mostrandoFormulario = true;
  }

  // =========================================================
  // MEDICAMENTOS - ELIMINAR
  // =========================================================

  eliminarMedicamento(
    medicamento: Medicamento
  ): void {

    const id = medicamento.id_medicamentos;

    if (!id) {
      return;
    }

    alertaEliminar(
      medicamento.nombre,
      'medicamento'
    ).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `${this.apiUrl}/medicamentos/${id}/`
      ).subscribe({

        next: () => {

          alertaExito(
            'Medicamento eliminado'
          );

          this.cargarMedicamentos();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al eliminar',
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar el medicamento.'
            )
          );
        }
      });
    });
  }

  // =========================================================
  // MEDICAMENTOS - LIMPIAR
  // =========================================================

  cancelarEdicionMedicamento(): void {
    this.cerrarFormulario();
  }

  limpiarFormularioMedicamento(): void {

    this.medicamentoEditando = null;
    this.modoEdicion = false;
    this.medicamentoOriginal = null;

    this.medicamentoForm = {
      nombre: '',
      descripcion: '',
      principio_activo: '',
      concentracion: '',
      presentacion: '',
      estado: true,
      unidad_medida: ''
    };
  }

  validarMedicamento(): boolean {

    if (!this.medicamentoForm.nombre.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El nombre del medicamento es obligatorio.'
      );

      return false;
    }

    if (!this.medicamentoForm.principio_activo.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El principio activo es obligatorio.'
      );

      return false;
    }

    return true;
  }

  // =========================================================
  // TIPOS DE INSUMO - ABRIR NUEVO
  // =========================================================

  abrirNuevoTipoInsumo(): void {

    this.limpiarFormularioTipoInsumo();
    this.limpiarMensajes();

    this.modoEdicionTipoInsumo = false;
    this.mostrandoFormularioTipoInsumo = true;
  }

  // =========================================================
  // TIPOS DE INSUMO - CERRAR
  // =========================================================

  cerrarFormularioTipoInsumo(): void {

    this.limpiarFormularioTipoInsumo();

    this.mostrandoFormularioTipoInsumo = false;
    this.modoEdicionTipoInsumo = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // TIPOS DE INSUMO - LISTAR
  // =========================================================

  cargarTiposInsumo(): void {

    this.cargandoTiposInsumo = true;

    this.http.get<TipoInsumo[]>(
      `${this.apiUrl}/tipo_insumo/`
    ).subscribe({

      next: (respuesta) => {

        this.tiposInsumo = respuesta || [];

        this.cargandoTiposInsumo = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        this.cargandoTiposInsumo = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los tipos de insumo.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // TIPOS DE INSUMO - GUARDAR
  // =========================================================

  guardarTipoInsumo(): void {

    this.limpiarMensajes();

    if (!this.tipoInsumoForm.nombre.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El nombre del tipo de insumo es obligatorio.'
      );

      return;
    }

    if (
      this.tipoInsumoEditando !== null &&
      this.tipoInsumoOriginal &&
      !this.huboCambios(
        this.tipoInsumoOriginal,
        this.tipoInsumoForm,
        [
          'nombre',
          'descripcion',
          'estado'
        ]
      )
    ) {

      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo del tipo de insumo.'
      );

      return;
    }

    this.cargando = true;

    if (this.tipoInsumoEditando !== null) {

      this.http.patch(
        `${this.apiUrl}/tipo_insumo/${this.tipoInsumoEditando}/`,
        this.tipoInsumoForm
      ).subscribe({

        next: () => {

          alertaExito(
            'Tipo de insumo actualizado',
            'Tipo de insumo actualizado correctamente.'
          );

          this.limpiarFormularioTipoInsumo();

          this.mostrandoFormularioTipoInsumo = false;
          this.modoEdicionTipoInsumo = false;

          this.cargarTiposInsumo();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al actualizar',
            this.obtenerMensajeError(
              error,
              'No se pudo actualizar el tipo de insumo.'
            )
          );
        }
      });

    } else {

      this.http.post(
        `${this.apiUrl}/tipo_insumo/`,
        this.tipoInsumoForm
      ).subscribe({

        next: () => {

          alertaExito(
            'Tipo de insumo creado',
            'Tipo de insumo creado correctamente.'
          );

          this.limpiarFormularioTipoInsumo();

          this.mostrandoFormularioTipoInsumo = false;
          this.modoEdicionTipoInsumo = false;

          this.cargarTiposInsumo();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al crear',
            this.obtenerMensajeError(
              error,
              'No se pudo crear el tipo de insumo.'
            )
          );
        }
      });
    }
  }

  // =========================================================
  // TIPOS DE INSUMO - EDITAR
  // =========================================================

  editarTipoInsumo(
    tipo: TipoInsumo
  ): void {

    this.tipoInsumoEditando =
      tipo.id_tipo_insumo ?? null;

    this.tipoInsumoForm = {
      id_tipo_insumo: tipo.id_tipo_insumo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      estado: tipo.estado
    };

    this.tipoInsumoOriginal = {
      ...tipo
    };

    this.limpiarMensajes();

    this.modoEdicionTipoInsumo = true;
    this.mostrandoFormularioTipoInsumo = true;
  }

  // =========================================================
  // TIPOS DE INSUMO - ELIMINAR
  // =========================================================

  eliminarTipoInsumo(
    tipo: TipoInsumo
  ): void {

    const id = tipo.id_tipo_insumo;

    if (!id) {
      return;
    }

    alertaEliminar(
      tipo.nombre,
      'tipo de insumo'
    ).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `${this.apiUrl}/tipo_insumo/${id}/`
      ).subscribe({

        next: () => {

          alertaExito(
            'Tipo de insumo eliminado'
          );

          this.cargarTiposInsumo();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al eliminar',
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar el tipo de insumo.'
            )
          );
        }
      });
    });
  }

  cancelarEdicionTipoInsumo(): void {
    this.cerrarFormularioTipoInsumo();
  }

  limpiarFormularioTipoInsumo(): void {

    this.tipoInsumoEditando = null;
    this.modoEdicionTipoInsumo = false;
    this.tipoInsumoOriginal = null;

    this.tipoInsumoForm = {
      nombre: '',
      descripcion: '',
      estado: 'Activo'
    };
  }

  // =========================================================
  // INSUMOS - ABRIR NUEVO
  // =========================================================

  abrirNuevoInsumo(): void {

    this.limpiarFormularioInsumo();
    this.limpiarMensajes();

    this.modoEdicionInsumo = false;
    this.mostrandoFormularioInsumo = true;
  }

  // =========================================================
  // INSUMOS - CERRAR
  // =========================================================

  cerrarFormularioInsumo(): void {

    this.limpiarFormularioInsumo();

    this.mostrandoFormularioInsumo = false;
    this.modoEdicionInsumo = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // INSUMOS - LISTAR
  // =========================================================

  cargarInsumos(): void {

    this.cargandoInsumos = true;

    this.http.get<Insumo[]>(
      `${this.apiUrl}/insumos/`
    ).subscribe({

      next: (respuesta) => {

        this.insumos = respuesta || [];

        this.cargandoInsumos = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        this.cargandoInsumos = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los insumos.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // INSUMOS - GUARDAR
  // =========================================================

  guardarInsumo(): void {

    this.limpiarMensajes();

    if (!this.insumoForm.nombre.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El nombre del insumo es obligatorio.'
      );

      return;
    }

    if (!this.insumoForm.id_tipo_insumo) {

      alertaAdvertencia(
        'Campo obligatorio',
        'Debe seleccionar un tipo de insumo.'
      );

      return;
    }

    if (
      this.insumoEditando !== null &&
      this.insumoOriginal &&
      !this.huboCambios(
        this.insumoOriginal,
        this.insumoForm,
        [
          'nombre',
          'descripcion',
          'unidad_medida',
          'estado',
          'id_tipo_insumo'
        ]
      )
    ) {

      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo del insumo.'
      );

      return;
    }

    this.cargando = true;

    if (this.insumoEditando !== null) {

      this.http.patch(
        `${this.apiUrl}/insumos/${this.insumoEditando}/`,
        this.insumoForm
      ).subscribe({

        next: () => {

          alertaExito(
            'Insumo actualizado',
            'El insumo se ha actualizado correctamente.'
          );

          this.limpiarFormularioInsumo();

          this.mostrandoFormularioInsumo = false;
          this.modoEdicionInsumo = false;

          this.cargarInsumos();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al actualizar',
            this.obtenerMensajeError(
              error,
              'No se pudo actualizar el insumo.'
            )
          );
        }
      });

    } else {

      this.http.post(
        `${this.apiUrl}/insumos/`,
        this.insumoForm
      ).subscribe({

        next: () => {

          alertaExito(
            'Insumo creado',
            'El insumo se ha creado correctamente.'
          );

          this.limpiarFormularioInsumo();

          this.mostrandoFormularioInsumo = false;
          this.modoEdicionInsumo = false;

          this.cargarInsumos();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al crear',
            this.obtenerMensajeError(
              error,
              'No se pudo crear el insumo.'
            )
          );
        }
      });
    }
  }

  // =========================================================
  // INSUMOS - EDITAR
  // =========================================================

  editarInsumo(
    insumo: Insumo
  ): void {

    this.insumoEditando =
      insumo.id_insumo ?? null;

    this.insumoForm = {
      id_insumo: insumo.id_insumo,
      id_tipo_insumo: insumo.id_tipo_insumo,
      nombre: insumo.nombre,
      descripcion: insumo.descripcion,
      unidad_medida: insumo.unidad_medida,
      estado: insumo.estado
    };

    this.insumoOriginal = {
      ...insumo
    };

    this.limpiarMensajes();

    this.modoEdicionInsumo = true;
    this.mostrandoFormularioInsumo = true;
  }

  // =========================================================
  // INSUMOS - ELIMINAR
  // =========================================================

  eliminarInsumo(
    insumo: Insumo
  ): void {

    const id = insumo.id_insumo;

    if (!id) {
      return;
    }

    alertaEliminar(
      insumo.nombre,
      'insumo'
    ).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `${this.apiUrl}/insumos/${id}/`
      ).subscribe({

        next: () => {

          alertaExito(
            'Insumo eliminado'
          );

          this.cargarInsumos();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al eliminar',
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar el insumo.'
            )
          );
        }
      });
    });
  }

  cancelarEdicionInsumo(): void {
    this.cerrarFormularioInsumo();
  }

  limpiarFormularioInsumo(): void {

    this.insumoEditando = null;
    this.modoEdicionInsumo = false;
    this.insumoOriginal = null;

    this.insumoForm = {
      id_tipo_insumo: null,
      nombre: '',
      descripcion: '',
      unidad_medida: '',
      estado: true
    };
  }

  obtenerNombreTipoInsumo(
    idTipo: number | null
  ): string {

    if (!idTipo) {
      return 'Sin tipo';
    }

    const tipo = this.tiposInsumo.find(
      item => item.id_tipo_insumo === idTipo
    );

    return tipo?.nombre ?? 'Sin tipo';
  }

  // =========================================================
  // TURNOS - ABRIR NUEVO
  // =========================================================

  abrirNuevoTurno(): void {

    this.limpiarFormularioTurno();
    this.limpiarMensajes();

    this.modoEdicionTurno = false;
    this.mostrandoFormularioTurno = true;
  }

  // =========================================================
  // TURNOS - CERRAR
  // =========================================================

  cerrarFormularioTurno(): void {

    this.limpiarFormularioTurno();

    this.mostrandoFormularioTurno = false;
    this.modoEdicionTurno = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // TURNOS - LISTAR
  // =========================================================

  cargarTurnos(): void {

    this.cargando = true;
    this.cargandoTurnos = true;

    this.http.get<Turno[]>(
      `${this.apiUrl}/turnos/`
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'TURNOS RECIBIDOS:',
          respuesta
        );

        this.turnos = respuesta || [];

        this.cargando = false;
        this.cargandoTurnos = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR TURNOS:',
          error
        );

        this.cargando = false;
        this.cargandoTurnos = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los turnos.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // TURNOS - GUARDAR
  // =========================================================

  guardarTurno(): void {

    this.limpiarMensajes();

    if (!this.turnoForm.nombre.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El nombre del turno es obligatorio.'
      );

      return;
    }

    if (!this.turnoForm.hora_inicio) {

      alertaAdvertencia(
        'Campo obligatorio',
        'La hora de inicio es obligatoria.'
      );

      return;
    }

    if (
      this.turnoEditando !== null &&
      this.turnoOriginal &&
      !this.huboCambios(
        this.turnoOriginal,
        this.turnoForm,
        [
          'nombre',
          'descripcion',
          'hora_inicio',
          'hora_fin',
          'estado'
        ]
      )
    ) {

      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo del turno.'
      );

      return;
    }

    this.cargando = true;

    if (this.turnoEditando !== null) {

      this.http.patch(
        `${this.apiUrl}/turnos/${this.turnoEditando}/`,
        this.turnoForm
      ).subscribe({

        next: () => {

          alertaExito(
            'Turno actualizado',
            'Turno actualizado correctamente.'
          );

          this.limpiarFormularioTurno();

          this.mostrandoFormularioTurno = false;
          this.modoEdicionTurno = false;

          this.cargarTurnos();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al actualizar',
            this.obtenerMensajeError(
              error,
              'No se pudo actualizar el turno.'
            )
          );
        }
      });

    } else {

      this.http.post(
        `${this.apiUrl}/turnos/`,
        this.turnoForm
      ).subscribe({

        next: () => {

          alertaExito(
            'Turno creado',
            'Turno creado correctamente.'
          );

          this.limpiarFormularioTurno();

          this.mostrandoFormularioTurno = false;
          this.modoEdicionTurno = false;

          this.cargarTurnos();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al crear',
            this.obtenerMensajeError(
              error,
              'No se pudo crear el turno.'
            )
          );
        }
      });
    }
  }

  // =========================================================
  // TURNOS - EDITAR
  // =========================================================

  editarTurno(
    turno: Turno
  ): void {

    this.turnoEditando =
      turno.id_turno ?? null;

    this.turnoForm = {
      id_turno: turno.id_turno,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
      estado: turno.estado,
      nombre: turno.nombre,
      descripcion: turno.descripcion
    };

    this.turnoOriginal = {
      ...turno
    };

    this.limpiarMensajes();

    this.modoEdicionTurno = true;
    this.mostrandoFormularioTurno = true;
  }

  // =========================================================
  // TURNOS - ELIMINAR
  // =========================================================

  eliminarTurno(
    turno: Turno
  ): void {

    const id = turno.id_turno;

    if (!id) {
      return;
    }

    alertaEliminar(
      turno.nombre,
      'turno'
    ).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `${this.apiUrl}/turnos/${id}/`
      ).subscribe({

        next: () => {

          alertaExito(
            'Turno eliminado'
          );

          this.cargarTurnos();
        },

        error: (error) => {

          this.cargando = false;

          alertaError(
            'Error al eliminar',
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar el turno.'
            )
          );
        }
      });
    });
  }

  cancelarEdicionTurno(): void {
    this.cerrarFormularioTurno();
  }

  limpiarFormularioTurno(): void {

    this.turnoEditando = null;
    this.modoEdicionTurno = false;
    this.turnoOriginal = null;

    this.turnoForm = {
      hora_inicio: '',
      hora_fin: null,
      estado: true,
      nombre: '',
      descripcion: ''
    };
  }

  // =========================================================
  // HABITACIONES - ABRIR NUEVA
  // =========================================================

  abrirNuevaHabitacion(): void {

    this.limpiarFormularioHabitacion();
    this.limpiarMensajes();

    this.modoEdicionHabitacion = false;
    this.mostrandoFormularioHabitacion = true;
  }

  // =========================================================
  // CAMAS - ABRIR NUEVA
  // =========================================================

  abrirNuevaCama(): void {

    this.limpiarFormularioCama();
    this.limpiarMensajes();

    this.modoEdicionCama = false;
    this.camaEditando = null;
    this.mostrandoFormularioCama = true;
  }

  // =========================================================
  // HABITACIONES - GUARDAR
  // =========================================================

  guardarHabitacion(): void {

    this.limpiarMensajes();

    if (!this.habitacionForm.nombre.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El nombre de la habitación es obligatorio.'
      );

      return;
    }

    if (!this.habitacionForm.numero.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El número de la habitación es obligatorio.'
      );

      return;
    }

    if (
      this.habitacionEditando !== null &&
      this.habitacionOriginal &&
      !this.huboCambios(
        this.habitacionOriginal,
        this.habitacionForm,
        [
          'nombre',
          'numero',
          'descripcion',
          'estado'
        ]
      )
    ) {

      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo de la habitación.'
      );

      return;
    }

    this.cargando = true;

    const datosHabitacion = {
      nombre: this.habitacionForm.nombre,
      numero: this.habitacionForm.numero,
      descripcion: this.habitacionForm.descripcion,
      estado: this.habitacionForm.estado
    };

    if (this.habitacionEditando !== null) {

      this.http.patch(
        `${this.apiUrl}/habitaciones/${this.habitacionEditando}/`,
        datosHabitacion
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Habitación actualizada',
            'Habitación actualizada correctamente.'
          );

          this.limpiarFormularioHabitacion();

          this.mostrandoFormularioHabitacion = false;
          this.modoEdicionHabitacion = false;

          this.cargarHabitaciones();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL ACTUALIZAR HABITACIÓN:',
            error
          );

          alertaError(
            'Error al actualizar',
            this.obtenerMensajeError(
              error,
              'No se pudo actualizar la habitación.'
            )
          );
        }
      });

    } else {

      this.http.post(
        `${this.apiUrl}/habitaciones/`,
        datosHabitacion
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Habitación creada',
            'Habitación registrada correctamente.'
          );

          this.limpiarFormularioHabitacion();

          this.mostrandoFormularioHabitacion = false;
          this.modoEdicionHabitacion = false;

          this.cargarHabitaciones();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL CREAR HABITACIÓN:',
            error
          );

          alertaError(
            'Error al crear',
            this.obtenerMensajeError(
              error,
              'No se pudo crear la habitación.'
            )
          );
        }
      });
    }
  }

  // =========================================================
  // CAMAS - GUARDAR
  // =========================================================

  guardarCama(): void {

    this.limpiarMensajes();

    if (!this.camaForm.nombre.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El nombre de la cama es obligatorio.'
      );

      return;
    }

    if (!this.camaForm.numero.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El número de la cama es obligatorio.'
      );

      return;
    }

    if (this.camaForm.id_habitacion === null) {

      alertaAdvertencia(
        'Campo obligatorio',
        'Debe seleccionar una habitación.'
      );

      return;
    }

    if (
      this.camaEditando !== null &&
      this.camaOriginal &&
      !this.huboCambios(
        this.camaOriginal,
        this.camaForm,
        [
          'nombre',
          'numero',
          'estado',
          'id_habitacion'
        ]
      )
    ) {

      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo de la cama.'
      );

      return;
    }

    this.cargando = true;

    const datosCama = {
      nombre: this.camaForm.nombre.trim(),
      numero: this.camaForm.numero.trim(),
      estado: this.camaForm.estado,
      id_habitacion: this.camaForm.id_habitacion
    };

    if (this.camaEditando !== null) {

      this.http.patch(
        `${this.apiUrl}/camas/${this.camaEditando}/`,
        datosCama
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Cama actualizada',
            'Cama actualizada correctamente.'
          );

          this.limpiarFormularioCama();

          this.mostrandoFormularioCama = false;
          this.modoEdicionCama = false;

          this.cargarCamas();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL ACTUALIZAR CAMA:',
            error
          );

          alertaError(
            'Error al actualizar',
            this.obtenerMensajeError(
              error,
              'No se pudo actualizar la cama.'
            )
          );
        }
      });

    } else {

      this.http.post(
        `${this.apiUrl}/camas/`,
        datosCama
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Cama creada',
            'Cama registrada correctamente.'
          );

          this.limpiarFormularioCama();

          this.mostrandoFormularioCama = false;
          this.modoEdicionCama = false;

          this.cargarCamas();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL CREAR CAMA:',
            error
          );

          alertaError(
            'Error al crear',
            this.obtenerMensajeError(
              error,
              'No se pudo crear la cama.'
            )
          );
        }
      });
    }
  }

  // =========================================================
  // HABITACIONES - LISTAR
  // =========================================================

  cargarHabitaciones(): void {

    this.cargando = true;
    this.cargandoHabitaciones = true;

    this.http.get<Habitacion[]>(
      `${this.apiUrl}/habitaciones/`
    ).subscribe({

      next: (respuesta) => {

        this.habitaciones = respuesta || [];

        this.cargando = false;
        this.cargandoHabitaciones = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR HABITACIONES:',
          error
        );

        this.cargando = false;
        this.cargandoHabitaciones = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar las habitaciones.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // CAMAS - LISTAR
  // =========================================================

  cargarCamas(): void {

    this.cargando = true;
    this.cargandoCamas = true;

    this.http.get<Cama[]>(
      `${this.apiUrl}/camas/`
    ).subscribe({

      next: (respuesta) => {

        this.camas = respuesta || [];

        this.cargando = false;
        this.cargandoCamas = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR CAMAS:',
          error
        );

        this.cargando = false;
        this.cargandoCamas = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar las camas.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // HABITACIONES - EDITAR
  // =========================================================

  editarHabitacion(
    habitacion: Habitacion
  ): void {

    this.habitacionEditando =
      habitacion.id_habitacion ?? null;

    this.habitacionForm = {

      id_habitacion:
        habitacion.id_habitacion,

      nombre:
        habitacion.nombre,

      numero:
        habitacion.numero,

      descripcion:
        habitacion.descripcion,

      estado:
        habitacion.estado
    };

    this.habitacionOriginal = {
      ...habitacion
    };

    this.limpiarMensajes();

    this.modoEdicionHabitacion = true;
    this.mostrandoFormularioHabitacion = true;
  }

  // =========================================================
  // HABITACIONES - ELIMINAR
  // =========================================================

  eliminarHabitacion(
    habitacion: Habitacion
  ): void {

    const id =
      habitacion.id_habitacion;

    if (!id) {
      return;
    }

    alertaEliminar(
      habitacion.nombre,
      'habitación'
    ).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `${this.apiUrl}/habitaciones/${id}/`
      ).subscribe({

        next: () => {

          alertaExito(
            'Habitación eliminada',
            'Habitación eliminada correctamente.'
          );

          this.cargarHabitaciones();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL ELIMINAR HABITACIÓN:',
            error
          );

          alertaError(
            'Error al eliminar',
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar la habitación.'
            )
          );
        }
      });
    });
  }

  // =========================================================
  // CAMAS - EDITAR
  // =========================================================

  editarCama(
    cama: Cama
  ): void {

    this.camaEditando =
      cama.id_cama ?? null;

    this.camaForm = {

      id_cama:
        cama.id_cama,

      nombre:
        cama.nombre,

      numero:
        cama.numero,

      estado:
        cama.estado,

      id_habitacion:
        cama.id_habitacion
    };

    this.camaOriginal = {
      ...cama
    };

    this.limpiarMensajes();

    this.modoEdicionCama = true;
    this.mostrandoFormularioCama = true;
  }

  // =========================================================
  // CAMAS - ELIMINAR
  // =========================================================

  eliminarCama(
    cama: Cama
  ): void {

    const id =
      cama.id_cama;

    if (!id) {
      return;
    }

    alertaEliminar(
      cama.nombre,
      'cama'
    ).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `${this.apiUrl}/camas/${id}/`
      ).subscribe({

        next: () => {

          alertaExito(
            'Cama eliminada',
            'Cama eliminada correctamente.'
          );

          this.cargarCamas();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL ELIMINAR CAMA:',
            error
          );

          alertaError(
            'Error al eliminar',
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar la cama.'
            )
          );
        }
      });
    });
  }

  // =========================================================
  // FORMULARIOS HABITACIÓN Y CAMA
  // =========================================================

  cerrarFormularioHabitacion(): void {

    this.mostrandoFormularioHabitacion = false;
    this.modoEdicionHabitacion = false;
  }

  cerrarFormularioCama(): void {

    this.mostrandoFormularioCama = false;
    this.modoEdicionCama = false;
    this.camaEditando = null;
  }

  limpiarFormularioHabitacion(): void {

    this.habitacionEditando = null;
    this.modoEdicionHabitacion = false;
    this.habitacionOriginal = null;

    this.habitacionForm = {
      nombre: '',
      numero: '',
      descripcion: '',
      estado: true
    };
  }

  limpiarFormularioCama(): void {

    this.camaForm = {
      nombre: '',
      numero: '',
      estado: true,
      id_habitacion: null
    };

    this.camaEditando = null;
    this.camaOriginal = null;
  }

  // =========================================================
  // GRUPOS DE MEDICACIÓN - ABRIR NUEVO
  // =========================================================

  abrirNuevoGrupoMedicacion(): void {

    this.limpiarFormularioGrupoMedicacion();
    this.limpiarMensajes();

    this.modoEdicionGrupoMedicacion = false;
    this.mostrandoFormularioGrupoMedicacion = true;
  }

  // =========================================================
  // GRUPOS DE MEDICACIÓN - CERRAR
  // =========================================================

  cerrarFormularioGrupoMedicacion(): void {

    this.limpiarFormularioGrupoMedicacion();

    this.mostrandoFormularioGrupoMedicacion = false;
    this.modoEdicionGrupoMedicacion = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // GRUPOS DE MEDICACIÓN - LISTAR
  // =========================================================

  cargarGruposMedicacion(): void {

    this.cargando = true;
    this.cargandoGruposMedicacion = true;

    this.http.get<GrupoMedicacion[]>(
      `${this.apiUrl}/grupo_medicacion/`
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'GRUPOS DE MEDICACIÓN RECIBIDOS:',
          respuesta
        );

        this.gruposMedicacion = respuesta || [];

        this.cargando = false;
        this.cargandoGruposMedicacion = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR GRUPOS DE MEDICACIÓN:',
          error
        );

        this.cargando = false;
        this.cargandoGruposMedicacion = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los grupos de medicación.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // GRUPOS DE MEDICACIÓN - GUARDAR
  // =========================================================

  guardarGrupoMedicacion(): void {

    this.limpiarMensajes();

    if (!this.grupoMedicacionForm.nombre.trim()) {

      alertaAdvertencia(
        'Campo obligatorio',
        'El nombre del grupo de medicación es obligatorio.'
      );

      return;
    }

    if (!this.grupoMedicacionForm.hora_rango_inicial) {

      alertaAdvertencia(
        'Campo obligatorio',
        'La hora inicial es obligatoria.'
      );

      return;
    }

    if (!this.grupoMedicacionForm.hora_rango_final) {

      alertaAdvertencia(
        'Campo obligatorio',
        'La hora final es obligatoria.'
      );

      return;
    }

    if (
      this.grupoMedicacionEditando !== null &&
      this.grupoMedicacionOriginal &&
      !this.huboCambios(
        this.grupoMedicacionOriginal,
        this.grupoMedicacionForm,
        [
          'nombre',
          'descripcion',
          'hora_rango_inicial',
          'hora_rango_final',
          'estado'
        ]
      )
    ) {

      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo del grupo de medicación.'
      );

      return;
    }

    this.cargando = true;

    const datosGrupoMedicacion = {
      nombre:
        this.grupoMedicacionForm.nombre.trim(),

      descripcion:
        this.grupoMedicacionForm.descripcion,

      hora_rango_inicial:
        this.grupoMedicacionForm.hora_rango_inicial,

      hora_rango_final:
        this.grupoMedicacionForm.hora_rango_final,

      estado:
        this.grupoMedicacionForm.estado
    };

    // =======================================================
    // EDITAR GRUPO
    // =======================================================

    if (this.grupoMedicacionEditando !== null) {

      this.http.patch(
        `${this.apiUrl}/grupo_medicacion/${this.grupoMedicacionEditando}/`,
        datosGrupoMedicacion
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Grupo actualizado',
            'El grupo de medicación se actualizó correctamente.'
          );

          this.limpiarFormularioGrupoMedicacion();

          this.mostrandoFormularioGrupoMedicacion = false;
          this.modoEdicionGrupoMedicacion = false;

          this.cargarGruposMedicacion();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL ACTUALIZAR GRUPO DE MEDICACIÓN:',
            error
          );

          alertaError(
            'Error al actualizar',
            this.obtenerMensajeError(
              error,
              'No se pudo actualizar el grupo de medicación.'
            )
          );
        }
      });

    } else {

      // =====================================================
      // CREAR GRUPO
      // =====================================================

      this.http.post(
        `${this.apiUrl}/grupo_medicacion/`,
        datosGrupoMedicacion
      ).subscribe({

        next: () => {

          this.cargando = false;

          alertaExito(
            'Grupo creado',
            'El grupo de medicación se creó correctamente.'
          );

          this.limpiarFormularioGrupoMedicacion();

          this.mostrandoFormularioGrupoMedicacion = false;
          this.modoEdicionGrupoMedicacion = false;

          this.cargarGruposMedicacion();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL CREAR GRUPO DE MEDICACIÓN:',
            error
          );

          console.error(
            'RESPUESTA DEL SERVIDOR:',
            error.error
          );

          alertaError(
            'Error al crear',
            this.obtenerMensajeError(
              error,
              'No se pudo crear el grupo de medicación.'
            )
          );
        }
      });
    }
  }

  // =========================================================
  // GRUPOS DE MEDICACIÓN - EDITAR
  // =========================================================

  editarGrupoMedicacion(
    grupo: GrupoMedicacion
  ): void {

    this.grupoMedicacionEditando =
      grupo.id_grupo ?? null;

    this.grupoMedicacionForm = {

      id_grupo:
        grupo.id_grupo,

      nombre:
        grupo.nombre,

      descripcion:
        grupo.descripcion,

      hora_rango_inicial:
        grupo.hora_rango_inicial,

      hora_rango_final:
        grupo.hora_rango_final,

      estado:
        grupo.estado
    };

    this.grupoMedicacionOriginal = {
      ...grupo
    };

    this.limpiarMensajes();

    this.modoEdicionGrupoMedicacion = true;
    this.mostrandoFormularioGrupoMedicacion = true;
  }

  // =========================================================
  // GRUPOS DE MEDICACIÓN - ELIMINAR
  // =========================================================

  eliminarGrupoMedicacion(
    grupo: GrupoMedicacion
  ): void {

    const id =
      grupo.id_grupo;

    if (!id) {
      return;
    }

    alertaEliminar(
      grupo.nombre,
      'grupo de medicación'
    ).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `${this.apiUrl}/grupo_medicacion/${id}/`
      ).subscribe({

        next: () => {

          alertaExito(
            'Grupo eliminado',
            'El grupo de medicación se eliminó correctamente.'
          );

          this.cargarGruposMedicacion();
        },

        error: (error) => {

          this.cargando = false;

          console.error(
            'ERROR AL ELIMINAR GRUPO DE MEDICACIÓN:',
            error
          );

          alertaError(
            'Error al eliminar',
            this.obtenerMensajeError(
              error,
              'No se pudo eliminar el grupo de medicación.'
            )
          );
        }
      });
    });
  }

  // =========================================================
  // GRUPOS DE MEDICACIÓN - LIMPIAR
  // =========================================================

  cancelarEdicionGrupoMedicacion(): void {
    this.cerrarFormularioGrupoMedicacion();
  }

  limpiarFormularioGrupoMedicacion(): void {

    this.grupoMedicacionEditando = null;
    this.modoEdicionGrupoMedicacion = false;
    this.grupoMedicacionOriginal = null;

    this.grupoMedicacionForm = {
      nombre: '',
      descripcion: '',
      hora_rango_inicial: '',
      hora_rango_final: '',
      estado: true
    };
  }

  // =========================================================
  // MENSAJES
  // =========================================================

  limpiarMensajes(): void {

    this.mensajeExito = '';
    this.mensajeError = '';
  }

  // =========================================================
  // MANEJO DE ERRORES
  // =========================================================

  obtenerMensajeError(
    error: any,
    mensajePorDefecto: string
  ): string {

    if (!error) {
      return mensajePorDefecto;
    }

    if (error.error) {

      if (typeof error.error === 'string') {
        return error.error;
      }

      if (error.error.detail) {
        return error.error.detail;
      }

      if (error.error.message) {
        return error.error.message;
      }

      if (typeof error.error === 'object') {

        const mensajes: string[] = [];

        Object.keys(error.error).forEach(campo => {

          const valor =
            error.error[campo];

          if (Array.isArray(valor)) {

            mensajes.push(
              `${campo}: ${valor.join(', ')}`
            );

          } else {

            mensajes.push(
              `${campo}: ${valor}`
            );
          }
        });

        if (mensajes.length > 0) {
          return mensajes.join(' | ');
        }
      }
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor de Render.';
    }

    if (error.status === 400) {
      return 'Los datos enviados no son válidos.';
    }

    if (error.status === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }

    if (error.status === 500) {
      return 'El servidor presentó un error interno.';
    }

    return mensajePorDefecto;
  }

  // =========================================================
  // DETECTAR CAMBIOS
  // =========================================================

  private huboCambios(
    original: any,
    nuevo: any,
    campos: string[]
  ): boolean {

    return campos.some(
      campo =>
        (original?.[campo] ?? '') !==
        (nuevo?.[campo] ?? '')
    );
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
//Esta importacion me permite hacerle varias peticiones al backend 
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { InventarioPaciente } from '../inventario-paciente/inventario-paciente';

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

// ============================================================
// INTERFAZ RESPUESTA PAGINADA
// ============================================================

interface RespuestaPaginada<T> {

  count: number;

  next: string | null;

  previous: string | null;

  results: T[];

}

// ============================================================
// INTERFAZ PACIENTE
// ============================================================

interface Paciente {

  id_paciente: number;

  nombre: string;

  apellido: string;

  eps: string;

  sede: string;

  fecha_ingreso: string;

  habitacion: number;

  id_usuario:
    number |
    {
      id_usuario?: number;
    } |
    null;

  tipo_documento: string;

  numero_documento: string;

  fecha_nacimiento: string;

  genero: string;

  grupo_sanguineo: string;

  rh: string;

  cama: number;

  estado: boolean;

}

// ============================================================
// FAMILIAR RESPONSABLE
// ============================================================

interface FamiliarResponsable {

  id_familiar_responsable: number;

  id_paciente:
    number |
    {
      id_paciente?: number;
    } |
    null;

  nombres: string;

  apellidos: string;

  parentesco: string;

  telefono_uno: string;

  telefono_dos: string | null;

  direccion: string | null;

  correo: string | null;

  municipio: string | null;

}

// ============================================================
// MEDICAMENTO
// ============================================================

interface Medicamento {

  id_medicamentos: number;

  nombre: string;

  descripcion: string;

  principio_activo: string;

  concentracion: string;

  presentacion: string;

  estado: boolean;

  unidad_medida: string;

}

// ============================================================
// GRUPO MEDICACIÓN
// ============================================================

interface GrupoMedicacion {

  id_grupo: number;

  nombre: string;

  descripcion: string | null;

  hora_administracion: string;

  estado: boolean;

}

// ============================================================
// FORMULACIÓN MEDICAMENTO
// ============================================================

interface FormulacionMedicamento {

  id_formulacion: number;

  fecha: string;

  dosis: string;

  via: string;

  hora_administrada: string;

  presentacion: string;

  actual_administrado: boolean;

  suspendido_fecha: string | null;

  id_paciente:
    number |
    {
      id_paciente?: number;
    } |
    null;

  id_medicamentos:
    number |
    {
      id_medicamentos?: number;
    } |
    null;

  id_grupo:
    number |
    {
      id_grupo?: number;
    } |
    null;

}

// ============================================================
// TIPO DE INSUMO
// ============================================================

interface TipoInsumo {

  id_tipo_insumo: number;

  nombre: string;

  descripcion?: string;

  estado?: boolean;

}

// ============================================================
// INSUMO
// ============================================================

interface Insumo {

  id_insumo: number;

  id_tipo_insumo:
    number |
    {
      id_tipo_insumo?: number;
    } |
    null;

  nombre: string;

  descripcion: string;

  unidad_medida: string;

  estado: boolean;

}

// ============================================================
// ELEMENTO DEL PACIENTE
// ============================================================

interface ElementoPaciente {

  id_elemento: number;

  cantidad: number;

  fecha_ingreso: string;

  fecha_vencimiento: string | null;

  observaciones: string | null;

  estado: boolean | null;

  id_paciente:
    number |
    {
      id_paciente?: number;
    } |
    null;

  id_medicamentos:
    number |
    {
      id_medicamentos?: number;
      nombre?: string;
    } |
    null;

  id_insumo:
    number |
    {
      id_insumo?: number;
      nombre?: string;
    } |
    null;

}

// ============================================================
// FORMULARIO ELEMENTO
// ============================================================

interface FormularioElemento {

  id_medicamentos: number | null;

  id_insumo: number | null;

  // Se utiliza para seleccionar el tipo
  // antes de seleccionar el insumo.
  id_tipo_insumo: number | null;

  cantidad: number;

  fecha_ingreso: string;

  fecha_vencimiento: string;

  observaciones: string;

  estado: boolean;

}

// ============================================================
// CUIDADOS DE ENFERMERÍA
// ============================================================

interface CuidadoEnfermeria {

  id_cuidado: number;

  bano_paciente: string | null;

  peso_talla: string | null;

  control_glucemia: string | null;

  curaciones: string | null;

  liquidos_administrados_eliminados: string | null;

  control_deposicion: string | null;

  administracion_medicamentos: string | null;

  id_paciente:
    number |
    {
      id_paciente?: number;
    } |
    null;

}

// ============================================================
// RECOMENDACIONES
// ============================================================

interface Recomendacion {

  id_recomendacion: number;

  hidratar_piel: string | null;

  asistir_alimentacion: string | null;

  via_alimentacion: string | null;

  prevencion_caidas: string | null;

  terapias_fisicas: string | null;

  terapia_respiratoria: string | null;

  actividad_ocupacional: string | null;

  corte_unas: string | null;

  corte_cabello: string | null;

  higiene_oral: string | null;

  id_paciente:
    number |
    {
      id_paciente?: number;
    } |
    null;

}

// ============================================================
// HISTORIA CLÍNICA
// ============================================================

interface HistoriaClinica {

  id_historia_clinica: number;

  fecha_apertura: string;

  antecedentes: string;

  alergias: string;

  observaciones: string;

  estado: boolean;

  id_paciente:
    number |
    {
      id_paciente?: number;
    } |
    null;

}

@Component({
  selector: 'app-elementos-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InventarioPaciente
  ],
  templateUrl: './elementos-paciente.html',
  styleUrl: './elementos-paciente.css'
})
export class ElementosPaciente implements OnInit {

  // ============================================================
  // URL BASE DEL BACKEND
  // ============================================================

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  // ============================================================
  // ID DEL PACIENTE
  // ============================================================

  idPaciente: number = 0;

  // ============================================================
  // INVENTARIO DEL PACIENTE
  // ============================================================

  // Controla si el drawer de inventario está abierto.
  mostrarDrawerInventario = false;

  // Abre el inventario del paciente.
  mostrarInventario(): void {
    this.mostrarDrawerInventario = true;
  }

  // Cierra el inventario del paciente.
  cerrarInventario(): void {
    this.mostrarDrawerInventario = false;
  }

  // ============================================================
  // INFORMACIÓN DEL PACIENTE
  // ============================================================

  paciente: Paciente = {
    id_paciente: 0,
    nombre: '',
    apellido: '',
    eps: '',
    sede: '',
    fecha_ingreso: '',
    habitacion: 0,
    id_usuario: null,
    tipo_documento: '',
    numero_documento: '',
    fecha_nacimiento: '',
    genero: '',
    grupo_sanguineo: '',
    rh: '',
    cama: 0,
    estado: true
  };

  // ============================================================
  // FAMILIAR RESPONSABLE
  // ============================================================

  familiarResponsable: FamiliarResponsable | null = null;

  // ============================================================
  // ALIAS PARA COMPATIBILIDAD CON EL HTML
  // ============================================================

  get seccionActiva(): string {
    return this.seccionActual;
  }

  // ============================================================
  // ESTADOS DE CARGA
  // ============================================================

  cargandoPaciente = false;
  cargandoElementos = false;
  cargandoMedicamentos = false;
  cargandoInsumos = false;
  cargandoTiposInsumo = false;
  cargandoCuidados = false;
  cargandoRecomendaciones = false;
  cargandoHistoria = false;
  cargandoGruposMedicacion = false;
  cargandoFormulaciones = false;

  // ============================================================
  // CATÁLOGOS
  // ============================================================

  medicamentos: Medicamento[] = [];

  insumos: Insumo[] = [];

  tiposInsumo: TipoInsumo[] = [];

  insumosFiltrados: Insumo[] = [];

  gruposMedicacion: GrupoMedicacion[] = [];

  formulacionesMedicamentos: FormulacionMedicamento[] = [];

  // ============================================================
  // FORMULARIO DE FORMULACIÓN
  // ============================================================

  mostrarFormularioFormulacion = false;

  formulacionEditando: FormulacionMedicamento | null = null;

  formularioFormulacion = {
    fecha: '',
    id_medicamentos: null as number | null,
    dosis: '',
    via: '',
    id_grupo: null as number | null,
    hora_administrada: '',
    presentacion: '',
    actual_administrado: true,
    suspendido_fecha: ''
  };

  // ============================================================
  // ELEMENTOS DEL PACIENTE
  // ============================================================

  elementosPaciente: ElementoPaciente[] = [];

  elementoEditando: ElementoPaciente | null = null;

  get elementos(): ElementoPaciente[] {
    return this.elementosPaciente;
  }

  // ============================================================
  // FORMULARIO DE ELEMENTO
  // ============================================================

  mostrarFormularioElemento = false;

  mostrarMenuElementos = false;

  tipoElemento:
    'medicamento' |
    'insumo' = 'medicamento';

  formularioElemento: FormularioElemento = {
    id_medicamentos: null,
    id_insumo: null,
    id_tipo_insumo: null,
    cantidad: 1,
    fecha_ingreso: '',
    fecha_vencimiento: '',
    observaciones: '',
    estado: true
  };

  // ============================================================
  // MEDICAMENTOS PENDIENTES DE REGISTRO
  // ============================================================

  medicamentosPendientes: FormularioElemento[] = [];

  // ============================================================
  // INSUMOS PENDIENTES DE REGISTRO
  // ============================================================

  insumosPendientes: FormularioElemento[] = [];

  mostrarBarraFinal: boolean = true;

  // ============================================================
  // CUIDADOS DE ENFERMERÍA
  // ============================================================

  cuidados: CuidadoEnfermeria = {
    id_cuidado: 0,
    bano_paciente: '',
    peso_talla: '',
    control_glucemia: '',
    curaciones: '',
    liquidos_administrados_eliminados: '',
    control_deposicion: '',
    administracion_medicamentos: '',
    id_paciente: 0
  };

  mostrarFormularioCuidados = false;

  get mostrarFormularioCuidado(): boolean {
    return this.mostrarFormularioCuidados;
  }

  set mostrarFormularioCuidado(valor: boolean) {
    this.mostrarFormularioCuidados = valor;
  }

  get cantidadCuidados(): number {
    return this.cuidados.id_cuidado > 0 ? 1 : 0;
  }

  // ============================================================
  // RECOMENDACIONES
  // ============================================================

  recomendaciones: Recomendacion = {
    id_recomendacion: 0,
    hidratar_piel: '',
    asistir_alimentacion: '',
    via_alimentacion: '',
    prevencion_caidas: '',
    terapias_fisicas: '',
    terapia_respiratoria: '',
    actividad_ocupacional: '',
    corte_unas: '',
    corte_cabello: '',
    higiene_oral: '',
    id_paciente: 0
  };

  mostrarFormularioRecomendaciones = false;

  get mostrarFormularioRecomendacion(): boolean {
    return this.mostrarFormularioRecomendaciones;
  }

  set mostrarFormularioRecomendacion(valor: boolean) {
    this.mostrarFormularioRecomendaciones = valor;
  }

  get cantidadRecomendaciones(): number {
    return this.recomendaciones.id_recomendacion > 0 ? 1 : 0;
  }

  // ============================================================
  // HISTORIA CLÍNICA
  // ============================================================

  historiaClinica: HistoriaClinica = {
    id_historia_clinica: 0,
    fecha_apertura: '',
    antecedentes: '',
    alergias: '',
    observaciones: '',
    estado: true,
    id_paciente: 0
  };

  mostrarFormularioHistoria = false;

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // ============================================================
  // INICIO
  // ============================================================

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {

      const id = params.get('id');

      if (!id) {
        console.error('No se recibió el ID del paciente.');
        return;
      }

      this.idPaciente = Number(id);

      console.log(
        'ID del paciente recibido:',
        this.idPaciente
      );

      if (!this.idPaciente || this.idPaciente <= 0) {
        console.error('El ID del paciente no es válido.');
        return;
      }

      this.paciente.id_paciente = this.idPaciente;

      this.cargarInformacionPaciente();
      this.cargarFamiliarResponsable();
      this.cargarCatalogos();
      this.cargarGruposMedicacion();
      this.cargarFormulacionesMedicamentos();
      this.cargarElementosPaciente();
      this.cargarCuidados();
      this.cargarRecomendaciones();
      this.cargarHistoriaClinica();

    });

  }

  // ============================================================
  // CARGAR INFORMACIÓN DEL PACIENTE
  // ============================================================

  cargarInformacionPaciente(): void {

    this.cargandoPaciente = true;

    this.http
      .get<Paciente>(
        `${this.apiUrl}/pacientes/${this.idPaciente}/`
      )
      .subscribe({

        next: (respuesta) => {

          this.paciente = respuesta;

          this.cargandoPaciente = false;

          console.log(
            'Paciente cargado:',
            respuesta
          );

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar paciente:',
            error
          );

          this.cargandoPaciente = false;

          alertaError(
            'Error',
            'No fue posible cargar la información del paciente.'
          );

        }

      });

  }

  // ============================================================
  // CARGAR FAMILIAR RESPONSABLE
  // ============================================================

  private cargarFamiliarResponsable(): void {

    if (!this.idPaciente || this.idPaciente <= 0) {

      console.error(
        'No se puede cargar el familiar: ID de paciente inválido.'
      );

      return;
    }

    this.http
      .get<
        FamiliarResponsable[] |
        RespuestaPaginada<FamiliarResponsable>
      >(
        `${this.apiUrl}/familiar_responsable/`
      )
      .subscribe({

        next: (respuesta) => {

          const familiares =
            this.obtenerResultados(respuesta);

          const familiar = familiares.find(item => {

            const idRelacion =
              this.obtenerIdPaciente(
                item.id_paciente
              );

            return Number(idRelacion) ===
              Number(this.idPaciente);

          });

          if (familiar) {

            this.familiarResponsable =
              familiar;

          } else {

            this.familiarResponsable =
              null;

          }

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar familiar responsable:',
            error
          );

          this.familiarResponsable = null;

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // CALCULAR EDAD
  // ============================================================

  obtenerEdad(): number | null {

    if (!this.paciente.fecha_nacimiento) {
      return null;
    }

    const nacimiento =
      new Date(
        this.paciente.fecha_nacimiento
      );

    const hoy =
      new Date();

    let edad =
      hoy.getFullYear() -
      nacimiento.getFullYear();

    const diferenciaMes =
      hoy.getMonth() -
      nacimiento.getMonth();

    if (
      diferenciaMes < 0 ||
      (
        diferenciaMes === 0 &&
        hoy.getDate() < nacimiento.getDate()
      )
    ) {

      edad--;

    }

    return edad;
  }

  // ============================================================
  // OBTENER FECHA ACTUAL
  // ============================================================

  private obtenerFechaActual(): string {

    const ahora = new Date();

    const anio =
      ahora.getFullYear();

    const mes =
      String(
        ahora.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        ahora.getDate()
      ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;

  }

  // ============================================================
  // OBTENER FECHA Y HORA ACTUAL
  // ============================================================

  private obtenerFechaHoraActual(): string {

    const ahora = new Date();

    const anio =
      ahora.getFullYear();

    const mes =
      String(
        ahora.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        ahora.getDate()
      ).padStart(2, '0');

    const horas =
      String(
        ahora.getHours()
      ).padStart(2, '0');

    const minutos =
      String(
        ahora.getMinutes()
      ).padStart(2, '0');

    return `${anio}-${mes}-${dia}T${horas}:${minutos}`;

  }

  // ============================================================
  // CARGAR CATÁLOGOS
  // ============================================================

  cargarCatalogos(): void {

    this.cargarMedicamentos();
    this.cargarTiposInsumo();
    this.cargarInsumos();

  }

  // ============================================================
  // CARGAR MEDICAMENTOS
  // ============================================================

  cargarMedicamentos(): void {

    this.cargandoMedicamentos = true;

    this.http
      .get<
        Medicamento[] |
        RespuestaPaginada<Medicamento>
      >(
        `${this.apiUrl}/medicamentos/`
      )
      .subscribe({

        next: (respuesta) => {

          this.medicamentos =
            this.obtenerResultados(respuesta);

          console.log(
            'Medicamentos cargados:',
            this.medicamentos
          );

          this.cargandoMedicamentos = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar medicamentos:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.cargandoMedicamentos = false;

          alertaError('Error', 'No fue posible cargar los medicamentos.');

        }

      });

  }

  // ============================================================
  // CARGAR TIPOS DE INSUMO
  // ============================================================

  cargarTiposInsumo(): void {

    this.cargandoTiposInsumo = true;

    this.http
      .get<
        TipoInsumo[] |
        RespuestaPaginada<TipoInsumo>
      >(
        `${this.apiUrl}/tipo_insumo/`
      )
      .subscribe({

        next: (respuesta) => {

          this.tiposInsumo =
            this.obtenerResultados(respuesta);

          console.log(
            'Tipos de insumo cargados:',
            this.tiposInsumo
          );

          this.cargandoTiposInsumo = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar tipos de insumo:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.cargandoTiposInsumo = false;

          alertaError('Error', 'No fue posible cargar los tipos de insumo.');

        }

      });

  }

  // ============================================================
  // CARGAR INSUMOS
  // ============================================================

  cargarInsumos(): void {

    this.cargandoInsumos = true;

    this.http
      .get<
        Insumo[] |
        RespuestaPaginada<Insumo>
      >(
        `${this.apiUrl}/insumos/`
      )
      .subscribe({

        next: (respuesta) => {

          this.insumos =
            this.obtenerResultados(respuesta);

          console.log(
            'Insumos cargados:',
            this.insumos
          );

          this.cargandoInsumos = false;

          if (
            this.formularioElemento.id_tipo_insumo
          ) {

            this.filtrarInsumosPorTipo();

          }

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar insumos:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.cargandoInsumos = false;

         alertaError('Error', 'No fue posible cargar los insumos.');

        }

      });

  }

  // ============================================================
  // FILTRAR INSUMOS POR TIPO
  // ============================================================

  filtrarInsumosPorTipo(): void {

    const idTipo =
      Number(
        this.formularioElemento.id_tipo_insumo
      );

    if (!idTipo) {

      this.insumosFiltrados = [];

      this.formularioElemento.id_insumo = null;

      return;
    }

    this.insumosFiltrados =
      this.insumos.filter(insumo => {

        const idTipoInsumo =
          this.obtenerIdTipoInsumo(
            insumo.id_tipo_insumo
          );

        return Number(idTipoInsumo) ===
          Number(idTipo);

      });

    this.formularioElemento.id_insumo = null;

    console.log(
      'Tipo seleccionado:',
      idTipo
    );

    console.log(
      'Insumos filtrados:',
      this.insumosFiltrados
    );

    this.cdr.detectChanges();

  }

  // ============================================================
  // OBTENER ID DEL TIPO DE INSUMO
  // ============================================================

  private obtenerIdTipoInsumo(
    relacion:
      number |
      {
        id_tipo_insumo?: number;
      } |
      null
  ): number | null {

    if (relacion === null) {
      return null;
    }

    if (typeof relacion === 'number') {
      return relacion;
    }

    if (
      typeof relacion === 'object' &&
      relacion.id_tipo_insumo !== undefined
    ) {

      return Number(
        relacion.id_tipo_insumo
      );

    }

    return null;
  }

  // ============================================================
  // CARGAR ELEMENTOS DEL PACIENTE
  // ============================================================

  cargarElementosPaciente(): void {

    this.cargandoElementos = true;

    this.http
      .get<
        ElementoPaciente[] |
        RespuestaPaginada<ElementoPaciente>
      >(
        `${this.apiUrl}/elementos_paciente/`
      )
      .subscribe({

        next: (respuesta) => {

          const elementos =
            this.obtenerResultados(respuesta);

          this.elementosPaciente =
            elementos.filter(elemento => {

              const idRelacion =
                this.obtenerIdPaciente(
                  elemento.id_paciente
                );

              return Number(idRelacion) ===
                Number(this.idPaciente);

            });

          console.log(
            'Elementos del paciente:',
            this.elementosPaciente
          );

          this.cargandoElementos = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar elementos:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.cargandoElementos = false;

         alertaError('Error', 'No fue posible cargar los elementos del paciente.');

        }

      });

  }

  // ============================================================
  // OBTENER RESULTADOS DEL API
  // ============================================================

  private obtenerResultados<T>(
    respuesta:
      T[] |
      RespuestaPaginada<T>
  ): T[] {

    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (
      respuesta &&
      Array.isArray(respuesta.results)
    ) {

      return respuesta.results;

    }

    return [];
  }

  // ============================================================
  // OBTENER ID DE PACIENTE
  // ============================================================

  private obtenerIdPaciente(
    relacion:
      number |
      {
        id_paciente?: number;
      } |
      null
  ): number | null {

    if (relacion === null) {
      return null;
    }

    if (typeof relacion === 'number') {
      return relacion;
    }

    if (
      typeof relacion === 'object' &&
      relacion.id_paciente !== undefined
    ) {

      return Number(
        relacion.id_paciente
      );

    }

    return null;
  }
// ============================================================
// CARGAR GRUPOS DE MEDICACIÓN
// ============================================================

cargarGruposMedicacion(): void {

  this.cargandoGruposMedicacion = true;

  this.http
    .get<
      GrupoMedicacion[] |
      RespuestaPaginada<GrupoMedicacion>
    >(
      `${this.apiUrl}/grupo_medicacion/`
    )
    .subscribe({

      next: (respuesta) => {

        this.gruposMedicacion =
          this.obtenerResultados(respuesta);

        this.cargandoGruposMedicacion = false;

        console.log(
          'Grupos de medicación cargados:',
          this.gruposMedicacion
        );

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Error al cargar grupos de medicación:',
          error
        );

        this.gruposMedicacion = [];

        this.cargandoGruposMedicacion = false;

        alertaError(
          'Error',
          'No fue posible cargar los grupos de medicación.'
        );

      }

    });

}

// ============================================================
// CARGAR FORMULACIONES DE MEDICAMENTOS
// ============================================================

cargarFormulacionesMedicamentos(): void {

  this.cargandoFormulaciones = true;

  this.http
    .get<
      FormulacionMedicamento[] |
      RespuestaPaginada<FormulacionMedicamento>
    >(
      `${this.apiUrl}/formulacion_medicamentos/`
    )
    .subscribe({

      next: (respuesta) => {

        // Muestra la respuesta completa del backend
        console.log(
          'RESPUESTA FORMULACIONES:',
          respuesta
        );

        // Obtiene los registros independientemente
        // de si la respuesta viene paginada o como arreglo
        const formulaciones =
          this.obtenerResultados(respuesta);

        console.log(
          'FORMULACIONES OBTENIDAS:',
          formulaciones
        );

        this.formulacionesMedicamentos =
          formulaciones.filter(formulacion => {

            // Muestra todas las propiedades que realmente
            // está enviando el backend
            console.log(
              'PROPIEDADES DE FORMULACIÓN:',
              Object.keys(formulacion)
            );

            // Muestra el objeto completo en formato JSON
            console.log(
              'FORMULACIÓN COMPLETA:',
              JSON.stringify(
                formulacion,
                null,
                2
              )
            );

            // Muestra específicamente el campo que
            // estamos intentando utilizar
            console.log(
              'ID PACIENTE RECIBIDO:',
              formulacion.id_paciente
            );

            const idPaciente =
              this.obtenerIdPaciente(
                formulacion.id_paciente
              );

            console.log(
              'ID paciente de formulación:',
              idPaciente,
              'ID paciente actual:',
              this.idPaciente
            );

            return Number(idPaciente) ===
              Number(this.idPaciente);

          });

        console.log(
          'FORMULACIONES DEL PACIENTE:',
          this.formulacionesMedicamentos
        );

        this.cargandoFormulaciones = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(
          'Error al cargar formulaciones:',
          error
        );

        console.error(
          'Respuesta del servidor:',
          error?.error
        );

        this.formulacionesMedicamentos = [];

        this.cargandoFormulaciones = false;

        alertaError(
          'Error',
          'No fue posible cargar las formulaciones de medicamentos.'
        );

      }

    });

}

// ============================================================
// GUARDAR O ACTUALIZAR FORMULACIÓN
// ============================================================

guardarFormulacion(): void {
  if (!this.idPaciente || this.idPaciente <= 0) {
    alertaError(
      'Error',
      'No se encontró el paciente.'
    );
    return;
  }

  if (!this.formularioFormulacion.fecha) {
    alertaError(
      'Campo requerido',
      'Seleccione la fecha de la formulación.'
    );
    return;
  }

  if (!this.formularioFormulacion.id_medicamentos) {
    alertaError(
      'Campo requerido',
      'Seleccione un medicamento.'
    );
    return;
  }

  if (!this.formularioFormulacion.dosis.trim()) {
    alertaError(
      'Campo requerido',
      'Ingrese la dosis.'
    );
    return;
  }

  if (!this.formularioFormulacion.via.trim()) {
    alertaError(
      'Campo requerido',
      'Ingrese la vía de administración.'
    );
    return;
  }

  if (!this.formularioFormulacion.id_grupo) {
    alertaError(
      'Campo requerido',
      'Seleccione el grupo de medicación.'
    );
    return;
  }

  if (!this.formularioFormulacion.hora_administrada) {
    alertaError(
      'Campo requerido',
      'Seleccione la hora de administración.'
    );
    return;
  }

  if (!this.formularioFormulacion.presentacion.trim()) {
    alertaError(
      'Campo requerido',
      'Ingrese la presentación del medicamento.'
    );
    return;
  }

  const datos = {
    fecha: this.formularioFormulacion.fecha,
    dosis: this.formularioFormulacion.dosis.trim(),
    via: this.formularioFormulacion.via.trim(),
    hora_administrada:
      this.formularioFormulacion.hora_administrada,
    presentacion:
      this.formularioFormulacion.presentacion.trim(),
    actual_administrado:
      this.formularioFormulacion.actual_administrado,
    suspendido_fecha:
      this.formularioFormulacion.actual_administrado
        ? null
        : (
            this.formularioFormulacion.suspendido_fecha ||
            null
          ),
    id_medicamentos:
      this.formularioFormulacion.id_medicamentos,
    id_grupo:
      this.formularioFormulacion.id_grupo,
    id_paciente:
      this.idPaciente
  };

  console.log('Datos de formulación:', datos);

  // Si estamos editando, actualizamos
  if (this.formulacionEditando) {

    this.http
      .put(
        `${this.apiUrl}/formulacion_medicamentos/${this.formulacionEditando.id_formulacion}/`,
        datos
      )
      .subscribe({
        next: (respuesta) => {
          console.log(
            'Formulación actualizada:',
            respuesta
          );

          alertaExito(
            'Éxito',
            'La formulación fue actualizada correctamente.'
          );

          this.cancelarFormulacion();
          this.cargarFormulacionesMedicamentos();
        },
        error: (error) => {
          console.error(
            'Error al actualizar formulación:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          alertaError(
            'Error',
            'No fue posible actualizar la formulación.'
          );
        }
      });

    return;
  }

  // Si no estamos editando, creamos una nueva
  this.http
    .post(
      `${this.apiUrl}/formulacion_medicamentos/`,
      datos
    )
    .subscribe({
      next: (respuesta) => {
        console.log(
          'Formulación guardada:',
          respuesta
        );

        alertaExito(
          'Éxito',
          'La formulación fue guardada correctamente.'
        );

        this.cancelarFormulacion();
        this.cargarFormulacionesMedicamentos();
      },
      error: (error) => {
        console.error(
          'Error al guardar formulación:',
          error
        );

        console.error(
          'Respuesta del servidor:',
          error?.error
        );

        alertaError(
          'Error',
          'No fue posible guardar la formulación.'
        );
      }
    });
}

// ============================================================
// EDITAR FORMULACIÓN
// ============================================================

editarFormulacion(
  formulacion: FormulacionMedicamento
): void {

  this.formulacionEditando = formulacion;

  const idMedicamento =
    typeof formulacion.id_medicamentos === 'object'
      ? formulacion.id_medicamentos?.id_medicamentos ?? null
      : formulacion.id_medicamentos;

  const idGrupo =
    typeof formulacion.id_grupo === 'object'
      ? formulacion.id_grupo?.id_grupo ?? null
      : formulacion.id_grupo;

  this.formularioFormulacion = {
    fecha: formulacion.fecha || '',
    id_medicamentos: idMedicamento,
    dosis: formulacion.dosis || '',
    via: formulacion.via || '',
    id_grupo: idGrupo,
    hora_administrada:
      formulacion.hora_administrada || '',
    presentacion:
      formulacion.presentacion || '',
    actual_administrado:
      formulacion.actual_administrado,
    suspendido_fecha:
      formulacion.suspendido_fecha || ''
  };

  this.mostrarFormularioFormulacion = true;
}

// ============================================================
// ELIMINAR FORMULACIÓN
// ===========================================================
eliminarFormulacion(
  formulacion: FormulacionMedicamento
): void {

  Swal.fire({
    title: '¿Eliminar formulación?',
    text: 'Esta formulación será eliminada permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true
  }).then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http
      .delete(
        `${this.apiUrl}/formulacion_medicamentos/${formulacion.id_formulacion}/`
      )
      .subscribe({

        next: () => {

          alertaExito(
            'Éxito',
            'La formulación fue eliminada correctamente.'
          );

          this.cargarFormulacionesMedicamentos();
        },

        error: (error) => {

          console.error(
            'Error al eliminar formulación:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          alertaError(
            'Error',
            'No fue posible eliminar la formulación.'
          );
        }

      });
  });
}

// ============================================================
// CANCELAR FORMULARIO DE FORMULACIÓN
// ============================================================

cancelarFormulacion(): void {
  this.mostrarFormularioFormulacion = false;
  this.formulacionEditando = null;

  this.formularioFormulacion = {
    fecha: '',
    id_medicamentos: null,
    dosis: '',
    via: '',
    id_grupo: null,
    hora_administrada: '',
    presentacion: '',
    actual_administrado: true,
    suspendido_fecha: ''
  };
}

// ============================================================
// SECCIÓN ACTUAL
// ============================================================

seccionActual: 'elementos' | 'cuidados' | 'recomendaciones' | 'historia' | 'formulacion' = 'elementos';

// ============================================================
// CAMBIAR SECCIÓN
// ============================================================

cambiarSeccion(
  seccion: 'elementos' | 'cuidados' | 'recomendaciones' | 'historia' | 'formulacion'
): void {
  this.seccionActual = seccion;
}
// ============================================================
// INICIALES DEL PACIENTE
// ============================================================

obtenerIniciales(): string {

  const nombre =
    this.paciente.nombre?.trim() || '';

  const apellido =
    this.paciente.apellido?.trim() || '';

  const inicialNombre =
    nombre.charAt(0).toUpperCase();

  const inicialApellido =
    apellido.charAt(0).toUpperCase();

  return `${inicialNombre}${inicialApellido}`;
}

// ============================================================
// REGISTRAR MEDICAMENTO
// ============================================================

registrarMedicamento(): void {

  this.tipoElemento =
    'medicamento';

  this.mostrarMenuElementos =
    false;

  this.elementoEditando =
    null;

  // Iniciamos una nueva lista
  // de medicamentos pendientes.
  this.medicamentosPendientes = [];

  this.formularioElemento = {

    id_medicamentos: null,

    id_insumo: null,

    id_tipo_insumo: null,

    cantidad: 1,

    fecha_ingreso:
      this.obtenerFechaHoraActual(),

    fecha_vencimiento: '',

    observaciones: '',

    estado: true

  };

  this.insumosFiltrados = [];

  if (
    this.medicamentos.length === 0
  ) {

    this.cargarMedicamentos();

  }

  this.mostrarFormularioElemento =
    true;

  this.cdr.detectChanges();

}

  // ============================================================
  // REGISTRAR INSUMO
  // ============================================================

  registrarInsumo(): void {

    this.tipoElemento =
      'insumo';

    this.mostrarMenuElementos =
      false;

    this.elementoEditando =
      null;

    // Iniciamos una nueva lista
    // de insumos pendientes.
    this.insumosPendientes = [];

    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      id_tipo_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaHoraActual(),

      fecha_vencimiento: '',

      observaciones: '',

      estado: true

    };

    this.insumosFiltrados = [];

    if (
      this.tiposInsumo.length === 0
    ) {

      this.cargarTiposInsumo();

    }

    if (
      this.insumos.length === 0
    ) {

      this.cargarInsumos();

    }

    this.mostrarFormularioElemento =
      true;

    this.cdr.detectChanges();

  }

  // ============================================================
  // ABRIR FORMULARIO
  // ============================================================

  abrirFormularioElemento(): void {

    this.elementoEditando =
      null;

    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      id_tipo_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaHoraActual(),

      fecha_vencimiento: '',

      observaciones: '',

      estado: true

    };

    this.insumosFiltrados = [];

    this.mostrarFormularioElemento =
      true;

  }

  // ============================================================
  // EDITAR ELEMENTO
  // ============================================================

  editarElemento(
    elemento: ElementoPaciente
  ): void {

    this.elementoEditando =
      elemento;

    const esMedicamento =
      elemento.id_medicamentos !== null &&
      elemento.id_medicamentos !== undefined;

    this.tipoElemento =
      esMedicamento
        ? 'medicamento'
        : 'insumo';

    const idInsumo =
      !esMedicamento
        ? this.obtenerIdInsumo(
            elemento.id_insumo
          )
        : null;

    const insumo =
      idInsumo
        ? this.insumos.find(item =>
            Number(item.id_insumo) ===
            Number(idInsumo)
          )
        : null;

    const idTipoInsumo =
      insumo
        ? this.obtenerIdTipoInsumo(
            insumo.id_tipo_insumo
          )
        : null;

    this.formularioElemento = {

      id_medicamentos:
        esMedicamento
          ? this.obtenerIdMedicamento(
              elemento.id_medicamentos
            )
          : null,

      id_insumo:
        !esMedicamento
          ? idInsumo
          : null,

      id_tipo_insumo:
        !esMedicamento
          ? idTipoInsumo
          : null,

      cantidad:
        elemento.cantidad,

      fecha_ingreso:
        this.convertirFechaParaInput(
          elemento.fecha_ingreso
        ),

      fecha_vencimiento:
        elemento.fecha_vencimiento || '',

      observaciones:
        elemento.observaciones || '',

      estado:
        elemento.estado ?? true

    };

    if (
      this.tipoElemento === 'medicamento'
    ) {

      if (
        this.medicamentos.length === 0
      ) {

        this.cargarMedicamentos();

      }

    } else {

      if (
        this.tiposInsumo.length === 0
      ) {

        this.cargarTiposInsumo();

      }

      if (
        this.insumos.length === 0
      ) {

        this.cargarInsumos();

      }

      this.insumosFiltrados =
        this.insumos.filter(insumo => {

          const idTipo =
            this.obtenerIdTipoInsumo(
              insumo.id_tipo_insumo
            );

          return Number(idTipo) ===
            Number(idTipoInsumo);

        });

    }

    this.mostrarFormularioElemento =
      true;

    this.cdr.detectChanges();

  }

// ============================================================
// CONVERTIR FECHA PARA INPUT
// ============================================================

private convertirFechaParaInput(
  fecha: string | null | undefined
): string {

  if (!fecha) {
    return '';
  }

  try {

    const fechaConvertida =
      new Date(fecha);

    if (isNaN(fechaConvertida.getTime())) {
      return '';
    }

    const anio =
      fechaConvertida.getFullYear();

    const mes =
      String(
        fechaConvertida.getMonth() + 1
      ).padStart(2, '0');

    const dia =
      String(
        fechaConvertida.getDate()
      ).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;

  } catch (error) {

    return '';

  }

}

// ============================================================
// MOSTRAR ERROR DE LA API
// ============================================================

private mostrarErrorApi(
  error: any,
  mensajePorDefecto: string = 'Ocurrió un error al comunicarse con el servidor.'
): void {

  let mensaje =
    mensajePorDefecto;

  if (
    error &&
    error.error
  ) {

    if (
      typeof error.error === 'string'
    ) {

      mensaje =
        error.error;

    } else if (
      error.error.detail
    ) {

      mensaje =
        error.error.detail;

    } else if (
      error.error.message
    ) {

      mensaje =
        error.error.message;

    } else if (
      error.error.mensaje
    ) {

      mensaje =
        error.error.mensaje;

    } else {

      try {

        mensaje =
          Object
            .values(error.error)
            .flat()
            .join(' ');

      } catch (e) {

        mensaje =
          mensajePorDefecto;

      }

    }

  } else if (
    error &&
    error.message
  ) {

    mensaje =
      error.message;

  }

  alertaError('Error', mensaje);

}


  // ============================================================
  // OBTENER ID MEDICAMENTO
  // ============================================================

  private obtenerIdMedicamento(
    medicamento:
      number |
      {
        id_medicamentos?: number;
      } |
      null
  ): number | null {

    if (
      typeof medicamento === 'number'
    ) {

      return medicamento;

    }

    if (
      medicamento &&
      medicamento.id_medicamentos !== undefined
    ) {

      return Number(
        medicamento.id_medicamentos
      );

    }

    return null;
  }

    // ============================================================
  // OBTENER NOMBRE DEL MEDICAMENTO DE LA FORMULACIÓN
  // ============================================================

  obtenerNombreMedicamentoFormulacion(
    formulacion: FormulacionMedicamento
  ): string {

    const idMedicamento =
      typeof formulacion.id_medicamentos === 'object'
        ? formulacion.id_medicamentos?.id_medicamentos
        : formulacion.id_medicamentos;

    if (!idMedicamento) {
      return 'Sin medicamento';
    }

    const medicamento =
      this.medicamentos.find(
        medicamento =>
          Number(medicamento.id_medicamentos) ===
          Number(idMedicamento)
      );

    return medicamento
      ? medicamento.nombre
      : 'Medicamento no encontrado';
  }

  // ============================================================
  // OBTENER NOMBRE DEL GRUPO DE MEDICACIÓN
  // ============================================================

  obtenerNombreGrupoFormulacion(
    formulacion: FormulacionMedicamento
  ): string {

    const idGrupo =
      typeof formulacion.id_grupo === 'object'
        ? formulacion.id_grupo?.id_grupo
        : formulacion.id_grupo;

    if (!idGrupo) {
      return 'Sin grupo';
    }

    const grupo =
      this.gruposMedicacion.find(
        grupo =>
          Number(grupo.id_grupo) ===
          Number(idGrupo)
      );

    return grupo
      ? grupo.nombre
      : 'Grupo no encontrado';
  }

  // ============================================================
  // OBTENER ID INSUMO
  // ============================================================

  private obtenerIdInsumo(
    insumo:
      number |
      {
        id_insumo?: number;
      } |
      null
  ): number | null {

    if (
      typeof insumo === 'number'
    ) {

      return insumo;

    }

    if (
      insumo &&
      insumo.id_insumo !== undefined
    ) {

      return Number(
        insumo.id_insumo
      );

    }

    return null;
  }

  // ============================================================
  // OBTENER NOMBRE DEL ELEMENTO
  // ============================================================

  obtenerNombreElemento(
    elemento: ElementoPaciente
  ): string {

    // ----------------------------------------------------------
    // SI ES MEDICAMENTO
    // ----------------------------------------------------------

    if (
      elemento.id_medicamentos !== null &&
      elemento.id_medicamentos !== undefined
    ) {

      if (
        typeof elemento.id_medicamentos === 'number'
      ) {

        const medicamento =
          this.medicamentos.find(
            item =>
              Number(item.id_medicamentos) ===
              Number(elemento.id_medicamentos)
          );

        return medicamento
          ? medicamento.nombre
          : 'Medicamento no encontrado';

      }

      if (
        typeof elemento.id_medicamentos === 'object' &&
        elemento.id_medicamentos !== null
      ) {

        const idMedicamento =
          elemento.id_medicamentos.id_medicamentos;

        const medicamento =
          this.medicamentos.find(
            item =>
              Number(item.id_medicamentos) ===
              Number(idMedicamento)
          );

        return medicamento
          ? medicamento.nombre
          : 'Medicamento no encontrado';
      }
    }

    // ----------------------------------------------------------
    // SI ES INSUMO
    // ----------------------------------------------------------

    if (
      elemento.id_insumo !== null &&
      elemento.id_insumo !== undefined
    ) {

      if (
        typeof elemento.id_insumo === 'number'
      ) {

        const insumo =
          this.insumos.find(
            item =>
              Number(item.id_insumo) ===
              Number(elemento.id_insumo)
          );

        return insumo
          ? insumo.nombre
          : 'Insumo no encontrado';
      }

      if (
        typeof elemento.id_insumo === 'object' &&
        elemento.id_insumo !== null
      ) {

        const idInsumo =
          elemento.id_insumo.id_insumo;

        const insumo =
          this.insumos.find(
            item =>
              Number(item.id_insumo) ===
              Number(idInsumo)
          );

        return insumo
          ? insumo.nombre
          : 'Insumo no encontrado';
      }
    }

    return 'Sin elemento';
  }

  // ============================================================
  // OBTENER TIPO DEL ELEMENTO
  // ============================================================

  obtenerTipoElemento(
    elemento: ElementoPaciente
  ): string {

    if (
      elemento.id_medicamentos !== null &&
      elemento.id_medicamentos !== undefined
    ) {

      return 'Medicamento';

    }

    if (
      elemento.id_insumo !== null &&
      elemento.id_insumo !== undefined
    ) {

      return 'Insumo';

    }

    return 'Sin tipo';
  }

  // ============================================================
  // AGREGAR MEDICAMENTO A LA LISTA TEMPORAL
  // ============================================================

  //Verificar que seleccionamos un medicamento.
  //Verificar que la cantidad sea mayor que 0.
  //Revisar que no esté repetido.
  //Agregarlo a medicamentosPendientes.
  //Limpiar el formulario para poder seleccionar otro

  agregarMedicamentoPendiente(): void {

    if (
      !this.formularioElemento.id_medicamentos
    ) {

      alertaAdvertencia('Medicamento requerido', 'Selecciona un medicamento antes de agregarlo.');
      return;
    }

    const cantidad =
      Number(
        this.formularioElemento.cantidad
      );

    if (
      !cantidad ||
      cantidad <= 0
    ) {

      alertaAdvertencia('Cantidad inválida', 'La cantidad debe ser mayor que cero.');
      return;
    }

    const medicamentoExistente =
      this.medicamentosPendientes.some(
        medicamento =>
          Number(medicamento.id_medicamentos) ===
          Number(this.formularioElemento.id_medicamentos)
      );

    if (medicamentoExistente) {

     alertaAdvertencia('Medicamento repetido', 'Este medicamento ya fue agregado a la lista.');
      return;
    }

    // Guardamos una copia del formulario actual.
    this.medicamentosPendientes.push({
      ...this.formularioElemento,
      cantidad: cantidad
    });

    console.log(
      'Medicamentos pendientes:',
      this.medicamentosPendientes
    );

    // Limpiar formulario.
    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      id_tipo_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaHoraActual(),

      fecha_vencimiento: '',

      observaciones: '',

      estado: true

    };

    this.cdr.detectChanges();

  }

/// ============================================================
// AGREGAR INSUMO A LA LISTA TEMPORAL
// ============================================================

agregarInsumoPendiente(): void {

  // Validar tipo de insumo.
  if (!this.formularioElemento.id_tipo_insumo) {

   alertaAdvertencia('Tipo de insumo requerido', 'Selecciona un tipo de insumo antes de agregarlo.');

    return;
  }

  // Validar insumo.
  if (!this.formularioElemento.id_insumo) {

    alertaAdvertencia('Insumo requerido', 'Selecciona un insumo antes de agregarlo.');

    return;
  }

  // Validar cantidad.
  const cantidad = Number(
    this.formularioElemento.cantidad
  );

  if (!cantidad || cantidad <= 0) {

    alertaAdvertencia('Cantidad inválida', 'La cantidad debe ser mayor que cero.');

    return;
  }

  // Evitar registrar el mismo insumo
  // dos veces dentro de la misma lista.
  const insumoExistente =
    this.insumosPendientes.some(
      insumo =>
        Number(insumo.id_insumo) ===
        Number(this.formularioElemento.id_insumo)
    );

  if (insumoExistente) {

    alertaAdvertencia('Insumo repetido', 'Este insumo ya fue agregado a la lista.');
    return;
  }

  // Agregar una COPIA del formulario actual.
  this.insumosPendientes.push({
    ...this.formularioElemento,
    cantidad: cantidad
  });

  console.log(
    'Insumos pendientes:',
    this.insumosPendientes
  );

  // Limpiar únicamente el formulario
  // para poder seleccionar OTRO insumo.
  this.formularioElemento = {

    id_medicamentos: null,

    id_insumo: null,

    id_tipo_insumo: null,

    cantidad: 1,

    fecha_ingreso:
      this.obtenerFechaHoraActual(),

    fecha_vencimiento: '',

    observaciones: '',

    estado: true

  };

  // Limpiar los insumos filtrados
  // hasta que se seleccione nuevamente un tipo.
  this.insumosFiltrados = [];

  this.cdr.detectChanges();
}

  // ============================================================
  // OBTENER NOMBRE DEL MEDICAMENTO PENDIENTE
  // ============================================================

  obtenerNombreMedicamentoPendiente(
    id: number | null
  ): string {

    if (!id) {
      return 'Medicamento no seleccionado';
    }

    const medicamento =
      this.medicamentos.find(
        item =>
          Number(item.id_medicamentos) ===
          Number(id)
      );

    return medicamento
      ? medicamento.nombre
      : 'Medicamento no encontrado';
  }

  // ============================================================
  // OBTENER NOMBRE DEL INSUMO PENDIENTE
  // ============================================================

  obtenerNombreInsumoPendiente(
    id: number | null
  ): string {

    if (!id) {
      return 'Insumo no seleccionado';
    }

    const insumo =
      this.insumos.find(
        item =>
          Number(item.id_insumo) ===
          Number(id)
      );

    return insumo
      ? insumo.nombre
      : 'Insumo no encontrado';
  }

  // ============================================================
  // ELIMINAR MEDICAMENTO PENDIENTE
  // ============================================================

  eliminarMedicamentoPendiente(
    index: number
  ): void {

    this.medicamentosPendientes.splice(
      index,
      1
    );

    this.cdr.detectChanges();

  }

  // ============================================================
  // ELIMINAR INSUMO PENDIENTE
  // ============================================================

  eliminarInsumoPendiente(
    index: number
  ): void {

    this.insumosPendientes.splice(
      index,
      1
    );

    this.cdr.detectChanges();

  }

  // ============================================================
  // GUARDAR ELEMENTO
  // ============================================================

  guardarElemento(): void {

    if (!this.idPaciente || this.idPaciente <= 0) {

      alertaAdvertencia('Paciente no identificado', 'No fue posible identificar el paciente.');
      return;
    }

    // ----------------------------------------------------------
    // SI ESTAMOS EDITANDO
    // ----------------------------------------------------------

    if (this.elementoEditando) {

      this.guardarElementoIndividual();

      return;
    }

    // ==========================================================
    // MEDICAMENTOS
    // ==========================================================

    if (this.tipoElemento === 'medicamento') {

      // Si hay un medicamento seleccionado
      // pero todavía no fue agregado a la lista,
      // lo agregamos automáticamente.
      if (
        this.formularioElemento.id_medicamentos
      ) {

        this.agregarMedicamentoPendiente();

      }

      // Debe existir al menos un medicamento.
      if (
        this.medicamentosPendientes.length === 0
      ) {

        alertaAdvertencia('Medicamentos requeridos', 'Agrega al menos un medicamento antes de guardar.');
        return;
      }

      // Guardar todos los medicamentos.
      this.guardarMedicamentosPendientes();

      return;
    }

    // ==========================================================
    // INSUMOS
    // ==========================================================

    if (this.tipoElemento === 'insumo') {

      // Si hay un insumo seleccionado
      // pero todavía no fue agregado a la lista,
      // lo agregamos automáticamente.
      if (
        this.formularioElemento.id_insumo
      ) {

        this.agregarInsumoPendiente();

      }

      // Debe existir al menos un insumo.
      if (
        this.insumosPendientes.length === 0
      ) {

       alertaAdvertencia('Insumos requeridos', 'Agrega al menos un insumo antes de guardar.');
        return;
      }

      // Guardar todos los insumos.
      this.guardarInsumosPendientes();

      return;
    }

    // ==========================================================
    // GUARDADO NORMAL
    // ==========================================================

    this.guardarElementoIndividual();

  }

  // ============================================================
  // GUARDAR UN ELEMENTO INDIVIDUAL
  // ============================================================

  private guardarElementoIndividual(): void {

    const cantidad =
      Number(
        this.formularioElemento.cantidad
      );

    if (
      !cantidad ||
      cantidad <= 0
    ) {

      alertaAdvertencia('Cantidad inválida', 'La cantidad debe ser mayor que cero.');
      return;
    }

    if (
      this.tipoElemento === 'medicamento' &&
      !this.formularioElemento.id_medicamentos
    ) {

     alertaAdvertencia('Medicamento requerido', 'Selecciona un medicamento.');
      return;
    }

    if (
      this.tipoElemento === 'insumo' &&
      !this.formularioElemento.id_tipo_insumo
    ) {

      alertaAdvertencia('Tipo de insumo requerido', 'Selecciona un tipo de insumo.');

      return;
    }

    if (
      this.tipoElemento === 'insumo' &&
      !this.formularioElemento.id_insumo
    ) {

      alertaAdvertencia('Insumo requerido', 'Selecciona un insumo.');

      return;
    }

    const datos = {

      cantidad:
        cantidad,

      fecha_ingreso:
        this.formularioElemento.fecha_ingreso ||
        this.obtenerFechaHoraActual(),

      fecha_vencimiento:
        this.tipoElemento === 'medicamento'
          ? (
              this.formularioElemento
                .fecha_vencimiento || null
            )
          : null,

      observaciones:
        this.formularioElemento
          .observaciones
          ?.trim() || null,

      estado:
        this.formularioElemento.estado,

      id_paciente:
        this.idPaciente,

      id_medicamentos:
        this.tipoElemento === 'medicamento'
          ? Number(
              this.formularioElemento
                .id_medicamentos
            )
          : null,

      id_insumo:
        this.tipoElemento === 'insumo'
          ? Number(
              this.formularioElemento
                .id_insumo
            )
          : null

    };

    // ==========================================================
    // ACTUALIZAR
    // ==========================================================

    if (this.elementoEditando) {

      this.http
        .patch(
          `${this.apiUrl}/elementos_paciente/${this.elementoEditando.id_elemento}/`,
          datos
        )
        .subscribe({

          next: (respuesta) => {

            console.log(
              'Elemento actualizado:',
              respuesta
            );

              alertaExito('Elemento actualizado', 'El elemento se actualizó correctamente.');

            this.cerrarFormularioElemento();

            this.cargarElementosPaciente();

          },

          error: (error) => {

            console.error(
              'Error al actualizar elemento:',
              error
            );

            console.error(
              'Respuesta del servidor:',
              error?.error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible actualizar el elemento.'
            );

          }

        });

      return;

    }

    // ==========================================================
    // CREAR ELEMENTO INDIVIDUAL
    // ==========================================================

    this.http
      .post(
        `${this.apiUrl}/elementos_paciente/`,
        datos
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Elemento creado:',
            respuesta
          );

          alertaExito('Elemento registrado', 'El elemento se registró correctamente para el paciente.');

          this.cerrarFormularioElemento();

          this.cargarElementosPaciente();

        },

        error: (error) => {

          console.error(
            'Error al registrar elemento:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.mostrarErrorApi(
            error,
            'No fue posible registrar el elemento.'
          );

        }

      });

  }

  // ============================================================
  // GUARDAR TODOS LOS MEDICAMENTOS PENDIENTES
  // ============================================================

  private guardarMedicamentosPendientes(): void {

    const solicitudes =
      this.medicamentosPendientes.map(
        medicamento => {

          const datos = {

            cantidad:
              Number(
                medicamento.cantidad
              ),

            fecha_ingreso:
              medicamento.fecha_ingreso ||
              this.obtenerFechaHoraActual(),

            fecha_vencimiento:
              medicamento.fecha_vencimiento ||
              null,

            observaciones:
              medicamento.observaciones
                ?.trim() || null,

            estado:
              medicamento.estado,

            id_paciente:
              this.idPaciente,

            id_medicamentos:
              Number(
                medicamento.id_medicamentos
              ),

            id_insumo:
              null

          };

          console.log(
            'Medicamento que se enviará:',
            datos
          );

          return this.http.post(
            `${this.apiUrl}/elementos_paciente/`,
            datos
          );

        }
      );

    // Ejecutamos todos los POST.
    forkJoin(solicitudes).subscribe({

      next: (respuestas) => {

        console.log(
          'Medicamentos registrados:',
          respuestas
        );

       alertaExito('Medicamentos registrados', `Se registraron ${respuestas.length} medicamento(s) correctamente para el paciente.`);

        this.medicamentosPendientes = [];

        this.cerrarFormularioElemento();

        this.cargarElementosPaciente();

      },

      error: (error) => {

        console.error(
          'Error al registrar medicamentos:',
          error
        );

        console.error(
          'Respuesta del servidor:',
          error?.error
        );

        this.mostrarErrorApi(
          error,
          'No fue posible registrar todos los medicamentos.'
        );

      }

    });

  }

  // ============================================================
  // GUARDAR TODOS LOS INSUMOS PENDIENTES
  // ============================================================

  private guardarInsumosPendientes(): void {

    const solicitudes =
      this.insumosPendientes.map(
        insumo => {

          const datos = {

            cantidad:
              Number(
                insumo.cantidad
              ),

            fecha_ingreso:
              insumo.fecha_ingreso ||
              this.obtenerFechaHoraActual(),

            // Los insumos no manejan vencimiento.
            fecha_vencimiento:
              null,

            observaciones:
              insumo.observaciones
                ?.trim() || null,

            estado:
              insumo.estado,

            id_paciente:
              this.idPaciente,

            // Es un insumo, por eso medicamento es null.
            id_medicamentos:
              null,

            id_insumo:
              Number(
                insumo.id_insumo
              )

          };

          console.log(
            'Insumo que se enviará:',
            datos
          );

          return this.http.post(
            `${this.apiUrl}/elementos_paciente/`,
            datos
          );

        }
      );

    // Ejecutamos todos los POST.
    forkJoin(solicitudes).subscribe({

      next: (respuestas) => {

        console.log(
          'Insumos registrados:',
          respuestas
        );

        alertaExito('Insumos registrados', `Se registraron ${respuestas.length} insumo(s) correctamente para el paciente.`);

        this.insumosPendientes = [];

        this.cerrarFormularioElemento();

        this.cargarElementosPaciente();

      },

      error: (error) => {

        console.error(
          'Error al registrar insumos:',
          error
        );

        console.error(
          'Respuesta del servidor:',
          error?.error
        );

        this.mostrarErrorApi(
          error,
          'No fue posible registrar todos los insumos.'
        );

      }

    });

  }

  // ============================================================
  // CERRAR FORMULARIO
  // ============================================================

  cerrarFormularioElemento(): void {

    this.mostrarFormularioElemento =
      false;

    this.elementoEditando =
      null;

    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      id_tipo_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaHoraActual(),

      fecha_vencimiento: '',

      observaciones: '',

      estado: true

    };

    this.insumosFiltrados = [];

  }

  // ============================================================
  // CANCELAR REGISTRO DE ELEMENTO
  // ============================================================

  cancelarElemento(): void {

    this.mostrarFormularioElemento =
      false;

    this.mostrarMenuElementos =
      false;

    this.elementoEditando =
      null;

    // Limpiar medicamentos pendientes.
    this.medicamentosPendientes =
      [];

    // Limpiar insumos pendientes.
    this.insumosPendientes =
      [];

    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      id_tipo_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaHoraActual(),

      fecha_vencimiento: '',

      observaciones: '',

      estado: true

    };

    this.insumosFiltrados = [];

    this.cdr.detectChanges();

  }

  // ============================================================
  // ELIMINAR ELEMENTO
  // ============================================================

  eliminarElemento(elemento: ElementoPaciente): void {

  const nombre = this.obtenerNombreElemento(elemento);
  const entidad = this.obtenerTipoElemento(elemento) === 'Medicamento' ? 'medicamento' : 'insumo';

  alertaEliminar(nombre, entidad).then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http
      .delete(`${this.apiUrl}/elementos_paciente/${elemento.id_elemento}/`)
      .subscribe({

        next: () => {
          alertaExito('Elemento eliminado');
          this.cargarElementosPaciente();
        },

        error: (error) => {
          this.mostrarErrorApi(error, 'No fue posible eliminar el elemento.');
        }
      });
  });
}

  // ============================================================
  // CARGAR CUIDADOS DE ENFERMERÍA
  // ============================================================

  cargarCuidados(): void {

    this.cargandoCuidados = true;

    this.http
      .get<
        CuidadoEnfermeria[] |
        RespuestaPaginada<CuidadoEnfermeria>
      >(
        `${this.apiUrl}/cuidados_enfermeria/`
      )
      .subscribe({

        next: (respuesta) => {

          const cuidados =
            this.obtenerResultados(respuesta);

          const registro =
            cuidados.find(
              cuidado =>
                Number(
                  this.obtenerIdPaciente(
                    cuidado.id_paciente
                  )
                ) === Number(this.idPaciente)
            );

          if (registro) {

            this.cuidados = {

              id_cuidado:
                registro.id_cuidado,

              bano_paciente:
                registro.bano_paciente || '',

              peso_talla:
                registro.peso_talla || '',

              control_glucemia:
                registro.control_glucemia || '',

              curaciones:
                registro.curaciones || '',

              liquidos_administrados_eliminados:
                registro.liquidos_administrados_eliminados || '',

              control_deposicion:
                registro.control_deposicion || '',

              administracion_medicamentos:
                registro.administracion_medicamentos || '',

              id_paciente:
                this.idPaciente

            };

          } else {

            this.cuidados =
              this.crearCuidadosVacios();

          }

          this.cargandoCuidados = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar cuidados de enfermería:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.cuidados =
            this.crearCuidadosVacios();

          this.cargandoCuidados = false;

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // CREAR ESTRUCTURA VACÍA DE CUIDADOS
  // ============================================================

  private crearCuidadosVacios(): CuidadoEnfermeria {

    return {

      id_cuidado: 0,

      bano_paciente: '',

      peso_talla: '',

      control_glucemia: '',

      curaciones: '',

      liquidos_administrados_eliminados: '',

      control_deposicion: '',

      administracion_medicamentos: '',

      id_paciente:
        this.idPaciente

    };

  }

  // ============================================================
  // ABRIR FORMULARIO DE CUIDADOS
  // ============================================================

  abrirFormularioCuidados(): void {

    this.mostrarFormularioCuidados =
      true;

    this.cdr.detectChanges();

  }

  // ============================================================
  // GUARDAR CUIDADOS DE ENFERMERÍA
  // ============================================================

  guardarCuidados(): void {

    if (!this.idPaciente || this.idPaciente <= 0) {

     alertaAdvertencia('Paciente no identificado', 'No fue posible identificar el paciente.');
      return;
    }

    const datos = {

      bano_paciente:
        this.limpiarValor(
          this.cuidados.bano_paciente
        ),

      peso_talla:
        this.limpiarValor(
          this.cuidados.peso_talla
        ),

      control_glucemia:
        this.limpiarValor(
          this.cuidados.control_glucemia
        ),

      curaciones:
        this.limpiarValor(
          this.cuidados.curaciones
        ),

      liquidos_administrados_eliminados:
        this.limpiarValor(
          this.cuidados
            .liquidos_administrados_eliminados
        ),

      control_deposicion:
        this.limpiarValor(
          this.cuidados.control_deposicion
        ),

      administracion_medicamentos:
        this.limpiarValor(
          this.cuidados
            .administracion_medicamentos
        ),

      id_paciente:
        this.idPaciente

    };

    console.log(
      '======================================'
    );

    console.log(
      'GUARDANDO CUIDADOS DE ENFERMERÍA'
    );

    console.log(
      'Paciente:',
      this.idPaciente
    );

    console.log(
      'Datos enviados:',
      datos
    );

    console.log(
      '======================================'
    );

    // ==========================================================
    // ACTUALIZAR
    // ==========================================================

    if (this.cuidados.id_cuidado > 0) {

      this.http
        .patch(
          `${this.apiUrl}/cuidados_enfermeria/${this.cuidados.id_cuidado}/`,
          datos
        )
        .subscribe({

          next: (respuesta) => {

            console.log(
              'Cuidados actualizados:',
              respuesta
            );

            alertaExito('Cuidados actualizados', 'Los cuidados de enfermería se actualizaron correctamente.');

            this.mostrarFormularioCuidados =
              false;

            this.cargarCuidados();

          },

          error: (error) => {

            console.error(
              'Error al actualizar cuidados:',
              error
            );

            console.error(
              'Respuesta del servidor:',
              error?.error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible actualizar los cuidados de enfermería.'
            );

          }

        });

      return;

    }

    // ==========================================================
    // CREAR
    // ==========================================================

    this.http
      .post(
        `${this.apiUrl}/cuidados_enfermeria/`,
        datos
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Cuidados registrados:',
            respuesta
          );

          alertaExito('Cuidados registrados', 'Los cuidados de enfermería se registraron correctamente.');
          this.mostrarFormularioCuidados =
            false;

          this.cargarCuidados();

        },

        error: (error) => {

          console.error(
            'Error al registrar cuidados:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.mostrarErrorApi(
            error,
            'No fue posible registrar los cuidados de enfermería.'
          );

        }

      });

  }

  // ============================================================
  // LIMPIAR VALORES
  // ============================================================

  private limpiarValor(
    valor: string | null
  ): string | null {

    if (!valor) {
      return null;
    }

    const valorLimpio =
      valor.trim();

    return valorLimpio || null;

  }

  // ============================================================
  // EDITAR CUIDADOS
  // ============================================================

  editarCuidados(): void {

    if (!this.cuidados.id_cuidado) {

      alertaAdvertencia('Sin cuidados registrados', 'Primero debe registrar los cuidados de enfermería.');

      return;

    }

    this.mostrarFormularioCuidados =
      true;

    this.cdr.detectChanges();

  }

  // ============================================================
  // ELIMINAR CUIDADOS
  // ============================================================

  eliminarCuidados(): void {

  if (!this.cuidados.id_cuidado) {
    alertaAdvertencia('Sin cuidados', 'No existen cuidados de enfermería para eliminar.');
    return;
  }

  const nombre = `${this.paciente.nombre} ${this.paciente.apellido}`.trim();

  alertaEliminar(nombre, 'registro de cuidados de enfermería').then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http
      .delete(`${this.apiUrl}/cuidados_enfermeria/${this.cuidados.id_cuidado}/`)
      .subscribe({

        next: () => {
          alertaExito('Cuidados eliminados', 'Los cuidados fueron eliminados correctamente.');
          this.cuidados = this.crearCuidadosVacios();
          this.mostrarFormularioCuidados = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          this.mostrarErrorApi(error, 'No fue posible eliminar los cuidados de enfermería.');
        }
      });
  });
}

  // ============================================================
  // CARGAR RECOMENDACIONES
  // ============================================================

  cargarRecomendaciones(): void {

    this.cargandoRecomendaciones = true;

    this.http
      .get<
        Recomendacion[] |
        RespuestaPaginada<Recomendacion>
      >(
        `${this.apiUrl}/recomendaciones/`
      )
      .subscribe({

        next: (respuesta) => {

          const recomendaciones =
            this.obtenerResultados(respuesta);

          const registro =
            recomendaciones.find(
              recomendacion =>
                Number(
                  this.obtenerIdPaciente(
                    recomendacion.id_paciente
                  )
                ) ===
                Number(this.idPaciente)
            );

          if (registro) {

            this.recomendaciones = {

              id_recomendacion:
                registro.id_recomendacion,

              hidratar_piel:
                registro.hidratar_piel || '',

              asistir_alimentacion:
                registro.asistir_alimentacion || '',

              via_alimentacion:
                registro.via_alimentacion || '',

              prevencion_caidas:
                registro.prevencion_caidas || '',

              terapias_fisicas:
                registro.terapias_fisicas || '',

              terapia_respiratoria:
                registro.terapia_respiratoria || '',

              actividad_ocupacional:
                registro.actividad_ocupacional || '',

              corte_unas:
                registro.corte_unas || '',

              corte_cabello:
                registro.corte_cabello || '',

              higiene_oral:
                registro.higiene_oral || '',

              id_paciente:
                this.idPaciente

            };

          } else {

            this.recomendaciones =
              this.crearRecomendacionesVacias();

          }

          this.cargandoRecomendaciones = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar recomendaciones:',
            error
          );

          this.recomendaciones =
            this.crearRecomendacionesVacias();

          this.cargandoRecomendaciones = false;

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // CREAR ESTRUCTURA VACÍA DE RECOMENDACIONES
  // ============================================================

  private crearRecomendacionesVacias(): Recomendacion {

    return {

      id_recomendacion: 0,

      hidratar_piel: '',

      asistir_alimentacion: '',

      via_alimentacion: '',

      prevencion_caidas: '',

      terapias_fisicas: '',

      terapia_respiratoria: '',

      actividad_ocupacional: '',

      corte_unas: '',

      corte_cabello: '',

      higiene_oral: '',

      id_paciente:
        this.idPaciente

    };

  }

  // ============================================================
  // ABRIR FORMULARIO DE RECOMENDACIONES
  // ============================================================

  abrirFormularioRecomendaciones(): void {

    if (
      !this.recomendaciones.id_recomendacion
    ) {

      this.recomendaciones =
        this.crearRecomendacionesVacias();

    }

    this.mostrarFormularioRecomendaciones =
      true;

    this.cdr.detectChanges();

  }

  // ============================================================
  // GUARDAR RECOMENDACIONES
  // ============================================================

  guardarRecomendaciones(): void {

    if (
      !this.idPaciente ||
      this.idPaciente <= 0
    ) {

      alertaAdvertencia('Paciente no identificado', 'No fue posible identificar el paciente.');

      return;
    }

    const datos = {

      hidratar_piel:
        this.limpiarValor(
          this.recomendaciones.hidratar_piel
        ),

      asistir_alimentacion:
        this.limpiarValor(
          this.recomendaciones.asistir_alimentacion
        ),

      via_alimentacion:
        this.limpiarValor(
          this.recomendaciones.via_alimentacion
        ),

      prevencion_caidas:
        this.limpiarValor(
          this.recomendaciones.prevencion_caidas
        ),

      terapias_fisicas:
        this.limpiarValor(
          this.recomendaciones.terapias_fisicas
        ),

      terapia_respiratoria:
        this.limpiarValor(
          this.recomendaciones.terapia_respiratoria
        ),

      actividad_ocupacional:
        this.limpiarValor(
          this.recomendaciones.actividad_ocupacional
        ),

      corte_unas:
        this.limpiarValor(
          this.recomendaciones.corte_unas
        ),

      corte_cabello:
        this.limpiarValor(
          this.recomendaciones.corte_cabello
        ),

      higiene_oral:
        this.limpiarValor(
          this.recomendaciones.higiene_oral
        ),

      id_paciente:
        this.idPaciente

    };

    console.log(
      '======================================'
    );

    console.log(
      'GUARDANDO RECOMENDACIONES'
    );

    console.log(
      'Paciente:',
      this.idPaciente
    );

    console.log(
      'Datos enviados:',
      datos
    );

    console.log(
      '======================================'
    );

    // ==========================================================
    // ACTUALIZAR
    // ==========================================================

    if (
      this.recomendaciones.id_recomendacion > 0
    ) {

      this.http
        .patch(
          `${this.apiUrl}/recomendaciones/${this.recomendaciones.id_recomendacion}/`,
          datos
        )
        .subscribe({

          next: (respuesta) => {

            console.log(
              'Recomendaciones actualizadas:',
              respuesta
            );

           alertaExito('Recomendaciones actualizadas', 'La información se actualizó correctamente.');

            this.mostrarFormularioRecomendaciones =
              false;

            this.cargarRecomendaciones();

          },

          error: (error) => {

            console.error(
              'Error al actualizar recomendaciones:',
              error
            );

            console.error(
              'Respuesta del servidor:',
              error?.error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible actualizar las recomendaciones.'
            );

          }

        });

      return;

    }

    // ==========================================================
    // CREAR
    // ==========================================================

    this.http
      .post(
        `${this.apiUrl}/recomendaciones/`,
        datos
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Recomendaciones registradas:',
            respuesta
          );

          alertaExito('Recomendaciones registradas', 'Las recomendaciones se registraron correctamente.');

          this.mostrarFormularioRecomendaciones =
            false;

          this.cargarRecomendaciones();

        },

        error: (error) => {

          console.error(
            'Error al registrar recomendaciones:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.mostrarErrorApi(
            error,
            'No fue posible registrar las recomendaciones.'
          );

        }

      });

  }

  // ============================================================
  // EDITAR RECOMENDACIONES
  // ============================================================

  editarRecomendaciones(): void {

    if (
      !this.recomendaciones.id_recomendacion ||
      this.recomendaciones.id_recomendacion <= 0
    ) {

     alertaAdvertencia('Sin recomendaciones', 'Primero debe registrar las recomendaciones.');

      return;
    }

    this.mostrarFormularioRecomendaciones =
      true;

    this.cdr.detectChanges();

  }

  // ============================================================
  // ELIMINAR RECOMENDACIONES
  // ============================================================

eliminarRecomendaciones(): void {

  if (!this.recomendaciones.id_recomendacion || this.recomendaciones.id_recomendacion <= 0) {
    alertaAdvertencia('Sin recomendaciones', 'No existen recomendaciones para eliminar.');
    return;
  }

  const nombre = `${this.paciente.nombre} ${this.paciente.apellido}`.trim();

  alertaEliminar(nombre, 'registro de recomendaciones').then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http
      .delete(`${this.apiUrl}/recomendaciones/${this.recomendaciones.id_recomendacion}/`)
      .subscribe({

        next: () => {
          alertaExito('Recomendaciones eliminadas', 'Las recomendaciones fueron eliminadas correctamente.');
          this.recomendaciones = this.crearRecomendacionesVacias();
          this.mostrarFormularioRecomendaciones = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          this.mostrarErrorApi(error, 'No fue posible eliminar las recomendaciones.');
        }
      });
  });
}

  // ============================================================
  // CARGAR HISTORIA CLÍNICA
  // ============================================================

  cargarHistoriaClinica(): void {

    if (
      !this.idPaciente ||
      this.idPaciente <= 0
    ) {

      console.error(
        'No se puede cargar la historia clínica: ID de paciente inválido.'
      );

      return;
    }

    this.cargandoHistoria = true;

    this.http
      .get<
        HistoriaClinica[] |
        RespuestaPaginada<HistoriaClinica>
      >(
        `${this.apiUrl}/historia_clinicas/`
      )
      .subscribe({

        next: (respuesta) => {

          const historias =
            this.obtenerResultados(respuesta);

          const registro =
            historias.find(historia => {

              const idRelacion =
                this.obtenerIdPaciente(
                  historia.id_paciente
                );

              return Number(idRelacion) ===
                Number(this.idPaciente);

            });

          if (registro) {

            this.historiaClinica = {

              id_historia_clinica:
                registro.id_historia_clinica,

              fecha_apertura:
                this.convertirFechaParaInput(
                  registro.fecha_apertura
                ),

              antecedentes:
                registro.antecedentes || '',

              alergias:
                registro.alergias || '',

              observaciones:
                registro.observaciones || '',

              estado:
                registro.estado ?? true,

              id_paciente:
                this.idPaciente

            };

            console.log(
              'Historia clínica encontrada:',
              this.historiaClinica
            );

          } else {

            this.historiaClinica =
              this.crearHistoriaClinicaVacia();

            console.log(
              'El paciente no tiene historia clínica registrada.'
            );

          }

          this.cargandoHistoria = false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al cargar historia clínica:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.historiaClinica =
            this.crearHistoriaClinicaVacia();

          this.cargandoHistoria = false;

          this.cdr.detectChanges();

        }

      });

  }

  // ============================================================
  // CREAR HISTORIA CLÍNICA VACÍA
  // ============================================================

  private crearHistoriaClinicaVacia(): HistoriaClinica {

    return {

      id_historia_clinica: 0,

      fecha_apertura:
        this.obtenerFechaActual(),

      antecedentes: '',

      alergias: '',

      observaciones: '',

      estado: true,

      id_paciente:
        this.idPaciente

    };

  }

  // ============================================================
  // ABRIR FORMULARIO DE HISTORIA CLÍNICA
  // ============================================================

  abrirFormularioHistoria(): void {

    if (
      !this.historiaClinica
    ) {

      this.historiaClinica =
        this.crearHistoriaClinicaVacia();

    }

    this.historiaClinica.id_paciente =
      this.idPaciente;

    this.mostrarFormularioHistoria =
      true;

    this.cdr.detectChanges();

  }

  // ============================================================
  // EDITAR HISTORIA CLÍNICA
  // ============================================================

  editarHistoriaClinica(): void {

    if (
      !this.historiaClinica.id_historia_clinica ||
      this.historiaClinica.id_historia_clinica <= 0
    ) {

      alertaAdvertencia('Sin historia clínica', 'Primero debe registrar la historia clínica.');

      return;
    }

    this.mostrarFormularioHistoria =
      true;

    this.cdr.detectChanges();

  }

  // ============================================================
  // GUARDAR HISTORIA CLÍNICA
  // ============================================================

  guardarHistoriaClinica(): void {

    if (
      !this.idPaciente ||
      this.idPaciente <= 0
    ) {

      alertaAdvertencia('Paciente no identificado', 'No fue posible identificar el paciente.');

      return;
    }

    const datos = {

      fecha_apertura:
        this.historiaClinica.fecha_apertura ||
        this.obtenerFechaActual(),

      antecedentes:
        this.limpiarValor(
          this.historiaClinica.antecedentes
        ),

      alergias:
        this.limpiarValor(
          this.historiaClinica.alergias
        ),

      observaciones:
        this.limpiarValor(
          this.historiaClinica.observaciones
        ),

      estado:
        this.historiaClinica.estado ?? true,

      id_paciente:
        this.idPaciente

    };

    console.log(
      '======================================'
    );

    console.log(
      'GUARDANDO HISTORIA CLÍNICA'
    );

    console.log(
      'Paciente:',
      this.idPaciente
    );

    console.log(
      'Datos enviados:',
      datos
    );

    console.log(
      '======================================'
    );

    // ==========================================================
    // ACTUALIZAR HISTORIA EXISTENTE
    // ==========================================================

    if (
      this.historiaClinica.id_historia_clinica > 0
    ) {

      this.http
        .patch(
          `${this.apiUrl}/historia_clinicas/${this.historiaClinica.id_historia_clinica}/`,
          datos
        )
        .subscribe({

          next: (respuesta) => {

            console.log(
              'Historia clínica actualizada:',
              respuesta
            );

            alertaExito('Historia clínica actualizada', 'La información se actualizó correctamente.');

            this.mostrarFormularioHistoria =
              false;

            this.cargarHistoriaClinica();

          },

          error: (error) => {

            console.error(
              'Error al actualizar historia clínica:',
              error
            );

            console.error(
              'Respuesta del servidor:',
              error?.error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible actualizar la historia clínica.'
            );

          }

        });

      return;
    }

    // ==========================================================
    // CREAR HISTORIA NUEVA
    // ==========================================================

    this.http
      .post(
        `${this.apiUrl}/historia_clinicas/`,
        datos
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Historia clínica registrada:',
            respuesta
          );

         alertaExito('Historia clínica registrada', 'La historia clínica se registró correctamente.');

          this.mostrarFormularioHistoria =
            false;

          this.cargarHistoriaClinica();

        },

        error: (error) => {

          console.error(
            'Error al registrar historia clínica:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.mostrarErrorApi(
            error,
            'No fue posible registrar la historia clínica.'
          );

        }

      });

  }

  // ============================================================
  // ELIMINAR HISTORIA CLÍNICA
  // ============================================================

  eliminarHistoriaClinica(): void {

  if (!this.historiaClinica.id_historia_clinica || this.historiaClinica.id_historia_clinica <= 0) {
    alertaAdvertencia('Sin historia clínica', 'No existe una historia clínica para eliminar.');
    return;
  }

  const nombre = `${this.paciente.nombre} ${this.paciente.apellido}`.trim();

  alertaEliminar(nombre, 'historia clínica').then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http
      .delete(`${this.apiUrl}/historia_clinicas/${this.historiaClinica.id_historia_clinica}/`)
      .subscribe({

        next: () => {
          alertaExito('Historia clínica eliminada', 'La historia clínica fue eliminada correctamente.');
          this.historiaClinica = this.crearHistoriaClinicaVacia();
          this.mostrarFormularioHistoria = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          this.mostrarErrorApi(error, 'No fue posible eliminar la historia clínica.');
        }
      });
  });
}

  // ============================================================
  // MÉTODOS COMPATIBLES CON EL HTML
  // ============================================================

  cancelarCuidado(): void {
    this.cancelarCuidados();
  }

  cancelarRecomendacion(): void {
    this.cancelarRecomendaciones();
  }

  eliminarCuidado(index: number): void {

    alertaAdvertencia('Cuidado', 'Los cuidados se administran como un único registro por paciente.');

  }

  eliminarRecomendacion(index: number): void {

    alertaAdvertencia('Recomendaciones', 'Las recomendaciones se administran como un único registro por paciente.')

  }

  // ============================================================
  // CANCELAR CUIDADOS
  // ============================================================

  cancelarCuidados(): void {

    this.cargarCuidados();

    this.mostrarFormularioCuidados =
      false;

  }

  // ============================================================
  // CANCELAR RECOMENDACIONES
  // ============================================================

  cancelarRecomendaciones(): void {

    this.cargarRecomendaciones();

    this.mostrarFormularioRecomendaciones =
      false;

  }

  // ============================================================
  // CANCELAR HISTORIA
  // ============================================================

  cancelarHistoria(): void {

    this.cargarHistoriaClinica();

    this.mostrarFormularioHistoria =
      false;

  }

  // ============================================================
  // GUARDAR BORRADOR
  // ============================================================

  guardarBorrador(): void {

    alertaExito('Borrador guardado', 'La información registrada actualmente está guardada en el sistema.');

  }

// ============================================================
// FINALIZAR REGISTRO
// ============================================================

finalizarRegistro(): void {

  const faltantes: string[] = [];

  // ============================================================
  // VALIDAR INFORMACIÓN BÁSICA DEL PACIENTE
  // ============================================================

  if (
    !this.paciente ||
    !this.paciente.id_paciente ||
    this.paciente.id_paciente <= 0
  ) {

    faltantes.push(
      'Información básica del paciente'
    );

  }

  // ============================================================
  // VALIDAR ELEMENTOS DEL PACIENTE
  // ============================================================

  if (
    !this.elementosPaciente ||
    this.elementosPaciente.length === 0
  ) {

    faltantes.push(
      'Elementos del paciente'
    );

  }

  // ============================================================
  // VALIDAR CUIDADOS DE ENFERMERÍA
  // ============================================================

  if (
    !this.cuidados ||
    !this.cuidados.id_cuidado ||
    this.cuidados.id_cuidado <= 0
  ) {

    faltantes.push(
      'Cuidados de enfermería'
    );

  }

  // ============================================================
  // VALIDAR RECOMENDACIONES
  // ============================================================

  if (
    !this.recomendaciones ||
    !this.recomendaciones.id_recomendacion ||
    this.recomendaciones.id_recomendacion <= 0
  ) {

    faltantes.push(
      'Recomendaciones'
    );

  }

  // ============================================================
  // VALIDAR HISTORIA CLÍNICA
  // ============================================================

  if (
    !this.historiaClinica ||
    !this.historiaClinica.id_historia_clinica ||
    this.historiaClinica.id_historia_clinica <= 0
  ) {

    faltantes.push(
      'Historia clínica'
    );

  }

  // ============================================================
  // MOSTRAR APARTADOS FALTANTES
  // ============================================================

  if (faltantes.length > 0) {
  mostrarAlerta({
    tono: 'ambar',
    icono: 'warning',
    iconoSvg: ICONOS.alerta,
    titulo: 'Registro incompleto',
    html: `
      <p class="m-0 text-[1.15rem] leading-snug text-slate-700">Aún faltan apartados por completar:</p>
      <ul class="mt-2 ml-5 list-disc text-[1.05rem] text-slate-700">
        ${faltantes.map(item => `<li>${item}</li>`).join('')}
      </ul>
    `,
    confirmar: 'Entendido'
  });
  return;
}

  // ============================================================
  // CONFIRMAR FINALIZACIÓN
  // ============================================================

  mostrarAlerta({
  tono: 'azul',
  icono: 'question',
  iconoSvg: ICONOS.check,
  titulo: '¿Finalizar registro?',
  html: `<p class="m-0 text-[1.15rem] leading-snug text-slate-700">Toda la información del paciente está completa.</p>`,
  confirmar: 'Sí, finalizar',
  cancelar: 'Cancelar',
  confirmarIzquierda: true

}).then((resultado: any) => {

  if (!resultado.isConfirmed) {
    return;
  }

  alertaExito('¡Registro finalizado!', 'La información del paciente se registró correctamente.').then(() => {

    this.mostrarBarraFinal = false;
    this.cdr.detectChanges();

  });

});

 }

}






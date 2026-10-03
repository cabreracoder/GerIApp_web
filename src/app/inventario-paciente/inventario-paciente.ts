import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

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
// INTERFAZ DE RESPUESTA PAGINADA
// ============================================================
interface RespuestaPaginada<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================
// INTERFAZ DEL PACIENTE
// ============================================================
interface Paciente {
  id_paciente?: number;
  id?: number;
  numero_documento?: string;
  documento?: string;
  nombres?: string;
  apellidos?: string;
  eps?: string;
  habitacion?: string | number;
  cama?: string | number;
}

// ============================================================
// INTERFAZ DEL MEDICAMENTO
// ============================================================
interface Medicamento {
  id_medicamentos?: number;
  id_medicamento?: number;
  id?: number;
  nombre: string;
  descripcion?: string;
  principio_activo?: string;
  concentracion?: string;
  presentacion?: string;
  estado?: boolean;
  unidad_medida?: string;
}

// ============================================================
// INTERFAZ DEL REGISTRO DE INVENTARIO
// ============================================================
interface RegistroInventario {
  id_inventario?: number;

  id_paciente?:
    | number
    | string
    | {
        id_paciente?: number;
        id?: number;
      }
    | null;

  id_medicamentos?:
    | number
    | string
    | {
        id_medicamentos?: number;
        id_medicamento?: number;
        id?: number;
      }
    | null;

  cantidad_actual?: number | string;
  cantidad_minima?: number | string;
  fecha_ultimo_ingreso?: string | null;
  fecha_vencimiento?: string | null;
  estado?: boolean | string;
}

// ============================================================
// INTERFAZ DEL MEDICAMENTO MOSTRADO
// ============================================================
export interface MedicamentoInventario {
  id: string;
  idInventario: number;
  idMedicamento: number;
  nombre: string;
  descripcion: string;
  principioActivo: string;
  concentracion: string;
  presentacion: string;
  unidadMedida: string;
  cantidad: number;
  cantidadMinima: number;
  cantidadRegistros: number;
  fechaIngreso: string | null;
  fechaVencimiento: string | null;
  diasParaVencer: number | null;
  estaPorVencer: boolean;
  estaVencido: boolean;
  stockBajo: boolean;
  estado: boolean;
  observaciones: string;
  registros: RegistroInventario[];
}

@Component({
  selector: 'app-inventario-paciente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inventario-paciente.html',
  styleUrls: ['./inventario-paciente.css']
})
export class InventarioPaciente implements OnChanges, OnDestroy {

  private apiUrl =
    'https://geriapp-backend.onrender.com/api';

  @Input() idPaciente!: number | string;

  @Input() paciente: Paciente | null = null;

  @Input() estaAbierto = false;

  @Output() cerrar =
    new EventEmitter<void>();

  // ============================================================
  // DATOS
  // ============================================================
  inventario: RegistroInventario[] = [];

  medicamentos: Medicamento[] = [];

  medicamentosInventario:
    MedicamentoInventario[] = [];

  medicamentosFiltrados:
    MedicamentoInventario[] = [];

  // ============================================================
  // ESTADO
  // ============================================================
  cargando = false;

  textoBusqueda = '';

  categoriaSeleccionada:
    'todos' | 'stock-bajo' = 'todos';

  // ============================================================
  // CATEGORÍAS
  // ============================================================
  categorias = [
    {
      id: 'todos' as const,
      nombre: 'Todos'
    },
    {
      id: 'stock-bajo' as const,
      nombre: 'Stock bajo'
    }
  ];

  // ============================================================
  // CONSTRUCTOR
  // ============================================================
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // ============================================================
  // CAMBIOS DE LOS INPUTS
  // ============================================================
  ngOnChanges(changes: SimpleChanges): void {

    // ==========================================================
    // CARGAR CUANDO SE ABRE EL PANEL
    // ==========================================================
    if (
      changes['estaAbierto'] &&
      this.estaAbierto
    ) {

      this.cargarInventario();

      this.bloquearScroll();
    }

    // ==========================================================
    // CARGAR SI CAMBIA EL PACIENTE
    // ==========================================================
    if (
      changes['idPaciente'] &&
      this.idPaciente &&
      this.estaAbierto
    ) {

      this.cargarInventario();
    }

    // ==========================================================
    // RESTAURAR SCROLL AL CERRAR
    // ==========================================================
    if (
      changes['estaAbierto'] &&
      !this.estaAbierto
    ) {

      this.restaurarScroll();
    }
  }

  // ============================================================
  // DESTRUIR COMPONENTE
  // ============================================================
  ngOnDestroy(): void {

    this.restaurarScroll();

    document.removeEventListener(
      'keydown',
      this.manejarTeclaEscape
    );
  }

 
// ============================================================
// CARGAR INVENTARIO DEL PACIENTE
// ============================================================

cargarInventario(): void {

  // ==========================================================
  // VALIDAR QUE EXISTA EL ID DEL PACIENTE
  // ==========================================================

  if (!this.idPaciente) {

    console.warn(
      'No se puede cargar el inventario porque no existe idPaciente'
    );

    this.inventario = [];
    this.medicamentosInventario = [];
    this.medicamentosFiltrados = [];

    return;
  }

  // ==========================================================
  // ACTIVAR ESTADO DE CARGA
  // ==========================================================

  this.cargando = true;

  // ==========================================================
  // CONSULTAR INVENTARIO DEL PACIENTE
  // ==========================================================

  const url = `${this.apiUrl}/inventario/?id_paciente=${this.idPaciente}`;

  console.log('Consultando inventario:', url);

  this.http.get<
    RespuestaPaginada<RegistroInventario> |
    RegistroInventario[]
  >(url).subscribe({

    // ========================================================
    // RESPUESTA EXITOSA
    // ========================================================

    next: (respuesta) => {

      console.log(
        'Inventario recibido del paciente:',
        respuesta
      );

      // ======================================================
      // EXTRAER LOS REGISTROS
      // ======================================================

      this.inventario = this.extraerResultados(respuesta);

      console.log(
        'Registros de inventario:',
        this.inventario
      );

      // ======================================================
      // CARGAR CATÁLOGO DE MEDICAMENTOS
      // ======================================================

      this.cargarMedicamentos();
    },

    // ========================================================
    // ERROR
    // ========================================================

    error: (error) => {

      console.error(
        'Error al cargar el inventario:',
        error
      );

      this.inventario = [];
      this.medicamentosInventario = [];
      this.medicamentosFiltrados = [];

      this.cargando = false;

      this.cdr.detectChanges();
    }
  });
}

  // ============================================================
  // CARGAR MEDICAMENTOS
  // ============================================================
  private cargarMedicamentos(): void {

    this.http.get<
      RespuestaPaginada<Medicamento> |
      Medicamento[]
    >(
      `${this.apiUrl}/medicamentos/`
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'Respuesta de /medicamentos/:',
          respuesta
        );

        this.medicamentos =
          this.extraerResultados(
            respuesta
          );

        console.log(
          'Medicamentos cargados:',
          this.medicamentos
        );

        this.construirInventario();

        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error al consultar /medicamentos/:',
          error
        );

        this.medicamentos = [];

        this.construirInventario();

        this.cargando = false;

        this.cdr.detectChanges();
      }
    });
  }

  // ============================================================
  // CONSTRUIR INVENTARIO AGRUPADO
  // ============================================================
  private construirInventario(): void {

    const grupos =
      new Map<
        number,
        RegistroInventario[]
      >();

    // ==========================================================
    // AGRUPAR POR MEDICAMENTO
    // ==========================================================
    for (
      const registro of this.inventario
    ) {

      const idMedicamento =
        this.obtenerIdMedicamento(
          registro
        );

      console.log(
        'Medicamento encontrado en inventario:',
        {
          idMedicamento,
          registro
        }
      );

      if (!idMedicamento) {
        continue;
      }

      if (!grupos.has(idMedicamento)) {
        grupos.set(
          idMedicamento,
          []
        );
      }

      grupos
        .get(idMedicamento)!
        .push(registro);
    }

    console.log(
      'Grupos de medicamentos:',
      grupos
    );

    const inventarioAgrupado:
      MedicamentoInventario[] = [];

    // ==========================================================
    // CREAR TARJETAS
    // ==========================================================
    grupos.forEach(
      (registros, idMedicamento) => {

        const medicamento =
          this.buscarMedicamento(
            idMedicamento
          );

        // ======================================================
        // SUMAR CANTIDAD ACTUAL
        // ======================================================
        const cantidadTotal =
          registros.reduce(
            (
              total,
              registro
            ) => {

              return (
                total +
                (
                  Number(
                    registro.cantidad_actual
                  ) || 0
                )
              );
            },
            0
          );

        // ======================================================
        // CANTIDAD MÍNIMA
        // ======================================================
        const cantidadMinima =
          registros.reduce(
            (
              minima,
              registro
            ) => {

              const cantidad =
                Number(
                  registro.cantidad_minima
                ) || 0;

              if (
                minima === 0
              ) {
                return cantidad;
              }

              if (
                cantidad > 0 &&
                cantidad < minima
              ) {
                return cantidad;
              }

              return minima;
            },
            0
          );

        // ======================================================
        // STOCK BAJO
        // ======================================================
        const stockBajo =
          cantidadTotal < 5;

        // ======================================================
        // REGISTRO PRINCIPAL
        // ======================================================
        const registroPrincipal =
          registros[0];

        // ======================================================
        // FECHA DE VENCIMIENTO
        // ======================================================
        const fechasVencimiento =
          registros
            .map(
              registro =>
                registro.fecha_vencimiento
            )
            .filter(
              (
                fecha
              ): fecha is string =>
                !!fecha
            );

        let fechaVencimiento:
          string | null = null;

        if (
          fechasVencimiento.length > 0
        ) {

          fechaVencimiento =
            [
              ...fechasVencimiento
            ].sort(
              (a, b) =>
                new Date(a).getTime() -
                new Date(b).getTime()
            )[0];
        }

        // ======================================================
        // FECHA DE INGRESO
        // ======================================================
        const fechasIngreso =
          registros
            .map(
              registro =>
                registro.fecha_ultimo_ingreso
            )
            .filter(
              (
                fecha
              ): fecha is string =>
                !!fecha
            );

        let fechaIngreso:
          string | null = null;

        if (
          fechasIngreso.length > 0
        ) {

          fechaIngreso =
            [
              ...fechasIngreso
            ].sort(
              (a, b) =>
                new Date(a).getTime() -
                new Date(b).getTime()
            )[0];
        }

        // ======================================================
        // DÍAS PARA VENCER
        // ======================================================
        const diasParaVencer =
          this.calcularDiasParaVencer(
            fechaVencimiento
          );

        // ======================================================
        // ESTADO DE VENCIMIENTO
        // ======================================================
        const estaVencido =
          registros.some(
            registro =>
              this.estaRegistroVencido(
                registro.fecha_vencimiento
              )
          );

        const estaPorVencer =
          registros.some(
            registro =>
              this.estaRegistroPorVencer(
                registro.fecha_vencimiento
              )
          );

        // ======================================================
        // DATOS DEL MEDICAMENTO
        // ======================================================
        const nombre =
          medicamento?.nombre ||
          'Medicamento';

        const principioActivo =
          medicamento?.principio_activo ||
          'No especificado';

        const concentracion =
          medicamento?.concentracion ||
          'No especificada';

        const presentacion =
          medicamento?.presentacion ||
          'No especificada';

        const unidadMedida =
          medicamento?.unidad_medida ||
          'unidades';

        const descripcion =
          medicamento?.descripcion ||
          '';

        const estado =
          medicamento?.estado !== undefined
            ? medicamento.estado
            : this.convertirEstado(
                registroPrincipal.estado
              );

        // ======================================================
        // CREAR OBJETO PARA LA TARJETA
        // ======================================================
        inventarioAgrupado.push({

          id:
            `medicamento-${idMedicamento}`,

          idInventario:
            Number(
              registroPrincipal.id_inventario ||
              0
            ),

          idMedicamento,

          nombre,

          descripcion,

          principioActivo,

          concentracion,

          presentacion,

          unidadMedida,

          cantidad:
            cantidadTotal,

          cantidadMinima,

          cantidadRegistros:
            registros.length,

          fechaIngreso,

          fechaVencimiento,

          diasParaVencer,

          estaPorVencer,

          estaVencido,

          stockBajo,

          estado,

          observaciones: '',

          registros
        });
      }
    );

    // ==========================================================
    // ORDENAR
    // ==========================================================
    this.medicamentosInventario =
      inventarioAgrupado.sort(
        (a, b) =>
          a.nombre.localeCompare(
            b.nombre
          )
      );

    console.log(
      'Inventario final para mostrar:',
      this.medicamentosInventario
    );

    // ==========================================================
    // APLICAR FILTROS
    // ==========================================================
    this.aplicarFiltros();
  }

  // ============================================================
  // OBTENER ID DEL PACIENTE
  // ============================================================
  private obtenerIdPaciente(
    registro: RegistroInventario
  ): number {

    const paciente =
      registro.id_paciente;

    // ==========================================================
    // SI VIENE COMO NÚMERO
    // ==========================================================
    if (
      typeof paciente === 'number'
    ) {

      return paciente;
    }

    // ==========================================================
    // SI VIENE COMO TEXTO
    // ==========================================================
    if (
      typeof paciente === 'string'
    ) {

      return Number(
        paciente
      );
    }

    // ==========================================================
    // SI VIENE COMO OBJETO
    // ==========================================================
    if (
      paciente &&
      typeof paciente === 'object'
    ) {

      return Number(
        paciente.id_paciente ||
        paciente.id ||
        0
      );
    }

    return 0;
  }

  // ============================================================
  // OBTENER ID DEL MEDICAMENTO
  // ============================================================
  private obtenerIdMedicamento(
    registro: RegistroInventario
  ): number {

    const medicamento =
      registro.id_medicamentos;

    // ==========================================================
    // SI VIENE COMO NÚMERO
    // ==========================================================
    if (
      typeof medicamento === 'number'
    ) {

      return medicamento;
    }

    // ==========================================================
    // SI VIENE COMO TEXTO
    // ==========================================================
    if (
      typeof medicamento === 'string'
    ) {

      return Number(
        medicamento
      );
    }

    // ==========================================================
    // SI VIENE COMO OBJETO
    // ==========================================================
    if (
      medicamento &&
      typeof medicamento === 'object'
    ) {

      return Number(
        medicamento.id_medicamentos ||
        medicamento.id_medicamento ||
        medicamento.id ||
        0
      );
    }

    return 0;
  }

  // ============================================================
  // BUSCAR MEDICAMENTO
  // ============================================================
  private buscarMedicamento(
    idMedicamento: number
  ): Medicamento | undefined {

    return this.medicamentos.find(
      medicamento =>
        this.obtenerIdMedicamentoCatalogo(
          medicamento
        ) === idMedicamento
    );
  }

  // ============================================================
  // OBTENER ID DEL CATÁLOGO
  // ============================================================
  private obtenerIdMedicamentoCatalogo(
    medicamento: Medicamento
  ): number {

    return Number(
      medicamento.id_medicamentos ||
      medicamento.id_medicamento ||
      medicamento.id ||
      0
    );
  }

  // ============================================================
  // CAMBIAR BÚSQUEDA
  // ============================================================
  cambiarBusqueda(
    evento: Event
  ): void {

    const input =
      evento.target as HTMLInputElement;

    this.textoBusqueda =
      input.value;

    this.aplicarFiltros();
  }

  // ============================================================
  // LIMPIAR BÚSQUEDA
  // ============================================================
  limpiarBusqueda(): void {

    this.textoBusqueda = '';

    this.aplicarFiltros();
  }

  // ============================================================
  // SELECCIONAR CATEGORÍA
  // ============================================================
  seleccionarCategoria(
    categoria:
      'todos' |
      'stock-bajo'
  ): void {

    this.categoriaSeleccionada =
      categoria;

    this.aplicarFiltros();
  }

  // ============================================================
  // APLICAR FILTROS
  // ============================================================
  aplicarFiltros(): void {

    let resultado =
      [
        ...this.medicamentosInventario
      ];

    const texto =
      this.textoBusqueda
        .trim()
        .toLowerCase();

    // ==========================================================
    // BUSCAR TEXTO
    // ==========================================================
    if (texto) {

      resultado =
        resultado.filter(
          medicamento => {

            const nombre =
              medicamento.nombre
                .toLowerCase();

            const principio =
              medicamento.principioActivo
                .toLowerCase();

            const concentracion =
              medicamento.concentracion
                .toLowerCase();

            const presentacion =
              medicamento.presentacion
                .toLowerCase();

            return (
              nombre.includes(texto) ||
              principio.includes(texto) ||
              concentracion.includes(texto) ||
              presentacion.includes(texto)
            );
          }
        );
    }

    // ==========================================================
    // FILTRO STOCK BAJO
    // ==========================================================
    if (
      this.categoriaSeleccionada ===
      'stock-bajo'
    ) {

      resultado =
        resultado.filter(
          medicamento =>
            medicamento.stockBajo
        );
    }

    this.medicamentosFiltrados =
      resultado;
  }

  // ============================================================
  // CALCULAR DÍAS PARA VENCER
  // ============================================================
  calcularDiasParaVencer(
    fecha: string | null
  ): number | null {

    if (!fecha) {
      return null;
    }

    const fechaVencimiento =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaVencimiento.getTime()
      )
    ) {

      return null;
    }

    const hoy =
      new Date();

    hoy.setHours(
      0,
      0,
      0,
      0
    );

    fechaVencimiento.setHours(
      0,
      0,
      0,
      0
    );

    const diferencia =
      fechaVencimiento.getTime() -
      hoy.getTime();

    return Math.ceil(
      diferencia /
      (1000 * 60 * 60 * 24)
    );
  }

  // ============================================================
  // VERIFICAR VENCIDO
  // ============================================================
  private estaRegistroVencido(
    fecha:
      string |
      null |
      undefined
  ): boolean {

    const dias =
      this.calcularDiasParaVencer(
        fecha || null
      );

    return (
      dias !== null &&
      dias < 0
    );
  }

  // ============================================================
  // VERIFICAR POR VENCER
  // ============================================================
  private estaRegistroPorVencer(
    fecha:
      string |
      null |
      undefined
  ): boolean {

    const dias =
      this.calcularDiasParaVencer(
        fecha || null
      );

    return (
      dias !== null &&
      dias >= 0 &&
      dias <= 30
    );
  }

  // ============================================================
  // TEXTO DE VENCIMIENTO
  // ============================================================
  obtenerTextoVencimiento(
    medicamento: MedicamentoInventario
  ): string {

    if (
      medicamento.estaVencido
    ) {

      return 'Vencido';
    }

    if (
      medicamento.diasParaVencer !== null &&
      medicamento.diasParaVencer === 0
    ) {

      return 'Vence hoy';
    }

    if (
      medicamento.diasParaVencer !== null &&
      medicamento.diasParaVencer === 1
    ) {

      return 'Vence mañana';
    }

    if (
      medicamento.diasParaVencer !== null
    ) {

      return `Vence en ${medicamento.diasParaVencer} días`;
    }

    return '';
  }

  // ============================================================
  // CLASE DE VENCIMIENTO
  // ============================================================
  obtenerClaseVencimiento(
    medicamento: MedicamentoInventario
  ): string {

    if (
      medicamento.estaVencido
    ) {

      return 'vencido';
    }

    if (
      medicamento.estaPorVencer
    ) {

      return 'por-vencer';
    }

    return '';
  }

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================
  formatearFecha(
    fecha: string | null
  ): string {

    if (!fecha) {
      return 'No disponible';
    }

    const fechaFormateada =
      new Date(fecha);

    if (
      Number.isNaN(
        fechaFormateada.getTime()
      )
    ) {

      return 'No disponible';
    }

    return fechaFormateada.toLocaleDateString(
      'es-CO',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }
    );
  }

  // ============================================================
  // VER DETALLES
  // ============================================================
  verDetalles(medicamento: MedicamentoInventario): void {

  const cantidadRegistros = medicamento.cantidadRegistros;

  const textoRegistros =
    cantidadRegistros === 1
      ? '1 registro'
      : `${cantidadRegistros} registros`;

  mostrarAlerta({
    tono: 'azul',
    icono: 'question',
    iconoSvg: svgIcono('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    titulo: medicamento.nombre,
    html: `
      <div class="text-left text-[1.05rem] leading-relaxed text-slate-700 space-y-1.5">
        <p><strong class="font-bold">Principio activo:</strong> ${escaparHtml(medicamento.principioActivo)}</p>
        <p><strong class="font-bold">Concentración:</strong> ${escaparHtml(medicamento.concentracion)}</p>
        <p><strong class="font-bold">Presentación:</strong> ${escaparHtml(medicamento.presentacion)}</p>
        <p><strong class="font-bold">Cantidad total:</strong> ${medicamento.cantidad} ${escaparHtml(medicamento.unidadMedida)}</p>
        <p><strong class="font-bold">Registros de inventario:</strong> ${textoRegistros}</p>
        <p><strong class="font-bold">Estado:</strong> ${medicamento.estado ? 'Activo' : 'Inactivo'}</p>
      </div>
    `,
    confirmar: 'Cerrar'
  });
}

  // ============================================================
  // EXTRAER RESULTADOS
  // ============================================================
  private extraerResultados<T>(
    respuesta:
      RespuestaPaginada<T> |
      T[]
  ): T[] {

    if (
      Array.isArray(respuesta)
    ) {

      return respuesta;
    }

    return (
      respuesta?.results ||
      []
    );
  }

  // ============================================================
  // CONVERTIR ESTADO
  // ============================================================
  private convertirEstado(
    estado:
      boolean |
      string |
      undefined
  ): boolean {

    if (
      typeof estado ===
      'boolean'
    ) {

      return estado;
    }

    if (
      typeof estado ===
      'string'
    ) {

      return (
        estado.toLowerCase() ===
          'activo' ||

        estado.toLowerCase() ===
          'true' ||

        estado === '1'
      );
    }

    return true;
  }

  // ============================================================
  // CERRAR PANEL
  // ============================================================
  cerrarPanel(): void {

    this.cerrar.emit();

    this.restaurarScroll();
  }

  // ============================================================
  // TECLA ESCAPE
  // ============================================================
  manejarTeclaEscape = (
    evento: KeyboardEvent
  ): void => {

    if (
      evento.key === 'Escape' &&
      this.estaAbierto
    ) {

      this.cerrarPanel();
    }
  };

  // ============================================================
  // BLOQUEAR SCROLL
  // ============================================================
  private bloquearScroll(): void {

    document.body.style.overflow =
      'hidden';

    document.addEventListener(
      'keydown',
      this.manejarTeclaEscape
    );
  }

  // ============================================================
  // RESTAURAR SCROLL
  // ============================================================
  private restaurarScroll(): void {

    document.body.style.overflow =
      '';

    document.removeEventListener(
      'keydown',
      this.manejarTeclaEscape
    );
  }
}


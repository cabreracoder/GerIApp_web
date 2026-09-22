import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

// ============================================================
// INTERFACES
// ============================================================

interface RespuestaPaginada<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface Paciente {
  id_paciente: number;
  nombre: string;
  apellido: string;
  eps: string;
  sede: string;
  habitacion: number;
  cama: number;
  numero_documento: string;
  estado: boolean;
}

interface Medicamento {
  id_medicamentos: number;
  nombre: string;
  descripcion?: string | null;
  principio_activo?: string | null;
  concentracion?: string | null;
  presentacion?: string | null;
  estado?: boolean;
  unidad_medida?: string | null;
}

interface ElementoPaciente {
  id_elemento: number;
  id_paciente:
    number |
    { id_paciente?: number } |
    null;

  id_medicamentos:
    number |
    { id_medicamentos?: number } |
    null;

  id_insumo?:
    number |
    { id_insumo?: number } |
    null;

  cantidad: number;
  fecha_ingreso: string;
  fecha_vencimiento?: string | null;
  observaciones?: string | null;
  estado: boolean;
}

interface MedicamentoInventario {
  id: number;
  idElemento: number;
  nombre: string;
  principioActivo: string;
  concentracion: string;
  presentacion: string;
  cantidad: number;
  unidad: string;
  fechaIngreso: string;
  fechaVencimiento: string | null;
  observaciones: string;
  estado: boolean;
  diasParaVencer: number | null;
  estaPorVencer: boolean;
  estaVencido: boolean;
  stockBajo: boolean;
}

// ============================================================
// CONFIGURACIÓN DEL COMPONENTE
// ============================================================

@Component({
  selector: 'app-inventario-paciente',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './inventario-paciente.html',
  styleUrl: './inventario-paciente.css'
})
export class InventarioPaciente
  implements OnChanges, OnDestroy {

  // ============================================================
  // CONFIGURACIÓN DE LA API
  // ============================================================

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  // ============================================================
  // ENTRADAS Y SALIDAS
  // ============================================================

  @Input()
  idPaciente: number = 0;

  @Input()
  paciente: Paciente | null = null;

  @Input()
  estaAbierto: boolean = false;

  @Output()
  cerrar = new EventEmitter<void>();

  // ============================================================
  // VARIABLES DEL INVENTARIO
  // ============================================================

  medicamentos: Medicamento[] = [];

  elementosPaciente: ElementoPaciente[] = [];

  medicamentosInventario: MedicamentoInventario[] = [];

  medicamentosFiltrados: MedicamentoInventario[] = [];

  cargando: boolean = false;

  textoBusqueda: string = '';

  categoriaSeleccionada:
    'todos' |
    'stock-bajo' |
    'por-vencer' |
    'vencidos' = 'todos';

  categorias = [
    {
      label: 'Todos',
      value: 'todos' as const
    },
    {
      label: 'Stock bajo',
      value: 'stock-bajo' as const
    },
    {
      label: 'Por vencer',
      value: 'por-vencer' as const
    },
    {
      label: 'Vencidos',
      value: 'vencidos' as const
    }
  ];

  // ============================================================
  // EVENTO PARA CERRAR CON ESCAPE
  // ============================================================

  private readonly escucharEscape =
    (evento: KeyboardEvent): void => {

      if (
        evento.key === 'Escape' &&
        this.estaAbierto
      ) {

        this.cerrarPanel();

      }

    };

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private http: HttpClient
  ) {

    if (typeof window !== 'undefined') {

      window.addEventListener(
        'keydown',
        this.escucharEscape
      );

    }

  }

  // ============================================================
  // CAMBIOS EN LOS INPUT
  // ============================================================

  ngOnChanges(
    cambios: SimpleChanges
  ): void {

    if (cambios['estaAbierto']) {

      if (this.estaAbierto) {

        this.bloquearScroll();

        if (this.idPaciente > 0) {

          this.cargarInventario();

        }

      } else {

        this.restaurarScroll();

      }

    }

    if (
      cambios['idPaciente'] &&
      this.idPaciente > 0 &&
      this.estaAbierto
    ) {

      this.cargarInventario();

    }

  }

  // ============================================================
  // DESTRUCCIÓN DEL COMPONENTE
  // ============================================================

  ngOnDestroy(): void {

    if (typeof window !== 'undefined') {

      window.removeEventListener(
        'keydown',
        this.escucharEscape
      );

    }

    this.restaurarScroll();

  }

  // ============================================================
  // CARGAR INVENTARIO
  // ============================================================

  cargarInventario(): void {

    if (
      !this.idPaciente ||
      this.idPaciente <= 0
    ) {

      console.error(
        'ID de paciente inválido.'
      );

      return;

    }

    this.cargando = true;

    this.http.get<
      ElementoPaciente[] |
      RespuestaPaginada<ElementoPaciente>
    >(
      `${this.apiUrl}/elementos_paciente/`
    ).subscribe({

      next: (respuesta) => {

        const elementos =
          this.obtenerResultados(respuesta);

        this.elementosPaciente =
          elementos.filter(
            elemento => {

              const idPacienteElemento =
                this.obtenerIdPaciente(
                  elemento.id_paciente
                );

              return Number(
                idPacienteElemento
              ) === Number(
                this.idPaciente
              );

            }
          );

        this.cargarMedicamentos();

      },

      error: (error) => {

        console.error(
          'Error al cargar elementos del paciente:',
          error
        );

        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            'No fue posible cargar el inventario del paciente.'
        });

      }

    });

  }

  // ============================================================
  // CARGAR MEDICAMENTOS
  // ============================================================

  private cargarMedicamentos(): void {

    this.http.get<
      Medicamento[] |
      RespuestaPaginada<Medicamento>
    >(
      `${this.apiUrl}/medicamentos/`
    ).subscribe({

      next: (respuesta) => {

        this.medicamentos =
          this.obtenerResultados(respuesta);

        this.construirInventario();

        this.cargando = false;

      },

      error: (error) => {

        console.error(
          'Error al cargar medicamentos:',
          error
        );

        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            'No fue posible cargar el catálogo de medicamentos.'
        });

      }

    });

  }

  // ============================================================
  // CONSTRUIR INVENTARIO
  // ============================================================

  private construirInventario(): void {

    this.medicamentosInventario =
      this.elementosPaciente

        .filter(elemento => {

          return elemento.id_medicamentos !== null &&
                 elemento.id_medicamentos !== undefined;

        })

        .map(elemento => {

          const idMedicamento =
            this.obtenerIdMedicamento(
              elemento.id_medicamentos
            );

          const medicamento =
            this.medicamentos.find(
              item =>
                Number(
                  item.id_medicamentos
                ) === Number(
                  idMedicamento
                )
            );

          const cantidad =
            Number(elemento.cantidad) || 0;

          const fechaVencimiento =
            elemento.fecha_vencimiento || null;

          const diasParaVencer =
            this.calcularDiasParaVencer(
              fechaVencimiento
            );

          const estaVencido =
            diasParaVencer !== null &&
            diasParaVencer < 0;

          const estaPorVencer =
            diasParaVencer !== null &&
            diasParaVencer >= 0 &&
            diasParaVencer <= 30;

          const stockMinimo = 5;

          const stockBajo =
            cantidad < stockMinimo;

          return {

            id:
              Number(idMedicamento) || 0,

            idElemento:
              elemento.id_elemento,

            nombre:
              medicamento?.nombre ||
              'Medicamento no encontrado',

            principioActivo:
              medicamento?.principio_activo ||
              'No registrado',

            concentracion:
              medicamento?.concentracion ||
              '',

            presentacion:
              medicamento?.presentacion ||
              'No registrada',

            cantidad:
              cantidad,

            unidad:
              medicamento?.unidad_medida ||
              medicamento?.presentacion ||
              'unidades',

            fechaIngreso:
              elemento.fecha_ingreso || '',

            fechaVencimiento:
              fechaVencimiento,

            observaciones:
              elemento.observaciones || '',

            estado:
              elemento.estado ?? true,

            diasParaVencer:
              diasParaVencer,

            estaPorVencer:
              estaPorVencer,

            estaVencido:
              estaVencido,

            stockBajo:
              stockBajo

          };

        });

    this.aplicarFiltros();

  }

  // ============================================================
  // CAMBIAR BÚSQUEDA
  // ============================================================

  cambiarBusqueda(evento: Event): void {

    const entrada =
      evento.target as HTMLInputElement;

    this.textoBusqueda =
      entrada.value;

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
      'stock-bajo' |
      'por-vencer' |
      'vencidos'
  ): void {

    this.categoriaSeleccionada =
      categoria;

    this.aplicarFiltros();

  }

  // ============================================================
  // APLICAR FILTROS
  // ============================================================

  private aplicarFiltros(): void {

    const texto =
      this.textoBusqueda
        .trim()
        .toLowerCase();

    this.medicamentosFiltrados =
      this.medicamentosInventario.filter(
        medicamento => {

          const coincideBusqueda =
            !texto ||
            medicamento.nombre
              .toLowerCase()
              .includes(texto) ||
            medicamento.principioActivo
              .toLowerCase()
              .includes(texto) ||
            medicamento.concentracion
              .toLowerCase()
              .includes(texto) ||
            medicamento.presentacion
              .toLowerCase()
              .includes(texto);

          let coincideCategoria = true;

          if (
            this.categoriaSeleccionada ===
            'stock-bajo'
          ) {

            coincideCategoria =
              medicamento.stockBajo;

          }

          if (
            this.categoriaSeleccionada ===
            'por-vencer'
          ) {

            coincideCategoria =
              medicamento.estaPorVencer;

          }

          if (
            this.categoriaSeleccionada ===
            'vencidos'
          ) {

            coincideCategoria =
              medicamento.estaVencido;

          }

          return coincideBusqueda &&
                 coincideCategoria;

        }
      );

  }

  // ============================================================
  // CONTADORES
  // ============================================================

  get totalActivos(): number {

    return this.medicamentosInventario
      .filter(
        medicamento =>
          medicamento.estado
      )
      .length;

  }

  get totalStockBajo(): number {

    return this.medicamentosInventario
      .filter(
        medicamento =>
          medicamento.stockBajo &&
          medicamento.estado
      )
      .length;

  }

  get totalPorVencer(): number {

    return this.medicamentosInventario
      .filter(
        medicamento =>
          medicamento.estaPorVencer &&
          !medicamento.estaVencido
      )
      .length;

  }

  get totalVencidos(): number {

    return this.medicamentosInventario
      .filter(
        medicamento =>
          medicamento.estaVencido
      )
      .length;

  }

  // ============================================================
  // CALCULAR DÍAS PARA VENCER
  // ============================================================

  private calcularDiasParaVencer(
    fecha: string | null
  ): number | null {

    if (!fecha) {

      return null;

    }

    const fechaVencimiento =
      new Date(`${fecha}T00:00:00`);

    if (
      isNaN(
        fechaVencimiento.getTime()
      )
    ) {

      return null;

    }

    const hoy = new Date();

    hoy.setHours(
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
  // TEXTO DEL VENCIMIENTO
  // ============================================================

  obtenerTextoVencimiento(
    medicamento: MedicamentoInventario
  ): string {

    if (
      !medicamento.fechaVencimiento
    ) {

      return 'No registrada';

    }

    if (
      medicamento.estaVencido
    ) {

      return 'Vencido';

    }

    if (
      medicamento.diasParaVencer === 0
    ) {

      return 'Vence hoy';

    }

    if (
      medicamento.diasParaVencer !== null &&
      medicamento.diasParaVencer <= 30
    ) {

      return `Vence en ${medicamento.diasParaVencer} días`;

    }

    return this.formatearFecha(
      medicamento.fechaVencimiento
    );

  }

  // ============================================================
  // CLASE VISUAL DEL VENCIMIENTO
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
  // PORCENTAJE DEL STOCK
  // ============================================================

  calcularPorcentajeStock(
    cantidad: number
  ): number {

    const maximoVisual = 30;

    if (cantidad <= 0) {

      return 0;

    }

    return Math.min(
      100,
      Math.round(
        (cantidad / maximoVisual) * 100
      )
    );

  }

  // ============================================================
  // CLASE VISUAL DEL STOCK
  // ============================================================

  obtenerClaseStock(
    medicamento: MedicamentoInventario
  ): string {

    if (
      medicamento.stockBajo
    ) {

      return 'stock-bajo';

    }

    return 'stock-normal';

  }

  // ============================================================
  // FORMATEAR FECHAS
  // ============================================================

  formatearFecha(
    fecha: string | null
  ): string {

    if (!fecha) {

      return 'No registrada';

    }

    const fechaObj =
      new Date(fecha);

    if (
      isNaN(
        fechaObj.getTime()
      )
    ) {

      return fecha;

    }

    return fechaObj.toLocaleDateString(
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

  verDetalles(
    medicamento: MedicamentoInventario
  ): void {

    Swal.fire({

      icon: 'info',

      title:
        medicamento.nombre,

      html: `
        <div style="text-align:left">

          <p>
            <strong>Principio activo:</strong>
            ${medicamento.principioActivo}
          </p>

          <p>
            <strong>Concentración:</strong>
            ${medicamento.concentracion || 'No registrada'}
          </p>

          <p>
            <strong>Presentación:</strong>
            ${medicamento.presentacion}
          </p>

          <p>
            <strong>Cantidad:</strong>
            ${medicamento.cantidad}
            ${medicamento.unidad}
          </p>

          <p>
            <strong>Fecha de ingreso:</strong>
            ${this.formatearFecha(
              medicamento.fechaIngreso
            )}
          </p>

          <p>
            <strong>Vencimiento:</strong>
            ${this.formatearFecha(
              medicamento.fechaVencimiento
            )}
          </p>

          <p>
            <strong>Estado:</strong>
            ${
              medicamento.estado
                ? 'Activo'
                : 'Inactivo'
            }
          </p>

          ${
            medicamento.observaciones
              ? `
                <p>
                  <strong>Observaciones:</strong>
                  ${medicamento.observaciones}
                </p>
              `
              : ''
          }

        </div>
      `,

      confirmButtonText:
        'Cerrar'

    });

  }

  // ============================================================
  // CERRAR PANEL
  // ============================================================

  cerrarPanel(): void {

    this.restaurarScroll();

    this.cerrar.emit();

  }

  // ============================================================
  // BLOQUEAR SCROLL
  // ============================================================

  private bloquearScroll(): void {

    if (
      typeof document !== 'undefined'
    ) {

      document.body.style.overflow =
        'hidden';

    }

  }

  // ============================================================
  // RESTAURAR SCROLL
  // ============================================================

  private restaurarScroll(): void {

    if (
      typeof document !== 'undefined'
    ) {

      document.body.style.overflow =
        '';

    }

  }

  // ============================================================
  // OBTENER RESULTADOS
  // ============================================================

  private obtenerResultados<T>(
    respuesta:
      T[] |
      RespuestaPaginada<T>
  ): T[] {

    if (
      Array.isArray(respuesta)
    ) {

      return respuesta;

    }

    if (
      respuesta &&
      Array.isArray(
        respuesta.results
      )
    ) {

      return respuesta.results;

    }

    return [];

  }

  // ============================================================
  // OBTENER ID DEL PACIENTE
  // ============================================================

  private obtenerIdPaciente(
    relacion:
      number |
      { id_paciente?: number } |
      null
  ): number | null {

    if (
      relacion === null
    ) {

      return null;

    }

    if (
      typeof relacion === 'number'
    ) {

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
  // OBTENER ID DEL MEDICAMENTO
  // ============================================================

  private obtenerIdMedicamento(
    relacion:
      number |
      { id_medicamentos?: number } |
      null
  ): number | null {

    if (
      relacion === null
    ) {

      return null;

    }

    if (
      typeof relacion === 'number'
    ) {

      return relacion;

    }

    if (
      typeof relacion === 'object' &&
      relacion.id_medicamentos !== undefined
    ) {

      return Number(
        relacion.id_medicamentos
      );

    }

    return null;

  }

}
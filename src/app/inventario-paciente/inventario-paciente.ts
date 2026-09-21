import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

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
  id_paciente: number | { id_paciente?: number } | null;
  id_medicamentos: number | { id_medicamentos?: number } | null;
  id_insumo?: number | { id_insumo?: number } | null;
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

@Component({
  selector: 'app-inventario-paciente',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './inventario-paciente.html',
  styleUrl: './inventario-paciente.css'
})
export class InventarioPaciente implements OnChanges, OnDestroy {

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  @Input() idPaciente: number = 0;

  @Input() paciente: Paciente | null = null;

  @Input() isOpen: boolean = false;

  @Output() cerrar = new EventEmitter<void>();

  medicamentos: Medicamento[] = [];

  elementosPaciente: ElementoPaciente[] = [];

  medicamentosInventario: MedicamentoInventario[] = [];

  medicamentosFiltrados: MedicamentoInventario[] = [];

  cargando = false;

  searchQuery = '';

  selectedCategory:
    'todos' |
    'stock-bajo' |
    'por-vencer' |
    'vencidos' = 'todos';

  categorias = [
    {
      label: 'Todos',
      value: 'todos'
    },
    {
      label: 'Stock bajo',
      value: 'stock-bajo'
    },
    {
      label: 'Por vencer',
      value: 'por-vencer'
    },
    {
      label: 'Vencidos',
      value: 'vencidos'
    }
  ];

  private readonly listenerEscape = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen) {
      this.closeDrawer();
    }
  };

  constructor(
    private http: HttpClient
  ) {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.listenerEscape);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.bloquearScroll();
    }

    if (changes['isOpen'] && !this.isOpen) {
      this.restaurarScroll();
    }

    if (
      changes['idPaciente'] &&
      this.idPaciente > 0 &&
      this.isOpen
    ) {
      this.cargarInventario();
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.listenerEscape);
    }

    this.restaurarScroll();
  }

  /**
   * Carga los medicamentos y los elementos
   * registrados para el paciente actual.
   */
  cargarInventario(): void {
    if (!this.idPaciente || this.idPaciente <= 0) {
      console.error('ID de paciente inválido.');
      return;
    }

    this.cargando = true;

    this.http.get<
      ElementoPaciente[] |
      RespuestaPaginada<ElementoPaciente>
    >(`${this.apiUrl}/elementos_paciente/`).subscribe({
      next: (respuesta) => {

        const elementos = this.obtenerResultados(respuesta);

        this.elementosPaciente = elementos.filter(elemento => {

          const idPacienteElemento =
            this.obtenerIdPaciente(elemento.id_paciente);

          return Number(idPacienteElemento) === Number(this.idPaciente);
        });

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
          text: 'No fue posible cargar el inventario del paciente.'
        });
      }
    });
  }

  /**
   * Carga el catálogo de medicamentos para
   * obtener los nombres y características.
   */
  private cargarMedicamentos(): void {

    this.http.get<
      Medicamento[] |
      RespuestaPaginada<Medicamento>
    >(`${this.apiUrl}/medicamentos/`).subscribe({

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
          text: 'No fue posible cargar el catálogo de medicamentos.'
        });
      }
    });
  }

  /**
   * Construye la información que mostrará
   * el drawer usando elementos_paciente + medicamentos.
   */
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
            this.medicamentos.find(item =>
              Number(item.id_medicamentos) ===
              Number(idMedicamento)
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

          /*
           * El backend no tiene un campo minRequired.
           * Para el inventario visual utilizamos 5 unidades
           * como referencia de stock bajo.
           *
           * Si posteriormente quieres que el mínimo sea
           * configurable desde la base de datos, lo podemos
           * cambiar.
           */
          const stockMinimo = 5;

          const stockBajo =
            cantidad < stockMinimo;

          return {
            id: Number(idMedicamento) || 0,
            idElemento: elemento.id_elemento,
            nombre: medicamento?.nombre || 'Medicamento no encontrado',
            principioActivo:
              medicamento?.principio_activo || 'No registrado',
            concentracion:
              medicamento?.concentracion || '',
            presentacion:
              medicamento?.presentacion || 'No registrada',
            cantidad: cantidad,
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

  /**
   * Búsqueda por nombre, principio activo,
   * concentración o presentación.
   */
  onSearchChange(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.searchQuery =
      input.value;

    this.aplicarFiltros();
  }

  /**
   * Cambia el filtro de categoría.
   */
  selectCategory(
    categoria:
      'todos' |
      'stock-bajo' |
      'por-vencer' |
      'vencidos'
  ): void {

    this.selectedCategory =
      categoria;

    this.aplicarFiltros();
  }

  /**
   * Aplica búsqueda + filtro.
   */
  private aplicarFiltros(): void {

    const texto =
      this.searchQuery
        .trim()
        .toLowerCase();

    this.medicamentosFiltrados =
      this.medicamentosInventario.filter(medicamento => {

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

        if (this.selectedCategory === 'stock-bajo') {
          coincideCategoria =
            medicamento.stockBajo;
        }

        if (this.selectedCategory === 'por-vencer') {
          coincideCategoria =
            medicamento.estaPorVencer;
        }

        if (this.selectedCategory === 'vencidos') {
          coincideCategoria =
            medicamento.estaVencido;
        }

        return coincideBusqueda &&
               coincideCategoria;
      });
  }

  /**
   * Total de medicamentos activos.
   */
  get totalActivos(): number {

    return this.medicamentosInventario
      .filter(medicamento =>
        medicamento.estado
      ).length;
  }

  /**
   * Cantidad de medicamentos con stock bajo.
   */
  get totalStockBajo(): number {

    return this.medicamentosInventario
      .filter(medicamento =>
        medicamento.stockBajo &&
        medicamento.estado
      ).length;
  }

  /**
   * Cantidad de medicamentos próximos a vencer.
   */
  get totalPorVencer(): number {

    return this.medicamentosInventario
      .filter(medicamento =>
        medicamento.estaPorVencer &&
        !medicamento.estaVencido
      ).length;
  }

  /**
   * Cantidad de medicamentos vencidos.
   */
  get totalVencidos(): number {

    return this.medicamentosInventario
      .filter(medicamento =>
        medicamento.estaVencido
      ).length;
  }

  /**
   * Calcula los días restantes para el vencimiento.
   */
  private calcularDiasParaVencer(
    fecha: string | null
  ): number | null {

    if (!fecha) {
      return null;
    }

    const fechaVencimiento =
      new Date(`${fecha}T00:00:00`);

    if (isNaN(fechaVencimiento.getTime())) {
      return null;
    }

    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    const diferencia =
      fechaVencimiento.getTime() -
      hoy.getTime();

    return Math.ceil(
      diferencia /
      (1000 * 60 * 60 * 24)
    );
  }

  /**
   * Texto para mostrar el vencimiento.
   */
  obtenerTextoVencimiento(
    medicamento: MedicamentoInventario
  ): string {

    if (!medicamento.fechaVencimiento) {
      return 'No registrada';
    }

    if (medicamento.estaVencido) {
      return 'Vencido';
    }

    if (medicamento.diasParaVencer === 0) {
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

  /**
   * Devuelve una clase visual para el vencimiento.
   */
  obtenerClaseVencimiento(
    medicamento: MedicamentoInventario
  ): string {

    if (medicamento.estaVencido) {
      return 'vencido';
    }

    if (medicamento.estaPorVencer) {
      return 'por-vencer';
    }

    return '';
  }

  /**
   * Devuelve el porcentaje visual de stock.
   */
  calcularPorcentajeStock(
    cantidad: number
  ): number {

    /*
     * 30 unidades se utilizan únicamente
     * como referencia visual.
     */
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

  /**
   * Clase visual de la barra de stock.
   */
  obtenerClaseStock(
    medicamento: MedicamentoInventario
  ): string {

    if (medicamento.stockBajo) {
      return 'stock-bajo';
    }

    return 'stock-normal';
  }

  /**
   * Formatea fechas para mostrarlas
   * de forma amigable.
   */
  formatearFecha(
    fecha: string | null
  ): string {

    if (!fecha) {
      return 'No registrada';
    }

    const fechaObj =
      new Date(fecha);

    if (isNaN(fechaObj.getTime())) {
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

  /**
   * Muestra información detallada.
   */
  viewDetails(
    medicamento: MedicamentoInventario
  ): void {

    Swal.fire({
      icon: 'info',
      title: medicamento.nombre,
      html: `
        <div style="text-align:left">
          <p><strong>Principio activo:</strong> ${medicamento.principioActivo}</p>
          <p><strong>Concentración:</strong> ${medicamento.concentracion || 'No registrada'}</p>
          <p><strong>Presentación:</strong> ${medicamento.presentacion}</p>
          <p><strong>Cantidad:</strong> ${medicamento.cantidad} ${medicamento.unidad}</p>
          <p><strong>Fecha de ingreso:</strong> ${this.formatearFecha(medicamento.fechaIngreso)}</p>
          <p><strong>Vencimiento:</strong> ${this.formatearFecha(medicamento.fechaVencimiento)}</p>
          <p><strong>Estado:</strong> ${medicamento.estado ? 'Activo' : 'Inactivo'}</p>
          ${
            medicamento.observaciones
              ? `<p><strong>Observaciones:</strong> ${medicamento.observaciones}</p>`
              : ''
          }
        </div>
      `,
      confirmButtonText: 'Cerrar'
    });
  }

  /**
   * Solicitud visual de reposición.
   *
   * Por ahora no modifica la base de datos.
   * Posteriormente podemos conectarlo con
   * el módulo de notificaciones.
   */
  requestRefill(
    medicamento: MedicamentoInventario
  ): void {

    Swal.fire({
      icon: 'warning',
      title: 'Solicitud de reposición',
      text:
        `Se solicitará la reposición de ${medicamento.nombre}.`,
      showCancelButton: true,
      confirmButtonText: 'Solicitar',
      cancelButtonText: 'Cancelar'
    }).then(resultado => {

      if (!resultado.isConfirmed) {
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Solicitud registrada',
        text:
          `La solicitud de reposición de ${medicamento.nombre} fue registrada.`,
        timer: 1800,
        showConfirmButton: false
      });
    });
  }

  /**
   * Botón de registrar nuevo medicamento.
   *
   * Cerramos el inventario para reutilizar
   * el formulario que ya tienes en ElementosPaciente.
   */
  onRegisterNewMedicine(): void {
    this.closeDrawer();

    /*
     * ElementosPaciente puede detectar que el
     * drawer se cerró y abrir su formulario.
     */
  }

  /**
   * Notificación de reposición.
   *
   * Se deja preparada para conectarla
   * posteriormente con /notificaciones/.
   */
  onNotifyTutor(): void {

    Swal.fire({
      icon: 'info',
      title: 'Notificación',
      text:
        'La funcionalidad de notificación se conectará con el módulo de Notificaciones de GerIApp.',
      confirmButtonText: 'Entendido'
    });
  }

  /**
   * Cierra el drawer.
   */
  closeDrawer(): void {

    this.restaurarScroll();

    this.cerrar.emit();
  }

  private bloquearScroll(): void {

    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  private restaurarScroll(): void {

    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  /**
   * Obtiene resultados independientemente
   * de si DRF devuelve array o paginación.
   */
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

  private obtenerIdPaciente(
    relacion:
      number |
      { id_paciente?: number } |
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

  private obtenerIdMedicamento(
    relacion:
      number |
      { id_medicamentos?: number } |
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
      relacion.id_medicamentos !== undefined
    ) {
      return Number(
        relacion.id_medicamentos
      );
    }

    return null;
  }
}
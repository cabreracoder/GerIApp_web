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
  verDetalles(
    medicamento: MedicamentoInventario
  ): void {

    const cantidadRegistros =
      medicamento.cantidadRegistros;

    const textoRegistros =
      cantidadRegistros === 1
        ? '1 registro'
        : `${cantidadRegistros} registros`;

    Swal.fire({

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
            ${medicamento.concentracion}
          </p>

          <p>
            <strong>Presentación:</strong>
            ${medicamento.presentacion}
          </p>

          <p>
            <strong>Cantidad total:</strong>
            ${medicamento.cantidad}
            ${medicamento.unidadMedida}
          </p>

          <p>
            <strong>Registros de inventario:</strong>
            ${textoRegistros}
          </p>

          <p>
            <strong>Estado:</strong>
            ${
              medicamento.estado
                ? 'Activo'
                : 'Inactivo'
            }
          </p>

        </div>
      `,

      confirmButtonText:
        'Cerrar',

      width:
        '500px'
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


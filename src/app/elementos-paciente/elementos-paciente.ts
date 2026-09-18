import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-elementos-paciente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
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
  // SECCIÓN ACTUAL
  // ============================================================

  seccionActual:
    'elementos' |
    'cuidados' |
    'recomendaciones' |
    'historia' = 'elementos';

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

  // ============================================================
  // CATÁLOGOS
  // ============================================================

  medicamentos: Medicamento[] = [];

  insumos: Insumo[] = [];

  tiposInsumo: TipoInsumo[] = [];

  insumosFiltrados: Insumo[] = [];

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

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'No fue posible cargar la información del paciente.'
          });

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

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'No fue posible cargar los medicamentos.'
          });

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

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'No fue posible cargar los tipos de insumo.'
          });

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

          // Si ya se seleccionó un tipo,
          // aplicamos nuevamente el filtro.
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

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'No fue posible cargar los insumos.'
          });

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

    // Cada vez que cambia el tipo,
    // se debe volver a seleccionar el insumo.
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

          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              'No fue posible cargar los elementos del paciente.'
          });

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
  // CAMBIAR SECCIÓN
  // ============================================================

  cambiarSeccion(
    seccion:
      'elementos' |
      'cuidados' |
      'recomendaciones' |
      'historia'
  ): void {

    this.seccionActual =
      seccion;
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

    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      id_tipo_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaActual(),

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

    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      id_tipo_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaActual(),

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
        this.obtenerFechaActual(),

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

  obtenerNombreElemento(elemento: ElementoPaciente): string {

  // ----------------------------------------------------------
  // SI ES MEDICAMENTO
  // ----------------------------------------------------------
  if (
    elemento.id_medicamentos !== null &&
    elemento.id_medicamentos !== undefined
  ) {

    // El backend puede devolver solamente el ID
    if (typeof elemento.id_medicamentos === 'number') {

      const medicamento = this.medicamentos.find(
        item =>
          Number(item.id_medicamentos) ===
          Number(elemento.id_medicamentos)
      );

      return medicamento
        ? medicamento.nombre
        : 'Medicamento no encontrado';
    }

    // El backend puede devolver el objeto completo
    if (
      typeof elemento.id_medicamentos === 'object' &&
      elemento.id_medicamentos !== null
    ) {

      const idMedicamento =
        elemento.id_medicamentos.id_medicamentos;

      const medicamento = this.medicamentos.find(
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

    if (typeof elemento.id_insumo === 'number') {

      const insumo = this.insumos.find(
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

      const insumo = this.insumos.find(
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
  // GUARDAR ELEMENTO
  // ============================================================

  guardarElemento(): void {

    if (
      !this.idPaciente ||
      this.idPaciente <= 0
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Paciente no identificado',
        text:
          'No fue posible identificar el paciente.'
      });

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

      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text:
          'La cantidad debe ser mayor que cero.'
      });

      return;
    }

    if (
      this.tipoElemento === 'medicamento' &&
      !this.formularioElemento.id_medicamentos
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Medicamento requerido',
        text:
          'Selecciona un medicamento.'
      });

      return;
    }

    if (
      this.tipoElemento === 'insumo' &&
      !this.formularioElemento.id_tipo_insumo
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Tipo de insumo requerido',
        text:
          'Selecciona un tipo de insumo.'
      });

      return;
    }

    if (
      this.tipoElemento === 'insumo' &&
      !this.formularioElemento.id_insumo
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Insumo requerido',
        text:
          'Selecciona un insumo.'
      });

      return;
    }

    const datos = {

      cantidad:
        cantidad,

      fecha_ingreso:
        this.formularioElemento.fecha_ingreso ||
        this.obtenerFechaActual(),

      // Este campo pertenece a elementos_paciente.
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

    console.log(
      '======================================'
    );

    console.log(
      'REGISTRO DE ELEMENTO'
    );

    console.log(
      'Paciente:',
      this.idPaciente
    );

    console.log(
      'Tipo:',
      this.tipoElemento
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

            Swal.fire({
              icon: 'success',
              title: 'Elemento actualizado',
              text:
                'El elemento se actualizó correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

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
    // CREAR
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

          const titulo =
            this.tipoElemento === 'medicamento'
              ? 'Medicamento registrado'
              : 'Insumo registrado';

          const texto =
            this.tipoElemento === 'medicamento'
              ? 'El medicamento se registró correctamente para el paciente.'
              : 'El insumo se registró correctamente para el paciente.';

          Swal.fire({
            icon: 'success',
            title: titulo,
            text: texto,
            timer: 1800,
            showConfirmButton: false
          });

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
        this.obtenerFechaActual(),

      fecha_vencimiento: '',

      observaciones: '',

      estado: true
    };

    this.insumosFiltrados = [];
  }

  // ============================================================
  // ELIMINAR ELEMENTO
  // ============================================================

  eliminarElemento(
    elemento: ElementoPaciente
  ): void {

    Swal.fire({

      icon: 'warning',

      title: '¿Eliminar elemento?',

      text:
        'Esta acción no se puede deshacer.',

      showCancelButton: true,

      confirmButtonText:
        'Sí, eliminar',

      cancelButtonText:
        'Cancelar'

    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.http
        .delete(
          `${this.apiUrl}/elementos_paciente/${elemento.id_elemento}/`
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Elemento eliminado',
              text:
                'El elemento fue eliminado correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

            this.cargarElementosPaciente();
          },

          error: (error) => {

            console.error(
              'Error al eliminar elemento:',
              error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible eliminar el elemento.'
            );
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

          this.cuidados = this.crearCuidadosVacios();

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

    id_paciente: this.idPaciente

  };

}

// ============================================================
// ABRIR FORMULARIO DE CUIDADOS
// ============================================================

abrirFormularioCuidados(): void {

  this.mostrarFormularioCuidados = true;

  this.cdr.detectChanges();

}

// ============================================================
// GUARDAR CUIDADOS DE ENFERMERÍA
// ============================================================

guardarCuidados(): void {

  if (!this.idPaciente || this.idPaciente <= 0) {

    Swal.fire({
      icon: 'warning',
      title: 'Paciente no identificado',
      text:
        'No fue posible identificar el paciente.'
    });

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
  // ACTUALIZAR REGISTRO EXISTENTE
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

          Swal.fire({
            icon: 'success',
            title: 'Cuidados actualizados',
            text:
              'Los cuidados de enfermería se actualizaron correctamente.',
            timer: 1800,
            showConfirmButton: false
          });

          this.mostrarFormularioCuidados = false;

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
  // CREAR NUEVO REGISTRO
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

        Swal.fire({
          icon: 'success',
          title: 'Cuidados registrados',
          text:
            'Los cuidados de enfermería se registraron correctamente.',
          timer: 1800,
          showConfirmButton: false
        });

        this.mostrarFormularioCuidados = false;

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

    Swal.fire({
      icon: 'info',
      title: 'Sin cuidados registrados',
      text:
        'Primero debe registrar los cuidados de enfermería.'
    });

    return;

  }

  this.mostrarFormularioCuidados = true;

  this.cdr.detectChanges();

}

// ============================================================
// ELIMINAR CUIDADOS
// ============================================================

eliminarCuidados(): void {

  this.eliminarCuidados();

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

    id_paciente: this.idPaciente

  };

}


// ============================================================
// ABRIR FORMULARIO DE RECOMENDACIONES
// ============================================================

abrirFormularioRecomendaciones(): void {

  // Si no existe un registro, aseguramos que el formulario
  // tenga la estructura correspondiente al paciente.
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

  // Validar que exista un paciente.
  if (
    !this.idPaciente ||
    this.idPaciente <= 0
  ) {

    Swal.fire({
      icon: 'warning',
      title: 'Paciente no identificado',
      text:
        'No fue posible identificar el paciente.'
    });

    return;

  }

  // Preparar los datos que se enviarán al backend.
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
  // ACTUALIZAR REGISTRO EXISTENTE
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

          Swal.fire({
            icon: 'success',
            title: 'Recomendaciones actualizadas',
            text:
              'La información se actualizó correctamente.',
            timer: 1800,
            showConfirmButton: false
          });

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
  // CREAR NUEVO REGISTRO
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

        Swal.fire({
          icon: 'success',
          title: 'Recomendaciones registradas',
          text:
            'Las recomendaciones se registraron correctamente.',
          timer: 1800,
          showConfirmButton: false
        });

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

    Swal.fire({
      icon: 'info',
      title: 'Sin recomendaciones',
      text:
        'Primero debe registrar las recomendaciones.'
    });

    return;

  }

  // El registro ya está cargado en this.recomendaciones,
  // por lo tanto solamente abrimos el formulario.
  this.mostrarFormularioRecomendaciones =
    true;

  this.cdr.detectChanges();

}


// ============================================================
// ELIMINAR RECOMENDACIONES
// ============================================================

eliminarRecomendaciones(): void {

  if (
    !this.recomendaciones.id_recomendacion ||
    this.recomendaciones.id_recomendacion <= 0
  ) {

    Swal.fire({
      icon: 'info',
      title: 'Sin recomendaciones',
      text:
        'No existen recomendaciones para eliminar.'
    });

    return;

  }

  Swal.fire({

    icon: 'warning',

    title:
      '¿Eliminar recomendaciones?',

    text:
      'Esta acción eliminará las recomendaciones registradas para este paciente.',

    showCancelButton: true,

    confirmButtonText:
      'Sí, eliminar',

    cancelButtonText:
      'Cancelar'

  }).then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http
      .delete(
        `${this.apiUrl}/recomendaciones/${this.recomendaciones.id_recomendacion}/`
      )
      .subscribe({

        next: () => {

          Swal.fire({
            icon: 'success',
            title: 'Recomendaciones eliminadas',
            text:
              'Las recomendaciones fueron eliminadas correctamente.',
            timer: 1800,
            showConfirmButton: false
          });

          // Dejar nuevamente el formulario vacío.
          this.recomendaciones =
            this.crearRecomendacionesVacias();

          this.mostrarFormularioRecomendaciones =
            false;

          this.cdr.detectChanges();

        },

        error: (error) => {

          console.error(
            'Error al eliminar recomendaciones:',
            error
          );

          console.error(
            'Respuesta del servidor:',
            error?.error
          );

          this.mostrarErrorApi(
            error,
            'No fue posible eliminar las recomendaciones.'
          );

        }

      });

  });

}

  // ============================================================
  // CARGAR HISTORIA CLÍNICA
  // ============================================================

  cargarHistoriaClinica(): void {

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
            historias.find(
              historia =>
                Number(
                  this.obtenerIdPaciente(
                    historia.id_paciente
                  )
                ) ===
                Number(this.idPaciente)
            );

          if (registro) {

            this.historiaClinica =
              registro;

          } else {

            this.historiaClinica = {

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

          this.cargandoHistoria =
            false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error al cargar historia clínica:',
            error
          );

          this.cargandoHistoria =
            false;
        }

      });

  }

  // ============================================================
  // GUARDAR HISTORIA CLÍNICA
  // ============================================================

  guardarHistoriaClinica(): void {

    const datos = {

      fecha_apertura:
        this.historiaClinica.fecha_apertura ||
        this.obtenerFechaActual(),

      antecedentes:
        this.historiaClinica.antecedentes ||
        '',

      alergias:
        this.historiaClinica.alergias ||
        '',

      observaciones:
        this.historiaClinica.observaciones ||
        '',

      estado:
        this.historiaClinica.estado,

      id_paciente:
        this.idPaciente
    };

    if (
      this.historiaClinica.id_historia_clinica > 0
    ) {

      this.http
        .patch(
          `${this.apiUrl}/historia_clinicas/${this.historiaClinica.id_historia_clinica}/`,
          datos
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Historia clínica actualizada',
              text:
                'La información se actualizó correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

            this.cargarHistoriaClinica();
          },

          error: (error) => {

            console.error(
              'Error al actualizar historia clínica:',
              error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible actualizar la historia clínica.'
            );
          }

        });

    } else {

      this.http
        .post(
          `${this.apiUrl}/historia_clinicas/`,
          datos
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Historia clínica registrada',
              text:
                'La historia clínica se registró correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

            this.cargarHistoriaClinica();
          },

          error: (error) => {

            console.error(
              'Error al registrar historia clínica:',
              error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible registrar la historia clínica.'
            );
          }

        });
    }

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

    Swal.fire({
      icon: 'info',
      title: 'Cuidado',
      text:
        'Los cuidados se administran como un único registro por paciente.'
    });

  }

  eliminarRecomendacion(index: number): void {

    Swal.fire({
      icon: 'info',
      title: 'Recomendaciones',
      text:
        'Las recomendaciones se administran como un único registro por paciente.'
    });

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

    Swal.fire({
      icon: 'success',
      title: 'Borrador guardado',
      text:
        'La información registrada actualmente está guardada en el sistema.',
      timer: 1800,
      showConfirmButton: false
    });

  }

  // ============================================================
  // FINALIZAR REGISTRO
  // ============================================================

  finalizarRegistro(): void {

    Swal.fire({

      icon: 'question',

      title: '¿Finalizar registro?',

      text:
        'Verifique que la información del paciente esté completa.',

      showCancelButton: true,

      confirmButtonText:
        'Sí, finalizar',

      cancelButtonText:
        'Cancelar'

    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Registro finalizado',
        text:
          'El registro del paciente fue finalizado correctamente.',
        timer: 2000,
        showConfirmButton: false
      });

    });

  }

  // ============================================================
  // FECHA ACTUAL
  // ============================================================

  private obtenerFechaActual(): string {

    const ahora =
      new Date();

    const año =
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

    return `${año}-${mes}-${dia}T${horas}:${minutos}`;
  }

  // ============================================================
  // CONVERTIR FECHA PARA INPUT
  // ============================================================

  private convertirFechaParaInput(
    fecha: string | null
  ): string {

    if (!fecha) {
      return '';
    }

    return fecha.substring(
      0,
      16
    );
  }

  // ============================================================
  // ERROR DEL API
  // ============================================================

  private mostrarErrorApi(
    error: any,
    mensajeDefault: string
  ): void {

    let mensaje =
      mensajeDefault;

    if (error?.error) {

      if (
        typeof error.error === 'string'
      ) {

        mensaje =
          error.error;

      } else if (
        typeof error.error === 'object'
      ) {

        const errores =
          Object.entries(
            error.error
          )
          .map(
            ([campo, valor]: [string, any]) => {

              const textoValor =
                Array.isArray(valor)
                  ? valor.join(', ')
                  : typeof valor === 'object'
                    ? JSON.stringify(valor)
                    : String(valor);

              return `${campo}: ${textoValor}`;
            }
          )
          .join('\n');

        if (errores) {
          mensaje = errores;
        }
      }
    }

    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: mensaje
    });
  }

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

  id_paciente:number | { id_paciente?: number;} |null;
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
  id_paciente: number | { id_paciente?: number } | null;

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
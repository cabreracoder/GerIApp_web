import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
//Esta importacion me permite hacerle varias peticiones al backend 
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { InventarioPaciente } from '../inventario-paciente/inventario-paciente';

// ============================================================
// ALERTAS GERIAPP - SWEETALERT2
// Mismo diseño institucional utilizado en el módulo Cuidadores.
// Utiliza las clases globales geri-swal-* y geri-alerta-*.
// ============================================================

type TonoAlerta = 'azul' | 'verde' | 'rojo';

function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function contenidoAlerta(titulo: string, mensaje: string, mostrarCheck = false): string {
  return `
    <div class="geri-alerta">
      <div class="geri-alerta__onda"></div>
      <div class="geri-alerta__contenido">
        <img src="/Logo-GerIApp.png" class="geri-alerta__logo" alt="GeriApp"
             onerror="this.style.display='none'">
        ${mostrarCheck ? '<div class="geri-alerta__check">✓</div>' : ''}
        <h2 class="geri-alerta__titulo">${escaparHtml(titulo)}</h2>
        <p class="geri-alerta__mensaje">${escaparHtml(mensaje)}</p>
      </div>
    </div>
  `;
}

function mostrarAlerta(config: {
  titulo: string;
  mensaje: string;
  tono: TonoAlerta;
  confirmar: string;
  cancelar?: string;
  mostrarCheck?: boolean;
}) {
  return Swal.fire({
    html: contenidoAlerta(config.titulo, config.mensaje, config.mostrarCheck),
    width: 520,
    padding: 0,
    showCancelButton: !!config.cancelar,
    showConfirmButton: true,
    confirmButtonText: config.confirmar,
    cancelButtonText: config.cancelar || 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: true,
    heightAuto: false,
    scrollbarPadding: false,
    backdrop: 'rgba(33, 37, 41, 0.48)',
    customClass: {
      popup: 'geri-swal-popup',
      htmlContainer: 'geri-swal-html',
      actions: 'geri-swal-actions',
      confirmButton: `geri-swal-btn geri-swal-btn--${config.tono}`,
      cancelButton: 'geri-swal-btn geri-swal-btn--cancelar'
    },
    // Los modales propios del componente usan z-index: 2000.
    // SweetAlert2 usa un z-index menor por defecto y queda detrás del formulario.
    // Se eleva el contenedor completo para que la alerta siempre quede visible.
    didOpen: () => {
      const contenedor = Swal.getContainer();
      contenedor?.style.setProperty('z-index', '3001', 'important');
    }
  });
}

// Confirmaciones de operaciones sobre los registros del paciente.
function alertaEliminar(nombre: string, entidad = 'registro') {
  return mostrarAlerta({
    titulo: `¿Eliminar ${entidad}?`,
    mensaje: `Se eliminará ${nombre}. Esta acción no se puede deshacer.`,
    tono: 'rojo', confirmar: 'Eliminar', cancelar: 'Cancelar'
  });
}

function alertaEditar(nombre: string, entidad = 'registro') {
  return mostrarAlerta({
    titulo: `¿Editar ${entidad}?`,
    mensaje: `Se abrirá el formulario para modificar ${nombre}.`,
    tono: 'azul', confirmar: 'Continuar', cancelar: 'Cancelar'
  });
}

function alertaDesactivar(nombre: string, entidad = 'registro') {
  return mostrarAlerta({
    titulo: `¿Desactivar ${entidad}?`,
    mensaje: `${nombre} dejará de estar activo hasta que se reactive.`,
    tono: 'rojo', confirmar: 'Sí, desactivar', cancelar: 'Cancelar'
  });
}

function alertaActivar(nombre: string, entidad = 'registro') {
  return mostrarAlerta({
    titulo: `¿Activar ${entidad}?`,
    mensaje: `${nombre} volverá a estar activo en el sistema.`,
    tono: 'azul', confirmar: 'Sí, activar', cancelar: 'Cancelar'
  });
}

// Confirmación previa al envío de formularios. Mantiene el mismo diseño GeriApp.
function alertaConfirmarFormulario(titulo: string, mensaje: string, confirmar = 'Continuar') {
  return mostrarAlerta({
    titulo,
    mensaje,
    tono: 'azul',
    confirmar,
    cancelar: 'Cancelar'
  });
}

// Respuestas del sistema: mismo panel, logo, tipografía y botones de Cuidadores.
function alertaExito(titulo: string, mensaje = 'El registro se actualizó correctamente.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'verde', confirmar: 'Aceptar', mostrarCheck: true
  });
}

function alertaError(titulo: string, mensaje = 'Ocurrió un error al realizar la operación.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'rojo', confirmar: 'Aceptar'
  });
}

function alertaAdvertencia(titulo: string, mensaje = 'Revisa la información e inténtalo nuevamente.') {
  return mostrarAlerta({
    titulo, mensaje, tono: 'azul', confirmar: 'Aceptar'
  });
}

// ============================================================
// FIN ALERTAS GERIAPP
// ============================================================

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

  foto: string | null;

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

interface RangosVitalesPersonalizados {
  sistolica_min: number;
  sistolica_max: number;
  diastolica_min: number;
  diastolica_max: number;
  fc_min: number;
  fc_max: number;
  fr_min: number;
  fr_max: number;
  temp_min: number;
  temp_max: number;
  sat_min: number;
  sat_max: number;
  resumen_condicion: string;
}

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

  rangos_vitales_json?: RangosVitalesPersonalizados | null;

}

type TipoFotoFacial = 'frontal' | 'izquierda' | 'derecha';

interface RegistroFacial {
  id_registro_facial: number;
  id_paciente: number;
  url_fotografia: string;
  public_id: string;
  tipo_fotografia: 'FRONTAL' | 'IZQUIERDA' | 'DERECHA' | 'ADICIONAL' | null;
  activo: boolean;
  fecha_registro: string;
  fecha_actualizacion: string;
}

interface FotoFacialAdicional {
  archivo: File | null;
  preview: string;
  id_registro_facial?: number;
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
    foto: null,
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

  get seccionActiva(): 'elementos' | 'cuidados' | 'recomendaciones' | 'historia' | 'formulacion' | 'facial' {
    return this.seccionActual;
  }

  // ============================================================
  // ESTADOS DE CARGA
  // ============================================================

  cargandoPaciente = false;
  cargandoElementos = false;
  guardandoElementos = false;
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

  formularioElementoOriginal: FormularioElemento | null = null;

  private cuidadosOriginal: CuidadoEnfermeria | null = null;
  private recomendacionesOriginal: Recomendacion | null = null;
  private historiaOriginal: HistoriaClinica | null = null;

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
    id_paciente: 0,
    rangos_vitales_json: null
  };

  mostrarFormularioHistoria = false;
  archivoPdfSeleccionado: File | null = null;
  nombrePdfSeleccionado = '';
  subiendoPdfHistoria = false;
  urlDocumentoPdfSubido = '';

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

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

      // Recuperar las fotografías faciales ya guardadas para este paciente.
      this.cargarRegistroFacial();

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
    const accion = this.formulacionEditando ? '¿Actualizar formulación?' : '¿Registrar formulación?';
    const mensaje = this.formulacionEditando
      ? 'Confirma que deseas actualizar la formulación de medicamentos del paciente.'
      : 'Confirma que deseas guardar la nueva formulación de medicamentos del paciente.';
    alertaConfirmarFormulario(accion, mensaje, this.formulacionEditando ? 'Actualizar' : 'Guardar')
      .then(resultado => {
        if (resultado.isConfirmed) this.ejecutarGuardarFormulacion();
      });
  }

  private ejecutarGuardarFormulacion(): void {
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

  editarFormulacion(formulacion: FormulacionMedicamento): void {
    const nombre = this.obtenerNombreMedicamentoFormulacion(formulacion);
    alertaEditar(nombre, 'formulación').then(resultado => {
      if (resultado.isConfirmed) this.ejecutarEditarFormulacion(formulacion);
    });
  }

  private ejecutarEditarFormulacion(
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

    alertaEliminar(
      this.obtenerNombreMedicamentoFormulacion(formulacion),
      'formulación'
    ).then((resultado) => {

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
  // REGISTRO FACIAL
  // ============================================================

  fotoFrontal: File | null = null;
  fotoIzquierda: File | null = null;
  fotoDerecha: File | null = null;

  fotoFrontalPreview: string | null = null;
  fotoIzquierdaPreview: string | null = null;
  fotoDerechaPreview: string | null = null;

  idFotoFrontal: number | null = null;
  idFotoIzquierda: number | null = null;
  idFotoDerecha: number | null = null;

  fotosAdicionales: FotoFacialAdicional[] = [];
  guardandoRegistroFacial = false;
  registroFacialCompletado = false;

  registrosFaciales: RegistroFacial[] = [];
  cargandoRegistroFacial = false;
  private readonly tamanoMaximoFoto = 10 * 1024 * 1024; // 10 MB

  seleccionarFotoFacial(evento: Event, tipo: TipoFotoFacial): void {

    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) return;

    // Validar formato
    if (!archivo.type.startsWith('image/')) {

      alertaAdvertencia(
        'Archivo no válido',
        'Seleccione una imagen en formato JPG, PNG o similar.'
      );

      input.value = '';
      return;
    }

    // Validar tamaño máximo
    if (archivo.size > this.tamanoMaximoFoto) {

      alertaAdvertencia(
        'Imagen demasiado grande',
        'Cada fotografía debe pesar máximo 10 MB.'
      );

      input.value = '';
      return;
    }

    const lector = new FileReader();

    lector.onload = () => {

      const preview = String(lector.result ?? '');

      switch (tipo) {

        case 'frontal':

          this.fotoFrontal = archivo;
          this.fotoFrontalPreview = preview;

          break;

        case 'izquierda':

          this.fotoIzquierda = archivo;
          this.fotoIzquierdaPreview = preview;

          break;

        case 'derecha':

          this.fotoDerecha = archivo;
          this.fotoDerechaPreview = preview;

          break;

      }

      // Indicar que hay cambios pendientes
      this.registroFacialCompletado = false;

      this.cdr.detectChanges();

    };

    lector.onerror = () => {

      alertaError(
        'No se pudo leer la imagen',
        'Intente seleccionar la fotografía nuevamente.'
      );

    };

    lector.readAsDataURL(archivo);

    input.value = '';

  }

  // ============================================================
  // SELECCIONAR FOTOGRAFÍAS ADICIONALES
  // ============================================================

  seleccionarFotosAdicionales(evento: Event): void {

    const input = evento.target as HTMLInputElement;

    const archivos = Array.from(input.files ?? []);

    if (archivos.length === 0) {
      return;
    }

    archivos.forEach(archivo => {

      // Validar que sea una imagen.
      if (!archivo.type.startsWith('image/')) {

        alertaAdvertencia(
          'Archivo no válido',
          `${archivo.name} no es una imagen válida.`
        );

        return;
      }

      // Validar tamaño máximo de 10 MB.
      if (archivo.size > this.tamanoMaximoFoto) {

        alertaAdvertencia(
          'Imagen demasiado grande',
          `${archivo.name} supera el límite de 10 MB.`
        );

        return;
      }

      const lector = new FileReader();

      lector.onload = () => {

        const preview = String(lector.result ?? '');

        // Agregar la fotografía al arreglo.
        this.fotosAdicionales.push({
          archivo: archivo,
          preview: preview
        });

        // Indicar que hay cambios pendientes.
        this.registroFacialCompletado = false;

        this.cdr.detectChanges();

        console.log(
          'Fotografía adicional seleccionada:',
          archivo.name
        );

      };

      lector.onerror = () => {

        alertaError(
          'Error al leer fotografía',
          `No fue posible cargar ${archivo.name}.`
        );

      };

      lector.readAsDataURL(archivo);

    });

    // Permitir seleccionar nuevamente los mismos archivos.
    input.value = '';

  }

  quitarFotoFacial(tipo: TipoFotoFacial): void {

    let idRegistro: number | null = null;
    let nombre = '';

    switch (tipo) {

      case 'frontal':
        idRegistro = this.idFotoFrontal;
        nombre = 'fotografía frontal';
        break;

      case 'izquierda':
        idRegistro = this.idFotoIzquierda;
        nombre = 'fotografía izquierda';
        break;

      case 'derecha':
        idRegistro = this.idFotoDerecha;
        nombre = 'fotografía derecha';
        break;

    }

    // Si ya existe en el backend, eliminarlo también de MySQL.
    if (idRegistro !== null) {

      this.eliminarRegistroFacial(
        idRegistro,
        nombre,
        () => {

          // Limpiar el archivo nuevo seleccionado.
          if (tipo === 'frontal') {

            this.fotoFrontal = null;
            this.fotoFrontalPreview = null;

          } else if (tipo === 'izquierda') {

            this.fotoIzquierda = null;
            this.fotoIzquierdaPreview = null;

          } else if (tipo === 'derecha') {

            this.fotoDerecha = null;
            this.fotoDerechaPreview = null;

          }

        }
      );

      return;

    }

    // Si todavía no está guardada, solamente limpiar la selección.
    if (tipo === 'frontal') {

      this.fotoFrontal = null;
      this.fotoFrontalPreview = null;

    } else if (tipo === 'izquierda') {

      this.fotoIzquierda = null;
      this.fotoIzquierdaPreview = null;

    } else if (tipo === 'derecha') {

      this.fotoDerecha = null;
      this.fotoDerechaPreview = null;

    }

    this.registroFacialCompletado = false;

    this.cdr.detectChanges();

  }

  // ============================================================
  // ELIMINAR FOTOGRAFÍA ADICIONAL
  // ============================================================

  quitarFotoAdicional(indice: number): void {

    // Validar que el índice exista.
    if (
      indice < 0 ||
      indice >= this.fotosAdicionales.length
    ) {
      return;
    }

    const foto = this.fotosAdicionales[indice];

    if (!foto) {
      return;
    }

    // Si la fotografía ya está guardada en el backend,
    // eliminarla también de MySQL y Cloudinary.
    if (foto.id_registro_facial != null) {

      this.eliminarRegistroFacial(
        foto.id_registro_facial,
        'fotografía adicional',
        () => {

          this.fotosAdicionales.splice(indice, 1);

          this.registroFacialCompletado = false;

          this.cdr.detectChanges();

        }
      );

      return;
    }

    // Si todavía no está guardada, eliminarla solamente
    // del arreglo local.
    this.fotosAdicionales.splice(indice, 1);

    this.registroFacialCompletado = false;

    this.cdr.detectChanges();

  }

  // ============================================================
  // ELIMINAR REGISTRO FACIAL DEL BACKEND Y CLOUDINARY
  // ============================================================

  private eliminarRegistroFacial(
    idRegistro: number,
    nombre: string,
    alEliminar?: () => void
  ): void {

    alertaEliminar(
      nombre,
      'fotografía facial'
    ).then(resultado => {

      if (!resultado.isConfirmed) return;

      this.guardandoRegistroFacial = true;

      this.http.delete(
        `${this.apiUrl}/registros_faciales/${idRegistro}/`
      ).subscribe({

        next: (respuesta: any) => {
          // Ejecutar limpieza de archivos locales si se confirmó la eliminación.
          if (alEliminar) {
            alEliminar();
          }

          console.log(
            'Registro facial eliminado:',
            respuesta
          );

          // Actualizar las fotografías desde el backend.
          this.cargarRegistroFacial(() => {

            this.guardandoRegistroFacial = false;

            this.registroFacialCompletado = Boolean(
              this.idFotoFrontal &&
              this.idFotoIzquierda &&
              this.idFotoDerecha
            );

            this.cdr.detectChanges();

            // Verificar si Cloudinary devolvió alguna advertencia.
            if (respuesta?.advertencia) {

              alertaAdvertencia(
                'Fotografía desactivada',
                respuesta.advertencia
              );

              return;
            }

            alertaExito(
              'Fotografía eliminada',
              respuesta?.mensaje ||
              'La fotografía fue eliminada correctamente de MySQL y Cloudinary.'
            );

          });

        },

        error: (error) => {

          console.error(
            'Error eliminando registro facial:',
            error
          );

          this.guardandoRegistroFacial = false;

          alertaError(
            'No se pudo eliminar la fotografía',
            error?.error?.error ||
            error?.error?.detail ||
            'Ocurrió un problema al eliminar el registro facial.'
          );

          this.cdr.detectChanges();

        }

      });

    });

  }

  // ============================================================
  // GUARDAR REGISTRO FACIAL
  // ============================================================

  private guardarRegistroFacial(): void {

    if (this.guardandoRegistroFacial) return;

    // ==========================================
    // VALIDAR PACIENTE
    // ==========================================

    if (!this.idPaciente || this.idPaciente <= 0) {

      alertaError(
        'Paciente no válido',
        'No se encontró el identificador del paciente.'
      );

      return;
    }

    // ==========================================
    // VALIDAR FOTOGRAFÍAS OBLIGATORIAS
    // ==========================================

    const tieneFrontal =
      !!this.fotoFrontal || !!this.idFotoFrontal;

    const tieneIzquierda =
      !!this.fotoIzquierda || !!this.idFotoIzquierda;

    const tieneDerecha =
      !!this.fotoDerecha || !!this.idFotoDerecha;

    if (!tieneFrontal || !tieneIzquierda || !tieneDerecha) {

      alertaAdvertencia(
        'Registro facial incompleto',
        'Debe registrar las fotografías frontal, izquierda y derecha.'
      );

      this.seccionActual = 'facial';

      return;
    }

    // ==========================================
    // REGISTRO INICIAL
    // ==========================================

    const esRegistroNuevo =
      !this.idFotoFrontal &&
      !this.idFotoIzquierda &&
      !this.idFotoDerecha;

    if (esRegistroNuevo) {

      if (
        !this.fotoFrontal ||
        !this.fotoIzquierda ||
        !this.fotoDerecha
      ) {

        alertaAdvertencia(
          'Fotografías incompletas',
          'Para realizar el registro inicial debe seleccionar las tres fotografías.'
        );

        return;
      }

      this.registrarFotografiasFaciales();

      return;
    }

    // ==========================================
    // PREPARAR OPERACIONES
    // ==========================================

    const peticiones: any[] = [];

    // ==========================================
    // FOTOGRAFÍA FRONTAL
    // ==========================================

    if (this.fotoFrontal) {

      if (this.idFotoFrontal) {

        peticiones.push({
          nombre: 'Frontal',
          peticion: this.crearPeticionActualizar(
            this.idFotoFrontal,
            this.fotoFrontal
          )
        });

      } else {

        peticiones.push({
          nombre: 'Frontal',
          peticion: this.crearPeticionAgregar(
            'FRONTAL',
            this.fotoFrontal
          )
        });

      }
    }

    // ==========================================
    // FOTOGRAFÍA IZQUIERDA
    // ==========================================

    if (this.fotoIzquierda) {

      if (this.idFotoIzquierda) {

        peticiones.push({
          nombre: 'Izquierda',
          peticion: this.crearPeticionActualizar(
            this.idFotoIzquierda,
            this.fotoIzquierda
          )
        });

      } else {

        peticiones.push({
          nombre: 'Izquierda',
          peticion: this.crearPeticionAgregar(
            'IZQUIERDA',
            this.fotoIzquierda
          )
        });

      }
    }

    // ==========================================
    // FOTOGRAFÍA DERECHA
    // ==========================================

    if (this.fotoDerecha) {

      if (this.idFotoDerecha) {

        peticiones.push({
          nombre: 'Derecha',
          peticion: this.crearPeticionActualizar(
            this.idFotoDerecha,
            this.fotoDerecha
          )
        });

      } else {

        peticiones.push({
          nombre: 'Derecha',
          peticion: this.crearPeticionAgregar(
            'DERECHA',
            this.fotoDerecha
          )
        });

      }
    }

    // ==========================================
    // FOTOGRAFÍAS ADICIONALES
    // ==========================================

    this.fotosAdicionales.forEach(foto => {

      if (!foto.archivo) return;

      if (foto.id_registro_facial) {

        // Actualizar fotografía adicional existente.

        peticiones.push({
          nombre: 'Adicional',
          peticion: this.crearPeticionActualizar(
            foto.id_registro_facial,
            foto.archivo
          )
        });

      } else {

        // Registrar nueva fotografía adicional.

        peticiones.push({
          nombre: 'Adicional',
          peticion: this.crearPeticionAgregar(
            'ADICIONAL',
            foto.archivo
          )
        });

      }

    });

    // ==========================================
    // VALIDAR CAMBIOS
    // ==========================================

    if (peticiones.length === 0) {

      alertaAdvertencia(
        'Sin cambios',
        'No seleccionaste nuevas fotografías para actualizar.'
      );

      return;
    }

    // ==========================================
    // EJECUTAR OPERACIONES
    // ==========================================

    this.ejecutarOperacionesFaciales(peticiones);

  }


  // ============================================================
  // CREAR PETICIÓN PARA AGREGAR FOTOGRAFÍA
  // ============================================================

  private crearPeticionAgregar(
    tipo: 'FRONTAL' | 'IZQUIERDA' | 'DERECHA' | 'ADICIONAL',
    archivo: File
  ) {

    const datos = new FormData();

    datos.append(
      'id_paciente',
      String(this.idPaciente)
    );

    datos.append(
      'tipo_fotografia',
      tipo
    );

    datos.append(
      'fotografia',
      archivo,
      archivo.name
    );

    return this.http.post(
      `${this.apiUrl}/registros_faciales/agregar/`,
      datos
    );

  }


  // ============================================================
  // CREAR PETICIÓN PARA ACTUALIZAR FOTOGRAFÍA
  // ============================================================

  private crearPeticionActualizar(
    idRegistro: number,
    archivo: File
  ) {

    const datos = new FormData();

    datos.append(
      'id_registro_facial',
      String(idRegistro)
    );

    datos.append(
      'fotografia',
      archivo,
      archivo.name
    );

    return this.http.post(
      `${this.apiUrl}/registros_faciales/actualizar/`,
      datos
    );

  }


  // ============================================================
  // EJECUTAR OPERACIONES FACIALES
  // ============================================================

  private ejecutarOperacionesFaciales(
    operaciones: { nombre: string; peticion: any }[]
  ): void {

    if (!operaciones.length) return;

    this.guardandoRegistroFacial = true;

    const peticiones = operaciones.map(
      operacion => operacion.peticion
    );

    forkJoin(peticiones).subscribe({

      next: (respuestas) => {

        console.log(
          'Operaciones faciales completadas:',
          respuestas
        );

        this.finalizarGuardadoFacial();

      },

      error: (error) => {

        console.error(
          'Error ejecutando operaciones faciales:',
          error
        );

        this.guardandoRegistroFacial = false;

        this.cargarRegistroFacial();

        alertaError(
          'Error al guardar fotografías',
          error?.error?.error ||
          error?.error?.detail ||
          'No fue posible completar todas las operaciones faciales.'
        );

        this.cdr.detectChanges();

      }

    });

  }


  // ============================================================
  // FINALIZAR GUARDADO FACIAL
  // ============================================================

  private finalizarGuardadoFacial(): void {

    this.fotoFrontal = null;
    this.fotoIzquierda = null;
    this.fotoDerecha = null;

    this.fotosAdicionales = this.fotosAdicionales.map(foto => ({
      ...foto,
      archivo: null
    }));

    this.cdr.detectChanges();

    // Esperar a que el backend devuelva los registros actualizados.
    this.cargarRegistroFacial(() => {

      this.guardandoRegistroFacial = false;

      this.mostrarFinalizacionExitosa();

      this.cdr.detectChanges();

    });

  }


  // ============================================================
  // REGISTRAR FOTOGRAFÍAS FACIALES INICIALES
  // ============================================================

  private registrarFotografiasFaciales(): void {

    if (
      !this.fotoFrontal ||
      !this.fotoIzquierda ||
      !this.fotoDerecha
    ) {

      alertaAdvertencia(
        'Fotografías incompletas',
        'Debe seleccionar las tres fotografías obligatorias.'
      );

      return;
    }

    const datos = new FormData();

    datos.append(
      'id_paciente',
      String(this.idPaciente)
    );

    // IMPORTANTE:
    // El orden debe coincidir con el backend:
    // FRONTAL, IZQUIERDA y DERECHA.

    datos.append(
      'fotografias',
      this.fotoFrontal,
      this.fotoFrontal.name
    );

    datos.append(
      'fotografias',
      this.fotoIzquierda,
      this.fotoIzquierda.name
    );

    datos.append(
      'fotografias',
      this.fotoDerecha,
      this.fotoDerecha.name
    );

    // Fotografías adicionales iniciales.

    this.fotosAdicionales.forEach(foto => {

      if (!foto.archivo) return;

      datos.append(
        'fotografias',
        foto.archivo,
        foto.archivo.name
      );

    });

    this.guardandoRegistroFacial = true;

    this.http.post(
      `${this.apiUrl}/registros_faciales/registrar/`,
      datos
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'Registro facial inicial creado:',
          respuesta
        );

        this.finalizarGuardadoFacial();

      },

      error: (error) => {

        console.error(
          'Error registrando fotografías:',
          error
        );

        this.guardandoRegistroFacial = false;

        alertaError(
          'No se pudo registrar el rostro',
          error?.error?.error ||
          error?.error?.detail ||
          'Verifique las fotografías e intente nuevamente.'
        );

        this.cdr.detectChanges();

      }

    });

  }


  // ============================================================
  // MENSAJE DE FINALIZACIÓN EXITOSA
  // ============================================================

  private mostrarFinalizacionExitosa(): void {

    alertaExito(
      '¡Registro finalizado!',
      'La información del paciente y su registro facial se guardaron correctamente.'
    ).then(() => {

      this.mostrarBarraFinal = false;

      this.cdr.detectChanges();

    });

  }
  // ============================================================
  // CARGAR FOTOGRAFÍAS FACIALES DEL PACIENTE
  // ============================================================

  cargarRegistroFacial(
    alFinalizar?: () => void
  ): void {

    if (!this.idPaciente || this.idPaciente <= 0) {

      console.error(
        'No se pueden cargar las fotografías: ID de paciente inválido.'
      );

      return;

    }

    this.cargandoRegistroFacial = true;

    this.http.get<
      RegistroFacial[] | RespuestaPaginada<RegistroFacial>
    >(
      `${this.apiUrl}/registros_faciales/?id_paciente=${this.idPaciente}`
    ).subscribe({

      next: (respuesta) => {

        // Obtener resultados independientemente
        // de si el backend devuelve una lista o paginación.

        const registros = this.obtenerResultados(respuesta);

        // Recuperar solamente fotografías activas.

        this.registrosFaciales = registros.filter(
          registro => registro.activo
        );

        // ==========================================
        // FOTOGRAFÍA FRONTAL
        // ==========================================

        const frontal = this.registrosFaciales.find(
          foto => foto.tipo_fotografia === 'FRONTAL'
        );

        this.fotoFrontalPreview =
          frontal?.url_fotografia ?? null;

        this.idFotoFrontal =
          frontal?.id_registro_facial ?? null;

        // ==========================================
        // PERFIL IZQUIERDO
        // ==========================================

        const izquierda = this.registrosFaciales.find(
          foto => foto.tipo_fotografia === 'IZQUIERDA'
        );

        this.fotoIzquierdaPreview =
          izquierda?.url_fotografia ?? null;

        this.idFotoIzquierda =
          izquierda?.id_registro_facial ?? null;

        // ==========================================
        // PERFIL DERECHO
        // ==========================================

        const derecha = this.registrosFaciales.find(
          foto => foto.tipo_fotografia === 'DERECHA'
        );

        this.fotoDerechaPreview =
          derecha?.url_fotografia ?? null;

        this.idFotoDerecha =
          derecha?.id_registro_facial ?? null;

        // ==========================================
        // FOTOGRAFÍAS ADICIONALES
        // ==========================================

        this.fotosAdicionales = this.registrosFaciales

          .filter(
            foto => foto.tipo_fotografia === 'ADICIONAL'
          )

          .map(foto => ({

            archivo: null,

            preview: foto.url_fotografia,

            id_registro_facial: foto.id_registro_facial

          }));

        // ==========================================
        // VALIDAR SI EL REGISTRO ESTÁ COMPLETO
        // ==========================================

        this.registroFacialCompletado = Boolean(
          frontal &&
          izquierda &&
          derecha
        );

        this.cargandoRegistroFacial = false;

        console.log(
          'Fotografías faciales recuperadas:',
          this.registrosFaciales
        );

        console.log(
          'Identificadores de fotografías:',
          {
            frontal: this.idFotoFrontal,
            izquierda: this.idFotoIzquierda,
            derecha: this.idFotoDerecha
          }
        );

        this.cdr.detectChanges();

        if (alFinalizar) {
          alFinalizar();
        }

      },

      error: (error) => {

        console.error(
          'Error al cargar registros faciales:',
          error
        );

        this.cargandoRegistroFacial = false;
        this.guardandoRegistroFacial = false;

        this.cdr.detectChanges();

        alertaError(
          'Error al cargar fotografías',
          error?.error?.detail ||
          'No fue posible recuperar las fotografías faciales del paciente. Intenta nuevamente.'
        );

      }

    });

  }
  // ============================================================
  // SECCIÓN ACTUAL
  // ============================================================

  seccionActual: 'elementos' | 'cuidados' | 'recomendaciones' | 'historia' | 'formulacion' | 'facial' = 'elementos';

  // ============================================================
  // CAMBIAR SECCIÓN
  // ============================================================

  cambiarSeccion(
    seccion:
      | 'elementos'
      | 'cuidados'
      | 'recomendaciones'
      | 'historia'
      | 'formulacion'
      | 'facial'
  ): void {

    this.seccionActual = seccion;

    if (seccion === 'facial') {
      this.cargarRegistroFacial();
    }

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

  editarElemento(elemento: ElementoPaciente): void {
    alertaEditar(this.obtenerNombreElemento(elemento), 'elemento del paciente').then(resultado => {
      if (resultado.isConfirmed) this.ejecutarEditarElemento(elemento);
    });
  }

  private ejecutarEditarElemento(
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

    this.formularioElementoOriginal = {
      ...this.formularioElemento
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
  private huboCambios(original: any, nuevo: any, campos: string[]): boolean {
    return campos.some(campo => (original?.[campo] ?? '') !== (nuevo?.[campo] ?? ''));
  }
  private mostrarErrorApi(

    error: any,
    mensajePorDefecto: string = 'Ocurrió un error al comunicarse con el servidor.'
  ): void {

    let mensaje = mensajePorDefecto;

    if (error && error.error) {

      if (typeof error.error === 'string') {

        // Si el backend devolvió una página de error (HTML/traceback de Django)
        // en vez de un mensaje limpio, no la mostramos: es ilegible y muy larga.
        const esPaginaHtml =
          error.error.includes('<!DOCTYPE') ||
          error.error.includes('<html') ||
          error.error.length > 400;

        mensaje = esPaginaHtml ? mensajePorDefecto : error.error;

      } else if (error.error.detail) {
        mensaje = error.error.detail;
      } else if (error.error.message) {
        mensaje = error.error.message;
      } else if (error.error.mensaje) {
        mensaje = error.error.mensaje;
      } else {
        try {
          mensaje = Object.values(error.error).flat().join(' ');
        } catch (e) {
          mensaje = mensajePorDefecto;
        }
      }

    } else if (error && error.message) {
      mensaje = error.message;
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
    const accion = this.elementoEditando ? '¿Actualizar elemento?' : '¿Guardar elementos del paciente?';
    const mensaje = this.elementoEditando
      ? 'Confirma que deseas actualizar la información del elemento.'
      : 'Se registrarán los medicamentos o insumos que agregaste para este paciente.';
    alertaConfirmarFormulario(accion, mensaje, this.elementoEditando ? 'Actualizar' : 'Guardar')
      .then(resultado => {
        if (resultado.isConfirmed) this.ejecutarGuardarElemento();
      });
  }

  private ejecutarGuardarElemento(): void {

    if (this.guardandoElementos) {
      return;
    }

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

    if (this.elementoEditando && this.formularioElementoOriginal) {

      const sinCambios =
        Number(this.formularioElemento.cantidad) === Number(this.formularioElementoOriginal.cantidad) &&
        this.formularioElemento.fecha_ingreso === this.formularioElementoOriginal.fecha_ingreso &&
        this.formularioElemento.fecha_vencimiento === this.formularioElementoOriginal.fecha_vencimiento &&
        (this.formularioElemento.observaciones || '').trim() ===
        (this.formularioElementoOriginal.observaciones || '').trim() &&
        this.formularioElemento.estado === this.formularioElementoOriginal.estado &&
        this.formularioElemento.id_medicamentos === this.formularioElementoOriginal.id_medicamentos &&
        this.formularioElemento.id_insumo === this.formularioElementoOriginal.id_insumo;

      if (sinCambios) {
        alertaAdvertencia(
          'Sin cambios',
          'No se realizó ninguna modificación en el elemento.'
        );
        return;
      }
    }

    this.guardandoElementos = true;

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
            this.guardandoElementos = false;
            this.cerrarFormularioElemento();
            this.cargarElementosPaciente();
          },

          error: (error) => {

            this.guardandoElementos = false;

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

          this.guardandoElementos = false;
          this.cerrarFormularioElemento();
          this.cargarElementosPaciente();

        },

        error: (error) => {

          this.guardandoElementos = false;

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

    if (this.guardandoElementos) {
      return;
    }

    if (this.medicamentosPendientes.length === 0) {
      return;
    }

    this.guardandoElementos = true;

    this.guardarSiguienteMedicamento();
  }

  private guardarSiguienteMedicamento(): void {

    if (this.medicamentosPendientes.length === 0) {

      this.guardandoElementos = false;

      alertaExito(
        'Medicamentos registrados',
        'Todos los medicamentos se registraron correctamente para el paciente.'
      );

      this.cerrarFormularioElemento();
      this.cargarElementosPaciente();

      return;
    }

    const medicamento = this.medicamentosPendientes[0];

    const datos = {

      cantidad: Number(medicamento.cantidad),

      fecha_ingreso:
        medicamento.fecha_ingreso ||
        this.obtenerFechaHoraActual(),

      fecha_vencimiento:
        medicamento.fecha_vencimiento || null,

      observaciones:
        medicamento.observaciones?.trim() || null,

      estado:
        medicamento.estado,

      id_paciente:
        this.idPaciente,

      id_medicamentos:
        Number(medicamento.id_medicamentos),

      id_insumo:
        null

    };

    console.log(
      'Medicamento que se enviará:',
      datos
    );

    this.http
      .post(
        `${this.apiUrl}/elementos_paciente/`,
        datos
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Medicamento registrado:',
            respuesta
          );

          // Quitamos únicamente el medicamento
          // que el backend confirmó.
          this.medicamentosPendientes.shift();

          // Continuamos con el siguiente.
          this.guardarSiguienteMedicamento();

        },

        error: (error) => {

          this.guardandoElementos = false;

          console.error(
            'Error al registrar medicamento:',
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

    if (this.guardandoElementos) {
      return;
    }

    if (this.insumosPendientes.length === 0) {
      return;
    }

    this.guardandoElementos = true;

    this.guardarSiguienteInsumo();
  }

  private guardarSiguienteInsumo(): void {

    if (this.insumosPendientes.length === 0) {

      this.guardandoElementos = false;

      alertaExito(
        'Insumos registrados',
        'Todos los insumos se registraron correctamente para el paciente.'
      );

      this.cerrarFormularioElemento();
      this.cargarElementosPaciente();

      return;
    }

    const insumo = this.insumosPendientes[0];

    const datos = {

      cantidad:
        Number(insumo.cantidad),

      fecha_ingreso:
        insumo.fecha_ingreso ||
        this.obtenerFechaHoraActual(),

      fecha_vencimiento:
        null,

      observaciones:
        insumo.observaciones?.trim() || null,

      estado:
        insumo.estado,

      id_paciente:
        this.idPaciente,

      id_medicamentos:
        null,

      id_insumo:
        Number(insumo.id_insumo)

    };

    console.log(
      'Insumo que se enviará:',
      datos
    );

    this.http
      .post(
        `${this.apiUrl}/elementos_paciente/`,
        datos
      )
      .subscribe({

        next: (respuesta) => {

          console.log(
            'Insumo registrado:',
            respuesta
          );

          // Quitamos únicamente el insumo
          // que el backend confirmó.
          this.insumosPendientes.shift();

          // Continuamos con el siguiente.
          this.guardarSiguienteInsumo();

        },

        error: (error) => {

          this.guardandoElementos = false;

          console.error(
            'Error al registrar insumo:',
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
          console.log('CUIDADOS RECIBIDOS DEL BACKEND:', respuesta);

          const cuidados =
            this.obtenerResultados(respuesta);

          const registro = cuidados
            .filter(cuidado =>
              Number(this.obtenerIdPaciente(cuidado.id_paciente)) ===
              Number(this.idPaciente)
            )
            .filter(cuidado =>
              !!cuidado.bano_paciente ||
              !!cuidado.peso_talla ||
              !!cuidado.control_glucemia ||
              !!cuidado.curaciones ||
              !!cuidado.control_deposicion ||
              !!cuidado.liquidos_administrados_eliminados
            )
            .sort((a, b) => b.id_cuidado - a.id_cuidado)[0];
          console.log('REGISTRO QUE SE MUESTRA:', registro);

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
    this.cuidadosOriginal = this.cuidados.id_cuidado > 0 ? { ...this.cuidados } : null;
    this.mostrarFormularioCuidados = true;
    this.cdr.detectChanges();
  }

  // ============================================================
  // GUARDAR CUIDADOS DE ENFERMERÍA
  // ============================================================

  guardarCuidados(): void {
    const actualizar = this.cuidados.id_cuidado > 0;
    alertaConfirmarFormulario(
      actualizar ? '¿Actualizar cuidados de enfermería?' : '¿Registrar cuidados de enfermería?',
      actualizar
        ? 'Confirma que deseas guardar los cambios realizados en los cuidados del paciente.'
        : 'Confirma que deseas registrar los cuidados de enfermería para este paciente.',
      actualizar ? 'Actualizar' : 'Guardar'
    ).then(resultado => {
      if (resultado.isConfirmed) this.ejecutarGuardarCuidados();
    });
  }

  private ejecutarGuardarCuidados(): void {

    if (!this.idPaciente || this.idPaciente <= 0) {

      alertaAdvertencia(
        'Paciente no identificado',
        'No fue posible identificar el paciente.'
      );

      return;
    }

    if (
      this.cuidados.id_cuidado > 0 &&
      this.cuidadosOriginal &&
      !this.huboCambios(
        this.cuidadosOriginal,
        this.cuidados,
        [
          'bano_paciente',
          'peso_talla',
          'control_glucemia',
          'curaciones',
          'liquidos_administrados_eliminados',
          'control_deposicion',
          'administracion_medicamentos'
        ]
      )
    ) {

      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo de los cuidados de enfermería.'
      );

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
          this.cuidados.liquidos_administrados_eliminados
        ),

      control_deposicion:
        this.limpiarValor(
          this.cuidados.control_deposicion
        ),

      administracion_medicamentos:
        this.limpiarValor(
          this.cuidados.administracion_medicamentos
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

            alertaExito(
              'Cuidados actualizados',
              'Los cuidados de enfermería se actualizaron correctamente.'
            );

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

          alertaExito(
            'Cuidados registrados',
            'Los cuidados de enfermería se registraron correctamente.'
          );

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
    const nombre = `${this.paciente?.nombre || ''} ${this.paciente?.apellido || ''}`.trim() || 'este paciente';
    alertaEditar(nombre, 'cuidados de enfermería').then(resultado => {
      if (resultado.isConfirmed) this.ejecutarEditarCuidados();
    });
  }

  private ejecutarEditarCuidados(): void {

    if (!this.cuidados.id_cuidado) {

      alertaAdvertencia('Sin cuidados registrados', 'Primero debe registrar los cuidados de enfermería.');

      return;

    }

    this.cuidadosOriginal = { ...this.cuidados };

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

    if (!this.recomendaciones.id_recomendacion) {
      this.recomendaciones = this.crearRecomendacionesVacias();
    }

    this.recomendacionesOriginal = this.recomendaciones.id_recomendacion > 0 ? { ...this.recomendaciones } : null;

    this.mostrarFormularioRecomendaciones = true;
    this.cdr.detectChanges();
  }

  // ============================================================
  // GUARDAR RECOMENDACIONES
  // ============================================================

  guardarRecomendaciones(): void {
    const actualizar = this.recomendaciones.id_recomendacion > 0;
    alertaConfirmarFormulario(
      actualizar ? '¿Actualizar recomendaciones?' : '¿Registrar recomendaciones?',
      actualizar
        ? 'Confirma que deseas guardar los cambios en las recomendaciones del paciente.'
        : 'Confirma que deseas registrar las recomendaciones para este paciente.',
      actualizar ? 'Actualizar' : 'Guardar'
    ).then(resultado => {
      if (resultado.isConfirmed) this.ejecutarGuardarRecomendaciones();
    });
  }

  private ejecutarGuardarRecomendaciones(): void {

    if (
      this.recomendaciones.id_recomendacion > 0 &&
      this.recomendacionesOriginal &&
      !this.huboCambios(this.recomendacionesOriginal, this.recomendaciones,
        [
          'hidratar_piel', 'asistir_alimentacion', 'via_alimentacion', 'prevencion_caidas',
          'terapias_fisicas', 'terapia_respiratoria', 'actividad_ocupacional',
          'corte_unas', 'corte_cabello', 'higiene_oral'
        ]
      )
    ) {
      alertaAdvertencia('Sin cambios', 'No modificaste ningún campo de las recomendaciones.');
      return;
    }

    if (this.recomendaciones.id_recomendacion === 0) {

      const camposLlenos = [
        this.recomendaciones.hidratar_piel,
        this.recomendaciones.asistir_alimentacion,
        this.recomendaciones.via_alimentacion,
        this.recomendaciones.prevencion_caidas,
        this.recomendaciones.terapias_fisicas,
        this.recomendaciones.terapia_respiratoria,
        this.recomendaciones.actividad_ocupacional,
        this.recomendaciones.corte_unas,
        this.recomendaciones.corte_cabello,
        this.recomendaciones.higiene_oral
      ].some(campo => !!campo?.trim());

      if (!camposLlenos) {
        alertaAdvertencia('Recomendaciones vacías', 'Completa al menos un campo antes de guardar.');
        return;
      }
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

    if (this.recomendaciones.id_recomendacion > 0) {

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

            alertaExito(
              'Recomendaciones actualizadas',
              'Las recomendaciones se actualizaron correctamente.'
            );

            this.mostrarFormularioRecomendaciones = false;

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

          alertaExito(
            'Recomendaciones registradas',
            'Las recomendaciones se registraron correctamente.'
          );

          this.mostrarFormularioRecomendaciones = false;

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
    const nombre = `${this.paciente?.nombre || ''} ${this.paciente?.apellido || ''}`.trim() || 'este paciente';
    alertaEditar(nombre, 'recomendaciones').then(resultado => {
      if (resultado.isConfirmed) this.ejecutarEditarRecomendaciones();
    });
  }

  private ejecutarEditarRecomendaciones(): void {

    if (!this.recomendaciones.id_recomendacion || this.recomendaciones.id_recomendacion <= 0) {
      alertaAdvertencia('Sin recomendaciones', 'Primero debe registrar las recomendaciones.');
      return;
    }

    this.recomendacionesOriginal = { ...this.recomendaciones };

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
                this.idPaciente,

              rangos_vitales_json:
                registro.rangos_vitales_json ?? null

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
        this.idPaciente,

      rangos_vitales_json: null

    };
  }

  get tarjetasRangosVitales(): Array<{
    etiqueta: string;
    rango: string;
    unidad: string;
    icono: string;
  }> {
    const r = this.historiaClinica?.rangos_vitales_json;
    if (!r) return [];

    return [
      {
        etiqueta: 'Presión sistólica',
        rango: `${r.sistolica_min} – ${r.sistolica_max}`,
        unidad: 'mmHg',
        icono: 'favorite'
      },
      {
        etiqueta: 'Presión diastólica',
        rango: `${r.diastolica_min} – ${r.diastolica_max}`,
        unidad: 'mmHg',
        icono: 'monitor_heart'
      },
      {
        etiqueta: 'Frecuencia cardíaca',
        rango: `${r.fc_min} – ${r.fc_max}`,
        unidad: 'lpm',
        icono: 'ecg_heart'
      },
      {
        etiqueta: 'Frecuencia respiratoria',
        rango: `${r.fr_min} – ${r.fr_max}`,
        unidad: 'rpm',
        icono: 'air'
      },
      {
        etiqueta: 'Temperatura',
        rango: `${r.temp_min} – ${r.temp_max}`,
        unidad: '°C',
        icono: 'device_thermostat'
      },
      {
        etiqueta: 'Saturación de oxígeno',
        rango: `${r.sat_min} – ${r.sat_max}`,
        unidad: '% SpO₂',
        icono: 'water_drop'
      }
    ];
  }

  seleccionarPdfHistoria(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const archivo = input?.files?.[0] ?? null;

    if (!archivo) {
      return;
    }

    const esPdf =
      archivo.type === 'application/pdf' ||
      archivo.name.toLowerCase().endsWith('.pdf');

    if (!esPdf) {
      alertaAdvertencia(
        'Archivo no válido',
        'Por favor selecciona un documento clínico en formato PDF (.pdf).'
      );
      if (input) input.value = '';
      return;
    }

    this.archivoPdfSeleccionado = archivo;
    this.nombrePdfSeleccionado = archivo.name;

    if (input) input.value = '';
    this.cdr.detectChanges();
  }

  subirYAnalizarPdfHistoria(): void {
    if (!this.archivoPdfSeleccionado || this.subiendoPdfHistoria) return;
    alertaConfirmarFormulario(
      '¿Subir documento de historia clínica?',
      'El PDF seleccionado se enviará para guardarlo en el registro del paciente.',
      'Subir documento'
    ).then(resultado => {
      if (resultado.isConfirmed) this.ejecutarSubirYAnalizarPdfHistoria();
    });
  }

  private ejecutarSubirYAnalizarPdfHistoria(): void {
    if (!this.idPaciente || this.idPaciente <= 0) {
      alertaAdvertencia('Paciente inválido', 'No se pudo identificar el paciente.');
      return;
    }

    if (!this.archivoPdfSeleccionado || this.subiendoPdfHistoria) {
      return;
    }

    const datos = new FormData();
    datos.append('id_paciente', String(this.idPaciente));
    datos.append(
      'archivo',
      this.archivoPdfSeleccionado,
      this.archivoPdfSeleccionado.name
    );
    datos.append('nombre_archivo', this.archivoPdfSeleccionado.name);
    datos.append('estado', 'true');

    this.subiendoPdfHistoria = true;
    this.cdr.detectChanges();

    this.http
      .post<any>(`${this.apiUrl}/documentos_historia_clinica/`, datos)
      .subscribe({
        next: (respuesta) => {
          this.subiendoPdfHistoria = false;

          if (typeof respuesta?.archivo === 'string' && respuesta.archivo) {
            this.urlDocumentoPdfSubido = respuesta.archivo;
          }

          if (respuesta?.rangos_vitales_json) {
            this.historiaClinica = {
              ...this.historiaClinica,
              rangos_vitales_json: respuesta.rangos_vitales_json
            };
            this.cargarHistoriaClinica();
            alertaExito(
              'Documento cargado',
              'El documento PDF se subió y procesó correctamente.'
            );
          } else if (respuesta?.ia_error) {
            alertaAdvertencia(
              'Documento guardado',
              'El documento PDF se guardó, pero no fue posible procesarlo completamente.'
            );
          } else {
            alertaExito(
              'Documento guardado',
              'El documento PDF se subió correctamente.'
            );
          }

          this.archivoPdfSeleccionado = null;
          this.nombrePdfSeleccionado = '';
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.subiendoPdfHistoria = false;
          this.mostrarErrorApi(
            error,
            'No fue posible subir el documento de historia clínica.'
          );
          this.cdr.detectChanges();
        }
      });
  }


  // ============================================================
  // ABRIR FORMULARIO DE HISTORIA CLÍNICA
  // ============================================================

  abrirFormularioHistoria(): void {
    if (!this.historiaClinica) {
      this.historiaClinica = this.crearHistoriaClinicaVacia();
    }

    this.historiaClinica.id_paciente = this.idPaciente;

    this.historiaOriginal = null;   // ← AGREGAR

    this.mostrarFormularioHistoria = true;
    this.cdr.detectChanges();
  }
  // ============================================================
  // EDITAR HISTORIA CLÍNICA
  // ============================================================

  editarHistoriaClinica(): void {
    const nombre = `${this.paciente?.nombre || ''} ${this.paciente?.apellido || ''}`.trim() || 'este paciente';
    alertaEditar(nombre, 'historia clínica').then(resultado => {
      if (resultado.isConfirmed) this.ejecutarEditarHistoriaClinica();
    });
  }

  private ejecutarEditarHistoriaClinica(): void {

    if (!this.historiaClinica.id_historia_clinica || this.historiaClinica.id_historia_clinica <= 0) {
      alertaAdvertencia('Sin historia clínica', 'Primero debe registrar la historia clínica.');
      return;
    }

    this.historiaOriginal = { ...this.historiaClinica };   // ← AGREGAR

    this.mostrarFormularioHistoria = true;
    this.cdr.detectChanges();
  }
  // ============================================================
  // GUARDAR HISTORIA CLÍNICA
  // ============================================================

  guardarHistoriaClinica(): void {
    const actualizar = this.historiaClinica.id_historia_clinica > 0;
    alertaConfirmarFormulario(
      actualizar ? '¿Actualizar historia clínica?' : '¿Registrar historia clínica?',
      actualizar
        ? 'Confirma que deseas guardar los cambios de la historia clínica.'
        : 'Confirma que deseas registrar la historia clínica de este paciente.',
      actualizar ? 'Actualizar' : 'Guardar'
    ).then(resultado => {
      if (resultado.isConfirmed) this.ejecutarGuardarHistoriaClinica();
    });
  }

  private ejecutarGuardarHistoriaClinica(): void {

    if (
      this.historiaClinica.id_historia_clinica > 0 &&
      this.historiaOriginal &&
      !this.huboCambios(this.historiaOriginal, this.historiaClinica, [
        'fecha_apertura', 'antecedentes', 'alergias', 'observaciones', 'estado'
      ])
    ) {
      alertaAdvertencia(
        'Sin cambios',
        'No modificaste ningún campo de la historia clínica.'
      );
      return;
    }

    const antecedentes =
      this.historiaClinica.antecedentes?.trim() || '';

    const alergias =
      this.historiaClinica.alergias?.trim() || '';

    const observaciones =
      this.historiaClinica.observaciones?.trim() || '';

    if (!antecedentes) {
      alertaAdvertencia(
        'Campo requerido',
        'Debes registrar los antecedentes del paciente.'
      );
      return;
    }

    if (!alergias) {
      alertaAdvertencia(
        'Campo requerido',
        'Debes registrar las alergias del paciente.'
      );
      return;
    }

    if (!observaciones) {
      alertaAdvertencia(
        'Campo requerido',
        'Debes registrar las observaciones clínicas del paciente.'
      );
      return;
    }

    const datos = {


      fecha_apertura:
        this.historiaClinica.fecha_apertura ||
        this.obtenerFechaActual(),

      antecedentes:
        antecedentes,

      alergias:
        alergias,

      observaciones:
        observaciones,

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

    if (!this.paciente || !this.paciente.id_paciente || this.paciente.id_paciente <= 0) {
      faltantes.push('Información básica del paciente');
    }
    if (!this.elementosPaciente || this.elementosPaciente.length === 0) {
      faltantes.push('Elementos del paciente');
    }
    if (!this.cuidados || !this.cuidados.id_cuidado || this.cuidados.id_cuidado <= 0) {
      faltantes.push('Cuidados de enfermería');
    }
    if (!this.recomendaciones || !this.recomendaciones.id_recomendacion || this.recomendaciones.id_recomendacion <= 0) {
      faltantes.push('Recomendaciones');
    }
    if (!this.historiaClinica || !this.historiaClinica.id_historia_clinica || this.historiaClinica.id_historia_clinica <= 0) {
      faltantes.push('Historia clínica');
    }

    if (faltantes.length > 0) {
      alertaAdvertencia(
        'Registro incompleto',
        `Aún faltan apartados por completar: ${faltantes.join(', ')}.`
      );
      return;
    }

    if (this.registroFacialCompletado) {
      this.mostrarFinalizacionExitosa();
      return;
    }

    alertaConfirmarFormulario(
      '¿Finalizar registro?',
      'Se guardarán las fotografías faciales del paciente junto con la información registrada.',
      'Sí, finalizar'
    ).then((resultado: any) => {
      if (!resultado.isConfirmed) return;
      this.guardarRegistroFacial();
    });
  }

}
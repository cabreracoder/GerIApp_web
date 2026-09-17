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
  // PACIENTE
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
  cargandoCuidados = false;
  cargandoRecomendaciones = false;
  cargandoHistoria = false;


  // ============================================================
  // CATÁLOGOS
  // ============================================================

  medicamentos: Medicamento[] = [];
  insumos: Insumo[] = [];


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

    console.log('ID del paciente recibido:', this.idPaciente);

    // Actualizamos el ID dentro del objeto paciente
    this.paciente.id_paciente = this.idPaciente;

    // Cada vez que cambia el paciente,
    // volvemos a cargar toda su información.
    this.cargarInformacionPaciente();
    this.cargarFamiliarResponsable();
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
          this.cdr.detectChanges();

          console.log(
            'Paciente cargado:',
            respuesta
          );

          this.cargandoPaciente = false;

          // Cuando tengamos el endpoint exacto del
          // familiar responsable se llamará aquí.
          //
          // this.cargarFamiliarResponsable();
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
  // CARGAR INFORMACIÓN DEL FAMILIAR
  // ============================================================

  private cargarFamiliarResponsable(): void {
  if (!this.idPaciente || this.idPaciente <= 0) {
    console.error('❌ No se puede cargar el familiar: ID de paciente inválido.');
    return;
  }

  const idPaciente = this.idPaciente;

  console.log('======================================');
  console.log('🔎 BUSCANDO FAMILIAR RESPONSABLE');
  console.log('ID PACIENTE:', idPaciente);
  console.log('======================================');

  this.http.get<FamiliarResponsable[]>(
    `${this.apiUrl}/familiar_responsable/`
  ).subscribe({
    next: (respuesta) => {
      console.log('📋 Familiares recibidos:', respuesta);

      const familiar = respuesta.find(
        item => Number(item.id_paciente) === idPaciente
      );

      if (familiar) {
        this.familiarResponsable = familiar;

        console.log('✅ FAMILIAR RESPONSABLE ENCONTRADO:');
        console.log('Nombre:', familiar.nombres);
        console.log('Apellido:', familiar.apellidos);
        console.log('Parentesco:', familiar.parentesco);
        console.log('Teléfono:', familiar.telefono_uno);
      } else {
        this.familiarResponsable = null;

        console.log(
          'ℹ️ El paciente',
          idPaciente,
          'no tiene familiar responsable registrado.'
        );
      }

      this.cdr.detectChanges();
    },

    error: (error) => {
      console.error('❌ ERROR AL CARGAR FAMILIAR RESPONSABLE');
      console.error('Status:', error.status);
      console.error('Mensaje:', error.message);
      console.error('Error completo:', error);

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

    this.cargarInsumos();
  }


  // ============================================================
  // CARGAR MEDICAMENTOS
  // ============================================================

  cargarMedicamentos(): void {

    this.cargandoMedicamentos = true;

    this.http
      .get<Medicamento[]>(
        `${this.apiUrl}/medicamentos/`
      )
      .subscribe({

        next: (respuesta) => {

          this.medicamentos = respuesta;

          console.log(
            'Medicamentos cargados:',
            respuesta
          );

          this.cargandoMedicamentos = false;
        },

        error: (error) => {

          console.error(
            'Error al cargar medicamentos:',
            error
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
  // CARGAR INSUMOS
  // ============================================================

  cargarInsumos(): void {

    this.cargandoInsumos = true;

    this.http
      .get<Insumo[]>(
        `${this.apiUrl}/insumos/`
      )
      .subscribe({

        next: (respuesta) => {

          this.insumos = respuesta;

          console.log(
            'Insumos cargados:',
            respuesta
          );

          this.cargandoInsumos = false;
        },

        error: (error) => {

          console.error(
            'Error al cargar insumos:',
            error
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
  // CARGAR ELEMENTOS DEL PACIENTE
  // ============================================================

  cargarElementosPaciente(): void {

    this.cargandoElementos = true;

    this.http
      .get<ElementoPaciente[]>(
        `${this.apiUrl}/elementos_paciente/`
      )
      .subscribe({

        next: (respuesta) => {

          this.elementosPaciente =
            respuesta.filter(
              elemento =>
                Number(
                  this.obtenerIdRelacion(
                    elemento.id_paciente
                  )
                ) === this.idPaciente
            );

          console.log(
            'Elementos del paciente:',
            this.elementosPaciente
          );

          this.cargandoElementos = false;
        },

        error: (error) => {

          console.error(
            'Error al cargar elementos:',
            error
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
  // OBTENER ID DE UNA RELACIÓN
  // ============================================================

  private obtenerIdRelacion(
    relacion:
      number |
      {
        id_paciente?: number;
        id_usuario?: number;
        id_medicamentos?: number;
        id_insumo?: number;
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
      typeof relacion === 'object'
    ) {

      if (
        relacion.id_paciente !== undefined
      ) {
        return Number(
          relacion.id_paciente
        );
      }
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

    this.abrirFormularioElemento();
  }


  // ============================================================
  // REGISTRAR INSUMO
  // ============================================================

  registrarInsumo(): void {

    this.tipoElemento =
      'insumo';

    this.mostrarMenuElementos =
      false;

    this.abrirFormularioElemento();
  }


  // ============================================================
  // ABRIR FORMULARIO DE ELEMENTO
  // ============================================================

  abrirFormularioElemento(): void {

    this.elementoEditando =
      null;

    this.formularioElemento = {

      id_medicamentos: null,

      id_insumo: null,

      cantidad: 1,

      fecha_ingreso:
        this.obtenerFechaActual(),

      fecha_vencimiento: '',

      observaciones: '',

      estado: true
    };

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

    this.formularioElemento = {

      id_medicamentos:
        esMedicamento
          ? this.obtenerIdMedicamento(
              elemento.id_medicamentos
            )
          : null,

      id_insumo:
        !esMedicamento
          ? this.obtenerIdInsumo(
              elemento.id_insumo
            )
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

    this.mostrarFormularioElemento =
      true;
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
  // GUARDAR ELEMENTO
  // ============================================================

  guardarElemento(): void {

    if (
      this.formularioElemento.cantidad <= 0
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
        Number(
          this.formularioElemento.cantidad
        ),

      fecha_ingreso:
        this.formularioElemento.fecha_ingreso,

      fecha_vencimiento:
        this.formularioElemento.fecha_vencimiento ||
        null,

      observaciones:
        this.formularioElemento.observaciones ||
        null,

      estado:
        this.formularioElemento.estado,

      id_paciente:
        this.idPaciente,

      id_medicamentos:
        this.tipoElemento === 'medicamento'
          ? this.formularioElemento.id_medicamentos
          : null,

      id_insumo:
        this.tipoElemento === 'insumo'
          ? this.formularioElemento.id_insumo
          : null
    };

    console.log(
      'Datos enviados al API:',
      datos
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

          next: () => {

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

          Swal.fire({
            icon: 'success',
            title: 'Elemento registrado',
            text:
              'El elemento se registró correctamente.',
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
  // CARGAR CUIDADOS
  // ============================================================

  cargarCuidados(): void {

    this.cargandoCuidados = true;

    this.http
      .get<CuidadoEnfermeria[]>(
        `${this.apiUrl}/cuidados_enfermeria/`
      )
      .subscribe({

        next: (respuesta) => {

          const registro =
            respuesta.find(
              cuidado =>
                Number(
                  this.obtenerIdRelacion(
                    cuidado.id_paciente
                  )
                ) === this.idPaciente
            );

          if (registro) {

            this.cuidados =
              registro;

          } else {

            this.cuidados = {

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

          this.cargandoCuidados =
            false;
        },

        error: (error) => {

          console.error(
            'Error al cargar cuidados:',
            error
          );

          this.cargandoCuidados =
            false;
        }
      });
  }


  // ============================================================
  // GUARDAR CUIDADOS
  // ============================================================

  guardarCuidados(): void {

    const datos = {

      bano_paciente:
        this.cuidados.bano_paciente || null,

      peso_talla:
        this.cuidados.peso_talla || null,

      control_glucemia:
        this.cuidados.control_glucemia || null,

      curaciones:
        this.cuidados.curaciones || null,

      liquidos_administrados_eliminados:
        this.cuidados.liquidos_administrados_eliminados ||
        null,

      control_deposicion:
        this.cuidados.control_deposicion || null,

      administracion_medicamentos:
        this.cuidados.administracion_medicamentos ||
        null,

      id_paciente:
        this.idPaciente
    };


    if (
      this.cuidados.id_cuidado > 0
    ) {

      this.http
        .patch(
          `${this.apiUrl}/cuidados_enfermeria/${this.cuidados.id_cuidado}/`,
          datos
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Cuidados actualizados',
              text:
                'La información se actualizó correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

            this.cargarCuidados();
          },

          error: (error) => {

            console.error(
              'Error al actualizar cuidados:',
              error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible actualizar los cuidados.'
            );
          }
        });

    } else {

      this.http
        .post(
          `${this.apiUrl}/cuidados_enfermeria/`,
          datos
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Cuidados registrados',
              text:
                'Los cuidados se registraron correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

            this.cargarCuidados();
          },

          error: (error) => {

            console.error(
              'Error al registrar cuidados:',
              error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible registrar los cuidados.'
            );
          }
        });
    }
  }


  // ============================================================
  // CARGAR RECOMENDACIONES
  // ============================================================

  cargarRecomendaciones(): void {

    this.cargandoRecomendaciones = true;

    this.http
      .get<Recomendacion[]>(
        `${this.apiUrl}/recomendaciones/`
      )
      .subscribe({

        next: (respuesta) => {

          const registro =
            respuesta.find(
              recomendacion =>
                Number(
                  this.obtenerIdRelacion(
                    recomendacion.id_paciente
                  )
                ) === this.idPaciente
            );

          if (registro) {

            this.recomendaciones =
              registro;

          } else {

            this.recomendaciones = {

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

          this.cargandoRecomendaciones =
            false;
        },

        error: (error) => {

          console.error(
            'Error al cargar recomendaciones:',
            error
          );

          this.cargandoRecomendaciones =
            false;
        }
      });
  }


  // ============================================================
  // GUARDAR RECOMENDACIONES
  // ============================================================

  guardarRecomendaciones(): void {

    const datos = {

      hidratar_piel:
        this.recomendaciones.hidratar_piel ||
        null,

      asistir_alimentacion:
        this.recomendaciones.asistir_alimentacion ||
        null,

      via_alimentacion:
        this.recomendaciones.via_alimentacion ||
        null,

      prevencion_caidas:
        this.recomendaciones.prevencion_caidas ||
        null,

      terapias_fisicas:
        this.recomendaciones.terapias_fisicas ||
        null,

      terapia_respiratoria:
        this.recomendaciones.terapia_respiratoria ||
        null,

      actividad_ocupacional:
        this.recomendaciones.actividad_ocupacional ||
        null,

      corte_unas:
        this.recomendaciones.corte_unas ||
        null,

      corte_cabello:
        this.recomendaciones.corte_cabello ||
        null,

      higiene_oral:
        this.recomendaciones.higiene_oral ||
        null,

      id_paciente:
        this.idPaciente
    };


    if (
      this.recomendaciones.id_recomendacion > 0
    ) {

      this.http
        .patch(
          `${this.apiUrl}/recomendaciones/${this.recomendaciones.id_recomendacion}/`,
          datos
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Recomendaciones actualizadas',
              text:
                'La información se actualizó correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

            this.cargarRecomendaciones();
          },

          error: (error) => {

            console.error(
              'Error al actualizar recomendaciones:',
              error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible actualizar las recomendaciones.'
            );
          }
        });

    } else {

      this.http
        .post(
          `${this.apiUrl}/recomendaciones/`,
          datos
        )
        .subscribe({

          next: () => {

            Swal.fire({
              icon: 'success',
              title: 'Recomendaciones registradas',
              text:
                'Las recomendaciones se registraron correctamente.',
              timer: 1800,
              showConfirmButton: false
            });

            this.cargarRecomendaciones();
          },

          error: (error) => {

            console.error(
              'Error al registrar recomendaciones:',
              error
            );

            this.mostrarErrorApi(
              error,
              'No fue posible registrar las recomendaciones.'
            );
          }
        });
    }
  }


  // ============================================================
  // CARGAR HISTORIA CLÍNICA
  // ============================================================

  cargarHistoriaClinica(): void {

    this.cargandoHistoria = true;

    this.http
      .get<HistoriaClinica[]>(
        `${this.apiUrl}/historia_clinicas/`
      )
      .subscribe({

        next: (respuesta) => {

          const registro =
            respuesta.find(
              historia =>
                Number(
                  this.obtenerIdRelacion(
                    historia.id_paciente
                  )
                ) === this.idPaciente
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

    const segundos =
      String(
        ahora.getSeconds()
      ).padStart(2, '0');

    return `${año}-${mes}-${dia}T${horas}:${minutos}:${segundos}`;
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
            ([campo, valor]: [string, any]) =>
              `${campo}: ${
                Array.isArray(valor)
                  ? valor.join(', ')
                  : valor
              }`
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
    | number
    | {
        id_paciente?: number;
      }
    | null;
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
    } |
    null;

  id_insumo:
    number |
    {
      id_insumo?: number;
    } |
    null;
}


// ============================================================
// FORMULARIO ELEMENTO
// ============================================================

interface FormularioElemento {

  id_medicamentos: number | null;

  id_insumo: number | null;

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
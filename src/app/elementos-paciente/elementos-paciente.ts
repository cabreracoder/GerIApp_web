import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

const API_URL = 'http://127.0.0.1:8000/api';

interface Medicamento {
  id_medicamentos: number;
  nombre: string;
  vencimiento: string;
  descripcion: string;
  principio_activo: string;
  concentracion: string;
  presentacion: string;
  estado: boolean;
  unidad_medida: string;
}

interface TipoInsumo {
  id_tipo_insumo: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

interface Insumo {
  id_insumo: number;
  id_tipo_insumo: number | null;
  nombre: string;
  descripcion: string;
  unidad_medida: string;
  estado: boolean;
}

interface ElementoPaciente {
  id_elemento: number;
  cantidad: number;
  fecha_ingreso: string;
  fecha_vencimiento: string | null;
  observaciones: string | null;
  estado: boolean | null;
  id_paciente: number | null;
  id_medicamentos: number | null;
  id_insumo: number | null;
}

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

  // =====================================================
  // ESTADO DEL MODAL
  // =====================================================

  formularioAbierto = false;

  tipoElemento = '';

  vistaRegistro: 'seleccion' | 'formulario' = 'seleccion';

  // =====================================================
  // PACIENTE
  // =====================================================

  idPaciente: number | null = null;

  // =====================================================
  // ELEMENTOS REGISTRADOS
  // =====================================================

  elementos: ElementoPaciente[] = [];

  cargando = false;

  // =====================================================
  // MEDICAMENTOS
  // =====================================================

  medicamentos: Medicamento[] = [];

  medicamentoSeleccionado: number | null = null;

  cargandoMedicamentos = false;

  // =====================================================
  // TIPOS DE INSUMO
  // =====================================================

  tiposInsumo: TipoInsumo[] = [];

  tipoInsumoSeleccionado: number | null = null;

  cargandoTiposInsumo = false;

  // =====================================================
  // INSUMOS
  // =====================================================

  insumos: Insumo[] = [];

  insumoSeleccionado: number | null = null;

  cargandoInsumos = false;

  // =====================================================
  // DATOS DEL REGISTRO
  // =====================================================

  cantidad: number | null = null;

  fechaIngreso = '';

  fechaVencimiento = '';

  observaciones = '';

  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  // =====================================================
  // INICIO
  // =====================================================

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {

      this.idPaciente = Number(id);

      console.log('ID DEL PACIENTE:', this.idPaciente);

      this.cargarElementos();

    } else {

      console.error('No se recibió el ID del paciente.');

      Swal.fire({
        icon: 'error',
        title: 'Paciente no identificado',
        text: 'No fue posible obtener el paciente.'
      });
    }
  }

  // =====================================================
  // ABRIR MODAL
  // =====================================================

  abrirFormulario(): void {

    this.formularioAbierto = true;

    this.vistaRegistro = 'seleccion';

    this.tipoElemento = '';

    this.limpiarFormulario();
  }

  // =====================================================
  // CERRAR MODAL
  // =====================================================

  cerrarFormulario(): void {

    this.formularioAbierto = false;

    this.vistaRegistro = 'seleccion';

    this.tipoElemento = '';

    this.limpiarFormulario();
  }

  // =====================================================
  // SELECCIONAR TIPO
  // =====================================================

  seleccionarTipo(tipo: 'medicamento' | 'insumo'): void {

    this.tipoElemento = tipo;
  }

  // =====================================================
  // CONTINUAR REGISTRO
  // =====================================================

  continuarRegistro(): void {

    if (
      this.tipoElemento !== 'medicamento' &&
      this.tipoElemento !== 'insumo'
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un tipo',
        text: 'Debe seleccionar un medicamento o un insumo.'
      });

      return;
    }

    if (this.idPaciente === null) {

      Swal.fire({
        icon: 'error',
        title: 'Paciente no identificado',
        text: 'No se encontró el paciente asociado.'
      });

      return;
    }

    this.vistaRegistro = 'formulario';

    if (this.tipoElemento === 'medicamento') {

      this.cargarMedicamentos();

    } else {

      this.cargarTiposInsumo();
      this.cargarInsumos();
    }
  }

  // =====================================================
  // VOLVER A LA SELECCIÓN
  // =====================================================

  volverSeleccion(): void {

    this.vistaRegistro = 'seleccion';

    this.limpiarFormulario();
  }

  // =====================================================
  // CARGAR ELEMENTOS DEL PACIENTE
  // =====================================================

  cargarElementos(): void {

    this.cargando = true;

    this.http.get<ElementoPaciente[]>(
      `${API_URL}/elementos_paciente/`
    ).subscribe({

      next: (respuesta) => {

        console.log('ELEMENTOS RECIBIDOS:', respuesta);

        if (this.idPaciente !== null) {

          this.elementos = respuesta.filter(
            elemento =>
              elemento.id_paciente === this.idPaciente
          );

        } else {

          this.elementos = [];
        }

        console.log(
          'ELEMENTOS DEL PACIENTE:',
          this.elementos
        );

        this.cargando = false;
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR ELEMENTOS:',
          error
        );

        this.cargando = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible cargar los elementos del paciente.'
        });
      }
    });
  }

  // =====================================================
  // CARGAR MEDICAMENTOS
  // =====================================================

  cargarMedicamentos(): void {

    this.cargandoMedicamentos = true;

    this.http.get<Medicamento[]>(
      `${API_URL}/medicamentos/`
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'MEDICAMENTOS RECIBIDOS:',
          respuesta
        );

        this.medicamentos = respuesta.filter(
          medicamento => medicamento.estado === true
        );

        this.cargandoMedicamentos = false;
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR MEDICAMENTOS:',
          error
        );

        this.cargandoMedicamentos = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible cargar los medicamentos.'
        });
      }
    });
  }

  // =====================================================
  // CARGAR TIPOS DE INSUMO
  // =====================================================

  cargarTiposInsumo(): void {
  this.cargandoTiposInsumo = true;

  this.http.get<TipoInsumo[]>(
    `${API_URL}/tipo_insumo/`
  ).subscribe({
    next: (respuesta) => {
      console.log('TIPOS DE INSUMO RECIBIDOS:', respuesta);

      this.tiposInsumo = respuesta;

      this.cargandoTiposInsumo = false;
    },
    error: (error) => {
      console.error('ERROR AL CARGAR TIPOS DE INSUMO:', error);

      this.cargandoTiposInsumo = false;

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No fue posible cargar los tipos de insumo.'
      });
    }
  });
}

  // =====================================================
  // CARGAR INSUMOS
  // =====================================================

  cargarInsumos(): void {

    this.cargandoInsumos = true;

    this.http.get<Insumo[]>(
      `${API_URL}/insumos/`
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'INSUMOS RECIBIDOS:',
          respuesta
        );

        this.insumos = respuesta.filter(
          insumo => insumo.estado === true
        );

        this.cargandoInsumos = false;
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR INSUMOS:',
          error
        );

        this.cargandoInsumos = false;

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No fue posible cargar los insumos.'
        });
      }
    });
  }

  // =====================================================
  // FILTRAR INSUMOS POR TIPO
  // =====================================================

  obtenerInsumosPorTipo(): Insumo[] {

    if (this.tipoInsumoSeleccionado === null) {

      return this.insumos;
    }

    return this.insumos.filter(
      insumo =>
        insumo.id_tipo_insumo === this.tipoInsumoSeleccionado
    );
  }

  // =====================================================
  // REGISTRAR ELEMENTO
  // =====================================================

  registrarElemento(): void {

    // ---------------------------------------------------
    // VALIDAR PACIENTE
    // ---------------------------------------------------

    if (this.idPaciente === null) {

      Swal.fire({
        icon: 'error',
        title: 'Paciente no identificado',
        text: 'No fue posible identificar el paciente.'
      });

      return;
    }

    // ---------------------------------------------------
    // VALIDAR CANTIDAD
    // ---------------------------------------------------

    if (
      this.cantidad === null ||
      this.cantidad <= 0
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'Ingrese una cantidad mayor que cero.'
      });

      return;
    }

    // ---------------------------------------------------
    // VALIDAR MEDICAMENTO
    // ---------------------------------------------------

    if (
      this.tipoElemento === 'medicamento' &&
      this.medicamentoSeleccionado === null
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un medicamento',
        text: 'Debe seleccionar el medicamento que desea registrar.'
      });

      return;
    }

    // ---------------------------------------------------
    // VALIDAR INSUMO
    // ---------------------------------------------------

    if (
      this.tipoElemento === 'insumo' &&
      this.insumoSeleccionado === null
    ) {

      Swal.fire({
        icon: 'warning',
        title: 'Seleccione un insumo',
        text: 'Debe seleccionar el insumo que desea registrar.'
      });

      return;
    }

    // ---------------------------------------------------
    // VALIDAR FECHA DE INGRESO
    // ---------------------------------------------------

    if (!this.fechaIngreso) {

      Swal.fire({
        icon: 'warning',
        title: 'Fecha requerida',
        text: 'Debe ingresar la fecha de ingreso.'
      });

      return;
    }

    // ---------------------------------------------------
    // CREAR DATOS PARA LA API
    // ---------------------------------------------------

    const datos: any = {

      cantidad: this.cantidad,

      fecha_ingreso:
        this.fechaIngreso.length === 16
          ? `${this.fechaIngreso}:00`
          : this.fechaIngreso,

      fecha_vencimiento:
        this.fechaVencimiento
          ? this.fechaVencimiento
          : null,

      observaciones:
        this.observaciones.trim()
          ? this.observaciones.trim()
          : null,

      estado: true,

      id_paciente: this.idPaciente,

      id_medicamentos:
        this.tipoElemento === 'medicamento'
          ? this.medicamentoSeleccionado
          : null,

      id_insumo:
        this.tipoElemento === 'insumo'
          ? this.insumoSeleccionado
          : null
    };

    console.log(
      'DATOS QUE SE ENVIARÁN:',
      datos
    );

    // ---------------------------------------------------
    // GUARDAR
    // ---------------------------------------------------

    this.guardando = true;

    this.http.post(
      `${API_URL}/elementos_paciente/`,
      datos
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'ELEMENTO REGISTRADO:',
          respuesta
        );

        this.guardando = false;

        Swal.fire({
          icon: 'success',
          title: 'Registro exitoso',
          text:
            this.tipoElemento === 'medicamento'
              ? 'El medicamento fue registrado correctamente.'
              : 'El insumo fue registrado correctamente.',
          confirmButtonText: 'Aceptar'
        });

        this.cerrarFormulario();

        this.cargarElementos();
      },

      error: (error) => {

        console.error(
          'ERROR AL REGISTRAR ELEMENTO:',
          error
        );

        this.guardando = false;

        let mensaje =
          'No fue posible registrar el elemento.';

        if (error.error) {

          console.error(
            'DETALLE DEL ERROR:',
            error.error
          );

          if (typeof error.error === 'object') {

            mensaje = Object.entries(error.error)
              .map(
                ([campo, errores]: [string, any]) =>
                  `${campo}: ${
                    Array.isArray(errores)
                      ? errores.join(', ')
                      : errores
                  }`
              )
              .join('\n');
          }
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: mensaje
        });
      }
    });
  }

  // =====================================================
  // LIMPIAR FORMULARIO
  // =====================================================

  limpiarFormulario(): void {

    this.medicamentoSeleccionado = null;

    this.tipoInsumoSeleccionado = null;

    this.insumoSeleccionado = null;

    this.cantidad = null;

    this.fechaIngreso = '';

    this.fechaVencimiento = '';

    this.observaciones = '';
  }

  // =====================================================
  // OBTENER TIPO DEL ELEMENTO
  // =====================================================

  obtenerTipo(elemento: ElementoPaciente): string {

    if (elemento.id_medicamentos !== null) {

      return 'Medicamento';
    }

    if (elemento.id_insumo !== null) {

      return 'Insumo';
    }

    return 'Sin tipo';
  }

  // =====================================================
  // OBTENER NOMBRE DEL MEDICAMENTO
  // =====================================================

  obtenerNombreMedicamento(
    id: number | null
  ): string {

    if (id === null) {

      return 'Sin medicamento';
    }

    const medicamento =
      this.medicamentos.find(
        item =>
          item.id_medicamentos === id
      );

    return medicamento
      ? medicamento.nombre
      : `Medicamento #${id}`;
  }

  // =====================================================
  // OBTENER NOMBRE DEL INSUMO
  // =====================================================

  obtenerNombreInsumo(
    id: number | null
  ): string {

    if (id === null) {

      return 'Sin insumo';
    }

    const insumo =
      this.insumos.find(
        item =>
          item.id_insumo === id
      );

    return insumo
      ? insumo.nombre
      : `Insumo #${id}`;
  }
}


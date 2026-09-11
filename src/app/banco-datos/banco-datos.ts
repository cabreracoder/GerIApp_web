import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Catalogo {
  nombre: string;
  icono: string;
}

interface Medicamento {
  id_medicamentos?: number;
  nombre: string;
  vencimiento: string;
  descripcion: string;
  principio_activo: string;
  concentracion: string;
  presentacion: string;
  estado: boolean;
  unidad_medida: string;
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

  constructor(
    private http: HttpClient
  ) {}

  // =========================================================
  // URL BASE DE LA API
  // =========================================================

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  // =========================================================
  // CATÁLOGOS
  // =========================================================

  catalogos: Catalogo[] = [
    {
      nombre: 'Medicamentos',
      icono: 'medication'
    },
    {
      nombre: 'Insumos',
      icono: 'inventory_2'
    },
    {
      nombre: 'Tipos de insumo',
      icono: 'category'
    },
    {
      nombre: 'Tipos de emergencia',
      icono: 'emergency'
    },
    {
      nombre: 'Tipos de evento',
      icono: 'event'
    },
    {
      nombre: 'Enfermedades',
      icono: 'healing'
    },
    {
      nombre: 'Permisos',
      icono: 'lock'
    },
    {
      nombre: 'Turnos',
      icono: 'schedule'
    }
  ];

  catalogoSeleccionado = 'Medicamentos';

  // =========================================================
  // MEDICAMENTOS
  // =========================================================

  medicamentos: Medicamento[] = [];

  cargandoMedicamentos = false;

  mostrandoFormulario = false;

  modoEdicion = false;

  mensajeExito = '';

  mensajeError = '';

  medicamentoActual: Medicamento =
    this.crearMedicamentoVacio();

  // =========================================================
  // INICIALIZACIÓN
  // =========================================================

  ngOnInit(): void {
    this.cargarMedicamentos();
  }

  // =========================================================
  // CREAR MEDICAMENTO VACÍO
  // =========================================================

  crearMedicamentoVacio(): Medicamento {
    return {
      nombre: '',
      vencimiento: '',
      descripcion: '',
      principio_activo: '',
      concentracion: '',
      presentacion: '',
      estado: true,
      unidad_medida: ''
    };
  }

  // =========================================================
  // SELECCIONAR CATÁLOGO
  // =========================================================

  seleccionarCatalogo(nombre: string): void {
    this.catalogoSeleccionado = nombre;

    this.mensajeExito = '';
    this.mensajeError = '';

    if (nombre === 'Medicamentos') {
      this.cargarMedicamentos();
    }
  }

  // =========================================================
  // DESPLAZAMIENTO HORIZONTAL
  // =========================================================

  desplazarHorizontal(event: WheelEvent): void {

    const elemento =
      event.currentTarget as HTMLElement;

    if (!elemento) {
      return;
    }

    const tieneDesplazamiento =
      elemento.scrollWidth >
      elemento.clientWidth;

    if (!tieneDesplazamiento) {
      return;
    }

    elemento.scrollLeft += event.deltaY;

    event.preventDefault();
  }

  // =========================================================
  // CARGAR MEDICAMENTOS
  // =========================================================

  cargarMedicamentos(): void {

    this.cargandoMedicamentos = true;

    this.mensajeError = '';

    this.http
      .get<Medicamento[]>(
        `${this.apiUrl}/medicamentos/`
      )
      .subscribe({

        next: (respuesta) => {

          this.medicamentos =
            respuesta;

          this.cargandoMedicamentos =
            false;
        },

        error: (error) => {

          console.error(
            'Error al cargar medicamentos:',
            error
          );

          this.cargandoMedicamentos =
            false;

          this.mensajeError =
            'No fue posible cargar los medicamentos.';
        }

      });
  }

  // =========================================================
  // ABRIR NUEVO MEDICAMENTO
  // =========================================================

  abrirNuevoMedicamento(): void {

    this.modoEdicion = false;

    this.medicamentoActual =
      this.crearMedicamentoVacio();

    this.mensajeExito = '';
    this.mensajeError = '';

    this.mostrandoFormulario = true;
  }

  // =========================================================
  // EDITAR MEDICAMENTO
  // =========================================================

  editarMedicamento(
    medicamento: Medicamento
  ): void {

    this.modoEdicion = true;

    this.medicamentoActual = {
      ...medicamento
    };

    this.mensajeExito = '';
    this.mensajeError = '';

    this.mostrandoFormulario = true;
  }

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  cerrarFormulario(): void {

    this.mostrandoFormulario =
      false;

    this.modoEdicion =
      false;

    this.medicamentoActual =
      this.crearMedicamentoVacio();

    this.mensajeError = '';
  }

  // =========================================================
  // GUARDAR MEDICAMENTO
  // =========================================================

  guardarMedicamento(): void {

    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.validarMedicamento()) {
      return;
    }

    if (
      this.modoEdicion &&
      this.medicamentoActual.id_medicamentos
    ) {

      this.actualizarMedicamento();

    } else {

      this.crearMedicamento();
    }
  }

  // =========================================================
  // VALIDAR MEDICAMENTO
  // =========================================================

  validarMedicamento(): boolean {

    if (
      !this.medicamentoActual.nombre.trim()
    ) {

      this.mensajeError =
        'El nombre del medicamento es obligatorio.';

      return false;
    }

    if (
      !this.medicamentoActual.principio_activo.trim()
    ) {

      this.mensajeError =
        'El principio activo es obligatorio.';

      return false;
    }

    if (
      !this.medicamentoActual.concentracion.trim()
    ) {

      this.mensajeError =
        'La concentración es obligatoria.';

      return false;
    }

    if (
      !this.medicamentoActual.presentacion.trim()
    ) {

      this.mensajeError =
        'La presentación es obligatoria.';

      return false;
    }

    if (
      !this.medicamentoActual.unidad_medida.trim()
    ) {

      this.mensajeError =
        'La unidad de medida es obligatoria.';

      return false;
    }

    if (
      !this.medicamentoActual.vencimiento
    ) {

      this.mensajeError =
        'La fecha de vencimiento es obligatoria.';

      return false;
    }

    return true;
  }

  // =========================================================
  // CREAR MEDICAMENTO
  // =========================================================

  crearMedicamento(): void {

    const datos = {

      nombre:
        this.medicamentoActual.nombre.trim(),

      vencimiento:
        this.medicamentoActual.vencimiento,

      descripcion:
        this.medicamentoActual.descripcion.trim(),

      principio_activo:
        this.medicamentoActual.principio_activo.trim(),

      concentracion:
        this.medicamentoActual.concentracion.trim(),

      presentacion:
        this.medicamentoActual.presentacion.trim(),

      estado:
        this.medicamentoActual.estado,

      unidad_medida:
        this.medicamentoActual.unidad_medida.trim()
    };

    this.http
      .post<Medicamento>(
        `${this.apiUrl}/medicamentos/`,
        datos
      )
      .subscribe({

        next: () => {

          this.mensajeExito =
            'Medicamento creado correctamente.';

          this.mostrandoFormulario =
            false;

          this.cargarMedicamentos();
        },

        error: (error) => {

          console.error(
            'Error al crear medicamento:',
            error
          );

          this.mensajeError =
            this.obtenerMensajeError(
              error,
              'No fue posible crear el medicamento.'
            );
        }

      });
  }

  // =========================================================
  // ACTUALIZAR MEDICAMENTO
  // =========================================================

  actualizarMedicamento(): void {

    const id =
      this.medicamentoActual.id_medicamentos;

    if (!id) {
      return;
    }

    const datos = {

      nombre:
        this.medicamentoActual.nombre.trim(),

      vencimiento:
        this.medicamentoActual.vencimiento,

      descripcion:
        this.medicamentoActual.descripcion.trim(),

      principio_activo:
        this.medicamentoActual.principio_activo.trim(),

      concentracion:
        this.medicamentoActual.concentracion.trim(),

      presentacion:
        this.medicamentoActual.presentacion.trim(),

      estado:
        this.medicamentoActual.estado,

      unidad_medida:
        this.medicamentoActual.unidad_medida.trim()
    };

    this.http
      .patch<Medicamento>(
        `${this.apiUrl}/medicamentos/${id}/`,
        datos
      )
      .subscribe({

        next: () => {

          this.mensajeExito =
            'Medicamento actualizado correctamente.';

          this.mostrandoFormulario =
            false;

          this.cargarMedicamentos();
        },

        error: (error) => {

          console.error(
            'Error al actualizar medicamento:',
            error
          );

          this.mensajeError =
            this.obtenerMensajeError(
              error,
              'No fue posible actualizar el medicamento.'
            );
        }

      });
  }

  // =========================================================
  // ELIMINAR MEDICAMENTO
  // =========================================================

  eliminarMedicamento(
    medicamento: Medicamento
  ): void {

    if (!medicamento.id_medicamentos) {
      return;
    }

    const confirmar =
      window.confirm(
        `¿Está seguro de eliminar el medicamento "${medicamento.nombre}"?`
      );

    if (!confirmar) {
      return;
    }

    this.mensajeError = '';
    this.mensajeExito = '';

    this.http
      .delete(
        `${this.apiUrl}/medicamentos/${medicamento.id_medicamentos}/`
      )
      .subscribe({

        next: () => {

          this.mensajeExito =
            'Medicamento eliminado correctamente.';

          this.cargarMedicamentos();
        },

        error: (error) => {

          console.error(
            'Error al eliminar medicamento:',
            error
          );

          this.mensajeError =
            this.obtenerMensajeError(
              error,
              'No fue posible eliminar el medicamento.'
            );
        }

      });
  }

  // =========================================================
  // OBTENER MENSAJE DE ERROR
  // =========================================================

  obtenerMensajeError(
    error: any,
    mensajePredeterminado: string
  ): string {

    if (
      error?.error?.detail
    ) {
      return error.error.detail;
    }

    if (
      error?.error &&
      typeof error.error === 'object'
    ) {

      const errores =
        Object.values(error.error);

      if (errores.length > 0) {

        return errores
          .flat()
          .join(' ');
      }
    }

    return mensajePredeterminado;
  }

  // =========================================================
  // TRACKBY MEDICAMENTO
  // =========================================================

  trackByMedicamento(
    index: number,
    medicamento: Medicamento
  ): number {

    return medicamento.id_medicamentos ??
      index;
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../config/api.config';

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

  medicamentos: Medicamento[] = [];

  cargandoMedicamentos = false;

  mostrandoFormulario = false;

  modoEdicion = false;

  mensajeExito = '';

  mensajeError = '';

  medicamentoActual: Medicamento = this.crearMedicamentoVacio();

  ngOnInit(): void {
    this.cargarMedicamentos();
  }

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

  seleccionarCatalogo(nombre: string): void {
    this.catalogoSeleccionado = nombre;

    this.mensajeExito = '';
    this.mensajeError = '';

    if (nombre === 'Medicamentos') {
      this.cargarMedicamentos();
    }
  }

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

  cargarMedicamentos(): void {

    this.cargandoMedicamentos = true;

    this.mensajeError = '';

    this.http
      .get<Medicamento[]>(
        `${API_URL}/medicamentos/`
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

  abrirNuevoMedicamento(): void {

    this.modoEdicion = false;

    this.medicamentoActual =
      this.crearMedicamentoVacio();

    this.mensajeExito = '';
    this.mensajeError = '';

    this.mostrandoFormulario = true;
  }

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

  cerrarFormulario(): void {

    this.mostrandoFormulario =
      false;

    this.modoEdicion =
      false;

    this.medicamentoActual =
      this.crearMedicamentoVacio();

    this.mensajeError = '';
  }

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
        `${API_URL}/medicamentos/`,
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
        `${API_URL}/medicamentos/${id}/`,
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
        `${API_URL}/medicamentos/${medicamento.id_medicamentos}/`
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

  trackByMedicamento(
    index: number,
    medicamento: Medicamento
  ): number {

    return medicamento.id_medicamentos ??
      index;
  }
}

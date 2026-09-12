import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Catalogo {
  nombre: string;
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

interface TipoInsumo {
  id_tipo_insumo?: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

interface Insumo {
  id_insumo?: number;
  id_tipo_insumo: number | null;
  nombre: string;
  descripcion: string;
  unidad_medida: string;
  estado: boolean;
}

interface Permiso {
  id_permisos?: number;
  nombre: string;
  descripcion: string;
}

interface Turno {
  id_turno?: number;
  hora_inicio: string;
  hora_fin: string | null;
  estado: boolean;
  nombre: string;
  descripcion: string;
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

  // =========================================================
  // CATÁLOGOS
  // =========================================================

  catalogos: Catalogo[] = [
    {
      nombre: 'Medicamentos',
    },
    {
      nombre: 'Tipos de insumo',

    },
    {
      nombre: 'Insumos',
    },
    {
      nombre: 'Permisos',
     
    },
    {
      nombre: 'Turnos',
     
    }
  ];

  catalogoSeleccionado = 'Medicamentos';

  // =========================================================
  // ESTADOS GENERALES
  // =========================================================

  cargando = false;

  cargandoMedicamentos = false;
  cargandoTiposInsumo = false;
  cargandoInsumos = false;
  cargandoPermisos = false;
  cargandoTurnos = false;

  mensajeExito = '';
  mensajeError = '';

  // =========================================================
  // MEDICAMENTOS
  // =========================================================

  medicamentos: Medicamento[] = [];

  medicamentoForm: Medicamento = {
    nombre: '',
    vencimiento: '',
    descripcion: '',
    principio_activo: '',
    concentracion: '',
    presentacion: '',
    estado: true,
    unidad_medida: ''
  };

  medicamentoEditando: number | null = null;

  mostrandoFormulario = false;
  modoEdicion = false;

  // =========================================================
  // TIPOS DE INSUMO
  // =========================================================

  tiposInsumo: TipoInsumo[] = [];

  tipoInsumoForm: TipoInsumo = {
    nombre: '',
    descripcion: '',
    estado: 'Activo'
  };

  tipoInsumoEditando: number | null = null;

  mostrandoFormularioTipoInsumo = false;
  modoEdicionTipoInsumo = false;

  // =========================================================
  // INSUMOS
  // =========================================================

  insumos: Insumo[] = [];

  insumoForm: Insumo = {
    id_tipo_insumo: null,
    nombre: '',
    descripcion: '',
    unidad_medida: '',
    estado: true
  };

  insumoEditando: number | null = null;

  mostrandoFormularioInsumo = false;
  modoEdicionInsumo = false;

  // =========================================================
  // PERMISOS
  // =========================================================

  permisos: Permiso[] = [];

  permisoForm: Permiso = {
    nombre: '',
    descripcion: ''
  };

  permisoEditando: number | null = null;

  mostrandoFormularioPermiso = false;
  modoEdicionPermiso = false;

  // =========================================================
  // TURNOS
  // =========================================================

  turnos: Turno[] = [];

  turnoForm: Turno = {
    hora_inicio: '',
    hora_fin: null,
    estado: true,
    nombre: '',
    descripcion: ''
  };

  turnoEditando: number | null = null;

  mostrandoFormularioTurno = false;
  modoEdicionTurno = false;

  // =========================================================
  // COMPATIBILIDAD CON EL HTML
  // =========================================================
  // El HTML utiliza nombres como turnoActual,
  // pero internamente usamos turnoForm.
  // Estos getters/setters mantienen ambos nombres sincronizados.

  get medicamentoActual(): Medicamento {
    return this.medicamentoForm;
  }

  set medicamentoActual(valor: Medicamento) {
    this.medicamentoForm = valor;
  }

  get tipoInsumoActual(): TipoInsumo {
    return this.tipoInsumoForm;
  }

  set tipoInsumoActual(valor: TipoInsumo) {
    this.tipoInsumoForm = valor;
  }

  get insumoActual(): Insumo {
    return this.insumoForm;
  }

  set insumoActual(valor: Insumo) {
    this.insumoForm = valor;
  }

  get permisoActual(): Permiso {
    return this.permisoForm;
  }

  set permisoActual(valor: Permiso) {
    this.permisoForm = valor;
  }

  get turnoActual(): Turno {
    return this.turnoForm;
  }

  set turnoActual(valor: Turno) {
    this.turnoForm = valor;
  }

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {
    this.seleccionarCatalogo('Medicamentos');
  }

  // =========================================================
  // SELECCIONAR CATÁLOGO
  // =========================================================

  seleccionarCatalogo(nombre: string): void {
    this.catalogoSeleccionado = nombre;
    this.limpiarMensajes();
    this.cerrarTodosLosFormularios();

    switch (nombre) {

      case 'Medicamentos':
        this.cargarMedicamentos();
        break;

      case 'Tipos de insumo':
        this.cargarTiposInsumo();
        break;

      case 'Insumos':
        this.cargarTiposInsumo();
        this.cargarInsumos();
        break;

      case 'Permisos':
        this.cargarPermisos();
        break;

      case 'Turnos':
        this.cargarTurnos();
        break;
    }
  }

  // =========================================================
  // CERRAR TODOS LOS FORMULARIOS
  // =========================================================

  cerrarTodosLosFormularios(): void {
    this.mostrandoFormulario = false;
    this.mostrandoFormularioTipoInsumo = false;
    this.mostrandoFormularioInsumo = false;
    this.mostrandoFormularioPermiso = false;
    this.mostrandoFormularioTurno = false;

    this.modoEdicion = false;
    this.modoEdicionTipoInsumo = false;
    this.modoEdicionInsumo = false;
    this.modoEdicionPermiso = false;
    this.modoEdicionTurno = false;
  }

  // =========================================================
  // MEDICAMENTOS - ABRIR NUEVO
  // =========================================================

  abrirNuevoMedicamento(): void {
    this.limpiarFormularioMedicamento();
    this.limpiarMensajes();

    this.modoEdicion = false;
    this.mostrandoFormulario = true;
  }

  // =========================================================
  // MEDICAMENTOS - CERRAR
  // =========================================================

  cerrarFormulario(): void {
    this.limpiarFormularioMedicamento();
    this.mostrandoFormulario = false;
    this.modoEdicion = false;
    this.limpiarMensajes();
  }

  // =========================================================
  // MEDICAMENTOS - LISTAR
  // =========================================================

  cargarMedicamentos(): void {
    this.cargando = true;
    this.cargandoMedicamentos = true;

    this.http.get<Medicamento[]>(
      'https://geriapp-backend.onrender.com/api/medicamentos/'
    ).subscribe({
      next: (respuesta) => {
        this.medicamentos = respuesta || [];

        this.cargando = false;
        this.cargandoMedicamentos = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        this.cargando = false;
        this.cargandoMedicamentos = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los medicamentos.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // MEDICAMENTOS - GUARDAR
  // =========================================================

  guardarMedicamento(): void {
    this.limpiarMensajes();

    if (!this.validarMedicamento()) {
      return;
    }

    this.cargando = true;

    if (this.medicamentoEditando !== null) {

      this.http.patch(
        `https://geriapp-backend.onrender.com/api/medicamentos/${this.medicamentoEditando}/`,
        this.medicamentoForm
      ).subscribe({

        next: () => {
          Swal.fire({
            title: 'Actualizado',
            text: 'Medicamento actualizado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioMedicamento();
          this.mostrandoFormulario = false;
          this.modoEdicion = false;

          this.cargarMedicamentos();
        },

        error: (error) => {
          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo actualizar el medicamento.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });

    } else {

      this.http.post(
        'https://geriapp-backend.onrender.com/api/medicamentos/',
        this.medicamentoForm
      ).subscribe({

        next: () => {
          Swal.fire({
            title: 'Creado',
            text: 'Medicamento creado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioMedicamento();
          this.mostrandoFormulario = false;
          this.modoEdicion = false;

          this.cargarMedicamentos();
        },

        error: (error) => {
          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo crear el medicamento.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    }
  }

  // =========================================================
  // MEDICAMENTOS - EDITAR
  // =========================================================

  editarMedicamento(medicamento: Medicamento): void {

    this.medicamentoEditando =
      medicamento.id_medicamentos ?? null;

    this.medicamentoForm = {
      id_medicamentos: medicamento.id_medicamentos,
      nombre: medicamento.nombre,
      vencimiento: medicamento.vencimiento,
      descripcion: medicamento.descripcion,
      principio_activo: medicamento.principio_activo,
      concentracion: medicamento.concentracion,
      presentacion: medicamento.presentacion,
      estado: medicamento.estado,
      unidad_medida: medicamento.unidad_medida
    };

    this.limpiarMensajes();

    this.modoEdicion = true;
    this.mostrandoFormulario = true;
  }

  // =========================================================
  // MEDICAMENTOS - ELIMINAR
  // =========================================================

  eliminarMedicamento(medicamento: Medicamento): void {

    const id = medicamento.id_medicamentos;

    if (!id) {
      return;
    }

    Swal.fire({
      title: 'Eliminar medicamento',
      text: '¿Está seguro de eliminar este medicamento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `https://geriapp-backend.onrender.com/api/medicamentos/${id}/`
      ).subscribe({

        next: () => {
          Swal.fire({
            title: 'Eliminado',
            text: 'Medicamento eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.cargarMedicamentos();
        },

        error: (error) => {
          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo eliminar el medicamento.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    });
  }

  // =========================================================
  // MEDICAMENTOS - LIMPIAR
  // =========================================================

  cancelarEdicionMedicamento(): void {
    this.cerrarFormulario();
  }

  limpiarFormularioMedicamento(): void {

    this.medicamentoEditando = null;
    this.modoEdicion = false;

    this.medicamentoForm = {
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

  validarMedicamento(): boolean {

    if (!this.medicamentoForm.nombre.trim()) {
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El nombre del medicamento es obligatorio.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return false;
    }

    if (!this.medicamentoForm.principio_activo.trim()) {
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El principio activo es obligatorio.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return false;
    }

    return true;
  }

  // =========================================================
  // TIPOS DE INSUMO - ABRIR NUEVO
  // =========================================================

  abrirNuevoTipoInsumo(): void {

    this.limpiarFormularioTipoInsumo();
    this.limpiarMensajes();

    this.modoEdicionTipoInsumo = false;
    this.mostrandoFormularioTipoInsumo = true;
  }

  // =========================================================
  // TIPOS DE INSUMO - CERRAR
  // =========================================================

  cerrarFormularioTipoInsumo(): void {

    this.limpiarFormularioTipoInsumo();

    this.mostrandoFormularioTipoInsumo = false;
    this.modoEdicionTipoInsumo = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // TIPOS DE INSUMO - LISTAR
  // =========================================================

  cargarTiposInsumo(): void {

    this.cargandoTiposInsumo = true;

    this.http.get<TipoInsumo[]>(
      'https://geriapp-backend.onrender.com/api/tipo_insumo/'
    ).subscribe({

      next: (respuesta) => {

        this.tiposInsumo = respuesta || [];

        this.cargandoTiposInsumo = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        this.cargandoTiposInsumo = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los tipos de insumo.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // TIPOS DE INSUMO - GUARDAR
  // =========================================================

  guardarTipoInsumo(): void {

    this.limpiarMensajes();

    if (!this.tipoInsumoForm.nombre.trim()) {

      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El nombre del tipo de insumo es obligatorio.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    this.cargando = true;

    if (this.tipoInsumoEditando !== null) {

      this.http.patch(
        `https://geriapp-backend.onrender.com/api/tipo_insumo/${this.tipoInsumoEditando}/`,
        this.tipoInsumoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Actualizado',
            text: 'Tipo de insumo actualizado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioTipoInsumo();

          this.mostrandoFormularioTipoInsumo = false;
          this.modoEdicionTipoInsumo = false;

          this.cargarTiposInsumo();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo actualizar el tipo de insumo.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });

    } else {

      this.http.post(
        'https://geriapp-backend.onrender.com/api/tipo_insumo/',
        this.tipoInsumoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Creado',
            text: 'Tipo de insumo creado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioTipoInsumo();

          this.mostrandoFormularioTipoInsumo = false;
          this.modoEdicionTipoInsumo = false;

          this.cargarTiposInsumo();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo crear el tipo de insumo.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    }
  }

  // =========================================================
  // TIPOS DE INSUMO - EDITAR
  // =========================================================

  editarTipoInsumo(tipo: TipoInsumo): void {

    this.tipoInsumoEditando =
      tipo.id_tipo_insumo ?? null;

    this.tipoInsumoForm = {
      id_tipo_insumo: tipo.id_tipo_insumo,
      nombre: tipo.nombre,
      descripcion: tipo.descripcion,
      estado: tipo.estado
    };

    this.limpiarMensajes();

    this.modoEdicionTipoInsumo = true;
    this.mostrandoFormularioTipoInsumo = true;
  }

  // =========================================================
  // TIPOS DE INSUMO - ELIMINAR
  // =========================================================

  eliminarTipoInsumo(tipo: TipoInsumo): void {

    const id = tipo.id_tipo_insumo;

    if (!id) {
      return;
    }

    Swal.fire({
      title: 'Eliminar tipo de insumo',
      text: '¿Está seguro de eliminar este tipo de insumo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `https://geriapp-backend.onrender.com/api/tipo_insumo/${id}/`
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Eliminado',
            text: 'Tipo de insumo eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.cargarTiposInsumo();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo eliminar el tipo de insumo.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    });
  }

  cancelarEdicionTipoInsumo(): void {
    this.cerrarFormularioTipoInsumo();
  }

  limpiarFormularioTipoInsumo(): void {

    this.tipoInsumoEditando = null;
    this.modoEdicionTipoInsumo = false;

    this.tipoInsumoForm = {
      nombre: '',
      descripcion: '',
      estado: 'Activo'
    };
  }

  // =========================================================
  // INSUMOS - ABRIR NUEVO
  // =========================================================

  abrirNuevoInsumo(): void {

    this.limpiarFormularioInsumo();
    this.limpiarMensajes();

    this.modoEdicionInsumo = false;
    this.mostrandoFormularioInsumo = true;
  }

  // =========================================================
  // INSUMOS - CERRAR
  // =========================================================

  cerrarFormularioInsumo(): void {

    this.limpiarFormularioInsumo();

    this.mostrandoFormularioInsumo = false;
    this.modoEdicionInsumo = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // INSUMOS - LISTAR
  // =========================================================

  cargarInsumos(): void {

    this.cargandoInsumos = true;

    this.http.get<Insumo[]>(
      'https://geriapp-backend.onrender.com/api/insumos/'
    ).subscribe({

      next: (respuesta) => {

        this.insumos = respuesta || [];

        this.cargandoInsumos = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        this.cargandoInsumos = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los insumos.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // INSUMOS - GUARDAR
  // =========================================================
  guardarInsumo(): void {

    this.limpiarMensajes();

    if (!this.insumoForm.nombre.trim()) {

      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El nombre del insumo es obligatorio.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    if (!this.insumoForm.id_tipo_insumo) {

      Swal.fire({
        title: 'Campo obligatorio',
        text: 'Debe seleccionar un tipo de insumo.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    this.cargando = true;

    if (this.insumoEditando !== null) {

      this.http.patch(
        `https://geriapp-backend.onrender.com/api/insumos/${this.insumoEditando}/`,
        this.insumoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Actualizado',
            text: 'Insumo actualizado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioInsumo();

          this.mostrandoFormularioInsumo = false;
          this.modoEdicionInsumo = false;

          this.cargarInsumos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo actualizar el insumo.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });

    } else {

      this.http.post(
        'https://geriapp-backend.onrender.com/api/insumos/',
        this.insumoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Creado',
            text: 'Insumo creado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioInsumo();

          this.mostrandoFormularioInsumo = false;
          this.modoEdicionInsumo = false;

          this.cargarInsumos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo crear el insumo.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    }
  }

  // =========================================================
  // INSUMOS - EDITAR
  // =========================================================

  editarInsumo(insumo: Insumo): void {

    this.insumoEditando =
      insumo.id_insumo ?? null;

    this.insumoForm = {
      id_insumo: insumo.id_insumo,
      id_tipo_insumo: insumo.id_tipo_insumo,
      nombre: insumo.nombre,
      descripcion: insumo.descripcion,
      unidad_medida: insumo.unidad_medida,
      estado: insumo.estado
    };

    this.limpiarMensajes();

    this.modoEdicionInsumo = true;
    this.mostrandoFormularioInsumo = true;
  }

  // =========================================================
  // INSUMOS - ELIMINAR
  // =========================================================

  eliminarInsumo(insumo: Insumo): void {

    const id = insumo.id_insumo;

    if (!id) {
      return;
    }

    Swal.fire({
      title: 'Eliminar insumo',
      text: '¿Está seguro de eliminar este insumo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `https://geriapp-backend.onrender.com/api/insumos/${id}/`
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Eliminado',
            text: 'Insumo eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.cargarInsumos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo eliminar el insumo.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    });
  }

  cancelarEdicionInsumo(): void {
    this.cerrarFormularioInsumo();
  }

  limpiarFormularioInsumo(): void {

    this.insumoEditando = null;
    this.modoEdicionInsumo = false;

    this.insumoForm = {
      id_tipo_insumo: null,
      nombre: '',
      descripcion: '',
      unidad_medida: '',
      estado: true
    };
  }

  obtenerNombreTipoInsumo(
    idTipo: number | null
  ): string {

    if (!idTipo) {
      return 'Sin tipo';
    }

    const tipo = this.tiposInsumo.find(
      item => item.id_tipo_insumo === idTipo
    );

    return tipo?.nombre ?? 'Sin tipo';
  }

  // =========================================================
  // PERMISOS - ABRIR NUEVO
  // =========================================================

  abrirNuevoPermiso(): void {

    this.limpiarFormularioPermiso();
    this.limpiarMensajes();

    this.modoEdicionPermiso = false;
    this.mostrandoFormularioPermiso = true;
  }

  // =========================================================
  // PERMISOS - CERRAR
  // =========================================================

  cerrarFormularioPermiso(): void {

    this.limpiarFormularioPermiso();

    this.mostrandoFormularioPermiso = false;
    this.modoEdicionPermiso = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // PERMISOS - LISTAR
  // =========================================================

  cargarPermisos(): void {

    this.cargando = true;
    this.cargandoPermisos = true;

    this.http.get<Permiso[]>(
      'https://geriapp-backend.onrender.com/api/permisos/'
    ).subscribe({

      next: (respuesta) => {

        this.permisos = respuesta || [];

        this.cargando = false;
        this.cargandoPermisos = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        this.cargando = false;
        this.cargandoPermisos = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los permisos.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // PERMISOS - GUARDAR
  // =========================================================

  guardarPermiso(): void {

    this.limpiarMensajes();

    if (!this.permisoForm.nombre.trim()) {

      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El nombre del permiso es obligatorio.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    this.cargando = true;

    if (this.permisoEditando !== null) {

      this.http.patch(
        `https://geriapp-backend.onrender.com/api/permisos/${this.permisoEditando}/`,
        this.permisoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Actualizado',
            text: 'Permiso actualizado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioPermiso();

          this.mostrandoFormularioPermiso = false;
          this.modoEdicionPermiso = false;

          this.cargarPermisos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo actualizar el permiso.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });

    } else {

      this.http.post(
        'https://geriapp-backend.onrender.com/api/permisos/',
        this.permisoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Creado',
            text: 'Permiso creado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioPermiso();

          this.mostrandoFormularioPermiso = false;
          this.modoEdicionPermiso = false;

          this.cargarPermisos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo crear el permiso.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    }
  }

  // =========================================================
  // PERMISOS - EDITAR
  // =========================================================

  editarPermiso(permiso: Permiso): void {

    this.permisoEditando =
      permiso.id_permisos ?? null;

    this.permisoForm = {
      id_permisos: permiso.id_permisos,
      nombre: permiso.nombre,
      descripcion: permiso.descripcion
    };

    this.limpiarMensajes();

    this.modoEdicionPermiso = true;
    this.mostrandoFormularioPermiso = true;
  }

  // =========================================================
  // PERMISOS - ELIMINAR
  // =========================================================

  eliminarPermiso(permiso: Permiso): void {

    const id = permiso.id_permisos;

    if (!id) {
      return;
    }

    Swal.fire({
      title: 'Eliminar permiso',
      text: '¿Está seguro de eliminar este permiso?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `https://geriapp-backend.onrender.com/api/permisos/${id}/`
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Eliminado',
            text: 'Permiso eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.cargarPermisos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo eliminar el permiso.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    });
  }

  cancelarEdicionPermiso(): void {
    this.cerrarFormularioPermiso();
  }

  limpiarFormularioPermiso(): void {

    this.permisoEditando = null;
    this.modoEdicionPermiso = false;

    this.permisoForm = {
      nombre: '',
      descripcion: ''
    };
  }

  // =========================================================
  // TURNOS - ABRIR NUEVO
  // =========================================================

  abrirNuevoTurno(): void {

    this.limpiarFormularioTurno();
    this.limpiarMensajes();

    this.modoEdicionTurno = false;
    this.mostrandoFormularioTurno = true;
  }

  // =========================================================
  // TURNOS - CERRAR
  // =========================================================

  cerrarFormularioTurno(): void {

    this.limpiarFormularioTurno();

    this.mostrandoFormularioTurno = false;
    this.modoEdicionTurno = false;

    this.limpiarMensajes();
  }

  // =========================================================
  // TURNOS - LISTAR
  // =========================================================

  cargarTurnos(): void {

    this.cargando = true;
    this.cargandoTurnos = true;

    this.http.get<Turno[]>(
      'https://geriapp-backend.onrender.com/api/turnos/'
    ).subscribe({

      next: (respuesta) => {

        console.log('TURNOS RECIBIDOS:', respuesta);

        this.turnos = respuesta || [];

        this.cargando = false;
        this.cargandoTurnos = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('ERROR AL CARGAR TURNOS:', error);

        this.cargando = false;
        this.cargandoTurnos = false;

        this.mensajeError = this.obtenerMensajeError(
          error,
          'No se pudieron cargar los turnos.'
        );

        this.cdr.detectChanges();
      }
    });
  }

  // =========================================================
  // TURNOS - GUARDAR
  // =========================================================

  guardarTurno(): void {

    this.limpiarMensajes();

    if (!this.turnoForm.nombre.trim()) {

      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El nombre del turno es obligatorio.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    if (!this.turnoForm.hora_inicio) {

      Swal.fire({
        title: 'Campo obligatorio',
        text: 'La hora de inicio es obligatoria.',
        icon: 'warning',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    this.cargando = true;

    if (this.turnoEditando !== null) {

      this.http.patch(
        `https://geriapp-backend.onrender.com/api/turnos/${this.turnoEditando}/`,
        this.turnoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Actualizado',
            text: 'Turno actualizado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioTurno();

          this.mostrandoFormularioTurno = false;
          this.modoEdicionTurno = false;

          this.cargarTurnos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo actualizar el turno.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });

    } else {

      this.http.post(
        'https://geriapp-backend.onrender.com/api/turnos/',
        this.turnoForm
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Creado',
            text: 'Turno creado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.limpiarFormularioTurno();

          this.mostrandoFormularioTurno = false;
          this.modoEdicionTurno = false;

          this.cargarTurnos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo crear el turno.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    }
  }

  // =========================================================
  // TURNOS - EDITAR
  // =========================================================

  editarTurno(turno: Turno): void {

    this.turnoEditando =
      turno.id_turno ?? null;

    this.turnoForm = {
      id_turno: turno.id_turno,
      hora_inicio: turno.hora_inicio,
      hora_fin: turno.hora_fin,
      estado: turno.estado,
      nombre: turno.nombre,
      descripcion: turno.descripcion
    };

    this.limpiarMensajes();

    this.modoEdicionTurno = true;
    this.mostrandoFormularioTurno = true;
  }

  // =========================================================
  // TURNOS - ELIMINAR
  // =========================================================

  eliminarTurno(turno: Turno): void {

    const id = turno.id_turno;

    if (!id) {
      return;
    }

    Swal.fire({
      title: 'Eliminar turno',
      text: '¿Está seguro de eliminar este turno?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB'
    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.cargando = true;

      this.http.delete(
        `https://geriapp-backend.onrender.com/api/turnos/${id}/`
      ).subscribe({

        next: () => {

          Swal.fire({
            title: 'Eliminado',
            text: 'Turno eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3B5BDB'
          });

          this.cargarTurnos();
        },

        error: (error) => {

          this.cargando = false;

          Swal.fire({
            title: 'Error',
            text: this.obtenerMensajeError(error, 'No se pudo eliminar el turno.'),
            icon: 'error',
            confirmButtonColor: '#3B5BDB'
          });
        }
      });
    });
  }

  cancelarEdicionTurno(): void {
    this.cerrarFormularioTurno();
  }

  limpiarFormularioTurno(): void {

    this.turnoEditando = null;
    this.modoEdicionTurno = false;

    this.turnoForm = {
      hora_inicio: '',
      hora_fin: null,
      estado: true,
      nombre: '',
      descripcion: ''
    };
  }

  // =========================================================
  // MENSAJES
  // =========================================================

  limpiarMensajes(): void {

    this.mensajeExito = '';
    this.mensajeError = '';
  }

  // =========================================================
  // MANEJO DE ERRORES
  // =========================================================

  obtenerMensajeError(
    error: any,
    mensajePorDefecto: string
  ): string {

    if (!error) {
      return mensajePorDefecto;
    }

    if (error.error) {

      if (typeof error.error === 'string') {
        return error.error;
      }

      if (error.error.detail) {
        return error.error.detail;
      }

      if (error.error.message) {
        return error.error.message;
      }

      if (typeof error.error === 'object') {

        const mensajes: string[] = [];

        Object.keys(error.error).forEach(campo => {

          const valor = error.error[campo];

          if (Array.isArray(valor)) {

            mensajes.push(
              `${campo}: ${valor.join(', ')}`
            );

          } else {

            mensajes.push(
              `${campo}: ${valor}`
            );
          }
        });

        if (mensajes.length > 0) {
          return mensajes.join(' | ');
        }
      }
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor de Render.';
    }

    if (error.status === 400) {
      return 'Los datos enviados no son válidos.';
    }

    if (error.status === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }

    if (error.status === 500) {
      return 'El servidor presentó un error interno.';
    }

    return mensajePorDefecto;
  }
}
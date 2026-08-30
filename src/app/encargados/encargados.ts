
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


// =====================================================
// INTERFACES
// =====================================================

interface Encargado {
  id: number;
  documento: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaIngreso: string;
  ingresoTexto: string;
  cargo: string;
  area: string;
  descripcion: string;
  estado: 'Activo' | 'Inactivo';
  iniciales: string;
  foto?: string;
}

interface FormularioEncargado {
  documento: string;
  nombre: string;
  fechaIngreso: string;
  telefono: string;
  email: string;
  cargo: string;
  area: string;
  descripcion: string;
}

interface ErroresFormulario {
  documento: boolean;
  nombre: boolean;
  telefono: boolean;
  email: boolean;
  emailInvalido?: boolean;
  cargo: boolean;
  area: boolean;
}

interface RegistroCambio {
  id: number;
  fecha: string;
  usuario: string;
  accion:
    | 'Creación'
    | 'Actualización'
    | 'Activación'
    | 'Desactivación'
    | 'Eliminación';
  encargado: string;
  descripcion: string;
}


// =====================================================
// COMPONENTE
// =====================================================

@Component({
  selector: 'app-encargados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './encargados.html',
  styleUrl: './encargados.css',
})
export class Encargados implements OnInit {

  private cdr = inject(ChangeDetectorRef);

  // =====================================================
  // USUARIO RESPONSABLE
  // =====================================================

  usuarioActual = 'Administrador';


  // =====================================================
  // ENCARGADOS
  // =====================================================

  encargadoPrincipal: Encargado | null = null;

  encargados: Encargado[] = [];

  encargadosFiltrados: Encargado[] = [];


  // =====================================================
  // BÚSQUEDA
  // =====================================================

  busqueda = '';


  // =====================================================
  // MODAL NUEVO / EDITAR
  // =====================================================

  modalAbierto = false;

  modoEdicion = false;

  editarPrincipal = false;

  idEditando: number | null = null;


  // =====================================================
  // MODAL DETALLES
  // =====================================================

  modalDetallesAbierto = false;

  encargadoSeleccionado: Encargado | null = null;


  // =====================================================
  // MODAL REGISTRO DE CAMBIOS
  // =====================================================

  modalRegistroCambiosAbierto = false;

  registrosCambios: RegistroCambio[] = [];


  // =====================================================
  // ESTADO
  // =====================================================

  guardando = false;

  cargando = false;


  // =====================================================
  // FORMULARIO
  // =====================================================

  formulario: FormularioEncargado = this.formularioInicial();


  // =====================================================
  // ERRORES
  // =====================================================

  errores: ErroresFormulario = {
    documento: false,
    nombre: false,
    telefono: false,
    email: false,
    emailInvalido: false,
    cargo: false,
    area: false,
  };


  // =====================================================
  // CARGOS Y ÁREAS
  // =====================================================

  cargosDisponibles: string[] = [
    'Director General',
    'Subdirector',
    'Coordinador Administrativo',
    'Coordinador Operativo',
  ];

  areasDisponibles: string[] = [
    'Dirección',
    'Administración',
    'Operaciones',
  ];


  // =====================================================
  // INICIO
  // =====================================================

  ngOnInit(): void {
    this.cargarEncargados();
  }


  // =====================================================
  // CARGAR ENCARGADOS
  // =====================================================

  cargarEncargados(): void {

    /*
     * IMPORTANTE:
     * Aquí debe ir la llamada a tu EncargadosService.
     *
     * No se agregan datos manualmente.
     *
     * Ejemplo de estructura:
     *
     * this.encargadosService.obtenerEncargados().subscribe({
     *
     *   next: (respuesta) => {
     *
     *     this.encargados = respuesta;
     *
     *     this.encargadoPrincipal = this.encargados.find(
     *       encargado => encargado.id === ...
     *     ) ?? null;
     *
     *     this.filtrarEncargados();
     *
     *   },
     *
     *   error: () => {
     *
     *     Swal.fire(...);
     *   }
     *
     * });
     */

    this.encargados = [];
    this.encargadoPrincipal = null;
    this.encargadosFiltrados = [];

    this.cargando = false;

    this.cdr.detectChanges();
  }


  // =====================================================
  // FORMULARIO INICIAL
  // =====================================================

  formularioInicial(): FormularioEncargado {

    return {
      documento: '',
      nombre: '',
      fechaIngreso: '',
      telefono: '',
      email: '',
      cargo: '',
      area: '',
      descripcion: '',
    };
  }


  // =====================================================
  // ABRIR REGISTRO DE CAMBIOS
  // =====================================================

  abrirRegistroCambios(): void {

    this.modalRegistroCambiosAbierto = true;

    this.cdr.detectChanges();
  }


  // =====================================================
  // CERRAR REGISTRO DE CAMBIOS
  // =====================================================

  cerrarRegistroCambios(): void {

    this.modalRegistroCambiosAbierto = false;

    this.cdr.detectChanges();
  }


  // =====================================================
  // CERRAR REGISTRO POR FONDO
  // =====================================================

  cerrarRegistroCambiosPorFondo(event: MouseEvent): void {

    if (event.target === event.currentTarget) {
      this.cerrarRegistroCambios();
    }
  }


  // =====================================================
  // ABRIR MODAL
  // =====================================================

  openModal(
    modo: 'new' | 'editPrincipal' | 'edit',
    encargado?: Encargado
  ): void {

    this.modalAbierto = true;

    this.modoEdicion = modo !== 'new';

    this.editarPrincipal = modo === 'editPrincipal';

    this.idEditando = null;

    this.limpiarErrores();


    // NUEVO

    if (modo === 'new') {

      this.formulario = this.formularioInicial();

      return;
    }


    // EDITAR PRINCIPAL

    if (modo === 'editPrincipal') {

      if (!this.encargadoPrincipal) {
        this.closeModal();
        return;
      }

      this.formulario = {
        documento: this.encargadoPrincipal.documento,
        nombre: this.encargadoPrincipal.nombre,
        fechaIngreso: this.encargadoPrincipal.fechaIngreso,
        telefono: this.encargadoPrincipal.telefono,
        email: this.encargadoPrincipal.email,
        cargo: this.encargadoPrincipal.cargo,
        area: this.encargadoPrincipal.area,
        descripcion: this.encargadoPrincipal.descripcion,
      };

      return;
    }


    // EDITAR OTRO

    if (modo === 'edit' && encargado) {

      this.idEditando = encargado.id;

      this.formulario = {
        documento: encargado.documento,
        nombre: encargado.nombre,
        fechaIngreso: encargado.fechaIngreso,
        telefono: encargado.telefono,
        email: encargado.email,
        cargo: encargado.cargo,
        area: encargado.area,
        descripcion: encargado.descripcion,
      };
    }
  }


  // =====================================================
  // CERRAR MODAL
  // =====================================================

  closeModal(): void {

    if (this.guardando) {
      return;
    }

    this.modalAbierto = false;

    this.limpiarErrores();

    this.formulario = this.formularioInicial();

    this.modoEdicion = false;

    this.editarPrincipal = false;

    this.idEditando = null;
  }


  // =====================================================
  // VER DETALLES
  // =====================================================

  verDetalles(encargado: Encargado): void {

    this.encargadoSeleccionado = encargado;

    this.modalDetallesAbierto = true;

    this.cdr.detectChanges();
  }


  // =====================================================
  // CERRAR DETALLES
  // =====================================================

  cerrarModalDetalles(): void {

    this.modalDetallesAbierto = false;

    this.encargadoSeleccionado = null;

    this.cdr.detectChanges();
  }


  // =====================================================
  // CERRAR DETALLES POR FONDO
  // =====================================================

  cerrarModalDetallesPorFondo(event: MouseEvent): void {

    if (event.target === event.currentTarget) {
      this.cerrarModalDetalles();
    }
  }


  // =====================================================
  // CERRAR MODAL POR FONDO
  // =====================================================

  cerrarAlClickarFondo(event: MouseEvent): void {

    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }


  // =====================================================
  // DOCUMENTO DUPLICADO
  // =====================================================

  DocumentoDuplicado(documento: string): boolean {

    const documentoLimpio = documento.trim();

    if (!documentoLimpio) {
      return false;
    }


    if (
      !this.editarPrincipal &&
      this.encargadoPrincipal &&
      this.encargadoPrincipal.documento === documentoLimpio
    ) {

      return true;
    }


    return this.encargados.some((encargado) => {

      if (
        this.idEditando !== null &&
        encargado.id === this.idEditando
      ) {

        return false;
      }

      return encargado.documento === documentoLimpio;
    });
  }


  // =====================================================
  // EMAIL VÁLIDO
  // =====================================================

  emailValido(email: string): boolean {

    const regexEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return regexEmail.test(email.trim());
  }


  // =====================================================
  // TELÉFONO VÁLIDO
  // =====================================================

  telefonoValido(telefono: string): boolean {

    return /^[0-9]{10}$/.test(telefono.trim());
  }


  // =====================================================
  // SOLO NÚMEROS
  // =====================================================

  soloNumerosTelefono(event: Event): void {

    const input = event.target as HTMLInputElement;

    input.value = input.value.replace(/\D/g, '');

    this.formulario.telefono = input.value;
  }


  // =====================================================
  // EMAIL DUPLICADO
  // =====================================================

  emailDuplicado(email: string): boolean {

    const emailLimpio = email.trim().toLowerCase();

    if (!emailLimpio) {
      return false;
    }


    if (
      !this.editarPrincipal &&
      this.encargadoPrincipal &&
      this.encargadoPrincipal.email.toLowerCase() === emailLimpio
    ) {

      return true;
    }


    return this.encargados.some((encargado) => {

      if (
        this.idEditando !== null &&
        encargado.id === this.idEditando
      ) {

        return false;
      }

      return encargado.email.toLowerCase() === emailLimpio;
    });
  }


  // =====================================================
  // VALIDAR FORMULARIO
  // =====================================================

  validarFormulario(): boolean {

    this.limpiarErrores();

    let valido = true;


    if (!this.formulario.documento.trim()) {

      this.errores.documento = true;

      valido = false;
    }


    if (!this.formulario.nombre.trim()) {

      this.errores.nombre = true;

      valido = false;
    }


    const telefono = this.formulario.telefono.trim();

    if (!telefono || !this.telefonoValido(telefono)) {

      this.errores.telefono = true;

      valido = false;
    }


    const email = this.formulario.email.trim();

    if (!email) {

      this.errores.email = true;

      valido = false;

    } else if (!this.emailValido(email)) {

      this.errores.emailInvalido = true;

      valido = false;
    }


    if (!this.formulario.cargo) {

      this.errores.cargo = true;

      valido = false;
    }


    if (!this.formulario.area) {

      this.errores.area = true;

      valido = false;
    }


    return valido;
  }


  // =====================================================
  // LIMPIAR ERRORES
  // =====================================================

  limpiarErrores(): void {

    this.errores = {
      documento: false,
      nombre: false,
      telefono: false,
      email: false,
      emailInvalido: false,
      cargo: false,
      area: false,
    };
  }


  // =====================================================
  // GUARDAR ENCARGADO
  // =====================================================

  saveEncargado(): void {

    if (this.guardando) {
      return;
    }


    if (!this.validarFormulario()) {

      let mensaje =
        'Completa los campos obligatorios.';


      if (this.errores.telefono) {

        mensaje =
          'El teléfono debe contener exactamente 10 números.';

      } else if (this.errores.emailInvalido) {

        mensaje =
          'Ingresa un correo electrónico válido.';
      }


      Swal.fire({
        title: 'Revisa el formulario',
        text: mensaje,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });

      return;
    }


    if (
      this.DocumentoDuplicado(
        this.formulario.documento
      )
    ) {

      this.errores.documento = true;

      Swal.fire({
        title: 'Documento duplicado',
        text:
          'El número de documento ya se encuentra registrado.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });

      return;
    }


    if (
      this.emailDuplicado(
        this.formulario.email
      )
    ) {

      this.errores.email = true;

      Swal.fire({
        title: 'Correo duplicado',
        text:
          'El correo electrónico ya se encuentra registrado.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });

      return;
    }


    /*
     * AQUÍ NO SE CREAN OBJETOS QUEMADOS.
     *
     * El formulario debe enviarse mediante EncargadosService
     * a la API de Django.
     *
     * Cuando me pases tu servicio/endpoints, esta parte
     * se conecta directamente con POST, PUT/PATCH.
     */

    Swal.fire({
      title: 'Servicio pendiente',
      text:
        'El formulario está listo, pero todavía falta conectarlo al endpoint de encargados.',
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3B5BDB',
    });
  }


  // =====================================================
  // CAMBIAR ESTADO
  // =====================================================

  cambiarEstado(encargado: Encargado): void {

    const nuevoEstado =
      encargado.estado === 'Activo'
        ? 'Inactivo'
        : 'Activo';


    Swal.fire({

      title:
        nuevoEstado === 'Activo'
          ? '¿Activar encargado?'
          : '¿Desactivar encargado?',

      text:
        nuevoEstado === 'Activo'
          ? 'El encargado volverá a estar activo.'
          : 'El encargado quedará marcado como inactivo.',

      icon: 'question',

      showCancelButton: true,

      confirmButtonText:
        nuevoEstado === 'Activo'
          ? 'Sí, activar'
          : 'Sí, desactivar',

      cancelButtonText: 'Cancelar',

      reverseButtons: true,

      confirmButtonColor: '#3B5BDB',

    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }


      /*
       * Este cambio debe realizarse mediante PATCH/PUT
       * en la API de Django.
       */

      Swal.fire({
        title: 'Servicio pendiente',
        text:
          'El cambio de estado debe conectarse al endpoint de encargados.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });
    });
  }


  // =====================================================
  // ELIMINAR
  // =====================================================

  eliminarEncargado(id: number): void {

    Swal.fire({

      title: '¿Eliminar encargado?',

      text:
        'Esta acción no se puede deshacer.',

      icon: 'warning',

      showCancelButton: true,

      confirmButtonText:
        'Sí, eliminar',

      cancelButtonText:
        'Cancelar',

      reverseButtons: true,

      confirmButtonColor:
        '#3B5BDB',

    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }


      /*
       * La eliminación debe realizarse mediante DELETE
       * utilizando EncargadosService.
       */

      Swal.fire({
        title: 'Servicio pendiente',
        text:
          'La eliminación debe conectarse al endpoint de encargados.',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });
    });
  }


  // =====================================================
  // FILTRAR
  // =====================================================

  filtrarEncargados(): void {

    const termino =
      this.busqueda.trim().toLowerCase();


    if (!termino) {

      this.encargadosFiltrados =
        [...this.encargados];

      this.cdr.detectChanges();

      return;
    }


    this.encargadosFiltrados =
      this.encargados.filter((encargado) => {

        return (

          encargado.documento
            .toLowerCase()
            .includes(termino)

          ||

          encargado.nombre
            .toLowerCase()
            .includes(termino)

          ||

          encargado.email
            .toLowerCase()
            .includes(termino)

          ||

          encargado.cargo
            .toLowerCase()
            .includes(termino)

          ||

          encargado.area
            .toLowerCase()
            .includes(termino)

          ||

          encargado.telefono
            .toLowerCase()
            .includes(termino)
        );
      });


    if (this.encargadosFiltrados.length === 0) {

      this.mostrarAlertaBusqueda(termino);
    }


    this.cdr.detectChanges();
  }


  // =====================================================
  // ALERTA BÚSQUEDA
  // =====================================================

  mostrarAlertaBusqueda(termino: string): void {

    const esDocumento =
      /^[0-9]+$/.test(termino);


    if (esDocumento) {

      Swal.fire({

        title:
          'Documento no encontrado',

        html:
          `No existe ningún encargado registrado con el documento <strong>${termino}</strong>.`,

        icon:
          'warning',

        confirmButtonText:
          'Aceptar',

        confirmButtonColor:
          '#3B5BDB',
      });

      return;
    }


    Swal.fire({

      title:
        'Sin resultados',

      html:
        `No se encontró ningún encargado que coincida con <strong>${termino}</strong>.`,

      icon:
        'info',

      confirmButtonText:
        'Aceptar',

      confirmButtonColor:
        '#3B5BDB',
    });
  }


  // =====================================================
  // BUSCAR
  // =====================================================

  buscarEncargado(): void {

    this.filtrarEncargados();
  }


  // =====================================================
  // LIMPIAR BÚSQUEDA
  // =====================================================

  limpiarBusqueda(): void {

    this.busqueda = '';

    this.encargadosFiltrados =
      [...this.encargados];

    this.cdr.detectChanges();
  }


  // =====================================================
  // REGISTRAR CAMBIO
  // =====================================================

  registrarCambio(
    accion:
      | 'Creación'
      | 'Actualización'
      | 'Activación'
      | 'Desactivación'
      | 'Eliminación',

    encargado: string,

    descripcion: string
  ): void {

    const nuevoRegistro: RegistroCambio = {

      id:
        this.registrosCambios.length > 0
          ? Math.max(
              ...this.registrosCambios.map(
                registro => registro.id
              )
            ) + 1
          : 1,

      fecha:
        new Date().toLocaleString(
          'es-CO',
          {
            dateStyle: 'short',
            timeStyle: 'medium',
          }
        ),

      usuario:
        this.usuarioActual,

      accion,

      encargado,

      descripcion,
    };


    this.registrosCambios =
      [
        nuevoRegistro,
        ...this.registrosCambios,
      ];


    this.cdr.detectChanges();
  }


  // =====================================================
  // GENERAR INICIALES
  // =====================================================

  generarIniciales(nombre: string): string {

    const partes =
      nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (partes.length === 0) {
      return 'NA';
    }


    if (partes.length === 1) {

      return partes[0]
        .substring(0, 2)
        .toUpperCase();
    }


    return (
      partes[0][0] +
      partes[partes.length - 1][0]
    ).toUpperCase();
  }


  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  formatearFechaIngreso(fecha: string): string {

    if (!fecha) {
      return 'Fecha no registrada';
    }


    const fechaObj =
      new Date(`${fecha}T00:00:00`);


    if (
      Number.isNaN(
        fechaObj.getTime()
      )
    ) {

      return 'Fecha no registrada';
    }


    const meses = [

      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',

    ];


    return `Desde ${
      meses[fechaObj.getMonth()]
    } ${
      fechaObj.getFullYear()
    }`;
  }
}


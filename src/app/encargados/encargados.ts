
import { CommonModule } from '@angular/common';
import {HttpClient} from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


// =====================================================
// INTERFACES
// =====================================================

interface Encargado {
  id: number;
  tipoDocumento: string;
  documento: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  fechaIngreso: string;
  fechaNacimiento?: string;
  edad?: number;
  especialidad?: string;
  licencia?: string;
  experiencia?: string;
  institucion?: string;
  estado: 'Activo' | 'Inactivo';
  iniciales: string;
  foto?: string;
}

interface FormularioEncargado {
  tipoDocumento: string;
  documento: string;
  nombres: string;
  apellidos: string;
  estado: 'Activo' | 'Inactivo';
  fechaIngreso: string;
  fechaNacimiento?: string;
  edad?: number;
  telefono: string;
  email: string;
  especialidad?: string;
  licencia?: string;
  experiencia?: string;
  institucion?: string;
  cedulaFile?: File | null;
  hojaDeVidaFile?: File | null;
  tarjetaProfesionalFile?: File | null;
  antecedentesFile?: File | null;

}

interface ErroresFormulario {
  tipoDocumento: boolean;
  documento: boolean;
  nombres: boolean;
  apellidos: boolean;
  telefono: boolean;
  email: boolean;
  emailInvalido?: boolean;
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
  private http = inject(HttpClient);

  // =====================================================
  // USUARIO RESPONSABLE
  // =====================================================

  usuarioActual = 'Administrador';
  private apiUrl = 'https://geriapp-web-1.onrender.com/api/usuarios/';


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
    tipoDocumento: false,
    documento: false,
    nombres: false,
    apellidos: false,
    telefono: false,
    email: false,
    emailInvalido: false,
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

  constructor() {}

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

     this.cargando = true;

    this.http.get<any[]>(this.apiUrl).subscribe({

      next: (respuesta: any[]) => {

        this.encargados = respuesta
          .filter((usuario) => usuario.id_rol === 6)
          .map((usuario) => ({
            id: usuario.id_usuario,
            tipoDocumento: usuario.tipo_documento,
            documento: usuario.numero_documento,
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.correo,
            telefono: usuario.telefono,
            fechaIngreso: usuario.fecha_ingreso,
            estado: usuario.estado ? 'Activo' : 'Inactivo',
            iniciales: this.generarIniciales(`${usuario.nombres} ${usuario.apellidos}`),
          }));

        this.encargadoPrincipal = null;

        this.filtrarEncargados();

        this.cargando = false;

        this.cdr.detectChanges();
      },

      error: () => {

        this.cargando = false;

        Swal.fire({
          title: 'Error al cargar encargados',
          text: 'No se pudo conectar con el servidor.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB',
        });

        this.cdr.detectChanges();
      },
    });
  }


  // =====================================================
  // FORMULARIO INICIAL
  // =====================================================

  formularioInicial(): FormularioEncargado {


    return {
      tipoDocumento: '',
      documento: '',
      nombres: '',
      apellidos: '',
      estado: 'Activo',
      fechaIngreso: '',
      fechaNacimiento: '',
      edad: undefined,
      telefono: '',
      email: '',
      cedulaFile: null,
      hojaDeVidaFile: null,
      especialidad: '',
      licencia: '',
      experiencia: '',
      institucion: '',
      tarjetaProfesionalFile: null,
      antecedentesFile: null,
    };
  }

  // =====================================================
  // CALCULAR EDAD
  // =====================================================

  calcularEdad(): void {
    if (!this.formulario.fechaNacimiento) {
      this.formulario.edad = undefined;
      return;
    }

    const hoy = new Date();
    const nacimiento = new Date(this.formulario.fechaNacimiento + 'T00:00:00');

    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    this.formulario.edad = edad >= 0 ? edad : 0;
  }


  // =====================================================
  // SELECCIONAR ARCHIVOS (DOCUMENTOS)
  // =====================================================

  onFileSelected(
    event: any,
    tipo: 'cedula' | 'tarjetaProfesional' | 'antecedentes' | 'hojaDeVida'
  ): void {
    const file = event.target.files[0];
    if (file) {
      if (tipo === 'cedula') {
        this.formulario.cedulaFile = file;
      } else if (tipo === 'tarjetaProfesional') {
        this.formulario.tarjetaProfesionalFile = file;
      } else if (tipo === 'antecedentes') {
        this.formulario.antecedentesFile = file;
      } else if (tipo === 'hojaDeVida') {
        this.formulario.hojaDeVidaFile = file;
      }
    }
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

    if ((modo as string) === 'editPrincipal') {
      if (!this.encargadoPrincipal) {
        this.closeModal();
        return;
      }

      this.formulario = {
        tipoDocumento: this.encargadoPrincipal.tipoDocumento || '',
        documento: this.encargadoPrincipal.documento,
        nombres: this.encargadoPrincipal.nombres,
        apellidos: this.encargadoPrincipal.apellidos,
        estado: this.encargadoPrincipal.estado,
        fechaIngreso: this.encargadoPrincipal.fechaIngreso,
        fechaNacimiento: this.encargadoPrincipal.fechaNacimiento || '',
        edad: this.encargadoPrincipal.edad,
        telefono: this.encargadoPrincipal.telefono,
        email: this.encargadoPrincipal.email,
        especialidad: this.encargadoPrincipal.especialidad || '',
        licencia: this.encargadoPrincipal.licencia || '',
        experiencia: this.encargadoPrincipal.experiencia || '',
        institucion: this.encargadoPrincipal.institucion || '',
        cedulaFile: null,
        tarjetaProfesionalFile: null,
        antecedentesFile: null,
        hojaDeVidaFile: null,
      };

      return;
    }

    // EDITAR OTRO

    if (modo === 'edit' && encargado) {

      this.idEditando = encargado.id;

      this.formulario = {
        tipoDocumento: encargado.tipoDocumento || '',
        documento: encargado.documento,
        nombres: encargado.nombres,
        apellidos: encargado.apellidos,
        estado: encargado.estado,
        fechaIngreso: encargado.fechaIngreso,
        fechaNacimiento: encargado.fechaNacimiento || '',
        edad: encargado.edad,
        telefono: encargado.telefono,
        email: encargado.email,
        especialidad: encargado.especialidad || '',
        licencia: encargado.licencia || '',
        experiencia: encargado.experiencia || '',
        institucion: encargado.institucion || '',
        cedulaFile: null,
        tarjetaProfesionalFile: null,
        antecedentesFile: null,
        hojaDeVidaFile: null,
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

    if (!this.formulario.tipoDocumento) {
      this.errores.tipoDocumento = true;
      valido = false;
    }


    if (!this.formulario.documento.trim()) {

      this.errores.documento = true;

      valido = false;
    }


    if (!this.formulario.nombres.trim()) {

      this.errores.nombres = true;

      valido = false;
    }

    if (!this.formulario.apellidos.trim()) {

      this.errores.apellidos = true;

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

    return valido;
  }


  // =====================================================
  // LIMPIAR ERRORES
  // =====================================================

  limpiarErrores(): void {

    this.errores = {
      tipoDocumento: false,
      documento: false,
      nombres: false,
      apellidos: false,
      telefono: false,
      email: false,
      emailInvalido: false,
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

      let mensaje = 'Completa los campos obligatorios.';

      if (this.errores.telefono) {
        mensaje = 'El teléfono debe contener exactamente 10 números.';
      } else if (this.errores.emailInvalido) {
        mensaje = 'Ingresa un correo electrónico válido.';
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
        title: 'Revisa el formulario',
        text: mensaje,
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });

      return;
    }

    if (this.DocumentoDuplicado(this.formulario.documento)) {
      this.errores.documento = true;
      Swal.fire({
        title: 'Documento duplicado',
        text: 'El número de documento ya se encuentra registrado.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });
      return;
    }

    if (this.emailDuplicado(this.formulario.email)) {
      this.errores.email = true;
      Swal.fire({
        title: 'Correo duplicado',
        text: 'El correo electrónico ya se encuentra registrado.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB',
      });
      return;
    }

    this.guardando = true;

    // Cuerpo que espera la API (nombres de campos del backend, no los tuyos)
    const cuerpo = {
      tipo_documento: this.formulario.tipoDocumento,
      numero_documento: this.formulario.documento,
      nombres: this.formulario.nombres,
      apellidos: this.formulario.apellidos,
      correo: this.formulario.email,
      telefono: this.formulario.telefono,
      fecha_ingreso: this.formulario.fechaIngreso,
      estado: this.formulario.estado === 'Activo',
      id_rol: 6,
    };

    if (this.modoEdicion && this.idEditando) {

      // ACTUALIZAR
      this.http.put(`${this.apiUrl}${this.idEditando}/`, cuerpo).subscribe({

        next: () => {
          this.guardando = false;
          Swal.fire({
            title: 'Encargado actualizado',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B5BDB',
          });
          this.closeModal();
          this.cargarEncargados();
        },

        error: (err) => {
          this.guardando = false;
          console.error(err);
          Swal.fire({
            title: 'Error al actualizar',
            text: 'Revisa la consola del navegador para más detalles.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B5BDB',
          });
        },
      });

    } else {

      // CREAR
      this.http.post(this.apiUrl, cuerpo).subscribe({

        next: () => {
          this.guardando = false;
          Swal.fire({
            title: 'Encargado creado',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B5BDB',
          });
          this.closeModal();
          this.cargarEncargados();
        },

        error: (err) => {
          this.guardando = false;
          console.error(err);
          Swal.fire({
            title: 'Error al crear',
            text: 'Revisa la consola del navegador para más detalles.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B5BDB',
          });
        },
      });
    }
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
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      confirmButtonColor: '#3B5BDB',

    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.http.delete(`${this.apiUrl}${id}/`).subscribe({

        next: () => {

          Swal.fire({
            title: 'Encargado eliminado',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B5BDB',
          });

          this.cargarEncargados();
        },

        error: () => {

          Swal.fire({
            title: 'Error al eliminar',
            text: 'No se pudo eliminar el encargado.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B5BDB',
          });
        },
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

          encargado.nombres
            .toLowerCase()
            .includes(termino)

          ||

          encargado.apellidos
            .toLowerCase()
            .includes(termino)

          ||

          encargado.email
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


    return `Desde ${meses[fechaObj.getMonth()]
      } ${fechaObj.getFullYear()
      }`;
  }
}
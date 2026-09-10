
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
  contrasena: string;
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
  contrasena: boolean;
  telefono: boolean;
  email: boolean;
  emailInvalido?: boolean;
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
    contrasena: false,
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
      contrasena: '',
      estado: 'Inactivo',
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
        contrasena: '',
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
        contrasena: '',
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

    if (!this.modoEdicion) {

      const contrasena = this.formulario.contrasena.trim();

      if (contrasena.length < 8 || contrasena.length > 10) {

        this.errores.contrasena = true;

        valido = false;
      }
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
      contrasena: false,
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
    const cuerpo: any = {
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

     if (!this.modoEdicion) {
      cuerpo.contrasena = this.formulario.contrasena;
    }

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

    const nuevoEstadoBooleano = encargado.estado !== 'Activo';

    const nuevoEstadoTexto = nuevoEstadoBooleano ? 'Activo' : 'Inactivo';


    Swal.fire({

      title:
        nuevoEstadoTexto === 'Activo'
          ? '¿Activar encargado?'
          : '¿Desactivar encargado?',

      text:
        nuevoEstadoTexto === 'Activo'
          ? 'El encargado volverá a estar activo.'
          : 'El encargado quedará marcado como inactivo.',

      icon: 'question',

      showCancelButton: true,

      confirmButtonText:
        nuevoEstadoTexto === 'Activo'
          ? 'Sí, activar'
          : 'Sí, desactivar',

      cancelButtonText: 'Cancelar',

      reverseButtons: true,

      confirmButtonColor: '#3B5BDB',

    }).then((resultado) => {

      if (!resultado.isConfirmed) {
        return;
      }

      this.http
        .patch(`${this.apiUrl}${encargado.id}/`, { estado: nuevoEstadoBooleano })
        .subscribe({

          next: () => {

            Swal.fire({
              title:
                nuevoEstadoTexto === 'Activo'
                  ? 'Encargado activado'
                  : 'Encargado desactivado',
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3B5BDB',
            });

            this.cargarEncargados();
          },

          error: (err: any) => {

            console.error(err);

            Swal.fire({
              title: 'Error al actualizar estado',
              text: 'No se pudo actualizar el estado del encargado.',
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3B5BDB',
            });
          },
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

    // La API puede devolver solo la fecha ("2026-09-08") o
    // una fecha y hora completa en ISO ("2026-09-08T17:45:03Z").
    // Si ya trae la "T", no le agregamos otra.
    const fechaObj =
      fecha.includes('T')
        ? new Date(fecha)
        : new Date(`${fecha}T00:00:00`);


    if (
      Number.isNaN(
        fechaObj.getTime()
      )
    ) {

      return 'Fecha no registrada';
    }


    const dia = String(fechaObj.getDate()).padStart(2, '0');

    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');

    const anio = fechaObj.getFullYear();


    return `${dia}/${mes}/${anio}`;
  }
}
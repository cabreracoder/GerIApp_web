import { CommonModule } from '@angular/common';
import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


// =========================================================
// INTERFAZ ENCARGADO
// =========================================================

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


// =========================================================
// INTERFAZ PACIENTE ASOCIADO
// =========================================================

interface PacienteAsociado {

  id: number;

  nombre: string;

  documento: string;

  foto?: string;

  estado: 'Activo' | 'Inactivo';

  iniciales: string;
}


// =========================================================
// INTERFAZ FORMULARIO
// =========================================================

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


// =========================================================
// INTERFAZ ERRORES
// =========================================================

interface ErroresFormulario {

  documento: boolean;
  nombre: boolean;
  telefono: boolean;
  email: boolean;

  emailInvalido?: boolean;

  cargo: boolean;
  area: boolean;
}


// =========================================================
// INTERFAZ REGISTRO DE CAMBIOS
// =========================================================

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


// =========================================================
// COMPONENTE
// =========================================================

@Component({

  selector: 'app-encargados',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './encargados.html',

  styleUrl: './encargados.css'

})


export class Encargados {


  // =========================================================
  // CHANGE DETECTOR
  // =========================================================

  private cdr =
    inject(ChangeDetectorRef);


  // =========================================================
  // USUARIO RESPONSABLE
  // =========================================================

  usuarioActual =
    'Administrador';


  // =========================================================
  // REGISTRO DE CAMBIOS
  // =========================================================

  registrosCambios: RegistroCambio[] = [];


  // =========================================================
  // MODAL REGISTRO DE CAMBIOS
  // =========================================================

  modalRegistroCambiosAbierto = false;


  // =========================================================
  // ENCARGADO PRINCIPAL
  // =========================================================

  encargadoPrincipal: Encargado = {

    id: 1,

    documento: '12334443',

    nombre: 'María Rodríguez',

    email: 'm.rodriguez@fundacion.org',

    telefono: '3005550001',

    fechaIngreso: '2018-03-01',

    ingresoTexto: 'Desde marzo 2018',

    cargo: 'Director General',

    area: 'Dirección',

    descripcion:
      'Responsable de la gestión integral de la fundación, supervisión de todas las áreas operativas y representación legal ante entidades externas.',

    estado: 'Activo',

    iniciales: 'MR'
  };


  // =========================================================
  // OTROS ENCARGADOS
  // =========================================================

  encargados: Encargado[] = [

    {

      id: 2,

      documento: '443443',

      nombre: 'Carlos Méndez',

      email: 'c.mendez@fundacion.org',

      telefono: '3005550002',

      fechaIngreso: '2020-06-15',

      ingresoTexto: 'Desde junio 2020',

      cargo: 'Subdirector',

      area: 'Dirección',

      descripcion:
        'Apoyo a la dirección general y coordinación de las actividades administrativas.',

      estado: 'Activo',

      iniciales: 'CM'

    },


    {

      id: 3,

      documento: '3222334',

      nombre: 'Laura Gómez',

      email: 'l.gomez@fundacion.org',

      telefono: '3005550003',

      fechaIngreso: '2021-02-10',

      ingresoTexto: 'Desde febrero 2021',

      cargo: 'Coordinador Administrativo',

      area: 'Administración',

      descripcion:
        'Responsable de los procesos administrativos y documentación institucional.',

      estado: 'Activo',

      iniciales: 'LG'

    },


    {

      id: 4,

      documento: '2343534534',

      nombre: 'Ana López',

      email: 'a.lopez@fundacion.org',

      telefono: '3005550004',

      fechaIngreso: '2022-08-20',

      ingresoTexto: 'Desde agosto 2022',

      cargo: 'Coordinador Operativo',

      area: 'Operaciones',

      descripcion:
        'Coordinación de las operaciones diarias de la Fundación Geriátrica.',

      estado: 'Activo',

      iniciales: 'AL'

    }

  ];


  // =========================================================
  // LISTA FILTRADA
  // =========================================================

  encargadosFiltrados: Encargado[] = [

    ...this.encargados

  ];


  // =========================================================
  // BÚSQUEDA
  // =========================================================

  busqueda = '';


  // =========================================================
  // MODAL NUEVO / EDITAR
  // =========================================================

  modalAbierto = false;

  modoEdicion = false;

  editarPrincipal = false;

  idEditando: number | null = null;


  // =========================================================
  // MODAL VER DETALLES
  // =========================================================

  modalDetallesAbierto = false;

  encargadoSeleccionado: Encargado | null = null;


  // =========================================================
  // PACIENTES ASOCIADOS
  // =========================================================

  pacientesAsociados: PacienteAsociado[] = [];


  // =========================================================
  // ESTADO DE GUARDADO
  // =========================================================

  guardando = false;


  // =========================================================
  // FORMULARIO
  // =========================================================

  formulario: FormularioEncargado =
    this.formularioInicial();


  // =========================================================
  // ERRORES
  // =========================================================

  errores: ErroresFormulario = {

    documento: false,

    nombre: false,

    telefono: false,

    email: false,

    emailInvalido: false,

    cargo: false,

    area: false

  };


  // =========================================================
  // TOAST
  // =========================================================

  toast: {

    mostrar: boolean;

    mensaje: string;

    tipo: 'ok' | 'del' | 'info';

  } = {

    mostrar: false,

    mensaje: '',

    tipo: 'ok'

  };


  // =========================================================
  // FORMULARIO INICIAL
  // =========================================================

  formularioInicial(): FormularioEncargado {

    return {

      documento: '',

      nombre: '',

      fechaIngreso: '',

      telefono: '',

      email: '',

      cargo: '',

      area: '',

      descripcion: ''

    };

  }


  // =========================================================
  // ABRIR MODAL REGISTRO DE CAMBIOS
  // =========================================================

  abrirRegistroCambios(): void {

    this.modalRegistroCambiosAbierto = true;

    this.cdr.detectChanges();

  }


  // =========================================================
  // CERRAR MODAL REGISTRO DE CAMBIOS
  // =========================================================

  cerrarRegistroCambios(): void {

    this.modalRegistroCambiosAbierto = false;

    this.cdr.detectChanges();

  }


  // =========================================================
  // CERRAR REGISTRO AL HACER CLICK EN EL FONDO
  // =========================================================

  cerrarRegistroCambiosPorFondo(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.cerrarRegistroCambios();

    }

  }


  // =========================================================
  // ABRIR MODAL NUEVO / EDITAR
  // =========================================================

  openModal(

    modo: 'new' | 'editPrincipal' | 'edit',

    encargado?: Encargado

  ): void {

    this.modalAbierto = true;

    this.modoEdicion =
      modo !== 'new';

    this.editarPrincipal =
      modo === 'editPrincipal';

    this.idEditando = null;

    this.limpiarErrores();


    if (modo === 'new') {

      this.formulario =
        this.formularioInicial();

      return;

    }


    if (modo === 'editPrincipal') {

      this.formulario = {

        documento:
          this.encargadoPrincipal.documento,

        nombre:
          this.encargadoPrincipal.nombre,

        fechaIngreso:
          this.encargadoPrincipal.fechaIngreso,

        telefono:
          this.encargadoPrincipal.telefono,

        email:
          this.encargadoPrincipal.email,

        cargo:
          this.encargadoPrincipal.cargo,

        area:
          this.encargadoPrincipal.area,

        descripcion:
          this.encargadoPrincipal.descripcion

      };

      return;

    }


    if (
      modo === 'edit' &&
      encargado
    ) {

      this.idEditando =
        encargado.id;

      this.formulario = {

        documento:
          encargado.documento,

        nombre:
          encargado.nombre,

        fechaIngreso:
          encargado.fechaIngreso,

        telefono:
          encargado.telefono,

        email:
          encargado.email,

        cargo:
          encargado.cargo,

        area:
          encargado.area,

        descripcion:
          encargado.descripcion

      };

    }

  }


  // =========================================================
  // CERRAR MODAL NUEVO / EDITAR
  // =========================================================

  closeModal(): void {

    if (this.guardando) {

      return;

    }

    this.modalAbierto = false;

    this.limpiarErrores();

    this.formulario =
      this.formularioInicial();

    this.modoEdicion = false;

    this.editarPrincipal = false;

    this.idEditando = null;

  }


  // =========================================================
  // VER DETALLES
  // =========================================================

  verDetalles(
    encargado: Encargado
  ): void {

    this.encargadoSeleccionado =
      encargado;


    const pacientesPorEncargado: {
      [key: number]: PacienteAsociado[]
    } = {

      2: [

        {

          id: 1,

          nombre: 'María Rodríguez',

          documento: '123456789',

          estado: 'Activo',

          iniciales: 'MR'

        },

        {

          id: 2,

          nombre: 'Pedro Gómez',

          documento: '987654321',

          estado: 'Activo',

          iniciales: 'PG'

        }

      ],


      3: [

        {

          id: 3,

          nombre: 'Ana Martínez',

          documento: '456789123',

          estado: 'Activo',

          iniciales: 'AM'

        }

      ],


      4: []

    };


    this.pacientesAsociados =
      pacientesPorEncargado[encargado.id] || [];


    this.modalDetallesAbierto = true;

    this.cdr.detectChanges();

  }


  // =========================================================
  // CERRAR DETALLES
  // =========================================================

  cerrarModalDetalles(): void {

    this.modalDetallesAbierto = false;

    this.encargadoSeleccionado = null;

    this.pacientesAsociados = [];

    this.cdr.detectChanges();

  }


  // =========================================================
  // CERRAR DETALLES POR FONDO
  // =========================================================

  cerrarModalDetallesPorFondo(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.cerrarModalDetalles();

    }

  }


  // =========================================================
  // CERRAR MODAL POR FONDO
  // =========================================================

  cerrarAlClickarFondo(
    event: MouseEvent
  ): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.closeModal();

    }

  }


  // =========================================================
  // DOCUMENTO DUPLICADO
  // =========================================================

  DocumentoDuplicado(
    doc: string
  ): boolean {

    const docLimpio =
      doc.trim();


    if (!docLimpio) {

      return false;

    }


    if (
      !this.editarPrincipal &&
      this.encargadoPrincipal.documento ===
      docLimpio
    ) {

      return true;

    }


    return this.encargados.some(
      e => {

        if (
          this.idEditando !== null &&
          e.id === this.idEditando
        ) {

          return false;

        }

        return e.documento === docLimpio;

      }
    );

  }


  // =========================================================
  // EMAIL VÁLIDO
  // =========================================================

  emailValido(
    email: string
  ): boolean {

    const regexEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return regexEmail.test(
      email.trim()
    );

  }


  // =========================================================
  // TELÉFONO VÁLIDO
  // =========================================================

  telefonoValido(
    telefono: string
  ): boolean {

    const telefonoLimpio =
      telefono.trim();

    const regexTelefono =
      /^[0-9]{10}$/;

    return regexTelefono.test(
      telefonoLimpio
    );

  }


  // =========================================================
  // SOLO NÚMEROS
  // =========================================================

  soloNumerosTelefono(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    input.value =
      input.value.replace(/\D/g, '');

    this.formulario.telefono =
      input.value;

  }


  // =========================================================
  // EMAIL DUPLICADO
  // =========================================================

  emailDuplicado(
    email: string
  ): boolean {

    const emailLimpio =
      email.trim().toLowerCase();


    if (!emailLimpio) {

      return false;

    }


    if (
      !this.editarPrincipal &&
      this.encargadoPrincipal.email
        .toLowerCase() === emailLimpio
    ) {

      return true;

    }


    return this.encargados.some(
      e => {

        if (
          this.idEditando !== null &&
          e.id === this.idEditando
        ) {

          return false;

        }

        return (
          e.email.toLowerCase() ===
          emailLimpio
        );

      }
    );

  }


  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  validarFormulario(): boolean {

    this.limpiarErrores();

    let valido = true;


    if (
      !this.formulario.documento.trim()
    ) {

      this.errores.documento = true;

      valido = false;

    }


    if (
      !this.formulario.nombre.trim()
    ) {

      this.errores.nombre = true;

      valido = false;

    }


    const telefonoTexto =
      this.formulario.telefono.trim();


    if (!telefonoTexto) {

      this.errores.telefono = true;

      valido = false;

    }

    else if (
      !this.telefonoValido(telefonoTexto)
    ) {

      this.errores.telefono = true;

      valido = false;

    }


    const emailTexto =
      this.formulario.email.trim();


    if (!emailTexto) {

      this.errores.email = true;

      valido = false;

    }

    else if (
      !this.emailValido(emailTexto)
    ) {

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


  // =========================================================
  // LIMPIAR ERRORES
  // =========================================================

  limpiarErrores(): void {

    this.errores = {

      documento: false,

      nombre: false,

      telefono: false,

      email: false,

      emailInvalido: false,

      cargo: false,

      area: false

    };

  }


  // =========================================================
  // REGISTRAR CAMBIO
  // =========================================================

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
            timeStyle: 'medium'
          }
        ),

      usuario:
        this.usuarioActual,

      accion,

      encargado,

      descripcion

    };


    // El registro más reciente aparece primero
    this.registrosCambios = [

      nuevoRegistro,

      ...this.registrosCambios

    ];


    this.cdr.detectChanges();

  }


  // =========================================================
  // GUARDAR ENCARGADO
  // =========================================================

  saveEncargado(): void {

    if (this.guardando) {

      return;

    }


    if (!this.validarFormulario()) {

      let mensajeError =
        'Completa los campos obligatorios.';


      if (
        this.errores.telefono
      ) {

        mensajeError =
          'El teléfono debe contener exactamente 10 números.';

      }

      else if (
        this.errores.emailInvalido
      ) {

        mensajeError =
          'Ingresa un correo electrónico válido.';

      }


      Swal.fire({

        title: 'Revisa el formulario',

        text: mensajeError,

        icon: 'warning',

        confirmButtonText: 'Aceptar'

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

        confirmButtonText: 'Aceptar'

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
          'El correo electrónico ya se encuentra registrado por otro encargado.',

        icon: 'warning',

        confirmButtonText: 'Aceptar'

      });


      return;

    }


    this.guardando = true;


    setTimeout(() => {


      // =====================================================
      // EDITAR PRINCIPAL
      // =====================================================

      if (this.editarPrincipal) {

        this.encargadoPrincipal = {

          ...this.encargadoPrincipal,

          documento:
            this.formulario.documento.trim(),

          nombre:
            this.formulario.nombre.trim(),

          fechaIngreso:
            this.formulario.fechaIngreso,

          telefono:
            this.formulario.telefono.trim(),

          email:
            this.formulario.email.trim(),

          cargo:
            this.formulario.cargo,

          area:
            this.formulario.area,

          descripcion:
            this.formulario.descripcion.trim(),

          iniciales:
            this.generarIniciales(
              this.formulario.nombre
            ),

          ingresoTexto:
            this.formatearFechaIngreso(
              this.formulario.fechaIngreso
            )

        };


        this.registrarCambio(

          'Actualización',

          this.encargadoPrincipal.nombre,

          'Se actualizaron correctamente los datos del encargado principal.'

        );


        this.guardando = false;

        this.closeModal();


        Swal.fire({

          title: '¡Actualizado!',

          text:
            'Los datos del encargado principal fueron actualizados correctamente.',

          icon: 'success',

          confirmButtonText: 'Aceptar',

          timer: 2000,

          timerProgressBar: true

        });


        this.cdr.detectChanges();

        return;

      }


      // =====================================================
      // EDITAR OTRO ENCARGADO
      // =====================================================

      if (
        this.idEditando !== null
      ) {

        const indice =
          this.encargados.findIndex(
            item =>
              item.id ===
              this.idEditando
          );


        if (indice !== -1) {

          const anterior =
            this.encargados[indice];


          this.encargados[indice] = {

            ...anterior,

            documento:
              this.formulario.documento.trim(),

            nombre:
              this.formulario.nombre.trim(),

            fechaIngreso:
              this.formulario.fechaIngreso,

            telefono:
              this.formulario.telefono.trim(),

            email:
              this.formulario.email.trim(),

            cargo:
              this.formulario.cargo,

            area:
              this.formulario.area,

            descripcion:
              this.formulario.descripcion.trim(),

            iniciales:
              this.generarIniciales(
                this.formulario.nombre
              ),

            ingresoTexto:
              this.formatearFechaIngreso(
                this.formulario.fechaIngreso
              )

          };


          this.encargados = [

            ...this.encargados

          ];


          this.filtrarEncargados();


          this.registrarCambio(

            'Actualización',

            this.encargados[indice].nombre,

            'Se actualizaron correctamente los datos del encargado.'

          );

        }


        this.guardando = false;

        this.closeModal();


        Swal.fire({

          title: '¡Actualizado!',

          text:
            'Los datos del encargado fueron actualizados correctamente.',

          icon: 'success',

          confirmButtonText: 'Aceptar',

          timer: 2000,

          timerProgressBar: true

        });


        this.cdr.detectChanges();

        return;

      }


      // =====================================================
      // NUEVO ENCARGADO
      // =====================================================

      const nuevoEncargado: Encargado = {

        id:
          this.obtenerNuevoId(),

        documento:
          this.formulario.documento.trim(),

        nombre:
          this.formulario.nombre.trim(),

        email:
          this.formulario.email.trim(),

        telefono:
          this.formulario.telefono.trim(),

        fechaIngreso:
          this.formulario.fechaIngreso,

        ingresoTexto:
          this.formatearFechaIngreso(
            this.formulario.fechaIngreso
          ),

        cargo:
          this.formulario.cargo,

        area:
          this.formulario.area,

        descripcion:
          this.formulario.descripcion.trim(),

        estado:
          'Activo',

        iniciales:
          this.generarIniciales(
            this.formulario.nombre
          )

      };


      this.encargados = [

        ...this.encargados,

        nuevoEncargado

      ];


      this.filtrarEncargados();


      this.registrarCambio(

        'Creación',

        nuevoEncargado.nombre,

        'Se registró correctamente un nuevo encargado.'

      );


      this.guardando = false;

      this.closeModal();


      Swal.fire({

        title: '¡Encargado creado!',

        text:
          'El encargado fue registrado correctamente.',

        icon: 'success',

        confirmButtonText: 'Aceptar',

        timer: 2000,

        timerProgressBar: true

      });


      this.cdr.detectChanges();

    }, 700);

  }


  // =========================================================
  // OBTENER NUEVO ID
  // =========================================================

  obtenerNuevoId(): number {

    if (
      this.encargados.length === 0
    ) {

      return 1;

    }


    return Math.max(

      ...this.encargados.map(
        item => item.id
      )

    ) + 1;

  }


  // =========================================================
  // GENERAR INICIALES
  // =========================================================

  generarIniciales(
    nombre: string
  ): string {

    const partes =
      nombre
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (
      partes.length === 0
    ) {

      return 'NA';

    }


    if (
      partes.length === 1
    ) {

      return partes[0]
        .substring(0, 2)
        .toUpperCase();

    }


    return (

      partes[0][0] +

      partes[partes.length - 1][0]

    ).toUpperCase();

  }


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  formatearFechaIngreso(
    fecha: string
  ): string {

    if (!fecha) {

      return 'Fecha no registrada';

    }


    const fechaObj =
      new Date(
        `${fecha}T00:00:00`
      );


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
      'diciembre'

    ];


    return `Desde ${
      meses[fechaObj.getMonth()]
    } ${
      fechaObj.getFullYear()
    }`;

  }


  // =========================================================
// CAMBIAR ESTADO
// =========================================================

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

    reverseButtons: true

  }).then((resultado) => {

    if (!resultado.isConfirmed) {

      return;

    }

    encargado.estado = nuevoEstado;

    this.encargados = this.encargados.map((item) =>
      item === encargado
        ? { ...item, estado: nuevoEstado }
        : item
    );

    this.filtrarEncargados();

    this.registrarCambio(

      nuevoEstado === 'Activo'
        ? 'Activación'
        : 'Desactivación',

      encargado.nombre,

      nuevoEstado === 'Activo'
        ? 'El encargado fue activado correctamente.'
        : 'El encargado fue desactivado correctamente.'

    );

    this.cdr.detectChanges();

    Swal.fire({

      title:
        nuevoEstado === 'Activo'
          ? '¡Encargado activado!'
          : '¡Encargado desactivado!',

      text:
        nuevoEstado === 'Activo'
          ? 'El encargado ahora está activo.'
          : 'El encargado ahora está inactivo.',

      icon:
        nuevoEstado === 'Activo'
          ? 'success'
          : 'info',

      timer: 1800,

      timerProgressBar: true,

      showConfirmButton: false

    });

  });

}

  // =========================================================
  // ELIMINAR
  // =========================================================

  eliminarEncargado(
    id: number
  ): void {

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

      reverseButtons: true

    }).then((resultado) => {


      if (!resultado.isConfirmed) {

        return;

      }


      const encargadoEliminado =
        this.encargados.find(
          item =>
            item.id === id
        );


      this.encargados =
        this.encargados.filter(
          item =>
            item.id !== id
        );


      this.filtrarEncargados();


      if (encargadoEliminado) {

        this.registrarCambio(

          'Eliminación',

          encargadoEliminado.nombre,

          'El encargado fue eliminado correctamente.'

        );

      }


      Swal.fire({

        title: '¡Eliminado!',

        text:
          'El encargado fue eliminado correctamente.',

        icon: 'success',

        confirmButtonText:
          'Aceptar',

        timer: 2000,

        timerProgressBar: true

      });


      this.cdr.detectChanges();

    });

  }


  // =========================================================
  // FILTRAR ENCARGADOS
  // =========================================================

  filtrarEncargados(): void {

    const termino =
      this.busqueda
        .trim()
        .toLowerCase();


    if (!termino) {

      this.encargadosFiltrados = [

        ...this.encargados

      ];

      return;

    }


    this.encargadosFiltrados =
      this.encargados.filter(
        encargado =>

          encargado.documento
            .toLowerCase()
            .includes(termino) ||

          encargado.nombre
            .toLowerCase()
            .includes(termino) ||

          encargado.email
            .toLowerCase()
            .includes(termino) ||

          encargado.cargo
            .toLowerCase()
            .includes(termino) ||

          encargado.area
            .toLowerCase()
            .includes(termino) ||

          encargado.telefono
            .toLowerCase()
            .includes(termino)

      );

  }


  // =========================================================
  // MOSTRAR TOAST
  // =========================================================

  mostrarToast(

    mensaje: string,

    tipo: 'ok' | 'del' | 'info'

  ): void {

    this.toast = {

      mostrar: true,

      mensaje,

      tipo

    };


    this.cdr.detectChanges();


    setTimeout(() => {

      this.toast.mostrar = false;

      this.cdr.detectChanges();

    }, 3000);

  }

}
import { CommonModule } from '@angular/common';

import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';

import Swal from 'sweetalert2';



// ============================================================
// ALERTAS GERIAPP - SWEETALERT2
// Mismo diseño institucional aprobado en Gestión de Usuarios y Roles.
// Solo cambia la presentación de las alertas; no modifica operaciones.
// ============================================================

type TonoAlerta = 'azul' | 'verde' | 'rojo' | 'ambar';

function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function contenidoAlerta(
  titulo: string,
  mensaje: string,
  mostrarCheck = false
): string {
  return `
    <div class="geri-alerta">
      <div class="geri-alerta__onda"></div>
      <div class="geri-alerta__contenido">
        <img
          src="/Logo-GerIApp.png"
          class="geri-alerta__logo"
          alt="GeriApp"
          onerror="this.style.display='none'"
        >
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
    html: contenidoAlerta(
      config.titulo,
      config.mensaje,
      config.mostrarCheck
    ),
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
    didOpen: () => {
      Swal.getContainer()?.style.setProperty('z-index', '3001', 'important');
    },
    customClass: {
      popup: 'geri-swal-popup',
      htmlContainer: 'geri-swal-html',
      actions: 'geri-swal-actions',
      confirmButton: `geri-swal-btn geri-swal-btn--${config.tono}`,
      cancelButton: 'geri-swal-btn geri-swal-btn--cancelar'
    }
  });
}

// Confirmaciones disponibles del módulo.
function alertaConfirmar(config: {
  tono: TonoAlerta;
  verbo: string;
  entidad: string;
  nombre: string;
  subtitulo: string;
  confirmar: string;
  confirmarIzquierda?: boolean;
  enfocarCancelar?: boolean;
}) {
  return mostrarAlerta({
    titulo: `${config.verbo} ${config.entidad}`,
    mensaje: `${config.subtitulo}. ¿${config.verbo} a ${config.nombre}?`,
    tono: config.tono,
    confirmar: config.confirmar,
    cancelar: 'Cancelar'
  });
}

function alertaEliminar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'rojo',
    verbo: 'Eliminar',
    entidad,
    nombre,
    subtitulo: 'Acción permanente; no se puede deshacer',
    confirmar: 'Sí, eliminar'
  });
}

function alertaDesactivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'ambar',
    verbo: 'Desactivar',
    entidad,
    nombre,
    subtitulo: 'Cambio reversible; puedes reactivarlo luego',
    confirmar: 'Sí, desactivar'
  });
}

function alertaEditar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'azul',
    verbo: 'Editar',
    entidad,
    nombre,
    subtitulo: 'Se abrirá el formulario de edición',
    confirmar: 'Sí, editar'
  });
}

function alertaActivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'azul',
    verbo: 'Activar',
    entidad,
    nombre,
    subtitulo: 'Volverá a estar activo; puedes desactivarlo luego',
    confirmar: 'Sí, activar'
  });
}

// Respuestas del sistema utilizadas en Configuración.
function alertaExito(
  titulo: string,
  mensaje = 'La operación se realizó correctamente.'
) {
  return mostrarAlerta({
    titulo,
    mensaje,
    tono: 'verde',
    confirmar: 'Aceptar',
    mostrarCheck: true
  });
}

function alertaError(
  titulo: string,
  mensaje = 'Ocurrió un error al realizar la operación.'
) {
  return mostrarAlerta({
    titulo,
    mensaje,
    tono: 'rojo',
    confirmar: 'Aceptar'
  });
}

function alertaAdvertencia(
  titulo: string,
  mensaje = 'Revisa la información e inténtalo nuevamente.'
) {
  return mostrarAlerta({
    titulo,
    mensaje,
    tono: 'azul',
    confirmar: 'Aceptar'
  });
}

interface Usuario {

  id_usuario: number;

  id_rol: number | null;

  tipo_documento: string;

  numero_documento: string;

  nombres: string;

  apellidos: string;

  correo: string;

  telefono: string | null;

  fecha_ingreso: string;

  estado: boolean;

  contrasena?: string;

  rol?: string;

  foto?: string | null;

}



interface Rol {

  id_rol: number;

  nombre: string;

  descripcion: string;

  estado: boolean;

}







@Component({

  selector: 'app-configuracion',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule

  ],

  templateUrl: './configuracion.html',

  styleUrl: './configuracion.css'

})

export class Configuracion implements OnInit, OnDestroy {



  private readonly http = inject(HttpClient);

  private readonly cdr = inject(ChangeDetectorRef);



  private readonly apiUrl =

    'https://geriapp-backend.onrender.com/api';



  // =====================================================

  // USUARIO

  // =====================================================



  idUsuario: number | null = null;



  nombresUsuario = '';

  apellidosUsuario = '';



  nombreUsuario = '';

  nombreUsuarioEdicion = '';



  correoUsuario = '';

  telefonoUsuario = '';



  cargoUsuario = '';

  inicialesUsuario = '';



  // Foto de perfil

  fotoUsuario: string | null = null;



  private usuarioOriginal: Usuario | null = null;



  // =====================================================

  // ROLES

  // =====================================================



  roles: Rol[] = [];



  // =====================================================

  // ESTADOS

  // =====================================================



  cargandoUsuario = false;

  cargandoRoles = false;

  guardando = false;



  // =====================================================

  // RECONOCIMIENTO FACIAL

  // =====================================================



  mostrarRegistroFacial = false;

  camaraActiva = false;

  registrandoRostro = false;



  // Estado persistente consultado desde el backend.

  rostroRegistrado = false;

  consultandoEstadoRostro = false;

  estadoRostroConsultado = false;

  errorConsultaEstadoRostro = false;



  private flujoCamaraFacial: MediaStream | null = null;



  @ViewChild('videoRegistroFacial')

  videoRegistroFacial!: ElementRef<HTMLVideoElement>;





  // =====================================================

  // CONTRASEÑA

  // =====================================================



  contrasenaActual = '';

  nuevaContrasena = '';

  confirmarContrasena = '';



  // =====================================================

  // INICIO

  // =====================================================



  ngOnInit(): void {

    this.cargarUsuario();

  }



  // =====================================================

  // CARGAR USUARIO

  // =====================================================



  cargarUsuario(): void {

    this.cargandoUsuario = true;



    const usuarioGuardado =

      localStorage.getItem('usuario');



    if (!usuarioGuardado) {

      this.cargandoUsuario = false;



      alertaError('Error', 'No se encontró la información del usuario.');



      this.cdr.detectChanges();

      return;

    }



    try {

      const usuarioLocal: Usuario =

        JSON.parse(usuarioGuardado);



      if (!usuarioLocal.id_usuario) {

        this.cargandoUsuario = false;



        alertaError('Error', 'No se encontró el ID del usuario.');



        this.cdr.detectChanges();

        return;

      }



      this.idUsuario =

        usuarioLocal.id_usuario;



      console.log(

        'ID DEL USUARIO LOGUEADO:',

        this.idUsuario

      );



      // Consultar si el usuario ya tiene un rostro registrado.

      this.consultarEstadoRostro();







      this.http.get<Usuario>(

        `${this.apiUrl}/usuarios/${this.idUsuario}/`

      ).subscribe({



        next: (usuarioApi) => {



          console.log(

            'USUARIO OBTENIDO DESDE API:',

            usuarioApi

          );



          this.usuarioOriginal =

            { ...usuarioApi };



          this.asignarDatosUsuario(

            usuarioApi

          );



          this.actualizarLocalStorage(

            usuarioApi

          );



          this.cargarRoles();



          this.cargandoUsuario = false;



          this.cdr.detectChanges();

        },



        error: (error) => {



          console.error(

            'ERROR AL CARGAR USUARIO:',

            error

          );



          this.cargandoUsuario = false;



          let textoError =

            'No fue posible cargar la información del usuario.';



          if (error.status === 404) {

            textoError =

              'El usuario no existe en el servidor.';



          } else if (error.status === 0) {

            textoError =

              'No se pudo conectar con el servidor.';

          }



          alertaError('Error', textoError);



          this.cdr.detectChanges();

        }

      });



    } catch (error) {



      console.error(

        'ERROR AL LEER LOCALSTORAGE:',

        error

      );



      this.cargandoUsuario = false;



      alertaError('Error', 'No fue posible cargar los datos del usuario.');



      this.cdr.detectChanges();

    }

  }



  // =====================================================

  // CONSULTAR ESTADO DEL REGISTRO FACIAL

  // =====================================================



  consultarEstadoRostro(): void {

    const token = localStorage.getItem('token');



    if (!token) {

      console.error(

        'No se encontró el token para consultar el registro facial.'

      );

      this.errorConsultaEstadoRostro = true;

      this.consultandoEstadoRostro = false;

      this.estadoRostroConsultado = false;

      this.cdr.detectChanges();

      return;

    }



    this.consultandoEstadoRostro = true;

    this.errorConsultaEstadoRostro = false;



    this.http.get<{ registrado: boolean; mensaje: string }>(

      `${this.apiUrl}/usuarios/estado-rostro/`,

      {

        headers: {

          Authorization: `Bearer ${token}`

        }

      }

    ).subscribe({

      next: (respuesta) => {

        console.log(

          'ESTADO DEL REGISTRO FACIAL:',

          respuesta

        );



        this.rostroRegistrado = respuesta.registrado === true;

        this.estadoRostroConsultado = true;

        this.errorConsultaEstadoRostro = false;

        this.consultandoEstadoRostro = false;

        this.cdr.detectChanges();

      },

      error: (error) => {

        console.error(

          'ERROR AL CONSULTAR EL ESTADO FACIAL:',

          error

        );



        this.consultandoEstadoRostro = false;

        this.errorConsultaEstadoRostro = true;

        this.estadoRostroConsultado = false;

        this.cdr.detectChanges();

      }

    });

  }



  // =====================================================

  // ASIGNAR DATOS DEL USUARIO

  // =====================================================



  private asignarDatosUsuario(

    usuario: Usuario

  ): void {



    this.idUsuario =

      usuario.id_usuario;



    this.nombresUsuario =

      usuario.nombres ?? '';



    this.apellidosUsuario =

      usuario.apellidos ?? '';



    this.nombreUsuario =

      `${this.nombresUsuario} ${this.apellidosUsuario}`.trim();



    this.nombreUsuarioEdicion =

      this.nombreUsuario;



    this.correoUsuario =

      usuario.correo ?? '';



    this.telefonoUsuario =

      usuario.telefono ?? '';



    this.inicialesUsuario =

      this.obtenerIniciales(

        this.nombreUsuario

      );



    // Cargar foto del usuario

    this.fotoUsuario =

      this.normalizarUrlFoto(

        usuario.foto

      );



    this.cargoUsuario =

      'Cargando...';

  }



  // =====================================================

  // NORMALIZAR URL DE FOTO

  // =====================================================



  private normalizarUrlFoto(

    foto: string | null | undefined

  ): string | null {



    if (!foto) {

      return null;

    }



    if (foto.startsWith('http')) {

      return foto;

    }



    return `https://geriapp-backend.onrender.com${foto}`;

  }



  // =====================================================

  // ACTUALIZAR LOCALSTORAGE

  // =====================================================



  private actualizarLocalStorage(

    usuarioApi: Usuario

  ): void {



    const usuarioAnterior =

      localStorage.getItem('usuario');



    let datosUsuario: Usuario =

      usuarioApi;



    if (usuarioAnterior) {



      try {



        const anterior: Usuario =

          JSON.parse(usuarioAnterior);



        datosUsuario = {

          ...anterior,

          ...usuarioApi

        };



      } catch (error) {



        console.error(

          'ERROR AL LEER USUARIO ANTERIOR:',

          error

        );

      }

    }



    localStorage.setItem(

      'usuario',

      JSON.stringify(datosUsuario)

    );

  }



  // =====================================================

  // CARGAR ROLES

  // =====================================================



  cargarRoles(): void {



    this.cargandoRoles = true;



    this.http.get<Rol[]>(

      `${this.apiUrl}/roles/`

    ).subscribe({



      next: (roles) => {



        console.log(

          'ROLES OBTENIDOS:',

          roles

        );



        this.roles =

          roles.filter(

            rol => rol.estado === true

          );



        this.cargandoRoles = false;



        if (

          this.usuarioOriginal &&

          this.usuarioOriginal.id_rol !== null

        ) {



          const rolUsuario =

            this.roles.find(

              rol =>

                rol.id_rol ===

                this.usuarioOriginal!.id_rol

            );



          this.cargoUsuario =

            rolUsuario?.nombre ??

            'Rol no encontrado';



        } else {



          this.cargoUsuario =

            'Sin rol asignado';

        }



        console.log(

          'CARGO DEL USUARIO:',

          this.cargoUsuario

        );



        this.cdr.detectChanges();

      },



      error: (error) => {



        console.error(

          'ERROR AL CARGAR ROLES:',

          error

        );



        this.cargandoRoles = false;



        this.cargoUsuario =

          'No disponible';



        alertaError('Error', 'No se pudieron cargar los roles.');



        this.cdr.detectChanges();

      }

    });

  }



  // =====================================================

  // OBTENER INICIALES

  // =====================================================



  obtenerIniciales(

    nombre: string

  ): string {



    if (!nombre.trim()) {

      return '';

    }



    const palabras =

      nombre

        .trim()

        .split(/\s+/)

        .filter(

          palabra =>

            palabra.length > 0

        );



    if (palabras.length === 1) {



      return palabras[0]

        .substring(0, 2)

        .toUpperCase();

    }



    return (

      palabras[0].charAt(0) +

      palabras[1].charAt(0)

    ).toUpperCase();

  }



  // =====================================================

  // GUARDAR CAMBIOS DEL PERFIL

  // =====================================================



  guardarCambios(): void {



    if (this.guardando) {

      return;

    }



    if (this.idUsuario === null) {



      alertaError('Error', 'No se encontró el ID del usuario.');

      return;

    }



    // ===================================================

    // VALIDAR NOMBRE

    // ===================================================



    const nombreCompleto =

      this.nombreUsuarioEdicion.trim();



    if (!nombreCompleto) {



      alertaAdvertencia('Campo obligatorio', 'El nombre completo es obligatorio.');



      return;

    }



    // ===================================================

    // SEPARAR NOMBRES Y APELLIDOS

    // ===================================================



    const partesNombre =

      nombreCompleto

        .split(/\s+/)

        .filter(

          parte =>

            parte.length > 0

        );



    let nombres = '';

    let apellidos = '';



    if (partesNombre.length === 1) {



      nombres =

        partesNombre[0];



    } else if (partesNombre.length >= 3) {



      nombres =

        partesNombre

          .slice(0, -2)

          .join(' ');



      apellidos =

        partesNombre

          .slice(-2)

          .join(' ');



    } else {



      nombres =

        partesNombre[0];



      apellidos =

        partesNombre

          .slice(1)

          .join(' ');

    }



    // ===================================================

    // VALIDAR CORREO

    // ===================================================



    const correo =

      this.correoUsuario.trim();



    if (!correo) {



      alertaAdvertencia('Campo obligatorio', 'El correo electrónico es obligatorio.');



      return;

    }



    const correoValido =

      /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        .test(correo);



    if (!correoValido) {



      alertaAdvertencia('Correo inválido', 'Ingresa un correo electrónico válido.');



      return;

    }



    // ===================================================

    // VALIDAR TELÉFONO

    // ===================================================



    const telefono =

      this.telefonoUsuario.trim();



    if (!telefono) {



      alertaAdvertencia('Campo obligatorio', 'El teléfono es obligatorio.');



      return;

    }



    // ===================================================

    // DATOS A ACTUALIZAR

    // ===================================================



    const datos: Partial<Usuario> = {

      nombres,

      apellidos,

      correo,

      telefono

    };



    console.log(

      'ID DEL USUARIO:',

      this.idUsuario

    );



    console.log(

      'DATOS A ACTUALIZAR:',

      datos

    );



    this.guardando = true;



    this.cdr.detectChanges();



    // ===================================================

    // ACTUALIZAR USUARIO EN API

    // ===================================================



    this.http.patch<Usuario>(

      `${this.apiUrl}/usuarios/${this.idUsuario}/`,

      datos

    ).subscribe({



      next: (usuarioActualizado) => {



        console.log(

          'USUARIO ACTUALIZADO:',

          usuarioActualizado

        );



        this.nombresUsuario =

          usuarioActualizado.nombres ??

          nombres;



        this.apellidosUsuario =

          usuarioActualizado.apellidos ??

          apellidos;



        this.nombreUsuario =

          `${this.nombresUsuario} ${this.apellidosUsuario}`.trim();



        this.nombreUsuarioEdicion =

          this.nombreUsuario;



        this.correoUsuario =

          usuarioActualizado.correo ??

          correo;



        this.telefonoUsuario =

          usuarioActualizado.telefono ??

          telefono;



        this.inicialesUsuario =

          this.obtenerIniciales(

            this.nombreUsuario

          );



        // -----------------------------------------------

        // MANTENER FOTO

        // -----------------------------------------------



        if (usuarioActualizado.foto !== undefined) {



          this.fotoUsuario =

            this.normalizarUrlFoto(

              usuarioActualizado.foto

            );

        }



        // -----------------------------------------------

        // ACTUALIZAR USUARIO ORIGINAL

        // -----------------------------------------------



        if (this.usuarioOriginal) {



          this.usuarioOriginal = {

            ...this.usuarioOriginal,

            ...usuarioActualizado

          };



        } else {



          this.usuarioOriginal = {

            ...usuarioActualizado

          };

        }



        // -----------------------------------------------

        // ACTUALIZAR LOCALSTORAGE

        // -----------------------------------------------



        this.actualizarLocalStorage(

          usuarioActualizado

        );



        const datosUsuario =

          JSON.parse(

            localStorage.getItem('usuario') ??

            '{}'

          );



        // -----------------------------------------------

        // AVISAR AL LAYOUT

        // -----------------------------------------------



        window.dispatchEvent(

          new CustomEvent(

            'usuarioActualizado',

            {

              detail: datosUsuario

            }

          )

        );



        // -----------------------------------------------

        // FINALIZAR

        // -----------------------------------------------



        this.guardando = false;



        // next (dentro del patch)

        alertaExito('Cambios guardados', 'Tu perfil se actualizó correctamente.');



        console.log(

          'DATOS ACTUALIZADOS EN PANTALLA:',

          {

            nombre: this.nombreUsuario,

            correo: this.correoUsuario,

            telefono: this.telefonoUsuario

          }

        );



        this.cdr.detectChanges();

      },



      error: (error) => {



        console.error(

          'ERROR AL ACTUALIZAR PERFIL:',

          error

        );



        console.error(

          'RESPUESTA DEL SERVIDOR:',

          error.error

        );



        this.guardando = false;



        let textoError =

          'No fue posible guardar los cambios.';



        if (error.error?.detail) {



          textoError =

            error.error.detail;



        } else if (error.error?.error) {



          textoError =

            error.error.error;



        } else if (

          error.error &&

          typeof error.error === 'object'

        ) {



          const errores =

            Object.values(error.error)

              .flat()

              .join(' ');



          textoError =

            errores ||

            'El servidor rechazó la actualización.';



        } else if (error.status === 0) {



          textoError =

            'No se pudo conectar con el servidor.';

        }



        alertaError('Error', textoError);



        this.cdr.detectChanges();

      }

    });

  }



  // =====================================================

  // CAMBIAR FOTO

  // =====================================================



  cambiarFoto(

    selectorFoto: HTMLInputElement

  ): void {



    selectorFoto.click();

  }



  // =====================================================

  // SELECCIONAR Y GUARDAR FOTO

  // =====================================================



  seleccionarFoto(

    evento: Event

  ): void {



    if (this.idUsuario === null) {



      alertaError('Error', 'No se encontró el ID del usuario.');

      return;

    }



    const input =

      evento.target as HTMLInputElement;



    if (

      !input.files ||

      input.files.length === 0

    ) {

      return;

    }



    const archivo =

      input.files[0];



    console.log(

      'ID USUARIO PARA FOTO:',

      this.idUsuario

    );



    console.log(

      'ARCHIVO SELECCIONADO:',

      archivo

    );



    // ===================================================

    // VALIDAR FORMATO

    // ===================================================



    const tiposPermitidos = [

      'image/jpeg',

      'image/png',

      'image/webp'

    ];



    if (

      !tiposPermitidos.includes(

        archivo.type

      )

    ) {



      alertaAdvertencia('Formato no válido', 'Selecciona una imagen JPG, PNG o WEBP.');

      input.value = '';



      return;

    }



    // ===================================================

    // VALIDAR TAMAÑO

    // ===================================================



    const tamanioMaximo =

      5 * 1024 * 1024;



    if (

      archivo.size >

      tamanioMaximo

    ) {



      alertaAdvertencia('Imagen demasiado grande', 'La imagen no puede superar los 5 MB.');



      input.value = '';



      return;

    }



    // ===================================================

    // CREAR FORMULARIO MULTIPART

    // ===================================================



    const formulario =

      new FormData();



    formulario.append(

      'foto',

      archivo

    );



    console.log(

      'ENVIANDO FOTO AL BACKEND...'

    );



    // ===================================================

    // ENVIAR FOTO AL BACKEND

    // ===================================================



    this.http.patch<Usuario>(

      `${this.apiUrl}/usuarios/${this.idUsuario}/`,

      formulario

    ).subscribe({



      next: (usuarioActualizado) => {



        console.log(

          'USUARIO ACTUALIZADO CON FOTO:',

          usuarioActualizado

        );



        // -----------------------------------------------

        // ACTUALIZAR FOTO EN PANTALLA

        // -----------------------------------------------



        this.fotoUsuario =

          this.normalizarUrlFoto(

            usuarioActualizado.foto

          );



        // -----------------------------------------------

        // ACTUALIZAR USUARIO ORIGINAL

        // -----------------------------------------------



        if (this.usuarioOriginal) {



          this.usuarioOriginal = {

            ...this.usuarioOriginal,

            ...usuarioActualizado

          };



        } else {



          this.usuarioOriginal = {

            ...usuarioActualizado

          };

        }



        // -----------------------------------------------

        // ACTUALIZAR LOCALSTORAGE

        // -----------------------------------------------



        this.actualizarLocalStorage(

          usuarioActualizado

        );



        const datosUsuario =

          JSON.parse(

            localStorage.getItem('usuario') ??

            '{}'

          );



        // -----------------------------------------------

        // AVISAR AL LAYOUT

        // -----------------------------------------------



        window.dispatchEvent(

          new CustomEvent(

            'usuarioActualizado',

            {

              detail: datosUsuario

            }

          )

        );



        // -----------------------------------------------

        // LIMPIAR SELECTOR

        // -----------------------------------------------



        input.value = '';



        this.cdr.detectChanges();



        // -----------------------------------------------

        // MENSAJE

        // -----------------------------------------------



        // next

        alertaExito('Foto actualizada', 'Tu foto de perfil se actualizó correctamente.');

      },



      error: (error) => {



        console.error(

          'ERROR AL ACTUALIZAR FOTO:',

          error

        );



        console.error(

          'RESPUESTA DEL SERVIDOR:',

          error.error

        );



        input.value = '';



        let textoError =

          'No fue posible actualizar la foto de perfil.';



        if (error.error?.detail) {



          textoError =

            error.error.detail;



        } else if (error.error?.error) {



          textoError =

            error.error.error;



        } else if (

          error.error &&

          typeof error.error === 'object'

        ) {



          const errores =

            Object.values(error.error)

              .flat()

              .join(' ');



          textoError =

            errores ||

            'El servidor rechazó la imagen.';



        } else if (error.status === 0) {



          textoError =

            'No se pudo conectar con el servidor.';

        }



        alertaError('Error', textoError);



        this.cdr.detectChanges();

      }

    });

  }





  // =====================================================

  // REGISTRO FACIAL

  // =====================================================



  abrirRegistroFacial(): void {

    if (this.idUsuario === null) {

      alertaError('Error', 'No se encontró el usuario autenticado.');

      return;

    }



    this.mostrarRegistroFacial = true;

    this.cdr.detectChanges();



    setTimeout(() => {

      void this.activarCamaraFacial();

    }, 150);

  }



  // =====================================================

  // ACTIVAR CÁMARA

  // =====================================================



  async activarCamaraFacial(): Promise<void> {

    try {

      if (!navigator.mediaDevices?.getUserMedia) {

        throw new Error('Este navegador no permite acceder a la cámara.');

      }



      this.flujoCamaraFacial = await navigator.mediaDevices.getUserMedia({

        video: {

          facingMode: 'user',

          width: { ideal: 640 },

          height: { ideal: 480 }

        },

        audio: false

      });



      const video = this.videoRegistroFacial?.nativeElement;

      if (!video) {

        throw new Error('No se encontró el elemento de video.');

      }



      video.srcObject = this.flujoCamaraFacial;

      await video.play();



      this.camaraActiva = true;

      this.cdr.detectChanges();



    } catch (error) {

      console.error('ERROR AL ACTIVAR CÁMARA FACIAL:', error);

      this.detenerCamaraFacial();

      this.mostrarRegistroFacial = false;

      this.cdr.detectChanges();



      alertaError(

        'Cámara no disponible',

        'No fue posible acceder a la cámara. Verifica los permisos del navegador y vuelve a intentarlo.'

      );

    }

  }



  // =====================================================

  // CAPTURAR Y REGISTRAR ROSTRO

  // =====================================================



  async capturarYRegistrarRostro(): Promise<void> {

    if (this.registrandoRostro) {

      return;

    }



    if (!this.camaraActiva || !this.videoRegistroFacial?.nativeElement) {

      alertaAdvertencia('Cámara inactiva', 'Activa la cámara antes de registrar tu rostro.');

      return;

    }



    const video = this.videoRegistroFacial.nativeElement;



    if (!video.videoWidth || !video.videoHeight) {

      alertaAdvertencia('Imagen no disponible', 'Espera unos segundos mientras se activa la cámara.');

      return;

    }



    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;



    const contexto = canvas.getContext('2d');

    if (!contexto) {

      alertaError('Error', 'No fue posible procesar la imagen.');

      return;

    }



    // Captura la imagen sin reflejarla; el espejo solo es visual en el CSS.

    contexto.drawImage(video, 0, 0, canvas.width, canvas.height);



    this.registrandoRostro = true;

    this.cdr.detectChanges();



    canvas.toBlob((blob) => {

      if (!blob) {

        this.registrandoRostro = false;

        this.cdr.detectChanges();

        alertaError('Error', 'No fue posible generar la fotografía.');

        return;

      }



      const token = localStorage.getItem('token');

      if (!token) {

        this.registrandoRostro = false;

        this.cdr.detectChanges();

        alertaError('Sesión no válida', 'No se encontró el token de autenticación. Inicia sesión nuevamente.');

        return;

      }



      const formulario = new FormData();

      formulario.append('imagen', blob, 'registro_facial.jpg');



      this.http.post<any>(

        `${this.apiUrl}/usuarios/registrar-rostro/`,

        formulario,

        {

          headers: {

            Authorization: `Bearer ${token}`

          }

        }

      ).subscribe({

        next: (respuesta) => {

          this.registrandoRostro = false;

          this.rostroRegistrado = true;

          this.estadoRostroConsultado = true;

          this.errorConsultaEstadoRostro = false;



          this.detenerCamaraFacial();

          this.mostrarRegistroFacial = false;

          this.cdr.detectChanges();



          alertaExito(

            'Registro facial exitoso',

            respuesta?.mensaje ?? 'Tu rostro se registró correctamente.'

          );

        },

        error: (error) => {

          console.error('ERROR AL REGISTRAR ROSTRO:', error);

          console.error('RESPUESTA DEL BACKEND:', error.error);



          this.registrandoRostro = false;

          this.cdr.detectChanges();



          let mensaje = 'No fue posible registrar tu rostro.';



          if (error.error?.detail) {

            mensaje = error.error.detail;

          } else if (error.error?.error) {

            mensaje = error.error.error;

          } else if (error.status === 401) {

            mensaje = 'Tu sesión no es válida o ha expirado. Inicia sesión nuevamente.';

          } else if (error.status === 403) {

            mensaje = 'No tienes permisos para registrar el rostro.';

          } else if (error.status === 400) {

            mensaje = 'El servidor rechazó la fotografía. Verifica que se vea un único rostro y vuelve a intentarlo.';

          } else if (error.status === 0) {

            mensaje = 'No se pudo conectar con el servidor.';

          }



          alertaError('Error en el registro facial', mensaje);

        }

      });

    }, 'image/jpeg', 0.9);

  }



  // =====================================================

  // CERRAR MODAL Y DETENER CÁMARA

  // =====================================================



  cerrarRegistroFacial(): void {

    if (this.registrandoRostro) {

      return;

    }



    this.detenerCamaraFacial();

    this.mostrarRegistroFacial = false;

    this.cdr.detectChanges();

  }



  private detenerCamaraFacial(): void {

    if (this.flujoCamaraFacial) {

      this.flujoCamaraFacial.getTracks().forEach(track => track.stop());

      this.flujoCamaraFacial = null;

    }



    this.camaraActiva = false;



    if (this.videoRegistroFacial?.nativeElement) {

      this.videoRegistroFacial.nativeElement.srcObject = null;

    }

  }



  ngOnDestroy(): void {

    this.detenerCamaraFacial();

  }



  // =====================================================

  // CAMBIAR CONTRASEÑA

  // =====================================================



  actualizarContrasena(): void {



    // ===================================================

    // VALIDAR ID

    // ===================================================



    if (this.idUsuario === null) {

      alertaError('Error', 'No se encontró el ID del usuario.');

      return;

    }



    // ===================================================

    // EVITAR SOLICITUDES DUPLICADAS

    // ===================================================



    if (this.guardando) {

      return;

    }



    // ===================================================

    // VALIDAR CONTRASEÑA ACTUAL

    // ===================================================



    if (!this.contrasenaActual.trim()) {

      alertaAdvertencia('Campo obligatorio', 'Ingresa tu contraseña actual.');

      return;

    }



    // ===================================================

    // VALIDAR NUEVA CONTRASEÑA

    // ===================================================



    if (!this.nuevaContrasena.trim()) {

      alertaAdvertencia('Campo obligatorio', 'Ingresa la nueva contraseña.');

      return;

    }



    // ===================================================

    // VALIDAR CONFIRMACIÓN

    // ===================================================



    if (!this.confirmarContrasena.trim()) {

      alertaAdvertencia('Campo obligatorio', 'Confirma la nueva contraseña.');

      return;

    }



    // ===================================================

    // VALIDAR LONGITUD MÍNIMA

    // ===================================================



    if (this.nuevaContrasena.length < 8) {

      alertaAdvertencia('Contraseña muy corta', 'La nueva contraseña debe tener al menos 8 caracteres.');

      return;

    }



    // ===================================================

    // VALIDAR LONGITUD MÁXIMA

    // ===================================================



    if (this.nuevaContrasena.length > 10) {

      alertaAdvertencia('Contraseña muy larga', 'La nueva contraseña debe tener máximo 10 caracteres.');

      return;

    }



    // ===================================================

    // VALIDAR CONFIRMACIÓN MÁXIMA

    // ===================================================



    if (this.confirmarContrasena.length > 10) {

      alertaAdvertencia('Confirmación muy larga', 'La confirmación de la contraseña no puede superar los 10 caracteres.');

      return;

    }



    // ===================================================

    // VALIDAR COINCIDENCIA

    // ===================================================



    if (

      this.nuevaContrasena !==

      this.confirmarContrasena

    ) {

      alertaAdvertencia('Las contraseñas no coinciden', 'Las contraseñas nuevas no coinciden.');

      return;

    }



    // ===================================================

    // DATOS PARA EL BACKEND

    // ===================================================



    const datos = {

      id_usuario: this.idUsuario,

      contrasena_actual: this.contrasenaActual,

      nueva_contrasena: this.nuevaContrasena,

      confirmar_contrasena: this.confirmarContrasena

    };



    console.log(

      'CAMBIO DE CONTRASEÑA - ID USUARIO:',

      this.idUsuario

    );



    this.guardando = true;

    this.cdr.detectChanges();



    // ===================================================

    // ENVIAR CAMBIO DE CONTRASEÑA

    // ===================================================



    this.http.post<any>(

      `${this.apiUrl}/usuarios/cambiar-contrasena/`,

      datos

    ).subscribe({



      next: (respuesta) => {



        console.log(

          'CONTRASEÑA ACTUALIZADA:',

          respuesta

        );



        this.guardando = false;



        alertaExito('Contraseña actualizada', respuesta?.mensaje ?? 'Contraseña actualizada correctamente.');

        // -----------------------------------------------

        // LIMPIAR CAMPOS

        // -----------------------------------------------



        this.contrasenaActual = '';

        this.nuevaContrasena = '';

        this.confirmarContrasena = '';



        this.cdr.detectChanges();

      },



      error: (error) => {



        console.error(

          'ERROR AL CAMBIAR CONTRASEÑA:',

          error

        );



        console.error(

          'RESPUESTA DEL SERVIDOR:',

          error.error

        );



        this.guardando = false;



        let textoError =

          'No fue posible actualizar la contraseña.';



        if (error.error?.detail) {



          textoError =

            error.error.detail;



        } else if (error.error?.error) {



          textoError =

            error.error.error;



        } else if (

          error.error &&

          typeof error.error === 'object'

        ) {



          const errores =

            Object.values(error.error)

              .flat()

              .join(' ');



          textoError =

            errores ||

            'El servidor rechazó el cambio de contraseña.';



        } else if (error.status === 0) {



          textoError =

            'No se pudo conectar con el servidor.';

        }



        alertaError('Error', textoError);



        this.cdr.detectChanges();

      }

    });

  }

}



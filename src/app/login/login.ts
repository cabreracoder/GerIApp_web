import {

  Component,

  OnDestroy,

  ElementRef,

  ViewChild

} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import { ChangeDetectorRef } from '@angular/core';

import Swal from 'sweetalert2';

import { SocialAuthService, GoogleLoginProvider, SocialUser, GoogleSigninButtonDirective } from '@abacritt/angularx-social-login';

import { Store } from '@ngrx/store';

import { iniciarSesion, UsuarioSesion } from '../store/action';


// ============================================================
// ALERTAS GERIAPP - SWEETALERT2
// Utiliza el diseño institucional definido globalmente en styles.css.
// ============================================================

type TonoAlerta = 'azul' | 'verde' | 'rojo';

function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function contenidoAlerta(titulo: string, mensaje: string, mostrarCheck = false): string {
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
    html: contenidoAlerta(config.titulo, config.mensaje, config.mostrarCheck),
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
      // Mantiene la alerta por encima de los modales del login.
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

// Respuestas del sistema: mismo diseño institucional de los demás módulos.
function alertaExito(titulo: string, mensaje = 'La operación se realizó correctamente.') {
  return mostrarAlerta({
    titulo,
    mensaje,
    tono: 'verde',
    confirmar: 'Aceptar',
    mostrarCheck: true
  });
}

function alertaError(titulo: string, mensaje = 'Ocurrió un error al realizar la operación.') {
  return mostrarAlerta({
    titulo,
    mensaje,
    tono: 'rojo',
    confirmar: 'Aceptar'
  });
}

function alertaAdvertencia(titulo: string, mensaje = 'Revisa la información e inténtalo nuevamente.') {
  return mostrarAlerta({
    titulo,
    mensaje,
    tono: 'azul',
    confirmar: 'Aceptar'
  });
}


@Component({

  selector: 'app-login',

  standalone: true,

  imports: [

    CommonModule,

    FormsModule,

    GoogleSigninButtonDirective


  ],

  templateUrl: './login.html',

  styleUrl: './login.css'

})

export class Login implements OnDestroy {


  // =========================================================

  // URL BASE DE LA API

  // =========================================================


  private readonly apiUrl =

    'https://geriapp-backend.onrender.com/api';

  // =========================================================

  // DATOS DEL USUARIO

  // =========================================================


  usuario = {

    correo: '',

    contrasena: ''

  };


  mostrarContrasena = false;


  mensaje = '';

  error = '';

  cargando = false;

  cargandoRecuperacion = false;


  // =========================================================

  // LOGIN CON RECONOCIMIENTO FACIAL

  // =========================================================


  mostrarLoginFacial = false;

  cargandoLoginFacial = false;

  camaraActiva = false;


  private flujoCamara: MediaStream | null = null;


  @ViewChild('videoFacial')

  videoFacial!: ElementRef<HTMLVideoElement>;


  // =========================================================

  // ABRIR LOGIN FACIAL

  // =========================================================


  async abrirLoginFacial(): Promise<void> {


    this.mostrarLoginFacial = true;


    try {


      if (!navigator.mediaDevices?.getUserMedia) {

        throw new Error(

          'Tu navegador no permite acceder a la cámara.'

        );

      }


      this.flujoCamara = await navigator.mediaDevices.getUserMedia({

        video: {

          facingMode: 'user',

          width: { ideal: 640 },

          height: { ideal: 480 }

        },

        audio: false

      });


      this.camaraActiva = true;


      this.cd.detectChanges();


      await new Promise(resolve => setTimeout(resolve, 100));


      const video = this.videoFacial?.nativeElement;


      if (video) {


        video.srcObject = this.flujoCamara;


        await video.play();


      }


    } catch (error) {


      console.error('Error al abrir la cámara:', error);


      this.detenerCamara();


      this.mostrarLoginFacial = false;


      alertaError(

        'No se pudo acceder a la cámara',

        'Verifica que hayas concedido los permisos de cámara al navegador.'

      );


    }


  }


  // =========================================================

  // CAPTURAR FOTOGRAFÍA Y ENVIAR AL BACKEND

  // =========================================================


  capturarRostro(): void {


    if (this.cargandoLoginFacial) {

      return;

    }


    const video = this.videoFacial?.nativeElement;


    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {

      alertaAdvertencia(

        'Cámara no disponible',

        'Espera un momento e intenta nuevamente.'

      );

      return;

    }


    const canvas = document.createElement('canvas');


    canvas.width = video.videoWidth;

    canvas.height = video.videoHeight;


    const contexto = canvas.getContext('2d');


    if (!contexto) {

      alertaError(

        'Error',

        'No fue posible procesar la fotografía.'

      );

      return;

    }


    contexto.drawImage(

      video,

      0,

      0,

      canvas.width,

      canvas.height

    );


    // ACTIVAR EL ESTADO DE CARGA INMEDIATAMENTE

    this.cargandoLoginFacial = true;

    this.cd.detectChanges();


    canvas.toBlob((blob) => {


      if (!blob) {


        this.cargandoLoginFacial = false;

        this.cd.detectChanges();


        alertaError(

          'Error',

          'No fue posible capturar la fotografía.'

        );


        return;

      }


      const imagen = new File(

        [blob],

        'rostro_login.jpg',

        { type: 'image/jpeg' }

      );


      this.enviarImagenLoginFacial(imagen);


    }, 'image/jpeg', 0.90);


  }


  // =========================================================

  // ENVIAR IMAGEN AL BACKEND

  // =========================================================


  private enviarImagenLoginFacial(imagen: File): void {


    // Mantener activo el estado de verificación

    this.cargandoLoginFacial = true;

    this.cd.detectChanges();


    const formulario = new FormData();


    formulario.append('imagen', imagen);


    this.http.post<any>(

      `${this.apiUrl}/usuarios/login-facial/`,

      formulario

    ).subscribe({


      next: (respuesta) => {


        this.cargandoLoginFacial = false;

        this.cd.detectChanges();


        console.log(

          'Respuesta del login facial:',

          respuesta

        );


        if (respuesta.usuario) {


          localStorage.setItem(

            'usuario',

            JSON.stringify(respuesta.usuario)

          );


          this.store.dispatch(

            iniciarSesion({

              usuario: respuesta.usuario as UsuarioSesion

            })

          );


        }


        if (respuesta.token) {


          localStorage.setItem(

            'token',

            respuesta.token

          );


        }


        this.detenerCamara();


        this.mostrarLoginFacial = false;


        alertaExito(

          '¡Bienvenido!',

          respuesta.mensaje || 'Reconocimiento facial exitoso.'

        ).then(() => {


          const idRol = Number(respuesta.usuario?.id_rol);


          if (idRol === 4) {

            this.router.navigate(['/superadministrador']);

          } else {

            this.router.navigate(['/dashboard']);

          }


        });


      },


      error: (respuestaError) => {


        console.error(

          'Error en login facial:',

          respuestaError

        );


        this.cargandoLoginFacial = false;

        this.cd.detectChanges();


        const mensajeBackend =

          respuestaError?.error?.error ||

          respuestaError?.error?.mensaje;


        if (respuestaError.status === 403) {


          alertaAdvertencia(

            'Acceso no autorizado',

            mensajeBackend || 'No fue posible validar tu identidad.'

          );


        } else if (respuestaError.status === 429) {


          alertaAdvertencia(

            'Demasiados intentos',

            mensajeBackend || 'Has superado el límite de intentos. Intenta nuevamente más tarde.'

          );


        } else {


          alertaError(

            'Reconocimiento facial fallido',

            mensajeBackend || 'No fue posible reconocer tu rostro. Intenta nuevamente.'

          );


        }


      }


    });


  }


  // =========================================================

  // DETENER CÁMARA

  // =========================================================


  detenerCamara(): void {


    if (this.flujoCamara) {


      this.flujoCamara.getTracks().forEach(track => {

        track.stop();

      });


      this.flujoCamara = null;


    }


    this.camaraActiva = false;


  }


  // =========================================================

  // CERRAR LOGIN FACIAL

  // =========================================================


  cerrarLoginFacial(): void {


    this.detenerCamara();


    this.mostrarLoginFacial = false;


    this.cargandoLoginFacial = false;


  }


  // =========================================================

  // LIBERAR CÁMARA AL DESTRUIR EL COMPONENTE

  // =========================================================


  ngOnDestroy(): void {


    this.detenerCamara();


  }


  // =========================================================

  // RECUPERACIÓN DE CONTRASEÑA

  // =========================================================


  mostrarRecuperacion = false;


  pasoRecuperacion = 1;


  correoRecuperacion = '';


  codigo = '';


  nuevaContrasena = '';

  confirmarContrasena = '';


  enviandoCodigo = false;

  verificandoCodigo = false;

  cambiandoPassword = false;


  errorCodigo = '';

  errorPassword = '';


  // =========================================================

  // CONSTRUCTOR

  // =========================================================


  constructor(

    private http: HttpClient,

    private router: Router,

    private cd: ChangeDetectorRef,

    private socialAuthService: SocialAuthService,

    private store: Store


  ) {


    this.socialAuthService.authState.subscribe(user => {


      console.log("Usuario Google:", user);


      if (user) {


        this.loginGoogleBackend(user.idToken!);


      }


    });


  }

  // =========================================================

  // INICIAR SESIÓN

  // =========================================================


  iniciarSesion(): void {


    this.mensaje = '';

    this.error = '';


    if (

      !this.usuario.correo.trim() ||

      !this.usuario.contrasena.trim()

    ) {


      alertaAdvertencia('Campos vacíos', 'Ingresa tu correo y contraseña.');


      return;

    }


    // VALIDAR FORMATO DEL CORREO

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!formatoCorreo.test(this.usuario.correo.trim())) {


      alertaAdvertencia('Correo inválido', 'Ingresa un correo electrónico válido.');


      return;

    }


    this.cargando = true;


    this.http.post<any>(

      `${this.apiUrl}/usuarios/login/`,

      {

        correo: this.usuario.correo.trim(),

        contrasena: this.usuario.contrasena

      }

    ).subscribe({


      next: (respuesta) => {


        this.cargando = false;


        console.log(

          'Respuesta del login:',

          respuesta

        );


        if (respuesta.usuario) {

          localStorage.setItem(

            'usuario',

            JSON.stringify(respuesta.usuario)

          );


          this.store.dispatch(

            iniciarSesion({

              usuario: respuesta.usuario as UsuarioSesion

            })

          );

        }


        if (respuesta.token) {

          localStorage.setItem('token', respuesta.token);

        }


        this.mensaje =

          respuesta.mensaje ||

          'Has iniciado sesión correctamente.';


        alertaExito('¡Bienvenido!', this.mensaje).then(() => {

          const idRol = Number(respuesta.usuario?.id_rol);


          if (idRol === 4) {

            this.router.navigate(['/superadministrador']);

          } else {

            this.router.navigate(['/dashboard']);

          }

        });


      },


      error: (respuestaError) => {


        console.log(respuestaError);


        this.cargando = false;


        this.cd.detectChanges();


        const mensajeBackend = respuestaError?.error?.error;


        if (

          respuestaError.status === 403 &&

          mensajeBackend?.toLowerCase().includes('inactivo')

        ) {


          alertaAdvertencia(

            'Usuario inactivo',

            'Tu cuenta se encuentra inactiva. Comunícate con el administrador de la institución.'

          );


        } else {


          alertaError(

            'Error',

            mensajeBackend || 'Credenciales inválidas'

          );


        }


      }


    });

  }


  // =========================================================

  // REGISTRO

  // =========================================================


  registro(): void {


    this.router.navigate(['/registro']);


  }


  // =========================================================

  // ABRIR MODAL DE RECUPERACIÓN

  // =========================================================


  abrirRecuperacion(): void {


    this.mostrarRecuperacion = true;


    this.pasoRecuperacion = 1;


    this.correoRecuperacion = '';

    this.codigo = '';

    this.nuevaContrasena = '';

    this.confirmarContrasena = '';


    this.errorCodigo = '';

    this.errorPassword = '';

  }


  // =========================================================

  // CERRAR MODAL DE RECUPERACIÓN

  // =========================================================


  cerrarRecuperacion(): void {


    this.mostrarRecuperacion = false;


    this.pasoRecuperacion = 1;


    this.correoRecuperacion = '';

    this.codigo = '';

    this.nuevaContrasena = '';

    this.confirmarContrasena = '';


    this.cambiandoPassword = false;


    this.errorPassword = '';

    this.errorCodigo = '';

  }


  // =========================================================

  // ENVIAR CÓDIGO DE RECUPERACIÓN

  // =========================================================


  enviarCodigo(): void {


    if (!this.correoRecuperacion.trim()) {


      alertaAdvertencia('Correo requerido', 'Ingresa tu correo electrónico.');

      return;

    }


    if (this.enviandoCodigo) {

      return;

    }


    this.enviandoCodigo = true;


    this.http.post<any>(

      `${this.apiUrl}/usuarios/recuperar-password/`,

      {

        correo: this.correoRecuperacion

      }

    ).subscribe({


      next: (respuesta) => {


        this.enviandoCodigo = false;


        this.codigo = '';


        this.errorCodigo = '';


        this.pasoRecuperacion = 2;


        this.cd.detectChanges();

      },


      error: (error) => {


        this.enviandoCodigo = false;


        alertaError('Error', 'Credenciales inválidas');

      }


    });

  }


  // =========================================================

  // VERIFICAR CÓDIGO

  // =========================================================


  verificarCodigo(): void {


    if (this.verificandoCodigo) {

      return;

    }


    if (!this.codigo.trim()) {


      this.errorCodigo = 'Ingresa el código.';


      return;

    }


    this.verificandoCodigo = true;


    this.errorCodigo = '';


    this.http.post<any>(

      `${this.apiUrl}/usuarios/verificar-codigo/`,

      {

        correo: this.correoRecuperacion,

        codigo: this.codigo.trim()

      }

    ).subscribe({


      next: () => {


        this.verificandoCodigo = false;


        this.errorCodigo = '';


        this.pasoRecuperacion = 3;


        this.cd.detectChanges();

      },


      error: (error) => {


        console.log(

          'Error código:',

          error

        );


        this.verificandoCodigo = false;


        this.errorCodigo =

          error.error.error ||

          'Código inválido.';


        this.cd.detectChanges();

      }


    });

  }


  // =========================================================

  // CAMBIAR CONTRASEÑA POR RECUPERACIÓN

  // =========================================================


  cambiarPasswordRecuperacion(): void {


    if (this.cambiandoPassword) {

      return;

    }


    if (

      this.nuevaContrasena !==

      this.confirmarContrasena

    ) {


      this.errorPassword =

        'Las contraseñas no coinciden';


      return;

    }


    this.errorPassword = '';


    this.cambiandoPassword = true;


    this.http.post<any>(

      `${this.apiUrl}/usuarios/cambiar-password-recuperacion/`,

      {

        correo: this.correoRecuperacion,

        codigo: this.codigo,

        nueva_contrasena: this.nuevaContrasena

      }

    ).subscribe({


      next: (respuesta) => {


        this.cambiandoPassword = false;


        // Cerrar modal

        this.mostrarRecuperacion = false;


        this.cd.detectChanges();


        // Reiniciar pasos

        this.pasoRecuperacion = 1;


        // Limpiar campos

        this.correoRecuperacion = '';

        this.codigo = '';

        this.nuevaContrasena = '';

        this.confirmarContrasena = '';


        alertaExito('Contraseña actualizada', 'Ya puedes iniciar sesión.');


      },


      error: (error) => {


        this.cambiandoPassword = false;


        this.cd.detectChanges();


        alertaError('Error', error.error.error || 'No se pudo cambiar la contraseña.');


      }


    });

  }


  // =========================================================

  // LOGIN CON GOOGLE

  // =========================================================


  loginGoogleBackend(token: string): void {


    this.http.post<any>(

      `${this.apiUrl}/auth/login-google/`,

      {

        token: token

      }

    )

      .subscribe({


        next: (respuesta) => {


          console.log(

            'Respuesta backend Google:',

            respuesta

          );


          if (respuesta.usuario) {

            localStorage.setItem(

              'usuario',

              JSON.stringify(respuesta.usuario)

            );


            this.store.dispatch(

              iniciarSesion({

                usuario: respuesta.usuario as UsuarioSesion

              })

            );

          }


          if (respuesta.token) {

            localStorage.setItem('token', respuesta.token);

          }


          alertaExito('¡Bienvenido!', 'Inicio de sesión con Google exitoso.')

            .then(() => {

              const idRol = Number(respuesta.usuario?.id_rol);


              if (idRol === 4) {

                this.router.navigate(['/superadministrador']);

              } else {

                this.router.navigate(['/dashboard']);

              }

            });


        },


        error: (error) => {


          console.log('Error backend Google:', error);


          const mensajeBackend = error?.error?.error;


          if (

            error.status === 403 &&

            mensajeBackend?.toLowerCase().includes('inactivo')

          ) {


            alertaAdvertencia(

              'Usuario inactivo',

              'Tu cuenta se encuentra inactiva. Comunícate con el administrador de la institución.'

            );


          } else {


            alertaAdvertencia(

              'No se pudo iniciar sesión',

              mensajeBackend || 'Debe crear una cuenta para ingresar con Google.'

            );


          }


        }


      });


  }


}
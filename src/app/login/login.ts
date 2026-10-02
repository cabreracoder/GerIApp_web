import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';
import { SocialAuthService, GoogleLoginProvider, SocialUser, GoogleSigninButtonDirective } from '@abacritt/angularx-social-login';

// =====================================================
// ALERTAS (SweetAlert2 + Tailwind)
// =====================================================

type Tono = 'rojo' | 'ambar' | 'azul' | 'verde';

const TONOS: Record<Tono, { panel: string; boton: string }> = {
  rojo: { panel: 'bg-linear-to-b from-red-500 to-red-700', boton: 'bg-red-600 hover:bg-red-700' },
  ambar: { panel: 'bg-linear-to-b from-amber-500 to-amber-700', boton: 'bg-amber-600 hover:bg-amber-700' },
  azul: { panel: 'bg-linear-to-b from-blue-500 to-blue-700', boton: 'bg-blue-600 hover:bg-blue-700' },
  verde: { panel: 'bg-linear-to-b from-emerald-500 to-emerald-700', boton: 'bg-emerald-600 hover:bg-emerald-700' },
};

// Iconos blancos del panel (papelera, prohibido, lápiz, check, equis, alerta)
const svgIcono = (trazos: string): string =>
  `<svg class="h-11 w-11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</svg>`;

const ICONOS = {
  papelera: svgIcono('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
  prohibido: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'),
  lapiz: svgIcono('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>'),
  check: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  equis: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  alerta: svgIcono('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
};

// Evita que un nombre del backend inyecte HTML
function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inicialesAlerta(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

interface ConfigAlerta {
  tono: Tono;
  icono: 'warning' | 'question' | 'success' | 'error';
  iconoSvg: string;
  titulo: string;
  html?: string;
  confirmar: string;
  cancelar?: string;
  confirmarIzquierda?: boolean;   // true = "Sí, ..." a la izquierda (como en Editar)
  enfocarCancelar?: boolean;
  autoCerrar?: boolean;           // true = sin botones, se cierra a los 1,8 s
}

// Motor único: todas las alertas pasan por aquí.
// Las clases con "!" ganan sobre el CSS que SweetAlert2 trae por defecto.
function mostrarAlerta(c: ConfigAlerta) {

  const tono = TONOS[c.tono];
  const conBotones = !c.autoCerrar;
  const conCancelar = !!c.cancelar;
  const botonSolo = conBotones && !conCancelar;
  const tituloSinPie = !conBotones && !c.html;

  return Swal.fire({
    icon: c.icono,
    iconHtml: c.iconoSvg,
    title: escaparHtml(c.titulo),
    html: c.html,

    showConfirmButton: conBotones,
    showCancelButton: conCancelar,
    confirmButtonText: c.confirmar,
    cancelButtonText: c.cancelar,
    reverseButtons: !c.confirmarIzquierda,
    focusCancel: !!c.enfocarCancelar,
    timer: c.autoCerrar ? 1800 : undefined,

    buttonsStyling: false,
    backdrop: 'rgba(15, 23, 42, 0.65)',

    customClass: {
      popup: '!grid-cols-[26%_1fr] !w-[34rem] !max-w-[92vw] !p-0 !rounded-[2.2rem] !overflow-hidden !bg-white',
      icon: `col-start-1 row-start-1 row-span-3 !m-0 !flex !h-auto !w-auto !items-center !justify-center !rounded-none !border-0 !animate-none ${tono.panel}`,
      title: `col-start-2 row-start-1 !m-0 !px-7 !pt-8 ${tituloSinPie ? '!pb-8' : '!pb-0'} !text-left !text-[1.6rem] !leading-tight !font-extrabold !text-slate-900`,
      htmlContainer: `col-start-2 row-start-2 !m-0 !px-7 !pt-0 ${conBotones ? '!pb-0' : '!pb-8'} !justify-start !overflow-visible !text-left !text-base !font-normal`,
      actions: `col-start-2 row-start-3 !m-0 !w-auto !flex-nowrap !gap-3 !px-7 !pt-6 !pb-8 ${botonSolo ? '!justify-end' : '!justify-stretch'}`,
      confirmButton: `${botonSolo ? 'w-[calc(50%-0.375rem)]' : 'flex-1'} cursor-pointer rounded-2xl px-4 py-3 text-[1.1rem] font-bold text-white transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 ${tono.boton}`,
      cancelButton: 'flex-1 cursor-pointer rounded-2xl bg-slate-100 px-4 py-3 text-[1.1rem] font-bold text-slate-600 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300',
    },
  });
}

// ---- Confirmaciones: subtítulo gris + avatar con iniciales + pregunta ----

function alertaConfirmar(c: {
  tono: Tono;
  icono: 'warning' | 'question';
  iconoSvg: string;
  verbo: string;
  entidad: string;
  nombre: string;
  subtitulo: string;
  confirmar: string;
  confirmarIzquierda?: boolean;
  enfocarCancelar?: boolean;
}) {

  const html = `
    <p class="m-0 text-[1.1rem] leading-snug text-slate-400">${escaparHtml(c.subtitulo)}</p>
    <div class="mt-4 flex items-center gap-3.5">
      <span class="flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">${escaparHtml(inicialesAlerta(c.nombre))}</span>
      <p class="m-0 text-[1.15rem] leading-snug text-slate-700">¿${c.verbo} a <strong class="font-bold">${escaparHtml(c.nombre)}</strong>?</p>
    </div>
  `;

  return mostrarAlerta({
    tono: c.tono,
    icono: c.icono,
    iconoSvg: c.iconoSvg,
    titulo: `${c.verbo} ${c.entidad}`,
    html,
    confirmar: c.confirmar,
    cancelar: 'Cancelar',
    confirmarIzquierda: c.confirmarIzquierda,
    enfocarCancelar: c.enfocarCancelar,
  });
}

// Imagen 1: rojo
function alertaEliminar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'rojo', icono: 'warning', iconoSvg: ICONOS.papelera,
    verbo: 'Eliminar', entidad, nombre,
    subtitulo: 'Acción permanente · no se puede deshacer',
    confirmar: 'Sí, eliminar',
    enfocarCancelar: true,
  });
}

// Imagen 2: ámbar
function alertaDesactivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.prohibido,
    verbo: 'Desactivar', entidad, nombre,
    subtitulo: 'Cambio reversible · puedes reactivarlo luego',
    confirmar: 'Sí, desactivar',
  });
}

// Imagen 3: azul ("Sí, editar" va a la izquierda)
function alertaEditar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'azul', icono: 'question', iconoSvg: ICONOS.lapiz,
    verbo: 'Editar', entidad, nombre,
    subtitulo: 'Se abrirá el formulario de edición',
    confirmar: 'Sí, editar',
    confirmarIzquierda: true,
  });
}

// Misma forma que Editar, en verde
function alertaActivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'verde', icono: 'question', iconoSvg: ICONOS.check,
    verbo: 'Activar', entidad, nombre,
    subtitulo: 'Volverá a estar activo · puedes desactivarlo luego',
    confirmar: 'Sí, activar',
    confirmarIzquierda: true,
  });
}

// ---- Avisos: mismo panel, título y texto; un solo botón a la derecha ----

function htmlMensaje(mensaje?: string): string | undefined {
  return mensaje
    ? `<p class="m-0 text-[1.15rem] leading-snug text-slate-700">${escaparHtml(mensaje)}</p>`
    : undefined;
}

// Se cierra solo a los 1,8 s (sin botones)
function alertaExito(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'verde', icono: 'success', iconoSvg: ICONOS.check,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar', autoCerrar: true,
  });
}

// Siempre lleva botón, para que no se pierda
function alertaError(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'rojo', icono: 'error', iconoSvg: ICONOS.equis,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
  });
}

function alertaAdvertencia(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.alerta,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
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
export class Login {

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
    private socialAuthService: SocialAuthService

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
        }

        this.mensaje =
          respuesta.mensaje ||
          'Has iniciado sesión correctamente.';

        alertaExito('¡Bienvenido!', this.mensaje).then(() => {
        this.router.navigate(['/dashboard']);
          });

      },

      error: (respuestaError) => {

        console.log(respuestaError);

        this.cargando = false;

        this.cd.detectChanges();

       alertaError('Error', 'Credenciales inválidas');

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

          }


          alertaExito('¡Bienvenido!', 'Inicio de sesión con Google exitoso.')
            .then(() => {

              this.router.navigate([
                '/dashboard'
              ]);

            });


        },


        error: (error) => {

          console.log(
            'Error backend Google:',
            error
          );


          alertaAdvertencia('Usuario no registrado', error.error.error || 'Debe crear una cuenta para ingresar con Google.');


        }

      });

  }

}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
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
    private cd: ChangeDetectorRef
  ) { }

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

      Swal.fire({
        title: 'Campos vacíos',
        text: 'Ingresa tu correo y contraseña.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    // VALIDAR FORMATO DEL CORREO
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoCorreo.test(this.usuario.correo.trim())) {

      Swal.fire({
        title: 'Correo inválido',
        text: 'Ingresa un correo electrónico válido.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });

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

        Swal.fire({
          title: '¡Bienvenido!',
          text: this.mensaje,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#3B5BDB'
        }).then(() => {

          this.router.navigate(['/dashboard']);

        });

      },

      error: (respuestaError) => {

        console.log(respuestaError);

        this.cargando = false;

        this.cd.detectChanges();

        Swal.fire({
          title: 'Error',
          text: 'Credenciales invalidas',
          icon: 'error',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#ff2a00'
        });

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

      Swal.fire({
        title: 'Correo requerido',
        text: 'Ingresa tu correo electrónico.',
        icon: 'warning'
      });

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

        Swal.fire({
          title: 'Error',
          text: 'Credenciales inválidas',
          icon: 'error',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#3B5BDB'
        });

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

        Swal.fire({
          title: 'Contraseña actualizada',
          text: 'Ya puedes iniciar sesión.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

      },

      error: (error) => {

        this.cambiandoPassword = false;

        this.cd.detectChanges();

        Swal.fire({
          title: 'Error',
          text:
            error.error.error ||
            'No se pudo cambiar la contraseña.',
          icon: 'error'
        });

      }

    });
  }

}
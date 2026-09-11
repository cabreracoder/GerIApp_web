import { API_URL } from '../config/api.config';
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


  usuario = {
    correo: '',
    contrasena: ''
  };


  mensaje = '';
  error = '';
  cargando = false;
  cargandoRecuperacion = false;



  // ==========================
  // RECUPERACIÓN CONTRASEÑA
  // ==========================

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

  constructor(
    private http: HttpClient,
    private router: Router,
    private cd: ChangeDetectorRef

  ) { }

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
        confirmButtonColor: '#ff9100'
      });


      return;

    }



    this.cargando = true;



    this.http.post<any>(
      `${API_URL}/usuarios/login/`,
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

          confirmButtonColor: '#4f46e5'

        }).then(() => {


          this.router.navigate(['/dashboard']);


        });



      },



      error: (respuestaError) => {


        console.log(respuestaError);

        this.cargando = false;
        this.cd.detectChanges();

        Swal.fire({

          title: "Error",

          text: "Credenciales invalidas",

          icon: "error",

          confirmButtonText: "Continuar",

          confirmButtonColor: "#ff2a00"

        });


      }



    });



  }





  registro(): void {


    this.router.navigate(['/registro']);


  }





  // ==========================
  // MODAL RECUPERACIÓN
  // ==========================


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
  enviarCodigo() {
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
      `${API_URL}/usuarios/recuperar-password/`,
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
          text: error.error.error,
          icon: 'error'
        });

      }

    });

  }
  verificarCodigo() {

    if (this.verificandoCodigo) {
      return;
    }


    if (!this.codigo.trim()) {

      this.errorCodigo = "Ingresa el código.";

      return;

    }


    this.verificandoCodigo = true;

    this.errorCodigo = "";


    this.http.post<any>(
      `${API_URL}/usuarios/verificar-codigo/`,
      {
        correo: this.correoRecuperacion,
        codigo: this.codigo.trim()
      }

    ).subscribe({

      next: () => {


        this.verificandoCodigo = false;


        this.errorCodigo = "";


        this.pasoRecuperacion = 3;


        this.cd.detectChanges();


      },


      error: (error) => {


        console.log("Error código:", error);


        this.verificandoCodigo = false;


        this.errorCodigo =
          error.error.error ||
          "Código inválido.";


        this.cd.detectChanges();


      }

    });


  }
  cambiarPasswordRecuperacion() {


    if (this.cambiandoPassword) {
      return;
    }


    if (this.nuevaContrasena !== this.confirmarContrasena) {

      this.errorPassword =
        'Las contraseñas no coinciden';

      return;

    }


    this.errorPassword = '';

    this.cambiandoPassword = true;



    this.http.post<any>(

      `${API_URL}/usuarios/cambiar-password-recuperacion/`,

      {

        correo: this.correoRecuperacion,

        codigo: this.codigo,

        nueva_contrasena: this.nuevaContrasena

      }

    ).subscribe({

      next: (respuesta) => {


        this.cambiandoPassword = false;

        // cerrar modal de nueva contraseña
        this.mostrarRecuperacion = false;
        this.cd.detectChanges();
        // reiniciar pasos
        this.pasoRecuperacion = 1;

        // limpiar campos
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

          text: error.error.error ||
            'No se pudo cambiar la contraseña.',

          icon: 'error'

        });


      }

    });


  }

}
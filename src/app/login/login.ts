
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  iniciarSesion(): void {

    // Limpiar mensajes anteriores
    this.mensaje = '';
    this.error = '';

    // Validar campos
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

    // Enviar datos directamente a la API de Django
    this.http.post<any>(
      'http://127.0.0.1:8000/api/usuarios/login/',
      {
        correo: this.usuario.correo.trim(),
        contrasena: this.usuario.contrasena
      }
    ).subscribe({

      next: (respuesta) => {

        this.cargando = false;

        console.log('Respuesta del login:', respuesta);

        // Guardar los datos del usuario autenticado
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
        Swal.fire({
          title: "Error",
          text: "Credenciales invalidas",
          icon: "error",
          confirmButtonText: "Continuar",
          confirmButtonColor: "#ff2a00"
        })
      }

    });
  }

  registro(): void {

    this.router.navigate(['/registro']);

  }
}


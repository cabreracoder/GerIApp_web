
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  usuario = {
    tipo_documento: '',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    contrasena: ''
  };

  mensaje = '';
  error = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  registrar(): void {

    // Limpiar mensajes anteriores
    this.mensaje = '';
    this.error = '';

    // Validar campos obligatorios
    if (
      !this.usuario.tipo_documento.trim() ||
      !this.usuario.numero_documento.trim() ||
      !this.usuario.nombres.trim() ||
      !this.usuario.apellidos.trim() ||
      !this.usuario.correo.trim() ||
      !this.usuario.contrasena.trim()
    ) {

      Swal.fire({
        title: 'Campos vacíos',
        text: 'Por favor completa todos los campos obligatorios.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#ff9100'
      });

      return;
    }

    this.cargando = true;

    // Conexión directa con la API de Django
    this.http.post<any>(
      'http://127.0.0.1:8000/api/usuarios/registro/',
      this.usuario
    ).subscribe({

      next: (respuesta) => {

        this.cargando = false;

        console.log(
          'Usuario registrado correctamente:',
          respuesta
        );

        Swal.fire({
          title: 'Registro exitoso',
          text: 'Tu usuario ha sido registrado correctamente.',
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#4f46e5'
        }).then(() => {

          // Después de registrarse, ir al login
          this.router.navigate(['/login']);

        });
      },

      error: (respuestaError) => {

        this.cargando = false;

        console.error(
          'Error en el registro:',
          respuestaError
        );

        let mensajeError =
          'No fue posible registrar el usuario.';

        if (respuestaError.error?.correo) {

          mensajeError = Array.isArray(
            respuestaError.error.correo
          )
            ? respuestaError.error.correo[0]
            : respuestaError.error.correo;

        } else if (respuestaError.error?.numero_documento) {

          mensajeError = Array.isArray(
            respuestaError.error.numero_documento
          )
            ? respuestaError.error.numero_documento[0]
            : respuestaError.error.numero_documento;

        } else if (respuestaError.error?.error) {

          mensajeError = respuestaError.error.error;

        } else if (respuestaError.status === 0) {

          mensajeError =
            'No se pudo conectar con el servidor. ' +
            'Verifica que Django esté ejecutándose.';
        }

        this.error = mensajeError;

        Swal.fire({
          title: 'Error',
          text: mensajeError,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#ff2a00'
        });
      }
    });
  }

  login(): void {

    // Ir al formulario de inicio de sesión
    this.router.navigate(['/login']);

  }
}


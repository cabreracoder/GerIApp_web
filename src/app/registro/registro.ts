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

  confirmarContrasena = '';
  fotoSeleccionada: File | null = null;

  mensaje = '';
  error = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // Seleccionar la foto de perfil
  seleccionarFoto(evento: Event): void {

    const input = evento.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {

      this.fotoSeleccionada = input.files[0];

      console.log(
        'Foto seleccionada:',
        this.fotoSeleccionada
      );
    }
  }

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
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    // Validar formato del correo
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

    // Validar número de dígitos del documento de identidad
    const formatoDocumento = /^\d{8}$|^\d{10}$/;

    if (!formatoDocumento.test(this.usuario.numero_documento.trim())) {

      Swal.fire({
        title: 'Número de documento inválido',
        text: 'El número de documento debe contener exactamente 8 o 10 dígitos.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    // Validar confirmación de contraseña
    if (this.usuario.contrasena !== this.confirmarContrasena) {

      Swal.fire({
        title: 'Contraseñas no coinciden',
        text: 'La contraseña y su confirmación deben ser iguales.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    this.cargando = true;

    // Crear FormData para enviar los datos y la imagen
    const datosFormulario = new FormData();

    datosFormulario.append(
      'tipo_documento',
      this.usuario.tipo_documento
    );

    datosFormulario.append(
      'numero_documento',
      this.usuario.numero_documento
    );

    datosFormulario.append(
      'nombres',
      this.usuario.nombres
    );

    datosFormulario.append(
      'apellidos',
      this.usuario.apellidos
    );

    datosFormulario.append(
      'correo',
      this.usuario.correo
    );

    datosFormulario.append(
      'telefono',
      this.usuario.telefono
    );

    datosFormulario.append(
      'contrasena',
      this.usuario.contrasena
    );

    // Agregar la foto si fue seleccionada
    if (this.fotoSeleccionada) {

      datosFormulario.append(
        'foto',
        this.fotoSeleccionada
      );
    }

    // Enviar los datos a Django
    this.http.post<any>(
      'http://localhost:8000/api/usuarios/registro/',
      datosFormulario
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
          confirmButtonColor: '#3B5BDB'
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
          confirmButtonColor: '#3B5BDB'
        });
      }
    });
  }

  login(): void {

    // Ir al formulario de inicio de sesión
    this.router.navigate(['/login']);

  }
}
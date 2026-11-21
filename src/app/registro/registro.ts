import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';

import Swal from 'sweetalert2';


// ============================================================
// ALERTAS GERIAPP - SWEETALERT2
// Mismo diseño institucional global utilizado en Configuración.
// ============================================================

type TonoAlerta = 'rojo' | 'ambar' | 'azul' | 'verde';

interface ConfigAlerta {
  titulo: string;
  mensaje?: string;
  tono: TonoAlerta;
  confirmar: string;
  cancelar?: string;
  mostrarCheck?: boolean;
  autoCerrar?: boolean;
}

function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function contenidoAlerta(titulo: string, mensaje = '', mostrarCheck = false): string {
  return `
    <div class="geri-alerta">
      <div class="geri-alerta__onda"></div>
      <div class="geri-alerta__contenido">
        <img src="/Logo-GerIApp.png" class="geri-alerta__logo" alt="GeriApp"
             onerror="this.style.display='none'">
        ${mostrarCheck ? '<div class="geri-alerta__check">✓</div>' : ''}
        <h2 class="geri-alerta__titulo">${escaparHtml(titulo)}</h2>
        ${mensaje ? `<p class="geri-alerta__mensaje">${escaparHtml(mensaje)}</p>` : ''}
      </div>
    </div>
  `;
}

function mostrarAlerta(config: ConfigAlerta) {
  return Swal.fire({
    html: contenidoAlerta(config.titulo, config.mensaje, config.mostrarCheck),
    width: 520,
    padding: 0,
    showCancelButton: !!config.cancelar,
    showConfirmButton: !config.autoCerrar,
    confirmButtonText: config.confirmar,
    cancelButtonText: config.cancelar || 'Cancelar',
    reverseButtons: true,
    buttonsStyling: false,
    allowOutsideClick: false,
    allowEscapeKey: true,
    heightAuto: false,
    scrollbarPadding: false,
    timer: config.autoCerrar ? 1800 : undefined,
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

function alertaExito(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    titulo,
    mensaje: mensaje || 'La operación se realizó correctamente.',
    tono: 'verde',
    confirmar: 'Aceptar',
    mostrarCheck: true,
    autoCerrar: true
  });
}

function alertaError(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    titulo,
    mensaje: mensaje || 'Ocurrió un error al realizar la operación.',
    tono: 'rojo',
    confirmar: 'Aceptar'
  });
}

function alertaAdvertencia(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    titulo,
    mensaje: mensaje || 'Revisa la información e inténtalo nuevamente.',
    tono: 'ambar',
    confirmar: 'Aceptar'
  });
}

// ============================================================
// FIN ALERTAS GERIAPP
// ============================================================


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

  ) { }


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


      alertaAdvertencia('Campos vacíos', 'Por favor completa todos los campos obligatorios.');


      return;

    }


    // Validar formato del correo

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!formatoCorreo.test(this.usuario.correo.trim())) {


      alertaAdvertencia('Correo inválido', 'Ingresa un correo electrónico válido.');


      return;

    }


    // Validar número de dígitos del documento de identidad

    const formatoDocumento = /^\d{8}$|^\d{10}$/;


    if (!formatoDocumento.test(this.usuario.numero_documento.trim())) {


      alertaAdvertencia('Número de documento inválido', 'El número de documento debe contener exactamente 8 o 10 dígitos.');


      return;

    }


    // Validar confirmación de contraseña

    if (this.usuario.contrasena !== this.confirmarContrasena) {


      alertaAdvertencia('Contraseñas no coinciden', 'La contraseña y su confirmación deben ser iguales.');


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

      'https://geriapp-backend.onrender.com/api/usuarios/registro/',

      datosFormulario

    ).subscribe({


      next: (respuesta) => {


        this.cargando = false;


        console.log(

          'Usuario registrado correctamente:',

          respuesta

        );


        alertaExito('Registro exitoso', 'Tu usuario ha sido registrado correctamente.').then(() => {

          //despues de registrarse, redirigir al login

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


        alertaError('Error', mensajeError);

      }

    });

  }


  login(): void {


    // Ir al formulario de inicio de sesión

    this.router.navigate(['/login']);


  }

}
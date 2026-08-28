
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'critica' | 'advertencia' | 'informacion';
  tiempo: string;
  leida: boolean;
  icono: string;
  destinatario?: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones {

  // =========================================================
  // NAVEGACIÓN
  // =========================================================

  pestanaActual: string = 'bandeja';


  // =========================================================
  // FILTROS
  // =========================================================

  textoBusqueda: string = '';

  tipoFiltro: string = 'todos';


  // =========================================================
  // FORMULARIO DE NOTIFICACIÓN
  // =========================================================

  destinatarioSeleccionado: string = '';

  tipoNotificacion: 'critica' | 'advertencia' | 'informacion' =
    'informacion';

  tituloNotificacion: string = '';

  mensajeNotificacion: string = '';


  // =========================================================
  // MENSAJES
  // =========================================================

  mensajeError: string = '';

  mensajeExito: string = '';

  mensajeConfiguracion: string = '';


  // =========================================================
  // CONFIGURACIÓN
  // =========================================================

  notificacionesActivas: boolean = true;

  emailActivo: boolean = true;

  smsActivo: boolean = true;

  notificacionesPushActivas: boolean = true;


  // =========================================================
  // DATOS
  // =========================================================

  notificaciones: Notificacion[] = [];


  // =========================================================
  // CAMBIAR PESTAÑA
  // =========================================================

  cambiarPestana(pestana: string): void {

    this.pestanaActual = pestana;

    this.mensajeError = '';

    this.mensajeExito = '';

  }


  // =========================================================
  // RESUMEN
  // =========================================================

  get totalNotificaciones(): number {

    return this.notificaciones.length;

  }


  get totalNoLeidas(): number {

    return this.notificaciones.filter(
      notificacion => !notificacion.leida
    ).length;

  }


  get totalCriticas(): number {

    return this.notificaciones.filter(
      notificacion => notificacion.tipo === 'critica'
    ).length;

  }


  get totalAdvertencias(): number {

    return this.notificaciones.filter(
      notificacion => notificacion.tipo === 'advertencia'
    ).length;

  }


  // =========================================================
  // CONTADOR DE CARACTERES
  // =========================================================

  get caracteresRestantes(): number {

    return 300 - this.mensajeNotificacion.length;

  }


  // =========================================================
  // FILTRAR NOTIFICACIONES
  // =========================================================

  get notificacionesFiltradas(): Notificacion[] {

    const texto = this.textoBusqueda
      .toLowerCase()
      .trim();

    return this.notificaciones.filter(
      notificacion => {

        const coincideTexto =
          !texto ||
          notificacion.titulo
            .toLowerCase()
            .includes(texto) ||
          notificacion.mensaje
            .toLowerCase()
            .includes(texto);

        const coincideTipo =
          this.tipoFiltro === 'todos' ||
          notificacion.tipo === this.tipoFiltro;

        return coincideTexto && coincideTipo;

      }
    );

  }


  // =========================================================
  // ENVIAR NOTIFICACIÓN
  // =========================================================

  enviarNotificacionManual(): void {

    this.mensajeError = '';

    this.mensajeExito = '';


    // Validar destinatario

    if (!this.destinatarioSeleccionado.trim()) {

      this.mensajeError =
        'Debe seleccionar un destinatario válido.';

      return;

    }


    // Validar título

    if (!this.tituloNotificacion.trim()) {

      this.mensajeError =
        'Debe ingresar un título para la notificación.';

      return;

    }


    // Validar mensaje

    if (!this.mensajeNotificacion.trim()) {

      this.mensajeError =
        'El contenido del mensaje no puede estar vacío.';

      return;

    }


    // Crear notificación

    const nuevaNotificacion: Notificacion = {

      id: Date.now(),

      titulo: this.tituloNotificacion.trim(),

      mensaje: this.mensajeNotificacion.trim(),

      tipo: this.tipoNotificacion,

      tiempo: 'Hace un momento',

      leida: false,

      icono: this.obtenerIcono(
        this.tipoNotificacion
      ),

      destinatario: this.destinatarioSeleccionado

    };


    // Agregar la notificación

    this.notificaciones.unshift(
      nuevaNotificacion
    );


    this.mensajeExito =
      'Notificación enviada y registrada correctamente.';


    // Limpiar formulario

    this.limpiarFormulario();


    // Regresar a la bandeja

    setTimeout(() => {

      this.pestanaActual = 'bandeja';

      this.mensajeExito = '';

    }, 1500);

  }


  // =========================================================
  // OBTENER ICONO
  // =========================================================

  private obtenerIcono(
    tipo: 'critica' | 'advertencia' | 'informacion'
  ): string {

    switch (tipo) {

      case 'critica':

        return 'fa-solid fa-triangle-exclamation';


      case 'advertencia':

        return 'fa-solid fa-circle-exclamation';


      default:

        return 'fa-regular fa-bell';

    }

  }


  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  private limpiarFormulario(): void {

    this.tituloNotificacion = '';

    this.mensajeNotificacion = '';

    this.destinatarioSeleccionado = '';

    this.tipoNotificacion = 'informacion';

  }


  // =========================================================
  // MARCAR UNA NOTIFICACIÓN COMO LEÍDA
  // =========================================================

  marcarLeida(id: number): void {

    const notificacion =
      this.notificaciones.find(
        item => item.id === id
      );

    if (notificacion) {

      notificacion.leida = true;

    }

  }


  // =========================================================
  // MARCAR TODAS COMO LEÍDAS
  // =========================================================

  marcarTodasLeidas(): void {

    this.notificaciones.forEach(
      notificacion => {

        notificacion.leida = true;

      }
    );

  }


  // =========================================================
  // ELIMINAR NOTIFICACIÓN
  // =========================================================

  eliminarNotificacion(id: number): void {

    this.notificaciones =
      this.notificaciones.filter(
        notificacion => notificacion.id !== id
      );

  }


  // =========================================================
  // VER DETALLE
  // =========================================================

  verDetalle(notificacion: Notificacion): void {

    alert(
      `Título: ${notificacion.titulo}\n\n` +
      `Mensaje: ${notificacion.mensaje}\n\n` +
      `Destinatario: ${
        notificacion.destinatario || 'General'
      }`
    );

  }


  // =========================================================
  // GUARDAR CONFIGURACIÓN
  // =========================================================

  guardarConfiguracion(): void {

    this.mensajeConfiguracion =
      'Configuración de canales guardada correctamente.';


    setTimeout(() => {

      this.mensajeConfiguracion = '';

    }, 2500);

  }

}

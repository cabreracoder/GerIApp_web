import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Notificacion {

  id: number;

  titulo: string;

  descripcion: string;

  tiempo: string;

  icono: string;

  tipo: 'critical' | 'warning' | 'info';

  leida: boolean;

}


@Component({

  selector: 'app-notificaciones',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './notificaciones.html',

  styleUrl: './notificaciones.css'

})


export class Notificaciones {


  // =========================================================
  // TEXTO
  // =========================================================

  subtitulo =
    'Mantente informado sobre las novedades de la Fundación Geriátrica';


  // =========================================================
  // BÚSQUEDA
  // =========================================================

  textoBusqueda = '';


  // =========================================================
  // FILTRO ACTIVO
  // =========================================================

  filtroActivo: 'todas' | 'no-leidas' | 'critical' | 'warning' = 'todas';


  // =========================================================
  // NOTIFICACIONES
  // =========================================================

  notificaciones: Notificacion[] = [

    {
      id: 1,

      titulo: 'Paciente requiere atención',

      descripcion:
        'El paciente Carlos Rodríguez presenta signos que requieren valoración médica.',

      tiempo: 'Hace 10 minutos',

      icono: 'emergency',

      tipo: 'critical',

      leida: false
    },


    {
      id: 2,

      titulo: 'Medicamento pendiente',

      descripcion:
        'La administración del medicamento de María López está pendiente.',

      tiempo: 'Hace 25 minutos',

      icono: 'medication',

      tipo: 'warning',

      leida: false
    },


    {
      id: 3,

      titulo: 'Nuevo encargado registrado',

      descripcion:
        'Se ha registrado un nuevo encargado en el sistema administrativo.',

      tiempo: 'Hace 1 hora',

      icono: 'person_add',

      tipo: 'info',

      leida: false
    },


    {
      id: 4,

      titulo: 'Control médico completado',

      descripcion:
        'El control médico del paciente Juan Pérez fue registrado correctamente.',

      tiempo: 'Hace 2 horas',

      icono: 'health_and_safety',

      tipo: 'info',

      leida: true
    },


    {
      id: 5,

      titulo: 'Cuidador disponible',

      descripcion:
        'El cuidador asignado se encuentra disponible para iniciar su turno.',

      tiempo: 'Hace 3 horas',

      icono: 'person',

      tipo: 'info',

      leida: true
    },


    {
      id: 6,

      titulo: 'Paciente en observación',

      descripcion:
        'Se ha actualizado el estado de un paciente a observación.',

      tiempo: 'Ayer',

      icono: 'visibility',

      tipo: 'warning',

      leida: true
    }

  ];


  // =========================================================
  // CANTIDAD DE CRÍTICAS
  // =========================================================

  get cantidadCriticas(): number {

    return this.notificaciones.filter(
      notificacion =>
        notificacion.tipo === 'critical'
    ).length;

  }


  // =========================================================
  // CANTIDAD DE ADVERTENCIAS
  // =========================================================

  get cantidadAdvertencias(): number {

    return this.notificaciones.filter(
      notificacion =>
        notificacion.tipo === 'warning'
    ).length;

  }


  // =========================================================
  // NOTIFICACIONES FILTRADAS
  // =========================================================

  get notificacionesFiltradas(): Notificacion[] {

    const termino =
      this.textoBusqueda
        .trim()
        .toLowerCase();


    return this.notificaciones.filter(
      notificacion => {

        // -----------------------------------------------
        // FILTRO POR CATEGORÍA
        // -----------------------------------------------

        let coincideFiltro = true;


        if (this.filtroActivo === 'no-leidas') {

          coincideFiltro =
            !notificacion.leida;

        }


        if (this.filtroActivo === 'critical') {

          coincideFiltro =
            notificacion.tipo === 'critical';

        }


        if (this.filtroActivo === 'warning') {

          coincideFiltro =
            notificacion.tipo === 'warning';

        }


        // -----------------------------------------------
        // FILTRO POR TEXTO
        // -----------------------------------------------

        const coincideBusqueda =
          !termino

          ||

          notificacion.titulo
            .toLowerCase()
            .includes(termino)

          ||

          notificacion.descripcion
            .toLowerCase()
            .includes(termino)

          ||

          notificacion.tipo
            .toLowerCase()
            .includes(termino);


        return coincideFiltro && coincideBusqueda;

      }
    );

  }


  // =========================================================
  // NOTIFICACIONES NO LEÍDAS
  // =========================================================

  get notificacionesNoLeidas(): number {

    return this.notificaciones.filter(
      notificacion =>
        !notificacion.leida
    ).length;

  }


  // =========================================================
  // FILTRAR NOTIFICACIONES
  // =========================================================

  filtrarNotificaciones(): void {

    /*
     * La lista se actualiza automáticamente porque
     * notificacionesFiltradas es un getter.
     *
     * Este método existe para que el HTML pueda
     * ejecutar (input)="filtrarNotificaciones()"
     */

  }


  // =========================================================
  // CAMBIAR FILTRO
  // =========================================================

  cambiarFiltro(
    filtro: 'todas' | 'no-leidas' | 'critical' | 'warning'
  ): void {

    this.filtroActivo = filtro;

  }


  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  limpiarFiltros(): void {

    this.textoBusqueda = '';

    this.filtroActivo = 'todas';

  }


  // =========================================================
  // MARCAR UNA COMO LEÍDA
  // =========================================================

  marcarComoLeida(
    notificacion: Notificacion
  ): void {

    notificacion.leida = true;

  }


  // =========================================================
  // MARCAR TODAS COMO LEÍDAS
  // =========================================================

  marcarTodasLeidas(): void {

    this.notificaciones =
      this.notificaciones.map(
        notificacion => ({

          ...notificacion,

          leida: true

        })
      );

  }


  // =========================================================
  // ELIMINAR
  // =========================================================

  eliminarNotificacion(
    id: number
  ): void {

    this.notificaciones =
      this.notificaciones.filter(
        notificacion =>
          notificacion.id !== id
      );

  }


  // =========================================================
  // LIMPIAR BÚSQUEDA
  // =========================================================

  limpiarBusqueda(): void {

    this.textoBusqueda = '';

  }

}
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Notificacion {
  id: number;
  tipo: 'critical' | 'warning' | 'info';
  icono: string;
  titulo: string;
  descripcion: string;
  tiempo: string;
  leida: boolean;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css'
})
export class Notificaciones {

  textoBusqueda = '';

  notificaciones: Notificacion[] = [
    {
      id: 1,
      tipo: 'critical',
      icono: 'warning',
      titulo: 'Alerta médica de paciente',
      descripcion: 'Se requiere atención inmediata para un paciente registrado en el sistema.',
      tiempo: 'Hace 10 minutos',
      leida: false
    },
    {
      id: 2,
      tipo: 'warning',
      icono: 'schedule',
      titulo: 'Turno próximo a finalizar',
      descripcion: 'El turno de un cuidador está próximo a finalizar. Verifique la disponibilidad del siguiente turno.',
      tiempo: 'Hace 25 minutos',
      leida: false
    },
    {
      id: 3,
      tipo: 'info',
      icono: 'person_add',
      titulo: 'Nuevo cuidador registrado',
      descripcion: 'Se ha registrado un nuevo cuidador en el sistema.',
      tiempo: 'Hace 1 hora',
      leida: false
    },
    {
      id: 4,
      tipo: 'warning',
      icono: 'description',
      titulo: 'Documento pendiente',
      descripcion: 'Existe documentación pendiente de revisión en el sistema.',
      tiempo: 'Hace 2 horas',
      leida: false
    },
    {
      id: 5,
      tipo: 'info',
      icono: 'event',
      titulo: 'Nuevo evento programado',
      descripcion: 'Se ha agregado una nueva actividad al calendario de la fundación.',
      tiempo: 'Hace 3 horas',
      leida: true
    },
    {
      id: 6,
      tipo: 'critical',
      icono: 'medical_services',
      titulo: 'Revisión médica pendiente',
      descripcion: 'Hay una revisión médica que requiere ser atendida.',
      tiempo: 'Ayer',
      leida: true
    }
  ];

  get notificacionesFiltradas(): Notificacion[] {
    const texto = this.textoBusqueda.trim().toLowerCase();

    if (!texto) {
      return this.notificaciones;
    }

    return this.notificaciones.filter(notificacion =>
      notificacion.titulo.toLowerCase().includes(texto) ||
      notificacion.descripcion.toLowerCase().includes(texto) ||
      notificacion.tipo.toLowerCase().includes(texto)
    );
  }

  get notificacionesNoLeidas(): number {
    return this.notificaciones.filter(n => !n.leida).length;
  }

  get subtitulo(): string {
    const cantidad = this.notificacionesNoLeidas;

    if (cantidad === 0) {
      return 'No tienes notificaciones pendientes';
    }

    if (cantidad === 1) {
      return 'Tienes 1 notificación sin leer';
    }

    return `Tienes ${cantidad} notificaciones sin leer`;
  }

  marcarComoLeida(notificacion: Notificacion): void {
    notificacion.leida = true;
  }

  marcarTodasLeidas(): void {
    this.notificaciones.forEach(notificacion => {
      notificacion.leida = true;
    });
  }

  eliminarNotificacion(id: number): void {
    this.notificaciones = this.notificaciones.filter(
      notificacion => notificacion.id !== id
    );
  }

  limpiarBusqueda(): void {
    this.textoBusqueda = '';
  }
}
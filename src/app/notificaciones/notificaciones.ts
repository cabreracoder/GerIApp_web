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
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones {
  filtroTexto: string = '';
  filtroCategoria: string = 'todas';

  // Datos mock alineados con el diseño y requerimientos de las HU (SCRUM-76 a SCRUM-80)
  listaNotificaciones: Notificacion[] = [
    {
      id: 1,
      titulo: 'Paciente requiere atención',
      mensaje: 'El paciente Carlos Rodríguez presenta signos que requieren valoración médica inmediata.',
      tipo: 'critica',
      tiempo: 'Hace 10 minutos',
      leida: false,
      icono: 'fa-solid fa-asterisk'
    },
    {
      id: 2,
      titulo: 'Medicamento pendiente',
      mensaje: 'La administración del medicamento de María López está pendiente según el turno asignado.',
      tipo: 'advertencia',
      tiempo: 'Hace 25 minutos',
      leida: false,
      icono: 'fa-solid fa-pills'
    },
    {
      id: 3,
      titulo: 'Nuevo encargado registrado',
      mensaje: 'Se ha registrado un nuevo encargado en el sistema administrativo con rol de cuidador.',
      tipo: 'informacion',
      tiempo: 'Hace 1 hora',
      leida: false,
      icono: 'fa-solid fa-user-plus'
    },
    {
      id: 4,
      titulo: 'Control médico completado',
      mensaje: 'El control médico del paciente Juan Pérez fue registrado correctamente.',
      tipo: 'informacion',
      tiempo: 'Hace 2 horas',
      leida: true,
      icono: 'fa-solid fa-shield-heart'
    }
  ];

  get totalNotificaciones(): number {
    return this.listaNotificaciones.length;
  }

  get totalNoLeidas(): number {
    return this.listaNotificaciones.filter(n => !n.leida).length;
  }

  get totalCriticas(): number {
    return this.listaNotificaciones.filter(n => n.tipo === 'critica').length;
  }

  get totalAdvertencias(): number {
    return this.listaNotificaciones.filter(n => n.tipo === 'advertencia').length;
  }

  get notificacionesFiltradas(): Notificacion[] {
    return this.listaNotificaciones.filter(item => {
      const coincideTexto = item.titulo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
                            item.mensaje.toLowerCase().includes(this.filtroTexto.toLowerCase());
      
      let coincideCategoria = true;
      if (this.filtroCategoria === 'no_leidas') {
        coincideCategoria = !item.leida;
      } else if (this.filtroCategoria === 'critica') {
        coincideCategoria = item.tipo === 'critica';
      } else if (this.filtroCategoria === 'advertencia') {
        coincideCategoria = item.tipo === 'advertencia';
      }

      return coincideTexto && coincideCategoria;
    });
  }

  marcarLeida(id: number) {
    const notif = this.listaNotificaciones.find(n => n.id === id);
    if (notif) {
      notif.leida = true;
    }
  }

  marcarTodasLeidas() {
    this.listaNotificaciones.forEach(n => n.leida = true);
  }

  eliminarNotificacion(id: number) {
    this.listaNotificaciones = this.listaNotificaciones.filter(n => n.id !== id);
  }

  abrirModalEnvio() {
    // Lógica para desplegar el modal de envío manual o creación de alertas (SCRUM-76 / SCRUM-77)
    alert('Abriendo panel para envío manual de notificación o alerta administrativa.');
  }
}
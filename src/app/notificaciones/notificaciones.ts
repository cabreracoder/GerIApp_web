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
  tabActivo: string = 'bandeja';
  filtroTexto: string = '';

  filtroTipoSeleccionado: string = 'todos';

  nuevoDestinatario: string = '';
  nuevoTipo: 'critica' | 'advertencia' | 'informacion' = 'informacion';
  nuevoTitulo: string = '';
  nuevoMensaje: string = '';
  mensajeError: string = '';
  mensajeExito: string = '';

  sistemaActivo: boolean = true;
  canalEmail: boolean = true;
  canalSms: boolean = true;
  canalPush: boolean = true;
  mensajeConfigExito: string = '';

  listaNotificaciones: Notificacion[] = [
    {
      id: 1,
      titulo: 'Paciente requiere atención médica',
      mensaje: 'El paciente Carlos Rodríguez presenta signos vitales alterados que requieren valoración.',
      tipo: 'critica',
      tiempo: 'Hace 10 minutos',
      leida: false,
      icono: 'fa-solid fa-asterisk',
      destinatario: 'Enfermería'
    },
    {
      id: 2,
      titulo: 'Medicamento pendiente',
      mensaje: 'La administración del medicamento de María López está pendiente según el turno.',
      tipo: 'advertencia',
      tiempo: 'Hace 25 minutos',
      leida: false,
      icono: 'fa-solid fa-pills',
      destinatario: 'Cuidadores'
    },
    {
      id: 3,
      titulo: 'Nuevo encargado registrado',
      mensaje: 'Se ha registrado un nuevo operador en el sistema administrativo.',
      tipo: 'informacion',
      tiempo: 'Hace 1 hora',
      leida: true,
      icono: 'fa-solid fa-user-plus',
      destinatario: 'Todos'
    }
  ];

  cambiarTab(tab: string) {
    this.tabActivo = tab;
    this.mensajeError = '';
    this.mensajeExito = '';
  }

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

  get caracteresRestantes(): number {
    return 300 - (this.nuevoMensaje ? this.nuevoMensaje.length : 0);
  }

  get notificacionesFiltradas(): Notificacion[] {
    return this.listaNotificaciones.filter(item => {
      const matchesText = item.titulo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
                           item.mensaje.toLowerCase().includes(this.filtroTexto.toLowerCase());
      const matchesType = this.filtroTipoSeleccionado === 'todos' || item.tipo === this.filtroTipoSeleccionado;
      return matchesText && matchesType;
    });
  }

  enviarNotificacionManual() {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (!this.nuevoDestinatario || this.nuevoDestinatario.trim() === '') {
      this.mensajeError = 'Error: Debe seleccionar un destinatario válido.';
    }
   if (!this.nuevoTitulo || this.nuevoTitulo.trim() === '' || !this.nuevoMensaje || this.nuevoMensaje.trim() === '') {
      this.mensajeError = 'Error: El título y el contenido del mensaje no pueden estar vacíos.';
      return;
    }

    const nueva: Notificacion = {
      id: Date.now(),
      titulo: this.nuevoTitulo.trim(),
      mensaje: this.nuevoMensaje.trim(),
      tipo: this.nuevoTipo,
      tiempo: 'Hace un momento',
      leida: false,
      icono: this.nuevoTipo === 'critica' ? 'fa-solid fa-triangle-exclamation' : 'fa-regular fa-bell',
      destinatario: this.nuevoDestinatario
    };

    this.listaNotificaciones.unshift(nueva);
    this.mensajeExito = 'Notificación enviada y registrada con éxito en el historial.';
    
    this.nuevoTitulo = '';
    this.nuevoMensaje = '';
    this.nuevoDestinatario = '';

    setTimeout(() => {
      this.tabActivo = 'bandeja';
      this.mensajeExito = '';
    }, 1500);
  }

  marcarLeida(id: number) {
    const item = this.listaNotificaciones.find(n => n.id === id);
    if (item) item.leida = true;
  }

  marcarTodasLeidas() {
    this.listaNotificaciones.forEach(n => n.leida = true);
  }

  eliminarNotificacion(id: number) {
    this.listaNotificaciones = this.listaNotificaciones.filter(n => n.id !== id);
  }

  verDetalle(item: Notificacion) {
    alert(`Detalle del aviso:\nTítulo: ${item.titulo}\nMensaje: ${item.mensaje}\nDestinatario: ${item.destinatario || 'General'}`);
  }

  guardarConfiguracionCanales() {
    this.mensajeConfigExito = 'Configuración de canales y estado almacenada correctamente.';
    setTimeout(() => {
      this.mensajeConfigExito = '';
    }, 2500);
  }
}
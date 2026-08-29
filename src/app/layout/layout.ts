import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

interface OpcionMenu {
  nombre: string;
  icono: string;
  ruta: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],

  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  nombreAplicacion = 'GerIApp';

  textoNuevoRegistro = 'Nuevo Registro';

  textoCerrarSesion = 'Cerrar sesión';

  nombreUsuario = 'Jose Cabrera';

  rolUsuario = 'ADMINISTRADOR';

  inicialesUsuario = 'JC';

  placeholderBuscador = 'Buscar por nombre o documento...';

  menu: OpcionMenu[] = [

    {
      nombre: 'Dashboard',
      icono: 'dashboard',
      ruta: '/dashboard'
    },

    {
      nombre: 'Pacientes',
      icono: 'elderly',
      ruta: '/pacientes'
    },

    {
      nombre: 'Cuidadores',
      icono: 'health_and_safety',
      ruta: '/cuidadores'
    },

    {
      nombre: 'Encargados',
      icono: 'supervisor_account',
      ruta: '/encargados'
    },

    {
      nombre: 'Roles y Permisos',
      icono: 'admin_panel_settings',
      ruta: '/roles'
    },

    {
      nombre: 'Notificaciones',
      icono: 'notifications',
      ruta: '/notificaciones'
    }

  ];

  configuracion: OpcionMenu = {
    nombre: 'Configuración',
    icono: 'settings',
    ruta: '/configuracion'
  };


  cerrarSesion(): void {

    console.log('Cerrando sesión...');

  }

}
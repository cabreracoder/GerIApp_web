import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

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

  menu = [

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

  configuracion = {
    nombre: 'Configuración',
    icono: 'settings',
    ruta: '/configuracion'
  };


  cerrarSesion(): void {

    console.log('Cerrando sesión...');

  }

}
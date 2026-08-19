import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  menu = [
    {
      icono: 'dashboard',
      nombre: 'Dashboard',
      ruta: '/dashboard'
    },
    {
      icono: 'elderly',
      nombre: 'Pacientes',
      ruta: '/pacientes'
    },
    {
      icono: 'health_and_safety',
      nombre: 'Cuidadores',
      ruta: '/cuidadores'
    },
    {
      icono: 'supervisor_account',
      nombre: 'Encargados',
      ruta: '/encargados'
    },
    {
      icono: 'admin_panel_settings',
      nombre: 'Roles',
      ruta: '/roles'
    },
    {
      icono: 'notifications',
      nombre: 'Notificaciones',
      ruta: '/notificaciones'
    }
  ];

  configuracion = {
    icono: 'settings',
    nombre: 'Configuración',
    ruta: '/configuracion'
  };

}
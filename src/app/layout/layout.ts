
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router
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

  constructor(private router: Router) {
    this.cargarUsuario();
  }

  // =========================================================
  // DATOS GENERALES DE LA APLICACIÓN
  // =========================================================

  nombreAplicacion = 'GerIApp';

  textoNuevoRegistro = 'Nuevo Registro';

  textoCerrarSesion = 'Cerrar sesión';

  placeholderBuscador = 'Buscar por nombre o documento...';


  // =========================================================
  // DATOS DEL USUARIO AUTENTICADO
  // =========================================================

  nombreUsuario = '';

  rolUsuario = '';

  inicialesUsuario = '';


  // =========================================================
  // MENÚ
  // =========================================================

  menu: OpcionMenu[] = [

    {
      nombre: 'Dashboard',
      icono: 'dashboard',
      ruta: '/dashboard'
    },

    {
      nombre: 'Usuarios',
      icono: 'people',
      ruta: '/usuarios'
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
      nombre: 'Configuración',
      icono: 'person',
      ruta: '/configuracion'
    }

  ];


  // =========================================================
  // CARGAR USUARIO DESDE LOCALSTORAGE
  // =========================================================

  cargarUsuario(): void {

    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      console.warn('No hay un usuario guardado en localStorage.');
      return;
    }

    try {

      const usuario = JSON.parse(usuarioGuardado);

      // Nombre completo
      this.nombreUsuario =
        `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`.trim();

      // Rol
      this.rolUsuario = usuario.rol ?? '';

      // Iniciales
      const nombres = usuario.nombres ?? '';
      const apellidos = usuario.apellidos ?? '';

      this.inicialesUsuario =
        `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase();

    } catch (error) {

      console.error(
        'Error al leer el usuario guardado en localStorage:',
        error
      );

    }
  }


  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  cerrarSesion(): void {

    console.log('Cerrando sesión...');

    localStorage.removeItem('usuario');

    this.router.navigate(['/login']);
  }

}


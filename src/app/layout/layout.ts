import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
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

interface UsuarioActualizado {
  id_usuario: number;
  id_rol: number | null;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string | null;
  rol?: string;
  [key: string]: any;
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
export class Layout implements OnDestroy {

  // =====================================================
  // LISTENER PARA CAMBIOS DEL USUARIO
  // =====================================================

  private readonly usuarioActualizadoListener =
    (event: Event): void => {

      const evento =
        event as CustomEvent<UsuarioActualizado>;

      const usuario =
        evento.detail;

      if (!usuario) {
        return;
      }

      console.log(
        'LAYOUT - USUARIO ACTUALIZADO:',
        usuario
      );

      this.actualizarDatosUsuario(usuario);

      this.cdr.detectChanges();
    };


  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {

    this.cargarUsuario();

    // ===================================================
    // ESCUCHAR CAMBIOS DE CONFIGURACIÓN
    // ===================================================

    window.addEventListener(
      'usuarioActualizado',
      this.usuarioActualizadoListener
    );
  }


  // =====================================================
  // DATOS GENERALES DE LA APLICACIÓN
  // =====================================================

  nombreAplicacion = 'GerIApp';

  textoNuevoRegistro = 'Nuevo Registro';

  textoCerrarSesion = 'Cerrar sesión';

  placeholderBuscador =
    'Buscar por nombre o documento...';


  // =====================================================
  // DATOS DEL USUARIO AUTENTICADO
  // =====================================================

  nombreUsuario = '';

  rolUsuario = '';

  inicialesUsuario = '';


  // =====================================================
  // MENÚ FLOTANTE DE PACIENTES
  // =====================================================

  pacientesMenuAbierto = false;


  // =====================================================
  // MENÚ PRINCIPAL
  // =====================================================

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


  // =====================================================
  // ABRIR / CERRAR MENÚ DE PACIENTES
  // =====================================================

  togglePacientesMenu(): void {

    this.pacientesMenuAbierto =
      !this.pacientesMenuAbierto;
  }


  // =====================================================
  // CERRAR MENÚ DE PACIENTES
  // =====================================================

  cerrarPacientesMenu(): void {

    this.pacientesMenuAbierto = false;
  }


  // =====================================================
  // CARGAR USUARIO DESDE LOCALSTORAGE
  // =====================================================

  cargarUsuario(): void {

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {

      console.warn(
        'No hay un usuario guardado en localStorage.'
      );

      return;
    }

    try {

      const usuario:
        UsuarioActualizado =
        JSON.parse(usuarioGuardado);

      this.actualizarDatosUsuario(usuario);

    } catch (error) {

      console.error(
        'Error al leer el usuario guardado en localStorage:',
        error
      );
    }
  }


  // =====================================================
  // ACTUALIZAR DATOS DEL USUARIO
  // =====================================================

  private actualizarDatosUsuario(
    usuario: UsuarioActualizado
  ): void {

    // ---------------------------------------------------
    // NOMBRE COMPLETO
    // ---------------------------------------------------

    this.nombreUsuario =
      `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`
        .trim();


    // ---------------------------------------------------
    // ROL
    // ---------------------------------------------------

    this.rolUsuario =
      usuario.rol ?? '';


    // ---------------------------------------------------
    // INICIALES
    // ---------------------------------------------------

    const nombres =
      usuario.nombres ?? '';

    const apellidos =
      usuario.apellidos ?? '';

    this.inicialesUsuario =
      `${nombres.charAt(0)}${apellidos.charAt(0)}`
        .toUpperCase();
  }


  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  cerrarSesion(): void {

    console.log(
      'Cerrando sesión...'
    );

    localStorage.removeItem(
      'usuario'
    );

    this.router.navigate([
      '/login'
    ]);
  }


  // =====================================================
  // DESTRUIR COMPONENTE
  // =====================================================

  ngOnDestroy(): void {

    window.removeEventListener(
      'usuarioActualizado',
      this.usuarioActualizadoListener
    );
  }
}
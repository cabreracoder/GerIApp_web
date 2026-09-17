import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router
} from '@angular/router';
import { HttpClient } from '@angular/common/http';

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
  foto?: string | null;
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
    private cdr: ChangeDetectorRef,
    private http: HttpClient
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
  // API
  // =====================================================

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

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

  // URL de la foto del usuario
  fotoUsuario: string | null = null;

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
      nombre: 'Banco de Datos',
      icono: 'category',
      ruta: '/banco-datos'
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

      console.log(
        'LAYOUT - USUARIO DESDE LOCALSTORAGE:',
        usuario
      );

      // Primero mostramos los datos que ya tenemos
      this.actualizarDatosUsuario(usuario);

      // Después consultamos el backend para obtener
      // la información actualizada, incluida la foto.
      this.cargarFotoDesdeApi(
        usuario.id_usuario
      );

    } catch (error) {

      console.error(
        'Error al leer el usuario guardado en localStorage:',
        error
      );
    }
  }

  // =====================================================
  // CARGAR FOTO DESDE EL BACKEND
  // =====================================================

  private cargarFotoDesdeApi(
    idUsuario: number
  ): void {

    console.log(
      'LAYOUT - CONSULTANDO FOTO DEL USUARIO:',
      idUsuario
    );

    this.http.get<UsuarioActualizado>(
      `${this.apiUrl}/usuarios/${idUsuario}/`
    ).subscribe({

      next: (usuarioApi) => {

        console.log(
          'LAYOUT - USUARIO OBTENIDO DESDE API:',
          usuarioApi
        );

        // Actualizar la foto directamente
        // con la información actual del backend.
        this.fotoUsuario =
          this.normalizarUrlFoto(
            usuarioApi.foto
          );

        console.log(
          'LAYOUT - FOTO OBTENIDA DESDE API:',
          usuarioApi.foto
        );

        console.log(
          'LAYOUT - URL FINAL DE FOTO:',
          this.fotoUsuario
        );

        // Actualizar localStorage para que la próxima
        // carga ya tenga la foto disponible.
        const usuarioGuardado =
          localStorage.getItem('usuario');

        if (usuarioGuardado) {

          try {

            const usuarioLocal:
              UsuarioActualizado =
              JSON.parse(usuarioGuardado);

            const usuarioActualizado:
              UsuarioActualizado = {
              ...usuarioLocal,
              ...usuarioApi
            };

            localStorage.setItem(
              'usuario',
              JSON.stringify(usuarioActualizado)
            );

          } catch (error) {

            console.error(
              'LAYOUT - ERROR AL ACTUALIZAR LOCALSTORAGE:',
              error
            );
          }
        }

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'LAYOUT - ERROR AL CONSULTAR USUARIO:',
          error
        );

        // Si falla la consulta, conservamos los datos
        // que ya estaban cargados desde localStorage.
        this.cdr.detectChanges();
      }
    });
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

    // ---------------------------------------------------
    // FOTO DE PERFIL
    // ---------------------------------------------------

    this.fotoUsuario =
      this.normalizarUrlFoto(usuario.foto);

    console.log(
      'LAYOUT - FOTO RECIBIDA:',
      usuario.foto
    );

    console.log(
      'LAYOUT - URL FINAL DE FOTO:',
      this.fotoUsuario
    );
  }

  // =====================================================
  // NORMALIZAR URL DE LA FOTO
  // =====================================================

  private normalizarUrlFoto(
    foto: string | null | undefined
  ): string | null {

    if (!foto) {
      return null;
    }

    // Si Django ya devuelve una URL completa
    if (
      foto.startsWith('http://') ||
      foto.startsWith('https://')
    ) {
      return foto;
    }

    // Asegurar que la ruta empiece con /
    if (!foto.startsWith('/')) {
      foto = `/${foto}`;
    }

    // Si ya viene con /media/
    if (foto.startsWith('/media/')) {
      return `https://geriapp-backend.onrender.com${foto}`;
    }

    // Si viene como /usuarios/foto.jpg
    // agregar /media/
    if (foto.startsWith('/usuarios/')) {
      return `https://geriapp-backend.onrender.com/media${foto}`;
    }

    return `https://geriapp-backend.onrender.com${foto}`;
  }

  // =====================================================
  // ABRIR CONFIGURACIÓN DESDE LAS INICIALES
  // =====================================================

  abrirConfiguracion(): void {

    this.router.navigate([
      '/configuracion'
    ]);
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


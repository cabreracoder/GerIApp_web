import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
  Router
} from '@angular/router';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Store } from '@ngrx/store';
import { AppState, selectUsuario } from '../store/reducer';
import {
  cerrarSesion,
  iniciarSesion,
  actualizarUsuario,
  UsuarioSesion
} from '../store/action';




interface OpcionMenu {
  nombre: string;
  icono: string;
  ruta: string;
  fragment?: string;
}

interface UsuarioActualizado {
  id_usuario: number;
  id_rol: number | null;
  nombres: string;
  apellidos: string;
  correo?: string;
  telefono?: string | null;
  rol?: string | null;
  foto?: string | null;
  [key: string]: any;
}

interface ConfiguracionInstitucion {
  nombre_institucion: string;
}
interface UsuarioSedeResponse {
  id_sede: number | { id_sede: number } | null;
}

interface SedeResponse {
  id_sede: number;
  nombre: string;
}
interface RolResponse {
  id_rol: number;
  nombre: string;
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

      // Sincronizar los datos con NgRx.
      this.store.dispatch(
        actualizarUsuario({
          usuario: usuario as UsuarioSesion
        })
      );

      this.cdr.detectChanges();
    };

  private ultimoRolConsultado: number | null = null;
  private suscripcionUsuario?: import('rxjs').Subscription;


  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private socialAuthService: SocialAuthService,
    private http: HttpClient,
    private store: Store<AppState>
  ) {

    this.cargarUsuario();

    this.suscripcionUsuario = this.store
      .select(selectUsuario)
      .subscribe((usuario) => {
        if (usuario) {
          this.actualizarDatosUsuario(usuario);
        }
      });

    this.cargarNombreInstitucion();
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

  cargarNombreInstitucion(): void {
    this.http
      .get<ConfiguracionInstitucion>(
        'https://geriapp-backend.onrender.com/api/configuracion/institucion/'
      )
      .subscribe({
        next: (respuesta) => {
          const nombre = respuesta.nombre_institucion?.trim();

          if (nombre) {
            this.nombreAplicacion = nombre;
          }
        },
        error: (error) => {
          console.error(
            'Error al cargar el nombre de la institución:',
            error
          );
        }
      });
  }

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

  fotoUsuario: string | null = null;
  // SEDE DEL USUARIO AUTENTICADO
  nombreSede = '';

  private ultimoUsuarioConsultadoParaSede: number | null = null;

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';
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
  // MENÚ EXCLUSIVO DEL SUPERADMINISTRADOR
  // =====================================================

  private readonly menuSuperadministrador: OpcionMenu[] = [

    {
      nombre: 'Inicio',
      icono: 'dashboard',
      ruta: '/superadministrador',
      fragment: 'resumen'
    },

    {
      nombre: 'Sedes',
      icono: 'apartment',
      ruta: '/superadministrador',
      fragment: 'sedes'
    },

    {
      nombre: 'Administradores',
      icono: 'manage_accounts',
      ruta: '/superadministrador',
      fragment: 'administradores'
    }

  ];

  // =====================================================
  // OPCIONES VISIBLES SEGÚN EL ROL
  // =====================================================

  get opcionesMenu(): OpcionMenu[] {

    return this.esSuperadministrador()
      ? this.menuSuperadministrador
      : this.menu;

  }

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

      this.actualizarDatosUsuario(usuario);

    } catch (error) {

      console.error(
        'Error al leer el usuario guardado en localStorage:',
        error
      );
    }
  }
  // =====================================================
  // CARGAR SEDE DEL USUARIO AUTENTICADO
  // =====================================================

  cargarSedeUsuario(idUsuario: number): void {

    if (!idUsuario) {
      return;
    }

    // Evitar consultas repetidas del mismo usuario.
    if (this.ultimoUsuarioConsultadoParaSede === idUsuario) {
      return;
    }

    this.ultimoUsuarioConsultadoParaSede = idUsuario;
    this.nombreSede = '';

    // 1. Consultar el usuario.
    this.http
      .get<UsuarioSedeResponse>(
        `${this.apiUrl}/usuarios/${idUsuario}/`
      )
      .subscribe({

        next: (usuario) => {

          const sedeRelacionada = usuario.id_sede;

          const idSede =
            typeof sedeRelacionada === 'object' && sedeRelacionada !== null
              ? sedeRelacionada.id_sede
              : sedeRelacionada;

          if (!idSede) {
            console.log('El usuario no tiene una sede asignada.');
            this.nombreSede = '';
            this.cdr.detectChanges();
            return;
          }

          console.log('ID DE SEDE DEL USUARIO:', idSede);

          // 2. Consultar el nombre de la sede.
          this.http
            .get<SedeResponse>(
              `${this.apiUrl}/sedes/${idSede}/`
            )
            .subscribe({

              next: (sede) => {

                this.nombreSede = sede.nombre;

                console.log(
                  'SEDE DEL USUARIO:',
                  this.nombreSede
                );

                this.cdr.detectChanges();
              },

              error: (error) => {

                console.error(
                  'Error al consultar la sede:',
                  error
                );

              }

            });

        },

        error: (error) => {

          console.error(
            'Error al consultar el usuario:',
            error
          );

          this.ultimoUsuarioConsultadoParaSede = null;

        }

      });

  }

  // =====================================================
  // CARGAR NOMBRE DEL ROL DEL USUARIO
  // =====================================================

  cargarRolUsuario(idRol: number | null): void {

    if (!idRol) {
      this.rolUsuario = '';
      return;
    }

    if (this.ultimoRolConsultado === idRol && this.rolUsuario) {
      return;
    }

    this.ultimoRolConsultado = idRol;

    this.http
      .get<RolResponse[]>(`${this.apiUrl}/roles/`)
      .subscribe({

        next: (roles) => {

          const rolEncontrado = roles.find(
            rol => Number(rol.id_rol) === Number(idRol)
          );

          this.rolUsuario = rolEncontrado?.nombre ?? '';

          console.log('ROL DEL USUARIO:', this.rolUsuario);

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'Error al consultar los roles:',
            error
          );

          this.ultimoRolConsultado = null;
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

    // Obtener el nombre del rol mediante su ID.
    if (usuario.rol?.trim()) {

      this.rolUsuario = usuario.rol.trim();

    } else {

      this.cargarRolUsuario(usuario.id_rol);

    }
    // ---------------------------------------------------
    // FOTO DE PERFIL
    // ---------------------------------------------------

    this.fotoUsuario =
      usuario.foto ?? null;

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
    // SEDE ASIGNADA AL USUARIO
    // ---------------------------------------------------

    this.cargarSedeUsuario(usuario.id_usuario);
  }


  // =====================================================
  // ABRIR CONFIGURACIÓN DESDE EL AVATAR
  // =====================================================

  abrirConfiguracion(): void {

    this.router.navigate([
      '/configuracion'
    ]);
  }

  esSuperadministrador(): boolean {
    return this.rolUsuario
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .includes('superadministrador');
  }

  // =====================================================
  // CERRAR SESIÓN
  // =====================================================

  cerrarSesion(): void {

    console.log(
      'Cerrando sesión...'
    );

    this.socialAuthService.signOut();

    localStorage.removeItem('usuario');
    localStorage.removeItem('token');

    this.store.dispatch(cerrarSesion());

    this.router.navigate(['/login']);
  }

  // =====================================================
  // DESTRUIR COMPONENTE
  // =====================================================

  ngOnDestroy(): void {

    window.removeEventListener(
      'usuarioActualizado',
      this.usuarioActualizadoListener
    );
    this.suscripcionUsuario?.unsubscribe();
  }
}


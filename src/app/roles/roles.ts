
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  RolesService,
  RolApi
} from './roles.service';

// =========================================================
// INTERFACES
// =========================================================

interface UsuarioAsociado {
  id: number;
  name: string;
  email: string;
  estado: 'activo' | 'inactivo';
  avatar: string;
}

interface Rol {
  id: number;
  name: string;
  color: string;
  icon: string;
  userCount: number;
  description: string;
  usuariosAsociados: UsuarioAsociado[];
}

// =========================================================
// COMPONENTE
// =========================================================

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles implements OnInit {

  // =========================================================
  // CONFIGURACIÓN VISUAL
  // =========================================================

  private readonly CONFIGURACION_ROLES: Record<
    string,
    {
      color: string;
      icon: string;
    }
  > = {

    Administrador: {
      color: 'var(--color-primary)',
      icon: 'admin_panel_settings'
    },

    Cuidador: {
      color: 'var(--color-secondary)',
      icon: 'health_and_safety'
    },

    Encargado: {
      color: 'var(--color-tertiary)',
      icon: 'supervisor_account'
    }

  };

  // =========================================================
  // DATOS
  // =========================================================

  roles: Rol[] = [];

  usuariosGeneralesDisponibles: UsuarioAsociado[] = [];

  // =========================================================
  // SELECCIÓN
  // =========================================================

  selectedRole = '';

  searchTerm = '';

  filtroEstadoUsuario:
    'Todos' |
    'activo' |
    'inactivo' = 'Todos';

  // =========================================================
  // FORMULARIO
  // =========================================================

  mostrarFormularioRol = false;

  nuevoRol = {
    nombre: '',
    descripcion: ''
  };

  // =========================================================
  // MENSAJES
  // =========================================================

  mensajeExito = '';

  mensajeError = '';

  ultimoRegistroAuditoria =
    'Sin modificaciones recientes en esta sesión.';

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private readonly rolesService: RolesService
  ) {}

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {

    this.cargarRoles();

  }

  // =========================================================
  // CARGAR ROLES
  // =========================================================

  cargarRoles(): void {

    this.rolesService
      .listarRoles()
      .subscribe({

        next: (rolesApi: RolApi[]) => {

          this.roles =
            rolesApi
              .filter(
                rol => rol.estado
              )
              .map(
                rol =>
                  this.convertirRol(rol)
              );

          if (this.roles.length > 0) {

            this.selectedRole =
              this.roles[0].name;

          }

        },

        error: (error: unknown) => {

          console.error(
            'Error al cargar los roles:',
            error
          );

          this.mensajeError =
            'No fue posible cargar los roles desde el servidor.';

        }

      });

  }

  // =========================================================
  // CONVERTIR ROL
  // =========================================================

  private convertirRol(
    rolApi: RolApi
  ): Rol {

    const configuracion =
      this.CONFIGURACION_ROLES[
        rolApi.nombre
      ] ??
      this.crearConfiguracionPorDefecto();

    return {

      id:
        rolApi.id_rol,

      name:
        rolApi.nombre,

      color:
        configuracion.color,

      icon:
        configuracion.icon,

      userCount:
        0,

      description:
        rolApi.descripcion,

      usuariosAsociados:
        []

    };

  }

  // =========================================================
  // CONFIGURACIÓN POR DEFECTO
  // =========================================================

  private crearConfiguracionPorDefecto() {

    return {

      color:
        'var(--color-primary)',

      icon:
        'badge'

    };

  }

  // =========================================================
  // ROL SELECCIONADO
  // =========================================================

  get selectedRoleObject(): Rol | undefined {

    return this.roles.find(
      role =>
        role.name ===
        this.selectedRole
    );

  }

  // =========================================================
  // ROLES FILTRADOS
  // =========================================================

  get filteredRoles(): Rol[] {

    const textoBusqueda =
      this.searchTerm
        .trim()
        .toLowerCase();

    if (!textoBusqueda) {

      return this.roles;

    }

    return this.roles.filter(
      role =>

        role.name
          .toLowerCase()
          .includes(textoBusqueda)

        ||

        role.description
          .toLowerCase()
          .includes(textoBusqueda)
    );

  }

  // =========================================================
  // USUARIOS FILTRADOS
  // =========================================================

  get usuariosFiltrados(): UsuarioAsociado[] {

    const usuarios =
      this.selectedRoleObject
        ?.usuariosAsociados ??
      [];

    if (
      this.filtroEstadoUsuario ===
      'Todos'
    ) {

      return usuarios;

    }

    return usuarios.filter(
      usuario =>
        usuario.estado ===
        this.filtroEstadoUsuario
    );

  }

  // =========================================================
  // SELECCIONAR ROL
  // =========================================================

  selectRole(
    nombreRol: string
  ): void {

    this.selectedRole =
      nombreRol;

    this.filtroEstadoUsuario =
      'Todos';

    this.limpiarMensajes();

  }

  // =========================================================
  // ABRIR FORMULARIO
  // =========================================================

  abrirNuevoRol(): void {

    this.mostrarFormularioRol =
      true;

    this.nuevoRol = {

      nombre: '',
      descripcion: ''

    };

    this.limpiarMensajes();

  }

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  cerrarFormularioRol(): void {

    this.mostrarFormularioRol =
      false;

  }

  // =========================================================
  // CREAR ROL
  // =========================================================

  crearRol(): void {

    const nombre =
      this.nuevoRol.nombre
        .trim();

    const descripcion =
      this.nuevoRol.descripcion
        .trim();

    // =====================================================
    // VALIDAR NOMBRE
    // =====================================================

    if (!nombre) {

      this.mostrarError(
        'Debe ingresar un nombre para el rol.'
      );

      return;

    }

    // =====================================================
    // VALIDAR DESCRIPCIÓN
    // =====================================================

    if (!descripcion) {

      this.mostrarError(
        'Debe ingresar una descripción para el rol.'
      );

      return;

    }

    // =====================================================
    // VERIFICAR ROL EXISTENTE
    // =====================================================

    const existe =
      this.roles.some(
        rol =>
          rol.name
            .toLowerCase() ===
          nombre.toLowerCase()
      );

    if (existe) {

      this.mostrarError(
        'Ya existe un rol con ese nombre.'
      );

      return;

    }

    // =====================================================
    // CREAR ROL EN LA BASE DE DATOS
    // =====================================================

    const nuevoRolApi = {

      nombre,

      descripcion,

      estado: true

    };

    this.rolesService
      .crearRol(nuevoRolApi)
      .subscribe({

        next: (rolCreado: RolApi) => {

          const configuracion =
            this.CONFIGURACION_ROLES[
              rolCreado.nombre
            ] ??
            this.crearConfiguracionPorDefecto();

          const nuevoRol: Rol = {

            id:
              rolCreado.id_rol,

            name:
              rolCreado.nombre,

            color:
              configuracion.color,

            icon:
              configuracion.icon,

            userCount:
              0,

            description:
              rolCreado.descripcion,

            usuariosAsociados:
              []

          };

          this.roles.push(
            nuevoRol
          );

          this.selectedRole =
            nuevoRol.name;

          this.finalizarCreacionRol(
            nuevoRol
          );

        },

        error: (error: unknown) => {

          console.error(
            'Error al crear el rol:',
            error
          );

          this.mostrarError(
            'No fue posible crear el rol en el servidor.'
          );

        }

      });

  }

  // =========================================================
  // FINALIZAR CREACIÓN
  // =========================================================

  private finalizarCreacionRol(
    nuevoRol: Rol
  ): void {

    this.cerrarFormularioRol();

    this.mostrarExito(
      `El rol "${nuevoRol.name}" fue creado correctamente.`
    );

    this.ultimoRegistroAuditoria =
      `Rol creado el ${this.obtenerFechaActual()}.`;

    this.limpiarFormulario();

  }

  // =========================================================
  // DETALLE USUARIO
  // =========================================================

  verDetalleUsuario(
    usuario: UsuarioAsociado
  ): void {

    alert(

      [

        'Detalle del usuario',

        '',

        `Nombre: ${usuario.name}`,

        `Correo: ${usuario.email}`,

        `Estado: ${usuario.estado.toUpperCase()}`

      ].join('\n')

    );

  }

  // =========================================================
  // BÚSQUEDA
  // =========================================================

  onSearch(
    event: Event
  ): void {

    const input =
      event.target as
      HTMLInputElement;

    this.searchTerm =
      input.value;

  }

  // =========================================================
  // MENSAJE ERROR
  // =========================================================

  private mostrarError(
    mensaje: string
  ): void {

    this.mensajeError =
      mensaje;

    this.mensajeExito =
      '';

  }

  // =========================================================
  // MENSAJE ÉXITO
  // =========================================================

  private mostrarExito(
    mensaje: string
  ): void {

    this.mensajeExito =
      mensaje;

    this.mensajeError =
      '';

    setTimeout(
      () => {

        this.mensajeExito =
          '';

      },
      4000
    );

  }

  // =========================================================
  // LIMPIAR MENSAJES
  // =========================================================

  private limpiarMensajes(): void {

    this.mensajeError =
      '';

    this.mensajeExito =
      '';

  }

  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  private limpiarFormulario(): void {

    this.nuevoRol = {

      nombre: '',
      descripcion: ''

    };

  }

  // =========================================================
  // FECHA
  // =========================================================

  private obtenerFechaActual(): string {

    return new Date()
      .toLocaleString();

  }

}


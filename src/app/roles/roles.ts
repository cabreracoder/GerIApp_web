import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
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

  // =========================================================
  // SELECCIÓN
  // =========================================================

  selectedRole = '';

  filtroEstadoUsuario:
    'Todos' |
    'activo' |
    'inactivo' = 'Todos';

  // =========================================================
  // FORMULARIO
  // =========================================================

  mostrarFormularioRol = false;

  modoFormulario: 'crear' | 'editar' = 'crear';

  rolEditandoId: number | null = null;

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
    private readonly rolesService: RolesService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {
    console.log('COMPONENTE ROLES INICIADO');
    this.cargarRoles();
  }

  // =========================================================
  // CARGAR ROLES
  // =========================================================

  cargarRoles(): void {
    console.log('CARGANDO ROLES...');

    this.rolesService.listarRoles().subscribe({
      next: (rolesApi: RolApi[]) => {

        console.log(
          'ROLES RECIBIDOS DE LA API:',
          rolesApi
        );

        this.roles = rolesApi.map(
          rol => this.convertirRol(rol)
        );

        if (this.roles.length > 0) {
          this.selectedRole =
            this.roles[0].name;
        } else {
          this.selectedRole = '';
        }

        console.log(
          'ROLES PARA MOSTRAR:',
          this.roles
        );

        this.cdr.detectChanges();
      },

      error: (error: unknown) => {

        console.error(
          'Error al cargar los roles:',
          error
        );

        this.mostrarError(
          'No fue posible cargar los roles desde el servidor.'
        );
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
      id: rolApi.id_rol,
      name: rolApi.nombre,
      color: configuracion.color,
      icon: configuracion.icon,
      userCount: 0,
      description: rolApi.descripcion,
      usuariosAsociados: []
    };
  }

  // =========================================================
  // CONFIGURACIÓN POR DEFECTO
  // =========================================================

  private crearConfiguracionPorDefecto() {
    return {
      color: 'var(--color-primary)',
      icon: 'badge'
    };
  }

  // =========================================================
  // ROL SELECCIONADO
  // =========================================================

  get selectedRoleObject(): Rol | undefined {
    return this.roles.find(
      role =>
        role.name === this.selectedRole
    );
  }

  // =========================================================
  // USUARIOS FILTRADOS
  // =========================================================

  get usuariosFiltrados(): UsuarioAsociado[] {

    const usuarios =
      this.selectedRoleObject
        ?.usuariosAsociados ?? [];

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
  // ABRIR FORMULARIO CREAR
  // =========================================================

  abrirNuevoRol(): void {

    this.modoFormulario =
      'crear';

    this.rolEditandoId =
      null;

    this.mostrarFormularioRol =
      true;

    this.nuevoRol = {
      nombre: '',
      descripcion: ''
    };

    this.limpiarMensajes();
  }

  // =========================================================
  // ABRIR FORMULARIO EDITAR
  // =========================================================

  editarRol(
    rol: Rol
  ): void {

    this.modoFormulario =
      'editar';

    this.rolEditandoId =
      rol.id;

    this.nuevoRol = {
      nombre: rol.name,
      descripcion: rol.description
    };

    this.mostrarFormularioRol =
      true;

    this.limpiarMensajes();
  }

  // =========================================================
  // CERRAR FORMULARIO
  // =========================================================

  cerrarFormularioRol(): void {

    this.mostrarFormularioRol =
      false;

    this.rolEditandoId =
      null;

    this.modoFormulario =
      'crear';

    this.limpiarFormulario();
  }

  // =========================================================
  // GUARDAR ROL
  // =========================================================

  guardarRol(): void {

    if (
      this.modoFormulario ===
      'editar'
    ) {

      this.actualizarRol();

      return;
    }

    this.crearRol();
  }

  // =========================================================
  // CREAR ROL
  // =========================================================

  crearRol(): void {

    const nombre =
      this.nuevoRol.nombre.trim();

    const descripcion =
      this.nuevoRol.descripcion.trim();

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
          rol.name.toLowerCase() ===
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

          const nuevoRol =
            this.convertirRol(
              rolCreado
            );

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
  // ACTUALIZAR ROL
  // =========================================================

  actualizarRol(): void {

    if (
      this.rolEditandoId === null
    ) {

      this.mostrarError(
        'No se encontró el rol que desea editar.'
      );

      return;
    }

    const nombre =
      this.nuevoRol.nombre.trim();

    const descripcion =
      this.nuevoRol.descripcion.trim();

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
    // VERIFICAR NOMBRE DUPLICADO
    // =====================================================

    const existe =
      this.roles.some(
        rol =>
          rol.id !== this.rolEditandoId &&
          rol.name.toLowerCase() ===
          nombre.toLowerCase()
      );

    if (existe) {

      this.mostrarError(
        'Ya existe otro rol con ese nombre.'
      );

      return;
    }

    // =====================================================
    // ACTUALIZAR ROL EN LA BASE DE DATOS
    // =====================================================

    const rolActualizado = {
      nombre,
      descripcion
    };

    this.rolesService
      .actualizarRol(
        this.rolEditandoId,
        rolActualizado
      )
      .subscribe({

        next: (rolApi: RolApi) => {

          const indice =
            this.roles.findIndex(
              rol =>
                rol.id ===
                this.rolEditandoId
            );

          if (indice !== -1) {

            this.roles[indice] =
              this.convertirRol(
                rolApi
              );
          }

          this.selectedRole =
            rolApi.nombre;

          this.finalizarActualizacionRol(
            rolApi
          );
        },

        error: (error: unknown) => {

          console.error(
            'Error al actualizar el rol:',
            error
          );

          this.mostrarError(
            'No fue posible actualizar el rol en el servidor.'
          );
        }
      });
  }

  // =========================================================
  // ELIMINAR ROL
  // =========================================================

  eliminarRol(
    rol: Rol
  ): void {

    const confirmar =
      confirm(
        `¿Está seguro de eliminar el rol "${rol.name}"?`
      );

    if (!confirmar) {
      return;
    }

    // =====================================================
    // ELIMINAR ROL EN LA BASE DE DATOS
    // =====================================================

    this.rolesService
      .eliminarRol(rol.id)
      .subscribe({

        next: () => {

          const indice =
            this.roles.findIndex(
              item =>
                item.id === rol.id
            );

          if (indice !== -1) {

            this.roles.splice(
              indice,
              1
            );
          }

          // ===============================================
          // ACTUALIZAR ROL SELECCIONADO
          // ===============================================

          if (
            this.selectedRole ===
            rol.name
          ) {

            if (
              this.roles.length > 0
            ) {

              this.selectedRole =
                this.roles[0].name;

            } else {

              this.selectedRole =
                '';
            }
          }

          this.mostrarExito(
            `El rol "${rol.name}" fue eliminado correctamente.`
          );

          this.ultimoRegistroAuditoria =
            `Rol eliminado el ${this.obtenerFechaActual()}.`;

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {

          console.error(
            'Error al eliminar el rol:',
            error
          );

          this.mostrarError(
            'No fue posible eliminar el rol. Verifique si tiene usuarios asociados.'
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

    this.cdr.detectChanges();
  }

  // =========================================================
  // FINALIZAR ACTUALIZACIÓN
  // =========================================================

  private finalizarActualizacionRol(
    rolApi: RolApi
  ): void {

    this.cerrarFormularioRol();

    this.mostrarExito(
      `El rol "${rolApi.nombre}" fue actualizado correctamente.`
    );

    this.ultimoRegistroAuditoria =
      `Rol actualizado el ${this.obtenerFechaActual()}.`;

    this.limpiarFormulario();

    this.cdr.detectChanges();
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
    return new Date().toLocaleString();
  }
}
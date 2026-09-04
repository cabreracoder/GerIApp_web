
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {
  FormsModule
} from '@angular/forms';
import {
  HttpClient
} from '@angular/common/http';

// =========================================================
// INTERFACES
// =========================================================

interface RolApi {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

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
  // URL DE LA API
  // =========================================================

  private readonly apiUrl =
    'https://geriapp-web-1.onrender.com/api';

  // =========================================================
  // CONFIGURACIÓN VISUAL DE LOS ROLES
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

  modoFormulario:
    'crear' |
    'editar' = 'crear';

  rolEditandoId: number | null = null;

  nuevoRol = {
    nombre: '',
    descripcion: ''
  };

  // =========================================================
  // ESTADOS DE LA INTERFAZ
  // =========================================================

  cargandoRoles = false;

  guardandoRol = false;

  eliminandoRolId: number | null = null;

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
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef
  ) {}

  // =========================================================
  // INICIO
  // =========================================================

  ngOnInit(): void {

    console.log(
      'COMPONENTE ROLES INICIADO'
    );

    this.cargarRoles();
  }

  // =========================================================
  // CARGAR ROLES
  // GET /api/roles/
  // =========================================================

  cargarRoles(): void {

    this.cargandoRoles = true;

    this.limpiarMensajes();

    console.log(
      'CARGANDO ROLES...'
    );

    this.http
      .get<RolApi[]>(
        `${this.apiUrl}/roles/`
      )
      .subscribe({

        next: (rolesApi: RolApi[]) => {

          console.log(
            'ROLES RECIBIDOS DE LA API:',
            rolesApi
          );

          this.roles =
            rolesApi.map(
              (rolApi: RolApi) =>
                this.convertirRol(rolApi)
            );

          // =================================================
          // MANTENER LA SELECCIÓN ACTUAL
          // =================================================

          const seleccionActualExiste =
            this.roles.some(
              rol =>
                rol.name ===
                this.selectedRole
            );

          if (
            !seleccionActualExiste
          ) {

            this.selectedRole =
              this.roles.length > 0
                ? this.roles[0].name
                : '';
          }

          this.cargandoRoles = false;

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

          this.cargandoRoles = false;

          this.mostrarError(
            'No fue posible cargar los roles desde el servidor.'
          );

          this.cdr.detectChanges();
        }
      });
  }

  // =========================================================
  // CONVERTIR ROL DE LA API
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

  private crearConfiguracionPorDefecto(): {
    color: string;
    icon: string;
  } {

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
  // ABRIR FORMULARIO PARA CREAR
  // =========================================================

  abrirNuevoRol(): void {

    this.modoFormulario =
      'crear';

    this.rolEditandoId =
      null;

    this.nuevoRol = {

      nombre:
        '',

      descripcion:
        ''
    };

    this.mostrarFormularioRol =
      true;

    this.limpiarMensajes();
  }

  // =========================================================
  // ABRIR FORMULARIO PARA EDITAR
  // =========================================================

  editarRol(
    rol: Rol
  ): void {

    this.modoFormulario =
      'editar';

    this.rolEditandoId =
      rol.id;

    this.nuevoRol = {

      nombre:
        rol.name,

      descripcion:
        rol.description
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
      this.guardandoRol
    ) {

      return;
    }

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
  // POST /api/roles/
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
    // VALIDAR LONGITUD
    // =====================================================

    if (
      nombre.length < 2
    ) {

      this.mostrarError(
        'El nombre del rol debe tener al menos 2 caracteres.'
      );

      return;
    }

    // =====================================================
    // VERIFICAR ROL DUPLICADO
    // =====================================================

    const existe =
      this.roles.some(
        rol =>
          rol.name
            .trim()
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
    // DATOS PARA LA API
    // =====================================================

    const nuevoRolApi:
      Omit<RolApi, 'id_rol'> = {

      nombre:
        nombre,

      descripcion:
        descripcion,

      estado:
        true
    };

    // =====================================================
    // ESTADO DE CARGA
    // =====================================================

    this.guardandoRol =
      true;

    // =====================================================
    // PETICIÓN POST
    // =====================================================

    this.http
      .post<RolApi>(
        `${this.apiUrl}/roles/`,
        nuevoRolApi
      )
      .subscribe({

        next: (
          rolCreado: RolApi
        ) => {

          console.log(
            'ROL CREADO:',
            rolCreado
          );

          const nuevoRol =
            this.convertirRol(
              rolCreado
            );

          this.roles.push(
            nuevoRol
          );

          this.selectedRole =
            nuevoRol.name;

          this.guardandoRol =
            false;

          this.finalizarCreacionRol(
            nuevoRol
          );
        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Error al crear el rol:',
            error
          );

          this.guardandoRol =
            false;

          this.mostrarError(
            'No fue posible crear el rol en el servidor.'
          );

          this.cdr.detectChanges();
        }
      });
  }

  // =========================================================
  // ACTUALIZAR ROL
  // PATCH /api/roles/{id}/
  // =========================================================

  actualizarRol(): void {

    if (
      this.rolEditandoId ===
      null
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
    // VERIFICAR DUPLICADO
    // =====================================================

    const existe =
      this.roles.some(
        rol =>
          rol.id !==
          this.rolEditandoId &&
          rol.name
            .trim()
            .toLowerCase() ===
          nombre.toLowerCase()
      );

    if (existe) {

      this.mostrarError(
        'Ya existe otro rol con ese nombre.'
      );

      return;
    }

    // =====================================================
    // GUARDAR ID
    // =====================================================

    const idRol =
      this.rolEditandoId;

    // =====================================================
    // DATOS PARA LA API
    // =====================================================

    const rolActualizado:
      Partial<Omit<RolApi, 'id_rol'>> = {

      nombre:
        nombre,

      descripcion:
        descripcion
    };

    // =====================================================
    // ESTADO DE CARGA
    // =====================================================

    this.guardandoRol =
      true;

    // =====================================================
    // PETICIÓN PATCH
    // =====================================================

    this.http
      .patch<RolApi>(
        `${this.apiUrl}/roles/${idRol}/`,
        rolActualizado
      )
      .subscribe({

        next: (
          rolApi: RolApi
        ) => {

          console.log(
            'ROL ACTUALIZADO:',
            rolApi
          );

          const indice =
            this.roles.findIndex(
              rol =>
                rol.id ===
                idRol
            );

          if (
            indice !== -1
          ) {

            this.roles[indice] =
              this.convertirRol(
                rolApi
              );
          }

          this.selectedRole =
            rolApi.nombre;

          this.guardandoRol =
            false;

          this.finalizarActualizacionRol(
            rolApi
          );
        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Error al actualizar el rol:',
            error
          );

          this.guardandoRol =
            false;

          this.mostrarError(
            'No fue posible actualizar el rol en el servidor.'
          );

          this.cdr.detectChanges();
        }
      });
  }

  // =========================================================
  // ELIMINAR ROL
  // DELETE /api/roles/{id}/
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
    // ESTADO DE ELIMINACIÓN
    // =====================================================

    this.eliminandoRolId =
      rol.id;

    // =====================================================
    // PETICIÓN DELETE
    // =====================================================

    this.http
      .delete<void>(
        `${this.apiUrl}/roles/${rol.id}/`
      )
      .subscribe({

        next: () => {

          console.log(
            'ROL ELIMINADO:',
            rol
          );

          const indice =
            this.roles.findIndex(
              item =>
                item.id ===
                rol.id
            );

          if (
            indice !== -1
          ) {

            this.roles.splice(
              indice,
              1
            );
          }

          // =================================================
          // ACTUALIZAR ROL SELECCIONADO
          // =================================================

          if (
            this.selectedRole ===
            rol.name
          ) {

            this.selectedRole =
              this.roles.length > 0
                ? this.roles[0].name
                : '';
          }

          this.eliminandoRolId =
            null;

          this.mostrarExito(
            `El rol "${rol.name}" fue eliminado correctamente.`
          );

          this.ultimoRegistroAuditoria =
            `Rol eliminado el ${this.obtenerFechaActual()}.`;

          this.cdr.detectChanges();
        },

        error: (
          error: unknown
        ) => {

          console.error(
            'Error al eliminar el rol:',
            error
          );

          this.eliminandoRolId =
            null;

          this.mostrarError(
            'No fue posible eliminar el rol. Verifique si tiene usuarios asociados.'
          );

          this.cdr.detectChanges();
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

    this.cdr.detectChanges();
  }

  // =========================================================
  // VER DETALLE DEL USUARIO
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
  // MOSTRAR ERROR
  // =========================================================

  private mostrarError(
    mensaje: string
  ): void {

    this.mensajeError =
      mensaje;

    this.mensajeExito =
      '';

    this.cdr.detectChanges();
  }

  // =========================================================
  // MOSTRAR ÉXITO
  // =========================================================

  private mostrarExito(
    mensaje: string
  ): void {

    this.mensajeExito =
      mensaje;

    this.mensajeError =
      '';

    this.cdr.detectChanges();

    setTimeout(
      () => {

        this.mensajeExito =
          '';

        this.cdr.detectChanges();

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

      nombre:
        '',

      descripcion:
        ''
    };
  }

  // =========================================================
  // OBTENER FECHA ACTUAL
  // =========================================================

  private obtenerFechaActual(): string {

    return new Date()
      .toLocaleString('es-CO');
  }
}


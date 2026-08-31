import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {forkJoin,Observable} from 'rxjs';

import {
RolesService,
RolApi,
PermisoApi,
PermisoRolApi
} from './roles.service';

// =========================================================
// INTERFACES
// =========================================================

interface Permiso {
id: number;
label: string;
granted: boolean;
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
perms: Permiso[];
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

permisosDisponibles: PermisoApi[] = [];

permisosRol: PermisoRolApi[] = [];

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
descripcion: '',
permisos: [] as number[]
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


this.cargarPermisos();

this.cargarRoles();

}

// =========================================================
// CARGAR PERMISOS
// =========================================================

cargarPermisos(): void {


this.rolesService
  .listarPermisos()
  .subscribe({

    next: (permisos: PermisoApi[]) => {

      this.permisosDisponibles =
        permisos.filter(
          permiso => permiso.estado
        );

      /*
       * Si los roles ya fueron cargados antes
       * que los permisos, volvemos a cargar
       * los permisos del rol seleccionado.
       */

      const rol =
        this.selectedRoleObject;

      if (rol) {

        this.cargarPermisosDelRol(
          rol.id
        );

      }

    },

    error: (error: unknown) => {

      console.error(
        'Error al cargar los permisos:',
        error
      );

      this.mensajeError =
        'No fue posible cargar los permisos desde el servidor.';

    }

  });


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

        this.cargarPermisosDelRol(
          this.roles[0].id
        );

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
// CARGAR PERMISOS DE UN ROL
// =========================================================

cargarPermisosDelRol(
idRol: number
): void {


this.rolesService
  .listarPermisosRol(idRol)
  .subscribe({

    next: (
      permisosRol: PermisoRolApi[]
    ) => {

      this.permisosRol =
        permisosRol;

      const rol =
        this.roles.find(
          role =>
            role.id === idRol
        );

      if (!rol) {
        return;
      }

      rol.perms =
        this.permisosDisponibles.map(
          permiso => ({

            id:
              permiso.id_permisos,

            label:
              permiso.nombre,

            granted:
              permisosRol.some(
                relacion =>
                  relacion.id_permisos ===
                  permiso.id_permisos
              )

          })
        );

    },

    error: (error: unknown) => {

      console.error(
        'Error al cargar los permisos del rol:',
        error
      );

      this.mensajeError =
        'No fue posible cargar los permisos del rol.';

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

  perms:
    [],

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

const rol =
  this.roles.find(
    role =>
      role.name ===
      nombreRol
  );

if (rol) {

  this.cargarPermisosDelRol(
    rol.id
  );

}


}

// =========================================================
// ABRIR FORMULARIO
// =========================================================

abrirNuevoRol(): void {

  this.mostrarFormularioRol = true;

  this.nuevoRol = {
    nombre: '',
    descripcion: '',
    permisos: []
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
// SELECCIONAR PERMISO PARA NUEVO ROL
// =========================================================

togglePermisoNuevoRol(
idPermiso: number
): void {


const indice =
  this.nuevoRol.permisos
    .indexOf(idPermiso);

if (indice === -1) {

  this.nuevoRol.permisos
    .push(idPermiso);

} else {

  this.nuevoRol.permisos
    .splice(indice, 1);

}


}

toggleNuevoPermiso(idPermiso: number): void {

  const index = this.nuevoRol.permisos.indexOf(idPermiso);

  if (index === -1) {
    this.nuevoRol.permisos.push(idPermiso);
  } else {
    this.nuevoRol.permisos.splice(index, 1);
  }
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

if (!nombre) {

  this.mostrarError(
    'Debe ingresar un nombre para el rol.'
  );

  return;

}

if (!descripcion) {

  this.mostrarError(
    'Debe ingresar una descripción para el rol.'
  );

  return;

}

if (
  this.nuevoRol.permisos.length === 0
) {

  this.mostrarError(
    'Debe seleccionar al menos un permiso.'
  );

  return;

}

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

        perms:
          this.permisosDisponibles.map(
            permiso => ({

              id:
                permiso.id_permisos,

              label:
                permiso.nombre,

              granted:
                this.nuevoRol.permisos
                  .includes(
                    permiso.id_permisos
                  )

            })
          ),

        usuariosAsociados:
          []

      };


      this.roles.push(
        nuevoRol
      );

      this.selectedRole =
        nuevoRol.name;


      // ===============================================
      // GUARDAR PERMISOS DEL NUEVO ROL
      // ===============================================

      const relaciones =
        this.nuevoRol.permisos.map(
          idPermiso =>

            this.rolesService
              .crearPermisoRol({

                id_permisos:
                  idPermiso,

                id_rol:
                  rolCreado.id_rol

              })

        );


      if (
        relaciones.length === 0
      ) {

        this.finalizarCreacionRol(
          nuevoRol
        );

        return;

      }


      forkJoin(
        relaciones
      ).subscribe({

        next: () => {

          this.finalizarCreacionRol(
            nuevoRol
          );

        },

        error: (error: unknown) => {

          console.error(
            'Error al guardar los permisos del nuevo rol:',
            error
          );

          this.mostrarError(
            'El rol fue creado, pero no fue posible guardar todos sus permisos.'
          );

        }

      });

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

this.cargarPermisosDelRol(
  nuevoRol.id
);


}

// =========================================================
// TOGGLE PERMISO
// =========================================================

togglePermiso(
role: Rol,
permiso: Permiso
): void {


permiso.granted =
  !permiso.granted;


}

// =========================================================
// GUARDAR PERMISOS DEL ROL
// =========================================================

guardarPermisosRol(): void {


const rol =
  this.selectedRoleObject;

if (!rol) {

  return;

}


const permisosSeleccionados =
  rol.perms.filter(
    permiso =>
      permiso.granted
  );


if (
  permisosSeleccionados.length === 0
) {

  this.mostrarError(
    'Debe seleccionar al menos un permiso para este rol.'
  );

  return;

}


// =====================================================
// CONSULTAR RELACIONES ACTUALES
// =====================================================

this.rolesService
  .listarPermisosRol(rol.id)
  .subscribe({

    next: (
      relacionesActuales:
        PermisoRolApi[]
    ) => {


      // ===============================================
      // ELIMINAR RELACIONES ANTERIORES
      // ===============================================

      const eliminaciones =
        relacionesActuales
          .filter(
            relacion =>
              relacion.id_permisos_rol !==
              undefined
          )
          .map(
            relacion =>

              this.rolesService
                .eliminarPermisoRol(
                  relacion.id_permisos_rol!
                )

          );


      if (
        eliminaciones.length === 0
      ) {

        this.crearRelacionesPermisos(
          rol.id,
          permisosSeleccionados
        );

        return;

      }


      forkJoin(
        eliminaciones
      ).subscribe({

        next: () => {

          this.crearRelacionesPermisos(
            rol.id,
            permisosSeleccionados
          );

        },

        error: (error: unknown) => {

          console.error(
            'Error al eliminar los permisos anteriores:',
            error
          );

          this.mostrarError(
            'No fue posible actualizar los permisos del rol.'
          );

        }

      });

    },

    error: (error: unknown) => {

      console.error(
        'Error al consultar los permisos actuales:',
        error
      );

      this.mostrarError(
        'No fue posible consultar los permisos actuales del rol.'
      );

    }

  });


}

// =========================================================
// CREAR RELACIONES DE PERMISOS
// =========================================================

private crearRelacionesPermisos(
idRol: number,
permisos: Permiso[]
): void {


const solicitudes:
  Observable<PermisoRolApi>[] =
  permisos.map(
    permiso =>

      this.rolesService
        .crearPermisoRol({

          id_permisos:
            permiso.id,

          id_rol:
            idRol

        })

  );


if (
  solicitudes.length === 0
) {

  this.mostrarError(
    'No hay permisos seleccionados.'
  );

  return;

}


forkJoin(
  solicitudes
).subscribe({

  next: () => {

    this.mostrarExito(
      `Configuración guardada correctamente para "${this.selectedRoleObject?.name}".`
    );

    this.ultimoRegistroAuditoria =
      `Permisos modificados el ${this.obtenerFechaActual()}.`;

    this.permisosRol = [];

    this.cargarPermisosDelRol(
      idRol
    );

  },

  error: (error: unknown) => {

    console.error(
      'Error al guardar los permisos:',
      error
    );

    this.mostrarError(
      'No fue posible guardar todos los permisos del rol.'
    );

  }

});


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
// CONTADORES
// =========================================================

getAllowedCount(
role: Rol
): number {


return role.perms.filter(
  permiso =>
    permiso.granted
).length;

}

getRestrictedCount(
role: Rol
): number {


return role.perms.filter(
  permiso =>
    !permiso.granted
).length;


}

// =========================================================
// VERIFICAR PERMISO
// =========================================================

hasPermission(
role: Rol,
nombrePermiso: string
): boolean {


return role.perms.some(
  permiso =>

    permiso.label ===
    nombrePermiso

    &&

    permiso.granted

);


}

// =========================================================
// PERMISOS PARA EL HTML
// =========================================================

get permisosLabels(): string[] {


return this.permisosDisponibles
  .map(
    permiso =>
      permiso.nombre
  );


}

// =========================================================
// OBTENER ID DE PERMISO
// =========================================================

getIdPermisoPorNombre(
nombre: string
): number {


const permiso =
  this.permisosDisponibles.find(
    permiso =>
      permiso.nombre ===
      nombre
  );

return permiso?.id_permisos ?? 0;


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
    descripcion: '',
    permisos: []
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

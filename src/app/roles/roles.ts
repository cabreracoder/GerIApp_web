import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Permiso {
  nombre: string;
  icono: string;
  permitido: boolean;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  usuarios: number;
  icono: string;
  color: string;
  permisos: Permiso[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles {

  // =====================================================
  // BÚSQUEDA
  // =====================================================

  searchText = '';

  // =====================================================
  // ROLES DEL SISTEMA
  // =====================================================

  roles: Rol[] = [

    {
      id: 'administrador',
      nombre: 'Administrador',
      descripcion:
        'Gestiona usuarios, pacientes, encargados, cuidadores y la configuración general del sistema.',
      usuarios: 2,
      icono: 'admin_panel_settings',
      color: '#3B5BDB',

      permisos: [
        {
          nombre: 'Gestionar usuarios',
          icono: 'group',
          permitido: true
        },
        {
          nombre: 'Gestionar pacientes',
          icono: 'elderly',
          permitido: true
        },
        {
          nombre: 'Gestionar encargados',
          icono: 'supervisor_account',
          permitido: true
        },
        {
          nombre: 'Gestionar cuidadores',
          icono: 'medical_services',
          permitido: true
        },
        {
          nombre: 'Gestionar roles y permisos',
          icono: 'admin_panel_settings',
          permitido: true
        },
        {
          nombre: 'Gestionar notificaciones',
          icono: 'notifications',
          permitido: true
        },
        {
          nombre: 'Consultar información de salud',
          icono: 'health_and_safety',
          permitido: true
        },
        {
          nombre: 'Modificar configuración',
          icono: 'settings',
          permitido: true
        }
      ]
    },

    {
      id: 'medico',
      nombre: 'Médico',
      descripcion:
        'Consulta y administra información clínica de los pacientes bajo su responsabilidad.',
      usuarios: 4,
      icono: 'medical_services',
      color: '#4DABF7',

      permisos: [
        {
          nombre: 'Gestionar usuarios',
          icono: 'group',
          permitido: false
        },
        {
          nombre: 'Gestionar pacientes',
          icono: 'elderly',
          permitido: true
        },
        {
          nombre: 'Gestionar encargados',
          icono: 'supervisor_account',
          permitido: false
        },
        {
          nombre: 'Gestionar cuidadores',
          icono: 'medical_services',
          permitido: false
        },
        {
          nombre: 'Gestionar roles y permisos',
          icono: 'admin_panel_settings',
          permitido: false
        },
        {
          nombre: 'Gestionar notificaciones',
          icono: 'notifications',
          permitido: true
        },
        {
          nombre: 'Consultar información de salud',
          icono: 'health_and_safety',
          permitido: true
        },
        {
          nombre: 'Modificar configuración',
          icono: 'settings',
          permitido: false
        }
      ]
    },

    {
      id: 'cuidador',
      nombre: 'Cuidador',
      descripcion:
        'Realiza seguimiento diario de los pacientes y registra novedades de cuidado.',
      usuarios: 8,
      icono: 'volunteer_activism',
      color: '#20C997',

      permisos: [
        {
          nombre: 'Gestionar usuarios',
          icono: 'group',
          permitido: false
        },
        {
          nombre: 'Gestionar pacientes',
          icono: 'elderly',
          permitido: true
        },
        {
          nombre: 'Gestionar encargados',
          icono: 'supervisor_account',
          permitido: false
        },
        {
          nombre: 'Gestionar cuidadores',
          icono: 'medical_services',
          permitido: false
        },
        {
          nombre: 'Gestionar roles y permisos',
          icono: 'admin_panel_settings',
          permitido: false
        },
        {
          nombre: 'Gestionar notificaciones',
          icono: 'notifications',
          permitido: true
        },
        {
          nombre: 'Consultar información de salud',
          icono: 'health_and_safety',
          permitido: true
        },
        {
          nombre: 'Modificar configuración',
          icono: 'settings',
          permitido: false
        }
      ]
    },

    {
      id: 'encargado',
      nombre: 'Encargado',
      descripcion:
        'Consulta información del paciente asignado y recibe notificaciones relacionadas con su cuidado.',
      usuarios: 12,
      icono: 'supervisor_account',
      color: '#F59E0B',

      permisos: [
        {
          nombre: 'Gestionar usuarios',
          icono: 'group',
          permitido: false
        },
        {
          nombre: 'Gestionar pacientes',
          icono: 'elderly',
          permitido: false
        },
        {
          nombre: 'Gestionar encargados',
          icono: 'supervisor_account',
          permitido: false
        },
        {
          nombre: 'Gestionar cuidadores',
          icono: 'medical_services',
          permitido: false
        },
        {
          nombre: 'Gestionar roles y permisos',
          icono: 'admin_panel_settings',
          permitido: false
        },
        {
          nombre: 'Gestionar notificaciones',
          icono: 'notifications',
          permitido: true
        },
        {
          nombre: 'Consultar información de salud',
          icono: 'health_and_safety',
          permitido: true
        },
        {
          nombre: 'Modificar configuración',
          icono: 'settings',
          permitido: false
        }
      ]
    },

    {
      id: 'paciente',
      nombre: 'Paciente',
      descripcion:
        'Accede únicamente a su información personal y a las funcionalidades autorizadas para su perfil.',
      usuarios: 25,
      icono: 'elderly',
      color: '#845EF7',

      permisos: [
        {
          nombre: 'Gestionar usuarios',
          icono: 'group',
          permitido: false
        },
        {
          nombre: 'Gestionar pacientes',
          icono: 'elderly',
          permitido: false
        },
        {
          nombre: 'Gestionar encargados',
          icono: 'supervisor_account',
          permitido: false
        },
        {
          nombre: 'Gestionar cuidadores',
          icono: 'medical_services',
          permitido: false
        },
        {
          nombre: 'Gestionar roles y permisos',
          icono: 'admin_panel_settings',
          permitido: false
        },
        {
          nombre: 'Gestionar notificaciones',
          icono: 'notifications',
          permitido: true
        },
        {
          nombre: 'Consultar información de salud',
          icono: 'health_and_safety',
          permitido: true
        },
        {
          nombre: 'Modificar configuración',
          icono: 'settings',
          permitido: false
        }
      ]
    }

  ];

  // =====================================================
  // ROL SELECCIONADO
  // =====================================================

  selectedRoleId = 'administrador';

  // =====================================================
  // ROL ACTUAL
  // =====================================================

  get selectedRole(): Rol {
    return (
      this.roles.find(
        rol => rol.id === this.selectedRoleId
      ) || this.roles[0]
    );
  }

  // =====================================================
  // COMPATIBILIDAD CON roles.html
  // =====================================================

  /**
   * Índice del rol actualmente seleccionado.
   * El HTML utiliza:
   * rolSeleccionado === i
   */
  get rolSeleccionado(): number {
    return this.roles.findIndex(
      rol => rol.id === this.selectedRoleId
    );
  }

  /**
   * Rol actualmente seleccionado.
   * El HTML utiliza rolActual.
   */
  get rolActual(): Rol {
    return this.selectedRole;
  }

  /**
   * Selecciona un rol mediante su índice.
   * El HTML utiliza seleccionarRol(i).
   */
  seleccionarRol(index: number): void {

    if (this.roles[index]) {
      this.selectedRoleId = this.roles[index].id;
    }

  }

  // =====================================================
  // SELECCIONAR ROL
  // =====================================================

  selectRole(id: string): void {
    this.selectedRoleId = id;
  }

  // =====================================================
  // CONTAR PERMISOS PERMITIDOS
  // =====================================================

  get allowedPermissions(): number {

    return this.selectedRole.permisos.filter(
      permiso => permiso.permitido
    ).length;

  }

  /**
   * Compatible con roles.html
   */
  permisosPermitidos(rol: Rol): number {

    return rol.permisos.filter(
      permiso => permiso.permitido
    ).length;

  }

  // =====================================================
  // CONTAR PERMISOS RESTRINGIDOS
  // =====================================================

  get restrictedPermissions(): number {

    return this.selectedRole.permisos.filter(
      permiso => !permiso.permitido
    ).length;

  }

  /**
   * Compatible con roles.html
   */
  permisosDenegados(rol: Rol): number {

    return rol.permisos.filter(
      permiso => !permiso.permitido
    ).length;

  }

  // =====================================================
  // CAMBIAR PERMISO
  // =====================================================

  togglePermission(
    roleId: string,
    permissionIndex: number
  ): void {

    const role = this.roles.find(
      r => r.id === roleId
    );

    if (!role) {
      return;
    }

    const permiso =
      role.permisos[permissionIndex];

    if (!permiso) {
      return;
    }

    permiso.permitido =
      !permiso.permitido;

  }

  /**
   * Compatible con roles.html
   */
  cambiarPermiso(index: number): void {

    this.togglePermission(
      this.selectedRoleId,
      index
    );

  }

  // =====================================================
  // VERIFICAR PERMISO
  // =====================================================

  tienePermiso(
    rol: Rol,
    nombrePermiso: string
  ): boolean {

    const permiso = rol.permisos.find(
      p => p.nombre === nombrePermiso
    );

    return permiso?.permitido ?? false;

  }

  // =====================================================
  // FILTRAR ROLES
  // =====================================================

  get filteredRoles(): Rol[] {

    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {
      return this.roles;
    }

    return this.roles.filter(rol =>
      rol.nombre
        .toLowerCase()
        .includes(search)
      ||
      rol.descripcion
        .toLowerCase()
        .includes(search)
    );

  }

  // =====================================================
  // TEXTO DEL PERMISO
  // =====================================================

  getPermissionStatus(
    permiso: Permiso
  ): string {

    return permiso.permitido
      ? 'PERMITIDO'
      : 'RESTRINGIDO';

  }

  // =====================================================
  // TOTAL DE USUARIOS
  // =====================================================

  get totalUsers(): number {

    return this.roles.reduce(
      (total, rol) =>
        total + rol.usuarios,
      0
    );

  }

  // =====================================================
  // PERMISOS DEL ROL ACTUAL
  // =====================================================

  get selectedPermissions(): Permiso[] {

    return this.selectedRole.permisos;

  }

  // =====================================================
  // COLOR DEL ROL
  // =====================================================

  getRoleColor(role: Rol): string {

    return role.color;

  }

  // =====================================================
  // ESTILO DEL ROL SELECCIONADO
  // =====================================================

  getRoleStyle(
    role: Rol
  ): { [key: string]: string } {

    return {
      '--role-color': role.color
    };

  }

  // =====================================================
  // VERIFICAR SI ESTÁ SELECCIONADO
  // =====================================================

  isSelected(role: Rol): boolean {

    return role.id === this.selectedRoleId;

  }

}
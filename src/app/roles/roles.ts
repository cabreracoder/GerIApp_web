import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Permiso {
  label: string;
  granted: boolean;
}

interface Rol {
  name: string;
  color: string;
  icon: string;
  userCount: number;
  description: string;
  perms: Permiso[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles {

  // =========================================================
  // PERMISOS DISPONIBLES
  // =========================================================

  readonly PERM_LABELS: string[] = [
    'Ver Dashboard',
    'Gestión de Pacientes',
    'Gestión de Cuidadores',
    'Gestión de Encargados',
    'Roles y Permisos',
    'Notificaciones',
    'Descargar Reportes',
    'Configuración del sistema'
  ];

  // =========================================================
  // ROLES
  // =========================================================

  roles: Rol[] = [
    {
      name: 'Administrador',
      color: '#3B5BDB',
      icon: 'admin_panel_settings',
      userCount: 2,
      description:
        'Acceso total al sistema. Gestiona usuarios, configura la plataforma y supervisa todas las operaciones de la fundación.',
      perms: this.PERM_LABELS.map(label => ({
        label,
        granted: true
      }))
    },

    {
      name: 'Cuidador',
      color: '#4DABF7',
      icon: 'health_and_safety',
      userCount: 8,
      description:
        'Personal de cuidado directo. Visualiza y actualiza información de los pacientes a su cargo durante su turno.',
      perms: [
        {
          label: 'Ver Dashboard',
          granted: false
        },
        {
          label: 'Gestión de Pacientes',
          granted: true
        },
        {
          label: 'Gestión de Cuidadores',
          granted: false
        },
        {
          label: 'Gestión de Encargados',
          granted: false
        },
        {
          label: 'Roles y Permisos',
          granted: false
        },
        {
          label: 'Notificaciones',
          granted: true
        },
        {
          label: 'Descargar Reportes',
          granted: false
        },
        {
          label: 'Configuración del sistema',
          granted: false
        }
      ]
    },

    {
      name: 'Encargado',
      color: '#7D6E5E',
      icon: 'supervisor_account',
      userCount: 1,
      description:
        'Supervisa el funcionamiento general de la fundación y tiene acceso a reportes y estadísticas operativas.',
      perms: [
        {
          label: 'Ver Dashboard',
          granted: true
        },
        {
          label: 'Gestión de Pacientes',
          granted: true
        },
        {
          label: 'Gestión de Cuidadores',
          granted: true
        },
        {
          label: 'Gestión de Encargados',
          granted: true
        },
        {
          label: 'Roles y Permisos',
          granted: false
        },
        {
          label: 'Notificaciones',
          granted: true
        },
        {
          label: 'Descargar Reportes',
          granted: true
        },
        {
          label: 'Configuración del sistema',
          granted: false
        }
      ]
    }
  ];

  // =========================================================
  // VARIABLES
  // =========================================================

  selectedRole: string = 'Administrador';

  searchTerm: string = '';

  // =========================================================
  // OBTENER ROL SELECCIONADO
  // =========================================================

  get selectedRoleObject(): Rol {
    return (
      this.roles.find(role => role.name === this.selectedRole)
      ?? this.roles[0]
    );
  }

  // =========================================================
  // ROLES FILTRADOS POR BÚSQUEDA
  // =========================================================

  get filteredRoles(): Rol[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.roles;
    }

    return this.roles.filter(role =>
      role.name.toLowerCase().includes(search) ||
      role.description.toLowerCase().includes(search)
    );
  }

  // =========================================================
  // SELECCIONAR ROL
  // =========================================================

  selectRole(name: string): void {
    this.selectedRole = name;
  }

  // =========================================================
  // CAMBIAR PERMISO
  // =========================================================

  togglePermiso(role: Rol, permiso: Permiso): void {
    permiso.granted = !permiso.granted;
  }

  // =========================================================
  // CONTAR PERMISOS PERMITIDOS
  // =========================================================

  getAllowedCount(role: Rol): number {
    return role.perms.filter(permiso => permiso.granted).length;
  }

  // =========================================================
  // CONTAR PERMISOS RESTRINGIDOS
  // =========================================================

  getRestrictedCount(role: Rol): number {
    return role.perms.filter(permiso => !permiso.granted).length;
  }

  // =========================================================
  // SABER SI UN PERMISO ESTÁ HABILITADO
  // =========================================================

  hasPermission(role: Rol, label: string): boolean {
    const permiso = role.perms.find(
      permiso => permiso.label === label
    );

    return permiso?.granted ?? false;
  }

  // =========================================================
  // BÚSQUEDA
  // =========================================================

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
  }

  // =========================================================
  // BOTONES DEL HEADER
  // =========================================================

  mostrarNotificaciones(): void {
    console.log('Notificaciones');
  }

  mostrarCalendario(): void {
    console.log('Calendario');
  }

  abrirPerfil(): void {
    console.log('Perfil del usuario');
  }

  // =========================================================
  // NAVEGACIÓN DEL SIDEBAR
  // =========================================================

  navegar(nombre: string): void {
    console.log(`Navegando a: ${nombre}`);
  }

  cerrarSesion(): void {
    console.log('Cerrar sesión');
  }
}
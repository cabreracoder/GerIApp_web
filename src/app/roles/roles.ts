
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { RolesService, RolApi } from './roles.service';

interface Permiso {
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
  name: string;
  color: string;
  icon: string;
  userCount: number;
  description: string;
  perms: Permiso[];
  usuariosAsociados: UsuarioAsociado[];
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.html',
  styleUrl: './roles.css'
})
export class Roles implements OnInit {

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
  // LISTADO GENERAL DE ROLES
  // =========================================================

  usuariosGeneralesDisponibles: UsuarioAsociado[] = [
    { id: 1, name: 'Jose Cabrera', email: 'jose.cabrera@fundacion.org', estado: 'activo', avatar: 'JC' },
    { id: 2, name: 'Ana María Gómez', email: 'ana.gomez@fundacion.org', estado: 'activo', avatar: 'AM' },
    { id: 3, name: 'Carlos Pérez', email: 'carlos.perez@fundacion.org', estado: 'activo', avatar: 'CP' },
    { id: 4, name: 'Lucía Benítez', email: 'lucia.benitez@fundacion.org', estado: 'inactivo', avatar: 'LB' },
    { id: 5, name: 'María López', email: 'maria.lopez@fundacion.org', estado: 'activo', avatar: 'ML' },
    { id: 6, name: 'Esteban Quito', email: 'esteban.quito@fundacion.org', estado: 'activo', avatar: 'EQ' },
    { id: 7, name: 'Sofía Vergara', email: 'sofia.vergara@fundacion.org', estado: 'inactivo', avatar: 'SV' },
    { id: 8, name: 'Mateo Riascos', email: 'mateo.riascos@fundacion.org', estado: 'activo', avatar: 'MR' },
    { id: 9, name: 'Valeria Jaramillo', email: 'valeria.jaramillo@fundacion.org', estado: 'activo', avatar: 'VJ' },
    { id: 10, name: 'Andrés Quina', email: 'andres.quina@fundacion.org', estado: 'activo', avatar: 'AQ' },
    { id: 11, name: 'Alex Rosero', email: 'alex.rosero@fundacion.org', estado: 'inactivo', avatar: 'AR' },
    { id: 12, name: 'Camila Torres', email: 'camila.torres@fundacion.org', estado: 'activo', avatar: 'CT' }
  ];

  private readonly CONFIGURACION_ROLES: Record<
    string,
    { color: string; icon: string; permisos: string[] }
  > = {
    Administrador: {
      color: 'var(--color-primary)',
      icon: 'admin_panel_settings',
      permisos: [...this.PERM_LABELS]
    },

    Cuidador: {
      color: 'var(--color-secondary)',
      icon: 'health_and_safety',
      permisos: [
        'Gestión de Pacientes',
        'Notificaciones'
      ]
    },

    Encargado: {
      color: 'var(--color-tertiary)',
      icon: 'supervisor_account',
      permisos: [
        'Ver Dashboard',
        'Gestión de Pacientes',
        'Gestión de Cuidadores',
        'Gestión de Encargados',
        'Notificaciones',
        'Descargar Reportes'
      ]
    }
  };

  roles: Rol[] = [];

  selectedRole = '';
  searchTerm = '';

  filtroEstadoUsuario: 'Todos' | 'activo' | 'inactivo' = 'Todos';

  mostrarFormularioRol = false;

  mensajeExito = '';
  mensajeError = '';

  ultimoRegistroAuditoria =
    'Sin modificaciones recientes en esta sesión.';

  nuevoRol = {
    nombre: '',
    descripcion: '',
    permisos: [] as string[]
  };

  constructor(
    private readonly rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.cargarRoles();
  }

  /**
   * Carga los roles registrados en la API.
   */
  cargarRoles(): void {
    this.rolesService.listarRoles().subscribe({
      next: (rolesApi: RolApi[]) => {
        this.roles = rolesApi.map(rol => this.convertirRol(rol));

        if (this.roles.length > 0) {
          this.selectedRole = this.roles[0].name;
        }
      },

      error: error => {
        console.error('Error al cargar los roles:', error);

        this.mensajeError =
          'No fue posible cargar los roles desde el servidor.';
      }
    });
  }

  /**
   * Convierte el modelo recibido desde la API
   * al modelo utilizado por la interfaz.
   */
  private convertirRol(rolApi: RolApi): Rol {

    const configuracion =
      this.CONFIGURACION_ROLES[rolApi.nombre] ??
      this.crearConfiguracionPorDefecto();

    const permisos = this.PERM_LABELS.map(label => ({
      label,
      granted: configuracion.permisos.includes(label)
    }));

    return {
      name: rolApi.nombre,
      color: configuracion.color,
      icon: configuracion.icon,
      userCount: 0,
      description: rolApi.descripcion,
      perms: permisos,
      usuariosAsociados: []
    };
  }

  /**
   * Configuración visual para roles nuevos.
   */
  private crearConfiguracionPorDefecto() {
    return {
      color: 'var(--color-primary)',
      icon: 'badge',
      permisos: []
    };
  }

  get selectedRoleObject(): Rol {

    return (
      this.roles.find(
        role => role.name === this.selectedRole
      ) ?? this.roles[0]
    );
  }

  get filteredRoles(): Rol[] {

    const textoBusqueda =
      this.searchTerm.trim().toLowerCase();

    if (!textoBusqueda) {
      return this.roles;
    }

    return this.roles.filter(role =>
      role.name.toLowerCase().includes(textoBusqueda) ||
      role.description.toLowerCase().includes(textoBusqueda)
    );
  }

  get usuariosFiltrados(): UsuarioAsociado[] {

    const usuarios =
      this.selectedRoleObject?.usuariosAsociados ?? [];

    if (this.filtroEstadoUsuario === 'Todos') {
      return usuarios;
    }

    return usuarios.filter(
      usuario => usuario.estado === this.filtroEstadoUsuario
    );
  }

  selectRole(nombreRol: string): void {

    this.selectedRole = nombreRol;

    this.filtroEstadoUsuario = 'Todos';

    this.limpiarMensajes();
  }

  abrirNuevoRol(): void {

    this.mostrarFormularioRol = true;

    this.nuevoRol = {
      nombre: '',
      descripcion: '',
      permisos: []
    };

    this.limpiarMensajes();
  }

  cerrarFormularioRol(): void {
    this.mostrarFormularioRol = false;
  }

  crearRol(): void {

    const nombre =
      this.nuevoRol.nombre.trim();

    const descripcion =
      this.nuevoRol.descripcion.trim();

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

    if (this.nuevoRol.permisos.length === 0) {
      this.mostrarError(
        'Debe seleccionar al menos un permiso.'
      );
      return;
    }

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

    const nuevoRol: Rol = {
      name: nombre,
      color: 'var(--color-primary)',
      icon: 'badge',
      userCount: 0,
      description: descripcion,

      perms: this.PERM_LABELS.map(label => ({
        label,
        granted:
          this.nuevoRol.permisos.includes(label)
      })),

      usuariosAsociados: []
    };

    this.roles.push(nuevoRol);

    this.selectedRole = nuevoRol.name;

    this.cerrarFormularioRol();

    this.mostrarExito(
      `El rol "${nuevoRol.name}" fue creado correctamente.`
    );

    this.ultimoRegistroAuditoria =
      `Rol creado el ${this.obtenerFechaActual()}.`;

    this.limpiarFormulario();
  }

  togglePermiso(
    role: Rol,
    permiso: Permiso
  ): void {

    permiso.granted = !permiso.granted;
  }

  guardarPermisosRol(): void {

    const rol = this.selectedRoleObject;

    if (!rol) {
      return;
    }

    const permisosActivos =
      this.getAllowedCount(rol);

    if (permisosActivos === 0) {
      this.mostrarError(
        'Debe seleccionar al menos un permiso para este rol.'
      );
      return;
    }

    this.mostrarExito(
      `Configuración guardada correctamente para "${rol.name}".`
    );

    this.ultimoRegistroAuditoria =
      `Permisos modificados el ${this.obtenerFechaActual()}.`;
  }

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

  getAllowedCount(role: Rol): number {
    return role.perms.filter(
      permiso => permiso.granted
    ).length;
  }

  getRestrictedCount(role: Rol): number {
    return role.perms.filter(
      permiso => !permiso.granted
    ).length;
  }

  hasPermission(
    role: Rol,
    nombrePermiso: string
  ): boolean {

    return role.perms.some(
      permiso =>
        permiso.label === nombrePermiso &&
        permiso.granted
    );
  }

  onSearch(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    this.searchTerm = input.value;
  }

  private mostrarError(mensaje: string): void {

    this.mensajeError = mensaje;
    this.mensajeExito = '';
  }

  private mostrarExito(mensaje: string): void {

    this.mensajeExito = mensaje;
    this.mensajeError = '';

    setTimeout(() => {
      this.mensajeExito = '';
    }, 4000);
  }

  private limpiarMensajes(): void {

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  private limpiarFormulario(): void {

    this.nuevoRol = {
      nombre: '',
      descripcion: '',
      permisos: []
    };
  }

  private obtenerFechaActual(): string {

    return new Date().toLocaleString();
  }
}


import { CommonModule } from '@angular/common';
import {ChangeDetectorRef,Component,OnInit} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

// =====================================================
// ALERTAS (SweetAlert2 + Tailwind)
// =====================================================

type Tono = 'rojo' | 'ambar' | 'azul' | 'verde';

const TONOS: Record<Tono, { panel: string; boton: string }> = {
  rojo: { panel: 'bg-linear-to-b from-red-500 to-red-700', boton: 'bg-red-600 hover:bg-red-700' },
  ambar: { panel: 'bg-linear-to-b from-amber-500 to-amber-700', boton: 'bg-amber-600 hover:bg-amber-700' },
  azul: { panel: 'bg-linear-to-b from-blue-500 to-blue-700', boton: 'bg-blue-600 hover:bg-blue-700' },
  verde: { panel: 'bg-linear-to-b from-emerald-500 to-emerald-700', boton: 'bg-emerald-600 hover:bg-emerald-700' },
};

// Iconos blancos del panel (papelera, prohibido, lápiz, check, equis, alerta)
const svgIcono = (trazos: string): string =>
  `<svg class="h-11 w-11" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${trazos}</svg>`;

const ICONOS = {
  papelera: svgIcono('<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>'),
  prohibido: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>'),
  lapiz: svgIcono('<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>'),
  check: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>'),
  equis: svgIcono('<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>'),
  alerta: svgIcono('<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>'),
};

// Evita que un nombre del backend inyecte HTML
function escaparHtml(texto: string): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inicialesAlerta(nombre: string): string {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return '?';
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

interface ConfigAlerta {
  tono: Tono;
  icono: 'warning' | 'question' | 'success' | 'error';
  iconoSvg: string;
  titulo: string;
  html?: string;
  confirmar: string;
  cancelar?: string;
  confirmarIzquierda?: boolean;   // true = "Sí, ..." a la izquierda (como en Editar)
  enfocarCancelar?: boolean;
  autoCerrar?: boolean;           // true = sin botones, se cierra a los 1,8 s
}

// Motor único: todas las alertas pasan por aquí.
// Las clases con "!" ganan sobre el CSS que SweetAlert2 trae por defecto.
function mostrarAlerta(c: ConfigAlerta) {

  const tono = TONOS[c.tono];
  const conBotones = !c.autoCerrar;
  const conCancelar = !!c.cancelar;
  const botonSolo = conBotones && !conCancelar;
  const tituloSinPie = !conBotones && !c.html;

  return Swal.fire({
    icon: c.icono,
    iconHtml: c.iconoSvg,
    title: escaparHtml(c.titulo),
    html: c.html,

    showConfirmButton: conBotones,
    showCancelButton: conCancelar,
    confirmButtonText: c.confirmar,
    cancelButtonText: c.cancelar,
    reverseButtons: !c.confirmarIzquierda,
    focusCancel: !!c.enfocarCancelar,
    timer: c.autoCerrar ? 1800 : undefined,

    buttonsStyling: false,
    backdrop: 'rgba(15, 23, 42, 0.65)',

    customClass: {
      popup: '!grid-cols-[26%_1fr] !w-[34rem] !max-w-[92vw] !p-0 !rounded-[2.2rem] !overflow-hidden !bg-white',
      icon: `col-start-1 row-start-1 row-span-3 !m-0 !flex !h-auto !w-auto !items-center !justify-center !rounded-none !border-0 !animate-none ${tono.panel}`,
      title: `col-start-2 row-start-1 !m-0 !px-7 !pt-8 ${tituloSinPie ? '!pb-8' : '!pb-0'} !text-left !text-[1.6rem] !leading-tight !font-extrabold !text-slate-900`,
      htmlContainer: `col-start-2 row-start-2 !m-0 !px-7 !pt-0 ${conBotones ? '!pb-0' : '!pb-8'} !justify-start !overflow-visible !text-left !text-base !font-normal`,
      actions: `col-start-2 row-start-3 !m-0 !w-auto !flex-nowrap !gap-3 !px-7 !pt-6 !pb-8 ${botonSolo ? '!justify-end' : '!justify-stretch'}`,
      confirmButton: `${botonSolo ? 'w-[calc(50%-0.375rem)]' : 'flex-1'} cursor-pointer rounded-2xl px-4 py-3 text-[1.1rem] font-bold text-white transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300 ${tono.boton}`,
      cancelButton: 'flex-1 cursor-pointer rounded-2xl bg-slate-100 px-4 py-3 text-[1.1rem] font-bold text-slate-600 transition-colors hover:bg-slate-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-300',
    },
  });
}

// ---- Confirmaciones: subtítulo gris + avatar con iniciales + pregunta ----

function alertaConfirmar(c: {
  tono: Tono;
  icono: 'warning' | 'question';
  iconoSvg: string;
  verbo: string;
  entidad: string;
  nombre: string;
  subtitulo: string;
  confirmar: string;
  confirmarIzquierda?: boolean;
  enfocarCancelar?: boolean;
}) {

  const html = `
    <p class="m-0 text-[1.1rem] leading-snug text-slate-400">${escaparHtml(c.subtitulo)}</p>
    <div class="mt-4 flex items-center gap-3.5">
      <span class="flex h-[2.4rem] w-[2.4rem] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">${escaparHtml(inicialesAlerta(c.nombre))}</span>
      <p class="m-0 text-[1.15rem] leading-snug text-slate-700">¿${c.verbo} a <strong class="font-bold">${escaparHtml(c.nombre)}</strong>?</p>
    </div>
  `;

  return mostrarAlerta({
    tono: c.tono,
    icono: c.icono,
    iconoSvg: c.iconoSvg,
    titulo: `${c.verbo} ${c.entidad}`,
    html,
    confirmar: c.confirmar,
    cancelar: 'Cancelar',
    confirmarIzquierda: c.confirmarIzquierda,
    enfocarCancelar: c.enfocarCancelar,
  });
}

// Imagen 1: rojo
function alertaEliminar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'rojo', icono: 'warning', iconoSvg: ICONOS.papelera,
    verbo: 'Eliminar', entidad, nombre,
    subtitulo: 'Acción permanente · no se puede deshacer',
    confirmar: 'Sí, eliminar',
    enfocarCancelar: true,
  });
}

// Imagen 2: ámbar
function alertaDesactivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.prohibido,
    verbo: 'Desactivar', entidad, nombre,
    subtitulo: 'Cambio reversible · puedes reactivarlo luego',
    confirmar: 'Sí, desactivar',
  });
}

// Imagen 3: azul ("Sí, editar" va a la izquierda)
function alertaEditar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'azul', icono: 'question', iconoSvg: ICONOS.lapiz,
    verbo: 'Editar', entidad, nombre,
    subtitulo: 'Se abrirá el formulario de edición',
    confirmar: 'Sí, editar',
    confirmarIzquierda: true,
  });
}

// Misma forma que Editar, en verde
function alertaActivar(nombre: string, entidad = 'encargado') {
  return alertaConfirmar({
    tono: 'verde', icono: 'question', iconoSvg: ICONOS.check,
    verbo: 'Activar', entidad, nombre,
    subtitulo: 'Volverá a estar activo · puedes desactivarlo luego',
    confirmar: 'Sí, activar',
    confirmarIzquierda: true,
  });
}

// ---- Avisos: mismo panel, título y texto; un solo botón a la derecha ----

function htmlMensaje(mensaje?: string): string | undefined {
  return mensaje
    ? `<p class="m-0 text-[1.15rem] leading-snug text-slate-700">${escaparHtml(mensaje)}</p>`
    : undefined;
}

// Se cierra solo a los 1,8 s (sin botones)
function alertaExito(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'verde', icono: 'success', iconoSvg: ICONOS.check,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar', autoCerrar: true,
  });
}

// Siempre lleva botón, para que no se pierda
function alertaError(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'rojo', icono: 'error', iconoSvg: ICONOS.equis,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
  });
}

function alertaAdvertencia(titulo: string, mensaje?: string) {
  return mostrarAlerta({
    tono: 'ambar', icono: 'warning', iconoSvg: ICONOS.alerta,
    titulo, html: htmlMensaje(mensaje), confirmar: 'Aceptar',
  });
}

// =========================================================
// INTERFACES
// =========================================================

interface RolApi {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

interface UsuarioApi {
  id_usuario: number;
  id_rol: number | null;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string | null;
  fecha_ingreso: string;
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
  'https://geriapp-backend.onrender.com/api';

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
      icon: 'verified_user'
    },

    Cuidador: {
      color: 'var(--color-primary)',
      icon: 'favorite'
    },

    Encargado: {
      color: 'var(--color-primary)',
      icon: 'person_check'
    }
  };

  // =========================================================
  // DATOS
  // =========================================================

  roles: Rol[] = [];

  usuarios: UsuarioApi[] = [];

  // =========================================================
  // BUSCADOR
  // =========================================================

  searchText = '';

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

  cargandoUsuarios = false;

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

    // Cargar roles y usuarios
    this.cargarDatos();
  }

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  cargarDatos(): void {

    this.cargarUsuarios();

    this.cargarRoles();
  }

  // =========================================================
  // CARGAR USUARIOS
  // GET /api/usuarios/
  // =========================================================

  cargarUsuarios(): void {

    this.cargandoUsuarios = true;

    console.log(
      'CARGANDO USUARIOS...'
    );

    this.http
      .get<UsuarioApi[]>(
        `${this.apiUrl}/usuarios/`
      )
      .subscribe({

        next: (
          usuariosApi: UsuarioApi[]
        ) => {

          console.log(
            'USUARIOS RECIBIDOS DE LA API:',
            usuariosApi
          );

          this.usuarios =
            usuariosApi;

          this.cargandoUsuarios = false;

          // Si los roles ya llegaron,
          // actualizamos sus cantidades
          if (this.roles.length > 0) {

            this.actualizarUsuariosPorRol();
          }

          this.cdr.detectChanges();
        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR AL CARGAR USUARIOS:',
            error
          );

          this.cargandoUsuarios = false;

          this.mostrarError(
            'No fue posible cargar los usuarios desde el servidor.'
          );

          this.cdr.detectChanges();
        }
      });
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

        next: (
          rolesApi: RolApi[]
        ) => {

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
          // ACTUALIZAR CANTIDAD DE USUARIOS POR ROL
          // =================================================

          this.actualizarUsuariosPorRol();

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

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR AL CARGAR LOS ROLES:',
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
  // ACTUALIZAR USUARIOS POR ROL
  // =========================================================

  private actualizarUsuariosPorRol(): void {

    console.log(
      'ACTUALIZANDO CANTIDAD DE USUARIOS POR ROL...'
    );

    this.roles =
      this.roles.map(
        rol => {

          // -------------------------------------------------
          // BUSCAR USUARIOS QUE PERTENECEN A ESTE ROL
          // -------------------------------------------------

          const usuariosDelRol =
            this.usuarios.filter(
              usuario =>
                usuario.id_rol === rol.id
            );

          // -------------------------------------------------
          // CONVERTIR USUARIOS PARA LA INTERFAZ
          // -------------------------------------------------

          const usuariosAsociados:
            UsuarioAsociado[] =
            usuariosDelRol.map(
              usuario => ({

                id:
                  usuario.id_usuario,

                name:
                  `${usuario.nombres} ${usuario.apellidos}`
                    .trim(),

                email:
                  usuario.correo,

                estado:
                  usuario.estado
                    ? 'activo'
                    : 'inactivo',

                avatar:
                  this.obtenerIniciales(
                    `${usuario.nombres} ${usuario.apellidos}`
                  )
              })
            );

          return {

            ...rol,

            userCount:
              usuariosDelRol.length,

            usuariosAsociados:
              usuariosAsociados
          };
        }
      );

    console.log(
      'ROLES CON CANTIDAD DE USUARIOS:',
      this.roles
    );

    this.cdr.detectChanges();
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
  // ROLES FILTRADOS
  // =========================================================

  get filteredRoles(): Rol[] {

    const texto =
      this.searchText
        .trim()
        .toLowerCase();

    if (!texto) {

      return this.roles;
    }

    return this.roles.filter(
      role =>
        role.name
          .toLowerCase()
          .includes(texto)
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
      nombre.length < 2
    ) {

      this.mostrarError(
        'El nombre del rol debe tener al menos 2 caracteres.'
      );

      return;
    }

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

    const nuevoRolApi:
      Omit<RolApi, 'id_rol'> = {

      nombre:
        nombre,

      descripcion:
        descripcion,

      estado:
        true
    };

    this.guardandoRol =
      true;

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

          // Actualizar cantidad de usuarios
          this.actualizarUsuariosPorRol();
        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR AL CREAR EL ROL:',
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

    const idRol =
      this.rolEditandoId;

    const rolActualizado:
      Partial<Omit<RolApi, 'id_rol'>> = {

      nombre:
        nombre,

      descripcion:
        descripcion
    };

    this.guardandoRol =
      true;

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

            // Conservamos los usuarios asociados
            const usuariosActuales =
              this.roles[indice]
                .usuariosAsociados;

            const cantidadUsuarios =
              this.roles[indice]
                .userCount;

            const rolConvertido =
              this.convertirRol(
                rolApi
              );

            this.roles[indice] = {

              ...rolConvertido,

              userCount:
                cantidadUsuarios,

              usuariosAsociados:
                usuariosActuales
            };
          }

          this.selectedRole =
            rolApi.nombre;

          this.guardandoRol =
            false;

          this.finalizarActualizacionRol(
            rolApi
          );

          this.actualizarUsuariosPorRol();
        },

        error: (
          error: unknown
        ) => {

          console.error(
            'ERROR AL ACTUALIZAR EL ROL:',
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

 eliminarRol(rol: Rol): void {

  alertaEliminar(rol.name, 'rol').then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.eliminandoRolId = rol.id;

    this.http.delete<void>(`${this.apiUrl}/roles/${rol.id}/`).subscribe({

      next: () => {

        const indice = this.roles.findIndex(item => item.id === rol.id);

        if (indice !== -1) {
          this.roles.splice(indice, 1);
        }

        if (this.selectedRole === rol.name) {
          this.selectedRole = this.roles.length > 0 ? this.roles[0].name : '';
        }

        this.eliminandoRolId = null;

        this.ultimoRegistroAuditoria = `Rol eliminado el ${this.obtenerFechaActual()}.`;

        this.mostrarExito(`El rol "${rol.name}" fue eliminado correctamente.`);

        this.cdr.detectChanges();
      },

      error: (error: unknown) => {

        console.error('ERROR AL ELIMINAR EL ROL:', error);

        this.eliminandoRolId = null;

        this.mostrarError('No fue posible eliminar el rol. Verifique si tiene usuarios asociados.');

        this.cdr.detectChanges();
      }
    });
  });
}
  // =========================================================
  // FINALIZAR CREACIÓN
  // =========================================================

  private finalizarCreacionRol(
    nuevoRol: Rol
  ): void {

 this.cerrarFormularioRol();

    this.ultimoRegistroAuditoria =
      `Rol creado el ${this.obtenerFechaActual()}.`;

    this.mostrarExito(
      `El rol "${nuevoRol.name}" fue creado correctamente.`
    );

    this.cdr.detectChanges();
  }


  // =========================================================
  // FINALIZAR ACTUALIZACIÓN
  // =========================================================

  private finalizarActualizacionRol(
    rolApi: RolApi
  ): void {

    this.cerrarFormularioRol();

    this.ultimoRegistroAuditoria =
      `Rol actualizado el ${this.obtenerFechaActual()}.`;

    this.mostrarExito(
      `El rol "${rolApi.nombre}" fue actualizado correctamente.`
    );

    this.cdr.detectChanges();
  }

  // =========================================================
  // VER DETALLE DEL USUARIO
  // =========================================================

 verDetalleUsuario(usuario: UsuarioAsociado): void {

  mostrarAlerta({
    tono: 'azul',
    icono: 'question',
    iconoSvg: svgIcono('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    titulo: 'Detalle del usuario',
    html: `
      <div class="text-left text-[1.05rem] leading-relaxed text-slate-700 space-y-1.5">
        <p><strong class="font-bold">Nombre:</strong> ${escaparHtml(usuario.name)}</p>
        <p><strong class="font-bold">Correo:</strong> ${escaparHtml(usuario.email)}</p>
        <p><strong class="font-bold">Estado:</strong> ${escaparHtml(usuario.estado.toUpperCase())}</p>
      </div>
    `,
    confirmar: 'Cerrar'
  });
}

  // =========================================================
  // OBTENER INICIALES
  // =========================================================

  private obtenerIniciales(
    nombre: string
  ): string {

    if (!nombre.trim()) {

      return '';
    }

    const palabras =
      nombre
        .trim()
        .split(/\s+/)
        .filter(
          palabra =>
            palabra.length > 0
        );

    if (
      palabras.length === 1
    ) {

      return palabras[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      palabras[0].charAt(0) +
      palabras[1].charAt(0)
    ).toUpperCase();
  }

  // =========================================================
  // MOSTRAR ERROR
  // =========================================================

  private mostrarError(
    mensaje: string
  ): void {

     alertaError('Error', mensaje);
  }

  // =========================================================
  // MOSTRAR ÉXITO
  // =========================================================

  private mostrarExito(
    mensaje: string
  ): void {

    alertaExito('Éxito', `${mensaje} ${this.ultimoRegistroAuditoria}`);
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
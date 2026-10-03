import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
// INTERFAZ USUARIO
// =========================================================

interface Usuario {
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
  contrasena?: string;
}

// =========================================================
// INTERFAZ ROL
// =========================================================

interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

// =========================================================
// COMPONENTE
// =========================================================

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css'
})
export class Usuarios implements OnInit {

  // =========================================================
  // URL BASE DE LA API
  // =========================================================

  private readonly apiUrl = 'https://geriapp-backend.onrender.com/api';

  // =========================================================
  // USUARIOS
  // =========================================================

  users: Usuario[] = [];

  // =========================================================
  // USUARIOS FILTRADOS
  // =========================================================

  usuariosFiltrados: Usuario[] = [];

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  usuariosPaginaActual: Usuario[] = [];

  usuariosPorPagina = 10;

  paginaActual = 1;

  totalPaginas = 1;
  paginas: number[] = [];
  // =========================================================
  // TEXTO DE BÚSQUEDA
  // =========================================================

  busqueda = '';

  // =========================================================
  // ROLES
  // =========================================================

  roles: Rol[] = [];

  // =========================================================
  // USUARIO QUE SE ESTÁ GUARDANDO
  // =========================================================

  savingUserId: number | null = null;

  // =========================================================
  // ROLES ORIGINALES
  // =========================================================

  private originalRoleIds: {
    [id_usuario: number]: number | null;
  } = {};

  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  // =========================================================
  // INICIAR COMPONENTE
  // =========================================================

  ngOnInit(): void {
    this.listarUsuarios();
    this.listarRoles();
  }

  // =========================================================
  // LISTAR USUARIOS - GET
  // =========================================================

  listarUsuarios(): void {

    this.http.get<Usuario[]>(
      `${this.apiUrl}/usuarios/`
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'Usuarios recibidos:',
          respuesta
        );

        // Guardamos todos los usuarios
        this.users = respuesta;

        // Inicialmente mostramos todos
        this.usuariosFiltrados = respuesta;
        this.paginaActual = 1;
        this.actualizarPaginacion();

        // Guardamos el rol original de cada usuario
        this.users.forEach((usuario) => {

          this.originalRoleIds[
            usuario.id_usuario
          ] = usuario.id_rol;

        });

        console.log(
          'Total usuarios:',
          this.users.length
        );

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error al obtener los usuarios:',
          error
        );

        console.error(
          'Detalle:',
          error.error
        );

        alertaError('Error', 'No se pudieron cargar los usuarios.');

        this.cdr.detectChanges();
      }

    });

  }

  // =========================================================
  // BUSCAR USUARIOS
  // =========================================================

  buscarUsuarios(): void {

    const texto = this.busqueda
      .trim()
      .toLowerCase();

    // Si el buscador está vacío,
    // mostramos todos los usuarios
    if (!texto) {

      this.usuariosFiltrados = this.users;
      this.paginaActual = 1;
      this.actualizarPaginacion();

      return;
    }

    // Filtramos por nombre, apellido,
    // correo, documento o rol
    this.usuariosFiltrados = this.users.filter(
      (usuario) => {

        const nombreCompleto =
          `${usuario.nombres} ${usuario.apellidos}`
            .toLowerCase();

        const correo =
          usuario.correo
            ?.toLowerCase() || '';

        const documento =
          usuario.numero_documento
            ?.toLowerCase() || '';

        const rol =
          this.getRoleName(usuario.id_rol)
            .toLowerCase();

        return (
          nombreCompleto.includes(texto) ||
          correo.includes(texto) ||
          documento.includes(texto) ||
          rol.includes(texto)
        );
      }
    );
    this.paginaActual = 1;
    this.actualizarPaginacion();

    console.log(
      'Usuarios encontrados:',
      this.usuariosFiltrados.length
    );

    this.cdr.detectChanges();
  }

  // =========================================================
  // LIMPIAR BÚSQUEDA
  // =========================================================

  limpiarBusqueda(): void {

    this.busqueda = '';
    this.usuariosFiltrados = this.users;
    this.paginaActual = 1;
    this.actualizarPaginacion();
    this.cdr.detectChanges();
  }

  // =========================================================
  // LISTAR ROLES - GET
  // =========================================================

  listarRoles(): void {

    this.http.get<Rol[]>(
      `${this.apiUrl}/roles/`
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'Roles recibidos:',
          respuesta
        );

        // Mostramos únicamente los roles activos
        this.roles = respuesta.filter(
          (rol) => rol.estado === true
        );

        console.log(
          'Roles disponibles:',
          this.roles
        );

        // Volvemos a ejecutar la búsqueda por si
        // el usuario ya había escrito algo
        this.buscarUsuarios();

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'Error al obtener los roles:',
          error
        );

        console.error(
          'Detalle:',
          error.error
        );

      alertaError('Error', 'No se pudieron cargar los roles.');

        this.cdr.detectChanges();
      }

    });

  }

  // =========================================================
  // CAMBIAR ROL
  // =========================================================

  onRoleChange(
    user: Usuario,
    roleId: number | null
  ): void {

    user.id_rol = roleId;

  }

  // =========================================================
  // GUARDAR ROL - PATCH
  // =========================================================

  saveRole(user: Usuario): void {

    // Evitamos múltiples solicitudes simultáneas
    if (this.savingUserId !== null) {
      return;
    }

    // Si el rol no cambió respecto al original, no hacemos nada
    if (
      this.originalRoleIds[user.id_usuario] === user.id_rol
    ) {

      alertaAdvertencia('Sin cambios', 'No has modificado el rol de este usuario.');

      return;
    }

    // Activamos "Guardando..."
    this.savingUserId = user.id_usuario;

    console.log(
      'Actualizando rol del usuario:',
      user.id_usuario
    );

    console.log(
      'Nuevo id_rol:',
      user.id_rol
    );

    // =======================================================
    // PATCH
    // =======================================================

    this.http.patch<Usuario>(
      `${this.apiUrl}/usuarios/${user.id_usuario}/`,
      {
        id_rol: user.id_rol
      }
    ).subscribe({

      // =====================================================
      // ÉXITO
      // =====================================================

      next: (respuesta) => {

        console.log(
          'Usuario actualizado:',
          respuesta
        );

        // Actualizamos el objeto con la respuesta
        user.id_rol = respuesta.id_rol;

        // Guardamos el nuevo rol como original
        this.originalRoleIds[
          user.id_usuario
        ] = respuesta.id_rol;

        // Quitamos "Guardando..."
        this.savingUserId = null;

        alertaExito('Rol actualizado', `Rol de ${user.nombres} ${user.apellidos} actualizado correctamente.`);

        this.cdr.detectChanges();

      },


      // =====================================================
      // ERROR
      // =====================================================

      error: (error) => {

        console.error(
          'Error al actualizar el rol:',
          error
        );

        console.error(
          'Detalle:',
          error.error
        );

        // Restauramos el rol anterior
        user.id_rol =
          this.originalRoleIds[
          user.id_usuario
          ] ?? null;

        // Quitamos "Guardando..."
        this.savingUserId = null;

        alertaError('Error', 'No se pudo actualizar el rol del usuario.');

        this.cdr.detectChanges();

      }

    });

  }
  // =========================================================
  // ACTUALIZAR PAGINACIÓN
  // =========================================================

  actualizarPaginacion(): void {

    this.totalPaginas = Math.ceil(
      this.usuariosFiltrados.length / this.usuariosPorPagina
    );

    this.paginas = Array.from(
      { length: this.totalPaginas },
      (_, i) => i + 1
    );

    const inicio =
      (this.paginaActual - 1) * this.usuariosPorPagina;

    const fin =
      inicio + this.usuariosPorPagina;

    this.usuariosPaginaActual =
      this.usuariosFiltrados.slice(inicio, fin);
  }


  // =========================================================
  // CAMBIAR PÁGINA
  // =========================================================

  cambiarPagina(pagina: number): void {

    if (
      pagina < 1 ||
      pagina > this.totalPaginas
    ) {
      return;
    }

    this.paginaActual = pagina;

    this.actualizarPaginacion();
  }
  // =========================================================
  // OBTENER NOMBRE DEL ROL
  // =========================================================

  getRoleName(
    roleId: number | null
  ): string {

    if (roleId === null) {
      return 'Sin rol asignado';
    }

    const role = this.roles.find(
      (rol) => rol.id_rol === roleId
    );

    if (!role) {
      return 'Sin rol asignado';
    }

    return role.nombre;
  }

}
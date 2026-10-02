import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  rol?: string;
  foto?: string | null;
}

interface Rol {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}



@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion implements OnInit {

  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  // =====================================================
  // USUARIO
  // =====================================================

  idUsuario: number | null = null;

  nombresUsuario = '';
  apellidosUsuario = '';

  nombreUsuario = '';
  nombreUsuarioEdicion = '';

  correoUsuario = '';
  telefonoUsuario = '';

  cargoUsuario = '';
  inicialesUsuario = '';

  // Foto de perfil
  fotoUsuario: string | null = null;

  private usuarioOriginal: Usuario | null = null;

  // =====================================================
  // ROLES
  // =====================================================

  roles: Rol[] = [];

  // =====================================================
  // ESTADOS
  // =====================================================

  cargandoUsuario = false;
  cargandoRoles = false;
  guardando = false;

  // =====================================================
  // CONTRASEÑA
  // =====================================================

  contrasenaActual = '';
  nuevaContrasena = '';
  confirmarContrasena = '';

  // =====================================================
  // INICIO
  // =====================================================

  ngOnInit(): void {
    this.cargarUsuario();
  }

  // =====================================================
  // CARGAR USUARIO
  // =====================================================

  cargarUsuario(): void {
    this.cargandoUsuario = true;

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      this.cargandoUsuario = false;

      alertaError('Error', 'No se encontró la información del usuario.');

      this.cdr.detectChanges();
      return;
    }

    try {
      const usuarioLocal: Usuario =
        JSON.parse(usuarioGuardado);

      if (!usuarioLocal.id_usuario) {
        this.cargandoUsuario = false;

        alertaError('Error', 'No se encontró el ID del usuario.');

        this.cdr.detectChanges();
        return;
      }

      this.idUsuario =
        usuarioLocal.id_usuario;

      console.log(
        'ID DEL USUARIO LOGUEADO:',
        this.idUsuario
      );

      this.http.get<Usuario>(
        `${this.apiUrl}/usuarios/${this.idUsuario}/`
      ).subscribe({

        next: (usuarioApi) => {

          console.log(
            'USUARIO OBTENIDO DESDE API:',
            usuarioApi
          );

          this.usuarioOriginal =
            { ...usuarioApi };

          this.asignarDatosUsuario(
            usuarioApi
          );

          this.actualizarLocalStorage(
            usuarioApi
          );

          this.cargarRoles();

          this.cargandoUsuario = false;

          this.cdr.detectChanges();
        },

        error: (error) => {

          console.error(
            'ERROR AL CARGAR USUARIO:',
            error
          );

          this.cargandoUsuario = false;

          let textoError =
            'No fue posible cargar la información del usuario.';

          if (error.status === 404) {
            textoError =
              'El usuario no existe en el servidor.';

          } else if (error.status === 0) {
            textoError =
              'No se pudo conectar con el servidor.';
          }

          alertaError('Error', textoError);

          this.cdr.detectChanges();
        }
      });

    } catch (error) {

      console.error(
        'ERROR AL LEER LOCALSTORAGE:',
        error
      );

      this.cargandoUsuario = false;

      alertaError('Error', 'No fue posible cargar los datos del usuario.');

      this.cdr.detectChanges();
    }
  }

  // =====================================================
  // ASIGNAR DATOS DEL USUARIO
  // =====================================================

  private asignarDatosUsuario(
    usuario: Usuario
  ): void {

    this.idUsuario =
      usuario.id_usuario;

    this.nombresUsuario =
      usuario.nombres ?? '';

    this.apellidosUsuario =
      usuario.apellidos ?? '';

    this.nombreUsuario =
      `${this.nombresUsuario} ${this.apellidosUsuario}`.trim();

    this.nombreUsuarioEdicion =
      this.nombreUsuario;

    this.correoUsuario =
      usuario.correo ?? '';

    this.telefonoUsuario =
      usuario.telefono ?? '';

    this.inicialesUsuario =
      this.obtenerIniciales(
        this.nombreUsuario
      );

    // Cargar foto del usuario
    this.fotoUsuario =
      this.normalizarUrlFoto(
        usuario.foto
      );

    this.cargoUsuario =
      'Cargando...';
  }

  // =====================================================
  // NORMALIZAR URL DE FOTO
  // =====================================================

  private normalizarUrlFoto(
    foto: string | null | undefined
  ): string | null {

    if (!foto) {
      return null;
    }

    if (foto.startsWith('http')) {
      return foto;
    }

    return `https://geriapp-backend.onrender.com${foto}`;
  }

  // =====================================================
  // ACTUALIZAR LOCALSTORAGE
  // =====================================================

  private actualizarLocalStorage(
    usuarioApi: Usuario
  ): void {

    const usuarioAnterior =
      localStorage.getItem('usuario');

    let datosUsuario: Usuario =
      usuarioApi;

    if (usuarioAnterior) {

      try {

        const anterior: Usuario =
          JSON.parse(usuarioAnterior);

        datosUsuario = {
          ...anterior,
          ...usuarioApi
        };

      } catch (error) {

        console.error(
          'ERROR AL LEER USUARIO ANTERIOR:',
          error
        );
      }
    }

    localStorage.setItem(
      'usuario',
      JSON.stringify(datosUsuario)
    );
  }

  // =====================================================
  // CARGAR ROLES
  // =====================================================

  cargarRoles(): void {

    this.cargandoRoles = true;

    this.http.get<Rol[]>(
      `${this.apiUrl}/roles/`
    ).subscribe({

      next: (roles) => {

        console.log(
          'ROLES OBTENIDOS:',
          roles
        );

        this.roles =
          roles.filter(
            rol => rol.estado === true
          );

        this.cargandoRoles = false;

        if (
          this.usuarioOriginal &&
          this.usuarioOriginal.id_rol !== null
        ) {

          const rolUsuario =
            this.roles.find(
              rol =>
                rol.id_rol ===
                this.usuarioOriginal!.id_rol
            );

          this.cargoUsuario =
            rolUsuario?.nombre ??
            'Rol no encontrado';

        } else {

          this.cargoUsuario =
            'Sin rol asignado';
        }

        console.log(
          'CARGO DEL USUARIO:',
          this.cargoUsuario
        );

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ERROR AL CARGAR ROLES:',
          error
        );

        this.cargandoRoles = false;

        this.cargoUsuario =
          'No disponible';

        alertaError('Error', 'No se pudieron cargar los roles.');

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================================
  // OBTENER INICIALES
  // =====================================================

  obtenerIniciales(
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

    if (palabras.length === 1) {

      return palabras[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      palabras[0].charAt(0) +
      palabras[1].charAt(0)
    ).toUpperCase();
  }

  // =====================================================
  // GUARDAR CAMBIOS DEL PERFIL
  // =====================================================

  guardarCambios(): void {

    if (this.guardando) {
      return;
    }

    if (this.idUsuario === null) {

      alertaError('Error', 'No se encontró el ID del usuario.');
      return;
    }

    // ===================================================
    // VALIDAR NOMBRE
    // ===================================================

    const nombreCompleto =
      this.nombreUsuarioEdicion.trim();

    if (!nombreCompleto) {

     alertaAdvertencia('Campo obligatorio', 'El nombre completo es obligatorio.');

      return;
    }

    // ===================================================
    // SEPARAR NOMBRES Y APELLIDOS
    // ===================================================

    const partesNombre =
      nombreCompleto
        .split(/\s+/)
        .filter(
          parte =>
            parte.length > 0
        );

    let nombres = '';
    let apellidos = '';

    if (partesNombre.length === 1) {

      nombres =
        partesNombre[0];

    } else if (partesNombre.length >= 3) {

      nombres =
        partesNombre
          .slice(0, -2)
          .join(' ');

      apellidos =
        partesNombre
          .slice(-2)
          .join(' ');

    } else {

      nombres =
        partesNombre[0];

      apellidos =
        partesNombre
          .slice(1)
          .join(' ');
    }

    // ===================================================
    // VALIDAR CORREO
    // ===================================================

    const correo =
      this.correoUsuario.trim();

    if (!correo) {

     alertaAdvertencia('Campo obligatorio', 'El correo electrónico es obligatorio.');

      return;
    }

    const correoValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(correo);

    if (!correoValido) {

      alertaAdvertencia('Correo inválido', 'Ingresa un correo electrónico válido.');

      return;
    }

    // ===================================================
    // VALIDAR TELÉFONO
    // ===================================================

    const telefono =
      this.telefonoUsuario.trim();

    if (!telefono) {

      alertaAdvertencia('Campo obligatorio', 'El teléfono es obligatorio.');

      return;
    }

    // ===================================================
    // DATOS A ACTUALIZAR
    // ===================================================

    const datos: Partial<Usuario> = {
      nombres,
      apellidos,
      correo,
      telefono
    };

    console.log(
      'ID DEL USUARIO:',
      this.idUsuario
    );

    console.log(
      'DATOS A ACTUALIZAR:',
      datos
    );

    this.guardando = true;

    this.cdr.detectChanges();

    // ===================================================
    // ACTUALIZAR USUARIO EN API
    // ===================================================

    this.http.patch<Usuario>(
      `${this.apiUrl}/usuarios/${this.idUsuario}/`,
      datos
    ).subscribe({

      next: (usuarioActualizado) => {

        console.log(
          'USUARIO ACTUALIZADO:',
          usuarioActualizado
        );

        this.nombresUsuario =
          usuarioActualizado.nombres ??
          nombres;

        this.apellidosUsuario =
          usuarioActualizado.apellidos ??
          apellidos;

        this.nombreUsuario =
          `${this.nombresUsuario} ${this.apellidosUsuario}`.trim();

        this.nombreUsuarioEdicion =
          this.nombreUsuario;

        this.correoUsuario =
          usuarioActualizado.correo ??
          correo;

        this.telefonoUsuario =
          usuarioActualizado.telefono ??
          telefono;

        this.inicialesUsuario =
          this.obtenerIniciales(
            this.nombreUsuario
          );

        // -----------------------------------------------
        // MANTENER FOTO
        // -----------------------------------------------

        if (usuarioActualizado.foto !== undefined) {

          this.fotoUsuario =
            this.normalizarUrlFoto(
              usuarioActualizado.foto
            );
        }

        // -----------------------------------------------
        // ACTUALIZAR USUARIO ORIGINAL
        // -----------------------------------------------

        if (this.usuarioOriginal) {

          this.usuarioOriginal = {
            ...this.usuarioOriginal,
            ...usuarioActualizado
          };

        } else {

          this.usuarioOriginal = {
            ...usuarioActualizado
          };
        }

        // -----------------------------------------------
        // ACTUALIZAR LOCALSTORAGE
        // -----------------------------------------------

        this.actualizarLocalStorage(
          usuarioActualizado
        );

        const datosUsuario =
          JSON.parse(
            localStorage.getItem('usuario') ??
            '{}'
          );

        // -----------------------------------------------
        // AVISAR AL LAYOUT
        // -----------------------------------------------

        window.dispatchEvent(
          new CustomEvent(
            'usuarioActualizado',
            {
              detail: datosUsuario
            }
          )
        );

        // -----------------------------------------------
        // FINALIZAR
        // -----------------------------------------------

        this.guardando = false;

       // next (dentro del patch)
        alertaExito('Cambios guardados', 'Tu perfil se actualizó correctamente.');

        console.log(
          'DATOS ACTUALIZADOS EN PANTALLA:',
          {
            nombre: this.nombreUsuario,
            correo: this.correoUsuario,
            telefono: this.telefonoUsuario
          }
        );

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ERROR AL ACTUALIZAR PERFIL:',
          error
        );

        console.error(
          'RESPUESTA DEL SERVIDOR:',
          error.error
        );

        this.guardando = false;

        let textoError =
          'No fue posible guardar los cambios.';

        if (error.error?.detail) {

          textoError =
            error.error.detail;

        } else if (error.error?.error) {

          textoError =
            error.error.error;

        } else if (
          error.error &&
          typeof error.error === 'object'
        ) {

          const errores =
            Object.values(error.error)
              .flat()
              .join(' ');

          textoError =
            errores ||
            'El servidor rechazó la actualización.';

        } else if (error.status === 0) {

          textoError =
            'No se pudo conectar con el servidor.';
        }

        alertaError('Error', textoError);

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================================
  // CAMBIAR FOTO
  // =====================================================

  cambiarFoto(
    selectorFoto: HTMLInputElement
  ): void {

    selectorFoto.click();
  }

  // =====================================================
  // SELECCIONAR Y GUARDAR FOTO
  // =====================================================

  seleccionarFoto(
    evento: Event
  ): void {

    if (this.idUsuario === null) {

     alertaError('Error', 'No se encontró el ID del usuario.');
      return;
    }

    const input =
      evento.target as HTMLInputElement;

    if (
      !input.files ||
      input.files.length === 0
    ) {
      return;
    }

    const archivo =
      input.files[0];

    console.log(
      'ID USUARIO PARA FOTO:',
      this.idUsuario
    );

    console.log(
      'ARCHIVO SELECCIONADO:',
      archivo
    );

    // ===================================================
    // VALIDAR FORMATO
    // ===================================================

    const tiposPermitidos = [
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (
      !tiposPermitidos.includes(
        archivo.type
      )
    ) {

      alertaAdvertencia('Formato no válido', 'Selecciona una imagen JPG, PNG o WEBP.');
      input.value = '';

      return;
    }

    // ===================================================
    // VALIDAR TAMAÑO
    // ===================================================

    const tamanioMaximo =
      5 * 1024 * 1024;

    if (
      archivo.size >
      tamanioMaximo
    ) {

      alertaAdvertencia('Imagen demasiado grande', 'La imagen no puede superar los 5 MB.');

      input.value = '';

      return;
    }

    // ===================================================
    // CREAR FORMULARIO MULTIPART
    // ===================================================

    const formulario =
      new FormData();

    formulario.append(
      'foto',
      archivo
    );

    console.log(
      'ENVIANDO FOTO AL BACKEND...'
    );

    // ===================================================
    // ENVIAR FOTO AL BACKEND
    // ===================================================

    this.http.patch<Usuario>(
      `${this.apiUrl}/usuarios/${this.idUsuario}/`,
      formulario
    ).subscribe({

      next: (usuarioActualizado) => {

        console.log(
          'USUARIO ACTUALIZADO CON FOTO:',
          usuarioActualizado
        );

        // -----------------------------------------------
        // ACTUALIZAR FOTO EN PANTALLA
        // -----------------------------------------------

        this.fotoUsuario =
          this.normalizarUrlFoto(
            usuarioActualizado.foto
          );

        // -----------------------------------------------
        // ACTUALIZAR USUARIO ORIGINAL
        // -----------------------------------------------

        if (this.usuarioOriginal) {

          this.usuarioOriginal = {
            ...this.usuarioOriginal,
            ...usuarioActualizado
          };

        } else {

          this.usuarioOriginal = {
            ...usuarioActualizado
          };
        }

        // -----------------------------------------------
        // ACTUALIZAR LOCALSTORAGE
        // -----------------------------------------------

        this.actualizarLocalStorage(
          usuarioActualizado
        );

        const datosUsuario =
          JSON.parse(
            localStorage.getItem('usuario') ??
            '{}'
          );

        // -----------------------------------------------
        // AVISAR AL LAYOUT
        // -----------------------------------------------

        window.dispatchEvent(
          new CustomEvent(
            'usuarioActualizado',
            {
              detail: datosUsuario
            }
          )
        );

        // -----------------------------------------------
        // LIMPIAR SELECTOR
        // -----------------------------------------------

        input.value = '';

        this.cdr.detectChanges();

        // -----------------------------------------------
        // MENSAJE
        // -----------------------------------------------

        // next
        alertaExito('Foto actualizada', 'Tu foto de perfil se actualizó correctamente.');
      },

      error: (error) => {

        console.error(
          'ERROR AL ACTUALIZAR FOTO:',
          error
        );

        console.error(
          'RESPUESTA DEL SERVIDOR:',
          error.error
        );

        input.value = '';

        let textoError =
          'No fue posible actualizar la foto de perfil.';

        if (error.error?.detail) {

          textoError =
            error.error.detail;

        } else if (error.error?.error) {

          textoError =
            error.error.error;

        } else if (
          error.error &&
          typeof error.error === 'object'
        ) {

          const errores =
            Object.values(error.error)
              .flat()
              .join(' ');

          textoError =
            errores ||
            'El servidor rechazó la imagen.';

        } else if (error.status === 0) {

          textoError =
            'No se pudo conectar con el servidor.';
        }

        alertaError('Error', textoError);

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================================
  // CAMBIAR CONTRASEÑA
  // =====================================================

  actualizarContrasena(): void {

    // ===================================================
    // VALIDAR ID
    // ===================================================

    if (this.idUsuario === null) {
      alertaError('Error', 'No se encontró el ID del usuario.');
      return;
    }

    // ===================================================
    // EVITAR SOLICITUDES DUPLICADAS
    // ===================================================

    if (this.guardando) {
      return;
    }

    // ===================================================
    // VALIDAR CONTRASEÑA ACTUAL
    // ===================================================

    if (!this.contrasenaActual.trim()) {
      alertaAdvertencia('Campo obligatorio', 'Ingresa tu contraseña actual.');
      return;
    }

    // ===================================================
    // VALIDAR NUEVA CONTRASEÑA
    // ===================================================

    if (!this.nuevaContrasena.trim()) {
      alertaAdvertencia('Campo obligatorio', 'Ingresa la nueva contraseña.');
      return;
    }

    // ===================================================
    // VALIDAR CONFIRMACIÓN
    // ===================================================

    if (!this.confirmarContrasena.trim()) {
     alertaAdvertencia('Campo obligatorio', 'Confirma la nueva contraseña.');
    }

    // ===================================================
    // VALIDAR LONGITUD MÍNIMA
    // ===================================================

    if (this.nuevaContrasena.length < 8) {
      alertaAdvertencia('Contraseña muy corta', 'La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    // ===================================================
    // VALIDAR LONGITUD MÁXIMA
    // ===================================================

    if (this.nuevaContrasena.length > 10) {
      alertaAdvertencia('Contraseña muy larga', 'La nueva contraseña debe tener máximo 10 caracteres.');
      return;
    }

    // ===================================================
    // VALIDAR CONFIRMACIÓN MÁXIMA
    // ===================================================

    if (this.confirmarContrasena.length > 10) {
      alertaAdvertencia('Confirmación muy larga', 'La confirmación de la contraseña no puede superar los 10 caracteres.');
      return;
    }

    // ===================================================
    // VALIDAR COINCIDENCIA
    // ===================================================

    if (
      this.nuevaContrasena !==
      this.confirmarContrasena
    ) {
      alertaAdvertencia('Las contraseñas no coinciden', 'Las contraseñas nuevas no coinciden.');
      return;
    }

    // ===================================================
    // DATOS PARA EL BACKEND
    // ===================================================

    const datos = {
      id_usuario: this.idUsuario,
      contrasena_actual: this.contrasenaActual,
      nueva_contrasena: this.nuevaContrasena,
      confirmar_contrasena: this.confirmarContrasena
    };

    console.log(
      'CAMBIO DE CONTRASEÑA - ID USUARIO:',
      this.idUsuario
    );

    this.guardando = true;
    this.cdr.detectChanges();

    // ===================================================
    // ENVIAR CAMBIO DE CONTRASEÑA
    // ===================================================

    this.http.post<any>(
      `${this.apiUrl}/usuarios/cambiar-contrasena/`,
      datos
    ).subscribe({

      next: (respuesta) => {

        console.log(
          'CONTRASEÑA ACTUALIZADA:',
          respuesta
        );

        this.guardando = false;

        alertaExito('Contraseña actualizada', respuesta?.mensaje ?? 'Contraseña actualizada correctamente.');
        // -----------------------------------------------
        // LIMPIAR CAMPOS
        // -----------------------------------------------

        this.contrasenaActual = '';
        this.nuevaContrasena = '';
        this.confirmarContrasena = '';

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(
          'ERROR AL CAMBIAR CONTRASEÑA:',
          error
        );

        console.error(
          'RESPUESTA DEL SERVIDOR:',
          error.error
        );

        this.guardando = false;

        let textoError =
          'No fue posible actualizar la contraseña.';

        if (error.error?.detail) {

          textoError =
            error.error.detail;

        } else if (error.error?.error) {

          textoError =
            error.error.error;

        } else if (
          error.error &&
          typeof error.error === 'object'
        ) {

          const errores =
            Object.values(error.error)
              .flat()
              .join(' ');

          textoError =
            errores ||
            'El servidor rechazó el cambio de contraseña.';

        } else if (error.status === 0) {

          textoError =
            'No se pudo conectar con el servidor.';
        }

        alertaError('Error', textoError);

        this.cdr.detectChanges();
      }
    });
  }
}


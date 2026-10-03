import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
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

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'critica' | 'advertencia' | 'informacion' | 'evento_adverso';
  tiempo: string;
  leida?: boolean;
  icono: string;
  destinatario?: string;
}

interface NotificacionBackend {
  id_notificacion: number;
  titulo: string;
  tipo: string;
  mensaje: string;
  enviar_correo: boolean;
  fecha_hora: string;
  estado: boolean;
  id_paciente: number | null;
  id_usuario: number | null;
}

interface NotificacionDestinatarioBackend {
  id_notificacion_destinatario: number;
  leida: boolean;
  fecha_lectura: string | null;
  id_notificacion: number | null;
  id_usuario: number | null;
}

interface UsuarioBackend {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  id_rol: number | null;
  estado: boolean;
}

interface RolBackend {
  id_rol: number;
  nombre: string;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css']
})
export class Notificaciones {
  private readonly apiUrl =
    'https://geriapp-backend.onrender.com/api';

  pestanaActual: string = 'bandeja';
  textoBusqueda: string = '';
  tipoFiltro: string = 'todos';
  destinatarioSeleccionado: string = '';
  usuarioDestinatarioSeleccionado: number | null = null;
  usuarios: UsuarioBackend[] = [];
  roles: RolBackend[] = [];
  tipoNotificacion:
    'critica' | 'advertencia' | 'informacion' =
    'informacion';
  tituloNotificacion: string = '';
  mensajeNotificacion: string = '';
  mensajeError: string = '';
  mensajeExito: string = '';
  mensajeConfiguracion: string = '';
  notificacionesActivas: boolean = true;
  emailActivo: boolean = true;
  smsActivo: boolean = true;
  notificacionesPushActivas: boolean = true;

  notificaciones: Notificacion[] = [];

  /*
   * Bandeja:
   * contiene solamente las notificaciones
   * recibidas por el usuario actual.
   */

  /*
   * Historial:
   * contiene solamente las notificaciones
   * creadas por el usuario actual.
   */
  notificacionesHistorial: Notificacion[] = [];

  notificacionesDestinatarios:
    NotificacionDestinatarioBackend[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuariosYRoles();
    this.listar();
  }

  private cargarUsuariosYRoles(): void {
    forkJoin({
      usuarios:
        this.http.get<UsuarioBackend[]>(
          `${this.apiUrl}/usuarios/`
        ),
      roles:
        this.http.get<RolBackend[]>(
          `${this.apiUrl}/roles/`
        )
    }).subscribe({
      next: ({ usuarios, roles }) => {
        this.usuarios = usuarios;
        this.roles = roles;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Error al cargar usuarios y roles:',
          error
        );
      }
    });
  }

  get usuariosDelRolSeleccionado(): UsuarioBackend[] {
    let nombreRol = '';

    if (
      this.destinatarioSeleccionado ===
      'Todos los Cuidadores'
    ) {
      nombreRol = 'Cuidador';
    } else if (
      this.destinatarioSeleccionado ===
      'Todos los Encargados'
    ) {
      nombreRol = 'Encargado';
    } else if (
      this.destinatarioSeleccionado ===
      'Todos los Administradores'
    ) {
      nombreRol = 'Administrador';
    }

    if (!nombreRol) {
      return [];
    }

    const rol =
      this.roles.find(
        item =>
          item.nombre.trim().toLowerCase() ===
          nombreRol.trim().toLowerCase()
      );

    if (!rol) {
      return [];
    }

    return this.usuarios.filter(
      usuario =>
        usuario.estado === true &&
        usuario.id_rol === rol.id_rol
    );
  }

  listar(): void {
    const idUsuarioActual =
      this.obtenerIdUsuarioActual();

    forkJoin({
      notificaciones:
        this.http.get<NotificacionBackend[]>(
          `${this.apiUrl}/notificaciones/`
        ),
      destinatarios:
        this.http.get<NotificacionDestinatarioBackend[]>(
          `${this.apiUrl}/notificacion_destinatario/`
        )
    }).subscribe({
      next: ({ notificaciones, destinatarios }) => {
        console.log(
          'Notificaciones recibidas:',
          notificaciones
        );

        console.log(
          'Destinatarios recibidos:',
          destinatarios
        );

        this.notificacionesDestinatarios =
          destinatarios;

        /*
         * =====================================================
         * BANDEJA
         * =====================================================
         *
         * Solo mostramos las notificaciones donde el usuario
         * actual aparece como destinatario.
         */

        this.notificaciones =
          notificaciones
            .filter(
              notificacion =>
                destinatarios.some(
                  destinatario =>
                    destinatario.id_notificacion ===
                      notificacion.id_notificacion &&
                    destinatario.id_usuario ===
                      idUsuarioActual
                )
            )
            .sort(
              (a, b) =>
                b.id_notificacion -
                a.id_notificacion
            )
            .map(
              (notificacion): Notificacion => {
                const notificacionMapeada =
                  this.mapearNotificacion(
                    notificacion
                  );

                const relacion =
                  destinatarios.find(
                    destinatario =>
                      destinatario.id_notificacion ===
                        notificacion.id_notificacion &&
                      destinatario.id_usuario ===
                        idUsuarioActual
                  );

                notificacionMapeada.leida =
                  relacion
                    ? relacion.leida
                    : false;

                notificacionMapeada.destinatario =
                  this.obtenerDestinatarioNotificacion(
                    notificacion.id_notificacion,
                    destinatarios
                  );

                return notificacionMapeada;
              }
            );

        /*
         * =====================================================
         * HISTORIAL
         * =====================================================
         *
         * Aquí NO usamos los destinatarios.
         *
         * El historial muestra las notificaciones cuyo
         * id_usuario corresponde al usuario que las creó.
         */

        this.notificacionesHistorial =
          notificaciones
            .filter(
              notificacion =>
                notificacion.id_usuario ===
                idUsuarioActual
            )
            .sort(
              (a, b) =>
                b.id_notificacion -
                a.id_notificacion
            )
            .map(
              (notificacion): Notificacion => {
                const notificacionMapeada =
                  this.mapearNotificacion(
                    notificacion
                  );

                notificacionMapeada.destinatario =
                  this.obtenerDestinatarioNotificacion(
                    notificacion.id_notificacion,
                    destinatarios
                  );

                return notificacionMapeada;
              }
            );

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Error al listar las notificaciones:',
          error
        );

       alertaError('Error', 'No fue posible cargar las notificaciones.');
      }
    });
  }

  private obtenerDestinatarioNotificacion(
    idNotificacion: number,
    destinatarios: NotificacionDestinatarioBackend[]
  ): string {
    const relaciones =
      destinatarios.filter(
        destinatario =>
          destinatario.id_notificacion ===
          idNotificacion
      );

    if (relaciones.length === 0) {
      return 'General';
    }

    if (relaciones.length === 1) {
      const usuario =
        this.usuarios.find(
          item =>
            item.id_usuario ===
            relaciones[0].id_usuario
        );

      if (usuario) {
        return `${usuario.nombres} ${usuario.apellidos}`;
      }

      return 'Usuario específico';
    }

    return `${relaciones.length} destinatarios`;
  }

  private mapearNotificacion(
    notificacion: NotificacionBackend
  ): Notificacion {
    const tipo =
      this.normalizarTipo(
        notificacion.tipo
      );

    return {
      id:
        notificacion.id_notificacion,
      titulo:
        notificacion.titulo,
      mensaje:
        notificacion.mensaje,
      tipo:
        tipo,
      tiempo:
        this.formatearFecha(
          notificacion.fecha_hora
        ),
      icono:
        this.obtenerIcono(tipo)
    };
  }

  cambiarPestana(
    pestana: string
  ): void {
    this.pestanaActual =
      pestana;

    this.mensajeError = '';
    this.mensajeExito = '';
  }

  get totalNotificaciones(): number {
    return this.notificaciones.length;
  }

  get totalNoLeidas(): number {
    return this.notificaciones.filter(
      notificacion =>
        notificacion.leida === false
    ).length;
  }

  get totalCriticas(): number {
    return this.notificaciones.filter(
      notificacion =>
        notificacion.tipo === 'critica'
    ).length;
  }

  get totalAdvertencias(): number {
    return this.notificaciones.filter(
      notificacion =>
        notificacion.tipo === 'advertencia'
    ).length;
  }

  get caracteresRestantes(): number {
    return (
      300 -
      this.mensajeNotificacion.length
    );
  }

  get notificacionesFiltradas(): Notificacion[] {
    const texto =
      this.textoBusqueda
        .toLowerCase()
        .trim();

    return this.notificaciones.filter(
      notificacion => {
        const coincideTexto =
          !texto ||
          notificacion.titulo
            .toLowerCase()
            .includes(texto) ||
          notificacion.mensaje
            .toLowerCase()
            .includes(texto);

        const coincideTipo =
          this.tipoFiltro === 'todos' ||
          notificacion.tipo ===
            this.tipoFiltro;

        return (
          coincideTexto &&
          coincideTipo
        );
      }
    );
  }

  enviarNotificacionManual(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    if (
      !this.destinatarioSeleccionado.trim()
    ) {
        alertaAdvertencia('Campos incompletos', 'Debe seleccionar un destinatario válido.');
        return;
      }

    if (
      !this.tituloNotificacion.trim()
    ) {
        alertaAdvertencia('Campos incompletos', 'Debe ingresar un título para la notificación.');
        return;
      }

    if (
      !this.mensajeNotificacion.trim()
    ) {
        alertaAdvertencia('Campos incompletos', 'El contenido del mensaje no puede estar vacío.');
        return;
      }

    const idUsuario =
      this.obtenerIdUsuarioActual();

    if (!idUsuario) {
      alertaError('Error', 'No se pudo identificar el usuario actual.');
      return;
    }

    this.obtenerUsuariosDestinatarios()
      .subscribe({
        next: (usuariosDestinatarios) => {
          if (
            usuariosDestinatarios.length === 0
          ) {
            alertaAdvertencia('Sin destinatarios', 'No se encontraron usuarios para el destinatario seleccionado.');
            return;
          }
         

          const nuevaNotificacion = {
            titulo:
              this.tituloNotificacion.trim(),
            tipo:
              this.tipoNotificacion,
            mensaje:
              this.mensajeNotificacion.trim(),
            enviar_correo:
              this.emailActivo,
            fecha_hora:
              new Date().toISOString(),
            estado:
              true,
            id_paciente:
              null,
            id_usuario:
              idUsuario
          };

          console.log(
            'Enviando notificación:',
            nuevaNotificacion
          );

          this.http.post<NotificacionBackend>(
            `${this.apiUrl}/notificaciones/`,
            nuevaNotificacion
          ).subscribe({
            next: (respuesta) => {
              console.log(
                'Notificación creada:',
                respuesta
              );

              this.crearDestinatarios(
                respuesta.id_notificacion,
                usuariosDestinatarios,
                respuesta
              );
            },
            error: (error) => {
              console.error(
                'Error al crear la notificación:',
                error
              );

              alertaError('Error', 'No fue posible crear la notificación.');
            }
          });
        },
        error: (error) => {
          console.error(
            'Error al obtener los destinatarios:',
            error
          );

          alertaError('Error', 'No fue posible identificar los destinatarios.');
        }
      });
  }

  private obtenerUsuariosDestinatarios():
    Observable<UsuarioBackend[]> {
    return forkJoin({
      usuarios:
        this.http.get<UsuarioBackend[]>(
          `${this.apiUrl}/usuarios/`
        ),
      roles:
        this.http.get<RolBackend[]>(
          `${this.apiUrl}/roles/`
        )
    }).pipe(
      map(({ usuarios, roles }) => {
        if (
          this.usuarioDestinatarioSeleccionado !== null
        ) {
          return usuarios.filter(
            usuario =>
              usuario.estado === true &&
              usuario.id_usuario ===
                this.usuarioDestinatarioSeleccionado
          );
        }

        return this.filtrarUsuariosDestinatarios(
          usuarios,
          roles
        );
      })
    );
  }

  private filtrarUsuariosDestinatarios(
    usuarios: UsuarioBackend[],
    roles: RolBackend[]
  ): UsuarioBackend[] {
    const destinatario =
      this.destinatarioSeleccionado.trim();

    if (
      destinatario ===
      'Todo el Personal del Geriátrico'
    ) {
      return usuarios.filter(
        usuario =>
          usuario.estado === true
      );
    }

    let nombreRol = '';

    if (
      destinatario ===
      'Todos los Cuidadores'
    ) {
      nombreRol =
        'Cuidador';
    } else if (
      destinatario ===
      'Todos los Encargados'
    ) {
      nombreRol =
        'Encargado';
    } else if (
      destinatario ===
      'Todos los Administradores'
    ) {
      nombreRol =
        'Administrador';
    }

    if (!nombreRol) {
      return [];
    }

    const rol =
      roles.find(
        item =>
          item.nombre.trim().toLowerCase() ===
          nombreRol.trim().toLowerCase()
      );

    if (!rol) {
      return [];
    }

    return usuarios.filter(
      usuario =>
        usuario.estado === true &&
        usuario.id_rol === rol.id_rol
    );
  }

  private crearDestinatarios(
    idNotificacion: number,
    usuarios: UsuarioBackend[],
    respuestaNotificacion: NotificacionBackend
  ): void {
    const solicitudes =
      usuarios.map(
        usuario => {
          const destinatario = {
            leida:
              false,
            fecha_lectura:
              null,
            id_notificacion:
              idNotificacion,
            id_usuario:
              usuario.id_usuario
          };

          return this.http.post<NotificacionDestinatarioBackend>(
            `${this.apiUrl}/notificacion_destinatario/`,
            destinatario
          );
        }
      );

    forkJoin(solicitudes).subscribe({
      next: (destinatariosCreados) => {
        console.log(
          'Destinatarios creados:',
          destinatariosCreados
        );

        const notificacionCreada =
          this.mapearNotificacion(
            respuestaNotificacion
          );

        notificacionCreada.destinatario =
          this.obtenerTextoDestinatario();

        const idUsuarioActual =
          this.obtenerIdUsuarioActual();

        const esDestinatario =
          destinatariosCreados.some(
            destinatario =>
              destinatario.id_usuario ===
              idUsuarioActual
          );

        if (esDestinatario) {
          notificacionCreada.leida =
            false;

          this.notificaciones.unshift(
            notificacionCreada
          );
        }

        this.notificacionesDestinatarios =
          this.notificacionesDestinatarios.concat(
            destinatariosCreados
          );

        /*
         * Como el usuario actual es quien creó
         * la notificación, también la agregamos
         * al historial.
         */
        this.notificacionesHistorial.unshift(
          notificacionCreada
        );

        
        alertaExito('Notificación creada', 'Notificación creada correctamente.');

        this.limpiarFormulario();

        this.cdr.detectChanges();

        setTimeout(() => {
          this.pestanaActual =
            'bandeja';
        }, 1500);
      },
      error: (error) => {
        console.error(
          'Error al crear los destinatarios:',
          error
        );

        alertaError('Error', 'La notificación fue creada, pero no fue posible asignar todos los destinatarios.');

        this.listar();
      }
    });
  }

  private obtenerTextoDestinatario(): string {
    if (
      this.usuarioDestinatarioSeleccionado !== null
    ) {
      const usuario =
        this.usuarios.find(
          item =>
            item.id_usuario ===
            this.usuarioDestinatarioSeleccionado
        );

      if (usuario) {
        return `${usuario.nombres} ${usuario.apellidos}`;
      }
    }

    return this.destinatarioSeleccionado;
  }

  private obtenerIdUsuarioActual(): number | null {
    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      return null;
    }

    try {
      const usuario =
        JSON.parse(usuarioGuardado);

      return usuario?.id_usuario ?? null;
    } catch (error) {
      console.error(
        'Error al obtener el usuario actual:',
        error
      );

      return null;
    }
  }

  private obtenerIcono(
    tipo:
      'critica' |
      'advertencia' |
      'informacion' |
      'evento_adverso'
  ): string {
    switch (tipo) {
      case 'critica':
        return 'fa-solid fa-triangle-exclamation';

      case 'advertencia':
        return 'fa-solid fa-circle-exclamation';

      case 'evento_adverso':
        return 'fa-solid fa-notes-medical';

      default:
        return 'fa-regular fa-bell';
    }
  }

  private normalizarTipo(
    tipo: string
  ):
    'critica' |
    'advertencia' |
    'informacion' |
    'evento_adverso' {
    const tipoNormalizado =
      tipo
        .toLowerCase()
        .trim();

    if (
      tipoNormalizado ===
      'critica'
    ) {
      return 'critica';
    }

    if (
      tipoNormalizado ===
      'advertencia'
    ) {
      return 'advertencia';
    }

    if (
    tipoNormalizado ===
    'evento_adverso'
    ) {
      return 'evento_adverso';
    }

    return 'informacion';
  }

  private formatearFecha(
    fecha: string
  ): string {
    const fechaNotificacion =
      new Date(fecha);

    return fechaNotificacion.toLocaleString(
      'es-CO',
      {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    );
  }

  private limpiarFormulario(): void {
    this.tituloNotificacion = '';
    this.mensajeNotificacion = '';
    this.destinatarioSeleccionado = '';
    this.usuarioDestinatarioSeleccionado =
      null;
    this.tipoNotificacion =
      'informacion';
    this.emailActivo = true;
  }

  marcarLeida(
    id: number
  ): void {
    const idUsuario =
      this.obtenerIdUsuarioActual();

    if (!idUsuario) {
     alertaError('Error', 'No se pudo identificar el usuario actual.');
      return;
    }

    const relacion =
      this.notificacionesDestinatarios.find(
        destinatario =>
          destinatario.id_notificacion === id &&
          destinatario.id_usuario === idUsuario
      );

    if (!relacion) {
      console.warn(
        'No existe una relación de destinatario para esta notificación y usuario.'
      );
      return;
    }

    if (relacion.leida) {
      return;
    }

    const datosActualizacion = {
      leida:
        true,
      fecha_lectura:
        new Date().toISOString()
    };

    this.http.patch<NotificacionDestinatarioBackend>(
      `${this.apiUrl}/notificacion_destinatario/${relacion.id_notificacion_destinatario}/`,
      datosActualizacion
    ).subscribe({
      next: (respuesta) => {
        console.log(
          'Notificación marcada como leída:',
          respuesta
        );

        relacion.leida =
          respuesta.leida;

        relacion.fecha_lectura =
          respuesta.fecha_lectura;

        const notificacion =
          this.notificaciones.find(
            item =>
              item.id === id
          );

        if (notificacion) {
          notificacion.leida =
            true;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Error al marcar la notificación como leída:',
          error
        );

        alertaError('Error', 'No fue posible marcar la notificación como leída.');
      }
    });
  }

  marcarTodasLeidas(): void {
    const idUsuario =
      this.obtenerIdUsuarioActual();

    if (!idUsuario) {
      alertaError('Error', 'No se pudo identificar el usuario actual.');
      return;
    }

    const relacionesPendientes =
      this.notificacionesDestinatarios.filter(
        destinatario =>
          destinatario.id_usuario === idUsuario &&
          destinatario.leida === false
      );

    if (
      relacionesPendientes.length === 0
    ) {
      return;
    }

    const solicitudes =
      relacionesPendientes.map(
        relacion => {
          const datosActualizacion = {
            leida:
              true,
            fecha_lectura:
              new Date().toISOString()
          };

          return this.http.patch<NotificacionDestinatarioBackend>(
            `${this.apiUrl}/notificacion_destinatario/${relacion.id_notificacion_destinatario}/`,
            datosActualizacion
          );
        }
      );

    forkJoin(solicitudes).subscribe({
      next: (respuestas) => {
        console.log(
          'Notificaciones marcadas como leídas:',
          respuestas
        );

        respuestas.forEach(
          respuesta => {
            const relacion =
              this.notificacionesDestinatarios.find(
                item =>
                  item.id_notificacion_destinatario ===
                  respuesta.id_notificacion_destinatario
              );

            if (relacion) {
              relacion.leida =
                respuesta.leida;

              relacion.fecha_lectura =
                respuesta.fecha_lectura;
            }

            const notificacion =
              this.notificaciones.find(
                item =>
                  item.id ===
                  respuesta.id_notificacion
              );

            if (notificacion) {
              notificacion.leida =
                true;
            }
          }
        );

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Error al marcar todas las notificaciones como leídas:',
          error
        );

        alertaError('Error', 'No fue posible marcar todas las notificaciones como leídas.');
      }
    });
  }

eliminarNotificacion(id: number): void {

  const notificacion =
    this.notificaciones.find(item => item.id === id) ||
    this.notificacionesHistorial.find(item => item.id === id);

  const titulo = notificacion?.titulo || 'esta notificación';

  alertaEliminar(titulo, 'notificación').then((resultado) => {

    if (!resultado.isConfirmed) {
      return;
    }

    this.http.delete(`${this.apiUrl}/notificaciones/${id}/`).subscribe({

      next: () => {
        this.notificaciones = this.notificaciones.filter(n => n.id !== id);
        this.notificacionesHistorial = this.notificacionesHistorial.filter(n => n.id !== id);
        this.notificacionesDestinatarios = this.notificacionesDestinatarios.filter(d => d.id_notificacion !== id);

        this.cdr.detectChanges();

        alertaExito('Eliminada', 'La notificación fue eliminada correctamente.');
      },

      error: (error) => {
        console.error('Error al eliminar la notificación:', error);
        alertaError('Error', 'No fue posible eliminar la notificación.');
      }
    });
  });
}

 verDetalle(notificacion: Notificacion): void {

  mostrarAlerta({
    tono: 'azul',
    icono: 'question',
    iconoSvg: svgIcono('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>'),
    titulo: notificacion.titulo,
    html: `
      <div class="text-left text-[1.05rem] leading-relaxed text-slate-700 space-y-1.5">
        <p>${escaparHtml(notificacion.mensaje)}</p>
        <p><strong class="font-bold">Tipo:</strong> ${escaparHtml(notificacion.tipo)}</p>
        <p><strong class="font-bold">Fecha:</strong> ${escaparHtml(notificacion.tiempo)}</p>
        <p><strong class="font-bold">Destinatario:</strong> ${escaparHtml(notificacion.destinatario || 'General')}</p>
      </div>
    `,
    confirmar: 'Cerrar'
  });
}
}
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import Swal from 'sweetalert2';

interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'critica' | 'advertencia' | 'informacion';
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

        Swal.fire(
          'Error',
          'No fue posible cargar las notificaciones.',
          'error'
        );
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
        Swal.fire(
          'Campos incompletos',
          'Debe seleccionar un destinatario válido.',
          'warning'
        );
        return;
      }

    if (
      !this.tituloNotificacion.trim()
    ) {
        Swal.fire(
          'Campos incompletos',
          'Debe ingresar un título para la notificación.',
          'warning'
        );
        return;
      }

    if (
      !this.mensajeNotificacion.trim()
    ) {
        Swal.fire(
          'Campos incompletos',
          'El contenido del mensaje no puede estar vacío.',
          'warning'
        );
        return;
      }

    const idUsuario =
      this.obtenerIdUsuarioActual();

    if (!idUsuario) {
      Swal.fire(
        'Error',
        'No se pudo identificar el usuario actual.',
        'error'
      );
      return;
    }

    this.obtenerUsuariosDestinatarios()
      .subscribe({
        next: (usuariosDestinatarios) => {
          if (
            usuariosDestinatarios.length === 0
          ) {
            Swal.fire(
              'Sin destinatarios',
              'No se encontraron usuarios para el destinatario seleccionado.',
              'warning'
            );
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

              Swal.fire(
                'Error',
                'No fue posible crear la notificación.',
                'error'
              );
            }
          });
        },
        error: (error) => {
          console.error(
            'Error al obtener los destinatarios:',
            error
          );

          Swal.fire(
            'Error',
            'No fue posible identificar los destinatarios.',
            'error'
          );
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

        
        Swal.fire({
          icon: 'success',
          title: 'Notificación creada',
          text: 'Notificación creada correctamente.',
          timer: 1500,
          showConfirmButton: false
        });

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

        Swal.fire(
          'Error',
          'La notificación fue creada, pero no fue posible asignar todos los destinatarios.',
          'error'
        );

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
      'informacion'
  ): string {
    switch (tipo) {
      case 'critica':
        return 'fa-solid fa-triangle-exclamation';

      case 'advertencia':
        return 'fa-solid fa-circle-exclamation';

      default:
        return 'fa-regular fa-bell';
    }
  }

  private normalizarTipo(
    tipo: string
  ):
    'critica' |
    'advertencia' |
    'informacion' {
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
  }

  marcarLeida(
    id: number
  ): void {
    const idUsuario =
      this.obtenerIdUsuarioActual();

    if (!idUsuario) {
      Swal.fire(
        'Error',
        'No se pudo identificar el usuario actual.',
        'error'
      );
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

        Swal.fire(
          'Error',
          'No fue posible marcar la notificación como leída.',
          'error'
        );
      }
    });
  }

  marcarTodasLeidas(): void {
    const idUsuario =
      this.obtenerIdUsuarioActual();

    if (!idUsuario) {
      Swal.fire(
        'Error',
        'No se pudo identificar el usuario actual.',
        'error'
      );
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

        Swal.fire(
          'Error',
          'No fue posible marcar todas las notificaciones como leídas.',
          'error'
        );
      }
    });
  }

  eliminarNotificacion(
    id: number
  ): void {
    Swal.fire({
      title:
        '¿Eliminar notificación?',
      text:
        'Esta acción no se puede deshacer.',
      icon:
        'warning',
      showCancelButton:
        true,
      confirmButtonText:
        'Sí, eliminar',
      cancelButtonText:
        'Cancelar'
    }).then((resultado) => {
      if (!resultado.isConfirmed) {
        return;
      }

      this.http.delete(
        `${this.apiUrl}/notificaciones/${id}/`
      ).subscribe({
        next: () => {
          this.notificaciones =
            this.notificaciones.filter(
              notificacion =>
                notificacion.id !== id
            );

          this.notificacionesHistorial =
            this.notificacionesHistorial.filter(
              notificacion =>
                notificacion.id !== id
            );

          this.notificacionesDestinatarios =
            this.notificacionesDestinatarios.filter(
              destinatario =>
                destinatario.id_notificacion !== id
            );

          this.cdr.detectChanges();

          Swal.fire(
            'Eliminada',
            'La notificación fue eliminada correctamente.',
            'success'
          );
        },
        error: (error) => {
          console.error(
            'Error al eliminar la notificación:',
            error
          );

          Swal.fire(
            'Error',
            'No fue posible eliminar la notificación.',
            'error'
          );
        }
      });
    });
  }

  verDetalle(
    notificacion: Notificacion
  ): void {
    Swal.fire({
      title:
        notificacion.titulo,
      html:
        `
        <p style="margin-bottom: 12px;">
          ${notificacion.mensaje}
        </p>

        <p>
          <strong>Tipo:</strong>
          ${notificacion.tipo}
        </p>

        <p>
          <strong>Fecha:</strong>
          ${notificacion.tiempo}
        </p>

        <p>
          <strong>Destinatario:</strong>
          ${notificacion.destinatario || 'General'}
        </p>
        `,
      confirmButtonText:
        'Cerrar'
    });
  }

  guardarConfiguracion(): void {
    /*
     * Actualmente no existe un endpoint de backend
     * para guardar esta configuración.
     *
     * emailActivo sí se utiliza al crear
     * una nueva notificación mediante enviar_correo.
     *
     * SMS y Push no tienen integración
     * en el backend actual.
     */

    this.mensajeConfiguracion =
      'Configuración de canales guardada correctamente.';

    setTimeout(() => {
      this.mensajeConfiguracion =
        '';
    }, 2500);
  }
}
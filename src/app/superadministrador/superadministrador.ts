
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

interface Sede {
  id_sede: number;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  estado: boolean | number | string;
  fecha_registro?: string;
  id_fundacion?: number | null;
}

interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
  estado?: boolean;
}

interface Usuario {
  id_usuario: number;
  id_rol: number | { id_rol?: number; nombre?: string };
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string;
  estado: boolean | number | string;
  tipo_documento?: string;
  numero_documento?: string;
}

type VistaSuperadministrador =
  | 'resumen'
  | 'sedes'
  | 'administradores';

@Component({
  selector: 'app-superadministrador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superadministrador.html',
  styleUrl: './superadministrador.css',
})
export class Superadministrador implements OnInit {
  private readonly apiUrl = 'https://geriapp-backend.onrender.com/api';

  vistaActiva: VistaSuperadministrador = 'resumen';

  sedes: Sede[] = [];
  administradores: Usuario[] = [];
  usuariosDisponibles: Usuario[] = [];
  roles: Rol[] = [];

  cargandoSedes = false;
  errorSedes = false;

  cargandoAdministradores = false;
  errorAdministradores = false;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Consultamos los datos para alimentar el resumen inicial.
    this.listarSedes();
    this.listarAdministradores();
  }

  // ==========================================
  // NAVEGACIÓN
  // ==========================================

  cambiarVista(vista: VistaSuperadministrador): void {
    this.vistaActiva = vista;

    // Actualizamos la información al volver a una sección.
    if (vista === 'sedes') {
      this.listarSedes();
    }

    if (vista === 'administradores') {
      this.listarAdministradores();
    }
  }

  // ==========================================
  // GESTIÓN DE SEDES
  // ==========================================

  listarSedes(): void {
    this.cargandoSedes = true;
    this.errorSedes = false;

    this.http.get<any>(`${this.apiUrl}/sedes/`).subscribe({
      next: (respuesta) => {
        this.sedes = this.normalizarLista<Sede>(respuesta).sort(
          (a, b) => (a.id_sede ?? 0) - (b.id_sede ?? 0)
        );

        this.cargandoSedes = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar las sedes:', error);

        this.sedes = [];
        this.cargandoSedes = false;
        this.errorSedes = true;
        this.cdr.detectChanges();
      },
    });
  }

  crearSede(): void {
    Swal.fire({
      title: 'Registrar sede',
      html: `
        <input id="nombre" class="swal2-input"
          placeholder="Nombre de la sede" maxlength="150">
        <input id="direccion" class="swal2-input"
          placeholder="Dirección">
        <input id="telefono" class="swal2-input"
          placeholder="Teléfono">
        <select id="estado" class="swal2-select">
          <option value="true">Activa</option>
          <option value="false">Inactiva</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar sede',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB',
      focusConfirm: false,
      preConfirm: () => {
        const popup = Swal.getPopup();

        const nombre = (
          popup?.querySelector('#nombre') as HTMLInputElement
        ).value.trim();

        const direccion = (
          popup?.querySelector('#direccion') as HTMLInputElement
        ).value.trim();

        const telefono = (
          popup?.querySelector('#telefono') as HTMLInputElement
        ).value.trim();

        const estado = (
          popup?.querySelector('#estado') as HTMLSelectElement
        ).value;

        if (!nombre) {
          Swal.showValidationMessage(
            'El nombre de la sede es obligatorio.'
          );
          return;
        }

        return {
          nombre,
          direccion: direccion || null,
          telefono: telefono || null,
          estado: estado === 'true',
          fecha_registro: new Date().toISOString(),
          id_fundacion: null,
        };
      },
    }).then((resultado) => {
      if (!resultado.isConfirmed || !resultado.value) return;

      this.http.post(`${this.apiUrl}/sedes/`, resultado.value).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Sede registrada',
            text: 'La sede se creó correctamente.',
            confirmButtonColor: '#3B5BDB',
          });

          this.listarSedes();
        },
        error: (error) => {
          console.error('Error al registrar la sede:', error);

          Swal.fire({
            icon: 'error',
            title: 'No se pudo registrar la sede',
            text: this.obtenerMensajeError(error),
            confirmButtonColor: '#3B5BDB',
          });
        },
      });
    });
  }

  editarSede(sede: Sede): void {
    Swal.fire({
      title: 'Editar sede',
      html: `
        <input id="nombre" class="swal2-input"
          placeholder="Nombre de la sede"
          value="${this.escaparHtml(sede.nombre ?? '')}"
          maxlength="150">
        <input id="direccion" class="swal2-input"
          placeholder="Dirección"
          value="${this.escaparHtml(sede.direccion ?? '')}">
        <input id="telefono" class="swal2-input"
          placeholder="Teléfono"
          value="${this.escaparHtml(sede.telefono ?? '')}">
        <select id="estado" class="swal2-select">
          <option value="true"
            ${this.esActivo(sede.estado) ? 'selected' : ''}>
            Activa
          </option>
          <option value="false"
            ${!this.esActivo(sede.estado) ? 'selected' : ''}>
            Inactiva
          </option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB',
      focusConfirm: false,
      preConfirm: () => {
        const popup = Swal.getPopup();

        const nombre = (
          popup?.querySelector('#nombre') as HTMLInputElement
        ).value.trim();

        const direccion = (
          popup?.querySelector('#direccion') as HTMLInputElement
        ).value.trim();

        const telefono = (
          popup?.querySelector('#telefono') as HTMLInputElement
        ).value.trim();

        const estado = (
          popup?.querySelector('#estado') as HTMLSelectElement
        ).value;

        if (!nombre) {
          Swal.showValidationMessage(
            'El nombre de la sede es obligatorio.'
          );
          return;
        }

        return {
          nombre,
          direccion: direccion || null,
          telefono: telefono || null,
          estado: estado === 'true',
        };
      },
    }).then((resultado) => {
      if (!resultado.isConfirmed || !resultado.value) return;

      this.http
        .patch(`${this.apiUrl}/sedes/${sede.id_sede}/`, resultado.value)
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Sede actualizada',
              text: 'Los cambios se guardaron correctamente.',
              confirmButtonColor: '#3B5BDB',
            });

            this.listarSedes();
          },
          error: (error) => {
            console.error('Error al actualizar la sede:', error);

            Swal.fire({
              icon: 'error',
              title: 'No se pudo actualizar la sede',
              text: this.obtenerMensajeError(error),
              confirmButtonColor: '#3B5BDB',
            });
          },
        });
    });
  }

  // ==========================================
  // GESTIÓN DE ADMINISTRADORES
  // ==========================================

  listarAdministradores(): void {
    this.cargandoAdministradores = true;
    this.errorAdministradores = false;

    forkJoin({
      usuarios: this.http.get<any>(`${this.apiUrl}/usuarios/`),
      roles: this.http.get<any>(`${this.apiUrl}/roles/`),
    }).subscribe({
      next: ({ usuarios, roles }) => {
        const listaUsuarios = this.normalizarLista<Usuario>(usuarios);
        this.usuariosDisponibles = listaUsuarios;
        this.roles = this.normalizarLista<Rol>(roles);

        this.administradores = listaUsuarios
          .filter((usuario) => this.esRolAdministrador(usuario))
          .sort((a, b) =>
            `${a.nombres} ${a.apellidos}`.localeCompare(
              `${b.nombres} ${b.apellidos}`
            )
          );

        this.cargandoAdministradores = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(
          'Error al consultar los usuarios y sus roles:',
          error
        );

        this.administradores = [];
        this.cargandoAdministradores = false;
        this.errorAdministradores = true;
        this.cdr.detectChanges();
      },
    });
  }

  crearAdministrador(): void {
  const rolAdministrador = this.obtenerRolAdministrador();

  if (!rolAdministrador) {
    Swal.fire({
      icon: 'error',
      title: 'Rol no encontrado',
      text: 'No se encontró el rol Administrador en el sistema.',
      confirmButtonColor: '#3B5BDB'
    });
    return;
  }

  Swal.fire({
    title: 'Registrar administrador',
    html: `
      <input id="nombres" class="swal2-input"
        placeholder="Nombres" maxlength="100">

      <input id="apellidos" class="swal2-input"
        placeholder="Apellidos" maxlength="100">

      <input id="correo" type="email" class="swal2-input"
        placeholder="Correo electrónico">

      <select id="tipo_documento" class="swal2-select">
        <option value="">Tipo de documento</option>
        <option value="CC">Cédula de ciudadanía</option>
        <option value="CE">Cédula de extranjería</option>
        <option value="TI">Tarjeta de identidad</option>
        <option value="Pasaporte">Pasaporte</option>
      </select>

      <input id="numero_documento" class="swal2-input"
        placeholder="Número de documento">

      <input id="telefono" class="swal2-input"
        placeholder="Teléfono">

      <input id="contrasena" type="password" class="swal2-input"
        placeholder="Contraseña (mínimo 8 caracteres)">
    `,
    showCancelButton: true,
    confirmButtonText: 'Crear administrador',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3B5BDB',
    focusConfirm: false,

    preConfirm: () => {
      const popup = Swal.getPopup();

      const nombres = (
        popup?.querySelector('#nombres') as HTMLInputElement
      ).value.trim();

      const apellidos = (
        popup?.querySelector('#apellidos') as HTMLInputElement
      ).value.trim();

      const correo = (
        popup?.querySelector('#correo') as HTMLInputElement
      ).value.trim();

      const tipo_documento = (
        popup?.querySelector('#tipo_documento') as HTMLSelectElement
      ).value;

      const numero_documento = (
        popup?.querySelector('#numero_documento') as HTMLInputElement
      ).value.trim();

      const telefono = (
        popup?.querySelector('#telefono') as HTMLInputElement
      ).value.trim();

      const contrasena = (
        popup?.querySelector('#contrasena') as HTMLInputElement
      ).value;

      if (
        !nombres ||
        !apellidos ||
        !correo ||
        !tipo_documento ||
        !numero_documento ||
        !contrasena
      ) {
        Swal.showValidationMessage(
          'Completa todos los campos obligatorios.'
        );
        return;
      }

      const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!formatoCorreo.test(correo)) {
        Swal.showValidationMessage(
          'Ingresa un correo electrónico válido.'
        );
        return;
      }

      if (contrasena.length < 8) {
        Swal.showValidationMessage(
          'La contraseña debe tener al menos 8 caracteres.'
        );
        return;
      }

      return {
        nombres,
        apellidos,
        correo,
        tipo_documento,
        numero_documento,
        telefono: telefono || null,
        contrasena
      };
    }
  }).then(resultado => {
    if (!resultado.isConfirmed || !resultado.value) {
      return;
    }

    // Ruta corregida según core/urls.py.
    this.http.post<any>(
      `${this.apiUrl}/usuarios/registro/`,
      resultado.value
    ).subscribe({
      next: respuesta => {
        const idUsuario = respuesta?.usuario?.id_usuario;

        if (!idUsuario) {
          console.error(
            'El registro respondió sin id_usuario:',
            respuesta
          );

          Swal.fire({
            icon: 'warning',
            title: 'Usuario registrado',
            text:
              'El servidor respondió sin el identificador del usuario. ' +
              'Verifica el registro antes de volver a intentarlo.',
            confirmButtonColor: '#3B5BDB'
          });

          this.listarAdministradores();
          return;
        }

        // Asigna el rol Administrador al usuario recién creado.
        this.http.patch(
          `${this.apiUrl}/usuarios/${idUsuario}/`,
          {
            id_rol: rolAdministrador.id_rol
          }
        ).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Administrador registrado',
              text:
                `${resultado.value.nombres} ` +
                `${resultado.value.apellidos} fue registrado correctamente.`,
              confirmButtonColor: '#3B5BDB'
            });

            this.listarAdministradores();
          },

          error: error => {
            console.error(
              'El usuario se creó, pero no se pudo asignar el rol:',
              error
            );

            Swal.fire({
              icon: 'warning',
              title: 'Asignación de rol pendiente',
              text:
                'El usuario fue creado, pero no se pudo confirmar ' +
                'la asignación del rol Administrador. No vuelvas a ' +
                'registrarlo; verifica el usuario y su rol en el backend.',
              confirmButtonColor: '#3B5BDB'
            });

            this.listarAdministradores();
          }
        });
      },

      error: error => {
        console.error(
          'Error al registrar el administrador:',
          error
        );

        Swal.fire({
          icon: 'error',
          title: 'No se pudo registrar el administrador',
          text: this.obtenerMensajeError(error),
          confirmButtonColor: '#3B5BDB'
        });
      }
    });
  });
}

editarAdministrador(usuario: Usuario): void {
  Swal.fire({
    title: 'Editar administrador',
    html: `
      <input id="nombres" class="swal2-input"
        placeholder="Nombres"
        value="${this.escaparHtml(usuario.nombres ?? '')}">

      <input id="apellidos" class="swal2-input"
        placeholder="Apellidos"
        value="${this.escaparHtml(usuario.apellidos ?? '')}">

      <input id="correo" type="email" class="swal2-input"
        placeholder="Correo electrónico"
        value="${this.escaparHtml(usuario.correo ?? '')}">

      <input id="telefono" class="swal2-input"
        placeholder="Teléfono"
        value="${this.escaparHtml(usuario.telefono ?? '')}">

      <label for="estado">Estado</label>
      <select id="estado" class="swal2-select">
        <option
          value="true"
          ${this.esActivo(usuario.estado) ? 'selected' : ''}
        >
          Activo
        </option>
        <option
          value="false"
          ${!this.esActivo(usuario.estado) ? 'selected' : ''}
        >
          Inactivo
        </option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar cambios',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3B5BDB',
    focusConfirm: false,

    preConfirm: () => {
      const popup = Swal.getPopup();

      const nombres = (
        popup?.querySelector('#nombres') as HTMLInputElement
      ).value.trim();

      const apellidos = (
        popup?.querySelector('#apellidos') as HTMLInputElement
      ).value.trim();

      const correo = (
        popup?.querySelector('#correo') as HTMLInputElement
      ).value.trim();

      const telefono = (
        popup?.querySelector('#telefono') as HTMLInputElement
      ).value.trim();

      const estado = (
        popup?.querySelector('#estado') as HTMLSelectElement
      ).value;

      if (!nombres || !apellidos || !correo) {
        Swal.showValidationMessage(
          'Nombres, apellidos y correo son obligatorios.'
        );
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        Swal.showValidationMessage(
          'Ingresa un correo electrónico válido.'
        );
        return;
      }

      return {
        nombres,
        apellidos,
        correo,
        telefono: telefono || null,
        estado: estado === 'true'
      };
    }
  }).then(resultado => {
    if (!resultado.isConfirmed || !resultado.value) {
      return;
    }

    this.http.patch(
      `${this.apiUrl}/usuarios/${usuario.id_usuario}/`,
      resultado.value
    ).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Administrador actualizado',
          text: 'Los cambios se guardaron correctamente.',
          confirmButtonColor: '#3B5BDB'
        });

        this.listarAdministradores();
      },
      error: error => {
        console.error(
          'Error al editar el administrador:',
          error
        );

        Swal.fire({
          icon: 'error',
          title: 'No se pudieron guardar los cambios',
          text: this.obtenerMensajeError(error),
          confirmButtonColor: '#3B5BDB'
        });
      }
    });
  });
}

   // ==========================================
  // ASIGNAR ROL ADMINISTRADOR
  // ==========================================

  asignarAdministrador(): void {
    const rolAdministrador = this.obtenerRolAdministrador();

    if (!rolAdministrador) {
      Swal.fire({
        icon: 'error',
        title: 'Rol no encontrado',
        text: 'No se encontró el rol Administrador en el sistema.',
        confirmButtonColor: '#3B5BDB',
      });
      return;
    }

    // Buscar usuarios que todavía no sean administradores
    // ni superadministradores.
    const usuariosElegibles = this.usuariosDisponibles
      .filter(
        (usuario) =>
          !this.esRolAdministrador(usuario) &&
          !this.esRolSuperadministrador(usuario)
      )
      .sort((a, b) =>
        `${a.nombres} ${a.apellidos}`.localeCompare(
          `${b.nombres} ${b.apellidos}`
        )
      );

    if (usuariosElegibles.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No hay usuarios disponibles',
        text: 'No se encontraron usuarios a los que se pueda asignar este rol.',
        confirmButtonColor: '#3B5BDB',
      });
      return;
    }

    // Construir las opciones del selector.
    const opciones: Record<string, string> = {};

    usuariosElegibles.forEach((usuario) => {
      opciones[String(usuario.id_usuario)] =
        `${usuario.nombres} ${usuario.apellidos} — ${usuario.correo}`;
    });

    // Seleccionar el usuario existente.
    Swal.fire({
      title: 'Asignar administrador',
      text: 'Selecciona el usuario que recibirá este rol.',
      input: 'select',
      inputOptions: opciones,
      inputPlaceholder: 'Selecciona un usuario',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B5BDB',
      inputValidator: (valor) => {
        if (!valor) {
          return 'Debes seleccionar un usuario.';
        }

        return null;
      },
    }).then((resultado) => {
      if (!resultado.isConfirmed || !resultado.value) {
        return;
      }

      const idUsuario = Number(resultado.value);

      const usuarioSeleccionado = usuariosElegibles.find(
        (usuario) => usuario.id_usuario === idUsuario
      );

      if (!usuarioSeleccionado) {
        return;
      }

      // Confirmar antes de cambiar el rol.
      Swal.fire({
        icon: 'question',
        title: '¿Confirmar asignación?',
        text:
          `Se asignará el rol Administrador a ` +
          `${usuarioSeleccionado.nombres} ${usuarioSeleccionado.apellidos}.`,
        showCancelButton: true,
        confirmButtonText: 'Sí, asignar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3B5BDB',
      }).then((confirmacion) => {
        if (!confirmacion.isConfirmed) {
          return;
        }

        // Actualizar únicamente el rol del usuario seleccionado.
        this.http
          .patch(
            `${this.apiUrl}/usuarios/${idUsuario}/`,
            { id_rol: rolAdministrador.id_rol }
          )
          .subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Rol asignado',
                text: 'El usuario ahora tiene el rol Administrador.',
                confirmButtonColor: '#3B5BDB',
              });

              // Actualizar la lista de administradores.
              this.listarAdministradores();
            },
            error: (error) => {
              console.error(
                'Error al asignar el rol Administrador:',
                error
              );

              Swal.fire({
                icon: 'error',
                title: 'No se pudo asignar el rol',
                text: this.obtenerMensajeError(error),
                confirmButtonColor: '#3B5BDB',
              });
            },
          });
      });
    });
  }

  nombreRol(usuario: Usuario): string {
    if (
      typeof usuario.id_rol === 'object' &&
      usuario.id_rol !== null
    ) {
      if (usuario.id_rol.nombre) {
        return usuario.id_rol.nombre;
      }

      const idRol = usuario.id_rol.id_rol;

      return (
        this.roles.find((rol) => rol.id_rol === idRol)?.nombre ??
        'Rol no identificado'
      );
    }

    return (
      this.roles.find((rol) => rol.id_rol === usuario.id_rol)?.nombre ??
      'Rol no identificado'
    );
  }

  private esRolAdministrador(usuario: Usuario): boolean {
    const nombre = this.normalizarTexto(this.nombreRol(usuario));

    return (
      nombre.includes('administrador') &&
      !nombre.includes('superadministrador')
    );
  }

  private esRolSuperadministrador(usuario: Usuario): boolean {
    return this.normalizarTexto(this.nombreRol(usuario))
      .includes('superadministrador');
  }

  private obtenerRolAdministrador(): Rol | undefined {
    return this.roles.find((rol) => {
      const nombre = this.normalizarTexto(rol.nombre);

      return (
        nombre.includes('administrador') &&
        !nombre.includes('superadministrador')
      );
    });
  }

  // ==========================================
  // UTILIDADES
  // ==========================================

  esActivo(estado: unknown): boolean {
    return (
      estado === true ||
      estado === 1 ||
      estado === '1' ||
      estado === 'true' ||
      estado === 'activo'
    );
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private normalizarLista<T>(respuesta: any): T[] {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (Array.isArray(respuesta?.results)) {
      return respuesta.results;
    }

    return [];
  }

  private obtenerMensajeError(error: any): string {
    const detalle = error?.error?.detail;

    if (typeof detalle === 'string') {
      return detalle;
    }

    if (typeof error?.error === 'string') {
      return error.error;
    }

    return 'Verifica los datos enviados y la respuesta del servidor.';
  }

  private escaparHtml(valor: string): string {
    return valor.replace(/[&<>"']/g, (caracter) => {
      const entidades: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };

      return entidades[caracter];
    });
  }
}

import { CommonModule } from '@angular/common';
import {ChangeDetectorRef,Component,OnInit,inject} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http'
import { API_URL } from '../config/api.config';
import Swal from 'sweetalert2';

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

  private readonly apiUrl = API_URL;

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

    const usuarioGuardado = localStorage.getItem('usuario');

    if (!usuarioGuardado) {
      this.cargandoUsuario = false;

      Swal.fire({
        title: 'Error',
        text: 'No se encontró la información del usuario.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });

      this.cdr.detectChanges();
      return;
    }

    try {
      const usuarioLocal: Usuario = JSON.parse(usuarioGuardado);

           if (!usuarioLocal.id_usuario) {
        this.cargandoUsuario = false;

        Swal.fire({
          title: 'Error',
          text: 'No se encontró el ID del usuario.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

        this.cdr.detectChanges();
        return;
      }

      this.idUsuario = usuarioLocal.id_usuario;

      console.log('ID DEL USUARIO LOGUEADO:', this.idUsuario);

      this.http.get<Usuario>(
        `${this.apiUrl}/usuarios/${this.idUsuario}/`
      ).subscribe({
        next: (usuarioApi) => {
          console.log('USUARIO OBTENIDO DESDE API:', usuarioApi);

          this.usuarioOriginal = { ...usuarioApi };

          this.asignarDatosUsuario(usuarioApi);
          this.actualizarLocalStorage(usuarioApi);
          this.cargarRoles();

          this.cargandoUsuario = false;
          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('ERROR AL CARGAR USUARIO:', error);

          this.cargandoUsuario = false;

          let textoError = 'No fue posible cargar la información del usuario.';

          if (error.status === 404) {
            textoError = 'El usuario no existe en el servidor.';
          } else if (error.status === 0) {
            textoError = 'No se pudo conectar con el servidor.';
          }

          Swal.fire({
            title: 'Error',
            text: textoError,
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#3B5BDB'
          });

          this.cdr.detectChanges();
        }
      });

    } catch (error) {
      console.error('ERROR AL LEER LOCALSTORAGE:', error);

      this.cargandoUsuario = false;

      Swal.fire({
        title: 'Error',
        text: 'No fue posible cargar los datos del usuario.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });

      this.cdr.detectChanges();
    }
  }
  // =====================================================
  // ASIGNAR DATOS DEL USUARIO
  // =====================================================

  private asignarDatosUsuario(usuario: Usuario): void {
    this.idUsuario = usuario.id_usuario;

    this.nombresUsuario = usuario.nombres ?? '';
    this.apellidosUsuario = usuario.apellidos ?? '';

    this.nombreUsuario =
      `${this.nombresUsuario} ${this.apellidosUsuario}`.trim();

    this.nombreUsuarioEdicion = this.nombreUsuario;

    this.correoUsuario = usuario.correo ?? '';
    this.telefonoUsuario = usuario.telefono ?? '';

    this.inicialesUsuario =
      this.obtenerIniciales(this.nombreUsuario);

    this.cargoUsuario = 'Cargando...';
  }

  // =====================================================
  // ACTUALIZAR LOCALSTORAGE
  // =====================================================

  private actualizarLocalStorage(usuarioApi: Usuario): void {
    const usuarioAnterior = localStorage.getItem('usuario');

    let datosUsuario: Usuario = usuarioApi;

    if (usuarioAnterior) {
      try {
        const anterior: Usuario = JSON.parse(usuarioAnterior);

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
        console.log('ROLES OBTENIDOS:', roles);

        this.roles = roles.filter(
          rol => rol.estado === true
        );

        this.cargandoRoles = false;

        if (
          this.usuarioOriginal &&
          this.usuarioOriginal.id_rol !== null
        ) {
          const rolUsuario = this.roles.find(
            rol => rol.id_rol === this.usuarioOriginal!.id_rol
          );

          this.cargoUsuario =
            rolUsuario?.nombre ?? 'Rol no encontrado';

        } else {
          this.cargoUsuario = 'Sin rol asignado';
        }

        console.log(
          'CARGO DEL USUARIO:',
          this.cargoUsuario
        );

        this.cdr.detectChanges();
      },

            error: (error) => {
        console.error('ERROR AL CARGAR ROLES:', error);

        this.cargandoRoles = false;
        this.cargoUsuario = 'No disponible';

        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los roles.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

        this.cdr.detectChanges();
      }
    });
  }

  // =====================================================
  // OBTENER INICIALES
  // =====================================================

  obtenerIniciales(nombre: string): string {
    if (!nombre.trim()) {
      return '';
    }

    const palabras = nombre
      .trim()
      .split(/\s+/)
      .filter(palabra => palabra.length > 0);

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
      Swal.fire({
        title: 'Error',
        text: 'No se encontró el ID del usuario.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR NOMBRE
    // ===================================================

    const nombreCompleto =
      this.nombreUsuarioEdicion.trim();

    if (!nombreCompleto) {
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El nombre completo es obligatorio.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // SEPARAR NOMBRES Y APELLIDOS
    // ===================================================

    const partesNombre = nombreCompleto
      .split(/\s+/)
      .filter(parte => parte.length > 0);

    let nombres = '';
    let apellidos = '';

    if (partesNombre.length === 1) {
      nombres = partesNombre[0];
    } else if (partesNombre.length >= 3) {
      nombres = partesNombre
        .slice(0, -2)
        .join(' ');

      apellidos = partesNombre
        .slice(-2)
        .join(' ');
    } else {
      nombres = partesNombre[0];

      apellidos = partesNombre
        .slice(1)
        .join(' ');
    }

    // ===================================================
    // VALIDAR CORREO
    // ===================================================

    const correo = this.correoUsuario.trim();

    if (!correo) {
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El correo electrónico es obligatorio.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    const correoValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

    if (!correoValido) {
      Swal.fire({
        title: 'Correo inválido',
        text: 'Ingresa un correo electrónico válido.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR TELÉFONO
    // ===================================================

    const telefono = this.telefonoUsuario.trim();

    if (!telefono) {
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'El teléfono es obligatorio.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
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
          usuarioActualizado.nombres ?? nombres;

        this.apellidosUsuario =
          usuarioActualizado.apellidos ?? apellidos;

        this.nombreUsuario =
          `${this.nombresUsuario} ${this.apellidosUsuario}`.trim();

        this.nombreUsuarioEdicion =
          this.nombreUsuario;

        this.correoUsuario =
          usuarioActualizado.correo ?? correo;

        this.telefonoUsuario =
          usuarioActualizado.telefono ?? telefono;

        this.inicialesUsuario =
          this.obtenerIniciales(
            this.nombreUsuario
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
            localStorage.getItem('usuario') ?? '{}'
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

        Swal.fire({
          title: 'Cambios guardados',
          text: 'Tu perfil se actualizó correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

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

        let textoError = 'No fue posible guardar los cambios.';

        if (error.error?.detail) {
          textoError = error.error.detail;

        } else if (error.error?.error) {
          textoError = error.error.error;

        } else if (
          error.error &&
          typeof error.error === 'object'
        ) {
          const errores =
            Object.values(error.error)
              .flat()
              .join(' ');

          textoError = errores || 'El servidor rechazó la actualización.';

        } else if (error.status === 0) {
          textoError = 'No se pudo conectar con el servidor.';
        }

        Swal.fire({
          title: 'Error',
          text: textoError,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

        this.cdr.detectChanges();
      }
    });
  }
  // =====================================================
  // CAMBIAR FOTO
  // =====================================================

   cambiarFoto(): void {
    Swal.fire({
      title: 'Próximamente',
      text: 'La actualización de la foto se implementará posteriormente.',
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#3B5BDB'
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
      Swal.fire({
        title: 'Error',
        text: 'No se encontró el ID del usuario.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
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
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'Ingresa tu contraseña actual.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR NUEVA CONTRASEÑA
    // ===================================================

    if (!this.nuevaContrasena.trim()) {
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'Ingresa la nueva contraseña.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR CONFIRMACIÓN
    // ===================================================

    if (!this.confirmarContrasena.trim()) {
      Swal.fire({
        title: 'Campo obligatorio',
        text: 'Confirma la nueva contraseña.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR LONGITUD MÍNIMA
    // ===================================================

    if (this.nuevaContrasena.length < 8) {
      Swal.fire({
        title: 'Contraseña muy corta',
        text: 'La nueva contraseña debe tener al menos 8 caracteres.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR LONGITUD MÁXIMA
    // ===================================================

    if (this.nuevaContrasena.length > 10) {
      Swal.fire({
        title: 'Contraseña muy larga',
        text: 'La nueva contraseña debe tener máximo 10 caracteres.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR CONFIRMACIÓN MÁXIMA
    // ===================================================

    if (this.confirmarContrasena.length > 10) {
      Swal.fire({
        title: 'Confirmación muy larga',
        text: 'La confirmación de la contraseña no puede superar los 10 caracteres.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
      return;
    }

    // ===================================================
    // VALIDAR COINCIDENCIA
    // ===================================================

    if (
      this.nuevaContrasena !==
      this.confirmarContrasena
    ) {
      Swal.fire({
        title: 'Las contraseñas no coinciden',
        text: 'Las contraseñas nuevas no coinciden.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });
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

        Swal.fire({
          title: 'Contraseña actualizada',
          text: respuesta?.mensaje ?? 'Contraseña actualizada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

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

        let textoError = 'No fue posible actualizar la contraseña.';

        if (error.error?.detail) {
          textoError = error.error.detail;

        } else if (error.error?.error) {
          textoError = error.error.error;

        } else if (
          error.error &&
          typeof error.error === 'object'
        ) {
          const errores =
            Object.values(error.error)
              .flat()
              .join(' ');

          textoError = errores || 'El servidor rechazó el cambio de contraseña.';

        } else if (error.status === 0) {
          textoError = 'No se pudo conectar con el servidor.';
        }

        Swal.fire({
          title: 'Error',
          text: textoError,
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

        this.cdr.detectChanges();
      }
    });
  }
}


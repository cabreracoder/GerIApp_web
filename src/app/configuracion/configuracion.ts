
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
    'http://127.0.0.1:8000/api';

  // =====================================================
  // USUARIO
  // =====================================================

  idUsuario: number | null = null;

  nombresUsuario: string = '';
  apellidosUsuario: string = '';
  nombreUsuario: string = '';

  correoUsuario: string = '';
  telefonoUsuario: string = '';

  cargoUsuario: string = '';
  inicialesUsuario: string = '';

  private usuarioOriginal: Usuario | null = null;

  // =====================================================
  // ROLES
  // =====================================================

  roles: Rol[] = [];


  // =====================================================
  // ESTADOS
  // =====================================================

  cargandoUsuario: boolean = false;
  cargandoRoles: boolean = false;
  guardando: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  // =====================================================
  // CONTRASEÑA
  // =====================================================

  contrasenaActual: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

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

    this.mensajeError = '';
    this.mensajeExito = '';
    this.cargandoUsuario = true;

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {

      this.cargandoUsuario = false;

      this.mensajeError =
        'No se encontró la información del usuario.';

      this.cdr.detectChanges();

      return;
    }

    try {

      const usuarioLocal: Usuario =
        JSON.parse(usuarioGuardado);

      // -------------------------------------------------
      // SOLAMENTE USAMOS EL ID DEL LOCALSTORAGE
      // -------------------------------------------------

      if (!usuarioLocal.id_usuario) {

        this.cargandoUsuario = false;

        this.mensajeError =
          'No se encontró el ID del usuario.';

        this.cdr.detectChanges();

        return;
      }

      this.idUsuario =
        usuarioLocal.id_usuario;

      console.log(
        'ID DEL USUARIO LOGUEADO:',
        this.idUsuario
      );

      // -------------------------------------------------
      // CONSULTAMOS DIRECTAMENTE AL USUARIO
      // -------------------------------------------------

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

          // ---------------------------------------------
          // MOSTRAR DATOS DEL USUARIO
          // ---------------------------------------------

          this.asignarDatosUsuario(
            usuarioApi
          );

          // ---------------------------------------------
          // ACTUALIZAR LOCALSTORAGE
          // ---------------------------------------------

          const usuarioAnterior =
            localStorage.getItem('usuario');

          let datosUsuario =
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

          // ---------------------------------------------
          // CARGAR ROLES
          // ---------------------------------------------

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

          if (error.status === 404) {

            this.mensajeError =
              'El usuario no existe en el servidor.';

          } else if (error.status === 0) {

            this.mensajeError =
              'No se pudo conectar con el servidor.';

          } else {

            this.mensajeError =
              'No fue posible cargar la información del usuario.';
          }

          this.cdr.detectChanges();
        }

      });

    } catch (error) {

      console.error(
        'ERROR AL LEER LOCALSTORAGE:',
        error
      );

      this.cargandoUsuario = false;

      this.mensajeError =
        'No fue posible cargar los datos del usuario.';

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
      `${this.nombresUsuario} ${this.apellidosUsuario}`
        .trim();

    this.correoUsuario =
      usuario.correo ?? '';

    this.telefonoUsuario =
      usuario.telefono ?? '';

    this.inicialesUsuario =
      this.obtenerIniciales(
        this.nombreUsuario
      );

    // El cargo se actualiza cuando
    // se carguen los roles.
    this.cargoUsuario =
      'Cargando...';
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

        // ---------------------------------------------
        // BUSCAR EL ROL DEL USUARIO
        // ---------------------------------------------

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

          if (rolUsuario) {

            this.cargoUsuario =
              rolUsuario.nombre;

          } else {

            this.cargoUsuario =
              'Rol no encontrado';
          }

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

        this.cdr.detectChanges();
      }

    });
  }

  // =====================================================
  // OBTENER NOMBRE DEL ROL
  // =====================================================

  private obtenerNombreRolLocal(
    idRol: number | null
  ): string {

    if (idRol === null) {

      return 'Sin rol asignado';
    }

    const rol =
      this.roles.find(
        item =>
          item.id_rol === idRol
      );

    return rol?.nombre ??
      'Rol no encontrado';
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

    this.mensajeExito = '';
    this.mensajeError = '';

    if (this.guardando) {

      return;
    }

    if (this.idUsuario === null) {

      this.mensajeError =
        'No se encontró el ID del usuario.';

      return;
    }

    // -------------------------------------------------
    // NOMBRE
    // -------------------------------------------------

    const nombreCompleto =
      this.nombreUsuario.trim();

    if (!nombreCompleto) {

      this.mensajeError =
        'El nombre completo es obligatorio.';

      return;
    }

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

    } else {

      if (partesNombre.length >= 3) {

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
    }

    // -------------------------------------------------
    // CORREO
    // -------------------------------------------------

    const correo =
      this.correoUsuario.trim();

    if (!correo) {

      this.mensajeError =
        'El correo electrónico es obligatorio.';

      return;
    }

    const correoValido =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(correo);

    if (!correoValido) {

      this.mensajeError =
        'Ingresa un correo electrónico válido.';

      return;
    }

    // -------------------------------------------------
    // TELÉFONO
    // -------------------------------------------------

    const telefono =
      this.telefonoUsuario.trim();

    // -------------------------------------------------
    // DATOS A ACTUALIZAR
    // -------------------------------------------------

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

    // -------------------------------------------------
    // ACTUALIZAR USUARIO
    // -------------------------------------------------

    this.http.patch<Usuario>(
      `${this.apiUrl}/usuarios/${this.idUsuario}/`,
      datos
    ).subscribe({

      next: (usuarioActualizado) => {

        console.log(
          'USUARIO ACTUALIZADO:',
          usuarioActualizado
        );

        // ---------------------------------------------
        // ACTUALIZAR INFORMACIÓN EN PANTALLA
        // ---------------------------------------------

        this.nombresUsuario =
          usuarioActualizado.nombres ?? '';

        this.apellidosUsuario =
          usuarioActualizado.apellidos ?? '';

        this.nombreUsuario =
          `${this.nombresUsuario} ${this.apellidosUsuario}`
            .trim();

        this.correoUsuario =
          usuarioActualizado.correo ?? '';

        this.telefonoUsuario =
          usuarioActualizado.telefono ?? '';

        this.inicialesUsuario =
          this.obtenerIniciales(
            this.nombreUsuario
          );

        this.usuarioOriginal =
          {
            ...this.usuarioOriginal,
            ...usuarioActualizado
          };

        // ---------------------------------------------
        // ACTUALIZAR LOCALSTORAGE
        // ---------------------------------------------

        const usuarioAnterior =
          localStorage.getItem('usuario');

        let datosUsuario =
          usuarioActualizado;

        if (usuarioAnterior) {

          try {

            const anterior: Usuario =
              JSON.parse(usuarioAnterior);

            datosUsuario = {

              ...anterior,
              ...usuarioActualizado

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

        // ---------------------------------------------
        // FINALIZAR
        // ---------------------------------------------

        this.guardando = false;

        this.mensajeExito =
          'Cambios guardados correctamente.';

        this.cdr.detectChanges();

        setTimeout(() => {

          this.mensajeExito = '';

          this.cdr.detectChanges();

        }, 3000);
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

        if (error.error?.detail) {

          this.mensajeError =
            error.error.detail;

        } else if (error.error?.error) {

          this.mensajeError =
            error.error.error;

        } else if (
          error.error &&
          typeof error.error === 'object'
        ) {

          const errores =
            Object.values(error.error)
              .flat()
              .join(' ');

          this.mensajeError =
            errores ||
            'El servidor rechazó la actualización.';

        } else {

          this.mensajeError =
            'No fue posible guardar los cambios.';
        }

        this.cdr.detectChanges();
      }

    });
  }

  // =====================================================
  // CAMBIAR FOTO
  // =====================================================

  cambiarFoto(): void {

    alert(
      'La actualización de la foto se implementará posteriormente.'
    );
  }

  // =====================================================
  // CAMBIAR CONTRASEÑA
  // =====================================================

  actualizarContrasena(): void {

    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.contrasenaActual.trim()) {

      this.mensajeError =
        'Ingresa tu contraseña actual.';

      return;
    }

    if (!this.nuevaContrasena.trim()) {

      this.mensajeError =
        'Ingresa la nueva contraseña.';

      return;
    }

    if (!this.confirmarContrasena.trim()) {

      this.mensajeError =
        'Confirma la nueva contraseña.';

      return;
    }

    if (
      this.nuevaContrasena !==
      this.confirmarContrasena
    ) {

      this.mensajeError =
        'Las contraseñas nuevas no coinciden.';

      return;
    }

    if (this.nuevaContrasena.length < 8) {

      this.mensajeError =
        'La nueva contraseña debe tener al menos 8 caracteres.';

      return;
    }

    this.mensajeError =
      'El cambio de contraseña todavía no está conectado con la API.';

    console.log(
      'SOLICITUD DE CAMBIO DE CONTRASEÑA:',
      {
        idUsuario: this.idUsuario
      }
    );
  }
}


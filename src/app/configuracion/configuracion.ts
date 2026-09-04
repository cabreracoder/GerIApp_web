import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ConfiguracionService,
  IUsuario
} from './configuracion.service';

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

  private configuracionService = inject(ConfiguracionService);

  // =====================================================
  // DATOS DEL USUARIO
  // =====================================================

  idUsuario: number | null = null;

  nombreUsuario: string = '';
  correoUsuario: string = '';
  telefonoUsuario: string = '';
  cargoUsuario: string = '';
  inicialesUsuario: string = '';

  // =====================================================
  // PREFERENCIAS
  // =====================================================

  notificacionesCorreo: boolean = true;
  notificacionesSms: boolean = false;
  alertasCriticas: boolean = true;

  // =====================================================
  // ESTADOS
  // =====================================================

  guardando: boolean = false;

  mensajeExito: string = '';
  mensajeError: string = '';

  // =====================================================
  // SEGURIDAD
  // =====================================================

  contrasenaActual: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';

  // =====================================================
  // INICIALIZACIÓN
  // =====================================================

  ngOnInit(): void {
    this.cargarUsuario();
  }

  // =====================================================
  // CARGAR USUARIO
  // =====================================================

  cargarUsuario(): void {

    const usuarioGuardado =
      localStorage.getItem('usuario');

    if (!usuarioGuardado) {

      console.error(
        'No hay un usuario almacenado en localStorage.'
      );

      this.mensajeError =
        'No se encontró la información del usuario.';

      return;
    }

    try {

      const usuario: IUsuario =
        JSON.parse(usuarioGuardado);

      console.log(
        'USUARIO LEÍDO EN CONFIGURACIÓN:',
        JSON.stringify(usuario, null, 2)
      );

      // ID
      this.idUsuario =
        usuario.id_usuario ?? null;

      // NOMBRE
      this.nombreUsuario =
        `${usuario.nombres ?? ''} ${usuario.apellidos ?? ''}`.trim();

      // CORREO
      this.correoUsuario =
        usuario.correo ?? '';

      // TELÉFONO
      this.telefonoUsuario =
        usuario.telefono ?? '';

      // INICIALES
      this.inicialesUsuario =
        this.obtenerIniciales(
          this.nombreUsuario
        );

      // CARGO
      // Por ahora se mantiene como Administrador.
      // Después lo conectamos con la tabla roles.
      this.cargoUsuario =
        'Administrador';

    } catch (error) {

      console.error(
        'Error al leer los datos del usuario:',
        error
      );

      this.mensajeError =
        'No fue posible cargar los datos del usuario.';
    }
  }

  // =====================================================
  // OBTENER INICIALES
  // =====================================================

  obtenerIniciales(nombre: string): string {

    if (!nombre) {
      return '';
    }

    const palabras =
      nombre
        .split(' ')
        .filter(
          palabra => palabra.length > 0
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
  // GUARDAR CAMBIOS
  // =====================================================

  guardarCambios(): void {

    // Limpiar mensajes anteriores
    this.mensajeExito = '';
    this.mensajeError = '';

    // Verificar ID
    if (this.idUsuario === null) {

      this.mensajeError =
        'No se encontró el ID del usuario.';

      console.error(
        'No se encontró el ID del usuario.'
      );

      return;
    }

    // Verificar correo
    if (!this.correoUsuario.trim()) {

      this.mensajeError =
        'El correo electrónico es obligatorio.';

      return;
    }

    // Verificar que no esté guardando
    if (this.guardando) {
      return;
    }

    // Datos que enviaremos al backend
    const datos: Partial<IUsuario> = {

      correo:
        this.correoUsuario.trim(),

      telefono:
        this.telefonoUsuario.trim()

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

    // ===================================================
    // PETICIÓN PATCH
    // ===================================================

    this.configuracionService
      .actualizarUsuario(
        this.idUsuario,
        datos
      )
      .subscribe({

        // ===============================================
        // ÉXITO
        // ===============================================

        next: (
          usuarioActualizado: IUsuario
        ) => {

          console.log(
            'PERFIL ACTUALIZADO CORRECTAMENTE:',
            usuarioActualizado
          );

          this.guardando = false;

          // ---------------------------------------------
          // Actualizar localStorage
          // ---------------------------------------------

          const usuarioAnterior =
            localStorage.getItem('usuario');

          let datosUsuario: IUsuario =
            usuarioActualizado;

          if (usuarioAnterior) {

            try {

              const anterior: IUsuario =
                JSON.parse(usuarioAnterior);

              datosUsuario = {
                ...anterior,
                ...usuarioActualizado
              };

            } catch (error) {

              console.error(
                'Error al actualizar localStorage:',
                error
              );

            }
          }

          localStorage.setItem(
            'usuario',
            JSON.stringify(datosUsuario)
          );

          // ---------------------------------------------
          // Actualizar información mostrada
          // ---------------------------------------------

          this.correoUsuario =
            datosUsuario.correo ?? '';

          this.telefonoUsuario =
            datosUsuario.telefono ?? '';

          this.nombreUsuario =
            `${datosUsuario.nombres ?? ''} ${datosUsuario.apellidos ?? ''}`.trim();

          this.inicialesUsuario =
            this.obtenerIniciales(
              this.nombreUsuario
            );

          // ---------------------------------------------
          // Mensaje
          // ---------------------------------------------

          this.mensajeExito =
            'Cambios guardados correctamente.';

          // Quitar mensaje después de 3 segundos
          setTimeout(() => {

            this.mensajeExito = '';

          }, 3000);
        },

        // ===============================================
        // ERROR
        // ===============================================

        error: (error) => {

          this.guardando = false;

          console.error(
            'ERROR AL ACTUALIZAR PERFIL:',
            error
          );

          console.error(
            'RESPUESTA DEL SERVIDOR:',
            error.error
          );

          if (error.error?.detail) {

            this.mensajeError =
              error.error.detail;

          } else if (error.error?.error) {

            this.mensajeError =
              error.error.error;

          } else if (error.error) {

            this.mensajeError =
              'El servidor rechazó la actualización.';

          } else {

            this.mensajeError =
              'No fue posible guardar los cambios.';
          }
        }

      });
  }

  // =====================================================
  // CAMBIAR FOTO
  // =====================================================

  cambiarFoto(): void {

    console.log(
      'Cambiar foto seleccionado.'
    );

    alert(
      'La actualización de la foto se implementará posteriormente.'
    );
  }

  // =====================================================
  // ACTUALIZAR CONTRASEÑA
  // =====================================================

  actualizarContrasena(): void {

    this.mensajeExito = '';
    this.mensajeError = '';

    // ---------------------------------------------
    // Validar contraseña actual
    // ---------------------------------------------

    if (!this.contrasenaActual.trim()) {

      this.mensajeError =
        'Ingresa tu contraseña actual.';

      return;
    }

    // ---------------------------------------------
    // Validar nueva contraseña
    // ---------------------------------------------

    if (!this.nuevaContrasena.trim()) {

      this.mensajeError =
        'Ingresa la nueva contraseña.';

      return;
    }

    // ---------------------------------------------
    // Validar confirmación
    // ---------------------------------------------

    if (!this.confirmarContrasena.trim()) {

      this.mensajeError =
        'Confirma la nueva contraseña.';

      return;
    }

    // ---------------------------------------------
    // Comparar contraseñas
    // ---------------------------------------------

    if (
      this.nuevaContrasena !==
      this.confirmarContrasena
    ) {

      this.mensajeError =
        'Las contraseñas nuevas no coinciden.';

      return;
    }

    // ---------------------------------------------
    // Longitud mínima
    // ---------------------------------------------

    if (this.nuevaContrasena.length < 8) {

      this.mensajeError =
        'La nueva contraseña debe tener al menos 8 caracteres.';

      return;
    }

    console.log(
      'Solicitud de actualización de contraseña:',
      {
        idUsuario: this.idUsuario
      }
    );

    /*
     * La API para cambiar contraseña todavía
     * no está conectada.
     *
     * Cuando creemos ese endpoint, aquí
     * realizaremos la petición al backend.
     */

    alert(
      'La actualización de contraseña todavía no está conectada con la API.'
    );
  }

}
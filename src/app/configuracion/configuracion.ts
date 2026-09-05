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

// =====================================================
// API
// =====================================================

private readonly apiUrl =
'http://127.0.0.1:8000/api';

// =====================================================
// DATOS DEL USUARIO
// =====================================================

idUsuario: number | null = null;

nombresUsuario: string = '';
apellidosUsuario: string = '';

nombreUsuario: string = '';

correoUsuario: string = '';
telefonoUsuario: string = '';

cargoUsuario: string = '';
inicialesUsuario: string = '';

// =====================================================
// DATOS ORIGINALES
// =====================================================

private usuarioOriginal: Usuario | null = null;

// =====================================================
// ROLES
// =====================================================

roles: Rol[] = [];

// =====================================================
// PREFERENCIAS
// =====================================================

notificacionesCorreo: boolean = true;
notificacionesSms: boolean = false;
alertasCriticas: boolean = true;

// =====================================================
// ESTADOS
// =====================================================

cargandoUsuario: boolean = false;
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

this.mensajeError = '';
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

  if (!usuarioLocal.id_usuario) {

    this.cargandoUsuario = false;

    this.mensajeError =
      'No se encontró el ID del usuario.';

    this.cdr.detectChanges();

    return;
  }

  this.idUsuario =
    usuarioLocal.id_usuario;

  /*
   * Primero mostramos la información que ya
   * tenemos guardada localmente.
   */
  this.asignarDatosUsuario(usuarioLocal);

  /*
   * Después consultamos la API para obtener
   * la información actualizada.
   */
  this.http.get<Usuario[]>(
    `${this.apiUrl}/usuarios/`
  ).subscribe({

    next: (usuarios) => {

      const usuarioApi =
        usuarios.find(
          usuario =>
            usuario.id_usuario === this.idUsuario
        );

      if (!usuarioApi) {

        this.cargandoUsuario = false;

        this.mensajeError =
          'No se encontró el usuario en la API.';

        this.cdr.detectChanges();

        return;
      }

      console.log(
        'USUARIO OBTENIDO DESDE API:',
        usuarioApi
      );

      this.usuarioOriginal =
        { ...usuarioApi };

      this.asignarDatosUsuario(usuarioApi);

      /*
       * Actualizamos localStorage con la
       * información real de la API.
       */
      localStorage.setItem(
        'usuario',
        JSON.stringify(usuarioApi)
      );

      /*
       * Cargamos los roles para mostrar
       * correctamente el cargo.
       */
      this.cargarRoles();

      this.cargandoUsuario = false;

      this.cdr.detectChanges();
    },

    error: (error) => {

      console.error(
        'ERROR AL CARGAR USUARIO:',
        error
      );

      /*
       * Si falla la API pero teníamos información
       * en localStorage, dejamos esa información
       * visible.
       */
      this.cargandoUsuario = false;

      this.mensajeError =
        'No fue posible actualizar la información desde el servidor.';

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

/*
 * El cargo se actualiza posteriormente
 * cuando se cargan los roles.
 */
this.cargoUsuario =
  this.obtenerNombreRolLocal(
    usuario.id_rol
  );


}

// =====================================================
// CARGAR ROLES
// =====================================================

cargarRoles(): void {


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

    if (
      this.usuarioOriginal &&
      this.usuarioOriginal.id_rol !== null
    ) {

      const rol =
        this.roles.find(
          item =>
            item.id_rol ===
            this.usuarioOriginal!.id_rol
        );

      this.cargoUsuario =
        rol?.nombre ??
        'Sin rol asignado';

    } else {

      this.cargoUsuario =
        'Sin rol asignado';
    }

    this.cdr.detectChanges();
  },

  error: (error) => {

    console.error(
      'ERROR AL CARGAR ROLES:',
      error
    );

    /*
     * Si falla la API de roles, no dañamos
     * la información del perfil.
     */
    this.cargoUsuario =
      'Sin rol asignado';

    this.cdr.detectChanges();
  }

});


}

// =====================================================
// OBTENER NOMBRE DEL ROL LOCALMENTE
// =====================================================

private obtenerNombreRolLocal(
idRol: number | null
): string {


if (idRol === null) {
  return 'Sin rol asignado';
}

const rol =
  this.roles.find(
    item => item.id_rol === idRol
  );

return rol?.nombre ??
  'Administrador';

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

// ---------------------------------------------------
// NOMBRE
// ---------------------------------------------------

const nombreCompleto =
  this.nombreUsuario.trim();

if (!nombreCompleto) {

  this.mensajeError =
    'El nombre completo es obligatorio.';

  return;
}

/*
 * Convertimos el campo "Nombre Completo"
 * nuevamente en nombres y apellidos.
 */
const partesNombre =
  nombreCompleto
    .split(/\s+/)
    .filter(
      parte => parte.length > 0
    );

let nombres = '';
let apellidos = '';

if (partesNombre.length === 1) {

  nombres =
    partesNombre[0];

} else {

  /*
   * Las últimas dos palabras se toman como
   * apellidos y el resto como nombres.
   *
   * Ejemplo:
   * José Alfredo Cabrera Torres
   *
   * nombres = José Alfredo
   * apellidos = Cabrera Torres
   */
  nombres =
    partesNombre
      .slice(0, -2)
      .join(' ');

  apellidos =
    partesNombre
      .slice(-2)
      .join(' ');

  /*
   * Para nombres de solo dos palabras:
   * José Cabrera
   */
  if (!nombres) {

    nombres =
      partesNombre[0];

    apellidos =
      partesNombre
        .slice(1)
        .join(' ');
  }
}

// ---------------------------------------------------
// CORREO
// ---------------------------------------------------

const correo =
  this.correoUsuario.trim();

if (!correo) {

  this.mensajeError =
    'El correo electrónico es obligatorio.';

  return;
}

// ---------------------------------------------------
// VALIDACIÓN BÁSICA DEL CORREO
// ---------------------------------------------------

const correoValido =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    .test(correo);

if (!correoValido) {

  this.mensajeError =
    'Ingresa un correo electrónico válido.';

  return;
}

// ---------------------------------------------------
// TELÉFONO
// ---------------------------------------------------

const telefono =
  this.telefonoUsuario.trim();

// ---------------------------------------------------
// DATOS PARA PATCH
// ---------------------------------------------------

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

// ===================================================
// PATCH
// ===================================================

this.http.patch<Usuario>(
  `${this.apiUrl}/usuarios/${this.idUsuario}/`,
  datos
).subscribe({

  // =================================================
  // ÉXITO
  // =================================================

  next: (usuarioActualizado) => {

    console.log(
      'USUARIO ACTUALIZADO:',
      usuarioActualizado
    );

    /*
     * Actualizamos los datos mostrados.
     */
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

    /*
     * Actualizamos usuario original.
     */
    this.usuarioOriginal =
      { ...usuarioActualizado };

    /*
     * Actualizamos localStorage.
     */
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

    this.guardando = false;

    this.mensajeExito =
      'Cambios guardados correctamente.';

    this.cdr.detectChanges();

    /*
     * Ocultar mensaje después de 3 segundos.
     */
    setTimeout(() => {

      this.mensajeExito = '';

      this.cdr.detectChanges();

    }, 3000);
  },

  // =================================================
  // ERROR
  // =================================================

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
// ACTUALIZAR CONTRASEÑA
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

/*
 * Todavía no hacemos petición porque no existe
 * un endpoint específico para cambio de contraseña.
 */
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

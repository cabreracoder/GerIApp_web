import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
ChangeDetectorRef,
Component,
OnInit
} from '@angular/core';

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

private readonly apiUrl =
'http://127.0.0.1:8000/api';

// =========================================================
// USUARIOS
// =========================================================

users: Usuario[] = [];

// =========================================================
// ROLES
// =========================================================

roles: Rol[] = [];

// =========================================================
// BUSCADOR
// =========================================================

searchText = '';

// =========================================================
// MENSAJES
// =========================================================

successMessage = '';

errorMessage = '';

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
) {}

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

    this.users = respuesta;
    this.cdr.detectChanges();

    // Guardamos el rol original de cada usuario.

    this.users.forEach((usuario) => {

      this.originalRoleIds[
        usuario.id_usuario
      ] = usuario.id_rol;

    });


    console.log(
      'Total usuarios:',
      this.users.length
    );

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

    this.errorMessage =
      'No se pudieron cargar los usuarios.';

    this.cdr.detectChanges();

  }

});


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


    // Mostramos únicamente los roles activos.

    this.roles =
      respuesta.filter(
        (rol) => rol.estado === true
      );


    console.log(
      'Roles disponibles:',
      this.roles
    );

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

    this.errorMessage =
      'No se pudieron cargar los roles.';

    this.cdr.detectChanges();

  }

});


}

// =========================================================
// FILTRAR USUARIOS
// =========================================================

get filteredUsers(): Usuario[] {


const texto =
  this.searchText
    .trim()
    .toLowerCase();


if (!texto) {

  return this.users;

}


return this.users.filter(
  (usuario) => {

    const nombreCompleto =
      `${usuario.nombres || ''} ${usuario.apellidos || ''}`
        .toLowerCase();


    const documento =
      (
        usuario.numero_documento || ''
      )
        .toString()
        .toLowerCase();


    const correo =
      (
        usuario.correo || ''
      )
        .toLowerCase();


    return (
      nombreCompleto.includes(texto) ||
      documento.includes(texto) ||
      correo.includes(texto)
    );

  }
);


}

// =========================================================
// CAMBIAR ROL
// =========================================================

onRoleChange(
user: Usuario,
roleId: number | null
): void {


user.id_rol = roleId;

this.successMessage = '';

this.errorMessage = '';


}

// =========================================================
// GUARDAR ROL - PATCH
// =========================================================

saveRole(
user: Usuario
): void {


// Evitamos múltiples solicitudes simultáneas.

if (this.savingUserId !== null) {

  return;

}


// Activamos "Guardando..."

this.savingUserId =
  user.id_usuario;


// Limpiamos mensajes.

this.successMessage = '';

this.errorMessage = '';


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
    // que devuelve Django.

    user.id_rol =
      respuesta.id_rol;


    // Guardamos el nuevo rol como original.

    this.originalRoleIds[
      user.id_usuario
    ] = respuesta.id_rol;


    // Quitamos "Guardando..."

    this.savingUserId = null;


    // Mensaje de éxito.

    this.successMessage =
      `Rol de ${user.nombres} ${user.apellidos} actualizado correctamente.`;


    // ===================================================
    // IMPORTANTE
    // ===================================================
    // Forzamos a Angular a actualizar la vista.
    // Esto hace que el botón deje de mostrar
    // "Guardando..." inmediatamente.

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


    // Restauramos el rol anterior.

    user.id_rol =
      this.originalRoleIds[
        user.id_usuario
      ] ?? null;


    // Quitamos "Guardando..."

    this.savingUserId = null;


    // Mostramos error.

    this.errorMessage =
      'No se pudo actualizar el rol del usuario.';


    // Forzamos actualización visual.

    this.cdr.detectChanges();

  }

});

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


const role =
  this.roles.find(
    (rol) =>
      rol.id_rol === roleId
  );


if (!role) {

  return 'Sin rol asignado';

}


return role.nombre;

}

// =========================================================
// LIMPIAR MENSAJES
// =========================================================

clearMessages(): void {


this.successMessage = '';

this.errorMessage = '';

this.cdr.detectChanges();


}

}

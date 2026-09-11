import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {ChangeDetectorRef,Component,OnInit} from '@angular/core';
import Swal from 'sweetalert2';

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

        // Guardamos todos los usuarios
        this.users = respuesta;

        // Inicialmente mostramos todos
        this.usuariosFiltrados = respuesta;

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

        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los usuarios.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

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

                Swal.fire({
          title: 'Rol actualizado',
          text: `Rol de ${user.nombres} ${user.apellidos} actualizado correctamente.`,
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

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

        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el rol del usuario.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3B5BDB'
        });

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

    const role = this.roles.find(
      (rol) => rol.id_rol === roleId
    );

    if (!role) {
      return 'Sin rol asignado';
    }

    return role.nombre;
  }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RolApi {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

export interface PermisoApi {
  id_permisos: number;
  nombre: string;
  descripcion: string;
}

export interface PermisoRolApi {
  id_permisos_rol?: number;
  id_permisos: number;
  id_rol: number;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl =
    'https://geriapp-web-1.onrender.com/api';

  constructor(
    private readonly http: HttpClient
  ) {}

  // =========================================================
  // ROLES
  // =========================================================

  // LISTAR ROLES
  listarRoles(): Observable<RolApi[]> {
    return this.http.get<RolApi[]>(
      `${this.apiUrl}/roles/`
    );
  }

  // OBTENER UN ROL
  //GET /api/roles/{id}/
  obtenerRol(
    idRol: number
  ): Observable<RolApi> {

    return this.http.get<RolApi>(
      `${this.apiUrl}/roles/${idRol}/`
    );
  }

  // CREAR ROL
  crearRol(
    rol: Omit<RolApi, 'id_rol'>
  ): Observable<RolApi> {

    return this.http.post<RolApi>(
      `${this.apiUrl}/roles/`,
      rol
    );
  }

  // ACTUALIZAR ROL
  //PATCH /api/roles/{id}/
  actualizarRol(
    idRol: number,
    rol: Partial<Omit<RolApi, 'id_rol'>>
  ): Observable<RolApi> {

    return this.http.patch<RolApi>(
      `${this.apiUrl}/roles/${idRol}/`,
      rol
    );
  }

  // ELIMINAR ROL
  //DELETE /api/roles/{id}/
  eliminarRol(
    idRol: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/roles/${idRol}/`
    );
  }
}
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

  listarRoles(): Observable<RolApi[]> {
    return this.http.get<RolApi[]>(
      `${this.apiUrl}/roles/`
    );
  }

  crearRol(
    rol: Omit<RolApi, 'id_rol'>
  ): Observable<RolApi> {

    return this.http.post<RolApi>(
      `${this.apiUrl}/roles/`,
      rol
    );
  }

  // =========================================================
  // PERMISOS
  // =========================================================

  listarPermisos(): Observable<PermisoApi[]> {

    return this.http.get<PermisoApi[]>(
      `${this.apiUrl}/permisos/`
    );
  }

  // =========================================================
  // PERMISOS DEL ROL
  // =========================================================

  listarPermisosRol(
    idRol: number
  ): Observable<PermisoRolApi[]> {

    return this.http.get<PermisoRolApi[]>(
      `${this.apiUrl}/permisos_rol/?id_rol=${idRol}`
    );
  }

  crearPermisoRol(
    relacion: Omit<PermisoRolApi, 'id_permisos_rol'>
  ): Observable<PermisoRolApi> {

    return this.http.post<PermisoRolApi>(
      `${this.apiUrl}/permisos_rol/`,
      relacion
    );
  }

  eliminarPermisoRol(
    idPermisosRol: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/permisos_rol/${idPermisosRol}/`
    );
  }
}
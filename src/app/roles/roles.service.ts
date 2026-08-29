import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RolApi {
  id_rol: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  private apiUrl = 'https://geriapp-web-1.onrender.com/api/roles/';

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<RolApi[]> {
    return this.http.get<RolApi[]>(this.apiUrl);
  }

  crearRol(rol: Omit<RolApi, 'id_rol'>): Observable<RolApi> {
    return this.http.post<RolApi>(this.apiUrl, rol);
  }
}
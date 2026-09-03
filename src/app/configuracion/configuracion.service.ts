
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IUsuario {
  id_usuario?: number;
  nombres?: string;
  apellidos?: string;
  correo?: string;
  telefono?: string;
  tipo_documento?: string;
  numero_documento?: string;
  id_rol?: number;
  estado?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {

  private http = inject(HttpClient);

  private apiUrl =
    'https://geriapp-web-1.onrender.com/api/usuarios/';

  obtenerUsuarios(): Observable<IUsuario[]> {
    return this.http.get<IUsuario[]>(this.apiUrl);
  }

  obtenerUsuario(id: number): Observable<IUsuario> {
    return this.http.get<IUsuario>(
      `${this.apiUrl}${id}/`
    );
  }

  actualizarUsuario(
    id: number,
    datos: Partial<IUsuario>
  ): Observable<IUsuario> {
    return this.http.patch<IUsuario>(
      `${this.apiUrl}${id}/`,
      datos
    );
  }
}
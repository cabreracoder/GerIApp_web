import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'https://geriapp-web-1.onrender.com/api/usuarios';

  constructor(private http: HttpClient) {}

  registrarUsuario(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/registro/`, datos);
  }

  iniciarSesion(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, datos);
  }
}
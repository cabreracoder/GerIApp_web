import { API_URL } from '../config/api.config';
import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  usuario = {
    correo: '',
    contrasena: ''
  };

  mensaje = '';
  error = '';
  cargando = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  iniciarSesion(): void {
    this.mensaje = '';
    this.error = '';

    if (
      !this.usuario.correo.trim() ||
      !this.usuario.contrasena.trim()
    ) {
      Swal.fire({
        title: 'Campos vacíos',
        text: 'Ingresa tu correo y contraseña.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3B5BDB'
      });

      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    this.http.post<any>(
      `${API_URL}/usuarios/login/`,
      {
        correo: this.usuario.correo.trim(),
        contrasena: this.usuario.contrasena
      }
    )
    .pipe(
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    )
    .subscribe({
      next: (respuesta) => {


        if (respuesta.usuario) {
          localStorage.setItem(
            'usuario',
            JSON.stringify(respuesta.usuario)
          );
        }

        this.mensaje =
          respuesta.mensaje ||
          'Has iniciado sesión correctamente.';

        this.cdr.detectChanges();

        Swal.fire({
          title: '¡Bienvenido!',
          text: this.mensaje,
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#3B5BDB'
        }).then(() => {
          this.router.navigate(['/dashboard']);
        });
      },

      error: (respuestaError) => {
        console.log('Error del login:', respuestaError);

        this.error = 'Credenciales inválidas';
        this.cdr.detectChanges();

        Swal.fire({
          title: 'Error',
          text: 'Credenciales inválidas',
          icon: 'error',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#3B5BDB'
        });
      }
    });
  }

  registro(): void {
    this.router.navigate(['/registro']);
  }
}


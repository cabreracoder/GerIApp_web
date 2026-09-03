import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {

    this.mensaje = '';
    this.error = '';

    if (!this.usuario.correo || !this.usuario.contrasena) {
      this.error = 'Ingresa tu correo y contraseña.';
      return;
    }

    this.cargando = true;

    this.authService.iniciarSesion(this.usuario).subscribe({

      next: (respuesta) => {

        this.cargando = false;

        console.log(
          'USUARIO RECIBIDO DEL LOGIN:',
          JSON.stringify(respuesta.usuario, null, 2)
        );

        // Guardamos los datos del usuario
        localStorage.setItem(
          'usuario',
          JSON.stringify(respuesta.usuario)
        );

        this.mensaje = respuesta.mensaje;

        // Ir al Dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },

      error: (error) => {

        this.cargando = false;

        console.error('Error en login:', error);

        if (error.error?.error) {
          this.error = error.error.error;
        } else {
          this.error = 'No fue posible iniciar sesión.';
        }
      }

    });
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class Registro {

  usuario = {
    tipo_documento: '',
    numero_documento: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    contrasena: ''
  };

  mensaje = '';
  error = '';
  cargando = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  registrar(): void {

    this.mensaje = '';
    this.error = '';

    if (
      !this.usuario.tipo_documento ||
      !this.usuario.numero_documento ||
      !this.usuario.nombres ||
      !this.usuario.apellidos ||
      !this.usuario.correo ||
      !this.usuario.contrasena
    ) {
      this.error = 'Por favor completa todos los campos obligatorios.';
      return;
    }

    this.cargando = true;

    this.authService.registrarUsuario(this.usuario).subscribe({

      next: (respuesta) => {
        this.cargando = false;

        this.mensaje = respuesta.mensaje;

        console.log('Usuario registrado:', respuesta);

        // Después de registrarse, ir al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: (error) => {
        this.cargando = false;

        console.error('Error en registro:', error);

        if (error.error?.correo) {
          this.error = error.error.correo[0];
        } else if (error.error?.numero_documento) {
          this.error = error.error.numero_documento[0];
        } else if (error.error?.error) {
          this.error = error.error.error;
        } else {
          this.error = 'No fue posible registrar el usuario.';
        }
      }

    });
  }
}
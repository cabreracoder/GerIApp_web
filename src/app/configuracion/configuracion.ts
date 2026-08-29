import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
selector: 'app-configuracion',
standalone: true,
imports: [FormsModule],
templateUrl: './configuracion.html',
styleUrl: './configuracion.css'
})
export class Configuracion {

// =====================================================
// DATOS DEL ADMINISTRADOR
// =====================================================

nombreUsuario: string = '';
correoUsuario: string = '';
telefonoUsuario: string = '';
cargoUsuario: string = '';
inicialesUsuario: string = '';

// =====================================================
// PREFERENCIAS DE NOTIFICACIONES
// =====================================================

notificacionesCorreo: boolean = true;
notificacionesSms: boolean = false;
alertasCriticas: boolean = true;

// =====================================================
// GUARDAR PERFIL
// =====================================================

guardarCambios(): void {


// Aquí posteriormente se enviarán
// los datos actualizados a la API.


}

// =====================================================
// ACTUALIZAR CONTRASEÑA
// =====================================================

actualizarContrasena(): void {

// Aquí posteriormente se conectará
// la actualización de contraseña con la API.


}

// =====================================================
// CAMBIAR FOTO
// =====================================================

cambiarFoto(): void {


// Aquí posteriormente se agregará
// la selección y actualización de la foto.


}

}

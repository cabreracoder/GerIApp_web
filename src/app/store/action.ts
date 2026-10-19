
import { createAction, props } from '@ngrx/store';

export interface UsuarioSesion {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  id_rol: number;
  rol?: string | null;
  estado?: boolean;
  foto?: string | null;
}

export const iniciarSesion = createAction(
  '[Autenticación] Iniciar sesión',
  props<{ usuario: UsuarioSesion }>()
);

export const cerrarSesion = createAction(
  '[Autenticación] Cerrar sesión'
);

export const restaurarSesion = createAction(
  '[Autenticación] Restaurar sesión',
  props<{ usuario: UsuarioSesion }>()
);

export const actualizarUsuario = createAction(
  '[Autenticación] Actualizar usuario',
  props<{ usuario: UsuarioSesion }>()
);
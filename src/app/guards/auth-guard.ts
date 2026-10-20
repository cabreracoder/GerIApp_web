
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  cerrarSesion,
  restaurarSesion,
  UsuarioSesion
} from '../store/action';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const store = inject(Store);

  const usuarioGuardado = localStorage.getItem('usuario');

  if (!usuarioGuardado) {
    store.dispatch(cerrarSesion());
    return router.createUrlTree(['/login']);
  }

  try {
    const usuario = JSON.parse(usuarioGuardado) as UsuarioSesion;

    if (!usuario || usuario.id_usuario == null) {
      throw new Error('Los datos del usuario no son válidos.');
    }

    store.dispatch(
      restaurarSesion({ usuario })
    );

    return true;
  } catch {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');

    store.dispatch(cerrarSesion());

    return router.createUrlTree(['/login']);
  }
};

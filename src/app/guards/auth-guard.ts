import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {

  const router = inject(Router);
  const usuario = localStorage.getItem('usuario');

  if (usuario) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
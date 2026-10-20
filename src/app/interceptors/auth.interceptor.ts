
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = 'https://geriapp-backend.onrender.com/api';

  // Solo adjuntamos el token a peticiones del backend de GerIApp.
  if (!req.url.startsWith(apiUrl)) {
    return next(req);
  }

  // Estas operaciones deben funcionar sin una sesión iniciada.
  const rutasPublicas = [
    '/usuarios/login/',
    '/auth/login-google/',
    '/usuarios/registro/',
    '/usuarios/recuperar-password/',
    '/usuarios/verificar-codigo/',
    '/usuarios/cambiar-password-recuperacion/',
  ];

  const esRutaPublica = rutasPublicas.some(ruta =>
    req.url.includes(ruta)
  );

  if (esRutaPublica) {
    return next(req);
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return next(req);
  }

  const solicitudAutenticada = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(solicitudAutenticada);
};

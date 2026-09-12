import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard';
import { Pacientes } from './pacientes/pacientes';
import { Cuidadores } from './cuidadores/cuidadores';
import { Roles } from './roles/roles';
import { Notificaciones } from './notificaciones/notificaciones';
import { Configuracion } from './configuracion/configuracion';
import { Encargados } from './encargados/encargados';
import { Login } from './login/login';
import { Registro } from './registro/registro';
import { Usuarios } from './usuarios/usuarios';
import { ElementosPaciente } from './elementos-paciente/elementos-paciente';
import { BancoDatos } from './banco-datos/banco-datos';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [

  // =========================
  // RUTAS PÚBLICAS
  // =========================

  {
    path: 'login',
    component: Login
  },

  {
    path: 'registro',
    component: Registro
  },

  // =========================
  // RUTAS DEL SISTEMA
  // =========================

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [

      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'usuarios',
        component: Usuarios

      },

      {
        path: 'pacientes',
        component: Pacientes
      },

      {
        path: 'cuidadores',
        component: Cuidadores
      },

      {
        path: 'encargados',
        component: Encargados
      },

      {
        path: 'roles',
        component: Roles
      },

      {
        path: 'notificaciones',
        component: Notificaciones
      },

      {
        path: 'configuracion',
        component: Configuracion
      },

      {
        
        path: 'elementos-paciente/:id',
        loadComponent: () =>
        import('./elementos-paciente/elementos-paciente')
            .then(m => m.ElementosPaciente)

      },

      {
        path: 'banco-datos',
        component: BancoDatos
      },


    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];
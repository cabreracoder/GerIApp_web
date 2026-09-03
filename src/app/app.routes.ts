import { Routes } from '@angular/router';
import { Layout } from './layout/layout';
import { DashboardComponent } from './dashboard/dashboard';
import { Pacientes } from './pacientes/pacientes';
import { Cuidadores } from './cuidadores/cuidadores'
import { Roles } from './roles/roles';
import { Notificaciones } from './notificaciones/notificaciones';
import { Configuracion } from './configuracion/configuracion';
import { Encargados } from './encargados/encargados';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
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
      }

    ]
  },

  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
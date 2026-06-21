import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guard';

const staffOnly = roleGuard(['tecnico', 'admin']);

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'tickets',
        loadComponent: () => import('./features/tickets/ticket-list').then((m) => m.TicketList),
      },
      {
        path: 'tickets/:id',
        loadComponent: () => import('./features/tickets/ticket-detail').then((m) => m.TicketDetail),
      },
      {
        path: 'usuarios',
        canActivate: [staffOnly],
        loadComponent: () => import('./features/usuarios/usuario-list').then((m) => m.UsuarioList),
      },
      {
        path: 'categorias',
        canActivate: [staffOnly],
        loadComponent: () =>
          import('./features/categorias/categoria-list').then((m) => m.CategoriaList),
      },
      {
        path: 'responsaveis',
        canActivate: [staffOnly],
        loadComponent: () =>
          import('./features/responsaveis/responsavel-list').then((m) => m.ResponsavelList),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

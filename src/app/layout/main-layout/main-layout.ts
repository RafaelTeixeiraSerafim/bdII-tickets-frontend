import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastHost } from '../../shared/toast/toast-host';

interface NavItem {
  path: string;
  label: string;
  icon: string;
  /** When true, only technicians/admins see the item. */
  staffOnly?: boolean;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastHost],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly sidebarOpen = signal(true);
  readonly menuOpen = signal(false);
  readonly user = this.auth.currentUser;
  readonly initials = computed(() => {
    const name = this.user()?.nome ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  });

  private readonly allNav: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/tickets', label: 'Tickets', icon: 'confirmation_number' },
    { path: '/usuarios', label: 'Usuários', icon: 'group', staffOnly: true },
    { path: '/categorias', label: 'Categorias', icon: 'category', staffOnly: true },
    { path: '/responsaveis', label: 'Responsáveis', icon: 'engineering', staffOnly: true },
  ];

  readonly nav = computed(() => this.allNav.filter((i) => !i.staffOnly || this.auth.isStaff()));

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

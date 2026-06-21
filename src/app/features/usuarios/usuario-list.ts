import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Usuario, roleMeta } from '../../core/models';
import { UsuarioService } from '../../core/services/usuario.service';
import { EntityListPage } from '../../shared/entity-list-page';
import { ListToolbar } from '../../shared/ui/list-toolbar';
import { Paginator } from '../../shared/ui/paginator';
import { UsuarioForm } from './usuario-form';

@Component({
  selector: 'app-usuario-list',
  imports: [DatePipe, ListToolbar, Paginator],
  templateUrl: './usuario-list.html',
})
export class UsuarioList extends EntityListPage<Usuario> {
  protected readonly service = inject(UsuarioService);
  protected readonly formComponent = UsuarioForm;
  protected override readonly entityLabel = 'usuário';
  private auth = inject(AuthService);
  readonly roleMeta = roleMeta;

  /** Admins manage anyone; technicians only client accounts. */
  canManage(u: Usuario): boolean {
    return this.auth.isAdmin() || u.role === 'cliente';
  }
}

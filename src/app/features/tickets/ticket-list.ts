import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  PRIORIDADE_OPTIONS,
  Responsavel,
  STATUS_OPTIONS,
  Ticket,
  prioridadeMeta,
  statusMeta,
} from '../../core/models';
import { ResponsavelService } from '../../core/services/responsavel.service';
import { TicketService } from '../../core/services/ticket.service';
import { EntityListPage } from '../../shared/entity-list-page';
import { ListToolbar } from '../../shared/ui/list-toolbar';
import { Paginator } from '../../shared/ui/paginator';
import { TicketForm } from './ticket-form';

@Component({
  selector: 'app-ticket-list',
  imports: [DatePipe, RouterLink, ListToolbar, Paginator],
  templateUrl: './ticket-list.html',
})
export class TicketList extends EntityListPage<Ticket> {
  protected readonly service = inject(TicketService);
  protected readonly formComponent = TicketForm;
  protected override readonly entityLabel = 'ticket';
  private auth = inject(AuthService);
  private responsavelService = inject(ResponsavelService);

  readonly statusOptions = STATUS_OPTIONS;
  readonly prioridadeOptions = PRIORIDADE_OPTIONS;
  readonly statusMeta = statusMeta;
  readonly prioridadeMeta = prioridadeMeta;
  /** Clients only manage their own tickets and can't edit/delete them. */
  readonly isStaff = this.auth.isStaff();
  readonly responsaveis = signal<Responsavel[]>([]);

  readonly statusFilter = signal('');
  readonly prioridadeFilter = signal('');
  readonly responsavelFilter = signal('');

  constructor() {
    super();
    if (this.isStaff) {
      this.responsavelService.list().subscribe((r) => this.responsaveis.set(r));
    }
  }

  protected override searchText(t: Ticket): string {
    return `${t.titulo} ${t.descricao} ${t.usuario?.nome ?? ''} ${t.categoria?.nome ?? ''} ${
      t.responsavel?.usuario?.nome ?? ''
    }`;
  }

  protected override extraFilter(t: Ticket): boolean {
    // Clients only see tickets they created.
    if (!this.isStaff && t.usuario_id !== this.auth.userId()) {
      return false;
    }
    const s = this.statusFilter();
    const p = this.prioridadeFilter();
    const r = this.responsavelFilter();
    if (r === 'none' && t.responsavel_id != null) return false;
    if (r && r !== 'none' && t.responsavel_id !== Number(r)) return false;
    return (!s || t.status === s) && (!p || t.prioridade === p);
  }

  setStatus(value: string): void {
    this.statusFilter.set(value);
    this.page.set(0);
  }

  setPrioridade(value: string): void {
    this.prioridadeFilter.set(value);
    this.page.set(0);
  }

  setResponsavel(value: string): void {
    this.responsavelFilter.set(value);
    this.page.set(0);
  }
}

import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  PRIORIDADE_OPTIONS,
  STATUS_OPTIONS,
  Ticket,
  prioridadeMeta,
  statusMeta,
} from '../../core/models';
import { TicketService } from '../../core/services/ticket.service';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private ticketService = inject(TicketService);
  private auth = inject(AuthService);

  readonly statusMeta = statusMeta;
  readonly prioridadeMeta = prioridadeMeta;
  readonly statusOptions = STATUS_OPTIONS;
  readonly prioridadeOptions = PRIORIDADE_OPTIONS;

  readonly tickets = signal<Ticket[]>([]);
  readonly loading = signal(true);

  readonly total = computed(() => this.tickets().length);

  readonly openCount = computed(
    () => this.tickets().filter((t) => t.status === 'aberto' || t.status === 'em_atendimento').length,
  );
  readonly resolvedCount = computed(
    () => this.tickets().filter((t) => t.status === 'resolvido' || t.status === 'fechado').length,
  );
  readonly criticalCount = computed(
    () => this.tickets().filter((t) => t.prioridade === 'critica').length,
  );

  readonly byStatus = computed(() =>
    this.statusOptions.map((opt) => ({
      ...opt,
      count: this.tickets().filter((t) => t.status === opt.value).length,
    })),
  );
  readonly byPrioridade = computed(() =>
    this.prioridadeOptions.map((opt) => ({
      ...opt,
      count: this.tickets().filter((t) => t.prioridade === opt.value).length,
    })),
  );

  readonly recent = computed(() =>
    [...this.tickets()]
      .sort((a, b) => +new Date(b.criado_em) - +new Date(a.criado_em))
      .slice(0, 8),
  );

  constructor() {
    this.ticketService.list().subscribe({
      next: (rows) => {
        // Clients only see stats for their own tickets.
        const own = this.auth.isStaff()
          ? rows
          : rows.filter((t) => t.usuario_id === this.auth.userId());
        this.tickets.set(own);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  pct(count: number): number {
    return this.total() ? Math.round((count / this.total()) * 100) : 0;
  }
}

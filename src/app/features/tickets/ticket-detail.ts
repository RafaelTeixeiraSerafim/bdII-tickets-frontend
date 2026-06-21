import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { Arquivo, Comentario, Ticket, prioridadeMeta, statusMeta } from '../../core/models';
import { ArquivoService } from '../../core/services/arquivo.service';
import { ComentarioService } from '../../core/services/comentario.service';
import { TicketService } from '../../core/services/ticket.service';
import { ConfirmDialog, ConfirmData } from '../../shared/confirm-dialog/confirm-dialog';
import { DialogService } from '../../shared/dialog/dialog.service';
import { formatBytes } from '../../shared/format';
import { ToastService } from '../../shared/toast/toast.service';
import { ComentarioForm } from '../comentarios/comentario-form';
import { TicketForm } from './ticket-form';

@Component({
  selector: 'app-ticket-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './ticket-detail.html',
})
export class TicketDetail {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private comentarioService = inject(ComentarioService);
  private arquivoService = inject(ArquivoService);
  private dialog = inject(DialogService);
  private toast = inject(ToastService);
  private auth = inject(AuthService);

  readonly statusMeta = statusMeta;
  readonly prioridadeMeta = prioridadeMeta;
  readonly formatBytes = formatBytes;
  readonly isStaff = this.auth.isStaff();

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly ticket = signal<Ticket | null>(null);
  readonly comentarios = signal<Comentario[]>([]);
  readonly arquivos = signal<Arquivo[]>([]);
  readonly loading = signal(true);

  /**
   * Files shown in the sidebar. Clients must not see attachments that belong to
   * internal comments — `comentarios()` is already internal-filtered for them,
   * so any file whose comment isn't visible (and isn't a ticket-level file) is hidden.
   */
  readonly visibleArquivos = computed(() => {
    const files = this.arquivos();
    if (this.isStaff) {
      return files;
    }
    const visibleCommentIds = new Set(this.comentarios().map((c) => c.id));
    return files.filter((a) => a.comentario_id == null || visibleCommentIds.has(a.comentario_id));
  });

  constructor() {
    this.loadTicket();
    this.loadComentarios();
    this.loadArquivos();
  }

  private loadTicket(): void {
    this.loading.set(true);
    this.ticketService.get(this.id).subscribe({
      next: (t) => {
        // Clients may only view their own tickets.
        if (!this.isStaff && t.usuario_id !== this.auth.userId()) {
          this.toast.error('Você não tem acesso a este ticket.');
          this.router.navigate(['/tickets']);
          return;
        }
        this.ticket.set(t);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private loadComentarios(): void {
    this.comentarioService.byTicket(this.id).subscribe((c) =>
      // Clients don't see internal comments.
      this.comentarios.set(this.isStaff ? c : c.filter((x) => !x.interno)),
    );
  }

  private loadArquivos(): void {
    this.arquivoService.byTicket(this.id).subscribe((a) => this.arquivos.set(a));
  }

  editTicket(): void {
    this.dialog
      .open<Ticket>(TicketForm, { entity: this.ticket() })
      .afterClosed()
      .subscribe((r) => {
        if (r) {
          this.ticket.set(r);
          this.toast.success('Ticket atualizado.');
        }
      });
  }

  addComentario(): void {
    this.dialog
      .open<Comentario>(ComentarioForm, { ticketId: this.id })
      .afterClosed()
      .subscribe((r) => {
        if (r) {
          this.loadComentarios();
          // A comment may carry an attachment, so refresh files too.
          this.loadArquivos();
          this.toast.success('Comentário adicionado.');
        }
      });
  }

  /** Files attached to a specific comment. */
  arquivosDoComentario(comentarioId: number): Arquivo[] {
    return this.arquivos().filter((a) => a.comentario_id === comentarioId);
  }

  deleteComentario(c: Comentario): void {
    const data: ConfirmData = {
      title: 'Excluir comentário',
      message: 'Tem certeza que deseja excluir este comentário?',
      confirmText: 'Excluir',
      danger: true,
    };
    this.dialog
      .open<boolean>(ConfirmDialog, data)
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.comentarioService.remove(c.id).subscribe(() => this.loadComentarios());
        }
      });
  }
}

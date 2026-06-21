import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, map, of, switchMap } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { Comentario, Ticket, Usuario } from '../../core/models';
import { ArquivoService } from '../../core/services/arquivo.service';
import { ComentarioService } from '../../core/services/comentario.service';
import { TicketService } from '../../core/services/ticket.service';
import { UploadService } from '../../core/services/upload.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { DIALOG_DATA, DialogRef } from '../../shared/dialog/dialog-ref';
import { DialogShell } from '../../shared/dialog/dialog-shell';
import { formatBytes } from '../../shared/format';

@Component({
  selector: 'app-comentario-form',
  imports: [ReactiveFormsModule, DialogShell],
  template: `
    <app-dialog-shell (dismiss)="ref.close()">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ editing ? 'Editar comentário' : 'Novo comentário' }}
          </h2>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="label required">Conteúdo</label>
            <textarea class="input" formControlName="conteudo" rows="4"></textarea>
            @if (form.controls.conteudo.touched && form.controls.conteudo.invalid) {
              <p class="field-error">Conteúdo é obrigatório.</p>
            }
          </div>

          @if (!lockTicket) {
            <div>
              <label class="label required">Ticket</label>
              <select class="input" formControlName="ticket_id">
                <option [ngValue]="null" disabled>Selecione...</option>
                @for (t of tickets(); track t.id) {
                  <option [ngValue]="t.id">#{{ t.id }} — {{ t.titulo }}</option>
                }
              </select>
              @if (form.controls.ticket_id.touched && form.controls.ticket_id.invalid) {
                <p class="field-error">Selecione um ticket.</p>
              }
            </div>
          }

          @if (canChooseAuthor) {
            <div>
              <label class="label required">Autor</label>
              <select class="input" formControlName="usuario_id">
                <option [ngValue]="null" disabled>Selecione...</option>
                @for (u of usuarios(); track u.id) {
                  <option [ngValue]="u.id">{{ u.nome }}</option>
                }
              </select>
              @if (form.controls.usuario_id.touched && form.controls.usuario_id.invalid) {
                <p class="field-error">Selecione o autor.</p>
              }
            </div>
          }

          <!-- File attachment -->
          <div>
            <label class="label">Anexo (opcional)</label>
            <input #fileInput type="file" class="hidden" (change)="onFile($event)" />
            @if (selectedFile(); as f) {
              <div class="flex items-center gap-2 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <span class="material-icons mi-20 text-slate-400">attach_file</span>
                <span class="flex-1 truncate text-slate-700">{{ f.name }}</span>
                <span class="text-xs text-slate-400">{{ fmtBytes(f.size) }}</span>
                <button type="button" class="text-slate-400 hover:text-rose-600" (click)="clearFile(fileInput)">
                  <span class="material-icons mi-18">close</span>
                </button>
              </div>
            } @else {
              <button type="button" class="btn btn-secondary w-full" (click)="fileInput.click()">
                <span class="material-icons mi-20">upload_file</span> Escolher arquivo
              </button>
            }
          </div>

          @if (canPostInternal) {
            <label class="inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" formControlName="interno" class="sr-only peer" />
              <span class="toggle-track"></span>
              <span class="text-sm text-slate-600">Comentário interno</span>
            </label>
          }
        </div>

        <div class="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" class="btn btn-secondary" (click)="ref.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) { <span class="spinner"></span> } @else { Salvar }
          </button>
        </div>
      </form>
    </app-dialog-shell>
  `,
})
export class ComentarioForm {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(ComentarioService);
  private usuarioService = inject(UsuarioService);
  private ticketService = inject(TicketService);
  private arquivoService = inject(ArquivoService);
  private uploadService = inject(UploadService);
  private auth = inject(AuthService);
  readonly ref = inject<DialogRef<Comentario>>(DialogRef);
  private data = inject<{ entity?: Comentario; ticketId?: number }>(DIALOG_DATA);

  readonly editing = !!this.data?.entity;
  readonly lockTicket = !!this.data?.ticketId;
  /** Only admins post on behalf of another user; everyone else authors as themselves. */
  readonly canChooseAuthor = this.auth.isAdmin();
  /** Technicians and admins may flag a comment as internal. */
  readonly canPostInternal = this.auth.isStaff();
  readonly saving = signal(false);
  readonly usuarios = signal<Usuario[]>([]);
  readonly tickets = signal<Ticket[]>([]);
  readonly selectedFile = signal<File | null>(null);
  readonly fmtBytes = formatBytes;

  readonly form = this.fb.group({
    conteudo: ['', [Validators.required]],
    ticket_id: [null as number | null, [Validators.required]],
    usuario_id: [null as number | null, [Validators.required]],
    interno: [false],
  });

  constructor() {
    if (this.canChooseAuthor) {
      this.usuarioService.list().subscribe((u) => this.usuarios.set(u));
    } else {
      // Client: author is fixed to the logged-in user.
      this.form.patchValue({ usuario_id: this.auth.userId() });
    }
    if (!this.lockTicket) {
      this.ticketService.list().subscribe((t) => this.tickets.set(t));
    }
    const e = this.data?.entity;
    if (e) {
      this.form.patchValue({
        conteudo: e.conteudo,
        ticket_id: e.ticket_id,
        usuario_id: e.usuario_id,
        interno: e.interno,
      });
    } else if (this.data?.ticketId) {
      this.form.patchValue({ ticket_id: this.data.ticketId });
    }
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  clearFile(input: HTMLInputElement): void {
    this.selectedFile.set(null);
    input.value = '';
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload: Partial<Comentario> = {
      conteudo: v.conteudo,
      ticket_id: v.ticket_id!,
      usuario_id: v.usuario_id!,
      interno: this.canPostInternal ? v.interno : false,
    };

    const save$ = this.editing
      ? this.service.update(this.data.entity!.id, payload)
      : this.service.create(payload);

    save$
      .pipe(switchMap((comment) => this.attachFile(comment)))
      .subscribe({
        next: (comment) => this.ref.close(comment),
        error: () => this.saving.set(false),
      });
  }

  /** After saving the comment, upload the chosen file (if any) and link it. */
  private attachFile(comment: Comentario): Observable<Comentario> {
    const file = this.selectedFile();
    if (!file) {
      return of(comment);
    }
    return this.uploadService.upload(file).pipe(
      switchMap((meta) =>
        this.arquivoService
          .create({
            nome_original: meta.nome_original,
            uri: meta.uri,
            tipo_mime: meta.tipo_mime || null,
            tamanho_bytes: meta.tamanho_bytes || null,
            comentario_id: comment.id,
            ticket_id: comment.ticket_id,
          })
          .pipe(map(() => comment)),
      ),
    );
  }
}

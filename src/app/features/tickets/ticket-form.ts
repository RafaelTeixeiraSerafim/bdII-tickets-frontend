import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import {
  Categoria,
  PRIORIDADE_OPTIONS,
  Responsavel,
  STATUS_OPTIONS,
  Ticket,
  Usuario,
} from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { ResponsavelService } from '../../core/services/responsavel.service';
import { TicketService } from '../../core/services/ticket.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { DIALOG_DATA, DialogRef } from '../../shared/dialog/dialog-ref';
import { DialogShell } from '../../shared/dialog/dialog-shell';

@Component({
  selector: 'app-ticket-form',
  imports: [ReactiveFormsModule, DialogShell],
  template: `
    <app-dialog-shell maxWidth="38rem" (dismiss)="ref.close()">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ editing ? 'Editar ticket' : 'Novo ticket' }}
          </h2>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="label required">Título</label>
            <input class="input" formControlName="titulo" maxlength="200" />
            @if (form.controls.titulo.touched && form.controls.titulo.invalid) {
              <p class="field-error">Informe um título (3–200 caracteres).</p>
            }
          </div>
          <div>
            <label class="label required">Descrição</label>
            <textarea class="input" formControlName="descricao" rows="4"></textarea>
            @if (form.controls.descricao.touched && form.controls.descricao.invalid) {
              <p class="field-error">Descrição obrigatória (mínimo 5 caracteres).</p>
            }
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="label">Prioridade</label>
              <select class="input" formControlName="prioridade">
                @for (opt of prioridadeOptions; track opt.value) {
                  <option [ngValue]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>
            @if (isStaff) {
              <div class="flex-1">
                <label class="label">Status</label>
                <select class="input" formControlName="status">
                  @for (opt of statusOptions; track opt.value) {
                    <option [ngValue]="opt.value">{{ opt.label }}</option>
                  }
                </select>
              </div>
            }
          </div>

          @if (isStaff) {
            <div>
              <label class="label required">Solicitante</label>
              <select class="input" formControlName="usuario_id">
                <option [ngValue]="null" disabled>Selecione...</option>
                @for (u of usuarios(); track u.id) {
                  <option [ngValue]="u.id">{{ u.nome }}</option>
                }
              </select>
              @if (form.controls.usuario_id.touched && form.controls.usuario_id.invalid) {
                <p class="field-error">Selecione o solicitante.</p>
              }
            </div>
          }

          <div class="flex gap-4">
            <div class="flex-1">
              <label class="label">Categoria</label>
              <select class="input" formControlName="categoria_id">
                <option [ngValue]="null">— Nenhuma —</option>
                @for (c of categorias(); track c.id) {
                  <option [ngValue]="c.id">{{ c.nome }}</option>
                }
              </select>
            </div>
            @if (isStaff) {
              <div class="flex-1">
                <label class="label">Responsável</label>
                <select class="input" formControlName="responsavel_id">
                  <option [ngValue]="null">— Nenhum —</option>
                  @for (r of responsaveis(); track r.id) {
                    <option [ngValue]="r.id">{{ r.cargo }} — {{ r.usuario?.nome }}</option>
                  }
                </select>
              </div>
            }
          </div>
        </div>

        <div class="px-6 py-3 border-t border-slate-100 flex justify-end gap-2">
          <button type="button" class="btn btn-secondary" (click)="ref.close()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">Salvar</button>
        </div>
      </form>
    </app-dialog-shell>
  `,
})
export class TicketForm {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(TicketService);
  private usuarioService = inject(UsuarioService);
  private categoriaService = inject(CategoriaService);
  private responsavelService = inject(ResponsavelService);
  private auth = inject(AuthService);
  readonly ref = inject<DialogRef<Ticket>>(DialogRef);
  private data = inject<{ entity?: Ticket }>(DIALOG_DATA);

  readonly statusOptions = STATUS_OPTIONS;
  readonly prioridadeOptions = PRIORIDADE_OPTIONS;
  /** Clients can't set solicitante/responsável/status. */
  readonly isStaff = this.auth.isStaff();
  readonly editing = !!this.data?.entity;
  readonly saving = signal(false);
  readonly usuarios = signal<Usuario[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly responsaveis = signal<Responsavel[]>([]);

  readonly form = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    descricao: ['', [Validators.required, Validators.minLength(5)]],
    status: ['aberto' as Ticket['status']],
    prioridade: ['media' as Ticket['prioridade']],
    usuario_id: [null as number | null, [Validators.required]],
    categoria_id: [null as number | null],
    responsavel_id: [null as number | null],
  });

  constructor() {
    this.categoriaService.list().subscribe((c) => this.categorias.set(c));
    if (this.isStaff) {
      this.usuarioService.list().subscribe((u) => this.usuarios.set(u));
      this.responsavelService.list().subscribe((r) => this.responsaveis.set(r));
    } else {
      // Client: solicitante is the logged-in user; new tickets open as "aberto".
      this.form.patchValue({ usuario_id: this.auth.userId(), status: 'aberto' });
    }

    const e = this.data?.entity;
    if (e) {
      this.form.patchValue({
        titulo: e.titulo,
        descricao: e.descricao,
        status: e.status,
        prioridade: e.prioridade,
        usuario_id: e.usuario_id,
        categoria_id: e.categoria_id ?? null,
        responsavel_id: e.responsavel_id ?? null,
      });
    }
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload: Partial<Ticket> = {
      titulo: v.titulo,
      descricao: v.descricao,
      // Clients can't change status/responsável; force safe values on create.
      status: this.isStaff ? v.status : this.editing ? v.status : 'aberto',
      prioridade: v.prioridade,
      usuario_id: this.isStaff ? v.usuario_id! : this.auth.userId()!,
      categoria_id: v.categoria_id ?? null,
      responsavel_id: this.isStaff ? (v.responsavel_id ?? null) : null,
    };
    const req = this.editing
      ? this.service.update(this.data.entity!.id, payload)
      : this.service.create(payload);
    req.subscribe({
      next: (saved) => this.ref.close(saved),
      error: () => this.saving.set(false),
    });
  }
}

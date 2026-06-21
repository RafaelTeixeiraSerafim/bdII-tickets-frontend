import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { ROLE_OPTIONS, Usuario } from '../../core/models';
import { UsuarioService } from '../../core/services/usuario.service';
import { DIALOG_DATA, DialogRef } from '../../shared/dialog/dialog-ref';
import { DialogShell } from '../../shared/dialog/dialog-shell';

@Component({
  selector: 'app-usuario-form',
  imports: [ReactiveFormsModule, DialogShell],
  template: `
    <app-dialog-shell (dismiss)="ref.close()">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ editing ? 'Editar usuário' : 'Novo usuário' }}
          </h2>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="label required">Nome</label>
            <input class="input" formControlName="nome" maxlength="120" />
            @if (form.controls.nome.touched && form.controls.nome.invalid) {
              <p class="field-error">Informe um nome (2–120 caracteres).</p>
            }
          </div>
          <div>
            <label class="label required">E-mail</label>
            <input class="input" type="email" formControlName="email" maxlength="150" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="field-error">Informe um e-mail válido.</p>
            }
          </div>
          <div>
            <label class="label">Telefone</label>
            <input class="input" formControlName="telefone" maxlength="20" />
          </div>
          <div>
            <label class="label" [class.required]="!editing">{{ editing ? 'Nova senha (opcional)' : 'Senha' }}</label>
            <input class="input" type="password" formControlName="senha" autocomplete="new-password" />
            @if (form.controls.senha.touched && form.controls.senha.invalid) {
              <p class="field-error">Mínimo de 6 caracteres.</p>
            }
          </div>
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="label">Perfil</label>
              <select class="input" formControlName="role">
                @for (opt of roleOptions; track opt.value) {
                  <option [ngValue]="opt.value">{{ opt.label }}</option>
                }
              </select>
            </div>
            <div class="flex-1">
              <label class="label">Status</label>
              <label class="inline-flex items-center gap-2 cursor-pointer h-10">
                <input type="checkbox" formControlName="ativo" class="sr-only peer" />
                <span class="toggle-track"></span>
                <span class="text-sm text-slate-600">Ativo</span>
              </label>
            </div>
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
export class UsuarioForm {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(UsuarioService);
  private auth = inject(AuthService);
  readonly ref = inject<DialogRef<Usuario>>(DialogRef);
  private data = inject<{ entity?: Usuario }>(DIALOG_DATA);

  // Technicians may only create/manage client accounts.
  readonly roleOptions = this.auth.isAdmin()
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter((o) => o.value === 'cliente');
  readonly editing = !!this.data?.entity;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefone: [''],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    role: ['cliente' as Usuario['role']],
    ativo: [true],
  });

  constructor() {
    const e = this.data?.entity;
    if (e) {
      this.form.patchValue({
        nome: e.nome,
        email: e.email,
        telefone: e.telefone ?? '',
        role: e.role,
        ativo: e.ativo,
      });
      this.form.controls.senha.removeValidators(Validators.required);
      this.form.controls.senha.updateValueAndValidity();
    }
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const v = this.form.getRawValue();
    const payload: Partial<Usuario> = {
      nome: v.nome,
      email: v.email,
      telefone: v.telefone || null,
      role: v.role,
      ativo: v.ativo,
    };
    if (v.senha) {
      payload.senha_hash = v.senha;
    }
    const req = this.editing
      ? this.service.update(this.data.entity!.id, payload)
      : this.service.create(payload);
    req.subscribe({
      next: (saved) => this.ref.close(saved),
      error: () => this.saving.set(false),
    });
  }
}

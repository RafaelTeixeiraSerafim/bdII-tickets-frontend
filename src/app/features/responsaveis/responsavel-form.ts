import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Responsavel, Usuario } from '../../core/models';
import { ResponsavelService } from '../../core/services/responsavel.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { DIALOG_DATA, DialogRef } from '../../shared/dialog/dialog-ref';
import { DialogShell } from '../../shared/dialog/dialog-shell';

@Component({
  selector: 'app-responsavel-form',
  imports: [ReactiveFormsModule, DialogShell],
  template: `
    <app-dialog-shell (dismiss)="ref.close()">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ editing ? 'Editar responsável' : 'Novo responsável' }}
          </h2>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="label required">Cargo</label>
            <input class="input" formControlName="cargo" maxlength="80" />
            @if (form.controls.cargo.touched && form.controls.cargo.invalid) {
              <p class="field-error">Informe um cargo (2–80 caracteres).</p>
            }
          </div>
          <div>
            <label class="label">Especialidade</label>
            <input class="input" formControlName="especialidade" maxlength="120" />
          </div>
          <div>
            <label class="label required">Usuário</label>
            <select class="input" formControlName="usuario_id">
              <option [ngValue]="null" disabled>Selecione...</option>
              @for (u of usuarios(); track u.id) {
                <option [ngValue]="u.id">{{ u.nome }} ({{ u.email }})</option>
              }
            </select>
            @if (form.controls.usuario_id.touched && form.controls.usuario_id.invalid) {
              <p class="field-error">Selecione um usuário.</p>
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
export class ResponsavelForm {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(ResponsavelService);
  private usuarioService = inject(UsuarioService);
  readonly ref = inject<DialogRef<Responsavel>>(DialogRef);
  private data = inject<{ entity?: Responsavel }>(DIALOG_DATA);

  readonly editing = !!this.data?.entity;
  readonly saving = signal(false);
  readonly usuarios = signal<Usuario[]>([]);

  readonly form = this.fb.group({
    cargo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    especialidade: [''],
    usuario_id: [null as number | null, [Validators.required]],
  });

  constructor() {
    // Only técnicos/admins can be responsáveis — clients are not eligible.
    this.usuarioService
      .list()
      .subscribe((u) => this.usuarios.set(u.filter((x) => x.role !== 'cliente')));
    const e = this.data?.entity;
    if (e) {
      this.form.patchValue({
        cargo: e.cargo,
        especialidade: e.especialidade ?? '',
        usuario_id: e.usuario_id,
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
    const payload: Partial<Responsavel> = {
      cargo: v.cargo,
      especialidade: v.especialidade || null,
      usuario_id: v.usuario_id!,
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

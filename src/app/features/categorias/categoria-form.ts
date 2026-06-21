import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { DIALOG_DATA, DialogRef } from '../../shared/dialog/dialog-ref';
import { DialogShell } from '../../shared/dialog/dialog-shell';

@Component({
  selector: 'app-categoria-form',
  imports: [ReactiveFormsModule, DialogShell],
  template: `
    <app-dialog-shell (dismiss)="ref.close()">
      <form [formGroup]="form" (ngSubmit)="save()">
        <div class="px-6 pt-5 pb-3 border-b border-slate-100">
          <h2 class="text-lg font-semibold text-slate-800">
            {{ editing ? 'Editar categoria' : 'Nova categoria' }}
          </h2>
        </div>

        <div class="px-6 py-4 space-y-4">
          <div>
            <label class="label required">Nome</label>
            <input class="input" formControlName="nome" maxlength="80" />
            @if (form.controls.nome.touched && form.controls.nome.invalid) {
              <p class="field-error">Informe um nome (2–80 caracteres).</p>
            }
          </div>
          <div>
            <label class="label">Descrição</label>
            <textarea class="input" formControlName="descricao" rows="3"></textarea>
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
export class CategoriaForm {
  private fb = inject(NonNullableFormBuilder);
  private service = inject(CategoriaService);
  readonly ref = inject<DialogRef<Categoria>>(DialogRef);
  private data = inject<{ entity?: Categoria }>(DIALOG_DATA);

  readonly editing = !!this.data?.entity;
  readonly saving = signal(false);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    descricao: [''],
  });

  constructor() {
    if (this.data?.entity) {
      this.form.patchValue({
        nome: this.data.entity.nome,
        descricao: this.data.entity.descricao ?? '',
      });
    }
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    const payload = this.form.getRawValue();
    const req = this.editing
      ? this.service.update(this.data.entity!.id, payload)
      : this.service.create(payload);
    req.subscribe({
      next: (saved) => this.ref.close(saved),
      error: () => this.saving.set(false),
    });
  }
}

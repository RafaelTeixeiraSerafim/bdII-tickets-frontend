import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '../dialog/dialog-ref';
import { DialogShell } from '../dialog/dialog-shell';

export interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [DialogShell],
  template: `
    <app-dialog-shell maxWidth="26rem" (dismiss)="ref.close(false)">
      <div class="p-6">
        <div class="flex items-start gap-3">
          @if (data.danger) {
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-600 shrink-0"
            >
              <span class="material-icons">warning</span>
            </span>
          }
          <div>
            <h2 class="text-lg font-semibold text-slate-800">{{ data.title }}</h2>
            <p class="text-sm text-slate-500 mt-1">{{ data.message }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" class="btn btn-secondary" (click)="ref.close(false)">Cancelar</button>
          <button
            type="button"
            class="btn"
            [class]="data.danger ? 'btn-danger' : 'btn-primary'"
            (click)="ref.close(true)"
          >
            {{ data.confirmText ?? 'Confirmar' }}
          </button>
        </div>
      </div>
    </app-dialog-shell>
  `,
})
export class ConfirmDialog {
  readonly data = inject<ConfirmData>(DIALOG_DATA);
  readonly ref = inject<DialogRef<boolean>>(DialogRef);
}

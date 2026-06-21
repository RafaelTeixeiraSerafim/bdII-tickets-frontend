import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  template: `
    <div class="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-80 max-w-[90vw]">
      @for (t of toast.messages(); track t.id) {
        <div
          class="flex items-start gap-3 rounded-lg shadow-lg px-4 py-3 text-sm text-white animate-[slideIn_0.2s_ease-out]"
          [class]="t.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'"
        >
          <span class="material-icons mi-20">
            {{ t.type === 'error' ? 'error_outline' : 'check_circle' }}
          </span>
          <span class="flex-1">{{ t.text }}</span>
          <button class="text-white/70 hover:text-white" (click)="toast.dismiss(t.id)">
            <span class="material-icons mi-18">close</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(16px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `,
  ],
})
export class ToastHost {
  readonly toast = inject(ToastService);
}

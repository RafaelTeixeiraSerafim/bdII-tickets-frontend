import { Component, input, output } from '@angular/core';

/**
 * Presentational backdrop + centered panel for dialogs. Clicking the backdrop
 * or pressing Escape emits `dismiss`. Dialog content is projected inside.
 */
@Component({
  selector: 'app-dialog-shell',
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      (keydown.escape)="dismiss.emit()"
      tabindex="-1"
    >
      <div
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        (click)="dismiss.emit()"
      ></div>
      <div
        class="relative w-full bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto
          animate-[popIn_0.15s_ease-out]"
        [style.maxWidth]="maxWidth()"
      >
        <ng-content />
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes popIn {
        from { opacity: 0; transform: translateY(8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `,
  ],
})
export class DialogShell {
  readonly maxWidth = input('32rem');
  readonly dismiss = output<void>();
}

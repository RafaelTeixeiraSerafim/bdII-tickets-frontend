import { Component, input, output } from '@angular/core';

/** Compact prev/next paginator with a "start–end of total" range label. */
@Component({
  selector: 'app-paginator',
  template: `
    <div class="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-sm text-slate-500">
      <span>{{ rangeStart() }}–{{ rangeEnd() }} de {{ total() }}</span>
      <div class="flex items-center gap-1">
        <button
          class="btn-icon"
          [disabled]="page() === 0"
          [class.opacity-40]="page() === 0"
          [class.cursor-not-allowed]="page() === 0"
          (click)="prev.emit()"
          title="Anterior"
        >
          <span class="material-icons mi-20">chevron_left</span>
        </button>
        <span class="px-2">{{ page() + 1 }} / {{ pageCount() }}</span>
        <button
          class="btn-icon"
          [disabled]="page() >= pageCount() - 1"
          [class.opacity-40]="page() >= pageCount() - 1"
          [class.cursor-not-allowed]="page() >= pageCount() - 1"
          (click)="next.emit()"
          title="Próxima"
        >
          <span class="material-icons mi-20">chevron_right</span>
        </button>
      </div>
    </div>
  `,
})
export class Paginator {
  readonly page = input(0);
  readonly pageCount = input(1);
  readonly rangeStart = input(0);
  readonly rangeEnd = input(0);
  readonly total = input(0);
  readonly prev = output<void>();
  readonly next = output<void>();
}

import { Component, input, output } from '@angular/core';

/** Page header for list screens: title + count, search box, and a "New" button. */
@Component({
  selector: 'app-list-toolbar',
  template: `
    <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="text-sm text-slate-500">{{ subtitle() }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <div class="relative">
          <span class="material-icons mi-20 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            search
          </span>
          <input
            class="input pl-9 w-64 max-w-[60vw]"
            [placeholder]="searchPlaceholder()"
            (input)="search.emit($any($event.target).value)"
          />
        </div>
        @if (newLabel()) {
          <button class="btn btn-primary whitespace-nowrap" (click)="create.emit()">
            <span class="material-icons mi-20">add</span>
            <span class="hidden sm:inline">{{ newLabel() }}</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class ListToolbar {
  readonly title = input('');
  readonly subtitle = input('');
  readonly newLabel = input('');
  readonly searchPlaceholder = input('Buscar...');
  readonly search = output<string>();
  readonly create = output<void>();
}

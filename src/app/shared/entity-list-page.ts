import { Directive, Type, computed, inject, signal } from '@angular/core';
import { CrudService, Entity } from '../core/services/crud.service';
import { ConfirmData, ConfirmDialog } from './confirm-dialog/confirm-dialog';
import { DialogService } from './dialog/dialog.service';
import { ToastService } from './toast/toast.service';

export type SortDir = 'asc' | 'desc';

/**
 * Shared behaviour for entity list pages: signal-driven filter/sort/pagination
 * plus the create/edit dialog and delete-with-confirmation flow. Subclasses
 * provide the service + form-dialog component and render the table template.
 */
@Directive()
export abstract class EntityListPage<T extends Entity> {
  protected abstract readonly service: CrudService<T>;
  protected abstract readonly formComponent: Type<unknown>;
  /** Singular label used in toasts/confirmations, e.g. 'categoria'. */
  protected readonly entityLabel: string = 'registro';

  protected readonly dialog = inject(DialogService);
  protected readonly toast = inject(ToastService);

  readonly rows = signal<T[]>([]);
  readonly loading = signal(true);
  readonly filterText = signal('');
  readonly sortKey = signal<string | null>(null);
  readonly sortDir = signal<SortDir>('asc');
  readonly page = signal(0);
  readonly pageSize = signal(10);

  /** Text used for free-text search; override to include related fields. */
  protected searchText(row: T): string {
    return Object.values(row)
      .filter((v) => typeof v === 'string' || typeof v === 'number')
      .join(' ');
  }

  /** Value used when sorting by a column key; override for nested/computed columns. */
  protected sortValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  /**
   * Extra predicate applied before the text search (e.g. status/priority
   * dropdowns). Reads subclass signals, so `filtered` recomputes when they change.
   */
  protected extraFilter(_row: T): boolean {
    return true;
  }

  readonly filtered = computed(() => {
    const q = this.filterText().trim().toLowerCase();
    let data = this.rows().filter((r) => this.extraFilter(r));
    if (q) {
      data = data.filter((r) => this.searchText(r).toLowerCase().includes(q));
    }
    const key = this.sortKey();
    if (key) {
      const dir = this.sortDir() === 'asc' ? 1 : -1;
      data = [...data].sort((a, b) => {
        const av = this.sortValue(a, key);
        const bv = this.sortValue(b, key);
        if (av == null) return 1;
        if (bv == null) return -1;
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
        return String(av).localeCompare(String(bv)) * dir;
      });
    }
    return data;
  });

  readonly total = computed(() => this.filtered().length);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly rangeStart = computed(() => (this.total() === 0 ? 0 : this.page() * this.pageSize() + 1));
  readonly rangeEnd = computed(() => Math.min(this.total(), (this.page() + 1) * this.pageSize()));

  readonly paged = computed(() => {
    const start = this.page() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  constructor() {
    queueMicrotask(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  setSearch(value: string): void {
    this.filterText.set(value);
    this.page.set(0);
  }

  toggleSort(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
  }

  sortIcon(key: string): string {
    if (this.sortKey() !== key) return 'unfold_more';
    return this.sortDir() === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  nextPage(): void {
    if (this.page() < this.pageCount() - 1) this.page.update((p) => p + 1);
  }

  prevPage(): void {
    if (this.page() > 0) this.page.update((p) => p - 1);
  }

  openForm(entity?: T): void {
    this.dialog
      .open(this.formComponent, { entity })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.load();
          this.toast.success(`${this.cap(this.entityLabel)} salva(o) com sucesso.`);
        }
      });
  }

  confirmDelete(entity: T, description: string): void {
    const data: ConfirmData = {
      title: `Excluir ${this.entityLabel}`,
      message: `Tem certeza que deseja excluir ${description}? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      danger: true,
    };
    this.dialog
      .open<boolean>(ConfirmDialog, data)
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.service.remove(entity.id).subscribe(() => {
            this.load();
            this.toast.success(`${this.cap(this.entityLabel)} excluída(o).`);
          });
        }
      });
  }

  private cap(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

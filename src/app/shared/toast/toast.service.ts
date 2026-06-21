import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  text: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly messages = signal<Toast[]>([]);
  private seq = 0;

  show(text: string, type: Toast['type'] = 'success'): void {
    const id = ++this.seq;
    this.messages.update((m) => [...m, { id, text, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  dismiss(id: number): void {
    this.messages.update((m) => m.filter((t) => t.id !== id));
  }
}

import {
  ApplicationRef,
  EnvironmentInjector,
  Injectable,
  Injector,
  Type,
  createComponent,
  inject,
} from '@angular/core';
import { DIALOG_DATA, DialogRef } from './dialog-ref';

/**
 * Minimal dialog system (no Angular Material). Dynamically creates a standalone
 * component, attaches it to <body>, and provides DIALOG_DATA + DialogRef so the
 * component can render its own backdrop/panel (see DialogShell) and close itself.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private appRef = inject(ApplicationRef);
  private envInjector = inject(EnvironmentInjector);

  open<R = unknown>(component: Type<unknown>, data?: unknown): DialogRef<R> {
    const ref = new DialogRef<R>();

    const elementInjector = Injector.create({
      parent: this.envInjector,
      providers: [
        { provide: DIALOG_DATA, useValue: data ?? {} },
        { provide: DialogRef, useValue: ref },
      ],
    });

    const host = document.createElement('div');
    document.body.appendChild(host);

    const cmpRef = createComponent(component, {
      environmentInjector: this.envInjector,
      elementInjector,
      hostElement: host,
    });
    this.appRef.attachView(cmpRef.hostView);

    ref._cleanup = () => {
      this.appRef.detachView(cmpRef.hostView);
      cmpRef.destroy();
      host.remove();
    };

    return ref;
  }
}

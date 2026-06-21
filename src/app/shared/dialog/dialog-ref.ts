import { InjectionToken } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/** Data passed to a dialog component, injected via this token. */
export const DIALOG_DATA = new InjectionToken<unknown>('DIALOG_DATA');

/** Handle returned by DialogService.open; the dialog component injects it to close itself. */
export class DialogRef<R = unknown> {
  private readonly _afterClosed = new Subject<R | undefined>();

  /** @internal set by DialogService to tear down the dynamically created view. */
  _cleanup: () => void = () => {};

  close(result?: R): void {
    this._afterClosed.next(result);
    this._afterClosed.complete();
    this._cleanup();
  }

  afterClosed(): Observable<R | undefined> {
    return this._afterClosed.asObservable();
  }
}

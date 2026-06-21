import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Arquivo } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class ArquivoService extends CrudService<Arquivo> {
  protected readonly path = 'arquivos';

  /** Files attached to a given ticket (filtered client-side). */
  byTicket(ticketId: number): Observable<Arquivo[]> {
    return this.list().pipe(map((all) => all.filter((a) => a.ticket_id === ticketId)));
  }
}

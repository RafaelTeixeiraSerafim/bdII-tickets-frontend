import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Comentario } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class ComentarioService extends CrudService<Comentario> {
  protected readonly path = 'comentarios';

  /** Comments for a given ticket (API has no filter endpoint, so filter client-side). */
  byTicket(ticketId: number): Observable<Comentario[]> {
    return this.list().pipe(map((all) => all.filter((c) => c.ticket_id === ticketId)));
  }
}

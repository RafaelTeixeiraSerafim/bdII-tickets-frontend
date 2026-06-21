import { Injectable } from '@angular/core';
import { Ticket } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class TicketService extends CrudService<Ticket> {
  protected readonly path = 'tickets';
}

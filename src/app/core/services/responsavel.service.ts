import { Injectable } from '@angular/core';
import { Responsavel } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class ResponsavelService extends CrudService<Responsavel> {
  protected readonly path = 'responsaveis';
}

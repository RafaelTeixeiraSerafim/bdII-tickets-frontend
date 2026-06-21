import { Injectable } from '@angular/core';
import { Categoria } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService extends CrudService<Categoria> {
  protected readonly path = 'categorias';
}

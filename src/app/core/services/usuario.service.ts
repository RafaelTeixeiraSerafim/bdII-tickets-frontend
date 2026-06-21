import { Injectable } from '@angular/core';
import { Usuario } from '../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService extends CrudService<Usuario> {
  protected readonly path = 'usuarios';
}

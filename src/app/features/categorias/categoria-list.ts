import { Component, inject } from '@angular/core';
import { Categoria } from '../../core/models';
import { CategoriaService } from '../../core/services/categoria.service';
import { EntityListPage } from '../../shared/entity-list-page';
import { ListToolbar } from '../../shared/ui/list-toolbar';
import { Paginator } from '../../shared/ui/paginator';
import { CategoriaForm } from './categoria-form';

@Component({
  selector: 'app-categoria-list',
  imports: [ListToolbar, Paginator],
  templateUrl: './categoria-list.html',
})
export class CategoriaList extends EntityListPage<Categoria> {
  protected readonly service = inject(CategoriaService);
  protected readonly formComponent = CategoriaForm;
  protected override readonly entityLabel = 'categoria';
}

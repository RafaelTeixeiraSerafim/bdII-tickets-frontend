import { Component, inject } from '@angular/core';
import { Responsavel } from '../../core/models';
import { ResponsavelService } from '../../core/services/responsavel.service';
import { EntityListPage } from '../../shared/entity-list-page';
import { ListToolbar } from '../../shared/ui/list-toolbar';
import { Paginator } from '../../shared/ui/paginator';
import { ResponsavelForm } from './responsavel-form';

@Component({
  selector: 'app-responsavel-list',
  imports: [ListToolbar, Paginator],
  templateUrl: './responsavel-list.html',
})
export class ResponsavelList extends EntityListPage<Responsavel> {
  protected readonly service = inject(ResponsavelService);
  protected readonly formComponent = ResponsavelForm;
  protected override readonly entityLabel = 'responsável';

  protected override searchText(r: Responsavel): string {
    return `${r.cargo} ${r.especialidade ?? ''} ${r.usuario?.nome ?? ''}`;
  }
}

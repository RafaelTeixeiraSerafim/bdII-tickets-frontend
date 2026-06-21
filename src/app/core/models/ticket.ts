import { Categoria } from './categoria';
import { Prioridade, TicketStatus } from './enums';
import { Responsavel } from './responsavel';
import { Usuario } from './usuario';

export interface Ticket {
  id: number;
  titulo: string;
  descricao: string;
  status: TicketStatus;
  prioridade: Prioridade;
  usuario_id: number;
  usuario?: Usuario | null;
  responsavel_id?: number | null;
  responsavel?: Responsavel | null;
  categoria_id?: number | null;
  categoria?: Categoria | null;
  criado_em: string;
  atualizado_em: string;
  fechado_em?: string | null;
}

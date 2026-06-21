import { Ticket } from './ticket';
import { Usuario } from './usuario';

export interface Comentario {
  id: number;
  conteudo: string;
  interno: boolean;
  usuario_id: number;
  usuario?: Usuario | null;
  ticket_id: number;
  ticket?: Ticket | null;
  criado_em: string;
}

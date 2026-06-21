import { Usuario } from './usuario';

export interface Responsavel {
  id: number;
  cargo: string;
  especialidade?: string | null;
  usuario_id: number;
  usuario?: Usuario | null;
}

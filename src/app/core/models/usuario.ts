import { Role } from './enums';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone?: string | null;
  /** Write-only: carries the raw password on create/update; the API hashes it. Never display. */
  senha_hash?: string;
  role: Role;
  ativo: boolean;
  criado_em: string;
}

export interface Arquivo {
  id: number;
  nome_original: string;
  uri: string;
  tipo_mime?: string | null;
  tamanho_bytes?: number | null;
  /** At least one of comentario_id / ticket_id must be set. */
  comentario_id?: number | null;
  ticket_id?: number | null;
  criado_em: string;
}

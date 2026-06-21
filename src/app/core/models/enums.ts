// Enum value unions mirroring the Go API + display metadata (labels, badge colors).

export type Role = 'cliente' | 'tecnico' | 'admin';
export type TicketStatus =
  | 'aberto'
  | 'em_atendimento'
  | 'aguardando_cliente'
  | 'resolvido'
  | 'fechado'
  | 'cancelado';
export type Prioridade = 'baixa' | 'media' | 'alta' | 'critica';

export interface EnumOption<T extends string> {
  value: T;
  label: string;
  /** Tailwind classes for a colored badge. */
  badge: string;
}

export const ROLE_OPTIONS: EnumOption<Role>[] = [
  { value: 'cliente', label: 'Cliente', badge: 'bg-slate-100 text-slate-700' },
  { value: 'tecnico', label: 'Técnico', badge: 'bg-sky-100 text-sky-700' },
  { value: 'admin', label: 'Admin', badge: 'bg-purple-100 text-purple-700' },
];

export const STATUS_OPTIONS: EnumOption<TicketStatus>[] = [
  { value: 'aberto', label: 'Aberto', badge: 'bg-blue-100 text-blue-700' },
  { value: 'em_atendimento', label: 'Em atendimento', badge: 'bg-amber-100 text-amber-700' },
  { value: 'aguardando_cliente', label: 'Aguardando cliente', badge: 'bg-orange-100 text-orange-700' },
  { value: 'resolvido', label: 'Resolvido', badge: 'bg-emerald-100 text-emerald-700' },
  { value: 'fechado', label: 'Fechado', badge: 'bg-slate-200 text-slate-700' },
  { value: 'cancelado', label: 'Cancelado', badge: 'bg-rose-100 text-rose-700' },
];

export const PRIORIDADE_OPTIONS: EnumOption<Prioridade>[] = [
  { value: 'baixa', label: 'Baixa', badge: 'bg-slate-100 text-slate-700' },
  { value: 'media', label: 'Média', badge: 'bg-sky-100 text-sky-700' },
  { value: 'alta', label: 'Alta', badge: 'bg-amber-100 text-amber-700' },
  { value: 'critica', label: 'Crítica', badge: 'bg-rose-100 text-rose-700' },
];

function lookup<T extends string>(options: EnumOption<T>[], value: T | null | undefined): EnumOption<T> | undefined {
  return options.find((o) => o.value === value);
}

export const roleMeta = (v: Role | null | undefined) => lookup(ROLE_OPTIONS, v);
export const statusMeta = (v: TicketStatus | null | undefined) => lookup(STATUS_OPTIONS, v);
export const prioridadeMeta = (v: Prioridade | null | undefined) => lookup(PRIORIDADE_OPTIONS, v);

export * from './enums';
export * from './usuario';
export * from './categoria';
export * from './responsavel';
export * from './ticket';
export * from './comentario';
export * from './arquivo';

export interface LoginResponse {
  token: string;
  usuario: import('./usuario').Usuario;
}

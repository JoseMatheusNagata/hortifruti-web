import { OrderStatus } from './types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const money = (v: string | number | null | undefined) => brl.format(Number(v ?? 0));

export const qty = (v: string | number | null | undefined, unit?: string) =>
  `${Number(v ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}${unit === 'KG' ? ' kg' : unit === 'UNIT' ? ' un' : ''}`;

export const STATUS_LABEL: Record<OrderStatus, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando Pagamento',
  EM_SEPARACAO: 'Em Separação',
  EM_TRANSPORTE: 'Em Transporte',
  CONCLUIDO: 'Concluído',
};

export const PAGAMENTO_LABEL = { PIX: 'Pix', CARTAO: 'Cartão', DINHEIRO: 'Dinheiro' } as const;

/** Extrai a mensagem de erro devolvida pela API (inclui erros de validação do Zod). */
export function errorMessage(err: unknown): string {
  const data = (err as { response?: { data?: { message?: string; issues?: { campo: string; erro: string }[] } } })?.response?.data;
  if (data?.issues?.length) return data.issues.map((i) => `${i.campo}: ${i.erro}`).join(' • ');
  return data?.message ?? 'Não foi possível conectar à API.';
}

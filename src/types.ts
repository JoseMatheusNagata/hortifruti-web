export type Role = 'CLIENT' | 'ADMIN';
export type Unidade = 'KG' | 'UNIT';
export type OrderStatus = 'AGUARDANDO_PAGAMENTO' | 'EM_SEPARACAO' | 'EM_TRANSPORTE' | 'CONCLUIDO';

export interface User { id: string; nome: string; email: string; role: Role }
export interface Category { id: string; nome: string }

export interface Product {
  id: string;
  categoryId: string;
  nome: string;
  unidadeMedida: Unidade;
  precoVarejo: string;
  precoAtacado: string | null;
  qtdMinAtacado: string | null;
  ativo: boolean;
  category?: Category;
}

export interface OrderItem {
  id: string;
  quantidade: string;
  precoUnitario: string;
  subtotal: string;
  product: { id: string; nome: string; unidadeMedida: Unidade };
}

export interface Order {
  id: string;
  status: OrderStatus;
  total: string;
  formaPagamento: 'PIX' | 'CARTAO' | 'DINHEIRO';
  data: string;
  user?: { id: string; nome: string; email: string };
  address: { rua: string; numero: string; bairro: string; cep: string };
  items: OrderItem[];
}

export interface SalesReport {
  totalFaturado: string | number;
  totalPedidos: number;
  ranking: {
    posicao: number;
    produto?: string;
    unidadeMedida?: Unidade;
    quantidadeVendida: string | null;
    faturamento: string | null;
  }[];
}

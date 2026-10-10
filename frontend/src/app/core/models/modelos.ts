/** Modelos que espelham os JSON devolvidos pela API (nomes em português). */

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
}

export interface CategoriaRequest {
  nome: string;
  descricao: string | null;
}

export interface Produto {
  id: number;
  nome: string;
  sku: string;
  descricao: string | null;
  preco: number;
  quantidade: number;
  estoqueMinimo: number;
  estoqueBaixo: boolean;
  ativo: boolean;
  categoria: Categoria;
}

export interface ProdutoRequest {
  nome: string;
  sku: string;
  descricao: string | null;
  preco: number;
  estoqueMinimo: number;
  categoriaId: number;
  ativo: boolean;
}

export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

export interface Movimentacao {
  id: number;
  produtoId: number;
  produtoNome: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string | null;
  criadoEm: string;
}

export interface MovimentacaoRequest {
  produtoId: number;
  tipo: TipoMovimentacao;
  quantidade: number;
  observacao: string | null;
}

export interface Pagina<T> {
  itens: T[];
  pagina: number;
  tamanho: number;
  totalItens: number;
  totalPaginas: number;
  primeira: boolean;
  ultima: boolean;
}

export interface Resumo {
  totalProdutosAtivos: number;
  totalCategorias: number;
  totalItensEmEstoque: number;
  valorTotalEmEstoque: number;
  produtosComEstoqueBaixo: number;
  ultimasMovimentacoes: Movimentacao[];
}

export interface Mensagem {
  mensagem: string;
}

export interface ErroApi {
  status: number;
  erro: string;
  mensagem: string;
  campos?: Record<string, string> | null;
  dataHora: string;
}

/** Parâmetros comuns de paginação e ordenação das listagens. */
export interface ConsultaPaginada {
  busca?: string;
  pagina: number;
  tamanho: number;
  ordenarPor: string;
  direcao: 'asc' | 'desc';
}

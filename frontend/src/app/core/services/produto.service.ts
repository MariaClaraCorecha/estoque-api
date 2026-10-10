import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, montarParametros } from '../api';
import { ConsultaPaginada, Mensagem, Pagina, Produto, ProdutoRequest } from '../models/modelos';

export interface FiltrosProduto {
  categoriaId?: number | null;
  /** true = só ativos, false = só inativos, null/undefined = todos */
  ativo?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/produtos`;

  listar(consulta: ConsultaPaginada, filtros: FiltrosProduto = {}): Observable<Pagina<Produto>> {
    const params = montarParametros(consulta, {
      categoriaId: filtros.categoriaId,
      ativo: filtros.ativo,
    });
    return this.http.get<Pagina<Produto>>(this.url, { params });
  }

  estoqueBaixo(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.url}/estoque-baixo`);
  }

  buscarPorId(id: number): Observable<Produto> {
    return this.http.get<Produto>(`${this.url}/${id}`);
  }

  cadastrar(dados: ProdutoRequest): Observable<Produto> {
    return this.http.post<Produto>(this.url, dados);
  }

  atualizar(id: number, dados: ProdutoRequest): Observable<Produto> {
    return this.http.put<Produto>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<Mensagem> {
    return this.http.delete<Mensagem>(`${this.url}/${id}`);
  }
}

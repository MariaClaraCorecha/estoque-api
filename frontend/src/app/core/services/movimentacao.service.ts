import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, montarParametros } from '../api';
import { ConsultaPaginada, Movimentacao, MovimentacaoRequest, Pagina } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class MovimentacaoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/movimentacoes`;

  listar(consulta: ConsultaPaginada, produtoId?: number | null): Observable<Pagina<Movimentacao>> {
    return this.http.get<Pagina<Movimentacao>>(this.url, {
      params: montarParametros(consulta, { produtoId }),
    });
  }

  buscarPorId(id: number): Observable<Movimentacao> {
    return this.http.get<Movimentacao>(`${this.url}/${id}`);
  }

  registrar(dados: MovimentacaoRequest): Observable<Movimentacao> {
    return this.http.post<Movimentacao>(this.url, dados);
  }
}

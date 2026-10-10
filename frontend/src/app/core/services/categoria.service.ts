import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL, montarParametros } from '../api';
import { Categoria, CategoriaRequest, ConsultaPaginada, Mensagem, Pagina } from '../models/modelos';

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/categorias`;

  listar(consulta: ConsultaPaginada): Observable<Pagina<Categoria>> {
    return this.http.get<Pagina<Categoria>>(this.url, { params: montarParametros(consulta) });
  }

  listarTodas(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.url}/todas`);
  }

  buscarPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.url}/${id}`);
  }

  cadastrar(dados: CategoriaRequest): Observable<Categoria> {
    return this.http.post<Categoria>(this.url, dados);
  }

  atualizar(id: number, dados: CategoriaRequest): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.url}/${id}`, dados);
  }

  excluir(id: number): Observable<Mensagem> {
    return this.http.delete<Mensagem>(`${this.url}/${id}`);
  }
}

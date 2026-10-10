import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { Pagina, Produto } from '../models/modelos';
import { ProdutoService } from './produto.service';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProdutoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envia paginação, busca e filtros como parâmetros em português', () => {
    const resposta: Pagina<Produto> = {
      itens: [],
      pagina: 1,
      tamanho: 5,
      totalItens: 0,
      totalPaginas: 0,
      primeira: false,
      ultima: true,
    };

    service
      .listar(
        { busca: ' arroz ', pagina: 1, tamanho: 5, ordenarPor: 'preco', direcao: 'desc' },
        { categoriaId: 2, ativo: true },
      )
      .subscribe((pagina) => expect(pagina.totalItens).toBe(0));

    const req = http.expectOne((r) => r.url === '/api/produtos');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('busca')).toBe('arroz');
    expect(req.request.params.get('pagina')).toBe('1');
    expect(req.request.params.get('tamanho')).toBe('5');
    expect(req.request.params.get('ordenarPor')).toBe('preco');
    expect(req.request.params.get('direcao')).toBe('desc');
    expect(req.request.params.get('categoriaId')).toBe('2');
    expect(req.request.params.get('ativo')).toBe('true');
    req.flush(resposta);
  });

  it('não envia filtros vazios', () => {
    service
      .listar({ busca: '', pagina: 0, tamanho: 10, ordenarPor: 'nome', direcao: 'asc' }, { ativo: null })
      .subscribe();

    const req = http.expectOne((r) => r.url === '/api/produtos');
    expect(req.request.params.has('busca')).toBeFalse();
    expect(req.request.params.has('categoriaId')).toBeFalse();
    expect(req.request.params.has('ativo')).toBeFalse();
    req.flush({ itens: [], pagina: 0, tamanho: 10, totalItens: 0, totalPaginas: 0, primeira: true, ultima: true });
  });

  it('exclui pelo id', () => {
    service.excluir(7).subscribe((r) => expect(r.mensagem).toBe('Produto excluído com sucesso'));

    const req = http.expectOne('/api/produtos/7');
    expect(req.request.method).toBe('DELETE');
    req.flush({ mensagem: 'Produto excluído com sucesso' });
  });
});

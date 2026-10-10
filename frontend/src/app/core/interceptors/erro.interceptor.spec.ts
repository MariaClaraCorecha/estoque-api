import { HttpErrorResponse } from '@angular/common/http';
import { mensagemDeErro } from './erro.interceptor';

describe('mensagemDeErro', () => {
  it('explica quando a API está fora do ar', () => {
    const erro = new HttpErrorResponse({ status: 0 });
    expect(mensagemDeErro(erro)).toContain('Não foi possível conectar ao servidor');
  });

  it('usa a mensagem enviada pela API', () => {
    const erro = new HttpErrorResponse({
      status: 404,
      error: { status: 404, erro: 'Não encontrado', mensagem: 'Produto não encontrado(a) com id 9' },
    });
    expect(mensagemDeErro(erro)).toBe('Produto não encontrado(a) com id 9');
  });

  it('acrescenta os erros de cada campo', () => {
    const erro = new HttpErrorResponse({
      status: 400,
      error: {
        status: 400,
        erro: 'Dados inválidos',
        mensagem: 'Um ou mais campos estão inválidos',
        campos: { nome: 'O nome é obrigatório', sku: 'O SKU é obrigatório' },
      },
    });
    expect(mensagemDeErro(erro)).toBe(
      'Um ou mais campos estão inválidos: O nome é obrigatório · O SKU é obrigatório',
    );
  });

  it('usa uma mensagem genérica quando a resposta não tem corpo', () => {
    const erro = new HttpErrorResponse({ status: 500 });
    expect(mensagemDeErro(erro)).toContain('Erro inesperado (500)');
  });
});

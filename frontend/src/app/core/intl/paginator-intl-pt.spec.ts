import { PaginatorIntlPt } from './paginator-intl-pt';

describe('PaginatorIntlPt', () => {
  const intl = new PaginatorIntlPt();

  it('traduz os textos fixos', () => {
    expect(intl.itemsPerPageLabel).toBe('Itens por página:');
    expect(intl.nextPageLabel).toBe('Próxima página');
  });

  it('descreve o intervalo exibido', () => {
    expect(intl.getRangeLabel(0, 10, 25)).toBe('1 – 10 de 25');
    expect(intl.getRangeLabel(2, 10, 25)).toBe('21 – 25 de 25');
  });

  it('trata lista vazia', () => {
    expect(intl.getRangeLabel(0, 10, 0)).toBe('0 de 0');
  });
});

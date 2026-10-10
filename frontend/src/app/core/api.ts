import { HttpParams } from '@angular/common/http';
import { ConsultaPaginada } from './models/modelos';

/** Prefixo das rotas da API. Em desenvolvimento o proxy.conf.json encaminha para o backend. */
export const API_URL = '/api';

/** Monta os parâmetros de paginação, ignorando valores vazios. */
export function montarParametros(
  consulta: ConsultaPaginada,
  extras: Record<string, string | number | boolean | null | undefined> = {},
): HttpParams {
  let params = new HttpParams()
    .set('pagina', consulta.pagina)
    .set('tamanho', consulta.tamanho)
    .set('ordenarPor', consulta.ordenarPor)
    .set('direcao', consulta.direcao);

  const filtros: Record<string, string | number | boolean | null | undefined> = {
    busca: consulta.busca?.trim(),
    ...extras,
  };

  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== null && valor !== undefined && valor !== '') {
      params = params.set(chave, valor);
    }
  }
  return params;
}

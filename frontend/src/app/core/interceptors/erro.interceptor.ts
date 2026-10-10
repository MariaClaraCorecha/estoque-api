import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ErroApi } from '../models/modelos';
import { NotificacaoService } from '../services/notificacao.service';

/** Converte um erro HTTP em um texto amigável em português. */
export function mensagemDeErro(erro: HttpErrorResponse): string {
  if (erro.status === 0) {
    return 'Não foi possível conectar ao servidor. Verifique se a API está em execução.';
  }

  const corpo = erro.error as Partial<ErroApi> | null;
  if (corpo && typeof corpo === 'object' && corpo.mensagem) {
    const detalhes = corpo.campos ? Object.values(corpo.campos).join(' · ') : '';
    return detalhes ? `${corpo.mensagem}: ${detalhes}` : corpo.mensagem;
  }

  return `Erro inesperado (${erro.status}). Tente novamente.`;
}

/** Exibe qualquer erro da API em um snackbar e repassa o erro para quem chamou. */
export const erroInterceptor: HttpInterceptorFn = (req, next) => {
  const notificacao = inject(NotificacaoService);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      notificacao.erro(mensagemDeErro(erro));
      return throwError(() => erro);
    }),
  );
};

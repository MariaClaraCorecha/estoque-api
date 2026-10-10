import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Subject, catchError, filter, of, switchMap, tap } from 'rxjs';

import { Movimentacao } from '../../core/models/modelos';
import { MovimentacaoService } from '../../core/services/movimentacao.service';
import { ProdutoAutocomplete, ValorProduto } from '../../shared/produto-autocomplete/produto-autocomplete';
import { MovimentacaoFormDialog } from './movimentacao-form-dialog';

@Component({
  selector: 'app-movimentacoes-lista',
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    ProdutoAutocomplete,
  ],
  templateUrl: './movimentacoes-lista.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovimentacoesLista implements OnInit {
  private readonly service = inject(MovimentacaoService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recarregar$ = new Subject<void>();

  protected readonly colunas = ['data', 'produto', 'tipo', 'quantidade', 'observacao'];
  protected readonly movimentacoes = signal<Movimentacao[]>([]);
  protected readonly total = signal(0);
  protected readonly carregando = signal(false);

  protected readonly pagina = signal(0);
  protected readonly tamanho = signal(10);
  protected readonly ordenarPor = signal('criadoEm');
  protected readonly direcao = signal<'asc' | 'desc'>('desc');

  /** Filtro por produto: só é aplicado quando o usuário escolhe uma opção da lista. */
  protected readonly filtroProduto = new FormControl<ValorProduto>(null);

  ngOnInit(): void {
    this.recarregar$
      .pipe(
        tap(() => this.carregando.set(true)),
        switchMap(() => {
          const produto = this.filtroProduto.value;
          const produtoId = produto && typeof produto === 'object' ? produto.id : null;
          return this.service
            .listar(
              {
                pagina: this.pagina(),
                tamanho: this.tamanho(),
                ordenarPor: this.ordenarPor(),
                direcao: this.direcao(),
              },
              produtoId,
            )
            .pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (resultado && resultado.itens.length === 0 && resultado.totalItens > 0 && this.pagina() > 0) {
          this.pagina.set(resultado.totalPaginas - 1);
          this.recarregar$.next();
          return;
        }
        if (resultado) {
          this.movimentacoes.set(resultado.itens);
          this.total.set(resultado.totalItens);
        }
        this.carregando.set(false);
      });

    // Recarrega ao escolher um produto ou ao limpar o campo (texto parcial não filtra).
    this.filtroProduto.valueChanges
      .pipe(
        filter((valor) => valor === null || valor === '' || typeof valor === 'object'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.pagina.set(0);
        this.recarregar$.next();
      });

    this.recarregar$.next();
  }

  protected mudarPagina(evento: PageEvent): void {
    this.pagina.set(evento.pageIndex);
    this.tamanho.set(evento.pageSize);
    this.recarregar$.next();
  }

  protected ordenar(ordem: Sort): void {
    this.ordenarPor.set(ordem.direction ? ordem.active : 'criadoEm');
    this.direcao.set(ordem.direction ? (ordem.direction as 'asc' | 'desc') : 'desc');
    this.pagina.set(0);
    this.recarregar$.next();
  }

  protected nova(): void {
    this.dialog
      .open(MovimentacaoFormDialog, { width: '520px', maxWidth: '95vw', data: {} })
      .afterClosed()
      .pipe(filter((salvou) => salvou === true))
      .subscribe(() => {
        this.pagina.set(0);
        this.recarregar$.next();
      });
  }
}

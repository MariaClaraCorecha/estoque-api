import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { ComponentType } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  merge,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { Categoria, Produto } from '../../core/models/modelos';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { ProdutoService } from '../../core/services/produto.service';
import { ConfirmarDialog } from '../../shared/confirmar-dialog/confirmar-dialog';
import { MovimentacaoFormDialog } from '../movimentacoes/movimentacao-form-dialog';
import { ProdutoFormDialog } from './produto-form-dialog';

type Situacao = 'todos' | 'ativos' | 'inativos';

@Component({
  selector: 'app-produtos-lista',
  imports: [
    CurrencyPipe,
    DecimalPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './produtos-lista.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProdutosLista implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly dialog = inject(MatDialog);
  private readonly notificacao = inject(NotificacaoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recarregar$ = new Subject<void>();

  protected readonly colunas = ['sku', 'nome', 'categoria', 'preco', 'quantidade', 'situacao', 'acoes'];
  protected readonly produtos = signal<Produto[]>([]);
  protected readonly total = signal(0);
  protected readonly carregando = signal(false);

  protected readonly categorias = toSignal(
    inject(CategoriaService)
      .listarTodas()
      .pipe(catchError(() => of([] as Categoria[]))),
    { initialValue: [] as Categoria[] },
  );

  protected readonly pagina = signal(0);
  protected readonly tamanho = signal(10);
  protected readonly ordenarPor = signal('nome');
  protected readonly direcao = signal<'asc' | 'desc'>('asc');

  protected readonly busca = new FormControl('', { nonNullable: true });
  protected readonly categoriaId = new FormControl<number | null>(null);
  protected readonly situacao = new FormControl<Situacao>('todos', { nonNullable: true });

  ngOnInit(): void {
    this.recarregar$
      .pipe(
        tap(() => this.carregando.set(true)),
        switchMap(() =>
          this.produtoService
            .listar(
              {
                busca: this.busca.value,
                pagina: this.pagina(),
                tamanho: this.tamanho(),
                ordenarPor: this.ordenarPor(),
                direcao: this.direcao(),
              },
              {
                categoriaId: this.categoriaId.value,
                ativo: this.filtroAtivo(),
              },
            )
            .pipe(catchError(() => of(null))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((resultado) => {
        if (resultado && resultado.itens.length === 0 && resultado.totalItens > 0 && this.pagina() > 0) {
          // A última página ficou vazia (ex.: depois de excluir) — volta para a anterior.
          this.pagina.set(resultado.totalPaginas - 1);
          this.recarregar$.next();
          return;
        }
        if (resultado) {
          this.produtos.set(resultado.itens);
          this.total.set(resultado.totalItens);
        }
        this.carregando.set(false);
      });

    merge(
      this.busca.valueChanges.pipe(debounceTime(400), distinctUntilChanged()),
      this.categoriaId.valueChanges,
      this.situacao.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
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
    this.ordenarPor.set(ordem.direction ? ordem.active : 'nome');
    this.direcao.set(ordem.direction === 'desc' ? 'desc' : 'asc');
    this.pagina.set(0);
    this.recarregar$.next();
  }

  protected limparBusca(): void {
    this.busca.setValue('');
  }

  protected novo(): void {
    this.abrir(ProdutoFormDialog, {});
  }

  protected editar(produto: Produto): void {
    this.abrir(ProdutoFormDialog, { produto });
  }

  protected movimentar(produto: Produto): void {
    this.abrir(MovimentacaoFormDialog, { produto });
  }

  protected excluir(produto: Produto): void {
    this.dialog
      .open(ConfirmarDialog, {
        data: {
          titulo: 'Excluir produto',
          mensagem:
            `Deseja excluir "${produto.nome}"? Se ele já tiver movimentações, ` +
            'será apenas desativado para manter o histórico.',
          textoConfirmar: 'Excluir',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmou) => confirmou === true),
        switchMap(() => this.produtoService.excluir(produto.id)),
      )
      .subscribe({
        next: (resposta) => {
          this.notificacao.sucesso(resposta.mensagem);
          this.recarregar$.next();
        },
        error: () => undefined, // a mensagem já foi exibida pelo interceptor
      });
  }

  private filtroAtivo(): boolean | null {
    switch (this.situacao.value) {
      case 'ativos':
        return true;
      case 'inativos':
        return false;
      default:
        return null;
    }
  }

  private abrir<T>(componente: ComponentType<T>, dados: object): void {
    this.dialog
      .open(componente, { width: '640px', maxWidth: '95vw', data: dados })
      .afterClosed()
      .pipe(filter((salvou) => salvou === true))
      .subscribe(() => this.recarregar$.next());
  }
}

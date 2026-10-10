import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';

import { Categoria } from '../../core/models/modelos';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { ConfirmarDialog } from '../../shared/confirmar-dialog/confirmar-dialog';
import { CategoriaFormDialog } from './categoria-form-dialog';

@Component({
  selector: 'app-categorias-lista',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
  ],
  templateUrl: './categorias-lista.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriasLista implements OnInit {
  private readonly service = inject(CategoriaService);
  private readonly dialog = inject(MatDialog);
  private readonly notificacao = inject(NotificacaoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly recarregar$ = new Subject<void>();

  protected readonly colunas = ['nome', 'descricao', 'acoes'];
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly total = signal(0);
  protected readonly carregando = signal(false);

  protected readonly pagina = signal(0);
  protected readonly tamanho = signal(10);
  protected readonly ordenarPor = signal('nome');
  protected readonly direcao = signal<'asc' | 'desc'>('asc');
  protected readonly busca = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.recarregar$
      .pipe(
        tap(() => this.carregando.set(true)),
        switchMap(() =>
          this.service
            .listar({
              busca: this.busca.value,
              pagina: this.pagina(),
              tamanho: this.tamanho(),
              ordenarPor: this.ordenarPor(),
              direcao: this.direcao(),
            })
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
          this.categorias.set(resultado.itens);
          this.total.set(resultado.totalItens);
        }
        this.carregando.set(false);
      });

    this.busca.valueChanges
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
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

  protected nova(): void {
    this.abrirFormulario();
  }

  protected editar(categoria: Categoria): void {
    this.abrirFormulario(categoria);
  }

  protected excluir(categoria: Categoria): void {
    this.dialog
      .open(ConfirmarDialog, {
        data: {
          titulo: 'Excluir categoria',
          mensagem: `Deseja excluir a categoria "${categoria.nome}"? Só é possível excluir categorias sem produtos.`,
          textoConfirmar: 'Excluir',
        },
      })
      .afterClosed()
      .pipe(
        filter((confirmou) => confirmou === true),
        switchMap(() => this.service.excluir(categoria.id)),
      )
      .subscribe({
        next: (resposta) => {
          this.notificacao.sucesso(resposta.mensagem);
          this.recarregar$.next();
        },
        error: () => undefined, // a mensagem já foi exibida pelo interceptor
      });
  }

  private abrirFormulario(categoria?: Categoria): void {
    this.dialog
      .open(CategoriaFormDialog, { width: '520px', maxWidth: '95vw', data: { categoria } })
      .afterClosed()
      .pipe(filter((salvou) => salvou === true))
      .subscribe(() => this.recarregar$.next());
  }
}

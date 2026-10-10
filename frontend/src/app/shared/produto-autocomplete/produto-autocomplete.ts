import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';

import { Produto } from '../../core/models/modelos';
import { ProdutoService } from '../../core/services/produto.service';

/** Valor do controle: texto enquanto digita, objeto Produto depois de escolher uma opção. */
export type ValorProduto = Produto | string | null;

/** Garante que o usuário escolheu uma opção da lista (e não apenas digitou um texto). */
export function produtoSelecionado(controle: AbstractControl): ValidationErrors | null {
  const valor = controle.value as ValorProduto;
  if (valor === null || valor === '') {
    return null; // "obrigatório" fica por conta de Validators.required
  }
  return typeof valor === 'object' ? null : { produtoInvalido: true };
}

/** Campo de busca de produto por nome ou SKU, com sugestões vindas da API. */
@Component({
  selector: 'app-produto-autocomplete',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    mat-form-field {
      width: 100%;
    }
  `,
  template: `
    <mat-form-field appearance="outline">
      <mat-label>{{ rotulo() }}</mat-label>
      <input
        matInput
        type="text"
        autocomplete="off"
        placeholder="Digite o nome ou o SKU"
        [formControl]="controle()"
        [matAutocomplete]="auto"
      />
      @if (limpavel() && controle().value) {
        <button mat-icon-button matSuffix type="button" aria-label="Limpar produto" (click)="limpar()">
          <mat-icon>close</mat-icon>
        </button>
      }
      <mat-autocomplete #auto="matAutocomplete" [displayWith]="exibir">
        @for (produto of opcoes(); track produto.id) {
          <mat-option [value]="produto">
            {{ produto.nome }} <span class="secundario">· {{ produto.sku }}</span>
          </mat-option>
        }
      </mat-autocomplete>
      @if (controle().hasError('required')) {
        <mat-error>Selecione um produto</mat-error>
      } @else if (controle().hasError('produtoInvalido')) {
        <mat-error>Escolha um produto da lista de sugestões</mat-error>
      }
    </mat-form-field>
  `,
})
export class ProdutoAutocomplete {
  readonly controle = input.required<FormControl<ValorProduto>>();
  readonly rotulo = input('Produto');
  readonly limpavel = input(false);
  /** Quando verdadeiro, sugere apenas produtos ativos. */
  readonly somenteAtivos = input(false);

  private readonly produtoService = inject(ProdutoService);
  protected readonly opcoes = signal<Produto[]>([]);

  protected readonly exibir = (valor: ValorProduto): string =>
    valor && typeof valor === 'object' ? valor.nome : (valor ?? '');

  constructor() {
    toObservable(this.controle)
      .pipe(
        switchMap((controle) => controle.valueChanges.pipe(startWith(controle.value))),
        map((valor) => (typeof valor === 'string' ? valor : '')),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((busca) =>
          this.produtoService
            .listar(
              { busca, pagina: 0, tamanho: 10, ordenarPor: 'nome', direcao: 'asc' },
              { ativo: this.somenteAtivos() ? true : null },
            )
            .pipe(catchError(() => of(null))),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((pagina) => this.opcoes.set(pagina?.itens ?? []));
  }

  protected limpar(): void {
    this.controle().setValue(null);
  }
}

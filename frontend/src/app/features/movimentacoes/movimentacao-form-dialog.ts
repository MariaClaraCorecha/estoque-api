import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { startWith } from 'rxjs';

import { MovimentacaoRequest, Produto, TipoMovimentacao } from '../../core/models/modelos';
import { MovimentacaoService } from '../../core/services/movimentacao.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import {
  ProdutoAutocomplete,
  ValorProduto,
  produtoSelecionado,
} from '../../shared/produto-autocomplete/produto-autocomplete';

export interface MovimentacaoFormDados {
  /** Produto já escolhido (quando o diálogo é aberto a partir da lista de produtos). */
  produto?: Produto;
}

@Component({
  selector: 'app-movimentacao-form-dialog',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    ProdutoAutocomplete,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './movimentacao-form-dialog.html',
})
export class MovimentacaoFormDialog {
  private readonly dados = inject<MovimentacaoFormDados | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject<MatDialogRef<MovimentacaoFormDialog, boolean>>(MatDialogRef);
  private readonly service = inject(MovimentacaoService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly salvando = signal(false);

  protected readonly produto = new FormControl<ValorProduto>(this.dados?.produto ?? null, [
    Validators.required,
    produtoSelecionado,
  ]);

  protected readonly form = new FormGroup({
    tipo: new FormControl<TipoMovimentacao>('ENTRADA', { nonNullable: true }),
    quantidade: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^\d+$/),
    ]),
    observacao: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
  });

  /** Produto escolhido na busca, usado para mostrar o saldo atual. */
  private readonly valorProduto = toSignal(this.produto.valueChanges.pipe(startWith(this.produto.value)), {
    initialValue: this.produto.value,
  });
  protected readonly produtoEscolhido = computed(() => {
    const valor = this.valorProduto();
    return valor && typeof valor === 'object' ? valor : null;
  });

  protected salvar(): void {
    if (this.form.invalid || this.produto.invalid) {
      this.form.markAllAsTouched();
      this.produto.markAsTouched();
      return;
    }

    const produto = this.produto.value as Produto;
    const v = this.form.getRawValue();
    const dados: MovimentacaoRequest = {
      produtoId: produto.id,
      tipo: v.tipo,
      quantidade: v.quantidade as number,
      observacao: v.observacao.trim() || null,
    };

    this.salvando.set(true);
    this.service.registrar(dados).subscribe({
      next: () => {
        this.notificacao.sucesso(v.tipo === 'ENTRADA' ? 'Entrada registrada' : 'Saída registrada');
        this.dialogRef.close(true);
      },
      error: () => this.salvando.set(false),
    });
  }
}

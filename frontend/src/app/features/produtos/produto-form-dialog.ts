import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { catchError, of } from 'rxjs';

import { Categoria, Produto, ProdutoRequest } from '../../core/models/modelos';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { ProdutoService } from '../../core/services/produto.service';

export interface ProdutoFormDados {
  produto?: Produto;
}

@Component({
  selector: 'app-produto-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './produto-form-dialog.html',
})
export class ProdutoFormDialog {
  private readonly dados = inject<ProdutoFormDados | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject<MatDialogRef<ProdutoFormDialog, boolean>>(MatDialogRef);
  private readonly produtoService = inject(ProdutoService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly produto = this.dados?.produto;
  protected readonly editando = !!this.produto;
  protected readonly salvando = signal(false);

  protected readonly categorias = toSignal(
    inject(CategoriaService)
      .listarTodas()
      .pipe(catchError(() => of([] as Categoria[]))),
    { initialValue: [] as Categoria[] },
  );

  protected readonly form = new FormGroup({
    nome: new FormControl(this.produto?.nome ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    sku: new FormControl(this.produto?.sku ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    categoriaId: new FormControl<number | null>(this.produto?.categoria.id ?? null, Validators.required),
    preco: new FormControl<number | null>(this.produto?.preco ?? null, [
      Validators.required,
      Validators.min(0),
    ]),
    estoqueMinimo: new FormControl<number | null>(this.produto?.estoqueMinimo ?? 0, [
      Validators.required,
      Validators.min(0),
    ]),
    descricao: new FormControl(this.produto?.descricao ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    ativo: new FormControl(this.produto?.ativo ?? true, { nonNullable: true }),
  });

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const dados: ProdutoRequest = {
      nome: v.nome.trim(),
      sku: v.sku.trim().toUpperCase(),
      descricao: v.descricao.trim() || null,
      preco: v.preco as number,
      estoqueMinimo: v.estoqueMinimo as number,
      categoriaId: v.categoriaId as number,
      ativo: v.ativo,
    };

    this.salvando.set(true);
    const requisicao = this.produto
      ? this.produtoService.atualizar(this.produto.id, dados)
      : this.produtoService.cadastrar(dados);

    requisicao.subscribe({
      next: () => {
        this.notificacao.sucesso(this.editando ? 'Produto atualizado' : 'Produto cadastrado');
        this.dialogRef.close(true);
      },
      error: () => this.salvando.set(false),
    });
  }
}

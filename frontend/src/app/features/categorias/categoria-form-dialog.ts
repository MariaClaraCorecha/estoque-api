import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Categoria, CategoriaRequest } from '../../core/models/modelos';
import { CategoriaService } from '../../core/services/categoria.service';
import { NotificacaoService } from '../../core/services/notificacao.service';

export interface CategoriaFormDados {
  categoria?: Categoria;
}

@Component({
  selector: 'app-categoria-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>{{ editando ? 'Editar categoria' : 'Nova categoria' }}</h2>
    <form [formGroup]="form" (ngSubmit)="salvar()" novalidate>
      <mat-dialog-content>
        <div class="formulario">
          <mat-form-field appearance="outline" class="largura-total">
            <mat-label>Nome</mat-label>
            <input matInput formControlName="nome" maxlength="100" cdkFocusInitial />
            @if (form.controls.nome.hasError('required')) {
              <mat-error>O nome é obrigatório</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="largura-total">
            <mat-label>Descrição</mat-label>
            <textarea matInput formControlName="descricao" rows="3" maxlength="255"></textarea>
          </mat-form-field>
        </div>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close [disabled]="salvando()">Cancelar</button>
        <button mat-flat-button type="submit" [disabled]="salvando()">
          @if (salvando()) {
            <mat-spinner diameter="18" />
          } @else {
            Salvar
          }
        </button>
      </mat-dialog-actions>
    </form>
  `,
})
export class CategoriaFormDialog {
  private readonly dados = inject<CategoriaFormDados | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly dialogRef = inject<MatDialogRef<CategoriaFormDialog, boolean>>(MatDialogRef);
  private readonly service = inject(CategoriaService);
  private readonly notificacao = inject(NotificacaoService);

  protected readonly categoria = this.dados?.categoria;
  protected readonly editando = !!this.categoria;
  protected readonly salvando = signal(false);

  protected readonly form = new FormGroup({
    nome: new FormControl(this.categoria?.nome ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    descricao: new FormControl(this.categoria?.descricao ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(255)],
    }),
  });

  protected salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const dados: CategoriaRequest = {
      nome: valores.nome.trim(),
      descricao: valores.descricao.trim() || null,
    };

    this.salvando.set(true);
    const requisicao = this.categoria
      ? this.service.atualizar(this.categoria.id, dados)
      : this.service.cadastrar(dados);

    requisicao.subscribe({
      next: () => {
        this.notificacao.sucesso(this.editando ? 'Categoria atualizada' : 'Categoria cadastrada');
        this.dialogRef.close(true);
      },
      error: () => this.salvando.set(false),
    });
  }
}

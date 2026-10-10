import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { Movimentacao, Produto, Resumo } from '../../core/models/modelos';
import { PainelService } from '../../core/services/painel.service';
import { ProdutoService } from '../../core/services/produto.service';

@Component({
  selector: 'app-painel',
  imports: [
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
  ],
  templateUrl: './painel.html',
  styleUrl: './painel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Painel implements OnInit {
  private readonly painelService = inject(PainelService);
  private readonly produtoService = inject(ProdutoService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly carregando = signal(true);
  protected readonly resumo = signal<Resumo | null>(null);
  protected readonly estoqueBaixo = signal<Produto[]>([]);

  protected readonly colunasEstoqueBaixo = ['produto', 'quantidade', 'minimo'];
  protected readonly colunasMovimentacoes = ['data', 'produto', 'tipo', 'quantidade'];

  ngOnInit(): void {
    forkJoin({
      resumo: this.painelService.resumo(),
      estoqueBaixo: this.produtoService.estoqueBaixo(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ resumo, estoqueBaixo }) => {
          this.resumo.set(resumo);
          this.estoqueBaixo.set(estoqueBaixo);
          this.carregando.set(false);
        },
        error: () => this.carregando.set(false),
      });
  }

  protected rotuloTipo(movimentacao: Movimentacao): string {
    return movimentacao.tipo === 'ENTRADA' ? 'Entrada' : 'Saída';
  }
}

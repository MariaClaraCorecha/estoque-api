import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

interface ItemMenu {
  rotulo: string;
  icone: string;
  rota: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly breakpoints = inject(BreakpointObserver);
  private readonly menu = viewChild.required<MatSidenav>('menu');

  protected readonly itens: ItemMenu[] = [
    { rotulo: 'Painel', icone: 'dashboard', rota: '/painel' },
    { rotulo: 'Produtos', icone: 'inventory_2', rota: '/produtos' },
    { rotulo: 'Categorias', icone: 'category', rota: '/categorias' },
    { rotulo: 'Movimentações', icone: 'swap_vert', rota: '/movimentacoes' },
  ];

  /** Em telas pequenas o menu vira uma gaveta que sobrepõe o conteúdo. */
  protected readonly celular = toSignal(
    this.breakpoints.observe(Breakpoints.Handset).pipe(map((estado) => estado.matches)),
    { initialValue: false },
  );
  protected readonly modoMenu = computed(() => (this.celular() ? 'over' : 'side'));

  protected aoNavegar(): void {
    if (this.celular()) {
      this.menu().close();
    }
  }

  protected irParaInicio(): void {
    void this.router.navigateByUrl('/painel');
  }
}

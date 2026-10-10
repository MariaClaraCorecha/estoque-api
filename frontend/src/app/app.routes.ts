import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'painel' },
  {
    path: 'painel',
    title: 'Painel · Estoque',
    loadComponent: () => import('./features/painel/painel').then((m) => m.Painel),
  },
  {
    path: 'produtos',
    title: 'Produtos · Estoque',
    loadComponent: () => import('./features/produtos/produtos-lista').then((m) => m.ProdutosLista),
  },
  {
    path: 'categorias',
    title: 'Categorias · Estoque',
    loadComponent: () => import('./features/categorias/categorias-lista').then((m) => m.CategoriasLista),
  },
  {
    path: 'movimentacoes',
    title: 'Movimentações · Estoque',
    loadComponent: () =>
      import('./features/movimentacoes/movimentacoes-lista').then((m) => m.MovimentacoesLista),
  },
  { path: '**', redirectTo: 'painel' },
];

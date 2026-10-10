package com.estoque.api.resources;

import java.math.BigDecimal;
import java.util.List;

/**
 * Indicadores exibidos no painel inicial.
 */
public record ResumoResource(
        long totalProdutosAtivos,
        long totalCategorias,
        long totalItensEmEstoque,
        BigDecimal valorTotalEmEstoque,
        long produtosComEstoqueBaixo,
        List<MovimentacaoResource> ultimasMovimentacoes
) {
}

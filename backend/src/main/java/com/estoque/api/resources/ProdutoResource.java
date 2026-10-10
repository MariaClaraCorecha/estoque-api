package com.estoque.api.resources;

import com.estoque.api.model.Produto;

import java.math.BigDecimal;

public record ProdutoResource(
        Long id,
        String nome,
        String sku,
        String descricao,
        BigDecimal preco,
        Integer quantidade,
        Integer estoqueMinimo,
        boolean estoqueBaixo,
        Boolean ativo,
        CategoriaResource categoria
) {

    public static ProdutoResource from(Produto p) {
        return new ProdutoResource(
                p.getId(),
                p.getNome(),
                p.getSku(),
                p.getDescricao(),
                p.getPreco(),
                p.getQuantidade(),
                p.getEstoqueMinimo(),
                p.getQuantidade() <= p.getEstoqueMinimo(),
                p.getAtivo(),
                CategoriaResource.from(p.getCategoria())
        );
    }
}

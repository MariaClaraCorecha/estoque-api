package com.estoque.api.resources;

import com.estoque.api.model.MovimentacaoEstoque;
import com.estoque.api.model.TipoMovimentacao;

import java.time.LocalDateTime;

public record MovimentacaoResource(
        Long id,
        Long produtoId,
        String produtoNome,
        TipoMovimentacao tipo,
        Integer quantidade,
        String observacao,
        LocalDateTime criadoEm
) {

    public static MovimentacaoResource from(MovimentacaoEstoque m) {
        return new MovimentacaoResource(
                m.getId(),
                m.getProduto().getId(),
                m.getProduto().getNome(),
                m.getTipo(),
                m.getQuantidade(),
                m.getObservacao(),
                m.getCriadoEm()
        );
    }
}

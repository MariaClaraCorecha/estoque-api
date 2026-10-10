package com.estoque.api.request;

import com.estoque.api.model.TipoMovimentacao;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record MovimentacaoRequest(
        @NotNull(message = "O produto é obrigatório")
        Long produtoId,

        @NotNull(message = "O tipo é obrigatório (ENTRADA ou SAIDA)")
        TipoMovimentacao tipo,

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 1, message = "A quantidade deve ser maior que zero")
        Integer quantidade,

        @Size(max = 255, message = "A observação deve ter no máximo 255 caracteres")
        String observacao
) {
}

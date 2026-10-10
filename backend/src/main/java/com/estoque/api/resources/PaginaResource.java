package com.estoque.api.resources;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Resposta paginada com nomes de campos em português.
 */
public record PaginaResource<T>(
        List<T> itens,
        int pagina,
        int tamanho,
        long totalItens,
        int totalPaginas,
        boolean primeira,
        boolean ultima
) {

    public static <T> PaginaResource<T> from(Page<T> p) {
        return new PaginaResource<>(
                p.getContent(),
                p.getNumber(),
                p.getSize(),
                p.getTotalElements(),
                p.getTotalPages(),
                p.isFirst(),
                p.isLast()
        );
    }
}

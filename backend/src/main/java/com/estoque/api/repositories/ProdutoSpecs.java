package com.estoque.api.repositories;

import com.estoque.api.model.Produto;
import org.springframework.data.jpa.domain.Specification;

/**
 * Filtros dinâmicos da listagem de produtos.
 */
public final class ProdutoSpecs {

    private ProdutoSpecs() {
    }

    /**
     * Combina os filtros informados. Filtros nulos ou em branco são ignorados.
     */
    public static Specification<Produto> filtrar(String busca, Long categoriaId, Boolean ativo) {
        Specification<Produto> spec = (root, query, cb) -> cb.conjunction();

        if (busca != null && !busca.isBlank()) {
            spec = spec.and(porNomeOuSku(busca.trim()));
        }
        if (categoriaId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("categoria").get("id"), categoriaId));
        }
        if (ativo != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("ativo"), ativo));
        }
        return spec;
    }

    private static Specification<Produto> porNomeOuSku(String texto) {
        String padrao = "%" + escapar(texto.toLowerCase()) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("nome")), padrao, '\\'),
                cb.like(cb.lower(root.get("sku")), padrao, '\\')
        );
    }

    /** Impede que % e _ digitados pelo usuário funcionem como curingas. */
    private static String escapar(String texto) {
        return texto.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}

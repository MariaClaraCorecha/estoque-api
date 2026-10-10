package com.estoque.api.resources;

import com.estoque.api.model.Categoria;

public record CategoriaResource(Long id, String nome, String descricao) {

    public static CategoriaResource from(Categoria c) {
        return new CategoriaResource(c.getId(), c.getNome(), c.getDescricao());
    }
}

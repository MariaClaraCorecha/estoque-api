package com.estoque.api.repositories;

import com.estoque.api.model.MovimentacaoEstoque;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {

    @Override
    @EntityGraph(attributePaths = "produto")
    Page<MovimentacaoEstoque> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "produto")
    Page<MovimentacaoEstoque> findByProdutoId(Long produtoId, Pageable pageable);

    boolean existsByProdutoId(Long produtoId);
}

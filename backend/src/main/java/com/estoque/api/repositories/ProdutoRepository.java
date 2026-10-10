package com.estoque.api.repositories;

import com.estoque.api.model.Produto;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Long>, JpaSpecificationExecutor<Produto> {

    boolean existsBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCaseAndIdNot(String sku, Long id);

    boolean existsByCategoriaId(Long categoriaId);

    long countByAtivoTrue();

    /** Carrega a categoria junto, evitando uma consulta extra por linha da página. */
    @Override
    @EntityGraph(attributePaths = "categoria")
    Page<Produto> findAll(Specification<Produto> spec, Pageable pageable);

    /** Trava a linha durante a transação para que duas saídas simultâneas não deixem o saldo negativo. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Produto p where p.id = :id")
    Optional<Produto> buscarParaAtualizar(@Param("id") Long id);

    @Query("select p from Produto p join fetch p.categoria "
            + "where p.ativo = true and p.quantidade <= p.estoqueMinimo order by p.quantidade, p.nome")
    List<Produto> findComEstoqueBaixo();

    @Query("select count(p) from Produto p where p.ativo = true and p.quantidade <= p.estoqueMinimo")
    long contarComEstoqueBaixo();

    /** Soma das unidades dos produtos ativos. Retorna null quando não há produtos. */
    @Query("select sum(p.quantidade) from Produto p where p.ativo = true")
    Long somarQuantidade();

    /** Valor total (preço x quantidade) dos produtos ativos. Retorna null quando não há produtos. */
    @Query("select sum(p.preco * p.quantidade) from Produto p where p.ativo = true")
    BigDecimal somarValorEmEstoque();
}

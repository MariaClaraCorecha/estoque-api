package com.estoque.api.services;

import com.estoque.api.repositories.CategoriaRepository;
import com.estoque.api.repositories.MovimentacaoEstoqueRepository;
import com.estoque.api.repositories.ProdutoRepository;
import com.estoque.api.resources.MovimentacaoResource;
import com.estoque.api.resources.ResumoResource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PainelService {

    private static final int ULTIMAS_MOVIMENTACOES = 5;

    private final ProdutoRepository produtoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    public PainelService(ProdutoRepository produtoRepository,
                         CategoriaRepository categoriaRepository,
                         MovimentacaoEstoqueRepository movimentacaoRepository) {
        this.produtoRepository = produtoRepository;
        this.categoriaRepository = categoriaRepository;
        this.movimentacaoRepository = movimentacaoRepository;
    }

    @Transactional(readOnly = true)
    public ResumoResource resumo() {
        Long itens = produtoRepository.somarQuantidade();
        BigDecimal valor = produtoRepository.somarValorEmEstoque();

        List<MovimentacaoResource> ultimas = movimentacaoRepository
                .findAll(PageRequest.of(0, ULTIMAS_MOVIMENTACOES, Sort.by(Sort.Direction.DESC, "criadoEm")))
                .map(MovimentacaoResource::from)
                .getContent();

        return new ResumoResource(
                produtoRepository.countByAtivoTrue(),
                categoriaRepository.count(),
                itens == null ? 0L : itens,
                valor == null ? BigDecimal.ZERO : valor,
                produtoRepository.contarComEstoqueBaixo(),
                ultimas
        );
    }
}

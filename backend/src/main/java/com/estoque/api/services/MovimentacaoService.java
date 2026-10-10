package com.estoque.api.services;

import com.estoque.api.exceptions.RecursoNaoEncontradoException;
import com.estoque.api.exceptions.RegraNegocioException;
import com.estoque.api.model.MovimentacaoEstoque;
import com.estoque.api.model.Produto;
import com.estoque.api.model.TipoMovimentacao;
import com.estoque.api.repositories.MovimentacaoEstoqueRepository;
import com.estoque.api.request.MovimentacaoRequest;
import com.estoque.api.resources.MovimentacaoResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MovimentacaoService {

    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final ProdutoService produtoService;

    public MovimentacaoService(MovimentacaoEstoqueRepository movimentacaoRepository,
                               ProdutoService produtoService) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.produtoService = produtoService;
    }

    @Transactional(readOnly = true)
    public Page<MovimentacaoResource> listar(Long produtoId, Pageable pageable) {
        Page<MovimentacaoEstoque> pagina = (produtoId == null)
                ? movimentacaoRepository.findAll(pageable)
                : movimentacaoRepository.findByProdutoId(produtoId, pageable);
        return pagina.map(MovimentacaoResource::from);
    }

    @Transactional(readOnly = true)
    public MovimentacaoResource buscarPorId(Long id) {
        return movimentacaoRepository.findById(id)
                .map(MovimentacaoResource::from)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Movimentação", id));
    }

    @Transactional
    public MovimentacaoResource registrar(MovimentacaoRequest request) {
        Produto produto = produtoService.obterParaAtualizar(request.produtoId());

        if (!Boolean.TRUE.equals(produto.getAtivo())) {
            throw new RegraNegocioException("Produto inativo não pode receber movimentações");
        }

        int saldoAtual = produto.getQuantidade();
        int novoSaldo = request.tipo() == TipoMovimentacao.ENTRADA
                ? saldoAtual + request.quantidade()
                : saldoAtual - request.quantidade();

        if (novoSaldo < 0) {
            throw new RegraNegocioException("Estoque insuficiente. Saldo atual: " + saldoAtual);
        }

        produto.setQuantidade(novoSaldo);

        MovimentacaoEstoque movimentacao = new MovimentacaoEstoque();
        movimentacao.setProduto(produto);
        movimentacao.setTipo(request.tipo());
        movimentacao.setQuantidade(request.quantidade());
        movimentacao.setObservacao(request.observacao());

        return MovimentacaoResource.from(movimentacaoRepository.save(movimentacao));
    }
}

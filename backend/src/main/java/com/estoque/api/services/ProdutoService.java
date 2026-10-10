package com.estoque.api.services;

import com.estoque.api.exceptions.RecursoNaoEncontradoException;
import com.estoque.api.exceptions.RegraNegocioException;
import com.estoque.api.model.Produto;
import com.estoque.api.repositories.MovimentacaoEstoqueRepository;
import com.estoque.api.repositories.ProdutoRepository;
import com.estoque.api.repositories.ProdutoSpecs;
import com.estoque.api.request.ProdutoRequest;
import com.estoque.api.resources.ProdutoResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final CategoriaService categoriaService;

    public ProdutoService(ProdutoRepository produtoRepository,
                          MovimentacaoEstoqueRepository movimentacaoRepository,
                          CategoriaService categoriaService) {
        this.produtoRepository = produtoRepository;
        this.movimentacaoRepository = movimentacaoRepository;
        this.categoriaService = categoriaService;
    }

    @Transactional(readOnly = true)
    public Page<ProdutoResource> listar(String busca, Long categoriaId, Boolean ativo, Pageable pageable) {
        return produtoRepository.findAll(ProdutoSpecs.filtrar(busca, categoriaId, ativo), pageable)
                .map(ProdutoResource::from);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResource> listarEstoqueBaixo() {
        return produtoRepository.findComEstoqueBaixo().stream().map(ProdutoResource::from).toList();
    }

    @Transactional(readOnly = true)
    public ProdutoResource buscarPorId(Long id) {
        return ProdutoResource.from(obter(id));
    }

    @Transactional
    public ProdutoResource criar(ProdutoRequest request) {
        String sku = normalizarSku(request.sku());
        if (produtoRepository.existsBySkuIgnoreCase(sku)) {
            throw new RegraNegocioException("Já existe um produto com o SKU '" + sku + "'");
        }
        Produto produto = new Produto();
        aplicar(produto, request);
        produto.setQuantidade(0); // o saldo só muda por movimentações
        return ProdutoResource.from(produtoRepository.save(produto));
    }

    @Transactional
    public ProdutoResource atualizar(Long id, ProdutoRequest request) {
        Produto produto = obter(id);
        String sku = normalizarSku(request.sku());
        if (produtoRepository.existsBySkuIgnoreCaseAndIdNot(sku, id)) {
            throw new RegraNegocioException("Já existe um produto com o SKU '" + sku + "'");
        }
        aplicar(produto, request);
        return ProdutoResource.from(produto);
    }

    /**
     * Exclui o produto. Se ele já tiver movimentações, apenas o desativa para preservar o histórico.
     *
     * @return mensagem descrevendo o que aconteceu
     */
    @Transactional
    public String remover(Long id) {
        Produto produto = obter(id);
        if (movimentacaoRepository.existsByProdutoId(id)) {
            produto.setAtivo(false);
            return "O produto possui movimentações e foi apenas desativado para preservar o histórico";
        }
        produtoRepository.delete(produto);
        return "Produto excluído com sucesso";
    }

    Produto obter(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }

    /** Busca o produto travando a linha, para atualizar o saldo sem corrida entre requisições. */
    Produto obterParaAtualizar(Long id) {
        return produtoRepository.buscarParaAtualizar(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Produto", id));
    }

    private void aplicar(Produto produto, ProdutoRequest request) {
        produto.setNome(request.nome().trim());
        produto.setSku(normalizarSku(request.sku()));
        produto.setDescricao(request.descricao());
        produto.setPreco(request.preco());
        produto.setEstoqueMinimo(request.estoqueMinimo());
        produto.setAtivo(request.ativo() == null ? Boolean.TRUE : request.ativo());
        produto.setCategoria(categoriaService.obter(request.categoriaId()));
    }

    private String normalizarSku(String sku) {
        return sku.trim().toUpperCase();
    }
}

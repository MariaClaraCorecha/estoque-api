package com.estoque.api.services;

import com.estoque.api.exceptions.RecursoNaoEncontradoException;
import com.estoque.api.exceptions.RegraNegocioException;
import com.estoque.api.model.Categoria;
import com.estoque.api.repositories.CategoriaRepository;
import com.estoque.api.repositories.ProdutoRepository;
import com.estoque.api.request.CategoriaRequest;
import com.estoque.api.resources.CategoriaResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProdutoRepository produtoRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, ProdutoRepository produtoRepository) {
        this.categoriaRepository = categoriaRepository;
        this.produtoRepository = produtoRepository;
    }

    @Transactional(readOnly = true)
    public Page<CategoriaResource> listar(String busca, Pageable pageable) {
        String filtro = (busca == null) ? "" : busca.trim();
        return categoriaRepository.findByNomeContainingIgnoreCase(filtro, pageable).map(CategoriaResource::from);
    }

    /** Lista completa e ordenada por nome, usada para preencher listas de seleção. */
    @Transactional(readOnly = true)
    public List<CategoriaResource> listarTodas() {
        return categoriaRepository.findAll(Sort.by("nome")).stream().map(CategoriaResource::from).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResource buscarPorId(Long id) {
        return CategoriaResource.from(obter(id));
    }

    @Transactional
    public CategoriaResource criar(CategoriaRequest request) {
        String nome = request.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCase(nome)) {
            throw new RegraNegocioException("Já existe uma categoria com o nome '" + nome + "'");
        }
        Categoria categoria = new Categoria();
        categoria.setNome(nome);
        categoria.setDescricao(request.descricao());
        return CategoriaResource.from(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResource atualizar(Long id, CategoriaRequest request) {
        Categoria categoria = obter(id);
        String nome = request.nome().trim();
        if (categoriaRepository.existsByNomeIgnoreCaseAndIdNot(nome, id)) {
            throw new RegraNegocioException("Já existe uma categoria com o nome '" + nome + "'");
        }
        categoria.setNome(nome);
        categoria.setDescricao(request.descricao());
        return CategoriaResource.from(categoria);
    }

    @Transactional
    public void remover(Long id) {
        Categoria categoria = obter(id);
        if (produtoRepository.existsByCategoriaId(id)) {
            throw new RegraNegocioException("Não é possível excluir: existem produtos nesta categoria");
        }
        categoriaRepository.delete(categoria);
    }

    Categoria obter(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Categoria", id));
    }
}

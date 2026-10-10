package com.estoque.api.controllers;

import com.estoque.api.request.Paginacao;
import com.estoque.api.request.ProdutoRequest;
import com.estoque.api.resources.MensagemResource;
import com.estoque.api.resources.PaginaResource;
import com.estoque.api.resources.ProdutoResource;
import com.estoque.api.services.ProdutoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/produtos")
@Tag(name = "Produtos", description = "Cadastro e consulta de produtos do estoque")
public class ProdutoController {

    private static final Set<String> CAMPOS_ORDENACAO = Set.of("id", "nome", "sku", "preco", "quantidade");

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lista produtos com paginação, busca por nome ou SKU e filtros")
    public PaginaResource<ProdutoResource> listar(
            @Parameter(description = "Texto para buscar no nome ou no SKU") @RequestParam(required = false) String busca,
            @Parameter(description = "Filtra por categoria") @RequestParam(required = false) Long categoriaId,
            @Parameter(description = "Filtra por situação: true (ativos) ou false (inativos). Omita para todos")
            @RequestParam(required = false) Boolean ativo,
            @Parameter(description = "Número da página, começando em 0") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Itens por página (máximo 100)") @RequestParam(defaultValue = "20") int tamanho,
            @Parameter(description = "Campo de ordenação: id, nome, sku, preco ou quantidade") @RequestParam(defaultValue = "nome") String ordenarPor,
            @Parameter(description = "Direção da ordenação: asc ou desc") @RequestParam(defaultValue = "asc") String direcao) {
        var pageable = Paginacao.de(pagina, tamanho, ordenarPor, direcao, CAMPOS_ORDENACAO);
        return PaginaResource.from(service.listar(busca, categoriaId, ativo, pageable));
    }

    @GetMapping("/estoque-baixo")
    @Operation(summary = "Lista produtos ativos com saldo igual ou abaixo do estoque mínimo")
    public List<ProdutoResource> estoqueBaixo() {
        return service.listarEstoqueBaixo();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca um produto pelo id")
    public ProdutoResource buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra um produto (saldo inicial zero; use movimentações para dar entrada)")
    public ProdutoResource cadastrar(@Valid @RequestBody ProdutoRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza os dados de um produto (não altera o saldo)")
    public ProdutoResource atualizar(@PathVariable Long id, @Valid @RequestBody ProdutoRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui um produto; se já tiver movimentações, apenas o desativa para manter o histórico")
    public MensagemResource excluir(@PathVariable Long id) {
        return new MensagemResource(service.remover(id));
    }
}

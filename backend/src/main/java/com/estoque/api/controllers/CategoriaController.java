package com.estoque.api.controllers;

import com.estoque.api.request.CategoriaRequest;
import com.estoque.api.request.Paginacao;
import com.estoque.api.resources.CategoriaResource;
import com.estoque.api.resources.MensagemResource;
import com.estoque.api.resources.PaginaResource;
import com.estoque.api.services.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/categorias")
@Tag(name = "Categorias", description = "Cadastro e consulta de categorias de produtos")
public class CategoriaController {

    private static final Set<String> CAMPOS_ORDENACAO = Set.of("id", "nome");

    private final CategoriaService service;

    public CategoriaController(CategoriaService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lista categorias com paginação e busca por nome")
    public PaginaResource<CategoriaResource> listar(
            @Parameter(description = "Texto para buscar no nome") @RequestParam(required = false) String busca,
            @Parameter(description = "Número da página, começando em 0") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Itens por página (máximo 100)") @RequestParam(defaultValue = "20") int tamanho,
            @Parameter(description = "Campo de ordenação: id ou nome") @RequestParam(defaultValue = "nome") String ordenarPor,
            @Parameter(description = "Direção da ordenação: asc ou desc") @RequestParam(defaultValue = "asc") String direcao) {
        var pageable = Paginacao.de(pagina, tamanho, ordenarPor, direcao, CAMPOS_ORDENACAO);
        return PaginaResource.from(service.listar(busca, pageable));
    }

    @GetMapping("/todas")
    @Operation(summary = "Lista todas as categorias sem paginação, ordenadas por nome (para listas de seleção)")
    public List<CategoriaResource> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma categoria pelo id")
    public CategoriaResource buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Cadastra uma categoria")
    public CategoriaResource cadastrar(@Valid @RequestBody CategoriaRequest request) {
        return service.criar(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualiza uma categoria")
    public CategoriaResource atualizar(@PathVariable Long id, @Valid @RequestBody CategoriaRequest request) {
        return service.atualizar(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Exclui uma categoria (somente se não tiver produtos)")
    public MensagemResource excluir(@PathVariable Long id) {
        service.remover(id);
        return new MensagemResource("Categoria excluída com sucesso");
    }
}

package com.estoque.api.controllers;

import com.estoque.api.request.MovimentacaoRequest;
import com.estoque.api.request.Paginacao;
import com.estoque.api.resources.MovimentacaoResource;
import com.estoque.api.resources.PaginaResource;
import com.estoque.api.services.MovimentacaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/movimentacoes")
@Tag(name = "Movimentações de estoque", description = "Entradas e saídas que alteram o saldo dos produtos")
public class MovimentacaoController {

    private static final Set<String> CAMPOS_ORDENACAO = Set.of("id", "criadoEm", "quantidade", "tipo");

    private final MovimentacaoService service;

    public MovimentacaoController(MovimentacaoService service) {
        this.service = service;
    }

    @GetMapping
    @Operation(summary = "Lista movimentações, opcionalmente filtrando por produto")
    public PaginaResource<MovimentacaoResource> listar(
            @Parameter(description = "Filtra pelas movimentações de um produto") @RequestParam(required = false) Long produtoId,
            @Parameter(description = "Número da página, começando em 0") @RequestParam(defaultValue = "0") int pagina,
            @Parameter(description = "Itens por página (máximo 100)") @RequestParam(defaultValue = "20") int tamanho,
            @Parameter(description = "Campo de ordenação: id, criadoEm, quantidade ou tipo") @RequestParam(defaultValue = "criadoEm") String ordenarPor,
            @Parameter(description = "Direção da ordenação: asc ou desc") @RequestParam(defaultValue = "desc") String direcao) {
        var pageable = Paginacao.de(pagina, tamanho, ordenarPor, direcao, CAMPOS_ORDENACAO);
        return PaginaResource.from(service.listar(produtoId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Busca uma movimentação pelo id")
    public MovimentacaoResource buscar(@PathVariable Long id) {
        return service.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registra uma entrada ou saída e atualiza o saldo do produto")
    public MovimentacaoResource registrar(@Valid @RequestBody MovimentacaoRequest request) {
        return service.registrar(request);
    }
}

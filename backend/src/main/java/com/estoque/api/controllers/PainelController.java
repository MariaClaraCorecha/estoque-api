package com.estoque.api.controllers;

import com.estoque.api.resources.ResumoResource;
import com.estoque.api.services.PainelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/painel")
@Tag(name = "Painel", description = "Indicadores gerais do estoque")
public class PainelController {

    private final PainelService service;

    public PainelController(PainelService service) {
        this.service = service;
    }

    @GetMapping("/resumo")
    @Operation(summary = "Retorna os indicadores do painel: totais, valor em estoque e últimas movimentações")
    public ResumoResource resumo() {
        return service.resumo();
    }
}

package com.estoque.api.controllers;

import com.estoque.api.exceptions.RecursoNaoEncontradoException;
import com.estoque.api.resources.CategoriaResource;
import com.estoque.api.resources.ProdutoResource;
import com.estoque.api.services.ProdutoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProdutoController.class)
class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProdutoService service;

    private ProdutoResource exemplo() {
        return new ProdutoResource(1L, "Arroz Tio João 5kg", "MER-001", "Pacote 5kg",
                new BigDecimal("29.90"), 45, 20, false, true,
                new CategoriaResource(2L, "Mercearia", "Alimentos básicos"));
    }

    @Test
    void listaProdutosComPaginacaoEmPortugues() throws Exception {
        var pagina = new PageImpl<>(List.of(exemplo()), PageRequest.of(0, 10), 1);
        when(service.listar(eq("arroz"), any(), any(), any())).thenReturn(pagina);

        mockMvc.perform(get("/api/produtos").param("busca", "arroz").param("tamanho", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[0].nome").value("Arroz Tio João 5kg"))
                .andExpect(jsonPath("$.totalItens").value(1))
                .andExpect(jsonPath("$.totalPaginas").value(1))
                .andExpect(jsonPath("$.pagina").value(0));
    }

    @Test
    void buscaPorIdInexistenteRetorna404EmPortugues() throws Exception {
        when(service.buscarPorId(99L)).thenThrow(new RecursoNaoEncontradoException("Produto", 99L));

        mockMvc.perform(get("/api/produtos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro").value("Não encontrado"))
                .andExpect(jsonPath("$.mensagem").value("Produto não encontrado(a) com id 99"));
    }

    @Test
    void cadastroInvalidoRetornaErrosPorCampo() throws Exception {
        String corpoInvalido = """
                {"nome": "", "sku": "", "preco": -1, "estoqueMinimo": 0}
                """;

        mockMvc.perform(post("/api/produtos").contentType(MediaType.APPLICATION_JSON).content(corpoInvalido))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos.nome").value("O nome é obrigatório"))
                .andExpect(jsonPath("$.campos.sku").value("O SKU é obrigatório"))
                .andExpect(jsonPath("$.campos.preco").value("O preço não pode ser negativo"))
                .andExpect(jsonPath("$.campos.categoriaId").value("A categoria é obrigatória"));
    }

    @Test
    void ordenacaoInvalidaRetorna400() throws Exception {
        mockMvc.perform(get("/api/produtos").param("ordenarPor", "senha"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro").value("Requisição inválida"));
    }
}

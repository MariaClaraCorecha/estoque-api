package com.estoque.api.services;

import com.estoque.api.exceptions.RegraNegocioException;
import com.estoque.api.model.Categoria;
import com.estoque.api.model.MovimentacaoEstoque;
import com.estoque.api.model.Produto;
import com.estoque.api.model.TipoMovimentacao;
import com.estoque.api.repositories.MovimentacaoEstoqueRepository;
import com.estoque.api.request.MovimentacaoRequest;
import com.estoque.api.resources.MovimentacaoResource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MovimentacaoServiceTest {

    @Mock
    private MovimentacaoEstoqueRepository movimentacaoRepository;

    @Mock
    private ProdutoService produtoService;

    private MovimentacaoService service;
    private Produto produto;

    @BeforeEach
    void preparar() {
        service = new MovimentacaoService(movimentacaoRepository, produtoService);

        Categoria categoria = new Categoria();
        categoria.setNome("Bebidas");

        produto = new Produto();
        produto.setNome("Água Mineral 500ml");
        produto.setSku("BEB-001");
        produto.setPreco(new BigDecimal("2.50"));
        produto.setQuantidade(10);
        produto.setEstoqueMinimo(2);
        produto.setAtivo(true);
        produto.setCategoria(categoria);
    }

    @Test
    void entradaSomaAoSaldo() {
        when(produtoService.obterParaAtualizar(1L)).thenReturn(produto);
        when(movimentacaoRepository.save(any(MovimentacaoEstoque.class))).thenAnswer(i -> i.getArgument(0));

        MovimentacaoResource resultado = service.registrar(
                new MovimentacaoRequest(1L, TipoMovimentacao.ENTRADA, 5, "Compra"));

        assertThat(produto.getQuantidade()).isEqualTo(15);
        assertThat(resultado.tipo()).isEqualTo(TipoMovimentacao.ENTRADA);
        assertThat(resultado.quantidade()).isEqualTo(5);
    }

    @Test
    void saidaSubtraiDoSaldo() {
        when(produtoService.obterParaAtualizar(1L)).thenReturn(produto);
        when(movimentacaoRepository.save(any(MovimentacaoEstoque.class))).thenAnswer(i -> i.getArgument(0));

        service.registrar(new MovimentacaoRequest(1L, TipoMovimentacao.SAIDA, 4, "Venda"));

        assertThat(produto.getQuantidade()).isEqualTo(6);
    }

    @Test
    void saidaMaiorQueOSaldoEhRecusada() {
        when(produtoService.obterParaAtualizar(1L)).thenReturn(produto);

        assertThatThrownBy(() -> service.registrar(
                new MovimentacaoRequest(1L, TipoMovimentacao.SAIDA, 11, null)))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("Estoque insuficiente")
                .hasMessageContaining("10");

        assertThat(produto.getQuantidade()).isEqualTo(10);
        verify(movimentacaoRepository, never()).save(any());
    }

    @Test
    void saidaIgualAoSaldoZeraOEstoque() {
        when(produtoService.obterParaAtualizar(1L)).thenReturn(produto);
        when(movimentacaoRepository.save(any(MovimentacaoEstoque.class))).thenAnswer(i -> i.getArgument(0));

        service.registrar(new MovimentacaoRequest(1L, TipoMovimentacao.SAIDA, 10, null));

        assertThat(produto.getQuantidade()).isZero();
    }

    @Test
    void produtoInativoNaoRecebeMovimentacao() {
        produto.setAtivo(false);
        when(produtoService.obterParaAtualizar(1L)).thenReturn(produto);

        assertThatThrownBy(() -> service.registrar(
                new MovimentacaoRequest(1L, TipoMovimentacao.ENTRADA, 1, null)))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessageContaining("inativo");

        verify(movimentacaoRepository, never()).save(any());
    }
}

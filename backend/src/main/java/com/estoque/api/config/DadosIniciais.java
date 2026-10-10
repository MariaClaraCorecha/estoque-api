package com.estoque.api.config;

import com.estoque.api.model.TipoMovimentacao;
import com.estoque.api.repositories.CategoriaRepository;
import com.estoque.api.request.CategoriaRequest;
import com.estoque.api.request.MovimentacaoRequest;
import com.estoque.api.request.ProdutoRequest;
import com.estoque.api.services.CategoriaService;
import com.estoque.api.services.MovimentacaoService;
import com.estoque.api.services.ProdutoService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Popula o banco com categorias, produtos e movimentações de exemplo.
 * Só roda quando o banco está vazio. Para desligar: app.seed.enabled=false
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true", matchIfMissing = true)
public class DadosIniciais implements CommandLineRunner {

    private record Item(String categoria, String nome, String sku, String descricao,
                        String preco, int estoqueMinimo, int entrada, int saida) {
    }

    private final CategoriaRepository categoriaRepository;
    private final CategoriaService categoriaService;
    private final ProdutoService produtoService;
    private final MovimentacaoService movimentacaoService;

    public DadosIniciais(CategoriaRepository categoriaRepository,
                         CategoriaService categoriaService,
                         ProdutoService produtoService,
                         MovimentacaoService movimentacaoService) {
        this.categoriaRepository = categoriaRepository;
        this.categoriaService = categoriaService;
        this.produtoService = produtoService;
        this.movimentacaoService = movimentacaoService;
    }

    @Override
    public void run(String... args) {
        if (categoriaRepository.count() > 0) {
            return;
        }

        Map<String, Long> categorias = new LinkedHashMap<>();
        criarCategoria(categorias, "Bebidas", "Águas, refrigerantes e sucos");
        criarCategoria(categorias, "Mercearia", "Alimentos básicos e não perecíveis");
        criarCategoria(categorias, "Limpeza", "Produtos de limpeza doméstica");
        criarCategoria(categorias, "Higiene Pessoal", "Cuidados pessoais e higiene");
        criarCategoria(categorias, "Eletrônicos", "Acessórios e pequenos eletrônicos");
        criarCategoria(categorias, "Papelaria", "Material escolar e de escritório");

        List<Item> itens = List.of(
                new Item("Bebidas", "Água Mineral Crystal sem gás 500ml", "BEB-001", "Garrafa PET 500ml", "2.50", 50, 240, 150),
                new Item("Bebidas", "Refrigerante Guaraná Antarctica 2L", "BEB-002", "Garrafa PET 2 litros", "8.99", 30, 120, 70),
                new Item("Bebidas", "Suco de Laranja Del Valle 1L", "BEB-003", "Caixa 1 litro", "7.49", 20, 60, 25),

                new Item("Mercearia", "Arroz Tio João Tipo 1 5kg", "MER-001", "Pacote 5kg", "29.90", 20, 100, 55),
                new Item("Mercearia", "Feijão Carioca Camil 1kg", "MER-002", "Pacote 1kg", "8.49", 30, 120, 60),
                new Item("Mercearia", "Açúcar Refinado União 1kg", "MER-003", "Pacote 1kg", "4.99", 25, 90, 40),
                new Item("Mercearia", "Café Pilão Torrado e Moído 500g", "MER-004", "Pacote a vácuo 500g", "21.90", 15, 50, 28),
                new Item("Mercearia", "Óleo de Soja Liza 900ml", "MER-005", "Garrafa 900ml", "7.99", 20, 80, 45),

                new Item("Limpeza", "Detergente Ypê Neutro 500ml", "LIM-001", "Frasco 500ml", "2.49", 40, 150, 90),
                new Item("Limpeza", "Sabão em Pó Omo Lavagem Perfeita 1,6kg", "LIM-002", "Caixa 1,6kg", "24.90", 15, 50, 30),
                new Item("Limpeza", "Água Sanitária Qboa 2L", "LIM-003", "Frasco 2 litros", "6.49", 15, 40, 27),

                new Item("Higiene Pessoal", "Sabonete Dove Original 90g", "HIG-001", "Barra 90g", "3.99", 40, 200, 110),
                new Item("Higiene Pessoal", "Creme Dental Colgate Total 12 90g", "HIG-002", "Tubo 90g", "4.49", 30, 120, 70),
                new Item("Higiene Pessoal", "Papel Higiênico Neve Folha Dupla 12 rolos", "HIG-003", "Pacote com 12 rolos", "19.90", 20, 70, 40),
                new Item("Higiene Pessoal", "Shampoo Pantene Restauração 400ml", "HIG-004", "Frasco 400ml", "17.90", 12, 30, 19),

                new Item("Eletrônicos", "Fone de Ouvido Bluetooth JBL Tune 510BT", "ELE-001", "Fone on-ear sem fio", "249.90", 5, 12, 8),
                new Item("Eletrônicos", "Carregador de Parede USB-C 20W", "ELE-002", "Carregador rápido 20W", "79.90", 8, 20, 13),
                new Item("Eletrônicos", "Mouse sem Fio Logitech M170", "ELE-003", "Mouse óptico 2,4GHz", "59.90", 6, 25, 10),

                new Item("Papelaria", "Caderno Universitário Tilibra 10 matérias", "PAP-001", "Capa dura, 160 folhas", "24.90", 20, 80, 35),
                new Item("Papelaria", "Caneta Esferográfica BIC Cristal Azul (cx 50)", "PAP-002", "Caixa com 50 unidades", "39.90", 5, 20, 8),
                new Item("Papelaria", "Papel Sulfite A4 Chamex 500 folhas", "PAP-003", "Resma 75g/m²", "28.90", 20, 90, 50)
        );

        for (Item item : itens) {
            var produto = produtoService.criar(new ProdutoRequest(
                    item.nome(), item.sku(), item.descricao(), new BigDecimal(item.preco()),
                    item.estoqueMinimo(), categorias.get(item.categoria()), true));

            movimentar(produto.id(), TipoMovimentacao.ENTRADA, item.entrada(), "Estoque inicial - compra de fornecedor");
            if (item.saida() > 0) {
                movimentar(produto.id(), TipoMovimentacao.SAIDA, item.saida(), "Vendas do período");
            }
        }

        // Produto descontinuado: aparece como inativo
        var descontinuado = produtoService.criar(new ProdutoRequest(
                "Pilha Alcalina Duracell AA (cartela com 4)", "ELE-004", "Linha descontinuada",
                new BigDecimal("22.90"), 10, categorias.get("Eletrônicos"), true));
        movimentar(descontinuado.id(), TipoMovimentacao.ENTRADA, 15, "Estoque inicial");
        movimentar(descontinuado.id(), TipoMovimentacao.SAIDA, 15, "Venda total do estoque restante");
        produtoService.remover(descontinuado.id());

        log.info("Dados iniciais criados: {} categorias e {} produtos", categorias.size(), itens.size() + 1);
    }

    private void criarCategoria(Map<String, Long> mapa, String nome, String descricao) {
        mapa.put(nome, categoriaService.criar(new CategoriaRequest(nome, descricao)).id());
    }

    private void movimentar(Long produtoId, TipoMovimentacao tipo, int quantidade, String observacao) {
        movimentacaoService.registrar(new MovimentacaoRequest(produtoId, tipo, quantidade, observacao));
    }
}

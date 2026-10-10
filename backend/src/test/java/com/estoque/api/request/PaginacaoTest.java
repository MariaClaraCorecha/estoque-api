package com.estoque.api.request;

import com.estoque.api.exceptions.RequisicaoInvalidaException;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PaginacaoTest {

    private static final Set<String> PERMITIDOS = Set.of("nome", "preco");

    @Test
    void montaPageableComOsParametrosInformados() {
        Pageable pageable = Paginacao.de(2, 15, "preco", "desc", PERMITIDOS);

        assertThat(pageable.getPageNumber()).isEqualTo(2);
        assertThat(pageable.getPageSize()).isEqualTo(15);
        assertThat(pageable.getSort().getOrderFor("preco").getDirection()).isEqualTo(Sort.Direction.DESC);
    }

    @Test
    void limitaOTamanhoMaximoEACorrigePaginaNegativa() {
        Pageable pageable = Paginacao.de(-3, 5000, "nome", "ASC", PERMITIDOS);

        assertThat(pageable.getPageNumber()).isZero();
        assertThat(pageable.getPageSize()).isEqualTo(100);
    }

    @Test
    void recusaCampoDeOrdenacaoInvalido() {
        assertThatThrownBy(() -> Paginacao.de(0, 10, "senha", "asc", PERMITIDOS))
                .isInstanceOf(RequisicaoInvalidaException.class)
                .hasMessageContaining("senha");
    }

    @Test
    void recusaDirecaoInvalida() {
        assertThatThrownBy(() -> Paginacao.de(0, 10, "nome", "cima", PERMITIDOS))
                .isInstanceOf(RequisicaoInvalidaException.class)
                .hasMessageContaining("cima");
    }
}

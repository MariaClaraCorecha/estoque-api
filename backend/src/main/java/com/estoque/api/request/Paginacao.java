package com.estoque.api.request;

import com.estoque.api.exceptions.RequisicaoInvalidaException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

/**
 * Monta o Pageable a partir de parâmetros em português
 * (pagina, tamanho, ordenarPor, direcao).
 */
public final class Paginacao {

    private static final int TAMANHO_MAXIMO = 100;

    private Paginacao() {
    }

    public static Pageable de(int pagina, int tamanho, String ordenarPor, String direcao, Set<String> permitidos) {
        if (!permitidos.contains(ordenarPor)) {
            throw new RequisicaoInvalidaException(
                    "Campo de ordenação inválido: '" + ordenarPor + "'. Use um destes: " + String.join(", ", permitidos));
        }
        Sort.Direction sentido;
        if ("asc".equalsIgnoreCase(direcao)) {
            sentido = Sort.Direction.ASC;
        } else if ("desc".equalsIgnoreCase(direcao)) {
            sentido = Sort.Direction.DESC;
        } else {
            throw new RequisicaoInvalidaException("Direção inválida: '" + direcao + "'. Use 'asc' ou 'desc'");
        }
        int p = Math.max(pagina, 0);
        int t = Math.min(Math.max(tamanho, 1), TAMANHO_MAXIMO);
        return PageRequest.of(p, t, Sort.by(sentido, ordenarPor));
    }
}

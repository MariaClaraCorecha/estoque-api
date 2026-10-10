package com.estoque.api.resources;

import java.time.LocalDateTime;
import java.util.Map;

public record ErroResource(
        int status,
        String erro,
        String mensagem,
        Map<String, String> campos,
        LocalDateTime dataHora
) {

    public static ErroResource of(int status, String erro, String mensagem) {
        return new ErroResource(status, erro, mensagem, null, LocalDateTime.now());
    }

    public static ErroResource of(int status, String erro, String mensagem, Map<String, String> campos) {
        return new ErroResource(status, erro, mensagem, campos, LocalDateTime.now());
    }
}

package com.estoque.api.controllers;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exibe a documentação da API com Scalar em http://localhost:8080/scalar
 * O OpenAPI é gerado pelo springdoc em /v3/api-docs.
 */
@RestController
@Hidden
public class ScalarController {

    private static final String HTML = """
            <!doctype html>
            <html lang="pt-BR">
            <head>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <title>API de Estoque - Scalar</title>
            </head>
            <body>
              <script id="api-reference" data-url="/v3/api-docs"></script>
              <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
            </body>
            </html>
            """;

    @GetMapping(value = "/scalar", produces = MediaType.TEXT_HTML_VALUE)
    public String scalar() {
        return HTML;
    }
}

package com.estoque.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI estoqueOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("API de Estoque")
                .version("v1")
                .description("API para controle de categorias, produtos e movimentações de estoque."));
    }
}

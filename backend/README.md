# Backend — Estoque API

API REST em Java 21 + Spring Boot 3.5 com PostgreSQL. A documentação completa (endpoints, regras e configuração) está no [README da raiz](../README.md).

```bash
docker compose up -d          # na raiz: sobe o PostgreSQL
cd backend
mvn spring-boot:run           # ou execute EstoqueApplication no IntelliJ
mvn test                      # testes (não precisam de banco)
```

- API: http://localhost:8080
- Documentação (Scalar): http://localhost:8080/scalar

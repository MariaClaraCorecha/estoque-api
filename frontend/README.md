# Frontend — Estoque Web

Interface em Angular 20 + Angular Material (Material 3) + TypeScript. A documentação completa está no [README da raiz](../README.md).

```bash
npm install
npm start          # http://localhost:4200 (a API deve estar em http://localhost:8080)
npm run test:ci    # testes em Chrome headless
npm run build      # build de produção em dist/estoque-web/browser
```

Em desenvolvimento, as chamadas a `/api` são encaminhadas para o backend pelo `proxy.conf.json`.
Se a API estiver em outra porta, altere o `target` desse arquivo.

Depois do primeiro `npm install`, faça commit do `package-lock.json` gerado.

## Organização

| Pasta | Conteúdo |
|---|---|
| `src/app/core` | Modelos, serviços HTTP, interceptor de erros e textos do paginador em português |
| `src/app/shared` | Componentes reutilizáveis (diálogo de confirmação, busca de produto) |
| `src/app/features` | Telas: painel, produtos, categorias e movimentações |

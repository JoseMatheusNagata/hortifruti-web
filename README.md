# Painel Web — Hortifrúti (ReactJS)

React 18 + Vite + TypeScript + axios + react-router-dom + lucide-react.
Consome a API `hortifruti-api` (Node/Fastify).

## Rodar
```bash
cp .env.example .env     # VITE_API_URL=http://localhost:3334
npm install
npm run dev              # http://localhost:5173
```
Login: `admin@hortifruti.com` / `admin123` (criado pelo seed da API).

## Telas
- **Login** (somente ADMIN)
- **Produtos**: listar, filtrar por categoria/busca, criar, editar, desativar e criar categoria
- **Pedidos**: listar, filtrar por status, ver itens/endereço e alterar status
- **Relatórios**: total faturado, pedidos pagos, ticket médio e ranking de produtos por período

## Build / GitHub Pages
`npm run build` gera `dist/`. Usa `HashRouter` e `base: './'`, então funciona no GitHub Pages.
Em produção, defina `VITE_API_URL` apontando para a API publicada.

# Deploy no Vercel

Este projeto foi ajustado para subir no Vercel como aplicação estática Vite/React.

## Configurações no Vercel

- Framework Preset: **Vite**
- Build Command: **pnpm run build**
- Output Directory: **dist**
- Install Command: **pnpm install**

O arquivo `vercel.json` já define essas configurações e também inclui rewrite para SPA.

## O que foi corrigido

- Removido o uso de `server/index.ts` com Express.
- Build agora gera somente arquivos estáticos.
- `vite.config.ts` simplificado.
- `outputDirectory` ajustado para `dist`.
- Rewrites configurados para não quebrar rotas do React.

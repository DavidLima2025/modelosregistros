# Deploy no Vercel

Este projeto está configurado para subir como aplicação estática Vite/React.

## Configurações

- Framework Preset: **Vite**
- Install Command: **pnpm install --no-frozen-lockfile**
- Build Command: **pnpm run build**
- Output Directory: **dist**

## Erro corrigido

O Vercel usa `frozen-lockfile` em ambiente CI. Como o `package.json` foi ajustado, o `pnpm-lock.yaml` pode ficar diferente. Por isso o `installCommand` foi ajustado para:

```bash
pnpm install --no-frozen-lockfile
```

Isso permite que o Vercel atualize o lockfile durante a instalação e siga com o build.

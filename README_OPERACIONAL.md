# Guia Operacional do Sistema de Registros BSC

Este documento fornece um passo a passo resumido para instalação,
execução e uso do sistema de registros desenvolvido para a **Base de
Segurança Comunitária de Rio Branco**. O objetivo é facilitar a
implantação em ambientes de produção (Netlify/Vercel) e orientar os
usuários sobre os principais fluxos de trabalho.

## Pré‑requisitos

- **Node.js** versão 18 ou superior.
- **pnpm** para gerenciamento de pacotes (o projeto usa `pnpm` por
  padrão, mas pode ser adaptado para `npm` ou `yarn`).

## Instalação

1. Clone o repositório ou faça o download do pacote.
2. Acesse o diretório do projeto no terminal:

   ```bash
   cd registro-policial-bsc
   ```

3. Instale as dependências:

   ```bash
   pnpm install
   ```

## Desenvolvimento

Para iniciar o servidor de desenvolvimento com recarregamento automático:

```bash
pnpm run dev
```

O aplicativo ficará disponível em `http://localhost:3000`. Qualquer
alteração nos arquivos **TypeScript/React** será refletida
imediatamente.

## Build de Produção

Para gerar uma versão otimizada para produção:

```bash
pnpm run build
```

O comando acima cria a pasta `dist` com os arquivos estáticos do
cliente em `dist/public` e o servidor **Express** transpilado para
JavaScript dentro de `dist`. Esta pasta pode ser implantada em um
provedor de hospedagem ou container Docker.

## Execução em Produção

Após a etapa de build, execute o servidor usando:

```bash
pnpm run start
```

O script inicia o servidor **Express** que serve os arquivos
estáticos gerados em `dist/public` e lida com o roteamento client
side.

## Considerações de Implantação

- O arquivo `client/index.html` foi simplificado, removendo o
  carregamento automático de fontes externas e scripts de
  acompanhamento que dependiam de variáveis de ambiente (`VITE_ANALYTICS_ENDPOINT`).
  Se desejar incluir serviços de análise ou monitoramento, adicione
  explicitamente o script desejado no `<head>`.
- Para implantar em plataformas como **Netlify** ou **Vercel**, a
  pasta `dist/public` pode ser configurada como diretório de saída. Se
  optar por usar o servidor **Express** integrado, será necessário
  configurar a plataforma para executar `pnpm run start`.

## Uso Básico

1. Acesse a aplicação em seu navegador.
2. Navegue pelos diferentes modelos disponíveis na sidebar para cada
   tipo de ocorrência (extravio, furto/roubo, estelionato, etc.).
3. Preencha os campos obrigatórios; elementos condicionais aparecem
   conforme a seleção de opções.
4. O botão **Gerar histórico** cria um resumo da ocorrência que pode
   ser copiado ou impresso.
5. Utilize a **Biblioteca técnica** para incluir frases padrões ou
   criar novos modelos de texto. Você pode editar ou excluir cada
   entrada conforme necessário.

## Contribuições

Sinta‑se à vontade para sugerir melhorias ou reportar problemas.
O projeto busca evoluir constantemente para atender às demandas
operacionais da PMMG.

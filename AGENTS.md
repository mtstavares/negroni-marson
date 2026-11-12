# Fluxo de desenvolvimento e publicação

- Use a branch `teste` para melhorias, correções, commits e pushes de desenvolvimento. Antes de editar, confira `git status` e a branch atual; preserve alterações existentes.
- Um pedido genérico de “commit e push” autoriza enviar para `teste`, não publicar em produção.
- A branch `main` é produção. O GitHub Pages publica sua raiz e usa o domínio `www.negronimarson.com.br`.
- Para integrar mudanças em `main`, use um Pull Request de `teste` para `main`. Só faça o merge após aprovação explícita do usuário para publicar aquela versão. Não habilite merge automático.
- Não envie commits diretamente para `main` e não desative, reduza ou contorne sua proteção para conseguir publicar.
- A proteção exige Pull Request inclusive para administradores, bloqueia force push e exclusão e exige resolver conversas antes do merge. Não exige revisão de uma segunda conta; a autorização de produção é dada pelo usuário no chat.
- Depois de uma publicação aprovada, sincronize `teste` com `main` antes do próximo ciclo, preservando o histórico e o trabalho existente.

# Arquivos e validação

- Edite conteúdo e estrutura em `src/index.template.html`. O `index.html` da raiz e `dist/` são gerados pelo build.
- A história completa fica em `src/historia.template.html`; `historia.html` na raiz e em `dist/` também é gerado e deve acompanhar o commit. Cabeçalho e rodapé são compartilhados a partir do template principal.
- `site.config.json` centraliza o domínio e os links oficiais. Preserve `CNAME` e a publicação pela branch `main`.
- Use `npm.cmd run dev` para prévia local, normalmente em `http://127.0.0.1:4173`.
- Antes de entregar mudanças de código, execute as verificações apropriadas (`npm.cmd run check`) e gere o build (`npm.cmd run build`), incluindo o `index.html` gerado no commit quando mudar.
- Inspecione desktop, mobile, imagens e pedidos quando o navegador estiver disponível. Informe limitações reais de validação.

# Listas (React Native)

Listas de propósito geral (compras, tarefas, desejos, lembretes) para Android, feita em
React Native com Expo (SDK 58). Equivalente ao [listas-web](https://github.com/jooemanoel/listas-web)
(Vue/PWA): usa a mesma API ([listas-api](https://github.com/jooemanoel/listas-api)), as mesmas
regras de sessão e de modo offline e as mesmas cores.

## Instalação

Baixe o APK da [última release](https://github.com/jooemanoel/listas-mobile/releases/latest)
direto no celular e abra o arquivo. Requer Android 7.0 ou superior.

## Comandos

```bash
npm install
npm start          # servidor de desenvolvimento: ler o QR code com o app Expo Go no celular
npm run android    # compila e instala no emulador/celular via USB (precisa do Android SDK)
npm run lint       # ESLint (regras do Expo)
npm run icones     # regera os ícones e a splash em assets/ (símbolo "checklist")
```

### API

Por padrão o app usa a API publicada (`https://listas-api-plum.vercel.app`). Para usar
outra (por exemplo, a API rodando no seu computador com `npm run dev:memoria`), copie o
[.env.example](.env.example) para `.env.local` e ajuste `EXPO_PUBLIC_API_URL`. No emulador
Android, o `localhost` do computador é `10.0.2.2`; num celular, use o IP do computador na
rede local. O valor é embutido no app na hora do build.

## Telas

A barra superior tem três botões com ícones, como na versão web:

| Ícone | Ação |
|---|---|
| `playlist_add` | Nova lista |
| `format_list_bulleted` | Minhas listas |
| `logout` | Sair |

- **Minhas listas**: nome e número de itens; tocar abre a lista, a lixeira exclui a lista com todos os itens (com confirmação).
- **Lista**: campo fixo no topo para adicionar (Enter adiciona e mantém o teclado aberto para o próximo item); não há marcação: o que foi resolvido (comprado, feito) é removido, e a lista mostra só o que está pendente. O botão de copiar gera o texto para colar no WhatsApp (título em negrito, um item por linha).
- O botão "voltar" do Android volta para a tela anterior; em "Minhas listas", fecha o app.
- **Listas de lembretes** (escolha o tipo ao criar a lista): cada item é um texto livre, guardado
  exatamente como foi colado (várias linhas, maiúsculas e minúsculas, emojis), até 3000
  caracteres. Serve para a mensagem de uma consulta marcada, um endereço, um recado. O campo
  tem um botão para colar da área de transferência; lembretes longos aparecem recolhidos
  ("Mostrar tudo"); cada um pode ser copiado ou removido (com confirmação).

## Aviso de versão nova

Ao abrir, o app consulta a release marcada como *Latest* neste repositório
(`api.github.com/repos/jooemanoel/listas-mobile/releases/latest`, ao abrir e ao voltar para o app, no máximo uma vez por hora,
com a resposta guardada no aparelho). Se a versão dela for maior que a do `app.json`, aparece
um cartão com o botão para baixar o APK. "Depois" esconde o aviso daquela versão até o app ser aberto de novo.
Por isso, ao lançar uma versão, a tag da release deve ser `vX.Y.Z` igual ao `version` do
`app.json`, com o `.apk` anexado.

## Modo offline

Mesmas regras do listas-web (detalhes no [README de lá](https://github.com/jooemanoel/listas-web#modo-offline)):

- As listas, como o servidor as devolveu da última vez, ficam guardadas no aparelho, por
  usuário. Ao abrir o app, essa cópia aparece na hora e depois é atualizada pelo servidor.
- Criar/excluir lista e adicionar/remover item entram numa fila (o histórico). A tela
  mostra a cópia do servidor com a fila aplicada por cima, então tudo responde na hora.
- Online, a fila é enviada logo em seguida (`POST /listas/sincronizar`). Sem conexão (ou sem
  resposta em 15 s), aparece o chip *Offline* na barra e o cartão com as alterações guardadas,
  o histórico e o aviso para **não alterar as listas em outro aparelho até sincronizar**.
- Reconexão: tenta de novo a cada 30 s, ao voltar para o app e no botão *Tentar agora*. Se a
  lista mudou em outro aparelho, as alterações daqui são aplicadas por cima e o app avisa.
- **Sair** apaga a cópia do aparelho (com confirmação se houver alterações não enviadas). Se a
  sessão só expirar, a cópia fica guardada e sincroniza quando a pessoa entrar de novo.
- As listas são de uso geral: por isso podem ficar guardadas no aparelho. Não use o app para
  dados sensíveis.

## Gerar o APK

### Opção 1: na nuvem com EAS (não precisa de Android SDK)

```bash
npx eas-cli@latest login         # conta gratuita em expo.dev
npm run apk                      # = eas build -p android --profile apk
```

No primeiro build o EAS pergunta se pode criar o projeto e a chave de assinatura;
responda que sim. Ao final, ele mostra um link (e um QR code) para baixar o `.apk`.
O perfil `production` do [eas.json](eas.json) gera `.aab` para a Play Store.

### Opção 2: local (precisa do Android SDK)

Os requisitos são os mesmos do [biblia-simples-mobile](https://github.com/jooemanoel/biblia-simples-mobile#op%C3%A7%C3%A3o-2--local-precisa-do-android-sdk):
JDK 17 a 21, Android SDK com `cmake/3.31.6` e caminhos longos ativos no Windows.

```bash
npm run apk:local
# APK em android/app/build/outputs/apk/release/app-release.apk
```

O `prebuild --clean` apaga e recria a pasta `android/` a partir do [app.json](app.json)
(ela não é versionada: não edite à mão), então copie o APK para outro lugar antes de gerar
outro. Sem uma chave própria, o release local é assinado com a chave de depuração: serve
para instalar no seu celular, não para publicar na loja. O plugin
[plugins/cmake-recente.js](plugins/cmake-recente.js) é o mesmo do biblia-simples-mobile.

## Estrutura

```
App.js                              barra superior, navegação (pilha de telas) e "Sair"
src/estado/listas.js                listas, cópia no aparelho, fila de alterações e sincronização (= useListas.js da versão Vue)
src/estado/sessao.js                token JWT e nome do usuário
src/estado/aviso.js                 mensagens no rodapé
src/estado/loja.js                  estado global lido com useSyncExternalStore (faz o papel dos ref() do Vue)
src/servicos/api.js                 chamadas à listas-api (token no cabeçalho Authorization)
src/servicos/armazenamento.js       gravação no aparelho (expo-sqlite/kv-store)
src/servicos/atualizacao.js         consulta a última release no GitHub (aviso de versão nova)
src/telas/                          login, minhas listas, nova lista, lista
src/componentes/                    barra superior, cartão do modo offline, aviso, botões, campo, ícones SVG
src/estilos.js                      cores e estilos (equivale ao estilo.css)
src/formatar.js                     datas ("hoje às 14:32") e texto para o WhatsApp
```

## Diferenças em relação à versão Vue

| | Vue (PWA) | React Native |
|---|---|---|
| Dados locais | `localStorage` | `expo-sqlite/kv-store` (mesmo formato) |
| Navegação | `#` do endereço | pilha de telas; botão "voltar" do Android |
| Confirmação | `confirm()` | `Alert` nativo |
| Copiar lista | `navigator.clipboard` | `expo-clipboard` |
| Reconexão | eventos `online` e `visibilitychange` | a cada 30 s e ao voltar para o app (`AppState`) |
| Histórico do modo offline | `<details>` | "Ver alterações" abre e fecha a lista |

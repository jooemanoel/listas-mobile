// Estado das listas do usuário, com modo offline (mesmas regras do listas-web).
//
// O aparelho guarda (no kv-store, por usuário):
//   servidor  as listas como o servidor as devolveu da última vez, cada uma com o seu
//             atualizadoEm (a hora da última alteração gravada no Firestore);
//   fila      as alterações feitas aqui que o servidor ainda não recebeu, em ordem.
//             É o histórico: cada uma tem a hora local (`em`), um texto para exibir
//             (`rotulo`) e o atualizadoEm da lista que este aparelho conhecia (`base`).
//
// O que aparece na tela é sempre `servidor` com a `fila` aplicada por cima. Assim toda
// ação responde na hora, com ou sem internet.
//
// Toda alteração entra na fila e a fila é enviada a POST /listas/sincronizar. Online,
// isso acontece logo em seguida; offline, quando a conexão voltar. O servidor compara a
// `base` com o atualizadoEm do Firestore: se o Firestore for mais novo, a lista também
// mudou em outro aparelho, e o usuário é avisado (as alterações daqui são aplicadas
// mesmo assim, item a item).
import { AppState } from "react-native";
import * as api from "../servicos/api";
import { gravarLocal, lerLocal, removerLocal } from "../servicos/armazenamento";
import { avisar, avisarErro } from "./aviso";
import { criarLoja, useLoja } from "./loja";

const TAMANHO_LOTE = 200; // operações por requisição
const NOVA_TENTATIVA = 30000; // ms entre tentativas de reconexão

const loja = criarLoja({
  /** Listas como o servidor as conhece (null = ainda não carregadas). */
  servidor: null,
  /** Alterações pendentes, da mais antiga para a mais nova. */
  fila: [],
  /** "online" | "offline" | "sincronizando" */
  conexao: "online",
  /** Hora (ISO) da última sincronização bem-sucedida. */
  sincronizadoEm: null,
});
const estado = loja.obter;
const definir = loja.definir;

let usuarioId = null;
let sincronizando = false;
let temporizador = null;

// ---------- armazenamento no aparelho ----------

const chave = (id) => `usuario:${id}`;

function salvar() {
  if (!usuarioId) return;
  const { servidor, fila, sincronizadoEm } = estado();
  gravarLocal(chave(usuarioId), { servidor, fila, sincronizadoEm });
}

// ---------- utilitários ----------

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** Id aleatório de 20 caracteres (mesmo formato dos ids do Firestore). */
function novoId() {
  const bytes = new Uint8Array(20);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join("");
}

/** Igual à API: espaços aparados e em maiúsculas. */
export const normalizar = (texto) => String(texto ?? "").replace(/\s+/g, " ").trim().toUpperCase();

const ordenar = (listas) => [...listas].sort((a, b) => a.nome.localeCompare(b.nome));

// ---------- aplicar a fila sobre as listas do servidor ----------

/** Mesmas regras da API (routes/listas.js): o que ela recusaria, aqui também é ignorado. */
function aplicar(listas, op) {
  const i = listas.findIndex((l) => l.id === op.listaId);

  if (op.tipo === "criarLista") {
    if (i < 0) listas.push({ id: op.listaId, nome: op.nome, itens: [], criadoEm: op.em, atualizadoEm: op.em, pendente: true });
    return;
  }
  if (i < 0) return;
  if (op.tipo === "excluirLista") {
    listas.splice(i, 1);
    return;
  }

  const lista = listas[i];
  let itens = lista.itens;
  if (op.tipo === "adicionarItem") {
    if (itens.some((it) => it.id === op.itemId || it.nome === op.nome)) return;
    itens = [...itens, { id: op.itemId, nome: op.nome, marcado: false }];
  } else if (op.tipo === "marcarItem") {
    if (!itens.some((it) => it.id === op.itemId)) return;
    itens = itens.map((it) => (it.id === op.itemId ? { ...it, marcado: op.marcado } : it));
  } else if (op.tipo === "removerItem") {
    itens = itens.filter((it) => it.id !== op.itemId);
  }
  listas[i] = { ...lista, itens, atualizadoEm: op.em, pendente: true };
}

// Listas exibidas: as do servidor com as alterações pendentes por cima.
// Só recalcula quando `servidor` ou `fila` mudam (como um computed do Vue).
let calculado = { servidor: undefined, fila: undefined, listas: null };

function listasExibidas() {
  const { servidor, fila } = estado();
  if (calculado.servidor !== servidor || calculado.fila !== fila) {
    let listas = null;
    if (servidor) {
      const copia = servidor.map((l) => ({ ...l }));
      fila.forEach((op) => aplicar(copia, op));
      listas = ordenar(copia);
    }
    calculado = { servidor, fila, listas };
  }
  return calculado.listas;
}

function encontrar(id) {
  return listasExibidas()?.find((l) => l.id === id) ?? null;
}

// ---------- conexão ----------

function entrarOffline() {
  if (estado().conexao !== "offline") {
    definir({ conexao: "offline" });
    avisar("Sem conexão. Modo offline: as alterações ficam guardadas neste aparelho.", "erro");
  }
  clearTimeout(temporizador);
  temporizador = setTimeout(atualizar, NOVA_TENTATIVA);
}

function ficarOnline() {
  clearTimeout(temporizador);
  if (estado().conexao === "offline") avisar("Conexão restabelecida.");
  definir({ conexao: "online" });
}

/** Trata a falha de uma chamada. Devolve true se foi falta de conexão. */
function falhou(erro) {
  if (erro?.status === 0) {
    entrarOffline();
    return true;
  }
  if (erro?.status !== 401) avisarErro(erro); // 401: a sessão já foi encerrada
  if (estado().conexao === "sincronizando") definir({ conexao: "online" });
  return false;
}

// ---------- sincronização ----------

/** Incorpora a resposta de POST /listas/sincronizar e tira da fila o que foi enviado. */
function incorporar(lote, resposta) {
  const excluidas = new Set(resposta.excluidas);
  const novas = new Map(resposta.listas.map((l) => [l.id, l]));

  const base = (estado().servidor ?? []).filter((l) => !excluidas.has(l.id) && !novas.has(l.id));

  // As alterações feitas durante o envio partem do estado que acabou de ser gravado:
  // a base delas passa a ser o novo atualizadoEm (senão pareceriam um conflito).
  const enviadas = new Set(lote.map((op) => op.id));
  const fila = estado()
    .fila.filter((op) => !enviadas.has(op.id))
    .map((op) => (novas.has(op.listaId) ? { ...op, base: novas.get(op.listaId).atualizadoEm } : op));

  definir({ servidor: [...base, ...novas.values()], fila, sincronizadoEm: new Date().toISOString() });
  salvar();

  // Devolve true se mostrou um aviso (para não ser coberto por "Conexão restabelecida").
  if (resposta.conflitos.length) {
    const nomes = [...new Set(resposta.conflitos.map((id) => lote.find((op) => op.listaId === id)?.rotuloLista))].filter(
      Boolean
    );
    avisar(
      `Atenção: ${nomes.length ? nomes.join(", ") : "uma lista"} também foi alterada em outro aparelho. ` +
        "Suas alterações foram aplicadas por cima; confira a lista.",
      "erro",
      10000
    );
    return true;
  }
  if (resposta.ignoradas.length) {
    const n = resposta.ignoradas.length;
    avisar(
      `${n} ${n === 1 ? "alteração não pôde ser aplicada" : "alterações não puderam ser aplicadas"}: ${resposta.ignoradas[0].motivo}`,
      "erro",
      8000
    );
    return true;
  }
  return false;
}

/** Envia a fila em lotes. Se a conexão cair no meio, o que falta continua na fila. */
async function sincronizar() {
  if (sincronizando || !usuarioId || !estado().fila.length) return;
  const dono = usuarioId;
  const estavaOffline = estado().conexao === "offline";
  sincronizando = true;
  definir({ conexao: "sincronizando" });
  try {
    let avisou = false;
    while (estado().fila.length && usuarioId === dono) {
      const lote = estado().fila.slice(0, TAMANHO_LOTE);
      const resposta = await api.sincronizar(lote);
      if (usuarioId !== dono) return; // saiu durante o envio
      avisou = incorporar(lote, resposta) || avisou;
    }
    if (estavaOffline && !avisou) avisar("Conexão restabelecida. Alterações sincronizadas.");
    clearTimeout(temporizador);
    definir({ conexao: "online" });
  } catch (erro) {
    falhou(erro); // sem conexão: modo offline, com nova tentativa agendada
  } finally {
    sincronizando = false;
  }
}

/** Envia o que estiver pendente e busca as listas atualizadas do servidor. */
async function atualizar() {
  if (!usuarioId) return;
  if (estado().fila.length) {
    await sincronizar();
    if (estado().conexao === "offline" || estado().fila.length) return;
  }
  const dono = usuarioId;
  try {
    const recebidas = await api.buscarListas();
    if (usuarioId !== dono) return;
    definir({ servidor: recebidas, sincronizadoEm: new Date().toISOString() });
    salvar();
    ficarOnline();
  } catch (erro) {
    falhou(erro);
  }
}

/** Registra uma alteração: aparece na tela na hora e vai para a fila. */
function registrar(op, rotulo) {
  const lista = estado().servidor?.find((l) => l.id === op.listaId);
  const rotuloLista = encontrar(op.listaId)?.nome ?? op.nome;
  definir({
    fila: [
      ...estado().fila,
      { id: novoId(), em: new Date().toISOString(), base: lista?.atualizadoEm ?? null, rotulo, rotuloLista, ...op },
    ],
  });
  salvar();
  // Offline, espera a próxima tentativa (ou a volta ao app) para não insistir a cada toque.
  if (estado().conexao !== "offline") sincronizar();
}

// Ao voltar para o app (estava em segundo plano), tenta de novo se estiver offline.
// Faz o papel dos eventos "online" e "visibilitychange" da versão web.
AppState.addEventListener("change", (situacao) => {
  if (situacao === "active" && estado().conexao === "offline") atualizar();
});

// ---------- ações ----------

/** Troca de usuário ou sessão expirada: esquece da memória, mas mantém o que está no aparelho. */
function descarregar() {
  usuarioId = null;
  clearTimeout(temporizador);
  definir({ servidor: null, fila: [], sincronizadoEm: null, conexao: "online" });
}

const acoes = {
  encontrar,
  atualizar,
  descarregar,

  /** Ao entrar: mostra a cópia guardada no aparelho na hora e depois sincroniza. */
  async carregar(id) {
    usuarioId = id;
    const salvo = lerLocal(chave(id));
    definir({
      servidor: salvo?.servidor ?? null,
      fila: salvo?.fila ?? [],
      sincronizadoEm: salvo?.sincronizadoEm ?? null,
    });
    await atualizar();
  },

  /** Ao abrir uma lista: busca a versão do servidor (pode ter mudado em outro aparelho). */
  async abrir(id) {
    if (!usuarioId || estado().conexao === "offline" || estado().fila.length) return;
    const dono = usuarioId;
    try {
      const lista = await api.buscarLista(id);
      const { servidor, fila } = estado();
      if (usuarioId !== dono || fila.length || !servidor) return;
      definir({ servidor: [...servidor.filter((l) => l.id !== id), lista] });
      salvar();
    } catch (erro) {
      const { servidor } = estado();
      if (erro.status === 404 && servidor) {
        definir({ servidor: servidor.filter((l) => l.id !== id) });
        salvar();
      } else {
        falhou(erro);
      }
    }
  },

  criar(nome) {
    const id = novoId();
    const nomeFinal = normalizar(nome);
    registrar({ tipo: "criarLista", listaId: id, nome: nomeFinal }, `Criou a lista ${nomeFinal}`);
    return id;
  },

  excluir(id) {
    const lista = encontrar(id);
    registrar({ tipo: "excluirLista", listaId: id }, `Excluiu a lista ${lista?.nome ?? ""}`);
  },

  /** Devolve false (com aviso) se o item já estiver na lista. */
  adicionarItem(listaId, nome) {
    const lista = encontrar(listaId);
    const nomeFinal = normalizar(nome);
    if (lista?.itens.some((i) => i.nome === nomeFinal)) {
      avisar(`"${nomeFinal}" já está na lista`, "erro");
      return false;
    }
    registrar(
      { tipo: "adicionarItem", listaId, itemId: novoId(), nome: nomeFinal },
      `Adicionou ${nomeFinal} em ${lista?.nome ?? ""}`
    );
    return true;
  },

  marcarItem(listaId, item, marcado) {
    const lista = encontrar(listaId);
    registrar(
      { tipo: "marcarItem", listaId, itemId: item.id, marcado },
      `${marcado ? "Marcou" : "Desmarcou"} ${item.nome} em ${lista?.nome ?? ""}`
    );
  },

  removerItem(listaId, item) {
    const lista = encontrar(listaId);
    registrar({ tipo: "removerItem", listaId, itemId: item.id }, `Removeu ${item.nome} de ${lista?.nome ?? ""}`);
  },

  /** Sair: apaga também a cópia guardada no aparelho (inclusive alterações não enviadas). */
  apagarDoAparelho() {
    if (usuarioId) removerLocal(chave(usuarioId));
    descarregar();
  },
};

/** Estado atual ({ listas, fila, conexao, sincronizadoEm }) e as ações. */
export function useListas() {
  const { fila, conexao, sincronizadoEm } = useLoja(loja);
  return { listas: listasExibidas(), fila, conexao, sincronizadoEm, ...acoes };
}

/** Para quem não é componente (ex.: confirmação ao sair). */
export const obterFila = () => estado().fila;

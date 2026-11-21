// Sessão do usuário: o token (JWT) emitido pela listas-api e o nome para exibir.
//
// Nada sensível fica no aparelho: nem senha, nem dados que deem acesso a outra
// conta. O token é assinado pela API; alterá-lo o invalida.
import { gravarLocal, lerLocal, removerLocal } from "../servicos/armazenamento";
import { criarLoja, useLoja } from "./loja";

const CHAVE = "sessao";

function lerSessao() {
  const sessao = lerLocal(CHAVE);
  return sessao?.token && !expirado(sessao.token) ? sessao : null;
}

/** Lê a validade gravada no próprio token (sem conferir a assinatura: isso é papel da API). */
function expirado(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const carga = JSON.parse(atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4)));
    return typeof carga.exp === "number" && carga.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

const loja = criarLoja({ sessao: lerSessao() });

export const obterToken = () => loja.obter().sessao?.token ?? null;

/** Usuário logado ({ id, nome }) ou null. */
export function useUsuario() {
  return useLoja(loja).sessao?.usuario ?? null;
}

export function iniciarSessao({ token, usuario }) {
  const sessao = { token, usuario };
  loja.definir({ sessao });
  gravarLocal(CHAVE, sessao);
}

export function encerrarSessao() {
  loja.definir({ sessao: null });
  removerLocal(CHAVE);
}

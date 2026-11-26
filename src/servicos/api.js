// Camada de acesso à listas-api.
// Os componentes não chamam fetch diretamente: pedem os dados a estas funções.
import { criarLoja, useLoja } from "../estado/loja";
import { encerrarSessao, obterToken } from "../estado/sessao";

// Defina EXPO_PUBLIC_API_URL (ver .env.example) para usar outra API.
const API_URL = (process.env.EXPO_PUBLIC_API_URL || "https://listas-api-plum.vercel.app").replace(/\/$/, "");

// Conexão ruim (ou servidor "acordando" demais) conta como sem conexão: o app segue
// no modo offline em vez de ficar esperando.
const TEMPO_LIMITE_MS = 15000;

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

/** Requisições em andamento: alimenta o indicador de carregamento da barra superior. */
const carga = criarLoja({ pendentes: 0 });
export const useOcupado = () => useLoja(carga).pendentes > 0;

async function chamar(metodo, caminho, corpo) {
  const headers = { Accept: "application/json" };
  if (corpo !== undefined) headers["Content-Type"] = "application/json";
  const token = obterToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  carga.definir({ pendentes: carga.obter().pendentes + 1 });
  try {
    let resposta;
    try {
      resposta = await fetch(API_URL + caminho, {
        method: metodo,
        headers,
        body: corpo === undefined ? undefined : JSON.stringify(corpo),
        signal: controle.signal,
      });
    } catch {
      // status 0 = sem conexão: quem chamou decide se entra no modo offline.
      throw new ErroApi(0, "Sem conexão com o servidor. Verifique a internet.");
    }

    if (resposta.status === 204) return null;
    const dados = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      // Token vencido ou inválido: volta para a tela de login.
      if (resposta.status === 401 && headers.Authorization) encerrarSessao();
      throw new ErroApi(resposta.status, dados?.erro || `Erro inesperado (HTTP ${resposta.status})`);
    }
    return dados;
  } finally {
    clearTimeout(temporizador);
    carga.definir({ pendentes: carga.obter().pendentes - 1 });
  }
}

const id = encodeURIComponent;

export const entrar = (nome, senha) => chamar("POST", "/auth/login", { nome, senha });
export const cadastrar = (nome, senha) => chamar("POST", "/auth/cadastro", { nome, senha });

export const buscarListas = () => chamar("GET", "/listas");
export const buscarLista = (listaId) => chamar("GET", `/listas/${id(listaId)}`);

/**
 * Envia a fila de alterações do aparelho (veja estado/listas.js). Só os campos que a
 * API usa: o rótulo do histórico e a hora local ficam no aparelho.
 */
export const sincronizar = (operacoes) =>
  chamar("POST", "/listas/sincronizar", {
    operacoes: operacoes.map(({ id, tipo, listaId, base, itemId, nome, marcado, formato }) => ({
      id,
      tipo,
      listaId,
      base,
      itemId,
      nome,
      marcado,
      formato,
    })),
  });

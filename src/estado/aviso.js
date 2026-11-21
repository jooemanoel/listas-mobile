// Mensagem curta no rodapé da tela (o "snackbar" da versão web).
import { criarLoja, useLoja } from "./loja";

const loja = criarLoja({ aviso: null }); // { texto, tipo: "info" | "erro" }
let temporizador;

export function avisar(texto, tipo = "info", duracao = 4000) {
  clearTimeout(temporizador);
  loja.definir({ aviso: { texto, tipo } });
  temporizador = setTimeout(fecharAviso, duracao);
}

export function fecharAviso() {
  clearTimeout(temporizador);
  loja.definir({ aviso: null });
}

/** Mostra o erro de uma chamada à API (exceto 401: a sessão já foi encerrada). */
export function avisarErro(erro) {
  if (erro?.status === 401 && erro.message.startsWith("Sessão")) {
    avisar("Sua sessão expirou. Entre novamente.", "erro");
  } else {
    avisar(erro?.message || "Algo deu errado.", "erro");
  }
}

export function useAviso() {
  return useLoja(loja).aviso;
}

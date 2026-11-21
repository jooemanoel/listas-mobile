// "Loja" mínima de estado global, lida pelos componentes com useSyncExternalStore.
// Faz o papel dos ref() globais da versão Vue: o estado vive fora dos componentes,
// então temporizadores e respostas da API sempre veem o valor atual.
import { useSyncExternalStore } from "react";

export function criarLoja(inicial) {
  let estado = inicial;
  const ouvintes = new Set();
  return {
    obter: () => estado,
    /** Mescla as mudanças no estado e avisa os componentes. */
    definir(mudancas) {
      estado = { ...estado, ...mudancas };
      ouvintes.forEach((ouvinte) => ouvinte());
    },
    assinar(ouvinte) {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
  };
}

export function useLoja(loja) {
  return useSyncExternalStore(loja.assinar, loja.obter);
}

// Datas para exibir: "hoje às 14:32", "ontem às 09:10", "18/11 às 20:05", "18/11/2025 às 20:05".
// Formatadas à mão (e não com Intl) para dar o mesmo resultado em qualquer aparelho.
const dois = (n) => String(n).padStart(2, "0");

const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function formatarData(iso) {
  if (!iso) return "";
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return "";
  const hoje = new Date();
  const dias = Math.round((inicioDoDia(hoje) - inicioDoDia(data)) / 86400000);
  const diaMes = `${dois(data.getDate())}/${dois(data.getMonth() + 1)}`;
  const dia =
    dias === 0
      ? "hoje"
      : dias === 1
        ? "ontem"
        : data.getFullYear() === hoje.getFullYear()
          ? diaMes
          : `${diaMes}/${data.getFullYear()}`;
  return `${dia} às ${dois(data.getHours())}:${dois(data.getMinutes())}`;
}

// Texto da lista para colar no WhatsApp: título em *negrito* e um item por linha ("- ",
// que o WhatsApp mostra como lista). Lembretes (várias linhas) vão inteiros, separados por uma linha.
export function listaParaTexto(nome, itens, formato = "itens") {
  if (formato === "lembretes") return [`*${nome}*`, itens.map((i) => i.nome).join("\n\n———\n\n")].join("\n\n");
  return [`*${nome}*`, "", ...itens.map((i) => `- ${i.nome}`)].join("\n");
}

/** "1 item", "3 itens", "2 lembretes". */
export function contagem(n, lembretes = false) {
  if (lembretes) return `${n} ${n === 1 ? "lembrete" : "lembretes"}`;
  return `${n} ${n === 1 ? "item" : "itens"}`;
}

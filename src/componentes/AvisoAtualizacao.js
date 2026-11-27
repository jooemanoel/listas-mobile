// Cartão "Versão X disponível" quando há uma release mais nova no GitHub.
// A consulta é feita ao abrir o app e ao voltar para ele (no máximo uma vez por hora na
// rede; veja servicos/atualizacao.js). "Depois" esconde o aviso daquela versão até o app
// ser aberto de novo; se sair outra versão nesse meio-tempo, o aviso volta.
//
// "Atualizar agora" baixa o APK dentro do app e abre o instalador do Android (o download
// pelo navegador às vezes trava em 100%). Se falhar, o botão passa a abrir o navegador.
import { useState } from "react";
import { AppState, Linking, Platform, Text, View } from "react-native";
import { avisar } from "../estado/aviso";
import { criarLoja, useLoja } from "../estado/loja";
import { useEstilos } from "../estilos";
import { VERSAO_INSTALADA, baixarEInstalar, limparDownloads, verificarAtualizacao } from "../servicos/atualizacao";
import Botao from "./Botao";
import Icone from "./Icone";

/** nova: { versao, url } da versão nova, ou null; adiada: versão escondida com "Depois". */
const loja = criarLoja({ nova: null, adiada: null });

function verificar() {
  verificarAtualizacao().then((nova) => {
    loja.definir({ nova });
    // Em dia: o APK baixado para a atualização (se houver) já foi instalado.
    if (!nova && Platform.OS === "android") limparDownloads();
  });
}

verificar();
AppState.addEventListener("change", (estado) => {
  if (estado === "active") verificar();
});

export default function AvisoAtualizacao() {
  const { cores, e } = useEstilos();
  const { nova, adiada } = useLoja(loja);
  const [progresso, setProgresso] = useState(null); // null = parado; 0 a 1 (ou -1 sem tamanho) = baixando
  const [falhou, setFalhou] = useState(false);
  if (!nova || nova.versao === adiada) return null;

  const peloApp = Platform.OS === "android" && !falhou && /\.apk$/i.test(nova.url);
  const baixando = progresso !== null;

  async function atualizar() {
    if (!peloApp) return Linking.openURL(nova.url);
    setProgresso(0);
    try {
      await baixarEInstalar(nova, (p) => setProgresso(p ?? -1));
    } catch {
      setFalhou(true);
      avisar("Não deu para baixar a atualização. Tente pelo navegador.", "erro");
    } finally {
      setProgresso(null);
    }
  }

  const tituloBotao = !baixando
    ? peloApp
      ? "Atualizar agora"
      : "Baixar pelo navegador"
    : progresso >= 0
      ? `Baixando… ${Math.round(progresso * 100)}%`
      : "Baixando…";

  return (
    <View style={[e.cartao, e.avisoAtualizacao]} accessibilityRole="alert">
      <View style={e.informativo}>
        <Icone nome="atualizar" cor={cores.destaque} />
        <Text style={[e.texto, { flex: 1 }]}>
          <Text style={e.negrito}>Versão {nova.versao} disponível.</Text> Você está com a {VERSAO_INSTALADA}. A nova
          versão instala por cima e suas listas são mantidas.
        </Text>
      </View>
      <View style={e.acoesAtualizacao}>
        <Botao titulo={tituloBotao} aoTocar={atualizar} desativado={baixando} />
        {!baixando && <Botao tipo="secundario" titulo="Depois" aoTocar={() => loja.definir({ adiada: nova.versao })} />}
      </View>
    </View>
  );
}

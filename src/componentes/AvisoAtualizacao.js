// Cartão "Versão X disponível" quando há uma release mais nova no GitHub.
// A consulta é feita ao abrir o app e ao voltar para ele (no máximo uma vez por hora na
// rede; veja servicos/atualizacao.js). "Depois" esconde o aviso daquela versão até o app
// ser aberto de novo; se sair outra versão nesse meio-tempo, o aviso volta.
import { AppState, Linking, Text, View } from "react-native";
import { criarLoja, useLoja } from "../estado/loja";
import { useEstilos } from "../estilos";
import { VERSAO_INSTALADA, verificarAtualizacao } from "../servicos/atualizacao";
import Botao from "./Botao";
import Icone from "./Icone";

/** nova: { versao, url } da versão nova, ou null; adiada: versão escondida com "Depois". */
const loja = criarLoja({ nova: null, adiada: null });

function verificar() {
  verificarAtualizacao().then((nova) => loja.definir({ nova }));
}

verificar();
AppState.addEventListener("change", (estado) => {
  if (estado === "active") verificar();
});

export default function AvisoAtualizacao() {
  const { cores, e } = useEstilos();
  const { nova, adiada } = useLoja(loja);
  if (!nova || nova.versao === adiada) return null;

  return (
    <View style={[e.cartao, e.avisoAtualizacao]} accessibilityRole="alert">
      <View style={e.informativo}>
        <Icone nome="atualizar" cor={cores.destaque} />
        <Text style={[e.texto, { flex: 1 }]}>
          <Text style={e.negrito}>Versão {nova.versao} disponível.</Text> Você está com a {VERSAO_INSTALADA}. Baixe o
          APK e toque nele para instalar por cima; suas listas são mantidas.
        </Text>
      </View>
      <View style={e.acoesAtualizacao}>
        <Botao titulo="Baixar a nova versão" aoTocar={() => Linking.openURL(nova.url)} />
        <Botao tipo="secundario" titulo="Depois" aoTocar={() => loja.definir({ adiada: nova.versao })} />
      </View>
    </View>
  );
}

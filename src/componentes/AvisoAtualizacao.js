// Cartão "Versão X disponível" quando há uma release mais nova no GitHub.
// A consulta é feita uma vez ao abrir o app (no máximo uma vez por dia na rede; veja
// servicos/atualizacao.js). "Depois" esconde o aviso até o app ser aberto de novo.
import { Linking, Text, View } from "react-native";
import { criarLoja, useLoja } from "../estado/loja";
import { useEstilos } from "../estilos";
import { VERSAO_INSTALADA, verificarAtualizacao } from "../servicos/atualizacao";
import Botao from "./Botao";
import Icone from "./Icone";

/** { versao, url } da versão nova, ou null. */
const loja = criarLoja({ nova: null });
verificarAtualizacao().then((nova) => loja.definir({ nova }));

export default function AvisoAtualizacao() {
  const { cores, e } = useEstilos();
  const { nova } = useLoja(loja);
  if (!nova) return null;

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
        <Botao tipo="secundario" titulo="Depois" aoTocar={() => loja.definir({ nova: null })} />
      </View>
    </View>
  );
}

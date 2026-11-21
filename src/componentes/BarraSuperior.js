// Barra superior: título e, com o usuário logado, os três atalhos
// (nova lista, minhas listas, sair) e o chip "Offline".
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useEstilos, ALTURA_BARRA, LARGURA } from "../estilos";
import { useListas } from "../estado/listas";
import { useOcupado } from "../servicos/api";
import BotaoIcone from "./BotaoIcone";

export default function BarraSuperior({ titulo, logado, tela, aoNovaLista, aoMinhasListas, aoSair }) {
  const { cores, e } = useEstilos();
  const { conexao } = useListas();
  const ocupado = useOcupado();
  const insets = useSafeAreaInsets();

  const botao = { cor: cores.sobreBarra, fundo: "transparent", fundoAtivo: cores.botaoBarraAtivo };

  return (
    <View
      style={[
        estilos.barra,
        {
          backgroundColor: cores.barra,
          paddingTop: insets.top,
          height: ALTURA_BARRA + insets.top,
          paddingLeft: Math.max(16, insets.left),
          paddingRight: Math.max(8, insets.right),
        },
      ]}
    >
      <View style={estilos.conteudo}>
        <Text numberOfLines={1} accessibilityRole="header" style={[estilos.titulo, { color: cores.sobreBarra }]}>
          {titulo}
        </Text>
        {logado && conexao === "offline" && (
          <Text style={e.chipOffline} accessibilityLabel="Offline: alterações guardadas neste aparelho">
            Offline
          </Text>
        )}

        {/* Indicador de carregamento: o espaço fica reservado para o título não "pular". */}
        <View style={estilos.carregando}>
          {ocupado && <ActivityIndicator size="small" color={cores.sobreBarra} accessibilityLabel="Carregando" />}
        </View>

        {logado && (
          <View style={estilos.acoes}>
            <BotaoIcone
              icone="novaLista"
              rotulo="Nova lista"
              aoTocar={aoNovaLista}
              selecionado={tela === "nova"}
              {...botao}
              fundo={tela === "nova" ? cores.botaoBarraAtivo : "transparent"}
            />
            <BotaoIcone
              icone="listas"
              rotulo="Minhas listas"
              aoTocar={aoMinhasListas}
              selecionado={tela === "listas"}
              {...botao}
              fundo={tela === "listas" ? cores.botaoBarraAtivo : "transparent"}
            />
            <BotaoIcone icone="sair" rotulo="Sair" aoTocar={aoSair} {...botao} />
          </View>
        )}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  barra: {
    elevation: 4,
    zIndex: 10,
  },
  conteudo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    width: "100%",
    maxWidth: LARGURA,
    alignSelf: "center",
  },
  titulo: {
    flex: 1,
    minWidth: 0,
    fontSize: 19,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  carregando: {
    width: 34,
    alignItems: "center",
  },
  acoes: {
    flexDirection: "row",
    gap: 2,
  },
});

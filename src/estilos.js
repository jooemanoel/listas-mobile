// Cores e estilos do app: equivalem ao estilo.css da versão web (listas-web), com a
// paleta ciano do Material 3, a mesma do biblia-simples-mobile.
// O tema (claro/escuro) segue o do sistema, como o prefers-color-scheme.
import { useMemo } from "react";
import { StyleSheet, useColorScheme } from "react-native";

export const CORES = {
  claro: {
    escuro: false,
    fundo: "#f5fafa",
    superficie: "#ffffff",
    superficie2: "#e9efee",
    texto: "#171d1d",
    textoSuave: "#4a5655",
    destaque: "#006a6a",
    sobreDestaque: "#ffffff",
    realce: "#b8ebe9",
    sobreRealce: "#002020",
    borda: "#d4dedd",
    erro: "#ba1a1a",
    barra: "#006a6a",
    sobreBarra: "#ffffff",
    botaoBarra: "rgba(255,255,255,0.14)",
    botaoBarraAtivo: "rgba(255,255,255,0.26)",
  },
  escuro: {
    escuro: true,
    fundo: "#0e1415",
    superficie: "#182122",
    superficie2: "#212b2c",
    texto: "#dde4e3",
    textoSuave: "#a9b6b5",
    destaque: "#80d5d4",
    sobreDestaque: "#003737",
    realce: "#004f50",
    sobreRealce: "#b8ebe9",
    borda: "#2c3839",
    erro: "#ffb4ab",
    barra: "#1b2627",
    sobreBarra: "#cfe7e6",
    botaoBarra: "rgba(255,255,255,0.07)",
    botaoBarraAtivo: "rgba(255,255,255,0.16)",
  },
};

export const ALTURA_BARRA = 56;
export const LARGURA = 640;
const RAIO = 16;

/** Devolve { cores, e } com os estilos do tema atual. */
export function useEstilos() {
  const tema = useColorScheme() === "dark" ? "escuro" : "claro";
  return useMemo(() => {
    const cores = CORES[tema];
    return { cores, e: criarEstilos(cores) };
  }, [tema]);
}

function criarEstilos(c) {
  const cartao = {
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: c.borda,
    borderRadius: RAIO,
    backgroundColor: c.superficie,
  };
  const botao = {
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  };
  const campo = {
    height: 48,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: c.borda,
    borderRadius: 12,
    backgroundColor: c.superficie2,
    color: c.texto,
    fontSize: 17,
  };

  return StyleSheet.create({
    // ---------- Estrutura ----------
    app: { flex: 1, backgroundColor: c.fundo },
    tela: { flex: 1 },
    pagina: { padding: 16, width: "100%", maxWidth: LARGURA, alignSelf: "center" },
    texto: { color: c.texto, fontSize: 16, lineHeight: 22 },
    textoSuave: { color: c.textoSuave, fontSize: 16, lineHeight: 22 },
    negrito: { fontWeight: "700" },

    // ---------- Cartões ----------
    cartao,
    tituloCartao: { color: c.texto, fontSize: 20, fontWeight: "600", marginBottom: 16 },
    subtitulo: {
      marginTop: 4,
      marginHorizontal: 8,
      marginBottom: 10,
      color: c.destaque,
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.8,
      textTransform: "uppercase",
    },
    vazio: { alignItems: "center", gap: 12 },
    textoVazio: { color: c.textoSuave, fontSize: 16, lineHeight: 22, textAlign: "center" },
    informativo: { flexDirection: "row", gap: 16, alignItems: "flex-start" },

    // ---------- Formulários ----------
    formulario: { gap: 14 },
    rotulo: { color: c.textoSuave, fontSize: 14, fontWeight: "600", marginBottom: 6 },
    campo,
    campoFocado: { borderColor: c.destaque },
    campoComBotao: { justifyContent: "center" },
    campoSenha: { paddingRight: 52 },
    botaoDentroDoCampo: { position: "absolute", right: 2 },
    dica: { color: c.textoSuave, fontSize: 13, marginTop: -4 },

    // ---------- Botões ----------
    botaoPrincipal: { ...botao, backgroundColor: c.destaque },
    botaoPrincipalTexto: { color: c.sobreDestaque, fontSize: 16, fontWeight: "600" },
    botaoSecundario: { ...botao, backgroundColor: c.superficie2 },
    botaoSecundarioTexto: { color: c.texto, fontSize: 16, fontWeight: "600" },
    botaoRedondo: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.destaque,
      elevation: 3,
    },
    pressionado: { opacity: 0.7 },
    desativado: { opacity: 0.38 },

    // ---------- Linhas (listas e itens) ----------
    linhas: {
      borderWidth: 1,
      borderColor: c.borda,
      borderRadius: RAIO,
      backgroundColor: c.superficie,
      overflow: "hidden",
    },
    linha: { flexDirection: "row", alignItems: "center", gap: 4, paddingRight: 6, backgroundColor: c.superficie },
    linhaSeparada: { borderTopWidth: 1, borderTopColor: c.borda },
    linhaPrincipal: {
      flex: 1,
      minWidth: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      minHeight: 56,
      paddingVertical: 8,
      paddingLeft: 16,
      paddingRight: 8,
    },
    linhaPressionada: { backgroundColor: c.superficie2 },
    nomeLista: { flexShrink: 1, color: c.texto, fontSize: 16, fontWeight: "500" },
    nomeItem: { flex: 1, color: c.texto, fontSize: 16, lineHeight: 22, fontWeight: "500" },
    nomeItemFeito: { color: c.textoSuave, textDecorationLine: "line-through" },
    contagem: {
      marginLeft: "auto",
      paddingVertical: 2,
      paddingHorizontal: 10,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: c.superficie2,
      color: c.textoSuave,
      fontSize: 13,
      fontVariant: ["tabular-nums"],
    },
    pendente: { color: c.destaque, fontSize: 12, fontWeight: "600" },

    // ---------- Tela da lista ----------
    adicionarItem: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      width: "100%",
      maxWidth: LARGURA,
      alignSelf: "center",
    },
    campoItem: { ...campo, flex: 1, borderRadius: 24 },
    resumo: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44, marginBottom: 4, marginLeft: 8 },
    resumoTexto: { flex: 1, color: c.textoSuave, fontSize: 13 },

    // ---------- Aviso de versão nova ----------
    avisoAtualizacao: { borderColor: c.destaque, gap: 14 },
    acoesAtualizacao: { flexDirection: "row", flexWrap: "wrap", gap: 8 },

    // ---------- Tipo da lista (nova lista) ----------
    formatos: { gap: 8 },
    formato: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-start",
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 2,
      borderColor: c.borda,
      borderRadius: 12,
    },
    formatoEscolhido: { borderColor: c.destaque, backgroundColor: c.superficie2 },
    formatoTextos: { flex: 1, gap: 2 },
    formatoTitulo: { color: c.texto, fontSize: 16, fontWeight: "700" },
    formatoDescricao: { color: c.textoSuave, fontSize: 13, lineHeight: 18 },

    // ---------- Lembretes (textos de várias linhas) ----------
    adicionarLembrete: { alignItems: "flex-end" },
    campoLembrete: {
      ...campo,
      flex: 1,
      height: undefined,
      minHeight: 72,
      maxHeight: 260,
      paddingVertical: 12,
      borderRadius: 16,
      fontSize: 16,
      lineHeight: 22,
    },
    acoesLembrete: { alignItems: "center", gap: 4 },
    lembrete: { marginBottom: 12, paddingTop: 16, paddingBottom: 4, paddingLeft: 16, paddingRight: 8 },
    textoLembrete: { color: c.texto, fontSize: 16, lineHeight: 23, marginRight: 8, marginBottom: 8 },
    textoLembreteFeito: { color: c.textoSuave },
    rodapeLembrete: {
      flexDirection: "row",
      alignItems: "center",
      gap: 2,
      paddingTop: 4,
      borderTopWidth: 1,
      borderTopColor: c.borda,
    },
    marcarLembrete: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, minHeight: 44 },
    marcarLembreteTexto: { color: c.textoSuave, fontSize: 14 },
    botaoTexto: { height: 36, paddingHorizontal: 12, borderRadius: 18, justifyContent: "center" },
    botaoTextoRotulo: { color: c.destaque, fontSize: 14, fontWeight: "600" },

    // ---------- Modo offline ----------
    chipOffline: {
      marginLeft: 4,
      paddingVertical: 2,
      paddingHorizontal: 10,
      borderRadius: 999,
      overflow: "hidden",
      backgroundColor: c.botaoBarraAtivo,
      color: c.sobreBarra,
      fontSize: 12,
      fontWeight: "600",
      letterSpacing: 0.5,
      textTransform: "uppercase",
    },
    sincronizacao: {
      ...cartao,
      gap: 8,
      paddingVertical: 16,
      borderColor: c.destaque,
      backgroundColor: c.realce,
    },
    sincronizacaoTexto: { color: c.sobreRealce, fontSize: 15, lineHeight: 21 },
    sincronizacaoTitulo: { color: c.sobreRealce, fontSize: 16, fontWeight: "700" },
    sincronizacaoHistorico: { maxHeight: 200 },
    sincronizacaoHora: { opacity: 0.75, fontVariant: ["tabular-nums"] },
    sincronizacaoRodape: {
      flexDirection: "row",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    sincronizacaoDica: { flexShrink: 1, color: c.sobreRealce, fontSize: 13, opacity: 0.8 },
    botaoTentar: { ...botao, height: 40, marginLeft: "auto", backgroundColor: c.superficie },

    // ---------- Aviso (rodapé) ----------
    aviso: {
      position: "absolute",
      left: 16,
      right: 16,
      alignItems: "center",
    },
    avisoCaixa: {
      maxWidth: 560,
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      backgroundColor: "#2b3131",
      elevation: 6,
    },
    avisoCaixaErro: { backgroundColor: "#93000a" },
    avisoTexto: { color: "#ecf2f1", fontSize: 15, lineHeight: 21 },
    avisoTextoErro: { color: "#ffdad6" },
  });
}

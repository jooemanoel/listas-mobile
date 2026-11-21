import { Pressable, StyleSheet } from "react-native";
import Icone from "./Icone";

/** Botão redondo com um ícone (barra superior, linhas das listas, campo de senha). */
export default function BotaoIcone({ icone, rotulo, aoTocar, desativado, cor, fundo, fundoAtivo, tamanho = 44, selecionado }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityState={{ disabled: !!desativado, selected: selecionado }}
      disabled={desativado}
      onPress={aoTocar}
      hitSlop={4}
      style={({ pressed }) => [
        estilos.botao,
        { width: tamanho, height: tamanho, borderRadius: tamanho / 2 },
        { backgroundColor: pressed && !desativado ? fundoAtivo : fundo },
        desativado && estilos.desativado,
      ]}
    >
      <Icone nome={icone} cor={cor} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  botao: {
    alignItems: "center",
    justifyContent: "center",
  },
  desativado: {
    opacity: 0.38,
  },
});

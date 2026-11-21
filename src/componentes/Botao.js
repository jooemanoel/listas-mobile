// Botões de texto do app: "principal" (cheio) e "secundario" (fundo suave).
import { Pressable, Text } from "react-native";
import { useEstilos } from "../estilos";

export default function Botao({ tipo = "principal", titulo, aoTocar, desativado, style }) {
  const { e } = useEstilos();
  const caixa = tipo === "secundario" ? e.botaoSecundario : e.botaoPrincipal;
  const texto = tipo === "secundario" ? e.botaoSecundarioTexto : e.botaoPrincipalTexto;

  return (
    <Pressable
      onPress={aoTocar}
      disabled={desativado}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!desativado }}
      style={({ pressed }) => [caixa, pressed && e.pressionado, desativado && e.desativado, style]}
    >
      <Text style={texto}>{titulo}</Text>
    </Pressable>
  );
}

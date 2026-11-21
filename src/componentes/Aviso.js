// Mensagem curta no rodapé (snackbar). Tocar fecha antes do tempo.
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { fecharAviso, useAviso } from "../estado/aviso";
import { useEstilos } from "../estilos";
import { useAlturaTeclado } from "./teclado";

export default function Aviso() {
  const aviso = useAviso();
  const { e } = useEstilos();
  const insets = useSafeAreaInsets();
  const teclado = useAlturaTeclado();
  if (!aviso) return null;

  const erro = aviso.tipo === "erro";
  return (
    <View pointerEvents="box-none" style={[e.aviso, { bottom: 16 + Math.max(insets.bottom, teclado) }]}>
      <Pressable
        onPress={fecharAviso}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[e.avisoCaixa, erro && e.avisoCaixaErro]}
      >
        <Text style={[e.avisoTexto, erro && e.avisoTextoErro]}>{aviso.texto}</Text>
      </Pressable>
    </View>
  );
}

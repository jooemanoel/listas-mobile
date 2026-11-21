// Área rolável comum às telas: margens, espaço para o teclado e para o aviso do rodapé.
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlturaTeclado } from "../componentes/teclado";
import { useEstilos } from "../estilos";

export default function Pagina({ children }) {
  const { e } = useEstilos();
  const insets = useSafeAreaInsets();
  const teclado = useAlturaTeclado();
  return (
    <ScrollView
      style={e.tela}
      contentContainerStyle={[e.pagina, { paddingBottom: 88 + Math.max(insets.bottom, teclado) }]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

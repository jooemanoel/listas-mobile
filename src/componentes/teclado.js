// Altura do teclado virtual. Com o edge-to-edge do Android, a janela não encolhe
// sozinha quando o teclado abre: as telas usam esta altura como margem inferior.
import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export function useAlturaTeclado() {
  const [altura, setAltura] = useState(0);
  useEffect(() => {
    const abrir = Keyboard.addListener("keyboardDidShow", (e) => setAltura(e.endCoordinates.height));
    const fechar = Keyboard.addListener("keyboardDidHide", () => setAltura(0));
    return () => {
      abrir.remove();
      fechar.remove();
    };
  }, []);
  return altura;
}

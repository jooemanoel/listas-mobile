// Campo de texto com a borda de destaque ao receber o foco (como input:focus no CSS).
import { useState } from "react";
import { TextInput } from "react-native";
import { useEstilos } from "../estilos";

// No React 19, `ref` chega como uma prop comum (sem forwardRef).
export default function Campo({ ref, style, onFocus, onBlur, ...props }) {
  const { cores, e } = useEstilos();
  const [focado, setFocado] = useState(false);
  return (
    <TextInput
      ref={ref}
      placeholderTextColor={cores.textoSuave}
      selectionColor={cores.destaque}
      cursorColor={cores.destaque}
      style={[e.campo, style, focado && e.campoFocado]}
      onFocus={(ev) => {
        setFocado(true);
        onFocus?.(ev);
      }}
      onBlur={(ev) => {
        setFocado(false);
        onBlur?.(ev);
      }}
      {...props}
    />
  );
}

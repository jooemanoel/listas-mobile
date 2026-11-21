// Criar lista: criada na hora (também offline); o servidor recebe na sincronização.
import { useState } from "react";
import { Text, View } from "react-native";
import AvisoSincronizacao from "../componentes/AvisoSincronizacao";
import Botao from "../componentes/Botao";
import Campo from "../componentes/Campo";
import { useListas } from "../estado/listas";
import { useEstilos } from "../estilos";
import Pagina from "./Pagina";

export default function TelaNovaLista({ aoCriar }) {
  const { e } = useEstilos();
  const { criar } = useListas();
  const [nome, setNome] = useState("");

  function enviar() {
    if (!nome.trim()) return;
    // Abre a lista criada (já pronta para receber itens), no lugar desta tela.
    aoCriar(criar(nome));
  }

  return (
    <Pagina>
      <AvisoSincronizacao />
      <View style={e.cartao}>
        <Text style={e.tituloCartao} accessibilityRole="header">
          Nova lista
        </Text>
        <View style={e.formulario}>
          <View>
            <Text style={e.rotulo}>Nome da lista</Text>
            <Campo
              value={nome}
              onChangeText={setNome}
              accessibilityLabel="Nome da lista"
              autoCapitalize="characters"
              maxLength={60}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={enviar}
            />
          </View>
          <Botao titulo="Criar lista" aoTocar={enviar} desativado={!nome.trim()} />
        </View>
      </View>
    </Pagina>
  );
}

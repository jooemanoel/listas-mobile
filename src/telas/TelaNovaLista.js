// Criar lista: criada na hora (também offline); o servidor recebe na sincronização.
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import AvisoSincronizacao from "../componentes/AvisoSincronizacao";
import Botao from "../componentes/Botao";
import Campo from "../componentes/Campo";
import Icone from "../componentes/Icone";
import { useListas } from "../estado/listas";
import { useEstilos } from "../estilos";
import Pagina from "./Pagina";

const FORMATOS = [
  { valor: "itens", icone: "logo", titulo: "Itens", descricao: "Compras, tarefas: uma linha curta por item." },
  {
    valor: "lembretes",
    icone: "lembrete",
    titulo: "Lembretes",
    descricao: "Textos guardados como foram colados: mensagens de consulta, endereços, recados.",
  },
];

export default function TelaNovaLista({ aoCriar }) {
  const { cores, e } = useEstilos();
  const { criar } = useListas();
  const [nome, setNome] = useState("");
  const [formato, setFormato] = useState("itens");

  function enviar() {
    if (!nome.trim()) return;
    // Abre a lista criada (já pronta para receber itens), no lugar desta tela.
    aoCriar(criar(nome, formato));
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
          <View accessibilityRole="radiogroup" style={e.formatos}>
            <Text style={e.rotulo}>Tipo</Text>
            {FORMATOS.map((f) => {
              const escolhido = formato === f.valor;
              return (
                <Pressable
                  key={f.valor}
                  onPress={() => setFormato(f.valor)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: escolhido }}
                  accessibilityLabel={`${f.titulo}. ${f.descricao}`}
                  style={[e.formato, escolhido && e.formatoEscolhido]}
                >
                  <Icone nome={f.icone} cor={escolhido ? cores.destaque : cores.textoSuave} />
                  <View style={e.formatoTextos}>
                    <Text style={e.formatoTitulo}>{f.titulo}</Text>
                    <Text style={e.formatoDescricao}>{f.descricao}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Botao titulo="Criar lista" aoTocar={enviar} desativado={!nome.trim()} />
        </View>
      </View>
    </Pagina>
  );
}

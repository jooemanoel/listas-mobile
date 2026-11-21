// Minhas listas: abrir ou excluir (a lista vai embora com todos os itens).
import { Alert, Pressable, Text, View } from "react-native";
import AvisoSincronizacao from "../componentes/AvisoSincronizacao";
import BotaoIcone from "../componentes/BotaoIcone";
import Icone from "../componentes/Icone";
import { avisar } from "../estado/aviso";
import { useListas } from "../estado/listas";
import { useEstilos } from "../estilos";
import Pagina from "./Pagina";

const marcados = (lista) => lista.itens.filter((i) => i.marcado).length;

export default function TelaListas({ aoAbrir, aoNovaLista }) {
  const { cores, e } = useEstilos();
  const { listas, excluir, conexao } = useListas();

  function confirmarExclusao(lista) {
    const total = lista.itens.length;
    const detalhe = total ? ` e seus ${total} ${total === 1 ? "item" : "itens"}` : "";
    Alert.alert("Excluir lista", `Excluir a lista "${lista.nome}"${detalhe}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          excluir(lista.id);
          avisar(`Lista "${lista.nome}" excluída.`);
        },
      },
    ]);
  }

  let conteudo;
  if (listas === null) {
    conteudo = (
      <Text style={e.textoVazio}>
        {conexao === "offline"
          ? "Sem conexão, e suas listas ainda não foram guardadas neste aparelho. Conecte-se uma vez para usá-las offline."
          : "Carregando listas…"}
      </Text>
    );
  } else if (!listas.length) {
    conteudo = (
      <View style={[e.cartao, e.vazio]}>
        <Pressable
          onPress={aoNovaLista}
          accessibilityRole="button"
          accessibilityLabel="Criar lista"
          style={({ pressed }) => [e.botaoRedondo, pressed && e.pressionado]}
        >
          <Icone nome="adicionar" cor={cores.sobreDestaque} />
        </Pressable>
        <Text style={e.textoVazio}>
          Você ainda não tem listas. Crie a primeira pelo botão acima ou pelo ícone de nova lista na barra superior.
        </Text>
      </View>
    );
  } else {
    conteudo = (
      <>
        <Text style={e.subtitulo} accessibilityRole="header">
          Minhas listas
        </Text>
        <View style={e.linhas}>
          {listas.map((lista, i) => {
            const n = marcados(lista);
            return (
              <View key={lista.id} style={[e.linha, i > 0 && e.linhaSeparada]}>
                <Pressable
                  onPress={() => aoAbrir(lista.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${lista.nome}, ${n} de ${lista.itens.length} marcados${lista.pendente ? ", não sincronizada" : ""}`}
                  android_ripple={{ color: cores.superficie2 }}
                  style={({ pressed }) => [e.linhaPrincipal, pressed && e.linhaPressionada]}
                >
                  <Text numberOfLines={1} style={e.nomeLista}>
                    {lista.nome}
                  </Text>
                  {lista.pendente && <Text style={e.pendente}>não sincronizada</Text>}
                  <Text style={e.contagem}>
                    {n}/{lista.itens.length}
                  </Text>
                </Pressable>
                <BotaoIcone
                  icone="excluir"
                  rotulo={`Excluir a lista ${lista.nome}`}
                  aoTocar={() => confirmarExclusao(lista)}
                  cor={cores.textoSuave}
                  fundo="transparent"
                  fundoAtivo={cores.superficie2}
                />
              </View>
            );
          })}
        </View>
      </>
    );
  }

  return (
    <Pagina>
      <AvisoSincronizacao />
      {conteudo}
    </Pagina>
  );
}

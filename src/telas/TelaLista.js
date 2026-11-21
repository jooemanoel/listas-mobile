// Itens de uma lista: adicionar, marcar/desmarcar e remover.
// Tudo responde na hora (também offline); o servidor recebe na sincronização.
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";
import AvisoSincronizacao from "../componentes/AvisoSincronizacao";
import BotaoIcone from "../componentes/BotaoIcone";
import Campo from "../componentes/Campo";
import Icone from "../componentes/Icone";
import { avisar } from "../estado/aviso";
import { useListas } from "../estado/listas";
import { useEstilos } from "../estilos";
import { formatarData, listaParaTexto } from "../formatar";
import Pagina from "./Pagina";

/** Itens deslizam ao mudar de posição (marcados vão para o fim). */
const animar = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, "easeInEaseOut", "opacity"));

export default function TelaLista({ id, aoSumir }) {
  const { cores, e } = useEstilos();
  const { listas, encontrar, abrir, adicionarItem, marcarItem, removerItem, conexao } = useListas();
  const [novo, setNovo] = useState("");
  const campo = useRef(null);

  const lista = encontrar(id);
  const todos = lista?.itens ?? [];
  // Não marcados primeiro; marcados vão para o fim (ordem de inclusão mantida em cada grupo).
  const itens = [...todos.filter((i) => !i.marcado), ...todos.filter((i) => i.marcado)];
  const totalMarcados = todos.filter((i) => i.marcado).length;

  // Ao abrir, busca a versão do servidor (pode ter mudado em outro aparelho).
  useEffect(() => {
    abrir(id);
  }, [abrir, id]);

  // Listas carregadas e esta não está entre elas: foi excluída (aqui ou em outro aparelho).
  const sumiu = listas !== null && !lista;
  useEffect(() => {
    if (sumiu) {
      avisar("Esta lista não existe mais.", "erro");
      aoSumir();
    }
  }, [sumiu, aoSumir]);

  async function copiar() {
    try {
      await Clipboard.setStringAsync(listaParaTexto(lista.nome, itens));
      avisar("Lista copiada. É só colar no WhatsApp.");
    } catch {
      avisar("Não foi possível copiar a lista.", "erro");
    }
  }

  function adicionar() {
    const nome = novo.trim();
    if (!nome) return;
    animar();
    if (adicionarItem(id, nome)) setNovo("");
    campo.current?.focus(); // pronto para digitar o próximo item
  }

  if (!lista) {
    return (
      <Pagina>
        <AvisoSincronizacao />
        <Text style={e.textoVazio}>
          {conexao === "offline" ? "Lista não disponível offline neste aparelho." : "Carregando lista…"}
        </Text>
      </Pagina>
    );
  }

  return (
    <View style={e.tela}>
      {/* Campo fixo no topo: a lista rola por baixo dele. */}
      <View style={[e.adicionarItem, { backgroundColor: cores.fundo }]}>
        <Campo
          ref={campo}
          value={novo}
          onChangeText={setNovo}
          accessibilityLabel="Novo item"
          placeholder="Adicionar item"
          maxLength={100}
          autoCapitalize="characters"
          returnKeyType="done"
          submitBehavior="submit" // Enter adiciona e mantém o teclado aberto
          onSubmitEditing={adicionar}
          style={e.campoItem}
        />
        <BotaoIcone
          icone="adicionar"
          rotulo="Adicionar item"
          aoTocar={adicionar}
          desativado={!novo.trim()}
          cor={cores.sobreDestaque}
          fundo={cores.destaque}
          fundoAtivo={cores.destaque}
          tamanho={48}
        />
      </View>

      <Pagina>
        <AvisoSincronizacao />

        {/* Contagem e o atualizadoEm da lista (no servidor, ou a hora da última alteração feita aqui). */}
        <View style={e.resumo}>
          <Text style={e.resumoTexto}>
            {itens.length > 0 && `${totalMarcados} de ${itens.length} marcados · `}
            {lista.pendente ? (
              <>
                alterada {formatarData(lista.atualizadoEm)} · <Text style={e.pendente}>não sincronizada</Text>
              </>
            ) : (
              `atualizada ${formatarData(lista.atualizadoEm)}`
            )}
          </Text>
          {itens.length > 0 && (
            <BotaoIcone
              icone="copiar"
              rotulo="Copiar lista para colar no WhatsApp"
              aoTocar={copiar}
              cor={cores.textoSuave}
              fundo="transparent"
              fundoAtivo={cores.superficie2}
            />
          )}
        </View>

        {!itens.length ? (
          <View style={[e.cartao, e.vazio]}>
            <Icone nome="logo" cor={cores.destaque} tamanho={40} />
            <Text style={e.textoVazio}>
              Lista vazia. Digite o nome de um item no campo acima e toque em <Text style={e.negrito}>+</Text> (ou
              Enter).
            </Text>
          </View>
        ) : (
          <View style={e.linhas}>
            {itens.map((item, i) => (
              <View key={item.id} style={[e.linha, i > 0 && e.linhaSeparada]}>
                <Pressable
                  onPress={() => {
                    animar();
                    marcarItem(id, item, !item.marcado);
                  }}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: item.marcado }}
                  accessibilityLabel={item.nome}
                  android_ripple={{ color: cores.superficie2 }}
                  style={({ pressed }) => [e.linhaPrincipal, pressed && e.linhaPressionada]}
                >
                  <Icone
                    nome={item.marcado ? "marcado" : "desmarcado"}
                    cor={item.marcado ? cores.textoSuave : cores.destaque}
                  />
                  <Text style={[e.nomeItem, item.marcado && e.nomeItemFeito]}>{item.nome}</Text>
                </Pressable>
                <BotaoIcone
                  icone="excluir"
                  rotulo={`Remover ${item.nome}`}
                  aoTocar={() => {
                    animar();
                    removerItem(id, item);
                  }}
                  cor={cores.textoSuave}
                  fundo="transparent"
                  fundoAtivo={cores.superficie2}
                />
              </View>
            ))}
          </View>
        )}
      </Pagina>
    </View>
  );
}

// Itens de uma lista: adicionar e remover. Não há marcação: o que foi resolvido
// (comprado, feito) é removido; a lista mostra só o que está pendente.
// Listas de lembretes usam um campo de várias linhas e mostram o texto como foi colado.
// Tudo responde na hora (também offline); o servidor recebe na sincronização.
import * as Clipboard from "expo-clipboard";
import { useEffect, useRef, useState } from "react";
import { Alert, LayoutAnimation, Pressable, Text, View } from "react-native";
import AvisoSincronizacao from "../componentes/AvisoSincronizacao";
import BotaoIcone from "../componentes/BotaoIcone";
import Campo from "../componentes/Campo";
import Icone from "../componentes/Icone";
import { avisar } from "../estado/aviso";
import { LIMITE_LEMBRETE, resumir, useListas } from "../estado/listas";
import { useEstilos } from "../estilos";
import { contagem, formatarData, listaParaTexto } from "../formatar";
import Pagina from "./Pagina";

/** Itens entram e saem com transição. */
const animar = () => LayoutAnimation.configureNext(LayoutAnimation.create(220, "easeInEaseOut", "opacity"));

// Lembretes com mais de 6 linhas (ou muito texto) aparecem recolhidos.
const LINHAS_RECOLHIDO = 6;
const longo = (texto) => texto.split("\n").length > LINHAS_RECOLHIDO || texto.length > 320;

export default function TelaLista({ id, aoSumir }) {
  const { cores, e } = useEstilos();
  const { listas, encontrar, abrir, adicionarItem, removerItem, conexao } = useListas();
  const [novo, setNovo] = useState("");
  /** Ids dos lembretes longos abertos por inteiro. */
  const [abertos, setAbertos] = useState(() => new Set());
  const campo = useRef(null);

  const lista = encontrar(id);
  const lembretes = lista?.formato === "lembretes";
  // Na ordem em que foram adicionados.
  const itens = lista?.itens ?? [];

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

  async function copiar(texto = listaParaTexto(lista.nome, itens, lista.formato), mensagem) {
    try {
      await Clipboard.setStringAsync(texto);
      avisar(mensagem ?? "Lista copiada. É só colar no WhatsApp.");
    } catch {
      avisar("Não foi possível copiar.", "erro");
    }
  }

  async function colar() {
    try {
      const texto = await Clipboard.getStringAsync();
      if (!texto.trim()) return avisar("A área de transferência está vazia.", "erro");
      setNovo((atual) => (atual.trim() ? `${atual.trimEnd()}\n${texto}` : texto));
    } catch {
      avisar("Não foi possível colar. Toque e segure no campo e escolha Colar.", "erro");
    }
  }

  function adicionar() {
    if (!novo.trim()) return;
    animar();
    if (adicionarItem(id, novo)) setNovo("");
    // Lembretes: o teclado fecha (normalmente é um texto só). Itens: pronto para o próximo.
    if (lembretes) campo.current?.blur();
    else campo.current?.focus();
  }

  function remover(item) {
    const executar = () => {
      animar();
      removerItem(id, item);
    };
    if (!lembretes) return executar();
    Alert.alert("Remover lembrete", `Remover o lembrete "${resumir(item.nome)}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Remover", style: "destructive", onPress: executar },
    ]);
  }

  function alternar(itemId) {
    animar();
    setAbertos((atual) => {
      const novos = new Set(atual);
      if (novos.has(itemId)) novos.delete(itemId);
      else novos.add(itemId);
      return novos;
    });
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

  const botaoAdicionar = (
    <BotaoIcone
      icone="adicionar"
      rotulo={lembretes ? "Adicionar lembrete" : "Adicionar item"}
      aoTocar={adicionar}
      desativado={!novo.trim()}
      cor={cores.sobreDestaque}
      fundo={cores.destaque}
      fundoAtivo={cores.destaque}
      tamanho={48}
    />
  );

  const resumoItens = itens.length ? `${contagem(itens.length, lembretes)} · ` : "";

  return (
    <View style={e.tela}>
      {/* Campo fixo no topo: a lista rola por baixo dele. */}
      {lembretes ? (
        <View style={[e.adicionarItem, e.adicionarLembrete, { backgroundColor: cores.fundo }]}>
          <Campo
            ref={campo}
            value={novo}
            onChangeText={setNovo}
            accessibilityLabel="Novo lembrete"
            placeholder="Cole ou escreva um lembrete"
            maxLength={LIMITE_LEMBRETE}
            multiline
            textAlignVertical="top"
            style={e.campoLembrete}
          />
          <View style={e.acoesLembrete}>
            <BotaoIcone
              icone="colar"
              rotulo="Colar da área de transferência"
              aoTocar={colar}
              cor={cores.textoSuave}
              fundo="transparent"
              fundoAtivo={cores.superficie2}
            />
            {botaoAdicionar}
          </View>
        </View>
      ) : (
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
          {botaoAdicionar}
        </View>
      )}

      <Pagina>
        <AvisoSincronizacao />

        {/* Contagem e o atualizadoEm da lista (no servidor, ou a hora da última alteração feita aqui). */}
        <View style={e.resumo}>
          <Text style={e.resumoTexto}>
            {resumoItens}
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
              aoTocar={() => copiar()}
              cor={cores.textoSuave}
              fundo="transparent"
              fundoAtivo={cores.superficie2}
            />
          )}
        </View>

        {!itens.length ? (
          <View style={[e.cartao, e.vazio]}>
            <Icone nome={lembretes ? "lembrete" : "logo"} cor={cores.destaque} tamanho={40} />
            {lembretes ? (
              <Text style={e.textoVazio}>
                Nenhum lembrete. Cole um texto (a mensagem da consulta, um endereço…) no campo acima e toque em{" "}
                <Text style={e.negrito}>+</Text>. O texto fica guardado exatamente como foi colado.
              </Text>
            ) : (
              <Text style={e.textoVazio}>
                Lista vazia. Digite o nome de um item no campo acima e toque em <Text style={e.negrito}>+</Text> (ou
                Enter).
              </Text>
            )}
          </View>
        ) : lembretes ? (
          <View>
            {itens.map((item) => {
              const recolhivel = longo(item.nome);
              const aberto = abertos.has(item.id);
              return (
                <View key={item.id} style={[e.cartao, e.lembrete]}>
                  <Text
                    selectable
                    numberOfLines={recolhivel && !aberto ? LINHAS_RECOLHIDO : undefined}
                    style={e.textoLembrete}
                  >
                    {item.nome}
                  </Text>
                  <View style={e.rodapeLembrete}>
                    {recolhivel && (
                      <Pressable
                        onPress={() => alternar(item.id)}
                        accessibilityRole="button"
                        hitSlop={6}
                        style={({ pressed }) => [e.botaoTexto, pressed && { backgroundColor: cores.superficie2 }]}
                      >
                        <Text style={e.botaoTextoRotulo}>{aberto ? "Mostrar menos" : "Mostrar tudo"}</Text>
                      </Pressable>
                    )}
                    <BotaoIcone
                      icone="copiar"
                      rotulo={`Copiar o lembrete ${resumir(item.nome)}`}
                      aoTocar={() => copiar(item.nome, "Lembrete copiado.")}
                      cor={cores.textoSuave}
                      fundo="transparent"
                      fundoAtivo={cores.superficie2}
                    />
                    <BotaoIcone
                      icone="excluir"
                      rotulo={`Remover o lembrete ${resumir(item.nome)}`}
                      aoTocar={() => remover(item)}
                      cor={cores.textoSuave}
                      fundo="transparent"
                      fundoAtivo={cores.superficie2}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View style={e.linhas}>
            {itens.map((item, i) => (
              <View key={item.id} style={[e.linha, i > 0 && e.linhaSeparada]}>
                <Text style={[e.nomeItem, e.linhaTexto]}>{item.nome}</Text>
                <BotaoIcone
                  icone="excluir"
                  rotulo={`Remover ${item.nome}`}
                  aoTocar={() => remover(item)}
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

// Componente raiz: escolhe a tela pela sessão e pela navegação (pilha de telas).
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useCallback, useEffect, useState } from "react";
import { Alert, BackHandler, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Aviso from "./src/componentes/Aviso";
import BarraSuperior from "./src/componentes/BarraSuperior";
import { obterFila, useListas } from "./src/estado/listas";
import { encerrarSessao, useUsuario } from "./src/estado/sessao";
import { useEstilos } from "./src/estilos";
import TelaLista from "./src/telas/TelaLista";
import TelaListas from "./src/telas/TelaListas";
import TelaLogin from "./src/telas/TelaLogin";
import TelaNovaLista from "./src/telas/TelaNovaLista";

const INICIO = [{ tela: "listas" }];

export default function App() {
  return (
    <SafeAreaProvider>
      <Listas />
    </SafeAreaProvider>
  );
}

function Listas() {
  const { cores, e } = useEstilos();
  const usuario = useUsuario();
  const { encontrar, carregar, descarregar, apagarDoAparelho } = useListas();

  // Navegação: pilha de telas ({ tela: "listas" | "nova" | "lista", id? }).
  // O botão "voltar" do Android desempilha (como o # do endereço na versão web).
  const [pilha, setPilha] = useState(INICIO);
  const rota = pilha[pilha.length - 1];

  const ir = useCallback((destino) => setPilha((p) => [...p, destino]), []);
  const substituir = useCallback((destino) => setPilha((p) => [...p.slice(0, -1), destino]), []);
  const irParaInicio = useCallback(() => setPilha(INICIO), []);

  useEffect(() => {
    if (pilha.length < 2) return;
    const assinatura = BackHandler.addEventListener("hardwareBackPress", () => {
      setPilha((p) => p.slice(0, -1));
      return true;
    });
    return () => assinatura.remove();
  }, [pilha.length]);

  // Ao entrar (ou abrir o app já logado), carrega as listas: primeiro a cópia guardada
  // no aparelho, depois o servidor. Se a sessão expirar, esquece da memória, mas o que
  // está guardado no aparelho fica (para sincronizar quando entrar de novo).
  const usuarioId = usuario?.id ?? null;
  useEffect(() => {
    descarregar();
    if (usuarioId) carregar(usuarioId);
  }, [usuarioId, carregar, descarregar]);

  // Entrou, saiu ou a sessão expirou: a navegação recomeça em "Minhas listas".
  const [donoDaPilha, setDonoDaPilha] = useState(usuarioId);
  if (donoDaPilha !== usuarioId) {
    setDonoDaPilha(usuarioId);
    setPilha(INICIO);
  }

  // Cor da janela nativa (aparece atrás do app em transições e ao girar a tela).
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(cores.fundo).catch(() => {});
  }, [cores.fundo]);

  let titulo = "Listas";
  if (usuario) {
    if (rota.tela === "nova") titulo = "Nova lista";
    else if (rota.tela === "lista") titulo = encontrar(rota.id)?.nome || "Lista";
    else titulo = usuario.nome;
  }

  function sair() {
    const n = obterFila().length;
    const confirmar = () => {
      // Em aparelho compartilhado, ninguém que entrar depois vê as listas guardadas.
      apagarDoAparelho();
      encerrarSessao();
    };
    if (!n) return confirmar();
    Alert.alert(
      "Alterações não enviadas",
      `${n} ${n === 1 ? "alteração ainda não foi enviada" : "alterações ainda não foram enviadas"} ao servidor. ` +
        "Se sair agora, elas serão perdidas. Sair mesmo assim?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: confirmar },
      ]
    );
  }

  let tela;
  if (!usuario) tela = <TelaLogin />;
  else if (rota.tela === "nova") tela = <TelaNovaLista aoCriar={(id) => substituir({ tela: "lista", id })} />;
  else if (rota.tela === "lista") tela = <TelaLista key={rota.id} id={rota.id} aoSumir={irParaInicio} />;
  else tela = <TelaListas aoAbrir={(id) => ir({ tela: "lista", id })} aoNovaLista={() => ir({ tela: "nova" })} />;

  return (
    <View style={e.app}>
      {/* A barra superior é escura nos dois temas: ícones da barra de status sempre claros. */}
      <StatusBar style="light" />
      <NavigationBar style={cores.escuro ? "light" : "dark"} />

      <BarraSuperior
        titulo={titulo}
        logado={!!usuario}
        tela={rota.tela}
        aoNovaLista={() => rota.tela !== "nova" && ir({ tela: "nova" })}
        aoMinhasListas={irParaInicio}
        aoSair={sair}
      />
      {tela}
      <Aviso />
    </View>
  );
}

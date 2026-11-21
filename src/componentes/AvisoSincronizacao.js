// Cartão no topo das telas enquanto o app está offline (ou com alterações que não
// conseguiram ser enviadas): quantas alterações estão guardadas, o histórico delas
// e o alerta para não mexer nas listas em outro aparelho até sincronizar.
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useEstilos } from "../estilos";
import { useListas } from "../estado/listas";
import { formatarData } from "../formatar";
import Botao from "./Botao";
import Icone from "./Icone";

export default function AvisoSincronizacao() {
  const { cores, e } = useEstilos();
  const { fila, conexao, sincronizadoEm, atualizar } = useListas();
  const [historicoAberto, setHistoricoAberto] = useState(false);

  const offline = conexao === "offline";
  const total = fila.length;
  if (!offline && !(total > 0 && conexao !== "sincronizando")) return null;

  return (
    <View style={e.sincronizacao} accessibilityLiveRegion="polite">
      <Text style={e.sincronizacaoTitulo} accessibilityRole="header">
        {offline ? "Modo offline" : "Alterações não enviadas"}
      </Text>

      <Text style={e.sincronizacaoTexto}>
        {total
          ? `${total} ${total === 1 ? "alteração guardada" : "alterações guardadas"} neste aparelho. ` +
            (offline ? "Serão enviadas quando a conexão voltar." : "O envio será tentado de novo.")
          : "Você pode continuar usando as listas: as alterações ficam guardadas neste aparelho."}
      </Text>

      <Text style={[e.sincronizacaoTexto, { fontWeight: "600" }]}>
        Não altere suas listas em outro aparelho até a sincronização terminar.
      </Text>

      {total > 0 && (
        <View>
          <Pressable
            onPress={() => setHistoricoAberto((a) => !a)}
            accessibilityRole="button"
            accessibilityState={{ expanded: historicoAberto }}
            hitSlop={8}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={[e.sincronizacaoTexto, e.negrito]}>Ver alterações</Text>
            <Icone nome="expandir" cor={cores.sobreRealce} tamanho={20} girar={historicoAberto} />
          </Pressable>
          {historicoAberto && (
            <ScrollView style={[e.sincronizacaoHistorico, { marginTop: 8 }]} nestedScrollEnabled>
              {[...fila].reverse().map((op, i) => (
                <Text key={op.id} style={[e.sincronizacaoTexto, { fontSize: 14, marginTop: i ? 4 : 0 }]}>
                  <Text style={e.sincronizacaoHora}>{formatarData(op.em)} </Text>
                  {op.rotulo}
                </Text>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      <View style={e.sincronizacaoRodape}>
        {sincronizadoEm && (
          <Text style={e.sincronizacaoDica}>Última sincronização: {formatarData(sincronizadoEm)}</Text>
        )}
        <Botao
          tipo="secundario"
          titulo="Tentar agora"
          aoTocar={atualizar}
          desativado={conexao === "sincronizando"}
          style={e.botaoTentar}
        />
      </View>
    </View>
  );
}

// Entrar ou criar conta. A senha vai para a API por HTTPS e só ela confere o hash;
// o aparelho recebe de volta apenas o token.
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import Botao from "../componentes/Botao";
import BotaoIcone from "../componentes/BotaoIcone";
import Campo from "../componentes/Campo";
import Icone from "../componentes/Icone";
import { avisar, avisarErro } from "../estado/aviso";
import { iniciarSessao } from "../estado/sessao";
import { useEstilos } from "../estilos";
import { cadastrar, entrar } from "../servicos/api";
import Pagina from "./Pagina";

export default function TelaLogin() {
  const { cores, e } = useEstilos();
  const [cadastro, setCadastro] = useState(false);
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const campoSenha = useRef(null);
  const campoConfirmacao = useRef(null);

  const podeEnviar = nome.trim() && senha && (!cadastro || confirmacao) && !enviando;

  function alternarModo() {
    setCadastro((c) => !c);
    setConfirmacao("");
  }

  async function enviar() {
    if (!podeEnviar) return;
    if (cadastro && senha !== confirmacao) {
      avisar("As senhas não conferem.", "erro");
      return;
    }
    setEnviando(true);
    try {
      const resposta = cadastro ? await cadastrar(nome, senha) : await entrar(nome, senha);
      if (cadastro) avisar("Conta criada. Bem-vindo(a)!");
      iniciarSessao(resposta); // a tela de login some: não mexe mais no estado dela
      return;
    } catch (erro) {
      avisarErro(erro);
    }
    setEnviando(false);
  }

  return (
    <Pagina>
      <View style={e.cartao}>
        <Text style={e.tituloCartao} accessibilityRole="header">
          {cadastro ? "Criar conta" : "Entrar"}
        </Text>

        <View style={e.formulario}>
          <View>
            <Text style={e.rotulo}>Usuário</Text>
            <Campo
              value={nome}
              onChangeText={setNome}
              accessibilityLabel="Usuário"
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              maxLength={40}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => campoSenha.current?.focus()}
            />
          </View>

          <View>
            <Text style={e.rotulo}>Senha</Text>
            <View style={e.campoComBotao}>
              <Campo
                ref={campoSenha}
                value={senha}
                onChangeText={setSenha}
                accessibilityLabel="Senha"
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={cadastro ? "new-password" : "current-password"}
                textContentType={cadastro ? "newPassword" : "password"}
                maxLength={64}
                returnKeyType={cadastro ? "next" : "done"}
                submitBehavior={cadastro ? "submit" : "blurAndSubmit"}
                onSubmitEditing={() => (cadastro ? campoConfirmacao.current?.focus() : enviar())}
                style={e.campoSenha}
              />
              <View style={e.botaoDentroDoCampo}>
                <BotaoIcone
                  icone={mostrarSenha ? "ocultar" : "mostrar"}
                  rotulo={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  aoTocar={() => setMostrarSenha((m) => !m)}
                  cor={cores.textoSuave}
                  fundo="transparent"
                  fundoAtivo={cores.borda}
                />
              </View>
            </View>
          </View>

          {cadastro && (
            <>
              <View>
                <Text style={e.rotulo}>Confirmar senha</Text>
                <Campo
                  ref={campoConfirmacao}
                  value={confirmacao}
                  onChangeText={setConfirmacao}
                  accessibilityLabel="Confirmar senha"
                  secureTextEntry={!mostrarSenha}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="new-password"
                  textContentType="newPassword"
                  maxLength={64}
                  returnKeyType="done"
                  onSubmitEditing={enviar}
                />
              </View>
              <Text style={e.dica}>Nome com pelo menos 3 letras e senha com pelo menos 6 caracteres.</Text>
            </>
          )}

          <Botao titulo={cadastro ? "Criar conta" : "Entrar"} aoTocar={enviar} desativado={!podeEnviar} />
          <Botao tipo="secundario" titulo={cadastro ? "Já tenho conta" : "Criar uma conta"} aoTocar={alternarModo} />
        </View>
      </View>

      <View style={[e.cartao, e.informativo]}>
        <Icone nome="logo" cor={cores.destaque} tamanho={40} />
        <Text style={[e.textoSuave, { flex: 1 }]}>
          Crie e gerencie <Text style={e.negrito}>listas de propósito geral</Text>: compras, tarefas, desejos,
          lembretes e muito mais. Tudo em um só lugar, de forma prática e acessível.
        </Text>
      </View>
    </Pagina>
  );
}

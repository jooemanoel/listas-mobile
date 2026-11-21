// Gera os ícones do app Android a partir do mesmo símbolo do PWA (listas-web):
// "checklist" do Material Symbols (Google).
// Fonte: https://fonts.google.com/icons?selected=Material+Symbols+Rounded:checklist:FILL@1
// Uso: npm run icones   (grava em assets/)
const { writeFileSync } = require("node:fs");
const { join } = require("node:path");
const sharp = require("sharp");

// Mesma cor de destaque do tema. Branco sobre #006a6a tem contraste de 6,4:1.
const COR_FUNDO = "#006a6a";
const COR_SIMBOLO = "#ffffff";

// Desenho original do símbolo (viewBox 0 -960 960 960).
const SIMBOLO_CHECKLIST =
  "m221-313 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-228q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm0-320 142-142q12-12 28-11.5t28 12.5q11 12 11 28t-11 28L250-548q-12 12-28 12t-28-12l-86-86q-11-11-11-28t11-28q11-11 28-11t28 11l57 57Zm339 353q-17 0-28.5-11.5T520-320q0-17 11.5-28.5T560-360h280q17 0 28.5 11.5T880-320q0 17-11.5 28.5T840-280H560Zm0-320q-17 0-28.5-11.5T520-640q0-17 11.5-28.5T560-680h280q17 0 28.5 11.5T880-640q0 17-11.5 28.5T840-600H560Z";

/**
 * @param tamanho   lado em pixels
 * @param proporcao fração do lado ocupada pelo símbolo
 * @param fundo     cor do fundo ou null (transparente)
 * @param cantos    raio dos cantos do fundo
 * @param cor       cor do símbolo
 */
function svg(tamanho, proporcao, fundo, cantos = 0, cor = COR_SIMBOLO) {
  const lado = tamanho * proporcao;
  const margem = (tamanho - lado) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 ${tamanho} ${tamanho}">
  ${fundo ? `<rect width="${tamanho}" height="${tamanho}" rx="${cantos}" fill="${fundo}"/>` : ""}
  <svg x="${margem}" y="${margem}" width="${lado}" height="${lado}" viewBox="0 -960 960 960">
    <path d="${SIMBOLO_CHECKLIST}" fill="${cor}"/>
  </svg>
</svg>`;
}

const ICONES = {
  // Ícone geral (iOS / lojas): quadrado cheio, o sistema arredonda.
  "icon.png": svg(1024, 0.6, COR_FUNDO),
  // Ícone adaptativo do Android: só ~66% central fica sempre visível.
  "android-icon-foreground.png": svg(1024, 0.42, null),
  "android-icon-background.png": svg(1024, 0, COR_FUNDO),
  "android-icon-monochrome.png": svg(1024, 0.42, null, 0, "#000000"),
  // Splash: símbolo branco sobre o fundo verde-azulado (definido no app.json).
  "splash-icon.png": svg(512, 0.9, null),
  "favicon.png": svg(48, 0.74, COR_FUNDO, 10),
};

(async () => {
  for (const [nome, conteudo] of Object.entries(ICONES)) {
    const destino = join(__dirname, "../assets", nome);
    writeFileSync(destino, await sharp(Buffer.from(conteudo)).png().toBuffer());
    console.log(`Gerado assets/${nome}`);
  }
})();

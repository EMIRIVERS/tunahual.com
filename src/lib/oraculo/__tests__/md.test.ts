import { describe, it, expect } from "vitest";
import { mdAHtml, esc, versos } from "../md";

describe("md", () => {
  it("escapa HTML: el nombre de quien compra no puede inyectar nada", () => {
    expect(mdAHtml('<img src=x onerror="alert(1)"> **negrita**')).toBe('<p>&lt;img src=x onerror=&quot;alert(1)&quot;&gt; <strong>negrita</strong></p>');
    expect(esc(`a&b<c>"d"'e'`)).toBe("a&amp;b&lt;c&gt;&quot;d&quot;&#39;e&#39;");
  });

  it("párrafos y saltos simples como <br>", () => {
    expect(mdAHtml("uno\ndos\n\ntres")).toBe("<p>uno<br>dos</p>\n<p>tres</p>");
  });

  it("énfasis sin romper apóstrofos de nahuales", () => {
    expect(mdAHtml("*Imox* y No'j, I'x")).toBe("<p><em>Imox</em> y No&#39;j, I&#39;x</p>");
  });

  it("lista numerada continuada conserva su numeración y acepta continuación", () => {
    expect(mdAHtml("3. Tres\n4. Cuatro")).toBe('<ol start="3"><li>Tres</li><li>Cuatro</li></ol>');
    expect(mdAHtml("1. Uno\n   sigue\n2. Dos")).toBe('<ol start="1"><li>Uno<br>sigue</li><li>Dos</li></ol>');
  });

  it("versos separa líneas", () => {
    expect(versos("a\n\n b \nc")).toEqual(["a", "b", "c"]);
  });
});

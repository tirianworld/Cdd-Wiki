// Utility to format Tarot AI Chatbot messages:
// 1. Converts JSON objects (like dragon stats, entity dossiers) into clean, styled HTML cards with bold labels and lists (no raw { } [ ] " symbols).
// 2. Converts Markdown formatting (e.g. **bold**, *italic*, headers, bullet lists) to styled HTML (e.g. **HOLA** becomes bold with no asterisks).
// 3. Preserves existing HTML links <a href="..."> and tags.

const KEY_LABELS: Record<string, string> = {
  nombre: "Nombre",
  name: "Nombre",
  title: "Título",
  titulo: "Título",
  tipo: "Tipo",
  type: "Tipo",
  descripcion: "Descripción",
  description: "Descripción",
  papel_en_historia: "Papel en la historia",
  derrota: "Derrota",
  linaje_y_hazanas: "Linaje y hazañas",
  linaje_y_hazañas: "Linaje y hazañas",
  destino_final: "Destino final",
  habilidades: "Habilidades",
  abilities: "Habilidades",
  skills: "Habilidades",
  eventos_clave: "Eventos clave",
  key_events: "Eventos clave",
  ubicacion_principal: "Ubicación principal",
  location: "Ubicación",
  estado: "Estado",
  status: "Estado",
  resumen: "Resumen",
  summary: "Resumen",
  categoria: "Categoría",
  category: "Categoría",
  origen: "Origen",
  origen_y_creacion: "Origen y creación",
  creador: "Creador",
  creacion: "Creación",
  raza: "Raza",
  clase: "Clase",
  alineamiento: "Alineamiento",
  fuerza: "Fuerza",
  destreza: "Destreza",
  constitucion: "Constitución",
  inteligencia: "Inteligencia",
  sabiduria: "Sabiduría",
  carisma: "Carisma",
  velocidad: "Velocidad",
  armadura: "Armadura",
  puntos_de_golpe: "Puntos de golpe",
  sentidos: "Sentidos",
  idiomas: "Idiomas",
  desafio: "Desafío"
};

export function prettyLabel(key: string): string {
  const lower = key.toLowerCase();
  if (KEY_LABELS[lower]) return KEY_LABELS[lower];
  return key
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Convert inline markdown formatting like **bold** to <strong>bold</strong> and *italic* to <em>italic</em>
export function formatInlineMarkdown(text: string): string {
  if (!text) return "";

  let res = text;

  // Code inline `code`
  res = res.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-secondary/80 text-primary font-mono text-[11px] border border-border/40">$1</code>');

  // Bold-italic: ***text*** or ___text___
  res = res.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong class="font-semibold text-foreground"><em>$1</em></strong>');
  res = res.replace(/___([^_]+)___/g, '<strong class="font-semibold text-foreground"><em>$1</em></strong>');

  // Bold: **text** or __text__ -> Transforms **HOLA** into bold without asterisks
  res = res.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>');
  res = res.replace(/__([^_]+)__/g, '<strong class="font-semibold text-foreground">$1</strong>');

  // Italic: *text* or _text_
  res = res.replace(/(?:^|\s)\*([^*\n]+)\*(?=\s|$|[.,;:!?])/g, ' <em class="text-foreground/90">$1</em>');
  res = res.replace(/(?:^|\s)_([^_\n]+)_(?=\s|$|[.,;:!?])/g, ' <em class="text-foreground/90">$1</em>');

  // Markdown links [title](url) -> <a href="url" ...>title</a>
  res = res.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, url) => {
    const isInternal = url.startsWith("/");
    return `<a href="${url}" class="text-primary underline font-medium hover:text-primary/80 transition-colors"${isInternal ? "" : ' target="_blank" rel="noopener noreferrer"'}>${label}</a>`;
  });

  return res;
}

// Convert a JSON object into a styled visual card without raw symbols (no brackets, braces, colons or quotes)
export function formatJsonObjectToHtml(obj: Record<string, any>): string {
  if (!obj || typeof obj !== "object") return "";

  let html = `<div class="not-prose my-2.5 p-3.5 rounded-2xl bg-secondary/40 border border-primary/25 space-y-2.5 text-xs text-foreground shadow-sm">`;

  // Find title or name
  const titleKey = Object.keys(obj).find((k) =>
    ["nombre", "name", "title", "titulo"].includes(k.toLowerCase())
  );
  
  const subtitleKey = Object.keys(obj).find((k) =>
    ["tipo", "type", "category", "categoria", "clase", "raza"].includes(k.toLowerCase())
  );

  if (titleKey && obj[titleKey]) {
    const titleVal = String(obj[titleKey]);
    const subtitleVal = subtitleKey ? String(obj[subtitleKey]) : null;

    html += `<div class="border-b border-primary/20 pb-2 mb-2">
      <h4 class="text-sm font-bold text-primary font-heading flex items-center gap-1.5">${titleVal}</h4>
      ${subtitleVal ? `<span class="inline-block mt-1 text-[10.5px] font-medium text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">${subtitleVal}</span>` : ""}
    </div>`;
  }

  // Iterate over remaining keys
  for (const [key, value] of Object.entries(obj)) {
    if (key === titleKey) continue;
    if (key === subtitleKey && titleKey) continue; // Already rendered in header badge
    const label = prettyLabel(key);

    if (Array.isArray(value)) {
      html += `<div class="space-y-1 my-1.5">
        <strong class="text-primary font-semibold text-[11px] block">${label}:</strong>
        <ul class="list-disc list-inside pl-1 space-y-0.5 text-foreground/90">
          ${value
            .map((item) => `<li>${typeof item === "object" ? formatJsonObjectToHtml(item) : formatInlineMarkdown(String(item))}</li>`)
            .join("")}
        </ul>
      </div>`;
    } else if (value && typeof value === "object") {
      html += `<div class="space-y-1 my-1.5">
        <strong class="text-primary font-semibold text-[11px] block">${label}:</strong>
        ${formatJsonObjectToHtml(value)}
      </div>`;
    } else if (value !== null && value !== undefined && String(value).trim()) {
      html += `<p class="leading-relaxed my-1">
        <strong class="text-primary font-semibold">${label}:</strong> <span class="text-foreground/90">${formatInlineMarkdown(String(value))}</span>
      </p>`;
    }
  }

  html += `</div>`;
  return html;
}

// Extracts JSON blocks and replaces them with placeholder tokens
function extractJsonBlocks(text: string): { processedText: string; cards: string[] } {
  const cards: string[] = [];
  let result = "";
  let i = 0;

  while (i < text.length) {
    if (text[i] === "{" && (i === 0 || /\s|[=:(]/.test(text[i - 1]))) {
      let depth = 0;
      let inString = false;
      let escape = false;
      let endIndex = -1;

      for (let j = i; j < text.length; j++) {
        const ch = text[j];
        if (escape) {
          escape = false;
          continue;
        }
        if (ch === "\\") {
          escape = true;
          continue;
        }
        if (ch === '"') {
          inString = !inString;
          continue;
        }
        if (!inString) {
          if (ch === "{") depth++;
          else if (ch === "}") {
            depth--;
            if (depth === 0) {
              endIndex = j;
              break;
            }
          }
        }
      }

      if (endIndex !== -1) {
        const potentialJson = text.slice(i, endIndex + 1);
        if (potentialJson.includes('":')) {
          try {
            const parsed = JSON.parse(potentialJson);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed) && Object.keys(parsed).length > 0) {
              cards.push(formatJsonObjectToHtml(parsed));
              result += `\n\n<!--CARD_${cards.length - 1}-->\n\n`;
              i = endIndex + 1;
              continue;
            }
          } catch {
            // Not valid JSON, continue normal flow
          }
        }
      }
    }
    result += text[i];
    i++;
  }

  return { processedText: result, cards };
}

// Convert mixed content (Markdown, JSON blocks, HTML) to safe, styled HTML
export function renderTarotContent(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";

  let text = rawText.trim();

  // 1. Check if the entire text is a JSON object
  if (text.startsWith("{") && text.endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        // If it's a wrapper like { message: "..." }, extract it or format it
        if (parsed.message || parsed.respuesta || parsed.mensaje || parsed.text) {
          const innerMsg = parsed.message || parsed.respuesta || parsed.mensaje || parsed.text;
          return renderTarotContent(innerMsg);
        }
        return formatJsonObjectToHtml(parsed);
      }
    } catch {
      // not valid json, continue normal processing
    }
  }

  // 2. Extract ```json { ... } ``` or ``` { ... } ``` codeblocks
  const codeCards: string[] = [];
  text = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, (match, blockContent) => {
    const trimmedBlock = blockContent.trim();
    if (trimmedBlock.startsWith("{") && trimmedBlock.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmedBlock);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          codeCards.push(formatJsonObjectToHtml(parsed));
          return `\n\n<!--CODE_CARD_${codeCards.length - 1}-->\n\n`;
        }
      } catch {
        // not valid json
      }
    }
    codeCards.push(`<pre class="p-3 my-2 rounded-xl bg-secondary/80 border border-border/50 text-[11px] overflow-x-auto text-foreground/90 font-mono"><code>${blockContent}</code></pre>`);
    return `\n\n<!--CODE_CARD_${codeCards.length - 1}-->\n\n`;
  });

  // 3. Extract standalone JSON blocks from prose
  const { processedText, cards: inlineCards } = extractJsonBlocks(text);
  text = processedText;

  // 4. If the text already has full HTML paragraph tags (<p>...</p>), format inline markdown inside it
  const hasExistingHtmlTags = /<\/?(p|div|ul|ol|h[1-6]|table|blockquote)[\s>]/i.test(text);

  let formattedHtml = "";

  if (hasExistingHtmlTags) {
    formattedHtml = formatInlineMarkdown(text);
  } else {
    // 5. Parse standard Markdown blocks into HTML
    const lines = text.split("\n");
    const output: string[] = [];
    let currentListType: "ul" | "ol" | null = null;
    let currentListItems: string[] = [];

    const flushList = () => {
      if (currentListType && currentListItems.length > 0) {
        const tag = currentListType;
        const listClass = tag === "ul" ? "list-disc list-inside space-y-1 my-2 text-foreground/90" : "list-decimal list-inside space-y-1 my-2 text-foreground/90";
        output.push(`<${tag} class="${listClass}">${currentListItems.map((li) => `<li>${formatInlineMarkdown(li)}</li>`).join("")}</${tag}>`);
        currentListType = null;
        currentListItems = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      // Check for card placeholders
      if (/<!--(?:CODE_)?CARD_\d+-->/.test(line)) {
        flushList();
        output.push(line);
        continue;
      }

      // Markdown Headers
      if (line.startsWith("### ")) {
        flushList();
        output.push(`<h4 class="font-heading font-bold text-xs text-primary mt-3 mb-1 flex items-center gap-1.5">${formatInlineMarkdown(line.slice(4))}</h4>`);
        continue;
      }
      if (line.startsWith("## ")) {
        flushList();
        output.push(`<h3 class="font-heading font-bold text-sm text-primary mt-3 mb-1.5 flex items-center gap-1.5">${formatInlineMarkdown(line.slice(3))}</h3>`);
        continue;
      }
      if (line.startsWith("# ")) {
        flushList();
        output.push(`<h2 class="font-heading font-bold text-base text-primary mt-3.5 mb-2 flex items-center gap-2">${formatInlineMarkdown(line.slice(2))}</h2>`);
        continue;
      }

      // Blockquote
      if (line.startsWith("> ")) {
        flushList();
        output.push(`<blockquote class="border-l-2 border-primary/50 pl-3 italic text-muted-foreground my-2">${formatInlineMarkdown(line.slice(2))}</blockquote>`);
        continue;
      }

      // Unordered List (- or *)
      const ulMatch = line.match(/^[-*]\s+(.*)$/);
      if (ulMatch) {
        if (currentListType && currentListType !== "ul") {
          flushList();
        }
        currentListType = "ul";
        currentListItems.push(ulMatch[1]);
        continue;
      }

      // Ordered List (1. )
      const olMatch = line.match(/^\d+\.\s+(.*)$/);
      if (olMatch) {
        if (currentListType && currentListType !== "ol") {
          flushList();
        }
        currentListType = "ol";
        currentListItems.push(olMatch[1]);
        continue;
      }

      // Regular paragraph line
      flushList();
      output.push(`<p class="leading-relaxed mb-2">${formatInlineMarkdown(line)}</p>`);
    }

    flushList();
    formattedHtml = output.join("");
  }

  // Restore placeholders
  codeCards.forEach((cardHtml, idx) => {
    formattedHtml = formattedHtml.replace(new RegExp(`<!--CODE_CARD_${idx}-->`, "g"), cardHtml);
  });

  inlineCards.forEach((cardHtml, idx) => {
    formattedHtml = formattedHtml.replace(new RegExp(`<!--CARD_${idx}-->`, "g"), cardHtml);
  });

  return formattedHtml;
}

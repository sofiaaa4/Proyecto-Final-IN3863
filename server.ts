import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL = 'gemini-4-hydrogen';

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Falta configurar GEMINI_API_KEY en el entorno del servidor para generar respuestas con Gemini.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractErrorMessage(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('GEMINI_API_KEY')) {
    return { status: 500, message: raw };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message: 'Se alcanzó el límite temporal de solicitudes a Gemini. Intenta de nuevo en unos segundos.',
    };
  }
  if (raw.includes('403') || raw.includes('PERMISSION_DENIED') || raw.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: 'La clave de API de Gemini no tiene permisos o es inválida. Verifica la configuración en Secrets.',
    };
  }
  return {
    status: 500,
    message: 'No pudimos completar la generación con Gemini en este momento. Intenta nuevamente.',
  };
}

function stripCodeFences(raw: string): string {
  let cleaned = raw.trim();
  const htmlBlockMatch = cleaned.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (htmlBlockMatch && htmlBlockMatch[1]) {
    cleaned = htmlBlockMatch[1].trim();
  }
  return cleaned;
}

const app = express();
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// 1. Sugerir 5 problemas concretos del track
app.post('/api/suggest-problems', async (req: Request, res: Response) => {
  try {
    const { trackName, trackDescription, targetAudience, teamName } = req.body as {
      trackName: string;
      trackDescription: string;
      targetAudience: string;
      teamName?: string;
    };

    if (!trackName || !targetAudience?.trim()) {
      res.status(400).json({ error: 'Indica primero a quién quieres ayudar y el track.' });
      return;
    }

    const ai = getAI();
    const prompt = `Eres mentor técnico en una ideathon de 19 horas sobre Avalanche (blockchain).
Equipo: ${teamName || 'Equipo'}
Track elegido: ${trackName} — ${trackDescription}
Usuario o comunidad objetivo que escribió el equipo: "${targetAudience}"

Propón exactamente 5 problemas concretos, reales y específicos que afecten a "${targetAudience}" y que encajen de forma natural en el track "${trackName}".
Deben ser problemas accionables para prototipar un MVP visual en pocas horas, sin jerga innecesaria.
Responde 100% en español.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Título corto y directo del problema (máximo 9 palabras).' },
                  description: { type: Type.STRING, description: 'Explicación concreta de 1-2 oraciones en español.' },
                  task: { type: Type.STRING, description: 'Qué tarea intenta hacer la persona.' },
                  obstacle: { type: Type.STRING, description: 'Qué obstáculo se lo impide hoy.' },
                  cost: { type: Type.STRING, description: 'Qué le cuesta (tiempo, dinero o confianza, en concreto).' },
                },
                required: ['title', 'description', 'task', 'obstacle', 'cost'],
              },
            },
          },
          required: ['problems'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      problems?: Array<{
        title: string;
        description: string;
        task: string;
        obstacle: string;
        cost: string;
      }>;
    };

    const problems = (parsed.problems ?? []).slice(0, 5).map((p, idx) => ({
      id: `prob-${Date.now()}-${idx}`,
      ...p,
    }));

    if (problems.length === 0) {
      throw new Error('Empty problems response');
    }

    res.json({ problems });
  } catch (err) {
    const info = extractErrorMessage(err);
    res.status(info.status).json({ error: info.message });
  }
});

// 2. Redactar frase de problema editable
app.post('/api/draft-problem-statement', async (req: Request, res: Response) => {
  try {
    const { trackName, targetAudience, problemTitle, problemDescription, task, obstacle, cost } =
      req.body as {
        trackName: string;
        targetAudience: string;
        problemTitle: string;
        problemDescription: string;
        task?: string;
        obstacle?: string;
        cost?: string;
      };

    const ai = getAI();
    const prompt = `Redacta UNA sola frase clara y natural en español siguiendo estrictamente esta estructura:
"[Persona] tiene que [tarea], pero hoy [obstáculo], lo que le cuesta [tiempo/dinero/confianza]"

Contexto:
- Track: ${trackName}
- Persona / usuario objetivo: ${targetAudience}
- Problema elegido: ${problemTitle} — ${problemDescription}
- Pistas opcionales: tarea=${task || ''}, obstáculo=${obstacle || ''}, costo=${cost || ''}

No uses corchetes en tu respuesta. Reemplaza cada parte con texto fluido, concreto y fácil de leer en voz alta en un pitch.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            statement: {
              type: Type.STRING,
              description: 'La frase completa en español siguiendo la estructura indicada, sin corchetes.',
            },
          },
          required: ['statement'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as { statement?: string };
    if (!parsed.statement) {
      throw new Error('Missing statement');
    }

    res.json({ statement: parsed.statement.trim() });
  } catch (err) {
    const info = extractErrorMessage(err);
    res.status(info.status).json({ error: info.message });
  }
});

// 3. Proponer 3 soluciones simples
app.post('/api/suggest-solutions', async (req: Request, res: Response) => {
  try {
    const { trackName, trackDescription, targetAudience, problemStatement } = req.body as {
      trackName: string;
      trackDescription: string;
      targetAudience: string;
      problemStatement: string;
    };

    const ai = getAI();
    const prompt = `Propón exactamente 3 soluciones simples, distintas entre sí y factibles para prototipar en una ideathon de 19 horas en Avalanche.
Track: ${trackName} (${trackDescription})
Usuario objetivo: ${targetAudience}
Problema definido: "${problemStatement}"

Para cada solución entrega:
- name: Un nombre corto, memorable y moderno de producto (1 a 3 palabras).
- oneLiner: Una sola oración clara en español que explique qué hace y cómo resuelve el problema.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            solutions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  oneLiner: { type: Type.STRING },
                },
                required: ['name', 'oneLiner'],
              },
            },
          },
          required: ['solutions'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      solutions?: Array<{ name: string; oneLiner: string }>;
    };

    const solutions = (parsed.solutions ?? []).slice(0, 3).map((s, idx) => ({
      id: `sol-${Date.now()}-${idx}`,
      ...s,
    }));

    if (solutions.length === 0) {
      throw new Error('Empty solutions');
    }

    res.json({ solutions });
  } catch (err) {
    const info = extractErrorMessage(err);
    res.status(info.status).json({ error: info.message });
  }
});

// 4. Sugerir respuesta para cada una de las 4 preguntas del rol de Avalanche
app.post('/api/suggest-avalanche-answer', async (req: Request, res: Response) => {
  try {
    const {
      questionKey,
      trackName,
      problemStatement,
      solutionName,
      solutionOneLiner,
      previousAnswers,
    } = req.body as {
      questionKey: 'onChainData' | 'verifierTrust' | 'withoutBlockchain' | 'offChainData';
      trackName: string;
      problemStatement: string;
      solutionName: string;
      solutionOneLiner: string;
      previousAnswers?: Record<string, string>;
    };

    const questionMap: Record<string, string> = {
      onChainData: '¿Qué dato o acción concreta queda registrado en la cadena (Avalanche)?',
      verifierTrust: '¿Quién lo verifica y qué confianza se gana con ese registro?',
      withoutBlockchain: '¿Qué pasaría si esta solución se hiciera sin blockchain (base de datos tradicional)?',
      offChainData: '¿Qué queda fuera de la cadena (off-chain) y por qué es mejor así?',
    };

    const questionText = questionMap[questionKey];
    if (!questionText) {
      res.status(400).json({ error: 'Pregunta no reconocida.' });
      return;
    }

    const ai = getAI();
    const prompt = `Ayuda a un equipo en una ideathon de Avalanche a responder con claridad y criterio técnico realista la siguiente pregunta sobre su proyecto.

Proyecto: ${solutionName} — ${solutionOneLiner}
Track: ${trackName}
Problema: ${problemStatement}
Respuestas previas del equipo: ${JSON.stringify(previousAnswers || {})}

Pregunta a responder: "${questionText}"

Escribe UNA sugerencia directa, concreta y honesta en español (máximo 2-3 oraciones, lista para que el equipo la use o edite). Evita humo o promesas irreales.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestion: { type: Type.STRING },
          },
          required: ['suggestion'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as { suggestion?: string };
    if (!parsed.suggestion) {
      throw new Error('Missing suggestion');
    }

    res.json({ suggestion: parsed.suggestion.trim() });
  } catch (err) {
    const info = extractErrorMessage(err);
    res.status(info.status).json({ error: info.message });
  }
});

// 4b. Resumir rol de Avalanche en una frase
app.post('/api/summarize-avalanche-role', async (req: Request, res: Response) => {
  try {
    const { solutionName, teamName, trackName, problemStatement, avalancheAnswers } = req.body as {
      solutionName: string;
      teamName: string;
      trackName: string;
      problemStatement: string;
      avalancheAnswers: {
        onChainData: string;
        verifierTrust: string;
        withoutBlockchain: string;
        offChainData: string;
      };
    };

    const ai = getAI();
    const projectLabel = solutionName || teamName || 'nuestro proyecto';

    const prompt = `Sintetiza el rol de Avalanche en UNA sola frase en español usando exactamente este formato:
"En ${projectLabel}, Avalanche se usa para [verbo] [qué], de modo que [beneficio]"

Contexto del equipo:
- Track: ${trackName}
- Problema: ${problemStatement}
- Qué va on-chain: ${avalancheAnswers.onChainData}
- Quién verifica y confianza: ${avalancheAnswers.verifierTrust}
- Qué pasaría sin blockchain: ${avalancheAnswers.withoutBlockchain}
- Qué queda off-chain y por qué: ${avalancheAnswers.offChainData}

Reglas:
- No dejes corchetes [].
- Debe sonar clara, convincente y libre de buzzwords vacíos.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
          },
          required: ['summary'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as { summary?: string };
    if (!parsed.summary) {
      throw new Error('Missing summary');
    }

    res.json({ summary: parsed.summary.trim() });
  } catch (err) {
    const info = extractErrorMessage(err);
    res.status(info.status).json({ error: info.message });
  }
});

// 5. Generar o ajustar prototipo HTML autocontenido
app.post('/api/generate-prototype', async (req: Request, res: Response) => {
  try {
    const {
      teamName,
      members,
      trackName,
      targetAudience,
      problemStatement,
      solutionName,
      solutionOneLiner,
      avalancheSummary,
      avalancheAnswers,
      currentHtml,
      adjustmentInstruction,
    } = req.body as {
      teamName: string;
      members: string[];
      trackName: string;
      targetAudience: string;
      problemStatement: string;
      solutionName: string;
      solutionOneLiner: string;
      avalancheSummary: string;
      avalancheAnswers: Record<string, string>;
      currentHtml?: string;
      adjustmentInstruction?: string;
    };

    const ai = getAI();
    const isAdjustment = Boolean(currentHtml && adjustmentInstruction?.trim());

    const baseRules = `REQUISITOS ESTRICTOS DEL ARCHIVO HTML AUTOCONTENIDO:
1. Devuelve UN ÚNICO documento HTML5 completo (<!DOCTYPE html> ... </html>) con todo el CSS dentro de <style> y todo el JS dentro de <script>.
2. PROHIBIDO usar librerías externas, CDNs, Google Fonts externos, Tailwind CDN, Bootstrap, React CDN ni fetch a internet. Todo debe funcionar 100% offline dentro de un iframe sandbox="allow-scripts".
3. TODO el texto visible, botones, etiquetas y datos simulados deben estar en ESPAÑOL y ser realistas para el caso de uso del usuario.
4. Diseñado específicamente para pantalla móvil (375px–410px de ancho, sin scroll horizontal, botones táctiles cómodos de al menos 44px de alto, estética limpia oscura con acento rojo #E84142 o paleta moderna de alto contraste acorde al producto).
5. Debe tener de 3 a 5 pantallas o vistas navegables con JS (por ejemplo mediante una barra inferior o botones de flujo "Paso 1 -> Paso 2 -> Paso 3 -> Confirmación") que muestren claramente el flujo principal del usuario: hace X, ve Y, obtiene Z.
6. Incluye un botón interactivo y simulado "Conectar billetera" en el header que, al tocarlo, cambie de estado a "0x71C...9A4F · C-Chain" (simulado) y permita desconectar/reconectar.
7. Incluye un indicador visible que diga exactamente "Registrado en Avalanche (simulado)" acompañado de un ID de transacción falso realista (ejemplo: "0x8f3a91c4...e72b10") que aparezca o se genere dinámicamente cuando el usuario ejecuta la acción principal del prototipo, con botón para simular una nueva transacción o ver el detalle simulado.
8. Nunca uses alert(), confirm() o window.open(). Usa retroalimentación visual dentro de la misma interfaz.`;

    const prompt = isAdjustment
      ? `Eres un diseñador e ingeniero frontend senior. Tienes el siguiente prototipo HTML autocontenido para el proyecto "${solutionName}".
El equipo pidió este ajuste específico:
"${adjustmentInstruction}"

Contexto del proyecto:
- Equipo: ${teamName} (${members.filter(Boolean).join(', ')})
- Track: ${trackName}
- Usuario objetivo: ${targetAudience}
- Problema: ${problemStatement}
- Solución: ${solutionName} — ${solutionOneLiner}
- Rol de Avalanche: ${avalancheSummary}

${baseRules}

HTML actual a modificar (aplica el ajuste pedido manteniendo intacto lo que ya funciona bien):
\`\`\`html
${currentHtml}
\`\`\`

Devuelve SOLO el JSON con el HTML completo actualizado.`
      : `Eres un diseñador e ingeniero frontend senior creando el mockup interactivo de una ideathon para presentar en vivo desde el celular.

Proyecto: "${solutionName}"
Descripción: ${solutionOneLiner}
Equipo: ${teamName} (${members.filter(Boolean).join(', ')})
Track: ${trackName}
Usuario objetivo: ${targetAudience}
Problema: ${problemStatement}
Rol de Avalanche: ${avalancheSummary}
Detalles on-chain: ${JSON.stringify(avalancheAnswers)}

${baseRules}

Crea una experiencia sumamente pulida, creíble y navegable de 3 a 5 pantallas donde el jurado pueda tocar botones reales, completar un flujo realista de "${solutionName}", conectar la billetera simulada y ver el comprobante "Registrado en Avalanche (simulado)" con hash de transacción.`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            html: {
              type: Type.STRING,
              description: 'Documento HTML5 completo autocontenido (HTML+CSS+JS en un solo archivo).',
            },
          },
          required: ['html'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as { html?: string };
    let html = stripCodeFences(parsed.html ?? '');

    if (!html || !html.toLowerCase().includes('<html')) {
      throw new Error('Invalid HTML generated');
    }

    res.json({ html });
  } catch (err) {
    const info = extractErrorMessage(err);
    res.status(info.status).json({ error: info.message });
  }
});

// 6. Generar README en Markdown y Guion de Pitch de 3 minutos
app.post('/api/generate-deliverables', async (req: Request, res: Response) => {
  try {
    const {
      teamName,
      members,
      trackName,
      trackDescription,
      targetAudience,
      problemStatement,
      solutionName,
      solutionOneLiner,
      avalancheAnswers,
      avalancheSummary,
      prototypeHtml,
    } = req.body as {
      teamName: string;
      members: string[];
      trackName: string;
      trackDescription: string;
      targetAudience: string;
      problemStatement: string;
      solutionName: string;
      solutionOneLiner: string;
      avalancheAnswers: {
        onChainData: string;
        verifierTrust: string;
        withoutBlockchain: string;
        offChainData: string;
      };
      avalancheSummary: string;
      prototypeHtml?: string;
    };

    const ai = getAI();
    const prompt = `Genera los entregables finales para una ideathon de 19 horas en Avalanche, 100% en español y listos para usar.

Datos reales del proyecto:
- Nombre del proyecto / solución: ${solutionName}
- Descripción corta: ${solutionOneLiner}
- Equipo: ${teamName}
- Integrantes: ${members.filter(Boolean).join(', ')}
- Track: ${trackName} (${trackDescription})
- Usuario objetivo: ${targetAudience}
- Enunciado del problema: ${problemStatement}
- Resumen rol de Avalanche: ${avalancheSummary}
- Qué queda on-chain: ${avalancheAnswers.onChainData}
- Quién verifica y qué confianza gana: ${avalancheAnswers.verifierTrust}
- Qué pasaría sin blockchain: ${avalancheAnswers.withoutBlockchain}
- Qué queda off-chain y por qué: ${avalancheAnswers.offChainData}
- Extracto del prototipo HTML generado (para describir exactamente cómo recorrer la demo real):
${(prototypeHtml || '').slice(0, 6000)}

Debes devolver:
1. readmeMarkdown: Un archivo README.md completo y bien formateado en Markdown con estas secciones exactas:
   - Título del proyecto y resumen de una línea
   - Equipo e integrantes
   - Track elegido y por qué encaja
   - Usuario y problema
   - Solución propuesta
   - Rol concreto de Avalanche (incluyendo qué va on-chain, verificación, por qué no basta una DB tradicional y qué va off-chain)
   - Cómo recorrer la demo paso a paso (basado en las pantallas del prototipo)
   - Tabla en Markdown: "| Qué es mockup hoy | Qué falta validar / implementar |" con 4-5 filas honestas y claras
   - Próximos pasos después de la ideathon

2. pitchScript: Guion hablado de pitch de exactamente 3 minutos dividido en 3 bloques claros, en lenguaje oral natural y directo (sin relleno):
   - part1: "0:00 - 0:45 · El problema" (~100-120 palabras)
   - part2: "0:45 - 1:45 · Solución y rol de Avalanche" (~130-155 palabras)
   - part3: "1:45 - 3:00 · Demo en vivo y cierre" (~160-190 palabras, guiando lo que muestran en el celular)`;

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            readmeMarkdown: { type: Type.STRING },
            pitchPart1: { type: Type.STRING },
            pitchPart2: { type: Type.STRING },
            pitchPart3: { type: Type.STRING },
          },
          required: ['readmeMarkdown', 'pitchPart1', 'pitchPart2', 'pitchPart3'],
        },
      },
    });

    const parsed = JSON.parse((response.text ?? '{}').trim()) as {
      readmeMarkdown?: string;
      pitchPart1?: string;
      pitchPart2?: string;
      pitchPart3?: string;
    };

    if (!parsed.readmeMarkdown || !parsed.pitchPart1 || !parsed.pitchPart2 || !parsed.pitchPart3) {
      throw new Error('Incomplete deliverables response');
    }

    const fullText = [
      `# Guion de Pitch (3 minutos) — ${solutionName}`,
      '',
      '## 0:00 - 0:45 · El problema',
      parsed.pitchPart1.trim(),
      '',
      '## 0:45 - 1:45 · Solución y rol de Avalanche',
      parsed.pitchPart2.trim(),
      '',
      '## 1:45 - 3:00 · Demo en vivo y cierre',
      parsed.pitchPart3.trim(),
    ].join('\n');

    res.json({
      readmeMarkdown: parsed.readmeMarkdown.trim(),
      pitchScript: {
        part1: parsed.pitchPart1.trim(),
        part2: parsed.pitchPart2.trim(),
        part3: parsed.pitchPart3.trim(),
        fullText,
      },
    });
  } catch (err) {
    const info = extractErrorMessage(err);
    res.status(info.status).json({ error: info.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Ideathon Studio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

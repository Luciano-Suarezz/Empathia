import { GoogleGenAI } from "@google/genai";
import { ToneOption, OutputLanguage, MacroType, LengthOption, PerspectiveOption, ModelOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface TransformParams {
  text: string;
  tones: ToneOption[];
  targetLanguage: OutputLanguage;
  macroType: MacroType;
  lengthOption: LengthOption;
  perspective: PerspectiveOption;
  model: ModelOption;
  issueTopic?: string;
  refinementInstruction?: string;
  previousOutput?: string;
  isClosingFinal?: boolean; // New parameter
}

export const streamTransformText = async (
  params: TransformParams,
  onChunk: (text: string) => void
): Promise<string> => {
  
  const { text, tones, targetLanguage, macroType, lengthOption, perspective, model, issueTopic, refinementInstruction, previousOutput, isClosingFinal } = params;

  // --- Lógica de Prompt ---
  let prompt = "";

  if (refinementInstruction && previousOutput) {
    // MODO REFINAMIENTO
    prompt = `
      Actúa como experto en comunicación para soporte TikTok LIVE.
      
      CONTEXTO:
      Anteriormente generaste este texto: "${previousOutput}"
      
      SOLICITUD DEL USUARIO:
      "${refinementInstruction}"
      
      TAREA:
      Reescribe el texto anterior aplicando la solicitud del usuario.
      Mantén las reglas de seguridad (No tocar URLs, emails, marcas).
      Mantén el idioma del texto anterior a menos que la solicitud diga lo contrario.
      Devuelve SOLO el texto corregido.
    `;
  } else {
    // MODO TRANSFORMACIÓN ORIGINAL
    const hasEmpathy = tones.includes(ToneOption.EMPATHY);
    const hasSuperEmpathy = tones.includes(ToneOption.SUPER_EMPATHY);
    const isParaphrase = tones.includes(ToneOption.PARAPHRASE);
    const otherTones = tones.filter(t => t !== ToneOption.PARAPHRASE && t !== ToneOption.EMPATHY && t !== ToneOption.SUPER_EMPATHY);
    
    // --- Configuración de Perspectiva ---
    const isPersonal = perspective === PerspectiveOption.ME;
    const perspectiveInstruction = isPersonal
        ? "PERSPECTIVA: Usa PRIMERA PERSONA SINGULAR ('Yo', 'Mi', 'I', 'Me', 'My'). Habla como un agente individual. Adapta cualquier plantilla plural a singular (Ej: cambia 'We understand' por 'I understand')."
        : "PERSPECTIVA: Usa PLURAL CORPORATIVO ('Nosotros', 'Nuestro', 'We', 'Us', 'Our'). Hablas en nombre de TikTok LIVE.";

    const genderNeutralInstruction = "GÉNERO: Usa un lenguaje neutro en cuanto a género. Evita asumir el género del usuario.";

    // --- MEJORA DE EMPATÍA ---
    let empathyInstruction = "";
    if (hasSuperEmpathy) {
      empathyInstruction = `
      NIVEL DE EMPATÍA: EXTREMO (SUPER EMPATÍA).
      - Debes sonar increíblemente cálido, compasivo y profundamente humano.
      - Valida las emociones del usuario de forma intensa: "Lamento muchísimo que estés pasando por esto", "Entiendo perfectamente lo frustrante y agotador que debe ser para ti", "Tu experiencia y bienestar como creador son nuestra máxima prioridad absoluta".
      - Usa un lenguaje que transmita apoyo total: "Estoy aquí para apoyarte en cada paso", "No descansaremos hasta que esto se aclare", "Aprecio enormemente tu paciencia y tu pasión".
      - Rompe la barrera corporativa para hablar de persona a persona con genuino cuidado.
      `;
    } else if (hasEmpathy) {
      empathyInstruction = `
      NIVEL DE EMPATÍA: MÁXIMO.
      - Valida explícitamente las emociones o frustraciones del usuario. 
      - Usa frases como "Entiendo perfectamente lo frustrante que esto puede ser", "Aprecio mucho tu paciencia", "Tu experiencia es muy importante para nosotros".
      - El tono debe ser cálido, humano y genuinamente preocupado. Evita sonar robótico o meramente transaccional.
      - Transmite que estás de su lado y que valoras su tiempo como creador/usuario.
      `;
    }

    const otherToneInstruction = otherTones.length > 0 
      ? `Aplica también estos tonos al CUERPO del mensaje: ${otherTones.join(", ")}.` 
      : "";

    const structureInstruction = isParaphrase
      ? "MODO PARAFRASEO: Tienes permiso para reestructurar las oraciones del CUERPO para mejorar la fluidez y claridad."
      : "MODO EDICIÓN MÍNIMA: Mantén la estructura del CUERPO casi idéntica.";

    const languageInstruction = targetLanguage === OutputLanguage.AUTO
      ? "Mantén el idioma original del texto."
      : `TRADUCE TODO el texto (incluido saludos o cierres agregados) al idioma: ${targetLanguage}.`;

    let lengthInstruction = "";
    switch (lengthOption) {
      case LengthOption.SHORT:
        lengthInstruction = "LONGITUD: Condensa el cuerpo del mensaje. Elimina redundancias. Hazlo más CORTO.";
        break;
      case LengthOption.LONG:
        lengthInstruction = "LONGITUD: Expande ligeramente el cuerpo del mensaje con conectores. Hazlo más LARGO.";
        break;
      default:
        lengthInstruction = "LONGITUD: Mantén una longitud similar.";
        break;
    }

    // --- LÓGICA DE CIERRE ---
    let closingRules = "";

    if (isClosingFinal) {
        // Reglas para Closing Final (Survey / Rejection / Timeout)
        closingRules = `
        PASO FINAL: CIERRE DE TICKET (MODO FINAL ACTIVADO)
        Analiza el contenido de la resolución que has generado y selecciona AUTOMÁTICAMENTE uno de los siguientes cierres.
        IMPORTANTE: Si la perspectiva es 'Yo' (Personal), adapta los pronombres de estos textos (We -> I, Us -> Me, Our -> My).

        Escenario A: Resolución Positiva (Problema arreglado/solucionado/ayuda completada). Elige uno al azar:
           1. "We’re glad to hear the issue has been resolved! Your feedback is invaluable to us, so we’d appreciate it if you could take a moment to complete a brief survey."
           2. "We’re happy to hear the issue has been resolved! Your feedback means a lot to us, so we’d greatly appreciate it if you could share your thoughts in a brief survey to help us improve."
           3. "We’re glad we could assist you today. Your feedback is important to us, so we’d appreciate it if you could share your thoughts in a brief survey."

        Escenario B: Resolución Negativa (No es lo que el usuario quería, pero se dio claridad/explicación final):
           "We understand this may not be the resolution you were hoping for, but we hope our explanation has provided clarity. We’ll proceed to close this ticket for now. If you have any other questions or need further assistance with a different matter, please feel free to reach out. Thank you for your understanding."

        Escenario C: Cierre por falta de información / Usuario no responde (Timeout):
           "Despite multiple follow-ups, we haven’t received any additional information to proceed with a re-evaluation. As such, we’ll be closing this ticket for now. If you’re able to provide the necessary details in the future, feel free to reach out again and we’ll be happy to assist. Thank you for your understanding."
        
        NO añadidas ninguna otra firma o despedida después de esto.
        `;
    } else {
        // Reglas de cierre estándar (Abierto)
        closingRules = `
        PASO FINAL: CIERRE (OBLIGATORIO)
        Debes finalizar el mensaje EXCLUSIVAMENTE con una de las siguientes opciones (adaptando a Singular 'I'/'My' si la perspectiva es personal).
        
        CRÍTICO / PROHIBIDO:
        - NO uses "Best regards", "Sincerely", "Cheers", etc.
        - NO escribas ninguna firma como "TikTok LIVE Support", "TikTok Team", ni tu nombre.
        - TU RESPUESTA DEBE TERMINAR INMEDIATAMENTE DESPUÉS DE LA FRASE DE CIERRE.

        Opciones permitidas (Elige una):
           1) "If you have any further questions, don't hesitate to get in touch. Thank you and have a great day!"
           2) "If there’s anything else we can assist you with, please don’t hesitate to let us know. Thank you, and have a wonderful day ahead."
           3) "If you have any further questions, feel free to let us know. Thank you, and have a wonderful day!"
        `;
    }

    let macroInstruction = "";
    
    if (macroType === MacroType.FULL) {
      macroInstruction = `
        - TIPO: MACRO COMPLETO.
        - ACCIÓN: Procesa todo el texto.
        - ESTRUCTURA: Respeta la estructura original pero mejora el tono. REEMPLAZA cualquier cierre o firma existente con las reglas definidas abajo.
        
        ${closingRules}
      `;
    } else if (macroType === MacroType.FIRST) {
      
      const issuePlaceholder = issueTopic ? issueTopic.trim() : "[ISSUE]";
      
      macroInstruction = `
        - TIPO: PRIMER MENSAJE.
        - FORMATO OBLIGATORIO:
           1. SALUDO + ACKNOWLEDGE
           2. RESOLUCIÓN (Cuerpo transformado)
           3. DESPEDIDA (Según reglas abajo)

        PASO 1: SALUDO + ACKNOWLEDGE
        Elige aleatoriamente una opción. 
        IMPORTANTE: Si la instrucción de PERSPECTIVA es 'Yo', CAMBIA 'We' por 'I' en estas frases:
           - Opción A: "Hi there,\n\nThank you for contacting TikTok LIVE. We understand you're experiencing an issue with your ${issuePlaceholder}, and we're here to help."
           - Opción B: "Hello there,\n\nThank you for reaching out to TikTok LIVE. We're here to assist you. We understand that you need assistance with your ${issuePlaceholder}."
           - Opción C (Solo si el texto del usuario pide información): "Hi there,\n\nThank you for reaching out to TikTok LIVE. Could you please provide a detailed description of the issue you’re experiencing? This will help us verify and address the problem as quickly as possible."

        PASO 2: RESOLUCIÓN (CUERPO)
        Toma el "Texto Original" del usuario y aplícale los tonos y longitud solicitados. Esta es la parte central del mensaje.

        ${closingRules}
      `;
    } else if (macroType === MacroType.SECOND) {
      macroInstruction = `
        - TIPO: SEGUNDO MENSAJE (Continuity).
        - ESTRUCTURA: Saludo de continuidad + Cuerpo transformado + Cierre Obligatorio.
        - SALUDO: Antepón una de estas opciones al cuerpo (Adapta 'We' a 'I' si es modo personal):
           A: "Hi there,\n\nThanks for your reply."
           B: "Hello there,\n\nWe appreciate your swift response."
        
        ${closingRules}
      `;
    }

    prompt = `
      Actúa como experto en comunicación para soporte TikTok LIVE.
      
      REGLAS DE ORO:
      1. NO toques URLs, emails ni nombres de marcas.
      2. Mantén "TikTok LIVE" escrito exactamente así.
      3. Asegúrate de separar los párrafos claramente (Salto de línea entre Saludo, Cuerpo y Cierre).
      
      Instrucciones de Voz y Tono:
      ${perspectiveInstruction}
      ${genderNeutralInstruction}
      ${empathyInstruction}
      
      Instrucciones Específicas:
      ${macroInstruction}
      
      Instrucciones de Estilo:
      ${lengthInstruction}
      ${structureInstruction}
      ${otherToneInstruction}
      ${languageInstruction}

      Texto Original (Cuerpo/Resolución): "${text}"
      
      Respuesta Generada:
    `;
  }

  // --- Ejecución Streaming ---
  try {
    const result = await ai.models.generateContentStream({
      model: model, // Usamos el modelo seleccionado
      contents: prompt,
      config: {
        temperature: 0.4, 
        topK: 40,
        topP: 0.95,
      }
    });

    let fullText = '';
    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
    }
    return fullText;

  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(`Error Gemini: ${error.message}`);
  }
};
import { GoogleGenAI } from "@google/genai";
import { ToneOption, OutputLanguage, MacroType, LengthOption, ModelOption } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface TransformParams {
  text: string;
  tones: ToneOption[];
  targetLanguage: OutputLanguage;
  macroType: MacroType;
  lengthOption: LengthOption;
  model: ModelOption;
  issueTopic?: string;
  refinementInstruction?: string;
  previousOutput?: string;
  isClosingFinal?: boolean; // New parameter
  isIMMode?: boolean; // IM Mode override
}

export const streamTransformText = async (
  params: TransformParams,
  onChunk: (text: string) => void
): Promise<string> => {
  
  const { text, tones, targetLanguage, macroType, lengthOption, model, issueTopic, refinementInstruction, previousOutput, isClosingFinal, isIMMode } = params;

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
      Mantén las reglas de seguridad (No tocar ni eliminar URLs, emails, marcas).
      Mantén el idioma del texto anterior a menos que la solicitud diga lo contrario.
      Devuelve SOLO el texto corregido.
    `;
  } else if (isIMMode) {
    // MODO INSTANT MESSAGING (CHAT)
    const tonesList = tones.length > 0 ? tones.join(", ") : "Conversacional y natural";
    const languageInstruction = targetLanguage === OutputLanguage.AUTO 
      ? "Detecta y mantén el idioma de la entrada original." 
      : `Escribe o traduce toda la respuesta estrictamente a: ${targetLanguage}.`;

    prompt = `
      Actúa como agente de soporte de primera línea en un CHAT EN VIVO (Instant Messaging) para TikTok LIVE.
      
      CONTEXTO:
      El usuario es otro agente que te proporciona ideas sueltas o un borrador rápido de lo que necesita decirle al cliente. 
      Tu trabajo es escribir el texto final que se enviará al cliente.
      
      REGLAS DE ORO DEL MODO CHAT:
      1. FORMATO CHAT: Escribe como si chatearas en vivo con el cliente. Sé directo, conversacional y muy natural.
      2. MÚLTIPLES PÁRRAFOS: Es crucial que dividas el mensaje en párrafos cortos (1-2 oraciones por párrafo) separados por SALTOS DE LÍNEA. Así el agente puede copiar cada frase rápidamente.
      3. CERO ESTRUCTURA DE CORREO: NO incluyas saludos (Hola, Estimado) ni despedidas, firmas, cierres ("If you have any questions...") a menos que el borrador del agente lo pida explícitamente. Es una conversación en curso.
      4. TONO: ${tonesList}
      5. IDIOMA: ${languageInstruction}
      
      BORRADOR DEL AGENTE (Lo que quiere decir):
      "${text}"
      
      MENSAJE DE CHAT PARCELADO:
    `;
  } else {
    // MODO TRANSFORMACIÓN ORIGINAL (TICKET)
    const hasEmpathy = tones.includes(ToneOption.EMPATHY);
    const hasSuperEmpathy = tones.includes(ToneOption.SUPER_EMPATHY);
    const isParaphrase = tones.includes(ToneOption.PARAPHRASE);
    const otherTones = tones.filter(t => t !== ToneOption.PARAPHRASE && t !== ToneOption.EMPATHY && t !== ToneOption.SUPER_EMPATHY);
    
    // --- Configuración de Perspectiva ---
    const perspectiveInstruction = "PERSPECTIVA OBLIGATORIA: El remitente (tú) SIEMPRE DEBE hablar en PLURAL CORPORATIVO ('Nosotros', 'Nuestro', 'Entendemos', 'We', 'Us', 'Our'). Hablas en nombre de un equipo (TikTok LIVE). El destinatario (el usuario) es SIEMPRE SINGULAR ('tú', 'tu cuenta', 'You', 'Your'). NUNCA uses la primera persona del singular para tí ('yo', 'mi', 'entiendo', 'I', 'me'). NUNCA te dirijas a múltiples usuarios ('ustedes', 'vosotros', y all).";

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
      ? "Mantén el idioma original del texto. Asegúrate de traducir todas las plantillas, saludos o despedidas al mismo idioma original detectado."
      : `TRADUCE TODO el texto (incluido saludos, resoluciones o mensajes de cierre finales) exactamente al idioma: ${targetLanguage}.`;

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
        Analiza el contenido de la resolución que has generado y selecciona AUTOMÁTICAMENTE uno de los siguientes cierres. Tienes que adaptarlo EXACTAMENTE al IDIOMA DE SALIDA SELECCIONADO o al idioma de la resolución. ¡NUNCA dejes la despedida en inglés si el resto del texto no está en inglés!
        
        Escenario A: Resolución Positiva (Problema arreglado/solucionado/ayuda completada). Elige uno al azar y TRADÚCELO AL IDIOMA FINAL:
           1. "We’re glad to hear the issue has been resolved! Your feedback is invaluable to us, so we’d appreciate it if you could take a moment to complete a brief survey."
           2. "We’re happy to hear the issue has been resolved! Your feedback means a lot to us, so we’d greatly appreciate it if you could share your thoughts in a brief survey to help us improve."
           3. "We’re glad we could assist you today. Your feedback is important to us, so we’d appreciate it if you could share your thoughts in a brief survey."

        Escenario B: Resolución Negativa (No es lo que el usuario quería, pero se dio claridad/explicación final) - TRADÚCELO AL IDIOMA FINAL:
           "We understand this may not be the resolution you were hoping for, but we hope our explanation has provided clarity. We’ll proceed to close this ticket for now. If you have any other questions or need further assistance with a different matter, please feel free to reach out. Thank you for your understanding."

        Escenario C: Cierre por falta de información / Usuario no responde (Timeout) - TRADÚCELO AL IDIOMA FINAL:
           "Despite multiple follow-ups, we haven’t received any additional information to proceed with a re-evaluation. As such, we’ll be closing this ticket for now. If you’re able to provide the necessary details in the future, feel free to reach out again and we’ll be happy to assist. Thank you for your understanding."
        
        NO añadas ninguna otra firma o despedida después de esto.
        `;
    } else {
        // Reglas de cierre estándar (Abierto)
        closingRules = `
        PASO FINAL: CIERRE (OBLIGATORIO)
        Debes finalizar el mensaje EXCLUSIVAMENTE con una de las siguientes opciones (DEBES TRADUCIRLAS AL IDIOMA DE SALIDA, ¡NUNCA en inglés si el idioma de salida es otro!).
        
        CRÍTICO / PROHIBIDO:
        - NO uses "Best regards", "Sincerely", "Cheers", etc.
        - NO escribas ninguna firma como "TikTok LIVE Support", "TikTok Team", ni tu nombre.
        - TU RESPUESTA DEBE TERMINAR INMEDIATAMENTE DESPUÉS DE LA FRASE DE CIERRE.

        Opciones permitidas (Elige una y TRADÚCELA AL MODO U IDIOMA CORRESPONDIENTE):
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
      
      const issueInstruction = issueTopic && issueTopic.trim() !== "" 
        ? `Debes mencionar que entiendes que el usuario necesita ayuda con este tema: "${issueTopic.trim()}". Intégralo de forma natural (ej. "Entendemos que necesitas ayuda para ${issueTopic.trim()}").`
        : `Menciona de forma general que estamos aquí para ayudar con su consulta o problema.`;

      macroInstruction = `
        - TIPO: PRIMER MENSAJE.
        - FORMATO OBLIGATORIO:
           1. SALUDO + ACKNOWLEDGE
           2. RESOLUCIÓN (Cuerpo transformado)
           3. DESPEDIDA (Según reglas abajo)

        PASO 1: SALUDO + ACKNOWLEDGE
        MANTÉN SIEMPRE LA PERSPECTIVA PLURAL ('We', 'Nosotros').
        Genera un saludo inicial agradeciendo por contactar a TikTok LIVE y un "Acknowledge" (reconocimiento del problema).
        ${issueInstruction}
        Asegúrate de adaptar la gramática correctamente al idioma de salida. Usa un fraseo natural de soporte técnico.
        
        EJEMPLOS DE ESTILO BASE (ADÁPTALOS AL IDIOMA Y AL TEMA EXACTO):
           - "Hi there,\n\nThank you for contacting TikTok LIVE. We understand you're reaching out regarding [TEMA NATURAL], and we're here to help."
           - "Hello there,\n\nThank you for reaching out to TikTok LIVE. We're here to assist you with your inquiry about [TEMA NATURAL]."
           - (Si el cuerpo de la resolución pide información): "Hi there,\n\nThank you for reaching out to TikTok LIVE. To better assist you with [TEMA NATURAL], could you please provide more details?"

        PASO 2: RESOLUCIÓN (CUERPO)
        Toma el "Texto Original" del usuario y aplícale los tonos y longitud solicitados. Esta es la parte central del mensaje.

        ${closingRules}
      `;
    } else if (macroType === MacroType.SECOND) {
      macroInstruction = `
        - TIPO: SEGUNDO MENSAJE (Continuity).
        - ESTRUCTURA: Saludo de continuidad + Cuerpo transformado + Cierre Obligatorio.
        - SALUDO: Antepón una de estas opciones al cuerpo y ADÁPTALA al idioma correcto:
           A: "Hi there,\n\nThanks for your reply."
           B: "Hello there,\n\nWe appreciate your swift response."
        
        ${closingRules}
      `;
    }

    prompt = `
      Actúa como experto en comunicación para soporte TikTok LIVE.
      
      REGLAS DE ORO:
      1. Preservación de Enlaces: Es CRÍTICO que mantengas EXACTAMENTE TODOS los URLs, enlaces y correos electrónicos que aparecen en el texto original. NO LOS BORRES ni los modifiques bajo ninguna circunstancia.
      2. No modifiques nombres de marcas; mantén "TikTok LIVE" escrito exactamente así.
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
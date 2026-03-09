import React, { useState, useEffect } from 'react';
import { Sparkles, MessageSquareText, Eraser, Moon, Sun, ArrowRight, PenLine, Flag, BookOpen, ShieldAlert, StickyNote, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToneOption, OutputLanguage, MacroType, LengthOption, PerspectiveOption, ModelOption } from './types';
import { streamTransformText } from './services/geminiService';
import { OptionButton } from './components/OptionButton';
import { OutputSection } from './components/OutputSection';
import { LanguageSelector } from './components/LanguageSelector';
import { MacroSelector } from './components/MacroSelector';
import { LengthSelector } from './components/LengthSelector';
import { PerspectiveSelector } from './components/PerspectiveSelector';
import { ModelSelector } from './components/ModelSelector';
import { Logo } from './components/Logo';
import { InfoModal } from './components/InfoModal';
import { InternalNotes } from './components/InternalNotes';

type AppTab = 'transform' | 'notes';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('transform');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  
  // Nuevo estado para la sugerencia de corrección (separado del texto final)
  const [correctionSuggestion, setCorrectionSuggestion] = useState<string | null>(null);
  
  // State initialization
  const [selectedTones, setSelectedTones] = useState<ToneOption[]>([ToneOption.EMPATHY]);
  const [selectedLanguage, setSelectedLanguage] = useState<OutputLanguage>(OutputLanguage.AUTO);
  const [selectedMacro, setSelectedMacro] = useState<MacroType>(MacroType.FULL);
  const [selectedLength, setSelectedLength] = useState<LengthOption>(LengthOption.ORIGINAL);
  const [selectedPerspective, setSelectedPerspective] = useState<PerspectiveOption>(PerspectiveOption.WE);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(ModelOption.LITE);
  const [issueTopic, setIssueTopic] = useState('');
  const [isClosingFinal, setIsClosingFinal] = useState(false);
  
  // Modal States
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isForcedDisclaimer, setIsForcedDisclaimer] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // DARK MODE BY DEFAULT
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check Local Storage for Disclaimer Acceptance and Dark Mode
  useEffect(() => {
    // Theme check
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Disclaimer check
    const hasAcceptedDisclaimer = localStorage.getItem('empathia_disclaimer_accepted');
    if (!hasAcceptedDisclaimer) {
        setIsForcedDisclaimer(true);
        setIsDisclaimerOpen(true);
    }
  }, [isDarkMode]);

  const handleCloseDisclaimer = () => {
    if (isForcedDisclaimer) {
        localStorage.setItem('empathia_disclaimer_accepted', 'true');
        setIsForcedDisclaimer(false);
    }
    setIsDisclaimerOpen(false);
  };

  const toggleTone = (tone: ToneOption) => {
    setSelectedTones(prev => {
      if (prev.includes(tone)) {
        return prev.filter(t => t !== tone);
      }
      return [...prev, tone];
    });
  };

  // Función general para transformación
  const executeTransformation = async (refinement?: string) => {
    if (!inputText.trim() && !outputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setCorrectionSuggestion(null); // Limpiar sugerencias anteriores
    
    if (!refinement) {
        setOutputText(''); 
    } else {
        setOutputText(''); 
    }

    try {
      await streamTransformText({
        text: inputText,
        tones: selectedTones,
        targetLanguage: selectedLanguage,
        macroType: selectedMacro,
        lengthOption: selectedLength,
        perspective: selectedPerspective,
        model: selectedModel,
        issueTopic: issueTopic, 
        refinementInstruction: refinement,
        previousOutput: refinement ? outputText : undefined,
        isClosingFinal: isClosingFinal
      }, (chunk) => {
        setOutputText(chunk);
      });
      
    } catch (err: any) {
      console.error(err);
      setError("Error de conexión con IA. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función específica para revisar ortografía SIN reemplazar
  const handleCheckGrammar = async () => {
    if (!outputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setCorrectionSuggestion(''); // Iniciamos vacío

    try {
      // Usamos el servicio pero guardamos en 'correctionSuggestion'
      await streamTransformText({
        text: outputText, // El input es el texto que ya está en la salida
        tones: [], // Sin tonos
        targetLanguage: OutputLanguage.AUTO, // Mismo idioma
        macroType: MacroType.FULL, // Irrelevante, se sobreescribe con refinement
        lengthOption: LengthOption.ORIGINAL,
        perspective: selectedPerspective,
        model: ModelOption.LITE, // Usamos lite para ahorro de costes
        refinementInstruction: "Corrige estrictamente la ORTOGRAFÍA y GRAMÁTICA. No cambies el estilo, ni el tono, ni reescribas frases si son correctas. Solo devuelve el texto corregido exacto.",
        previousOutput: outputText
      }, (chunk) => {
        setCorrectionSuggestion(chunk);
      });
      
    } catch (err: any) {
      console.error(err);
      setError("No se pudo revisar la ortografía.");
      setCorrectionSuggestion(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCorrection = () => {
    if (correctionSuggestion) {
      setOutputText(correctionSuggestion);
      setCorrectionSuggestion(null);
    }
  };

  const handleDiscardCorrection = () => {
    setCorrectionSuggestion(null);
  };

  const handleTransform = () => executeTransformation();
  
  const handleRefine = (instruction: string) => {
     executeTransformation(instruction);
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setIssueTopic('');
    setCorrectionSuggestion(null);
    setError(null);
  };

  return (
    <div className="min-h-screen selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-100">
      
      {/* Modals */}
      <InfoModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} type="GUIDE" />
      <InfoModal 
        isOpen={isDisclaimerOpen} 
        onClose={handleCloseDisclaimer} 
        type="DISCLAIMER" 
        forced={isForcedDisclaimer}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-gray-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer">
               <div className="absolute inset-0 bg-indigo-500/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               <div className="relative w-10 h-10 group-hover:scale-105 transition-transform duration-300 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/20 bg-white dark:bg-slate-900 flex items-center justify-center p-1.5 border border-indigo-50 dark:border-indigo-900/50">
                  <Logo className="w-full h-full text-indigo-600 dark:text-indigo-400" />
               </div>
            </div>
            <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-600 dark:from-indigo-400 dark:to-violet-400 tracking-tight font-display">
              EmpathIA
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all cursor-pointer font-bold text-xs uppercase tracking-widest shadow-sm hover:shadow-md"
              title="Abrir Guía de Uso"
            >
              <BookOpen className="w-4 h-4" />
              <span>Guía</span>
            </button>
             <button
              onClick={() => setIsGuideOpen(true)}
              className="sm:hidden p-2 rounded-full text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer"
              title="Guía de Uso"
            >
              <BookOpen className="w-5 h-5" />
            </button>

             <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="p-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all cursor-pointer"
              title="Disclaimer / Aviso Legal"
            >
              <ShieldAlert className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-full text-gray-500 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 transition-all hover:scale-105 active:scale-95 bg-transparent dark:bg-slate-800/50"
              title={isDarkMode ? "Modo Claro" : "Modo Oscuro"}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-gray-200/50 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-gray-300/50 dark:border-slate-800 backdrop-blur-sm flex relative">
            <button 
              onClick={() => setActiveTab('transform')}
              className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'transform' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-slate-400 hover:text-indigo-600'}`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Transformación</span>
              {activeTab === 'transform' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-premium dark:shadow-premium-dark -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all duration-300 ${activeTab === 'notes' ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-500 dark:text-slate-400 hover:text-indigo-600'}`}
            >
              <StickyNote className="w-4 h-4" />
              <span>Internal Notes</span>
              {activeTab === 'notes' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-premium dark:shadow-premium-dark -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
                />
              )}
            </button>
          </div>
        </div>

        <AnimatePresence mode="popLayout">
          {activeTab === 'transform' ? (
            <motion.div 
              key="transform"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="flex flex-col gap-8"
            >
              {/* Controls Card */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-lg rounded-[2rem] p-8 shadow-premium dark:shadow-premium-dark border border-white/50 dark:border-slate-700/50 transition-colors duration-300">
                <div className="flex flex-col lg:flex-row gap-10 lg:items-start justify-between">
                  
                  <div className="flex flex-col gap-6 flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Estructura</span>
                        <MacroSelector 
                          selectedMacro={selectedMacro} 
                          onChange={setSelectedMacro} 
                          disabled={isLoading} 
                        />
                      </div>
                      <div className="flex flex-col gap-3">
                        <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1">Longitud</span>
                        <LengthSelector
                          selectedLength={selectedLength}
                          onChange={setSelectedLength}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedMacro === MacroType.FIRST && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.05 }}
                          className="bg-indigo-50/50 dark:bg-indigo-900/20 p-5 rounded-2xl border border-indigo-100/50 dark:border-indigo-800/30 flex flex-col sm:flex-row sm:items-center gap-4"
                        >
                          <label className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
                            <PenLine className="w-4 h-4" />
                            Tema del Problema
                          </label>
                          <input
                            type="text"
                            value={issueTopic}
                            onChange={(e) => setIssueTopic(e.target.value)}
                            placeholder="Ej: suscripción, pago rechazado..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 bg-white dark:bg-slate-900 dark:text-slate-200 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-colors placeholder:text-gray-400 dark:placeholder:text-slate-500"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex flex-col gap-3 w-full lg:w-auto">
                      <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 lg:text-right">Configuración IA</span>
                      <div className="flex flex-col sm:flex-row gap-3 lg:ml-auto">
                        <ModelSelector 
                            selectedModel={selectedModel}
                            onChange={setSelectedModel}
                            disabled={isLoading}
                        />
                        <LanguageSelector 
                            selectedLanguage={selectedLanguage}
                            onChange={setSelectedLanguage}
                            disabled={isLoading}
                        />
                      </div>
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent my-8"></div>

                <div className="flex flex-col xl:flex-row items-end justify-between gap-8">
                  <div className="flex flex-col gap-3 w-full xl:w-auto">
                    <span className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] ml-1 text-center xl:text-left">Tonos Emocionales</span>
                    <div className="flex flex-wrap justify-center xl:justify-start gap-2.5">
                      {Object.values(ToneOption).map((tone) => (
                        <OptionButton
                          key={tone}
                          option={tone}
                          isSelected={selectedTones.includes(tone)}
                          onClick={() => toggleTone(tone)}
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 w-full xl:w-auto justify-end mt-4 xl:mt-0">
                    <div className="flex items-center gap-4 bg-gray-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-gray-200/50 dark:border-slate-700/50">
                        <PerspectiveSelector
                            selectedPerspective={selectedPerspective}
                            onChange={setSelectedPerspective}
                            disabled={isLoading}
                        />
                        <button
                            onClick={() => setIsClosingFinal(!isClosingFinal)}
                            disabled={isLoading}
                            title="Activar para incluir mensaje de cierre con encuesta o despedida definitiva"
                            className={`
                                relative flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border
                                ${isClosingFinal 
                                    ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30' 
                                    : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:border-red-200 dark:hover:border-red-900/50'
                                }
                                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                            `}
                        >
                            <Flag className={`w-3.5 h-3.5 ${isClosingFinal ? 'fill-current' : ''}`} />
                            <span>Cierre Final</span>
                        </button>
                    </div>

                    <button
                      onClick={handleTransform}
                      disabled={isLoading || !inputText.trim()}
                      className={`
                        group relative w-full sm:w-auto px-10 py-4 rounded-2xl flex items-center justify-center gap-3
                        font-black text-sm uppercase tracking-widest text-white transition-all duration-500 shadow-xl
                        overflow-hidden
                        ${isLoading || !inputText.trim() 
                          ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed opacity-70 shadow-none' 
                          : 'bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 hover:scale-[1.02] active:scale-[0.98] shadow-indigo-500/30 hover:shadow-indigo-500/50'}
                      `}
                    >
                      {!isLoading && inputText.trim() && (
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
                      )}
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Sparkles className="w-5 h-5" />
                      )}
                      <span className="relative">{isLoading ? 'Procesando...' : 'Transformar'}</span>
                      {!isLoading && <ArrowRight className="w-4 h-4 opacity-80 relative group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Interface Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[550px] lg:h-[700px]">
                <div className="flex flex-col h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[2rem] shadow-premium dark:shadow-premium-dark border border-white/30 dark:border-slate-700/30 overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all duration-500 hover:bg-white/80 dark:hover:bg-slate-800/80">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100/50 dark:border-slate-700/50">
                    <label htmlFor="input-text" className="text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <MessageSquareText className="w-4 h-4" />
                      Entrada
                    </label>
                    <button 
                      onClick={handleClear}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                      disabled={!inputText}
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      Borrar
                    </button>
                  </div>
                  <textarea
                    id="input-text"
                    className="flex-1 w-full p-8 resize-none focus:outline-none text-base sm:text-lg font-medium text-slate-700 dark:text-slate-100 placeholder:text-slate-400/50 dark:placeholder:text-slate-500 bg-transparent leading-relaxed"
                    placeholder="Escribe o pega el cuerpo de tu respuesta aquí..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isLoading}
                  />
                   <div className="px-6 py-3 border-t border-gray-100/50 dark:border-slate-700/50 flex justify-end">
                      <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 bg-gray-100/50 dark:bg-slate-900/50 px-3 py-1 rounded-lg border border-gray-200/50 dark:border-slate-800/50">
                        {inputText.length} caracteres
                      </span>
                   </div>
                </div>

                <div className="h-full">
                  <OutputSection 
                    originalText={inputText}
                    transformedText={outputText}
                    correctionSuggestion={correctionSuggestion}
                    isLoading={isLoading}
                    onRetry={handleTransform}
                    onRefine={handleRefine}
                    onUpdateText={setOutputText}
                    onCheckGrammar={handleCheckGrammar}
                    onApplyCorrection={handleApplyCorrection}
                    onDiscardCorrection={handleDiscardCorrection}
                  />
                </div>
              </div>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500 text-white px-6 py-4 rounded-2xl text-center font-bold text-sm shadow-xl shadow-red-500/20"
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
              <InternalNotes />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default App;
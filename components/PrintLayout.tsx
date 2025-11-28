import React, { useState } from 'react';
import { ParsedBook, AIAnalysis } from '../types';
import { ArrowLeft, Printer, Sparkles, Loader2, FileDown, X } from 'lucide-react';
import { analyzeBookContent } from '../services/geminiService';

interface PrintLayoutProps {
  book: ParsedBook;
  onBack: () => void;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ book, onBack }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Directly trigger print window without timeout to avoid browser blocking
  const triggerPrint = () => {
    window.print();
    setShowPrintModal(false);
  };

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    // Use the preface or first chapter for analysis
    const sample = book.chapters.length > 0 ? book.chapters[0].content : book.fullText;
    try {
      const result = await analyzeBookContent(book.title, book.author, sample);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
      alert("Impossible de générer l'analyse pour le moment.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white relative">
      {/* Print Instruction Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 no-print backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-6 h-6 text-indigo-600" />
                Imprimer / PDF
              </h3>
              <button onClick={() => setShowPrintModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-indigo-800 font-medium mb-2">Pour obtenir un fichier propre :</p>
              <ol className="list-decimal list-inside text-sm text-indigo-700 space-y-1">
                <li>Choisissez <strong>Enregistrer au format PDF</strong>.</li>
                <li>Taille : <strong>A5</strong>.</li>
                <li>Marges : <strong>Aucune</strong> (ou Minimum). <span className="text-xs opacity-75 block ml-5">Le site gère déjà les marges du livre.</span></li>
              </ol>
            </div>

            <p className="text-slate-600 text-sm mb-6">
              {book.chapters.length} chapitres détectés.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowPrintModal(false)}
                className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={triggerPrint}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium shadow-sm hover:shadow flex items-center justify-center gap-2 transition-all"
              >
                <FileDown className="w-4 h-4" />
                Générer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar - Hidden when printing */}
      <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-4 flex items-center justify-between no-print">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAIAnalysis}
            disabled={analyzing || !!analysis}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              analysis 
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            {analyzing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {analysis ? 'Analyse Terminée' : 'Enrichir avec IA'}
          </button>
          
          <button 
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer / PDF
          </button>
        </div>
      </div>

      {/* 
          Main Content Area 
      */}
      <div className="flex flex-col items-center py-8 gap-8 print:block print:py-0 print:gap-0">
        
        {/* 
          PAGE 1: TITLE 
          z-50 and bg-white ensure it covers the fixed footer (page numbers) in print mode
        */}
        <div className="print-sheet w-[14.8cm] min-h-[21cm] bg-white shadow-xl print:shadow-none flex flex-col justify-center items-center text-center relative p-[2.5cm] z-50 print:z-50">
          <div className="flex-1 flex flex-col justify-center w-full z-10">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {book.title}
            </h1>
            <div className="w-16 h-px bg-slate-800 mx-auto mb-6"></div>
            <h2 className="font-sans text-lg uppercase tracking-[0.2em] text-slate-600">
              {book.author}
            </h2>
          </div>
          <div className="mt-auto font-serif text-xs text-slate-500">
            <p>GutenPrint AI Edition</p>
          </div>
        </div>

        {/* 
          PAGE 2: COPYRIGHT
          Also covers the footer if needed, or we can let numbering start here.
          Let's cover it to be clean.
        */}
        <div className="print-sheet w-[14.8cm] min-h-[21cm] bg-white shadow-xl print:shadow-none flex flex-col justify-end text-xs font-serif relative p-[2.5cm] z-40 print:z-40">
           <div className="mb-8">
            <h3 className="font-bold uppercase tracking-wider mb-3">Informations</h3>
            <p className="mb-4 text-slate-600 leading-relaxed text-justify">
              Texte source : Project Gutenberg.<br/>
              Mise en page automatisée pour format A5.
            </p>
            
            {analysis && (
              <div className="mt-6 pt-4 border-t border-slate-200">
                <h4 className="font-bold mb-2">Analyse IA</h4>
                <p className="italic mb-4 text-justify leading-relaxed">{analysis.summary}</p>
                <div className="flex gap-4 text-[10px]">
                  <span className="bg-slate-100 px-2 py-1 rounded">Niveau: {analysis.readingLevel}</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">Ambiance: {analysis.mood}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 
          CONTENT CHAPTERS 
        */}
        {book.chapters.map((chapter, index) => (
          <div key={index} className="print-sheet w-[14.8cm] min-h-[21cm] bg-white shadow-xl print:shadow-none font-serif text-justify leading-relaxed text-slate-900 hyphens-auto p-[2.5cm] pt-[2.5cm] pb-[3cm]">
            
            {/* Chapter Header */}
            <div className="mb-8 mt-2 text-center">
               {/* Use the title detected by regex */}
              <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-wide">
                {chapter.title}
              </h3>
              <div className="w-8 h-0.5 bg-slate-300 mx-auto"></div>
            </div>

            {/* Chapter Text */}
            <div 
              className="chapter-content text-[10pt] leading-[1.6]" 
              style={{ textIndent: '1.5em' }}
            >
              {chapter.content.split(/\n\s*\n/).map((para, i) => {
                 const cleanPara = para.replace(/\n/g, ' ').trim();
                 if (!cleanPara) return null;
                 return <p key={i} className="mb-3">{cleanPara}</p>;
              })}
            </div>
          </div>
        ))}
        
        {/* Back Cover */}
        <div className="print-sheet w-[14.8cm] min-h-[21cm] bg-slate-900 text-white print:bg-white print:text-black shadow-xl print:shadow-none flex flex-col justify-center items-center text-center p-[2.5cm]">
           <div className="w-full">
              <h2 className="text-xl font-serif font-bold mb-6">{book.title}</h2>
              {analysis ? (
                 <p className="italic leading-relaxed opacity-90 text-sm mb-8 text-justify">{analysis.summary}</p>
              ) : (
                <p className="opacity-70 text-sm mb-8">Fin</p>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default PrintLayout;
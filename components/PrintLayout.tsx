import React, { useState } from 'react';
import { ParsedBook } from '../types';
import { ArrowLeft, Printer, FileDown, X } from 'lucide-react';

interface PrintLayoutProps {
  book: ParsedBook;
  onBack: () => void;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ book, onBack }) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  const handleGenerateBook = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/generate-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book }),
      });
      const html = await response.text();
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
      }
      setShowPrintModal(false);
    } catch (error) {
      console.error('Error generating book:', error);
      alert('Failed to generate the book. Please try again.');
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
                onClick={handleGenerateBook}
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
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="flex items-center bg-slate-900 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer / PDF
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <h2 className="text-lg text-gray-600">{book.author}</h2>
        <p className="mt-4">
          Click the "Imprimer / PDF" button to generate the book.
        </p>
      </div>
    </div>
  );
};

export default PrintLayout;
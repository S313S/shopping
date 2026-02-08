import React from 'react';
import { AnalysisResult } from '../types';
import { Sparkles, Palette, Camera, Lightbulb, Type } from 'lucide-react';

interface AnalysisResultViewProps {
  result: AnalysisResult | null;
  isLoading: boolean;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({ result, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-red-100 shadow-sm animate-pulse">
        <Sparkles className="w-10 h-10 text-amber-500 mb-4 animate-spin-slow" />
        <h3 className="text-lg font-medium text-red-900 font-serif">Deconstructing Success...</h3>
        <p className="text-slate-500 text-sm mt-2">Analyzing composition, lighting, and "Ma" power.</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-[250px] flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-red-200 text-slate-400">
        <Lightbulb className="w-10 h-10 mb-3 text-red-200" />
        <p>Upload a file and click "Analyze" to see the breakdown.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      <div className="p-4 border-b border-red-50 bg-red-50/50 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="font-bold text-red-900 font-serif">Competitor Breakdown</h3>
      </div>
      
      <div className="p-6 space-y-6 overflow-y-auto max-h-[600px] custom-scrollbar">
        
        {/* Main Selling Point - Highlighted like a 'Red Envelope' insight */}
        <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-lg border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full opacity-50 -mr-4 -mt-4"></div>
          <h4 className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2 relative z-10">
            <Lightbulb className="w-4 h-4 text-amber-500 fill-current" /> 
            Core Selling Point
          </h4>
          <p className="text-red-900/80 text-sm relative z-10 leading-relaxed">{result.sellingPoints}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-amber-600/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Palette className="w-3 h-3" /> Visual Style
            </h4>
            <p className="text-sm text-slate-700 bg-amber-50/50 border border-amber-100 p-3 rounded-md">{result.visualStyle}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-600/80 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Camera className="w-3 h-3" /> Composition
            </h4>
            <p className="text-sm text-slate-700 bg-amber-50/50 border border-amber-100 p-3 rounded-md">{result.composition}</p>
          </div>
        </div>

        <div>
           <h4 className="text-xs font-bold text-amber-600/80 uppercase tracking-wider mb-2">Lighting & Mood</h4>
           <p className="text-sm text-slate-700 border-l-2 border-amber-200 pl-3">{result.lightingAndMood}</p>
        </div>

        <div className="border-t border-red-50 pt-4">
          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Type className="w-3 h-3" /> Suggested Ad Copy
          </h4>
          <blockquote className="italic text-slate-600 border-l-4 border-red-400 pl-4 py-2 bg-slate-50 rounded-r-lg">
            "{result.adCopy}"
          </blockquote>
        </div>

        <div className="hidden">
            {/* Hidden Prompt for internal use/debugging */}
            {result.suggestedPrompt}
        </div>
      </div>
    </div>
  );
};
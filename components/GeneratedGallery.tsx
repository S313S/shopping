import React from 'react';
import { GeneratedAsset } from '../types';
import { Download, Copy, Clock, Image as ImageIcon } from 'lucide-react';

interface GeneratedGalleryProps {
  assets: GeneratedAsset[];
}

export const GeneratedGallery: React.FC<GeneratedGalleryProps> = ({ assets }) => {
  const handleDownload = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `mimic-ai-horse-year-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (assets.length === 0) {
    return (
      <div className="py-12 text-center bg-white rounded-xl border border-dashed border-red-200">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <ImageIcon className="w-8 h-8 text-red-200" />
        </div>
        <h3 className="text-slate-600 font-medium font-serif">No assets generated yet</h3>
        <p className="text-slate-400 text-sm mt-1">Analyze a competitor asset first, then generate yours.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset) => (
        <div key={asset.id} className="group relative bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden transition-all hover:shadow-lg hover:border-red-200 hover:-translate-y-1">
          <div className="aspect-square w-full bg-slate-100 relative overflow-hidden">
             <img 
               src={asset.imageUrl} 
               alt="Generated Asset" 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-red-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                <button 
                  onClick={() => handleDownload(asset.imageUrl, asset.id)}
                  className="p-3 bg-white rounded-full text-red-800 hover:text-red-600 hover:scale-110 transition-all shadow-lg"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
             </div>
          </div>
          <div className="p-3 border-t border-red-50">
             <div className="flex justify-between items-start gap-2">
               <div className="w-full">
                 <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider mb-1 block">Strategy Used</span>
                 <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed" title={asset.promptUsed}>
                   {asset.promptUsed}
                 </p>
               </div>
             </div>
             <p className="text-[10px] text-red-300 mt-3 text-right flex items-center justify-end gap-1">
                <Clock className="w-3 h-3" />
                {new Date(asset.createdAt).toLocaleTimeString()}
             </p>
          </div>
        </div>
      ))}
    </div>
  );
};
import React, { useCallback, useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video, X } from 'lucide-react';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
  disabled?: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelect, selectedFile, onClear, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const isVideo = selectedFile?.type.startsWith('video/');

  return (
    <div className="h-full">
      {!selectedFile ? (
        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
            ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-red-200 hover:border-red-400 hover:bg-red-50/50'}
            ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent hover:border-slate-300' : 'bg-white'}
          `}
        >
          <div className={`p-4 rounded-full mb-3 transition-colors ${isDragging ? 'bg-amber-100 text-amber-600' : 'bg-red-50 text-red-500'}`}>
            <UploadCloud className="w-8 h-8" />
          </div>
          <span className="text-slate-700 font-medium font-serif">Click or Drag & Drop Asset</span>
          <span className="text-slate-400 text-sm mt-1">Competitor Images or Videos</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileInput} 
            accept="image/*,video/*"
            disabled={disabled}
          />
        </label>
      ) : (
        <div className="relative h-64 bg-slate-50 rounded-xl overflow-hidden border border-red-200 flex items-center justify-center group shadow-sm">
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-slate-600 hover:text-red-600 hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 border border-red-100"
          >
            <X className="w-5 h-5" />
          </button>
          
          {isVideo ? (
            <div className="flex flex-col items-center text-red-400">
               <Video className="w-12 h-12 mb-2" />
               <span className="text-sm font-medium px-4 text-center truncate max-w-xs text-slate-600">{selectedFile.name}</span>
            </div>
          ) : (
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Preview" 
              className="h-full w-full object-contain"
            />
          )}
          
          <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 text-white text-xs py-1.5 px-3 truncate text-center">
            {selectedFile.name}
          </div>
        </div>
      )}
    </div>
  );
};
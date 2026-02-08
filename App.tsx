import React, { useState } from 'react';
import { FileUploader } from './components/FileUploader';
import { ProductForm } from './components/ProductForm';
import { AnalysisResultView } from './components/AnalysisResultView';
import { GeneratedGallery } from './components/GeneratedGallery';
import { analyzeCompetitorAsset, generateMarketingImage } from './services/geminiService';
import { ProductDetails, AnalysisResult, GeneratedAsset } from './types';
import { Wand2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productDetails, setProductDetails] = useState<ProductDetails>({
    name: '',
    description: '',
    targetAudience: ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Handlers
  const handleAnalyze = async () => {
    if (!selectedFile) return setError("Please upload a competitor file.");
    if (!productDetails.name || !productDetails.description) return setError("Please fill in your product details.");
    
    setError(null);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeCompetitorAsset(selectedFile, productDetails);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "Failed to analyze asset. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!analysisResult) return;
    
    setError(null);
    setIsGenerating(true);

    try {
      const imageUrl = await generateMarketingImage(analysisResult.suggestedPrompt);
      
      const newAsset: GeneratedAsset = {
        id: Date.now().toString(),
        imageUrl,
        promptUsed: analysisResult.suggestedPrompt,
        createdAt: Date.now()
      };

      setGeneratedAssets(prev => [newAsset, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f0] text-slate-900 pb-20">
      {/* Header - Horse Year Red & Gold */}
      <header className="bg-red-800 border-b border-red-900 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-lg shadow-inner">
                <Zap className="w-6 h-6 text-red-900 fill-current" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-50 tracking-wide flex items-center gap-2">
                  E-Comm Mimic AI <span className="text-2xl">🐎</span>
                </h1>
                <p className="text-xs text-amber-200/80 font-medium tracking-wider uppercase">Ma Nian Edition • Cross-border Ops</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
               <div className="px-3 py-1 rounded-full bg-red-900/50 border border-red-700 text-xs text-amber-100/70">
                 Run fast, Sell fast
               </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 shadow-sm">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-sm font-semibold hover:underline">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Inputs - Sticky for better UX */}
          <div className="lg:col-span-4 space-y-8 self-start">
            
            {/* Step 1: File Upload */}
            <section>
              <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs border border-red-200">1</span>
                Competitor Asset
              </h2>
              <FileUploader 
                selectedFile={selectedFile}
                onFileSelect={setSelectedFile}
                onClear={() => { setSelectedFile(null); setAnalysisResult(null); }}
                disabled={isAnalyzing || isGenerating}
              />
            </section>

            {/* Step 2: Product Context */}
            <section>
              <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs border border-red-200">2</span>
                Your Product Context
              </h2>
              <ProductForm 
                details={productDetails}
                onChange={setProductDetails}
                disabled={isAnalyzing || isGenerating}
              />
            </section>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedFile || !productDetails.name || !productDetails.description}
              className={`w-full py-4 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all shadow-md
                ${isAnalyzing || !selectedFile 
                  ? 'bg-stone-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 hover:shadow-red-200 hover:shadow-lg active:scale-[0.98] border border-red-800'}
              `}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Analyzing Strategy...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-amber-200" />
                  Deconstruct & Analyze
                </>
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: Results & Generation */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Step 3: Analysis View */}
            <section className={`${analysisResult ? 'h-[500px]' : 'h-auto'} transition-all duration-500`}>
               <h2 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs border border-red-200">3</span>
                Strategy Breakdown
               </h2>
               <AnalysisResultView result={analysisResult} isLoading={isAnalyzing} />
            </section>
            
            {/* CTA: Generation Action */}
            {analysisResult && (
              <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-red-800 via-red-700 to-red-800 p-6 rounded-xl shadow-lg border border-red-900 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-4">
                {/* Decorative Pattern Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-amber-50">Create Winning Asset</h3>
                  <p className="text-red-200 text-sm max-w-md mt-1">
                    Generate a high-converting visual for <span className="font-semibold text-amber-200">{productDetails.name}</span> using the extracted "Winning Formula".
                  </p>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="relative z-10 mt-4 sm:mt-0 px-8 py-3 bg-gradient-to-b from-amber-300 to-amber-500 text-red-900 rounded-lg font-bold hover:from-amber-200 hover:to-amber-400 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 border border-amber-300"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-current" /> Generate Now
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 4: Gallery */}
            <section>
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs border border-red-200">4</span>
                  Generated Assets
                 </h2>
                 {generatedAssets.length > 0 && <span className="text-sm font-medium px-3 py-1 bg-amber-100 text-amber-800 rounded-full border border-amber-200">{generatedAssets.length} Results</span>}
              </div>
              <GeneratedGallery assets={generatedAssets} />
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;

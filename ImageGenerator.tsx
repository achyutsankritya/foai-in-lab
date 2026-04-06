import React, { useState, useEffect, useCallback } from 'react';
import { HfInference } from '@huggingface/inference';
import { 
  Sparkles, 
  Download, 
  RefreshCw, 
  Settings as SettingsIcon, 
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  ChevronRight,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import SettingsModal from './SettingsModal';

const DEFAULT_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem("hf_token") || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("hf_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("hf_token", token);
  }, [token]);

  useEffect(() => {
    localStorage.setItem("hf_history", JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const generateImage = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    if (!token) {
      setIsSettingsOpen(true);
      setError("Please add your Hugging Face API token first.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const hf = new HfInference(token);
      const blob = await hf.textToImage({
        model: DEFAULT_MODEL,
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, low quality, distorted, ugly, bad anatomy",
        }
      }) as any;

      const imageUrl = URL.createObjectURL(blob);
      setGeneratedImage(imageUrl);
      
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        prompt,
        imageUrl,
        timestamp: Date.now(),
      };
      setHistory(prev => [newHistoryItem, ...prev]);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError(err.message || "Failed to generate image. Please check your token and try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, token]);

  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `lumina-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0a0a] text-white selection:bg-white/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Lumina</h1>
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">AI Image Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:bg-white/10 active:scale-95"
            >
              <SettingsIcon className="h-5 w-5 text-white/60" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Generator */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">What can you imagine?</h2>
              <p className="text-white/40">Enter a detailed prompt to generate high-quality artwork.</p>
            </div>

            <form onSubmit={generateImage} className="relative space-y-4">
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1 transition-all focus-within:border-white/20 focus-within:bg-white/[0.07]">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic city with neon lights and flying cars, cinematic lighting, 8k resolution..."
                  className="h-32 w-full resize-none border-none bg-transparent p-4 text-lg text-white placeholder:text-white/20 focus:outline-none focus:ring-0"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      generateImage();
                    }
                  }}
                />
                <div className="flex items-center justify-between px-4 pb-3">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/20">
                    <span className="rounded-md border border-white/10 px-1.5 py-0.5">Enter</span>
                    <span>to generate</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className={cn(
                      "flex items-center gap-2 rounded-xl px-6 py-2.5 font-semibold transition-all active:scale-95",
                      isGenerating || !prompt.trim()
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : "bg-white text-black hover:bg-white/90"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Result Area */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 sm:aspect-video">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="relative h-20 w-20">
                      <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
                      <div className="relative flex h-full w-full items-center justify-center rounded-full bg-indigo-500/10">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium text-white">Painting your vision...</p>
                      <p className="text-sm text-white/40">This usually takes 5-10 seconds</p>
                    </div>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group relative h-full w-full"
                  >
                    <img
                      src={generatedImage}
                      alt={prompt}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between opacity-0 transition-all duration-300 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                      <p className="max-w-[70%] truncate text-sm font-medium text-white/90">
                        {prompt}
                      </p>
                      <button
                        onClick={downloadImage}
                        className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black shadow-xl transition-transform hover:scale-105 active:scale-95"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/20"
                  >
                    <div className="rounded-full border-2 border-dashed border-white/10 p-8">
                      <ImageIcon className="h-12 w-12" />
                    </div>
                    <p className="text-sm font-medium uppercase tracking-widest">Awaiting your prompt</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: History & Info */}
          <div className="space-y-8">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-white/40" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">Recent</h3>
                </div>
                <span className="text-[10px] font-medium text-white/20">{history.length} items</span>
              </div>

              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setGeneratedImage(item.imageUrl);
                        setPrompt(item.prompt);
                      }}
                      className="group flex w-full items-center gap-4 rounded-2xl border border-transparent p-2 transition-all hover:border-white/10 hover:bg-white/5"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        <img
                          src={item.imageUrl}
                          alt={item.prompt}
                          className="h-full w-full object-cover transition-transform group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex flex-1 flex-col items-start overflow-hidden">
                        <p className="w-full truncate text-left text-sm font-medium text-white/80 group-hover:text-white">
                          {item.prompt}
                        </p>
                        <p className="text-[10px] text-white/30">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-white/20">
                    <RefreshCw className="mb-3 h-8 w-8 opacity-20" />
                    <p className="text-xs font-medium uppercase tracking-widest">No history yet</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-indigo-500/5 p-6">
              <h3 className="mb-3 text-sm font-bold text-indigo-400">Pro Tip</h3>
              <p className="text-sm leading-relaxed text-white/60">
                Use descriptive keywords like <span className="text-white/80">"cinematic"</span>, 
                <span className="text-white/80"> "unreal engine 5"</span>, or 
                <span className="text-white/80"> "oil painting"</span> to get better results.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        token={token}
        onSave={setToken}
      />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  FileAudio, 
  Plus, 
  Trash2, 
  UploadCloud,
  BadgeCheck,
  Music
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

/**
 * Technical Broadcast Manager: Root-exclusive file management system.
 * Replaces the active player with a facility to select and insert MP3 files.
 */
export function SidebarAudioStation() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [insertedFiles, setInsertedFiles] = useState<{name: string, size: string}[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'audio/mpeg' || file.name.endsWith('.mp3'))) {
      setSelectedFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Format",
        description: "Please select a valid MP3 file from the local terminal."
      });
    }
  };

  const handleInsert = () => {
    if (selectedFile) {
      setInsertedFiles(prev => [
        { 
          name: selectedFile.name, 
          size: (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB' 
        },
        ...prev
      ]);
      setSelectedFile(null);
      toast({
        title: "File Inserted",
        description: "The MP3 has been added to the technical broadcast queue."
      });
    }
  };

  const removeFile = (index: number) => {
    setInsertedFiles(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "File Removed",
      description: "Asset purged from the active queue."
    });
  };

  return (
    <div className="px-3 py-4 space-y-6 animate-in fade-in duration-500">
      {/* File Selection Facility */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-orange-500/20 space-y-4 shadow-2xl">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-white uppercase tracking-[0.25em]">Broadcast Node</p>
          <p className="text-[9px] text-white/60 font-bold leading-relaxed uppercase italic">
            Institutional Audio Assets
          </p>
        </div>

        <div className="space-y-3">
          <div className="group/input">
            <div className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
              selectedFile 
                ? "border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]" 
                : "border-white/10 hover:border-orange-500 bg-black/40 hover:bg-black/60"
            )}>
              <UploadCloud className={cn(
                "w-8 h-8 mb-3 transition-all duration-500", 
                selectedFile ? "text-orange-500 scale-110" : "text-orange-500 opacity-40"
              )} />
              <p className={cn(
                "text-[10px] font-black text-center uppercase tracking-widest leading-tight transition-colors",
                selectedFile ? "text-white" : "text-white/40"
              )}>
                {selectedFile ? selectedFile.name : "Select MP3 File"}
              </p>
              <Input 
                type="file" 
                accept=".mp3,audio/mpeg" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
              />
            </div>
          </div>

          <Button 
            onClick={handleInsert}
            disabled={!selectedFile}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black h-11 rounded-xl shadow-xl shadow-orange-900/20 gap-2 transition-all active:scale-95 text-[10px] uppercase tracking-widest border-none"
          >
            <Plus className="w-4 h-4" /> Insert Asset
          </Button>
        </div>
      </div>

      {/* Inserted Files Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Queue</p>
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 drop-shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {insertedFiles.length > 0 ? insertedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group hover:border-orange-500/40 transition-all animate-in slide-in-from-left-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Music className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-white truncate tracking-tight">{file.name}</span>
                  <span className="text-[8px] text-white/40 font-mono uppercase font-black">{file.size}</span>
                </div>
              </div>
              <button 
                onClick={() => removeFile(idx)}
                className="text-white/20 hover:text-red-500 transition-colors ml-2 shrink-0"
                title="Purge"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )) : (
            <div className="text-center py-10 bg-black/40 rounded-[2rem] border-2 border-dashed border-white/10 shadow-inner ring-1 ring-white/5">
              <FileAudio className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-[11px] font-black text-white/80 uppercase tracking-[0.25em]">Queue Empty</p>
              <p className="text-[8px] text-white/40 font-bold uppercase mt-1.5 tracking-wider">No technical assets loaded</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-2 opacity-20">
        <p className="text-[8px] font-black text-white/50 uppercase tracking-[0.5em]">Node ID: STATION-ALPHA</p>
      </div>
    </div>
  );
}

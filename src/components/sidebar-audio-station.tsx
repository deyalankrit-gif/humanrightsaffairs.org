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
      <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 space-y-4 shadow-xl">
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">Broadast Controller</p>
          <p className="text-[9px] text-slate-500 font-medium leading-relaxed italic">
            Select local MP3 files to insert into the organizational broadcast stream.
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative group/input">
            <div className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
              selectedFile ? "border-orange-500/50 bg-orange-500/5" : "border-white/10 hover:border-white/20 bg-black/20"
            )}>
              <UploadCloud className={cn("w-6 h-6 mb-2 transition-transform duration-300", selectedFile ? "text-orange-500 scale-110" : "text-slate-500")} />
              <p className="text-[10px] font-bold text-center text-slate-400 line-clamp-1">
                {selectedFile ? selectedFile.name : "Select MP3 File"}
              </p>
              <Input 
                type="file" 
                accept=".mp3,audio/mpeg" 
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>

          <Button 
            onClick={handleInsert}
            disabled={!selectedFile}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 rounded-xl shadow-xl shadow-orange-900/20 gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" /> Insert File
          </Button>
        </div>
      </div>

      {/* Inserted Files Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Queue</p>
          <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {insertedFiles.length > 0 ? insertedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl group hover:border-orange-500/30 transition-all animate-in slide-in-from-left-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-1.5 bg-orange-500/10 rounded-lg">
                  <Music className="w-3 h-3 text-orange-500 shrink-0" />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-bold text-slate-300 truncate tracking-tight">{file.name}</span>
                  <span className="text-[8px] text-slate-600 font-mono uppercase font-bold">{file.size}</span>
                </div>
              </div>
              <button 
                onClick={() => removeFile(idx)}
                className="text-slate-700 hover:text-red-500 transition-colors ml-2 shrink-0"
                title="Purge"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )) : (
            <div className="text-center py-10 bg-black/10 rounded-[2rem] border border-dashed border-white/5 opacity-40">
              <FileAudio className="w-6 h-6 text-slate-700 mx-auto mb-2" />
              <p className="text-[9px] text-slate-700 font-bold uppercase tracking-widest">Registry Empty</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center pt-2 opacity-50">
        <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.4em]">Broadcast Node: Verified</p>
      </div>
    </div>
  );
}

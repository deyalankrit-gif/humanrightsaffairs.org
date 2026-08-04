
"use client"

import React, { useEffect } from 'react'
import Image from 'next/image'
import { MessageSquare, Send, X, Bot, ShieldAlert, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { inquireLegalAssistant } from '@/ai/flows/ai-legal-assistant-chatbot'
import { PlaceHolderImages } from '@/lib/placeholder-images'

type Message = {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export function AIChat() {
  const [isOpen, setIsOpen] = React.useState(false)
  const aiAvatar = PlaceHolderImages.find(i => i.id === 'ai-bot-avatar')
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
    setMessages([{
      id: '1',
      text: "Hello! I am JusticeBot, your AI legal assistant. How can I help you understand your rights today?",
      sender: 'ai',
      timestamp: new Date()
    }])
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      const response = await inquireLegalAssistant({ query: currentInput })
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error(error)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I encountered an error connecting to the secure registry. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] print:hidden">
      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)}
          className="h-16 w-16 rounded-full shadow-2xl bg-primary hover:bg-primary/90 flex items-center justify-center p-0 overflow-hidden group border-2 border-white/20"
        >
          <div className="absolute inset-0 bg-accent transform scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full opacity-20"></div>
          <div className="relative w-full h-full">
            <Image 
              src={aiAvatar?.imageUrl || "/advocate.jpeg"} 
              alt="AI Legal Advocate" 
              fill 
              className="object-cover"
              data-ai-hint={aiAvatar?.imageHint || "professional advocate"}
            />
          </div>
          <div className="absolute -top-1 -right-1 flex h-6 w-6 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-accent text-[11px] font-bold text-primary items-center justify-center border-2 border-primary shadow-sm">AI</span>
          </div>
        </Button>
      )}

      {isOpen && (
        <Card className="w-[350px] md:w-[400px] h-[550px] flex flex-col shadow-2xl border-2 border-primary/10 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="bg-primary text-white p-4 space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-accent/40 shadow-inner">
                  <Image 
                    src={aiAvatar?.imageUrl || "/advocate.jpeg"} 
                    alt="JusticeBot Avatar" 
                    fill 
                    className="object-cover"
                    data-ai-hint={aiAvatar?.imageHint || "professional profile"}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg font-headline">JusticeBot AI</CardTitle>
                  <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Legal Assistant</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 bg-slate-50">
            <ScrollArea className="h-[400px] p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 shadow-sm rounded-tl-none text-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="p-4 border-t bg-white">
            <div className="w-full space-y-3">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask about your rights..." 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="rounded-full bg-slate-50 border-slate-200"
                />
                <Button size="icon" className="rounded-full shrink-0" onClick={handleSend} disabled={isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-tighter justify-center">
                <ShieldAlert className="w-3 h-3" />
                <span>AI Guidance: Not a substitute for legal advice</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

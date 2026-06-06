
"use client"

import React from 'react'
import { Search, FileText, Sparkles, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { aiDocumentSearch } from '@/ai/flows/ai-document-search'

const SAMPLE_DOCS = [
  { title: "The Constitution of India", content: "Fundamental Rights (Part III) including Article 14 (Equality before law), Article 19 (Freedom of speech), Article 21 (Protection of life and personal liberty)." },
  { title: "Protection of Human Rights Act, 1993", content: "An Act to provide for the constitution of a National Human Rights Commission, State Human Rights Commissions and Human Rights Courts for better protection of human rights." }
]

export function DocSearch() {
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<any>(null)
  const [isSearching, setIsSearching] = React.useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    try {
      const output = await aiDocumentSearch({
        query,
        documents: SAMPLE_DOCS
      })
      setResults(output)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-secondary rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
        <div className="relative flex flex-col md:flex-row gap-2 bg-white p-2 rounded-2xl shadow-lg border border-slate-100">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              placeholder="E.g., 'What are my rights if I am detained?' or 'Article 21 summary'..." 
              className="pl-12 h-14 border-none text-lg focus-visible:ring-0 shadow-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={isSearching}
            className="h-14 px-8 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 flex gap-2"
          >
            {isSearching ? 'Analyzing...' : (
              <>
                AI Search <Sparkles className="w-5 h-5 text-accent" />
              </>
            )}
          </Button>
        </div>
      </div>

      {results && (
        <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-accent font-bold text-sm uppercase mb-3">
                <Sparkles className="w-4 h-4" />
                <span>AI Findings Summary</span>
              </div>
              <p className="text-slate-700 leading-relaxed text-lg italic">"{results.summary}"</p>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {results.relevantDocuments.map((doc: any, i: number) => (
              <div key={i} className="bg-white border border-slate-100 p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="font-bold text-primary">{doc.title}</h4>
                </div>
                <p className="text-slate-600 text-sm pl-9 border-l-2 border-slate-200 ml-4 italic">
                  "{doc.excerpt}"
                </p>
                <Button variant="ghost" className="mt-4 ml-9 text-accent font-bold text-xs p-0 h-auto flex gap-1 hover:bg-transparent">
                  Read Full Document <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

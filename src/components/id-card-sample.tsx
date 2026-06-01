
"use client"

import React from 'react'
import Image from 'next/image'
import { CheckCircle2, BadgeCheck, Info, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function IDCardShowcase() {
  const idImg = PlaceHolderImages.find(img => img.id === 'id-card-sample')
  
  const eligibilityCriteria = [
    { title: "Citizenship", detail: "Must be a citizen of India (for Indian Chapters) or have valid residency." },
    { title: "Age Requirement", detail: "Minimum 18 years of age to register as a formal advocate/member." },
    { title: "Background", detail: "No prior criminal record related to human rights violations." },
    { title: "Commitment", detail: "Willingness to undergo basic constitutional literacy training." },
    { title: "Documentation", detail: "Possession of valid Aadhaar and PAN cards for verification." }
  ]

  return (
    <section id="membership" className="py-24 bg-primary text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 -skew-x-12"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-sm font-bold border border-accent/30">
              <BadgeCheck className="w-4 h-4" />
              <span>Verified Membership</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight">
              Get Your Digital Membership Identity <span className="text-accent">Card</span> <span className="inline-block animate-bounce">Now</span>
            </h2>
            <p className="text-lg md:text-xl text-indigo-100 font-body">
              Join a network of thousands of human rights defenders. Our secure digital ID cards feature QR-code verification, making your organizational status verifiable anywhere, anytime.
            </p>
            
            <ul className="space-y-4">
              {[
                "Government Registered ID Number",
                "Instant QR-Code Verification",
                "Secure Digital Storage in Firestore",
                "Access to National Rights Conventions"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="bg-secondary p-1 rounded-full">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-base md:text-lg">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="bg-accent text-primary font-bold hover:bg-accent/90 px-8 py-6 rounded-xl text-lg shadow-lg shadow-accent/20 w-full sm:w-auto">
                Register as Member
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-6 rounded-xl text-lg shadow-lg shadow-secondary/20 transition-all border-none w-full sm:w-auto">
                    View Eligibility
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white text-primary rounded-[2rem] border-none shadow-2xl max-w-lg w-[95vw]">
                  <AlertDialogHeader>
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                      <Info className="w-6 h-6 text-accent" />
                    </div>
                    <AlertDialogTitle className="text-xl md:text-2xl font-headline font-bold">Membership Eligibility</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600 text-sm md:text-base">
                      To maintain the integrity of our human rights network, all members must meet the following criteria:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {eligibilityCriteria.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1 shrink-0"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                        <div>
                          <p className="font-bold text-sm">{c.title}</p>
                          <p className="text-xs text-slate-500">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogAction className="bg-primary text-white rounded-xl px-8 font-bold w-full sm:w-auto">
                      Understood
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="flex flex-col items-center gap-10 w-full max-w-2xl mx-auto">
            <div className="relative group perspective-1000 w-full">
              <div className="absolute -inset-10 bg-secondary/25 rounded-full blur-[100px] animate-pulse opacity-50"></div>
              <div className="absolute -inset-4 border border-secondary/20 rounded-[2.5rem] md:rounded-[3rem] pointer-events-none"></div>
              
              <div className="relative transform transition-all duration-700 group-hover:rotate-y-6 group-hover:scale-[1.02]">
                <div className="relative aspect-[4/2.5] w-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] border-8 border-secondary/80 bg-white ring-4 ring-secondary/20">
                  <Image 
                    src={idImg?.imageUrl || "/sample i card.jpeg"} 
                    alt="HRAT Official ID Card Sample" 
                    fill 
                    className="object-contain"
                    data-ai-hint={idImg?.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none"></div>
                </div>
              </div>
            </div>

            <div className="bg-accent text-primary px-4 py-1.5 rounded-full shadow-2xl border-2 border-primary animate-bounce flex items-center gap-2 mt-4">
               <ShieldCheck className="w-4 h-4" />
               <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest leading-none">Sample Official Identity Card</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

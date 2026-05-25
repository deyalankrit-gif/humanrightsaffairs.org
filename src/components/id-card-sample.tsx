
"use client"

import React from 'react'
import Image from 'next/image'
import { CheckCircle2, BadgeCheck, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
            <h2 className="text-4xl md:text-5xl font-headline font-bold leading-tight">
              Get Your Digital <span className="text-accent">Member Identity</span> Card Instantly
            </h2>
            <p className="text-xl text-indigo-100 font-body">
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
                  <span className="font-semibold text-lg">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button className="bg-accent text-primary font-bold hover:bg-accent/90 px-8 py-6 rounded-xl text-lg shadow-lg shadow-accent/20">
                Register as Member
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-6 rounded-xl text-lg shadow-lg shadow-secondary/20 transition-all border-none">
                    View Eligibility
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white text-primary rounded-[2rem] border-none shadow-2xl max-w-lg">
                  <AlertDialogHeader>
                    <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-4">
                      <Info className="w-6 h-6 text-accent" />
                    </div>
                    <AlertDialogTitle className="text-2xl font-headline font-bold">Membership Eligibility</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-600 text-base">
                      To maintain the integrity of our human rights network, all members must meet the following criteria:
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4 space-y-4">
                    {eligibilityCriteria.map((c, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="mt-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                        <div>
                          <p className="font-bold text-sm">{c.title}</p>
                          <p className="text-xs text-slate-500">{c.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogAction className="bg-primary text-white rounded-xl px-8 font-bold">
                      Understood
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="relative group perspective-1000">
            <div className="absolute -inset-10 bg-accent/20 rounded-full blur-[100px] animate-pulse"></div>
            <div className="relative transform transition-transform duration-700 group-hover:rotate-y-12">
              <div className="relative aspect-[4/2.5] w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-accent bg-white">
                <Image 
                  src="/HRAT I Card.jpeg" 
                  alt="HRAT Official ID Card Sample" 
                  fill 
                  className="object-contain"
                  data-ai-hint="official identification card"
                />
                {/* Privacy Blur Overlay - Reduced size for more precise masking */}
                <div className="absolute bottom-[24%] right-[12%] w-[18%] h-[5%] backdrop-blur-md bg-white/10 rounded-sm border border-white/20 pointer-events-none flex items-center justify-center">
                  <span className="text-[6px] text-primary/60 font-bold uppercase tracking-tighter">Protected</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-accent text-primary p-4 rounded-2xl shadow-xl border-4 border-primary animate-bounce hidden md:block">
                 <p className="text-[10px] font-bold uppercase tracking-widest">Sample I-Card</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


"use client"

import React from 'react'
import Image from 'next/image'
import { QrCode, CheckCircle2, BadgeCheck, Info } from 'lucide-react'
import { PlaceHolderImages } from '@/lib/placeholder-images'
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
              {/* Front of ID */}
              <div className="bg-white text-primary p-8 rounded-[2rem] shadow-2xl border-4 border-accent relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-10 -mt-10"></div>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12">
                      <Image 
                        src="/HRAT Logo.jpeg" 
                        alt="HRAT Logo" 
                        fill 
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-headline font-bold text-xl leading-none">HRAT</h4>
                      <p className="text-[10px] tracking-widest font-bold text-accent uppercase">JusticeShield</p>
                    </div>
                  </div>
                  <div className="bg-emerald-100 text-secondary px-3 py-1 rounded-full text-[10px] font-bold uppercase">Active Member</div>
                </div>

                <div className="flex gap-6 mb-8">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 overflow-hidden relative">
                    <Image 
                      src="https://picsum.photos/seed/user1/200/200" 
                      alt="User" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Full Name</p>
                    <h4 className="font-headline font-bold text-2xl">Abhishek Vardhan</h4>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">Member ID</p>
                    <h4 className="font-bold text-accent">HRAT-IN-2024-001</h4>
                  </div>
                </div>

                <div className="flex items-end justify-between border-t border-slate-100 pt-6">
                   <div className="space-y-1">
                     <p className="text-[10px] uppercase font-bold text-slate-400">Designation</p>
                     <p className="font-bold">Social Rights Advocate</p>
                     <p className="text-[10px] uppercase font-bold text-slate-400 mt-2">Valid Thru</p>
                     <p className="font-bold">Dec 2029</p>
                   </div>
                   <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 text-center">
                     <QrCode className="w-12 h-12 text-slate-700" />
                     <p className="text-[8px] mt-1 font-bold text-slate-500">SCAN TO VERIFY</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

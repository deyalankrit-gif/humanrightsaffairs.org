"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Loader2, 
  ArrowRight,
  Globe,
  CheckCircle2,
  Users,
  GraduationCap,
  Briefcase,
  User,
  Gavel,
  CalendarClock,
  AlertCircle,
  Camera,
  Hash,
  Heart,
  Home,
  Sparkles
} from 'lucide-react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from '@/firebase'
import { useToast } from '@/hooks/use-toast'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors'
import { INDIA_DATA } from '@/lib/india-data'

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Street address is required"),
  postOffice: z.string().min(2, "Post Office is required"),
  policeStation: z.string().min(2, "Police Station is required"),
  pinCode: z.string().length(6, "PIN Code must be 6 digits"),
  bloodGroup: z.string().optional(),
  pan: z.string().optional(),
  aadhaar: z.string().length(12, "Aadhaar must be 12 digits"),
  profession: z.string().optional(),
  gender: z.string().min(1, "Please select gender"),
  education: z.string().optional(),
  experience: z.string().optional(),
  level: z.string().min(1, "Operational level required"),
  stateName: z.string().optional(),
  districtName: z.string().optional(),
  memberType: z.string().min(1, "Please select membership type"),
  membershipDuration: z.enum(["1 Year", "2 Years", "3 Years"], { required_error: "Please select duration" }),
  hasNoCriminalRecord: z.boolean().refine(val => val === true, "You must check the criminal record affidavit"),
  hasAcceptedDeclaration: z.boolean().refine(val => val === true, "You must accept the organizational declaration"),
})

export function MembershipRegistrationDialog({ children }: { children: React.ReactNode }) {
  const db = useFirestore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [photo, setPhoto] = useState<string | null>(null)
  const [refId, setRefId] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      postOffice: '',
      policeStation: '',
      pinCode: '',
      bloodGroup: '',
      pan: '',
      aadhaar: '',
      profession: '',
      gender: '',
      education: '',
      experience: '',
      level: 'National',
      memberType: 'General Member',
      membershipDuration: '1 Year',
      hasNoCriminalRecord: false,
      hasAcceptedDeclaration: false,
    }
  })

  const level = form.watch('level')
  const selectedState = form.watch('stateName')
  const memberType = form.watch('memberType')
  const selectedGender = form.watch('gender')
  const states = Object.keys(INDIA_DATA).sort()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPhoto(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!db) return
    setLoading(true)

    const generatedRefId = `REF-HRAT-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    
    const applicationData = {
      ...values,
      photoDataUri: photo,
      referenceId: generatedRefId,
      status: 'Pending',
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "memberApplications"), applicationData)
      .then(() => {
        setRefId(generatedRefId)
        setIsSuccess(true)
        toast({ title: "Application Submitted", description: `Reference ID: ${generatedRefId}` })
        setLoading(false)
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: 'memberApplications',
          operation: 'create',
          requestResourceData: applicationData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false)
      })
  }

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) { setIsSuccess(false); setPhoto(null); setRefId(null); } }}>
        <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl text-center p-12">
          <DialogHeader className="items-center">
            <DialogTitle className="text-3xl font-headline font-bold text-primary">Registration Received</DialogTitle>
            <DialogDescription className="text-slate-500">
              Your application has been logged in the National registry.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 mt-4">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            
            <div className="w-full bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Application Reference</p>
              <div className="flex items-center justify-center gap-2">
                <Hash className="w-4 h-4 text-accent" />
                <span className="text-2xl font-headline font-bold text-primary tracking-tight">{refId}</span>
              </div>
            </div>

            <p className="text-slate-500 text-sm">Please save this reference number. Our regional coordinator will contact you for verification.</p>
            <Button onClick={() => setOpen(false)} className="w-full h-12 rounded-xl bg-primary text-white font-bold hover:bg-secondary hover:text-white">Return to Site</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) { form.reset(); setPhoto(null); } }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-headline font-bold text-primary flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-accent" /> Personnel Commissioning
          </DialogTitle>
          <DialogDescription className="text-base">
            Apply to become a verified member of the Human Rights Affairs Trust.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="relative w-32 h-32 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-accent transition-colors shadow-inner">
                {photo ? (
                  <Image src={photo} alt="Preview" fill className="object-cover" />
                ) : (
                  <Image src={selectedGender?.toLowerCase() === 'female' ? '/dummy w.png' : '/dummy m.png'} alt="Placeholder" fill className="object-cover" />
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
              </div>
              <Label className="text-[10px] text-slate-400 uppercase font-bold tracking-[0.2em]">Upload Profile Photo</Label>
            </div>

            <div className="bg-accent/5 p-6 rounded-3xl border border-accent/20 mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
               <FormField control={form.control} name="memberType" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Preferred Capacity
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-12 rounded-xl border-accent/30 bg-white dark:bg-slate-900 font-bold"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[1000000] bg-white">
                      <SelectItem value="Executive Designation" className="font-bold">Executive Designation</SelectItem>
                      <SelectItem value="Board Member" className="font-bold">Board Member</SelectItem>
                      <SelectItem value="General Member" className="font-bold">General Member</SelectItem>
                      <SelectItem value="Volunteer" className="font-bold">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="membershipDuration" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-accent mb-2 flex items-center gap-2">
                    <CalendarClock className="w-3 h-3" /> Term Duration
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-12 rounded-xl border-accent/30 bg-white dark:bg-slate-900 font-bold"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[1000000] bg-white">
                      <SelectItem value="1 Year" className="font-bold">1 Year Term</SelectItem>
                      <SelectItem value="2 Years" className="font-bold">2 Years Term</SelectItem>
                      <SelectItem value="3 Years" className="font-bold">3 Years Term</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {(memberType === 'Executive Designation' || memberType === 'Board Member') && (
                <div className="col-span-full animate-in fade-in slide-in-from-top-1">
                  <p className="text-[10px] text-accent font-bold uppercase tracking-tighter">
                    * Note: Specific designations will be assigned by the Board of Governance during vetting.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Legal Name</FormLabel>
                  <FormControl><Input placeholder="Legal Identity Name" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Heart className="w-3 h-3 text-red-500" /> Blood Group
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[1000000] bg-white">
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <SelectItem key={bg} value={bg}>{bg}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Official Email</FormLabel>
                  <FormControl><Input placeholder="name@example.com" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Contact Number</FormLabel>
                  <FormControl><Input placeholder="+91 XXXXX XXXXX" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="profession" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current Profession</FormLabel>
                  <FormControl><Input placeholder="e.g. Advocate" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="gender" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[1000000] bg-white"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary dark:text-white flex items-center gap-2">
                 <MapPin className="w-3.5 h-3.5 text-accent" /> Verified Residential Address
               </h4>

               <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Street / Village / House No</FormLabel>
                  <FormControl><Input placeholder="Detailed Location" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="postOffice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Post Office</FormLabel>
                    <FormControl><Input placeholder="PO Name" className="h-11 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="policeStation" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Police Station</FormLabel>
                    <FormControl><Input placeholder="PS Name" className="h-11 rounded-xl" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="pinCode" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PIN Code</FormLabel>
                    <FormControl><Input placeholder="6 digits" maxLength={6} className="h-11 rounded-xl font-mono" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="level" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Operational Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[1000000] bg-white">
                      <SelectItem value="National">National Level</SelectItem>
                      <SelectItem value="State">State Level</SelectItem>
                      <SelectItem value="District">District Level</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              {(level === 'State' || level === 'District') && (
                <FormField control={form.control} name="stateName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">State Chapter</FormLabel>
                    <Select onValueChange={(val) => { field.onChange(val); form.setValue('districtName', '') }}>
                      <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select State" /></SelectTrigger></FormControl>
                      <SelectContent position="popper" className="z-[1000000] bg-white max-h-60">{states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>

            {level === 'District' && selectedState && (
              <FormField control={form.control} name="districtName" render={({ field }) => (
                <FormItem className="animate-in fade-in slide-in-from-top-2">
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">District Committee</FormLabel>
                  <Select onValueChange={field.onChange}>
                    <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select District" /></SelectTrigger></FormControl>
                    <SelectContent position="popper" className="z-[1000000] bg-white max-h-60">{(INDIA_DATA[selectedState] || []).map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="education" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"><GraduationCap className="w-3 h-3 text-accent" /> Education</FormLabel>
                  <FormControl><Input placeholder="Academic Qualifications" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="experience" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2"><Briefcase className="w-3 h-3 text-accent" /> Experience</FormLabel>
                  <FormControl><Input placeholder="Years in Service" className="h-11 rounded-xl" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="pan" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PAN Number</FormLabel>
                  <FormControl><Input placeholder="ABCDE1234F" className="h-11 rounded-xl uppercase font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="aadhaar" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Aadhaar Number</FormLabel>
                  <FormControl><Input placeholder="12-digit number" className="h-11 rounded-xl font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
               <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary dark:text-white flex items-center gap-2 mb-4">
                 <ShieldCheck className="w-4 h-4 text-accent" /> Legal Affirmations (Mandatory)
               </h4>
               
               <FormField control={form.control} name="hasNoCriminalRecord" render={({ field }) => (
                  <FormItem className="rounded-2xl border p-4 bg-slate-50 dark:bg-slate-900 border-accent/20">
                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-accent" /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-xs font-medium cursor-pointer text-primary dark:text-white flex items-center gap-2">
                          <Gavel className="w-3.5 h-3.5 text-accent shrink-0" />
                          I hereby declare and affirm that I have no past criminal record.
                        </FormLabel>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
              
              <FormField control={form.control} name="hasAcceptedDeclaration" render={({ field }) => (
                  <FormItem className="rounded-2xl border p-4 bg-slate-50 dark:bg-slate-900 border-accent/20">
                    <div className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="border-accent" /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-[10px] md:text-xs font-medium cursor-pointer text-primary dark:text-white leading-relaxed">
                          I hereby declare that I shall abide by all the rules, regulations, and policies of this organization. I understand and agree that the competent authority reserves the right to suspend or cancel my membership at any time without prior notice.
                        </FormLabel>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary text-white font-bold text-lg hover:bg-secondary hover:text-white shadow-xl shadow-primary/20 flex gap-2">
              {loading ? <Loader2 className="animate-spin" /> : <>Submit Registration Request <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import React, { useState } from 'react'
import { 
  BookOpen, 
  Scale, 
  FileText, 
  UserCheck, 
  ShieldCheck, 
  Download, 
  ExternalLink, 
  Globe, 
  CheckCircle2, 
  X, 
  Baby, 
  Shield, 
  MessageCircle, 
  EyeOff,
  Navigation,
  ChevronRight,
  ArrowLeft,
  BookOpenCheck
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from '@/lib/utils'

/**
 * GUIDE_SUB_DETAILS: A comprehensive registry of in-depth legal analysis for every focus area
 * in the Knowledge Hub. Renamed from JUVENILE_JUSTICE_DETAILS to reflect its global scope.
 */
const GUIDE_SUB_DETAILS: Record<string, { title: string, content: string, mandate: string }> = {
  // Juvenile Justice
  "Child Welfare Committees": {
    title: "Child Welfare Committees (CWC)",
    content: "The Child Welfare Committee is a statutory body established in every district under the JJ Act. It consists of a Chairperson and four members, including at least one woman. They are the final authority in matters relating to children in need of care and protection, having the same powers as a Metropolitan Magistrate.",
    mandate: "Ensuring the safety, well-being, and legal representation of abandoned, orphaned, or abused children through district-level judicial oversight."
  },
  "Juvenile Rehabilitation": {
    title: "Rehabilitation & Social Integration",
    content: "Rehabilitation is the core philosophy of the Act. It moves away from punishment toward reformation. This includes community-based programs, vocational training, psychological counseling, and family-based care to help children lead a dignified life post-inquiry.",
    mandate: "Transforming 'conflict with law' into 'contribution to society' through structured education, moral guidance, and skill-building."
  },
  "Observation Homes": {
    title: "Observation & Special Homes",
    content: "Observation homes provide temporary reception and care for juveniles during the pendency of an inquiry by the Juvenile Justice Board. Special homes are dedicated to the long-term care and rehabilitation of children committed for longer durations, focusing on their growth and safety.",
    mandate: "Providing a secure, nurturing environment that facilitates physical and mental growth during legal proceedings, far removed from traditional adult prisons."
  },
  "Adoption Procedures": {
    title: "Legal Adoption Framework",
    content: "The Act provides a comprehensive framework for adoption, governed by the Central Adoption Resource Authority (CARA). It ensures that adoption is always in the best interest of the child and maintains strict transparency to prevent illegal trafficking or exploitation.",
    mandate: "Securing every child's right to a stable family through a legally verified, child-centric, and ethically monitored adoption process."
  },

  // Constitution of India
  "Fundamental Rights (Articles 12-35)": {
    title: "Fundamental Rights (Part III)",
    content: "Articles 12 to 35 of the Indian Constitution define the fundamental rights of citizens. These include equality before the law, freedom of speech and expression, protection of life and personal liberty (Article 21), and the right to constitutional remedies. These rights are justiceable and enforceable by the courts.",
    mandate: "Protecting individual liberties against state encroachment and ensuring the dignity of every citizen."
  },
  "Directive Principles of State Policy": {
    title: "Directive Principles (Part IV)",
    content: "The Directive Principles of State Policy (DPSP) are guidelines for the framing of laws by the government. Although not justiceable in court, they are fundamental in the governance of the country, aiming to create a social and economic democracy based on welfare and equity.",
    mandate: "Directing the State to establish a just social order where wealth is distributed and the environment is protected."
  },
  "Fundamental Duties of Citizens": {
    title: "Fundamental Duties (Part IV-A)",
    content: "Added by the 42nd Amendment, these duties remind citizens that while they enjoy rights, they also have obligations towards the nation, such as respecting the national flag, protecting public property, and promoting a spirit of common brotherhood.",
    mandate: "Promoting a sense of responsibility and patriotism among citizens to maintain national integrity and social harmony."
  },
  "Independence of the Judiciary": {
    title: "Judicial Independence",
    content: "The Constitution ensures that the judiciary remains independent of the executive and legislative branches. This is achieved through secure tenure for judges, fixed salaries, and the power of judicial review to strike down unconstitutional laws or state actions.",
    mandate: "Maintaining the rule of law and ensuring a robust checks-and-balances system within the Indian democracy."
  },

  // Women's Rights
  "Domestic Violence Act, 2005": {
    title: "Protection of Women from Domestic Violence Act",
    content: "This Act provides a civil remedy for women who are victims of violence within the household. It covers physical, sexual, verbal, emotional, and economic abuse, granting protection orders and residence orders to victims immediately.",
    mandate: "Ensuring a life free from violence within the domestic sphere through rapid judicial protection and compensation."
  },
  "POSH Act, 2013": {
    title: "Sexual Harassment at Workplace Act",
    content: "The POSH Act mandates every employer to provide a safe working environment for women. It requires the establishment of Internal Committees (IC) to address complaints and promotes a zero-tolerance policy toward workplace harassment.",
    mandate: "Fostering professional environments where women can work with dignity, equity, and absolute security."
  },
  "Maternity Benefit Rights": {
    title: "Maternity Benefit Act",
    content: "This law regulates the employment of women in certain establishments for specific periods before and after childbirth. It provides for paid maternity leave and other essential benefits to ensure the health of the mother and child.",
    mandate: "Supporting maternal health and job security during the critical period of childbirth and early childcare."
  },
  "Right to Equal Pay": {
    title: "Equal Remuneration Act",
    content: "The principle of equal pay for equal work is a constitutional mandate. This Act prevents discrimination between men and women in recruitment and ensures equal wages for work of the same nature or similar skill requirements.",
    mandate: "Eliminating gender-based economic disparity and promoting fair labor practices in the national workforce."
  },
  
  // Labor Laws
  "Minimum Wages Compliance": {
    title: "Minimum Wages Act",
    content: "This Act ensures that workers are paid a baseline wage that meets their essential needs. It prevents the exploitation of labor in scheduled employments and requires periodic revision of wage rates based on inflation and the cost of living.",
    mandate: "Securing a dignified standard of living for the labor force through mandatory, non-negotiable wage floors."
  },
  "Industrial Disputes Rights": {
    title: "Industrial Disputes Act",
    content: "This framework provides for the investigation and settlement of industrial disputes. It regulates layoffs, retrenchment, and closures, ensuring that workers are not arbitrarily dismissed without due process or fair compensation.",
    mandate: "Balancing industrial peace with the protection of workers' livelihoods and professional rights."
  },
  "Social Security Benefits": {
    title: "ESI & Provident Fund (EPF)",
    content: "Social security laws like the ESI Act and EPF Act provide financial support during sickness, disablement, or retirement. They create a vital safety net for workers and their families against life's uncertainties and old age.",
    mandate: "Building long-term financial resilience and healthcare access for the marginalized working class."
  },
  "Workplace Safety Norms": {
    title: "Factories Act & Occupational Safety",
    content: "This legislation mandates strict health, safety, and welfare measures in factories. It covers ventilation, lighting, machinery guarding, and restricted working hours to prevent industrial accidents and occupational diseases.",
    mandate: "Ensuring that 'Right to Life' under Article 21 includes the right to a safe and hazard-free industrial workplace."
  },

  // RTI
  "Filing Procedure Guide": {
    title: "How to File an RTI",
    content: "Filing an RTI involves identifying the Public Authority, drafting a specific query, and paying the nominal fee (₹10). The application can be submitted online or via registered post. Accuracy in identifying the PIO is key to a timely response.",
    mandate: "Simplifying the process for citizens to demand transparency and accountability from public institutions."
  },
  "Drafting Applications": {
    title: "RTI Drafting Standards",
    content: "While no specific format is required, a well-drafted RTI is clear and concise. It should ask for specific records or documents (Certified Copies) rather than vague explanations, ensuring higher success in information retrieval.",
    mandate: "Enabling precision in citizen inquiries to minimize bureaucratic evasiveness and delays."
  },
  "Appellate Authority Info": {
    title: "The RTI Appeals Process",
    content: "If info is denied, the first appeal goes to a senior officer (FAA) within 30 days. If still unsatisfied, a second appeal is filed with the Information Commission (CIC/SIC). This multi-level scrutiny protects the citizen's right to know.",
    mandate: "Providing a robust grievance redressal mechanism against administrative information suppression."
  },
  "Tracking Status Guidelines": {
    title: "Tracking & Follow-up Protocol",
    content: "Citizens must monitor the 30-day statutory timeline. Use the RTI Online dashboard or speed post tracking. Persistence in follow-up is necessary to hold defaulting officers accountable and invoke penalty provisions.",
    mandate: "Ensuring strict adherence to statutory timelines for meaningful public accountability."
  },

  // Child Labor
  "Prohibition of Child Labor": {
    title: "Complete Prohibition (Under 14)",
    content: "The law prohibits the employment of children below 14 years in all occupations and processes. This is a fundamental safeguard against exploitation, prioritizing the child's right to education over labor.",
    mandate: "Universal protection of childhood innocence and the non-negotiable right to primary education."
  },
  "Regulation of Adolescent Work": {
    title: "Adolescent Safety (14-18)",
    content: "Work for adolescents (14-18 years) is strictly prohibited in hazardous occupations like mining or explosive manufacturing. In other areas, it is regulated to ensure health and education are not compromised.",
    mandate: "Preventing physical and developmental harm to young workers in dangerous industries."
  },
  "Rehabilitation Provisions": {
    title: "Rescue & Social Re-integration",
    content: "Rescued children are provided with social security, bridge education, and vocational training. The law mandates the creation of a 'Child Labour Rehabilitation Fund' for their long-term welfare and education.",
    mandate: "Restoring the rights of exploited children through holistic social and economic support."
  },
  "Penalties for Violations": {
    title: "Strict Statutory Penalties",
    content: "Employing a child in violation of the Act is a cognizable offence. Penalties include significant imprisonment and heavy fines, which are utilized directly for the welfare of the rescued children.",
    mandate: "Creating a powerful legal deterrent against the inhuman exploitation of children for profit."
  },

  // Speech
  "Right to Expression": {
    title: "Article 19(1)(a) Foundations",
    content: "The right to freedom of speech and expression includes the right to propagate one's views as well as the views of others. It covers speech, writing, printing, and digital broadcasting as fundamental tools of democracy.",
    mandate: "Upholding the primary pillar of a free, transparent, and democratic Indian society."
  },
  "Press Freedom": {
    title: "Media Rights & Oversight",
    content: "Press freedom is implied under Article 19. It protects journalists from arbitrary censorship and allows the media to act as the watchdog of democracy, reporting on the actions of the state without fear.",
    mandate: "Protecting the 'Fourth Estate' to ensure institutional transparency and public awareness."
  },
  "Internet Rights": {
    title: "Access to Digital Rights",
    content: "The Supreme Court has recognized that access to the internet is part of fundamental rights under Article 19. Arbitrary internet shutdowns are subject to judicial review to prevent the silencing of citizen voices.",
    mandate: "Safeguarding the right to information and digital expression in the modern age."
  },
  "Reasonable Restrictions": {
    title: "Constraints of Article 19(2)",
    content: "Speech is not absolute. It can be restricted in the interest of national security, public order, decency, morality, or to prevent defamation and contempt of court as per constitutional guidelines.",
    mandate: "Balancing individual freedom with the collective security, sovereignty, and harmony of the nation."
  },

  // Privacy
  "Informational Privacy": {
    title: "Right to Data Control",
    content: "Individuals have the right to control how their personal data is collected and processed. This includes the 'Right to be Forgotten' and the right to correct inaccurate digital records in state databases.",
    mandate: "Preventing digital profiling and unauthorized commercial exploitation of an individual's personal life."
  },
  "Data Protection Rights": {
    title: "Privacy against Surveillance",
    content: "The right to privacy includes protection against state or private surveillance. Any access to personal communications must have a clear legal mandate, valid reason, and judicial oversight.",
    mandate: "Securing the sanctity of personal information and private life against state overreach."
  },
  "Bodily Autonomy": {
    title: "Right to Physical Integrity",
    content: "Privacy includes the right to make choices about one's own body, including medical decisions and reproductive rights, free from coerced interference or state-mandated procedures.",
    mandate: "Upholding individual dignity through the absolute right to bodily self-determination and physical privacy."
  },
  "Digital Privacy Laws": {
    title: "IT Act & Personal Privacy",
    content: "The Information Technology Act and associated rules provide a framework for addressing cybercrimes and protecting sensitive personal data held by corporate or state entities in the digital domain.",
    mandate: "Regulating the digital ecosystem to prevent data breaches, cyber-harassment, and privacy violations."
  },

  // Traffic
  "Motor Vehicles Act (1988/2019)": {
    title: "Road Transport Framework",
    content: "The Motor Vehicles Act is the primary legislation for road transport in India. The 2019 amendment significantly increased penalties for violations to promote stricter adherence to road safety standards.",
    mandate: "Codifying the rules of the road to ensure the 'Right to Life' (Article 21) for every Indian commuter."
  },
  "Traffic Rules & Violations": {
    title: "Road Safety Compliance",
    content: "Mandatory adherence to signals, speed limits, and lane discipline. Violations like drink-driving, over-speeding, and using mobile phones while driving are strictly penalized to prevent fatal accidents.",
    mandate: "Minimizing road fatalities through behavioral regulation, education, and strict legal enforcement."
  },
  "Driving License Procedures": {
    title: "Credentialing & Standards",
    content: "Obtaining a license involves rigorous testing of driving skills and traffic knowledge. Licenses are subject to periodic renewal and mandatory medical fitness checks for commercial operators.",
    mandate: "Ensuring that only qualified and physically fit individuals are authorized to operate vehicles on public roads."
  },
  "Penalty & Fine Structures": {
    title: "Deterrence & Adjudication",
    content: "Penalties are designed to be significant deterrents. Serious offences can lead to license suspension, vehicle impoundment, or imprisonment, emphasizing the zero-tolerance policy toward road safety negligence.",
    mandate: "Leveraging legal consequences to enforce a culture of safety, discipline, and responsibility on Indian roads."
  },

  // Manuals
  "Hindi Language Editions": {
    title: "Regional Manual: Hindi",
    content: "Our Hindi language manuals provide a simplified breakdown of the Bharatiya Nyaya Sanhita (BNS) and Bharatiya Nagarik Suraksha Sanhita (BNSS). They are designed for rural outreach and community training camps.",
    mandate: "Bridging the language gap to ensure constitutional literacy in the Hindi heartland."
  },
  "Bengali Language Editions": {
    title: "Regional Manual: Bengali",
    content: "Focused on West Bengal and surrounding regions, these manuals translate complex legal procedures into standard Bengali. They are highly effective for local village-level advocacy sessions.",
    mandate: "Empowering the people of Bengal with knowledge of their rights in their native tongue."
  },
  "English Quick-Start Guides": {
    title: "Standard English Handbooks",
    content: "Concise handbooks for professionals and students. They provide immediate reference points for arrest procedures, filing complaints, and understanding the hierarchy of courts.",
    mandate: "Providing rapid-access legal knowledge for urban and professional sectors."
  },
  "Interactive Case Studies": {
    title: "Learning thru Precedents",
    content: "Practical examples of how human rights were successfully defended in real-life scenarios. These cases help volunteers understand the application of law in ground-level missions.",
    mandate: "Transforming theoretical law into practical mission strategy for our members."
  }
};

const guides = [
  {
    id: "constitution",
    title: "Constitution of India",
    desc: "A complete guide to Fundamental Rights & Duties.",
    overview: "The Constitution of India is the supreme law of India. It imparts constitutional supremacy and was adopted by its people with a declaration in its preamble. It is the framework that defines fundamental political code, structure, procedures, powers, and duties of government institutions.",
    features: ["Fundamental Rights (Articles 12-35)", "Directive Principles of State Policy", "Fundamental Duties of Citizens", "Independence of the Judiciary"],
    icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
    color: "bg-indigo-50 dark:bg-indigo-950/40",
    size: "lg"
  },
  {
    id: "womens-rights",
    title: "Women's Rights",
    desc: "Legal protection against harassment & discrimination.",
    overview: "Comprehensive legal frameworks protect women in India from domestic violence, workplace harassment, and ensure equal pay. Understanding these rights is crucial for empowerment and safety.",
    features: ["Domestic Violence Act, 2005", "POSH Act, 2013", "Maternity Benefit Rights", "Right to Equal Pay"],
    icon: <UserCheck className="w-8 h-8 text-pink-500" />,
    color: "bg-pink-50 dark:bg-pink-950/40",
    size: "md"
  },
  {
    id: "labor-laws",
    title: "Labor Laws",
    desc: "Knowing your rights in the Indian workplace.",
    overview: "Indian labor laws ensure fair treatment of employees, covering minimum wages, safe working conditions, and social security benefits like PF and Gratuity.",
    features: ["Minimum Wages Compliance", "Industrial Disputes Rights", "Social Security Benefits", "Workplace Safety Norms"],
    icon: <Scale className="w-8 h-8 text-amber-500" />,
    color: "bg-amber-50 dark:bg-amber-950/40",
    size: "md"
  },
  {
    id: "rti",
    title: "Right to Info (RTI)",
    desc: "How to file an RTI and track your request.",
    overview: "The RTI Act is a landmark legislation that allows citizens to question the government and its departments, promoting transparency and combating corruption.",
    features: ["Filing Procedure Guide", "Drafting Applications", "Appellate Authority Info", "Tracking Status Guidelines"],
    icon: <FileText className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-50 dark:bg-emerald-950/40",
    size: "md"
  },
  {
    id: "child-labor",
    title: "Child Labor Laws",
    desc: "Protections against child exploitation and forced labor.",
    overview: "The Child Labour (Prohibition and Regulation) Act, 1986, prohibits the engagement of children in certain employments and regulates the conditions of work of children in others. It is a vital safeguard for the future of our nation.",
    features: ["Prohibition of Child Labor", "Regulation of Adolescent Work", "Rehabilitation Provisions", "Penalties for Violations"],
    icon: <Baby className="w-8 h-8 text-red-500" />,
    color: "bg-red-50 dark:bg-red-950/40",
    size: "md"
  },
  {
    id: "manuals",
    title: "Manuals (PDF)",
    desc: "Download legal manuals in Hindi, English & Bengali.",
    overview: "Access our simplified legal manuals designed for the common citizen. These manuals break down complex legal jargon into understandable regional languages.",
    features: ["Hindi Language Editions", "Bengali Language Editions", "English Quick-Start Guides", "Interactive Case Studies"],
    icon: <BookOpen className="w-8 h-8 text-sky-500" />,
    color: "bg-sky-50 dark:bg-sky-950/40",
    size: "lg"
  },
  {
    id: "juvenile-justice",
    title: "Juvenile Justice Act",
    desc: "Care and protection for children in conflict with law.",
    overview: "The Juvenile Justice (Care and Protection of Children) Act, 2015, provides for the comprehensive care, protection, development, treatment, and rehabilitation of children in need of care and protection and those in conflict with law.",
    features: ["Child Welfare Committees", "Juvenile Rehabilitation", "Observation Homes", "Adoption Procedures"],
    icon: <Shield className="w-8 h-8 text-emerald-500" />,
    color: "bg-emerald-50 dark:bg-emerald-950/40",
    size: "md"
  },
  {
    id: "speech",
    title: "Freedom of Speech",
    desc: "Understanding Article 19(1)(a) and your right to express.",
    overview: "Freedom of speech and expression is a fundamental right under Article 19 of the Constitution. It allows citizens to express their views freely, subject to reasonable restrictions in the interest of national security and public order.",
    features: ["Right to Expression", "Press Freedom", "Internet Rights", "Reasonable Restrictions"],
    icon: <MessageCircle className="w-8 h-8 text-blue-500" />,
    color: "bg-blue-50 dark:bg-blue-950/40",
    size: "md"
  },
  {
    id: "privacy",
    title: "Right to Privacy",
    desc: "Protection of individual dignity and personal data.",
    overview: "The Supreme Court declared the right to privacy as a fundamental right under Article 21. It protects individual autonomy and prohibits unlawful state or private interference in personal matters.",
    features: ["Informational Privacy", "Data Protection Rights", "Bodily Autonomy", "Digital Privacy Laws"],
    icon: <EyeOff className="w-8 h-8 text-purple-500" />,
    color: "bg-purple-50 dark:bg-purple-950/40",
    size: "md"
  },
  {
    id: "traffic-law",
    title: "Indian Traffic Law",
    desc: "Essential rules, penalties and road safety norms.",
    overview: "The Motor Vehicles Act governs all aspects of road transport in India. Understanding traffic signals, licensing requirements, and penalty frameworks is essential for ensuring road safety and legal compliance.",
    features: ["Motor Vehicles Act (1988/2019)", "Traffic Rules & Violations", "Driving License Procedures", "Penalty & Fine Structures"],
    icon: <Navigation className="w-8 h-8 text-red-600" />,
    color: "bg-red-50 dark:bg-red-950/40",
    size: "md"
  }
]

export function KnowledgeCenter() {
  const [selectedGuide, setSelectedGuide] = useState<typeof guides[0] | null>(null)
  const [subDetail, setSubDetail] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleOpenDetail = (guide: typeof guides[0]) => {
    setSelectedGuide(guide)
    setSubDetail(null)
    setOpen(true)
  }

  const handleAccessRepository = () => {
    if (!selectedGuide) return;
    let url = "";
    switch (selectedGuide.id) {
      case "constitution":
        url = "https://www.india.gov.in/my-government/constitution-of-india";
        break;
      case "womens-rights":
        url = "https://clpr.org.in/wp-content/uploads/2024/12/Womens-Book_Accessible.pdf";
        break;
      case "labor-laws":
        url = "https://clc.gov.in/clc/labour-law";
        break;
      case "rti":
        url = "https://rti.dopt.gov.in/";
        break;
      case "child-labor":
        url = "https://labour.gov.in/childlabour/about-child-labour";
        break;
      case "manuals":
        url = "https://bprd.nic.in/uploads/pdf/BNS%20Book_After%20Correction.pdf";
        break;
      case "juvenile-justice":
        url = "https://wcd.nic.in/acts/juvenile-justice-care-and-protection-children-act-2015";
        break;
      case "speech":
        url = "https://www.constitutionofindia.net/articles/article-19-protection-of-certain-rights-regarding-freedom-of-speech-etc/";
        break;
      case "privacy":
        url = "https://meity.gov.in/content/personal-data-protection-bill-2019";
        break;
      case "traffic-law":
        url = "https://morth.nic.in/motor-vehicles-act-1988";
        break;
      default:
        return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const activeSubDetailData = subDetail ? GUIDE_SUB_DETAILS[subDetail] : null;

  return (
    <section id="knowledge" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 text-secondary font-bold mb-4 text-sm">
              <Globe className="w-4 h-4 md:w-5 md:h-5" />
              <span>Multilingual Knowledge Hub</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-primary dark:text-foreground mb-4">Digital Library of Human Rights</h2>
            <p className="text-muted-foreground text-sm md:text-base">Access legal manuals, rights guides, and educational materials in English, Hindi, and Bengali. Knowledge is your first line of defense.</p>
          </div>
          <Button 
            variant="outline" 
            asChild
            className="border-primary text-primary hover:bg-secondary hover:text-white dark:border-slate-700 dark:text-slate-300 w-full md:w-auto font-bold transition-colors"
          >
            <a href="#search">View All Documentation</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-auto">
          {guides.map((guide) => (
            <Card 
              key={guide.id} 
              className={cn(
                "p-6 md:p-8 border-none flex flex-col justify-between group overflow-hidden relative shadow-sm hover:shadow-xl transition-all duration-500 min-h-[250px]",
                guide.color,
                guide.size === 'lg' ? 'md:col-span-2' : ''
              )}
            >
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700 hidden md:block">
                {React.cloneElement(guide.icon as React.ReactElement, { className: "w-32 h-32 md:w-48 md:h-48" })}
              </div>
              <div className="relative z-10">
                <div className="p-2 md:p-3 bg-white dark:bg-slate-800 rounded-xl w-fit shadow-sm mb-4 md:mb-6">
                  {guide.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-headline font-bold text-primary dark:text-white mb-2">{guide.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs md:text-sm max-w-xs">{guide.desc}</p>
              </div>
              <div className="relative z-10 flex flex-wrap gap-2 mt-4 md:mt-0">
                <Button 
                  variant="ghost" 
                  onClick={() => handleOpenDetail(guide)}
                  className="text-primary dark:text-white hover:text-white hover:bg-secondary font-bold px-4 rounded-lg flex items-center gap-1 text-xs md:text-sm transition-all"
                >
                  Read More <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
                {guide.id === 'manuals' && (
                  <Button size="sm" onClick={() => window.open('https://bprd.nic.in/uploads/pdf/BNS%20Book_After%20Correction.pdf', '_blank')} className="bg-primary text-primary-foreground ml-auto text-xs h-8 md:h-9 hover:bg-secondary hover:text-white transition-colors">
                    <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" /> Download
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) setSubDetail(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden rounded-[2.5rem] p-0 border-none shadow-2xl bg-white dark:bg-slate-950 flex flex-col [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedGuide?.title || 'Guide Details'}</DialogTitle>
            <DialogDescription>Detailed human rights documentation.</DialogDescription>
          </DialogHeader>
          
          <div className="absolute right-6 top-6 z-50">
            <DialogClose asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-blue-600 hover:bg-blue-500 text-white h-10 w-10 shadow-xl border-2 border-white/20 transition-all hover:scale-110 hover:rotate-90 duration-300 active:scale-95"
              >
                <X className="w-6 h-6 text-white" />
              </Button>
            </DialogClose>
          </div>

          {selectedGuide && (
            <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
              <div className="flex flex-col">
                <div className="relative bg-gradient-to-br from-primary via-primary/95 to-accent p-12 md:p-16 text-primary-foreground overflow-hidden shrink-0 border-b-8 border-accent/20">
                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-10 translate-y-[-10px]">
                    {React.cloneElement(selectedGuide.icon as React.ReactElement, { className: "w-64 h-64 md:w-80 md:h-80" })}
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30">
                      <ShieldCheck className="w-4 h-4 text-accent" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Official Legal Resource</span>
                    </div>
                    
                    {subDetail ? (
                      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <Button 
                          variant="ghost" 
                          onClick={() => setSubDetail(null)}
                          className="p-0 h-auto text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest gap-2 mb-2 hover:bg-transparent"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back to Overview
                        </Button>
                        <h2 className="text-3xl md:text-5xl font-headline font-bold leading-tight drop-shadow-lg">
                          {activeSubDetailData?.title}
                        </h2>
                      </div>
                    ) : (
                      <h2 className="text-4xl md:text-6xl font-headline font-bold leading-tight pr-12">
                        {selectedGuide.title}
                      </h2>
                    )}
                    
                    {!subDetail && (
                      <p className="text-xl text-primary-foreground/70 font-medium italic">
                        {selectedGuide.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-8 md:p-12 space-y-12 pb-24">
                  {subDetail ? (
                    <div className="space-y-12 animate-in fade-in duration-700">
                       <div className="space-y-6">
                         <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                           <span className="w-8 h-px bg-accent"></span> Detailed Analysis
                         </h3>
                         <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body font-medium italic border-l-4 border-accent pl-6">
                           "{activeSubDetailData?.content}"
                         </p>
                       </div>

                       <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/30 shadow-inner">
                          <div className="flex items-start gap-4">
                            <BookOpenCheck className="w-6 h-6 text-indigo-500 mt-1 shrink-0" />
                            <div className="space-y-2">
                               <h4 className="font-black uppercase tracking-widest text-[10px] text-indigo-700 dark:text-indigo-400">Institutional Mandate</h4>
                               <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                                 {activeSubDetailData?.mandate}
                               </p>
                            </div>
                          </div>
                       </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-accent flex items-center gap-2">
                           <span className="w-8 h-px bg-accent"></span> Overview
                        </h3>
                        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 leading-relaxed font-body font-medium italic border-l-4 border-accent pl-6">
                          "{selectedGuide.overview}"
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                         <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Areas of Focus
                            </h4>
                            <ul className="space-y-4">
                              {selectedGuide.features.map((feature, idx) => {
                                const isClickable = GUIDE_SUB_DETAILS[feature];
                                return (
                                  <li 
                                    key={idx} 
                                    onClick={() => isClickable && setSubDetail(feature)}
                                    className={cn(
                                      "flex items-center gap-3 p-4 rounded-2xl border transition-all shadow-sm",
                                      isClickable 
                                        ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-accent hover:shadow-lg cursor-pointer group/item" 
                                        : "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800"
                                    )}
                                  >
                                     <span className={cn(
                                       "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md shrink-0 transition-colors",
                                       isClickable ? "bg-accent text-primary group-hover/item:bg-secondary group-hover/item:text-white" : "bg-primary text-white"
                                     )}>{idx + 1}</span>
                                     <span className="font-bold text-slate-700 dark:text-slate-200 flex-1">{feature}</span>
                                     {isClickable && <ChevronRight className="w-4 h-4 text-slate-300 group-hover/item:text-accent group-hover/item:translate-x-1 transition-all" />}
                                  </li>
                                )
                              })}
                            </ul>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center animate-pulse">Click on a focus area to examine details</p>
                         </div>

                         <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-primary dark:text-white">Significance</h4>
                            <div className="p-8 rounded-[2.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/30 shadow-inner">
                              <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic text-sm md:text-base font-medium">
                                "The knowledge of these rights is not just informative—it is transformative. By understanding the legal safeguards provided by the State, every citizen becomes a vital part of a just and transparent democracy."
                              </p>
                            </div>
                         </div>
                      </div>
                    </>
                  )}

                  <div className="pt-12 flex flex-col gap-4 items-center">
                    <Button 
                      size="lg" 
                      onClick={handleAccessRepository}
                      className="w-full bg-accent text-primary font-bold h-16 rounded-2xl text-lg hover:bg-secondary hover:text-white transition-all shadow-xl shadow-accent/20 group"
                    >
                      Access Full {subDetail ? 'Topic' : 'Guide'} Repository <ExternalLink className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                    </Button>
                    
                    <DialogClose asChild>
                      <Button 
                        variant="outline" 
                        className="w-full h-14 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        Close Portal
                      </Button>
                    </DialogClose>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-4">
                      Official Record • Human Rights Affairs Trust
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}

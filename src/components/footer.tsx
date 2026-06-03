import Image from 'next/image'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import Link from 'next/link'
import { DonationDialog } from './donation-dialog'

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10">
                <Image 
                  src="/HRAT%20Logo.jpeg" 
                  alt="HRAT Logo" 
                  fill 
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-headline font-bold text-xl leading-none">HRAT</span>
                <span className="text-[10px] font-bold tracking-widest text-accent uppercase">JusticeShield</span>
              </div>
            </Link>
            <p className="text-indigo-100 text-sm leading-relaxed">
              Human Rights Affairs Trust (Justice Shield) is a Central Government Registered Human Rights Organization in India <span className="font-bold text-accent">(Reg. No. WB/2025/0762605)</span>. Dedicated to constitutional literacy & legal aid & Social Justice.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-accent">Quick Links</h4>
            <ul className="space-y-4 text-indigo-100">
              <li><Link href="/#leadership" className="hover:text-white transition-colors">Chairman's Message</Link></li>
              <li><Link href="/#knowledge" className="hover:text-white transition-colors">Rights Center</Link></li>
              <li><Link href="/#membership" className="hover:text-white transition-colors">Be A Member</Link></li>
              <li><Link href="/#helpline" className="hover:text-white transition-colors">Emergency Contacts</Link></li>
              <li>
                <DonationDialog>
                  <button className="hover:text-white transition-colors">Donate Now</button>
                </DonationDialog>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-headline font-bold mb-6 text-accent">Legal Support</h4>
            <ul className="space-y-4 text-indigo-100">
              <li><Link href="#" className="hover:text-white transition-colors">Pro-Bono Services</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Filing an FIR</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">RTI Assistance</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Bail Procedures</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <div className="mb-10">
              <h4 className="text-lg font-headline font-bold mb-6 text-accent">Head Office</h4>
              <ul className="space-y-4 text-indigo-100">
                <li className="flex gap-3">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">Human Rights Bhawan, Lodhi Road, New Delhi, India - 110003</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">+91 (011) 2345 6789</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">contact@hrat-india.org</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-headline font-bold mb-6 text-accent">West Bengal State Office</h4>
              <ul className="space-y-4 text-indigo-100">
                <li className="flex gap-3">
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">Vill. - Biswanathpur, P.O. - Ramnathpur, P.S. - Deganga, Dist. - North 24 Parganas, West Bengal - 743423</span>
                </li>
                <li className="flex gap-3">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">+91 70631 11471</span>
                </li>
                <li className="flex gap-3">
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-sm">wb@hrat-india.org</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-indigo-200 text-xs">© 2024 Human Rights Affairs Trust (JusticeShield). Registered with Central Government of India.</p>
          <div className="flex items-center gap-6">
             <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">System Secure</span>
             </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

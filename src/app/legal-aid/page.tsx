
import type { Metadata } from 'next';
import LegalAidServicesClient from './client-page';

export const metadata: Metadata = {
  title: 'Affordable Legal Aid Services | Legal Consultation & Documentation',
  description: 'Access affordable and free legal aid in India. Human Rights Affairs Trust provides expert guidance on FIRs, Domestic Violence, Labor Laws, and Government Schemes.',
  keywords: ['Legal Aid India', 'Free Legal Consultation', 'FIR Help', 'RTI Assistance', 'Pro Bono Lawyer India', 'Justice Shield Legal Aid'],
};

export default function LegalAidServicesPage() {
  return <LegalAidServicesClient />;
}

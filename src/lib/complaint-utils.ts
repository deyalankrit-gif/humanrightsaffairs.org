/**
 * @fileOverview Tactical utilities for the Case Management System.
 */

export function generateCaseId(index: number = 0): string {
  const year = new Date().getFullYear();
  const sequence = (index + 100).toString().padStart(4, '0');
  return `HRAT-CASE-${year}-${sequence}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'New Complaint': return 'bg-blue-500 text-white';
    case 'Under Legal Review': return 'bg-purple-600 text-white';
    case 'Investigation in Progress': return 'bg-amber-600 text-white';
    case 'Action Taken':
    case 'Resolved':
    case 'Closed': return 'bg-emerald-600 text-white';
    case 'Reopened': return 'bg-red-600 text-white';
    default: return 'bg-slate-500 text-white';
  }
}

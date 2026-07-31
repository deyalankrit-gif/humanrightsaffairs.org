/**
 * @fileOverview Institutional constants for the Complaint Case Management System.
 */

export const CASE_STATUSES = [
  "New Complaint",
  "Under Preliminary Review",
  "Assigned for Investigation",
  "Investigation in Progress",
  "Awaiting Documents",
  "Under Legal Review",
  "Mediation",
  "Recommendation Submitted",
  "Action Taken",
  "Closed",
  "Reopened"
] as const;

export type CaseStatus = (typeof CASE_STATUSES)[number];

export const REPORT_TEMPLATES = [
  { id: "preliminary_assessment", label: "1. Preliminary Assessment Report" },
  { id: "complaint_verification", label: "2. Complaint Verification Report" },
  { id: "investigation", label: "3. Investigation Report" },
  { id: "site_inspection", label: "4. Site Inspection Report" },
  { id: "witness_statement", label: "5. Witness Statement Report" },
  { id: "evidence_collection", label: "6. Evidence Collection Report" },
  { id: "progress_status", label: "7. Progress Status Report" },
  { id: "legal_opinion", label: "8. Legal Opinion Report" },
  { id: "mediation", label: "9. Mediation Report" },
  { id: "show_cause", label: "10. Show Cause Notice Report" },
  { id: "recommendation", label: "11. Recommendation Report" },
  { id: "final_investigation", label: "12. Final Investigation Report" },
  { id: "case_closure", label: "13. Case Closure Report" },
  { id: "violation_assessment", label: "14. Human Rights Violation Assessment Report" },
  { id: "authority_communication", label: "15. Authority Communication Report" },
  { id: "follow_up_inspection", label: "16. Follow-up Inspection Report" },
  { id: "compliance_verification", label: "17. Compliance Verification Report" },
  { id: "final_action_taken", label: "18. Final Action Taken Report" }
] as const;

export type ReportType = (typeof REPORT_TEMPLATES)[number]["id"];

export const CASE_PRIORITIES = ["High", "Medium", "Low"] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];

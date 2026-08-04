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

export const TASK_STATUSES = [
  "Pending",
  "In Progress",
  "Completed",
  "Returned"
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STANDARD_RESPONSIBILITIES = [
  "Collect Evidence",
  "Visit Incident Location",
  "Meet the Complainant",
  "Interview Witnesses",
  "Contact the Respondent",
  "Verify Documents",
  "Capture Photos/Videos",
  "Upload Evidence",
  "Submit Daily Progress",
  "Prepare Investigation Report",
  "Submit Final Report"
] as const;

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

/**
 * REPORT_GUIDANCE: Official procedural guidelines for template selection.
 */
export const REPORT_GUIDANCE: Record<ReportType, { purpose: string; useWhen: string; includes: string; outcome: string }> = {
  preliminary_assessment: {
    purpose: "Initial evaluation of complaint validity and institutional jurisdiction.",
    useWhen: "Immediately after receiving a new complaint from the public portal.",
    includes: "Basic facts, prima facie evidence check, and jurisdiction verification.",
    outcome: "Formal decision to accept for investigation or reject the claim."
  },
  complaint_verification: {
    purpose: "Confirming the identity of the complainant and the existence of the reported issue.",
    useWhen: "Before assigning specialized officers for field deployment.",
    includes: "Complainant KYC data, initial contact notes, and primary document authenticity check.",
    outcome: "Validated baseline for deployment of the investigative team."
  },
  investigation: {
    purpose: "Detailed technical record of active field investigative activities.",
    useWhen: "Throughout the active investigative phase of the case lifecycle.",
    includes: "Chronological log of field actions, interview summaries, and ground-level observations.",
    outcome: "Raw data repository for the final executive decision-making process."
  },
  site_inspection: {
    purpose: "Documenting specific physical findings from a visit to the incident location.",
    useWhen: "Directly following a physical on-site inspection or visit.",
    includes: "Geographical details, visual environmental observations, and local community context.",
    outcome: "Verified spatial evidence for situational analysis and evidence mapping."
  },
  witness_statement: {
    purpose: "Formal recording of statements and testimonies from relevant third parties.",
    useWhen: "After conducting structured interviews with identified witnesses.",
    includes: "Witness identity particulars, verbatim statements, and credibility assessment by the officer.",
    outcome: "Authenticated corroborative evidence to strengthen or challenge the complaint."
  },
  evidence_collection: {
    purpose: "Comprehensive cataloging and inventory of all secured physical and digital exhibits.",
    useWhen: "As and when material evidence is retrieved and secured by the team.",
    includes: "Description of photos, documents, and recordings with chain of custody details.",
    outcome: "A secure and audited index of evidence available for legal review."
  },
  progress_status: {
    purpose: "Providing a structured intermediate update on the status of the investigation.",
    useWhen: "At monthly intervals or upon specific request from the Complainant or Authority.",
    includes: "Summary of completed tactical milestones and identification of pending steps.",
    outcome: "Maintained institutional transparency for all stakeholders."
  },
  legal_opinion: {
    purpose: "Expert legal analysis of the case relative to BNS/BNSS and Constitutional statutes.",
    useWhen: "After evidence gathering is finalized but before issuing final recommendations.",
    includes: "Statutory references, analysis of judicial precedents, and evaluation of legal merit.",
    outcome: "Definitive legal framework for the final Commission Finding."
  },
  mediation: {
    purpose: "Documenting formal attempts to resolve the dispute through dialogue and settlement.",
    useWhen: "When parties agree to participate in an out-of-court resolution process.",
    includes: "Points of contention, terms of settlement, and signed participant consents.",
    outcome: "Successful non-litigation resolution and conflict termination."
  },
  show_cause: {
    purpose: "Formal institutional request for an explanation from the accused party.",
    useWhen: "When collected evidence identifies a specific violator requiring a response.",
    includes: "Specific allegations, evidence summary, and statutory deadline for a formal reply.",
    outcome: "Compliance with the principle of natural justice (Audi Alteram Partem)."
  },
  recommendation: {
    purpose: "Official proposal for specific administrative or legal action by the Trust.",
    useWhen: "After the investigation and legal review phases are fully concluded.",
    includes: "Executive summary of facts and specific proposed directives to government bodies.",
    outcome: "The foundational document for the Final Commission Directive."
  },
  final_investigation: {
    purpose: "The consolidated master record of the entire institutional investigation.",
    useWhen: "At the definitive conclusion of all field, technical, and legal activities.",
    includes: "Comprehensive synthesis of all previous reports, findings, and exhibits.",
    outcome: "The permanent archival documentation of the case's ground reality."
  },
  case_closure: {
    purpose: "Official termination of the investigative lifecycle in the registry.",
    useWhen: "When the case is successfully resolved or no further administrative action is possible.",
    includes: "Grounds for closure, final status summary, and archival storage location.",
    outcome: "Movement of the record from 'Active' to the 'Closed' permanent index."
  },
  violation_assessment: {
    purpose: "Specialized evaluation of specific rights infringements for external review.",
    useWhen: "For submission to statutory bodies like the NHRC, SHRC, or judicial courts.",
    includes: "Detailed mapping of infringed Constitutional Articles and human impact analysis.",
    outcome: "External institutional reporting for high-level statutory intervention."
  },
  authority_communication: {
    purpose: "Formal institutional correspondence with police or government administrations.",
    useWhen: "Requesting specific information or action from external state authorities.",
    includes: "Brief case summary, legal basis for the request, and demand for action.",
    outcome: "Effective inter-agency coordination for the protection of rights."
  },
  follow_up_inspection: {
    purpose: "Verifying the on-ground implementation of issued directives or settlements.",
    useWhen: "Typically 30 to 90 days after 'Action Taken' status is achieved.",
    includes: "Physical verification of compliance and status of rights restoration.",
    outcome: "Final verification of mission success and victim satisfaction."
  },
  compliance_verification: {
    purpose: "Internal audit of procedural and legal adherence in the case handling process.",
    useWhen: "During internal quality audits or as a final check before permanent closure.",
    includes: "Procedural checklist review and verification of all mandatory documentation.",
    outcome: "Institutional quality assurance and procedural integrity verification."
  },
  final_action_taken: {
    purpose: "Official summary of the tangible results achieved through Trust intervention.",
    useWhen: "To provide the Complainant with a final notification of the case outcome.",
    includes: "Result summary, details of secured rights, and any compensation obtained.",
    outcome: "Formal conclusion of the relationship with the Complainant for this case."
  }
};

export const CASE_PRIORITIES = ["High", "Medium", "Low"] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];

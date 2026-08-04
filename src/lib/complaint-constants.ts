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
export const REPORT_GUIDANCE: Record<ReportType, { 
  purpose: string; 
  useWhen: string; 
  evidence: string;
  mandatory: string;
  bestPractices: string;
  output: string;
  warnings?: string;
}> = {
  preliminary_assessment: {
    purpose: "Analyze the prima facie validity of the complaint and establish institutional jurisdiction.",
    useWhen: "Immediately upon receipt of a new submission from the public portal.",
    evidence: "Initial complaint text, submitted Aadhaar/Identity metadata, and automated duplicate check results.",
    mandatory: "Jurisdictional check (District/State), categorization of rights violated, and severity assessment.",
    bestPractices: "Conduct a cross-reference with the National Archives to ensure this isn't a repeated or sub-judice matter.",
    output: "A formal recommendation to either 'Assign for Investigation' or 'Reject' based on merit.",
    warnings: "Ensure that the victim's location falls within an active HRAT chapter's operational zone."
  },
  complaint_verification: {
    purpose: "Authenticate the complainant's identity and the baseline facts of the reported incident.",
    useWhen: "After preliminary acceptance but before field deployment of specialized officers.",
    evidence: "Verified contact logs, physical identity documents, and initial telephonic interview notes.",
    mandatory: "Verification of the Complainant's signature (physical or digital), valid mobile number check, and address confirmation.",
    bestPractices: "Use the 'Member Registry' to check if the complainant is a member seeking internal aid or a member of the public.",
    output: "A 'Verified Baseline' document that protects investigators from fraudulent or frivolous claims.",
    warnings: "Do not share verification results with the accused party at this stage."
  },
  investigation: {
    purpose: "Document the tactical lifecycle of field activities and objective fact-finding.",
    useWhen: "During the entire 'Investigation in Progress' phase of the case.",
    evidence: "Daily logs, field notes, physical observations, and preliminary findings from the site.",
    mandatory: "Chronological sequence of actions taken, list of officials involved, and encountered obstacles.",
    bestPractices: "Maintain a neutral, objective tone. Distinguish clearly between 'observed facts' and 'hearsay'.",
    output: "A detailed tactical log used to populate the case's central audit trail.",
    warnings: "All notes must be entered within 24 hours of the field activity to maintain temporal accuracy."
  },
  site_inspection: {
    purpose: "Record physical and environmental findings at the specific location of the incident.",
    useWhen: "Immediately following a physical visit to the incident venue by the team.",
    evidence: "GPS-tagged photographs, spot maps, measurements, and environmental descriptions.",
    mandatory: "Date and time of visit, physical characteristics of the site, and visibility/access conditions.",
    bestPractices: "Use the 'Evidence Vault' to upload high-fidelity visuals directly from the field via the investigator terminal.",
    output: "A 'Spatial Evidence Record' that anchors the narrative to a physical reality.",
    warnings: "Ensure safety protocols are met. If a site is hostile, request administrative support before entry."
  },
  witness_statement: {
    purpose: "Formally document the testimonies of third-party individuals relevant to the case.",
    useWhen: "After conducting structured interviews with identified witnesses or neighbors.",
    evidence: "Verbatim statements, witness identity proofs, and signed declarations.",
    mandatory: "Witness name, occupation, relationship to parties, and a clear statement of seen/heard facts.",
    bestPractices: "Record statements in the native language (e.g., Bengali) and provide an English translation for the central registry.",
    output: "Corroborative or contradictory exhibits used to build the preponderance of evidence.",
    warnings: "Ensure no coercion is used. Inform witnesses that false statements are subject to legal consequences."
  },
  evidence_collection: {
    purpose: "Create an audited inventory of all physical and digital exhibits retrieved during investigation.",
    useWhen: "As and when material evidence is secured and buffered in the Evidence Vault.",
    evidence: "Original documents, audio recordings, video clips, and seized material objects.",
    mandatory: "Source of evidence, date of retrieval, chain of custody details, and description of relevance.",
    bestPractices: "Label each item with the Docket Number and a sequential Exhibit Code (e.g., EXH-01).",
    output: "A secure index of evidence ready for scrutiny by the Legal Review Council.",
    warnings: "Digital evidence must be under 100KB per file for optimized registry synchronization."
  },
  progress_status: {
    purpose: "Provide stakeholders with a structured update on the current state of the investigation.",
    useWhen: "At 15-day intervals or when requested by the Complainant or a Superior Authority.",
    evidence: "Summary of completed tasks and a preview of pending procedural steps.",
    mandatory: "Current status, percentage of completion, and updated estimated time for resolution (ETA).",
    bestPractices: "Transparency reduces complainant anxiety. Use clear, non-technical language in the summary.",
    output: "A public-facing status update that keeps the Complainant informed without leaking sensitive data.",
    warnings: "Do not disclose specific investigative techniques or witness identities in this report."
  },
  legal_opinion: {
    purpose: "Analyze the gathered evidence against the frameworks of BNS, BNSS, and the Constitution of India.",
    useWhen: "After the fact-finding phase is completed by the field team.",
    evidence: "Final investigation report, exhibit index, and witness summary.",
    mandatory: "Specific sections of the law invoked, analysis of precedents, and evaluation of 'Prima Facie' proof.",
    bestPractices: "The opinion should be drafted by a qualified Advocate from the HRAT Legal Cell.",
    output: "A definitive 'Legal Merit Document' that guides the executive decision of the Trust.",
    warnings: "Ensure that any sub-judice matters are clearly flagged to avoid contempt of court."
  },
  mediation: {
    purpose: "Document formal attempts to resolve disputes through dialogue and mutual settlement.",
    useWhen: "When both parties agree to an out-of-court resolution process facilitated by the Trust.",
    evidence: "Consent forms, minutes of the mediation session, and agreed-upon terms of settlement.",
    mandatory: "Signatures of both parties, the mediator's summary, and specific timelines for implementation.",
    bestPractices: "Focus on 'Rights Restoration' rather than just 'Compromise'. Ensure the victim is not under duress.",
    output: "A 'Settlement Decree' that, once signed, terminates the investigative lifecycle.",
    warnings: "If mediation fails, the case must immediately transition back to active investigation."
  },
  show_cause: {
    purpose: "Demand a formal response from an identified violator based on gathered evidence.",
    useWhen: "When the investigation identifies a specific party responsible for a rights infringement.",
    evidence: "Summary of evidence identifying the violator and the specific allegations.",
    mandatory: "Accused's particulars, deadline for response (standard 7 days), and specific questions to be answered.",
    bestPractices: "Adhere to the Principle of Natural Justice by providing the accused a fair opportunity to be heard.",
    output: "A formal 'Notice to Accused' that becomes a critical part of the judicial audit trail.",
    warnings: "Failure to respond to a show-cause notice must be noted as a deliberate non-cooperation."
  },
  recommendation: {
    purpose: "Propose specific administrative or judicial actions to be taken based on findings.",
    useWhen: "At the conclusion of the 'Under Legal Review' stage.",
    evidence: "Full case file and the final Legal Opinion.",
    mandatory: "Executive summary, identified violations, and clear directives for the next action.",
    bestPractices: "Recommendations should be actionable, specific, and grounded in current government guidelines.",
    output: "The 'Operational Order' that defines exactly how the Trust will intervene in the matter.",
    warnings: "Ensure recommendations do not exceed the institutional mandate of the Trust."
  },
  final_investigation: {
    purpose: "Consolidate the complete investigative record into a single master document.",
    useWhen: "Before moving a case to 'Action Taken' or 'Closed' status.",
    evidence: "Synthesized data from all previous 11 report categories.",
    mandatory: "Full case history, evidentiary analysis, final conclusions, and executive signatures.",
    bestPractices: "Use a structured heading system. This is the primary document used for statutory audits.",
    output: "A high-fidelity 'Case Archive' that serves as the permanent record of the mission.",
    warnings: "Double-check that all 'Docket Numbers' and 'Reference IDs' are consistent throughout."
  },
  case_closure: {
    purpose: "Formalize the termination of the investigative lifecycle and rights restoration.",
    useWhen: "When the mission objectives are met or no further action is legally possible.",
    evidence: "Proof of resolution (e.g., release order, compensation receipt, apology letter).",
    mandatory: "Grounds for closure, victim's satisfaction statement (if available), and archival location.",
    bestPractices: "Include a 'Lessons Learned' note to help the organization improve future investigative protocols.",
    output: "A 'Closure Certificate' that moves the record to the permanent 'Closed Cases' vault.",
    warnings: "Closed cases can only be reopened by the Root Administrator upon new evidentiary discovery."
  },
  violation_assessment: {
    purpose: "Map specific case findings to the Universal Declaration of Human Rights and the Indian Constitution.",
    useWhen: "For cases being escalated to the NHRC, SHRC, or International Human Rights bodies.",
    evidence: "Specific violation points and their impact on the victim's life and liberty.",
    mandatory: "Correlation between case facts and specific Constitutional Articles (e.g., Article 21).",
    bestPractices: "Quantify the violation where possible (e.g., number of days in illegal custody).",
    output: "An 'Institutional Brief' used for high-level advocacy and government liaison.",
    warnings: "Ensure all data is strictly verified; inaccuracies at this level damage institutional credibility."
  },
  authority_communication: {
    purpose: "Document official correspondence between the Trust and external government/police authorities.",
    useWhen: "Whenever the Trust requests action, information, or intervention from the State.",
    evidence: "Official letters, emails, or representations sent to the DM, SP, or other officials.",
    mandatory: "Authority designation, reference number of the letter, and the expected action from the State.",
    bestPractices: "Attach a copy of the 'Official Representation' format for consistency.",
    output: "A record of the Trust's advocacy efforts in the administrative sphere.",
    warnings: "Ensure all communications are respectful, formal, and within the scope of Indian law."
  },
  follow_up_inspection: {
    purpose: "Verify the on-ground sustainability of the resolution and prevent rights relapse.",
    useWhen: "30 to 90 days after the 'Action Taken' status has been established.",
    evidence: "Post-resolution site visit notes and victim's current status report.",
    mandatory: "Verification of whether court/Trust directives are still being followed.",
    bestPractices: "Conduct follow-ups unannounced to see the true ground reality of rights restoration.",
    output: "A 'Sustainability Audit' that confirms the long-term success of the mission.",
    warnings: "If a relapse is detected, the case should be immediately recommended for 'Reopening'."
  },
  compliance_verification: {
    purpose: "Audit the internal procedural adherence of the investigative team to Trust standards.",
    useWhen: "Before case closure or during internal quality control audits.",
    evidence: "Internal checklist and log of officer adherence to timelines.",
    mandatory: "Check for mandatory signatures, presence of required exhibits, and timeline compliance.",
    bestPractices: "The auditor should be an independent officer not involved in the original investigation.",
    output: "An 'Internal Audit Grade' that ensures the procedural integrity of the National Registry.",
    warnings: "Identified lapses must be corrected before the case can be moved to the final 'Closed' vault."
  },
  final_action_taken: {
    purpose: "Officially communicate the tangible outcomes of the investigation to the Complainant.",
    useWhen: "As the final step before moving the case to 'Closed' status.",
    evidence: "Summary of results achieved and details of the final directive issued.",
    mandatory: "Statement of action, description of the resolution, and instructions for future contact.",
    bestPractices: "The report should be empathetic and clearly state how the Trust has fulfilled its promise to the victim.",
    output: "A 'Mission Completion Notice' that provides closure to the aggrieved citizen.",
    warnings: "Ensure the Complainant understands their right to appeal if they are unsatisfied with the result."
  }
};

export const CASE_PRIORITIES = ["High", "Medium", "Low"] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];

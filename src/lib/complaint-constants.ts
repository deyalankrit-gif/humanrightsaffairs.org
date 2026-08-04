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
 * Restored: Complete detailed briefings for all 18 reports.
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
    purpose: "Analyze the prima facie validity of the complaint and establish institutional jurisdiction.\n• Determine if the allegation constitutes a Human Rights violation.\n• Assess the urgency and safety risks for the victim.",
    useWhen: "Immediately upon receipt of a new submission from the public portal.",
    evidence: "• Initial complaint text and supporting citizen uploads.\n• Aadhaar/Identity metadata for complainant verification.\n• Automated duplicate check results from the registry.",
    mandatory: "• Categorization of rights (e.g., Art 21, Women's Rights).\n• Severity assessment (Critical/High/Medium).\n• Verified jurisdictional node (District/State).",
    bestPractices: "Conduct a cross-reference with the National Archives to ensure this isn't a repeated or sub-judice matter currently before a Court of Law.",
    output: "A formal recommendation to either 'Assign for Investigation' or 'Reject' based on merit and jurisdiction.",
    warnings: "Ensure that the victim's location falls within an active HRAT chapter's operational zone to ensure field feasibility."
  },
  complaint_verification: {
    purpose: "Authenticate the complainant's identity and the baseline facts of the reported incident to prevent frivolous filings.\n• Establish a direct secure line of communication.",
    useWhen: "After preliminary acceptance but before field deployment of specialized officers.",
    evidence: "• Verified contact logs from phone/VOIP verification.\n• Physical identity documents cross-checked against government databases.\n• Initial interview notes.",
    mandatory: "• Verification of the Complainant's signature (physical or digital).\n• Active mobile number confirmation via OTP or callback.\n• Baseline address verification.",
    bestPractices: "Check the 'Member Registry' to determine if the complainant is an existing member seeking internal aid or a general citizen.",
    output: "A 'Verified Baseline' document that protects field investigators from fraudulent or misleading claims.",
    warnings: "Strict Protocol: Do not share verification results or the complainant's specific location with the accused party at this stage."
  },
  investigation: {
    purpose: "Document the tactical lifecycle of field activities and objective fact-finding.\n• Create a daily audited log of investigative movements.",
    useWhen: "During the entire 'Investigation in Progress' phase of the case.",
    evidence: "• Field tactical logs and investigator observations.\n• Preliminary findings from environment and witness interactions.\n• Technical metadata from investigator terminal.",
    mandatory: "• Chronological sequence of all actions taken.\n• List of all officials involved in the field mission.\n• Documented obstacles or non-cooperation from local bodies.",
    bestPractices: "Maintain a neutral, objective tone. Distinguish clearly between 'observed facts' (seen/heard by officer) and 'hearsay' (reported by others).",
    output: "A detailed tactical log used to populate the case's central audit trail for supervisory review.",
    warnings: "Compliance: All notes must be entered into the system within 24 hours of the field activity to maintain temporal accuracy."
  },
  site_inspection: {
    purpose: "Record physical and environmental findings at the specific location of the incident.\n• Authenticate the 'Scene of Violation'.",
    useWhen: "Immediately following a physical visit to the incident venue by the investigation team.",
    evidence: "• GPS-tagged photographs and video footage.\n• Spot maps drawn on-site.\n• Physical measurements and environmental descriptions.",
    mandatory: "• Date and precise time of visit.\n• Detailed physical characteristics of the site.\n• Visibility and access conditions at the time of incident.",
    bestPractices: "Use the 'Evidence Vault' to upload high-fidelity visuals directly from the field via the investigator terminal for instant sync.",
    output: "A 'Spatial Evidence Record' that anchors the narrative to a physical reality and prevents witness tampering.",
    warnings: "Safety First: Ensure safety protocols are met. If a site is hostile, request local administrative or police support before entry."
  },
  witness_statement: {
    purpose: "Formally document the testimonies of third-party individuals relevant to the case.\n• Establish corroborating evidence through verbatim reporting.",
    useWhen: "After conducting structured interviews with identified witnesses, neighbors, or colleagues.",
    evidence: "• Verbatim written or recorded statements.\n• Witness identity proofs and contact metadata.\n• Signed non-coercion declarations.",
    mandatory: "• Witness name, occupation, and relationship to parties.\n• Clear statement of seen/heard facts without leading questions.\n• Investigator certification of statement authenticity.",
    bestPractices: "Record statements in the witness's native language (e.g., Bengali/Hindi) and provide an English translation for the central registry.",
    output: "Corroborative or contradictory exhibits used to build the preponderance of evidence for legal review.",
    warnings: "Legal Caution: Ensure no coercion is used. Inform witnesses that false statements in an official audit are subject to legal consequences."
  },
  evidence_collection: {
    purpose: "Create an audited inventory of all physical and digital exhibits retrieved during the investigation.\n• Maintain strict chain of custody.",
    useWhen: "As and when material evidence is secured and buffered in the Evidence Vault.",
    evidence: "• Original documents, medical records, or receipts.\n• Audio recordings and video clips.\n• Seized material objects or photographs of the same.",
    mandatory: "• Source of evidence and date of retrieval.\n• Chain of custody details (who handled it and when).\n• Description of relevance to the specific violation points.",
    bestPractices: "Label each item with the Docket Number and a unique sequential Exhibit Code (e.g., EXH-01, EXH-02).",
    output: "A secure, encrypted index of evidence ready for scrutiny by the Legal Review Council.",
    warnings: "File Constraints: Digital evidence must be under 100KB per file for optimized registry synchronization across regional nodes."
  },
  progress_status: {
    purpose: "Provide stakeholders with a structured, transparent update on the current state of the investigation.",
    useWhen: "At 15-day intervals or when specifically requested by the Complainant or a Superior Authority.",
    evidence: "• Summary of completed tasks from the investigation log.\n• Preview of pending procedural steps and bottlenecks.",
    mandatory: "• Current status code and percentage of completion.\n• List of verified facts vs. pending verification points.\n• Updated estimated time for resolution (ETA).",
    bestPractices: "Transparency reduces complainant anxiety. Use clear, non-technical language to explain delays if they occur.",
    output: "A public-facing status update that keeps the Complainant informed without leaking sensitive investigative techniques.",
    warnings: "Confidentiality: Do not disclose specific investigative techniques, confidential sources, or witness identities in this report."
  },
  legal_opinion: {
    purpose: "Analyze the gathered evidence against the frameworks of BNS, BNSS, and the Constitution of India.",
    useWhen: "After the fact-finding phase is completed by the field team and evidence is secured.",
    evidence: "• Final investigation report and witness summaries.\n• Exhibit index and cross-references to applicable statutes.",
    mandatory: "• Specific sections of the law invoked (e.g., BNS Section 74).\n• Analysis of judicial precedents (Case Law).\n• Evaluation of 'Prima Facie' proof vs. reasonable doubt.",
    bestPractices: "This opinion must be drafted or reviewed by a qualified Advocate from the HRAT Legal Cell for statutory validity.",
    output: "A definitive 'Legal Merit Document' that guides the final executive decision of the Trust.",
    warnings: "Contempt Risk: Ensure that any sub-judice matters are clearly flagged to avoid unauthorized institutional interference."
  },
  mediation: {
    purpose: "Document formal attempts to resolve disputes through dialogue and mutual settlement.",
    useWhen: "When both parties agree to an out-of-court resolution process facilitated by the Trust.",
    evidence: "• Signed consent forms from both parties.\n• Minutes of the mediation session.\n• Agreed-upon terms of settlement and compensation.",
    mandatory: "• Signatures of parties and two witnesses.\n• Mediator's summary of the resolution.\n• Specific timelines for implementation of the settlement.",
    bestPractices: "Focus on 'Rights Restoration' rather than just compromise. Ensure the victim is not under duress or pressure to settle.",
    output: "A 'Settlement Decree' that, once implemented, formalizes the termination of the investigative lifecycle.",
    warnings: "Failed Mediation: If mediation fails, the case must immediately transition back to active 'Investigation' status."
  },
  show_cause: {
    purpose: "Demand a formal response from an identified violator based on gathered evidence.\n• Uphold the 'Opportunity to be Heard'.",
    useWhen: "When the investigation identifies a specific party responsible for a documented rights infringement.",
    evidence: "• Summary of findings identifying the respondent.\n• Specific allegations supported by evidence in the vault.",
    mandatory: "• Accused party's particulars and contact details.\n• 7-day deadline for response.\n• Clear list of questions regarding the alleged violation.",
    bestPractices: "Adhere to the Principle of Natural Justice by providing the accused a fair and transparent opportunity to explain their actions.",
    output: "A formal 'Notice to Accused' that becomes a critical part of the judicial audit trail.",
    warnings: "Non-Cooperation: Failure to respond to a show-cause notice must be noted as a deliberate non-cooperation in the final report."
  },
  recommendation: {
    purpose: "Propose specific administrative or judicial actions to be taken based on investigative findings.",
    useWhen: "At the conclusion of the 'Under Legal Review' stage of the case lifecycle.",
    evidence: "• Full case file and the final Legal Opinion.\n• Assessment of the victim's current safety and needs.",
    mandatory: "• Executive summary of the case.\n• Identified violations of specific laws/articles.\n• Clear directives for the next action (e.g., Legal Notice, DM Representation).",
    bestPractices: "Recommendations should be actionable, specific, and grounded in current government guidelines and trust bylaws.",
    output: "The 'Operational Order' that defines exactly how the Trust will intervene and advocate for the victim.",
    warnings: "Mandate Scope: Ensure recommendations do not exceed the institutional mandate of the Trust or violate privacy laws."
  },
  final_investigation: {
    purpose: "Consolidate the complete investigative record into a single master document for archival and audit purposes.",
    useWhen: "The final step before moving a case to 'Action Taken' or 'Closed' status.",
    evidence: "• Synthesized data from all previous 11 report categories.\n• Final exhibits and witness declarations.",
    mandatory: "• Full case history and evidentiary analysis.\n• Final conclusions and executive signatures.\n• Verification QR code for digital authenticity.",
    bestPractices: "Use a structured heading system. This is the primary document used for statutory audits and donor transparency.",
    output: "A high-fidelity 'Case Archive' that serves as the permanent record of the organizational mission.",
    warnings: "Consistency: Double-check that all 'Docket Numbers' and 'Reference IDs' are consistent throughout the 50+ pages if applicable."
  },
  case_closure: {
    purpose: "Formalize the termination of the investigative lifecycle and confirm rights restoration.",
    useWhen: "When mission objectives are met or no further action is legally or tactically possible.",
    evidence: "• Proof of resolution (e.g., release order, compensation receipt).\n• Final victim satisfaction statement (if available).",
    mandatory: "• Legal grounds for closure.\n• Archival location reference in the National Registry.\n• Final approval from the Central Council.",
    bestPractices: "Include a 'Lessons Learned' section to help the organization improve future field investigative protocols.",
    output: "A 'Closure Certificate' that moves the record to the permanent, read-only 'Closed Cases' vault.",
    warnings: "Reopening: Closed cases can only be reopened by the Root Administrator upon discovery of significant new evidence."
  },
  violation_assessment: {
    purpose: "Map specific case findings to the Universal Declaration of Human Rights and the Indian Constitution.",
    useWhen: "For cases being escalated to the NHRC, SHRC, or International Human Rights bodies for intervention.",
    evidence: "• Specific violation points and documented impact on life/liberty.\n• Comparative analysis with UDHR articles.",
    mandatory: "• Correlation between case facts and specific Constitutional Articles (e.g., Article 21).\n• Expert testimony or medical evidence of harm.",
    bestPractices: "Quantify the violation where possible (e.g., number of hours of illegal detention or value of lost property).",
    output: "An 'Institutional Brief' used for high-level advocacy and government liaison at the Ministerial level.",
    warnings: "Veracity: Ensure all data is strictly verified; inaccuracies at this level damage institutional credibility with the State."
  },
  authority_communication: {
    purpose: "Document official correspondence between the Trust and external government or police authorities.",
    useWhen: "Whenever the Trust requests action, information, or urgent intervention from the State.",
    evidence: "• Official letters, emails, or representations sent to the DM, SP, or SDPO.\n• Acknowledgment receipts from government offices.",
    mandatory: "• Target authority designation and office location.\n• Reference number of the communication.\n• Expected action or timeline from the State.",
    bestPractices: "Attach a copy of the 'Official Representation' format for consistency and future reference in the audit trail.",
    output: "A permanent record of the Trust's advocacy efforts and the State's responsiveness to rights issues.",
    warnings: "Formalism: Ensure all communications are respectful, formal, and strictly within the scope of Indian law."
  },
  follow_up_inspection: {
    purpose: "Verify the on-ground sustainability of the resolution and prevent rights relapse.",
    useWhen: "30 to 90 days after the 'Action Taken' status has been established in the case file.",
    evidence: "• Post-resolution site visit notes and photographs.\n• Victim's current status report and fresh testimonials.",
    mandatory: "• Verification of whether court/Trust directives are still being followed by the parties.\n• Current risk assessment for the victim.",
    bestPractices: "Conduct follow-up inspections unannounced to observe the true ground reality of rights restoration.",
    output: "A 'Sustainability Audit' that confirms the long-term success of the organizational mission.",
    warnings: "Relapse: If a relapse or retaliation is detected, the case must be immediately recommended for 'Urgent Reopening'."
  },
  compliance_verification: {
    purpose: "Audit the internal procedural adherence of the investigative team to Trust standards.",
    useWhen: "Mandatory step before case closure or during periodic internal quality control audits.",
    evidence: "• Internal compliance checklist and log of officer adherence to timelines.\n• Completeness check of the Evidence Vault.",
    mandatory: "• Verification of mandatory signatures.\n• Presence of all required exhibits for the selected case category.\n• Timeline compliance audit.",
    bestPractices: "The auditor should be an independent officer (Internal Auditor) not involved in the original investigation team.",
    output: "An 'Internal Audit Grade' that ensures the procedural integrity of the National Rights Registry.",
    warnings: "Lapses: Identified procedural lapses must be corrected before the case can be moved to the final 'Closed' vault."
  },
  final_action_taken: {
    purpose: "Officially communicate the tangible outcomes of the investigation and the Trust's intervention to the Complainant.",
    useWhen: "The final step before moving the case to 'Closed' status in the terminal.",
    evidence: "• Summary of results achieved and details of the final directive issued to authorities.\n• Resolution proof.",
    mandatory: "• Clear statement of action taken by HRAT.\n• Detailed description of the resolution achieved.\n• Instructions for future contact or follow-up if required.",
    bestPractices: "The report should be empathetic and clearly state how the Trust has fulfilled its promise to the victim.",
    output: "A 'Mission Completion Notice' that provides legal and emotional closure to the aggrieved citizen.",
    warnings: "Appeals: Ensure the Complainant understands their right to request a review if they are unsatisfied with the achieved result."
  }
};

export const CASE_PRIORITIES = ["High", "Medium", "Low"] as const;
export type CasePriority = (typeof CASE_PRIORITIES)[number];

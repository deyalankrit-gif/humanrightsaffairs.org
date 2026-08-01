
/**
 * @fileOverview Institutional Manual Registry
 * Contains the high-fidelity documentation for all HRAT administrative nodes.
 */

export type ManualSection = {
  id: string;
  title: string;
  subtitle: string;
  instructions: string[];
  tips: string[];
  mandates?: string[];
};

export const MANUAL_DATA: Record<string, ManualSection> = {
  "/internal/analytics": {
    id: "donations-analytics",
    title: "Donation Analytics",
    subtitle: "Financial Inflow Oversight",
    instructions: [
      "Monitor real-time revenue trends via the Revenue Timeline.",
      "Review the Master Contribution Ledger for all public and manual donations.",
      "Use the 'Record Manual Donation' button to log offline contributions.",
      "Verify 80G tax exemption eligibility for high-ticket donors."
    ],
    tips: [
      "The 'Avg Ticket' metric helps estimate public sentiment and campaign reach.",
      "Filter the ledger to quickly identify cash vs. digital inflows."
    ]
  },
  "/internal/member-analytics": {
    id: "member-analytics",
    title: "Member Analytics",
    subtitle: "Personnel Demographic Intelligence",
    instructions: [
      "Audit the geographic reach across various Indian states.",
      "Monitor the 'Term Oversight' section for upcoming membership expirations.",
      "Review gender and level distribution to ensure jurisdictional balance.",
      "Identify the renewal rate to assess member loyalty and retention."
    ],
    tips: [
      "The 30-day warning system is automated. No manual flagging required.",
      "District level committee growth is a primary KPI for expansion."
    ]
  },
  "/internal/public-complaints": {
    id: "complaints-registry",
    title: "Public Complaints Registry",
    subtitle: "Human Rights Case Management",
    instructions: [
      "Track every submission via its unique Token and Case ID.",
      "Use the status filter to manage the investigative lifecycle.",
      "Assign cases to investigators from the centralized pool.",
      "Monitor 'Minor at Risk' flags for immediate high-priority intervention."
    ],
    tips: [
      "Case IDs are sequential and generated upon initial triage.",
      "Search by Complainant name or Token for rapid retrieval."
    ]
  },
  "/internal/public-complaints/[id]": {
    id: "case-investigation",
    title: "Case Hub",
    subtitle: "Tactical Investigation Terminal",
    instructions: [
      "Assign a team of up to 6 officials in the 'Investigation Hub'.",
      "Log detailed observations for each specific stage of investigation.",
      "Record formal 'Considerations' from District, State, or National councils.",
      "Upload verified findings, audio, and documents to the Evidence Vault.",
      "Use 'Commission Findings' to finalize the case and issue directives."
    ],
    tips: [
      "Every timeline entry automatically notifies the complainant via email.",
      "You can manually retry failed email transmissions from the timeline.",
      "The Evidence Vault has a 300KB safety limit for optimized database sync."
    ]
  },
  "/internal/finance/vms": {
    id: "vms-terminal",
    title: "Voucher Management System",
    subtitle: "Digital Audit & Disbursement Node",
    instructions: [
      "Generate new financial instruments (Vouchers) for all transactions.",
      "Vouchers start as 'Draft' or 'Pending Verification'.",
      "Review recent instruments and their flow (Inflow vs. Outflow).",
      "Monitor the 'Workflow Status' to see items awaiting authorization."
    ],
    tips: [
      "Approval of a voucher atomically updates the General Ledger.",
      "Use the VMS Terminal for all institutional spending to ensure 100% audit accuracy."
    ]
  },
  "/internal/finance/vms/new": {
    id: "voucher-generation",
    title: "Generate Instrument",
    subtitle: "Voucher Entry Protocol",
    instructions: [
      "Select the appropriate Voucher Category (Payment, Receipt, etc.).",
      "Input valid amount; the system will auto-generate the 'Amount in Words'.",
      "Assign to an 'Account Head' based on the institutional budget.",
      "Provide a clear 'Narration' for future audits.",
      "Save as 'Draft' for review or 'Submit' for verification."
    ],
    tips: [
      "The Financial Year is automatically calculated based on the April-March cycle.",
      "Voucher IDs include codes like 'PV' (Payment) or 'RV' (Receipt) for easy indexing."
    ]
  },
  "/internal/kit-management": {
    id: "kit-logistics",
    title: "Kit & Asset Management",
    subtitle: "Personnel Material Tracking",
    instructions: [
      "Select a member profile to manage their entitled logistics.",
      "Check items (ID Card, Badge, Lanyard) as they are issued.",
      "Log the 'Distribution Trail' including Courier Ref and Delivery Status.",
      "Update 'Settings' to define mandatory items per member category."
    ],
    tips: [
      "Issuing a kit item automatically decrements the stock in the Material System.",
      "Office-bearing members typically have access to more extensive kits like car plates."
    ]
  },
  "/internal/material-management": {
    id: "material-registry",
    title: "Material System",
    subtitle: "Master Asset Registry",
    instructions: [
      "Register all institutional assets and logistical supplies.",
      "Set 'Low Stock Thresholds' to receive alerts when supplies are low.",
      "Assign items to specific 'Operational Nodes' (Locations).",
      "Link materials to authorized vendors for easier procurement."
    ],
    tips: [
      "Mark items as 'Kit Components' to enable synchronization with the Kit module.",
      "Use the SKU field to match with physical inventory barcodes."
    ]
  },
  "/internal/roles": {
    id: "access-governance",
    title: "Access Roles",
    subtitle: "Security & Provisioning Terminal",
    instructions: [
      "This is a Root-Exclusive node for managing personnel clearance.",
      "Provision new staff by creating their digital identity (Email/Password).",
      "Toggle individual module access per user in the registry.",
      "Audit 'Last Login' and 'UID' linkage for all officials."
    ],
    tips: [
      "Passwords are encrypted via Firebase Auth and not stored in the database.",
      "Root administrators have bypass permissions for all modules."
    ],
    mandates: [
      "Never share Root credentials.",
      "Periodically audit the registry for inactive personnel."
    ]
  },
  "/internal/members": {
    id: "member-directory",
    title: "Secure Registry",
    subtitle: "Personnel Contact Management",
    instructions: [
      "Search the master force database by name, ID, or location.",
      "Commission new members through the 'UserPlus' terminal.",
      "Filter by Council Level (National, State, District) to manage regions.",
      "Access individual 'Profiles' to manage documents and ID cards."
    ],
    tips: [
      "The member list automatically excludes 'Demi/Simulated' records.",
      "Clicking a profile allows you to generate ID Cards, Certificates, and Appointment Letters."
    ]
  },
  "/internal/current-news": {
    id: "news-governance",
    title: "News Governance",
    subtitle: "Institutional Broadcast Control",
    instructions: [
      "Manage the headlines displayed on the public homepage.",
      "Trigger an 'AI Harvest Audit' to fetch the latest legal/human rights news.",
      "Authorize suggestions to push them live to the public portal.",
      "Add manual entries for official Trust announcements."
    ],
    tips: [
      "The system runs an autonomous background sync every 2 hours.",
      "Prioritize 'West Bengal' scope for regional resonance."
    ]
  },
  "/internal/meetings": {
    id: "meetings-registry",
    title: "Meeting Governance",
    subtitle: "Official Assembly Records",
    instructions: [
      "Schedule new assemblies and notify leadership.",
      "Tag officials from the rank-sorted leadership pool.",
      "Record official 'Minutes & Resolutions' after the meeting conclude.",
      "Update status to 'Completed' to move record to history."
    ],
    tips: [
      "Meeting records are public-facing for institutional transparency.",
      "Use the 'Minutes' field to formalize executive decisions."
    ]
  }
};

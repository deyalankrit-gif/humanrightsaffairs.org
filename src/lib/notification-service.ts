'use server';

/**
 * @fileOverview Institutional Notification Hub
 * Manages the dispatch of high-priority alerts to administrative personnel.
 */

export async function sendComplaintNotification(payload: {
  complainantName: string;
  token: string;
  timestamp: string;
}) {
  const ADMIN_PHONE = "+919830983392";
  const message = `[HRAT ALERT] New Complaint Received.
  
Ref ID: ${payload.token}
Complainant: ${payload.complainantName}
Date/Time: ${payload.timestamp}

Please audit the Public Complaints terminal for investigation.`;

  try {
    // 🛡️ SECURITY AUDIT: In a production environment, this would integrate with
    // a verified SMS gateway (e.g., Twilio, MSG91) using secure environment variables.
    // For the current prototype, we log the dispatch to the server terminal.
    
    console.log(`[NOTIFICATION-DISPATCH] Target: ${ADMIN_PHONE}`);
    console.log(`[MESSAGE-BODY]:\n${message}`);

    // Simulate an external API call latency
    await new Promise(resolve => setTimeout(resolve, 300));

    return { success: true };
  } catch (error) {
    // 🛡️ GRACEFUL DEGRADATION: Errors in notification dispatch must not 
    // compromise the primary database write or user experience.
    console.error("[NOTIFICATION-FAILURE] Could not reach administrative terminal:", error);
    return { success: false };
  }
}

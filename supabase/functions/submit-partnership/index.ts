import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnershipApplication {
  companyName: string;
  industrySector: string;
  websiteUrl: string;
  headquarters: string;
  yearEstablished: string;
  companySize: string;
  contactName: string;
  jobTitle: string;
  email: string;
  phone: string;
  alternativeContact?: string;
  companyOverview: string;
  keyProducts: string;
  targetSegments: string;
  partnershipObjectives: string;
  integrationModel: string;
  expectedValue: string;
  comments?: string;
}

// Helper function to append data to Google Sheets
async function appendToGoogleSheets(data: PartnershipApplication): Promise<boolean> {
  const clientEmail = Deno.env.get("GOOGLE_SHEETS_CLIENT_EMAIL");
  const privateKey = Deno.env.get("GOOGLE_SHEETS_PRIVATE_KEY");
  const spreadsheetId = Deno.env.get("GOOGLE_SHEETS_SPREADSHEET_ID");

  if (!clientEmail || !privateKey || !spreadsheetId) {
    console.log("Google Sheets credentials not configured, skipping...");
    return false;
  }

  try {
    // Create JWT for Google Sheets API
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    // Base64 encode
    const base64Header = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const base64Payload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    
    // Format private key
    const formattedKey = privateKey.replace(/\\n/g, "\n");
    
    // Import the private key
    const pemContent = formattedKey.replace(/-----BEGIN PRIVATE KEY-----/g, "").replace(/-----END PRIVATE KEY-----/g, "").replace(/\s/g, "");
    const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));
    
    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryKey,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Sign the JWT
    const encoder = new TextEncoder();
    const signatureInput = encoder.encode(`${base64Header}.${base64Payload}`);
    const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, signatureInput);
    const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    
    const jwt = `${base64Header}.${base64Payload}.${base64Signature}`;

    // Get access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Prepare row data
    const rowData = [
      new Date().toISOString(),
      data.companyName,
      data.industrySector,
      data.websiteUrl,
      data.headquarters,
      data.yearEstablished,
      data.companySize,
      data.contactName,
      data.jobTitle,
      data.email,
      data.phone,
      data.alternativeContact || "",
      data.companyOverview,
      data.keyProducts,
      data.targetSegments,
      data.partnershipObjectives,
      data.integrationModel,
      data.expectedValue,
      data.comments || "",
      "Pending Review",
    ];

    // Append to sheet
    const sheetsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:T:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values: [rowData] }),
      }
    );

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      console.error("Google Sheets error:", errorText);
      return false;
    }

    console.log("Successfully appended to Google Sheets");
    return true;
  } catch (error) {
    console.error("Error appending to Google Sheets:", error);
    return false;
  }
}

// Send email notification using Resend API
async function sendEmailNotification(data: PartnershipApplication): Promise<boolean> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  
  if (!resendApiKey) {
    console.log("RESEND_API_KEY not configured, skipping email...");
    return false;
  }

  try {
    // Send notification to admin
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Perfect Money <onboarding@resend.dev>",
        to: ["admin@perfectmoney.io"],
        subject: `New Partnership Application: ${data.companyName}`,
        html: `
          <h1>New Partnership Application Received</h1>
          <h2>Company Information</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company Name:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.companyName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Industry:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.industrySector}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Website:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="${data.websiteUrl}">${data.websiteUrl}</a></td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Headquarters:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.headquarters}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Year Established:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.yearEstablished}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Company Size:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.companySize}</td></tr>
          </table>
          
          <h2>Contact Details</h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Contact Person:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.contactName}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Position:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.jobTitle}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Phone:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td></tr>
          </table>
          
          <h2>Business Overview</h2>
          <p><strong>Company Overview:</strong> ${data.companyOverview}</p>
          <p><strong>Key Products/Services:</strong> ${data.keyProducts}</p>
          <p><strong>Target Segments:</strong> ${data.targetSegments}</p>
          
          <h2>Partnership Proposal</h2>
          <p><strong>Objectives:</strong> ${data.partnershipObjectives}</p>
          <p><strong>Integration Model:</strong> ${data.integrationModel}</p>
          <p><strong>Expected Value:</strong> ${data.expectedValue}</p>
          
          ${data.comments ? `<h2>Additional Comments</h2><p>${data.comments}</p>` : ""}
          
          <hr>
          <p style="color: #666; font-size: 12px;">Application submitted at ${new Date().toISOString()}</p>
        `,
      }),
    });

    console.log("Admin notification sent:", await adminEmailResponse.json());

    // Send confirmation to applicant
    const confirmationResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Perfect Money <onboarding@resend.dev>",
        to: [data.email],
        subject: "Partnership Application Received - Perfect Money",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc2626;">Thank You for Your Partnership Application</h1>
            <p>Dear ${data.contactName},</p>
            <p>We have successfully received your partnership application for <strong>${data.companyName}</strong>.</p>
            <p>Our partnership team will review your application and contact you within 5-7 business days.</p>
            
            <h3>Application Summary:</h3>
            <ul>
              <li><strong>Company:</strong> ${data.companyName}</li>
              <li><strong>Industry:</strong> ${data.industrySector}</li>
              <li><strong>Submitted:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            
            <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>Perfect Money Partnership Team</p>
            
            <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply directly to this email.</p>
          </div>
        `,
      }),
    });

    console.log("Confirmation email sent:", await confirmationResponse.json());
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PartnershipApplication = await req.json();
    console.log("Received partnership application:", data.companyName);

    // Validate required fields
    if (!data.companyName || !data.email || !data.contactName) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Process in parallel
    const [sheetsResult, emailResult] = await Promise.all([
      appendToGoogleSheets(data),
      sendEmailNotification(data),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        sheetsUpdated: sheetsResult,
        emailSent: emailResult,
        message: "Partnership application submitted successfully",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error processing partnership application:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

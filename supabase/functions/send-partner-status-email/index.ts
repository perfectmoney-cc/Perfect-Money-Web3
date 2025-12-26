import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerStatusEmailRequest {
  email: string;
  name: string;
  status: "approved" | "rejected";
  tier?: string;
  reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const { email, name, status, tier, reason }: PartnerStatusEmailRequest = await req.json();

    const isApproved = status === "approved";
    
    const subject = isApproved 
      ? "🎉 Your Partnership Application Has Been Approved!"
      : "Partnership Application Update";

    const html = isApproved
      ? `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #E53E3E, #c53030); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .badge { display: inline-block; background: #22c55e; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
            .tier-badge { display: inline-block; background: ${tier === 'Platinum' ? '#8b5cf6' : tier === 'Gold' ? '#eab308' : tier === 'Silver' ? '#6b7280' : '#f97316'}; color: white; padding: 5px 15px; border-radius: 20px; margin-top: 10px; }
            .cta { display: inline-block; background: #E53E3E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${name}</strong>,</p>
              <p>We are thrilled to inform you that your partnership application with <strong>PerfectMoney Global Exchanger Network</strong> has been <span class="badge">APPROVED</span>!</p>
              ${tier ? `<p>You have been assigned to the <span class="tier-badge">${tier}</span> tier.</p>` : ''}
              <p>As a partner, you will now have access to:</p>
              <ul>
                <li>Revenue sharing from transactions</li>
                <li>Exclusive partner dashboard</li>
                <li>Priority support</li>
                <li>Marketing materials and tools</li>
                <li>Your location on our global partner map</li>
              </ul>
              <p>Welcome to the PerfectMoney family! 🚀</p>
              <a href="https://perfectmoney.com/dashboard/partners" class="cta">Access Partner Dashboard</a>
            </div>
            <div class="footer">
              <p>© 2024 PerfectMoney. All rights reserved.</p>
              <p>This email was sent because you applied for our partnership program.</p>
            </div>
          </div>
        </body>
        </html>
      `
      : `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #374151; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reason-box { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 15px 0; }
            .cta { display: inline-block; background: #E53E3E; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin-top: 20px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${name}</strong>,</p>
              <p>Thank you for your interest in becoming a partner with PerfectMoney Global Exchanger Network.</p>
              <p>After careful review, we regret to inform you that your application was not approved at this time.</p>
              ${reason ? `<div class="reason-box"><strong>Reason:</strong> ${reason}</div>` : ''}
              <p>You are welcome to reapply after addressing any concerns. If you have questions, please don't hesitate to contact our support team.</p>
              <a href="https://perfectmoney.com/dashboard/partners/apply" class="cta">Apply Again</a>
            </div>
            <div class="footer">
              <p>© 2024 PerfectMoney. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "PerfectMoney Partners <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: html,
      }),
    });

    const result = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Partner status email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending partner status email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

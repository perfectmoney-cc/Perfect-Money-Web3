import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PartnerNotificationRequest {
  type: "application_approved" | "tier_upgraded" | "application_rejected";
  partnerEmail: string;
  partnerName: string;
  details?: {
    oldTier?: string;
    newTier?: string;
    rejectionReason?: string;
  };
}

const getEmailContent = (request: PartnerNotificationRequest) => {
  const { type, partnerName, details } = request;

  switch (type) {
    case "application_approved":
      return {
        subject: "🎉 Your PM Partnership Application Has Been Approved!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #00d4aa 0%, #00a8cc 100%); padding: 40px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { padding: 40px; color: #ffffff; }
              .content h2 { color: #00d4aa; margin-top: 0; }
              .benefits { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0; }
              .benefits li { margin: 10px 0; color: #e0e0e0; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #00d4aa 0%, #00a8cc 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome to PM Partnership!</h1>
              </div>
              <div class="content">
                <h2>Congratulations, ${partnerName}!</h2>
                <p>We are thrilled to inform you that your application to become a PM Global Exchanger Partner has been <strong>approved</strong>!</p>
                
                <div class="benefits">
                  <h3 style="color: #00d4aa; margin-top: 0;">Your Bronze Tier Benefits:</h3>
                  <ul>
                    <li>✅ 5% Revenue Share on all transactions</li>
                    <li>✅ Access to PM Partner Dashboard</li>
                    <li>✅ Priority customer support</li>
                    <li>✅ Marketing materials & brand assets</li>
                    <li>✅ Real-time transaction analytics</li>
                  </ul>
                </div>
                
                <p>You can now access your partner dashboard and start processing transactions. As you grow, you can upgrade to Silver, Gold, or Platinum tiers for increased revenue share up to 20%!</p>
                
                <center>
                  <a href="https://perfectmoney.app/dashboard/partners" class="cta-button">
                    Access Partner Dashboard →
                  </a>
                </center>
                
                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                  If you have any questions, please don't hesitate to reach out to our partnership team.
                </p>
              </div>
              <div class="footer">
                <p>© 2024 Perfect Money. All rights reserved.</p>
                <p>You received this email because you applied for PM Partnership.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "tier_upgraded":
      return {
        subject: `🚀 Congratulations! You've Been Upgraded to ${details?.newTier} Tier!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); padding: 40px; text-align: center; }
              .header h1 { color: #1a1a2e; margin: 0; font-size: 28px; }
              .content { padding: 40px; color: #ffffff; }
              .tier-badge { display: inline-block; background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%); color: #1a1a2e; padding: 10px 25px; border-radius: 20px; font-weight: bold; font-size: 18px; }
              .upgrade-arrow { text-align: center; margin: 20px 0; font-size: 24px; }
              .benefits { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Tier Upgrade!</h1>
              </div>
              <div class="content">
                <h2 style="color: #ffd700;">Congratulations, ${partnerName}!</h2>
                
                <div class="upgrade-arrow">
                  <span style="color: #888;">${details?.oldTier}</span>
                  <span style="color: #ffd700;"> → </span>
                  <span class="tier-badge">${details?.newTier}</span>
                </div>
                
                <p>Your partnership tier has been upgraded! This means you now enjoy enhanced benefits and increased revenue share.</p>
                
                <div class="benefits">
                  <h3 style="color: #ffd700; margin-top: 0;">Your New ${details?.newTier} Benefits:</h3>
                  <ul style="color: #e0e0e0;">
                    ${details?.newTier === "Silver" ? `
                      <li>✅ 10% Revenue Share (up from 5%)</li>
                      <li>✅ Dedicated account manager</li>
                      <li>✅ Featured listing on partner map</li>
                    ` : details?.newTier === "Gold" ? `
                      <li>✅ 15% Revenue Share (up from 10%)</li>
                      <li>✅ Premium marketing support</li>
                      <li>✅ Early access to new features</li>
                      <li>✅ Quarterly business reviews</li>
                    ` : `
                      <li>✅ 20% Revenue Share (maximum tier)</li>
                      <li>✅ VIP support with direct line</li>
                      <li>✅ Co-branding opportunities</li>
                      <li>✅ Exclusive partner events access</li>
                      <li>✅ Custom integration support</li>
                    `}
                  </ul>
                </div>
                
                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                  Thank you for your continued partnership and growth with PM!
                </p>
              </div>
              <div class="footer">
                <p>© 2024 Perfect Money. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "application_rejected":
      return {
        subject: "PM Partnership Application Update",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
              .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%); padding: 40px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 24px; }
              .content { padding: 40px; color: #ffffff; }
              .reason-box { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #f56565; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #00d4aa 0%, #00a8cc 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { padding: 20px; text-align: center; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Application Update</h1>
              </div>
              <div class="content">
                <h2 style="color: #e0e0e0;">Dear ${partnerName},</h2>
                <p>Thank you for your interest in becoming a PM Global Exchanger Partner. After careful review, we regret to inform you that your application was not approved at this time.</p>
                
                ${details?.rejectionReason ? `
                  <div class="reason-box">
                    <strong style="color: #f56565;">Reason:</strong>
                    <p style="margin-bottom: 0;">${details.rejectionReason}</p>
                  </div>
                ` : ''}
                
                <p>We encourage you to address the concerns mentioned above and reapply after 30 days. Our team is here to help you meet the requirements.</p>
                
                <center>
                  <a href="https://perfectmoney.app/dashboard/apply-partnership" class="cta-button">
                    Reapply for Partnership
                  </a>
                </center>
                
                <p style="color: #888; font-size: 14px; margin-top: 30px;">
                  If you have questions about this decision, please contact our partnership team.
                </p>
              </div>
              <div class="footer">
                <p>© 2024 Perfect Money. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: "PM Partnership Notification",
        html: `<p>You have a new notification from PM Partnership.</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: PartnerNotificationRequest = await req.json();
    const { partnerEmail } = request;

    if (!partnerEmail) {
      throw new Error("Partner email is required");
    }

    const emailContent = getEmailContent(request);

    const emailResponse = await resend.emails.send({
      from: "PM Partnership <partnerships@resend.dev>",
      to: [partnerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Partner notification email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending partner notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
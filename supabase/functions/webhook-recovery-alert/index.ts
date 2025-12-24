import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RecoveryAlertRequest {
  merchantEmail: string;
  endpointName: string;
  endpointUrl: string;
  downtimeDuration: number; // in minutes
  currentUptime: number;
  responseTime: number;
  environment: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      merchantEmail, 
      endpointName, 
      endpointUrl, 
      downtimeDuration,
      currentUptime,
      responseTime,
      environment 
    }: RecoveryAlertRequest = await req.json();

    console.log(`Sending recovery alert for ${endpointName} to ${merchantEmail}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .alert-body { background: #f0fdf4; border: 1px solid #bbf7d0; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; }
          .stat-box { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #e5e7eb; }
          .stat-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
          .stat-value { color: #111827; font-size: 18px; font-weight: bold; }
          .success { color: #16a34a; }
          .code { background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-family: monospace; word-break: break-all; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-header">
            <h1 style="margin: 0; font-size: 24px;">✅ Webhook Endpoint Recovered</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Great news! Your webhook endpoint is back online</p>
          </div>
          <div class="alert-body">
            <h2 style="margin-top: 0; color: #16a34a;">Endpoint Online: ${endpointName}</h2>
            
            <div class="stat-box">
              <div class="stat-label">Endpoint URL</div>
              <div class="code">${endpointUrl}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="stat-box">
                <div class="stat-label">Downtime Duration</div>
                <div class="stat-value">${downtimeDuration < 60 ? `${downtimeDuration} min` : `${(downtimeDuration / 60).toFixed(1)} hrs`}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Current Uptime</div>
                <div class="stat-value success">${currentUptime.toFixed(1)}%</div>
              </div>
            </div>
            
            <div class="stat-box">
              <div class="stat-label">Current Response Time</div>
              <div class="stat-value success">${responseTime}ms</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-label">Environment</div>
              <div class="stat-value" style="text-transform: capitalize;">${environment}</div>
            </div>
            
            <p style="margin-top: 20px; padding: 15px; background: #dcfce7; border-radius: 6px; color: #166534;">
              <strong>Your webhook endpoint is now receiving requests normally.</strong> No action is required.
            </p>
          </div>
          <div class="footer">
            <p>This alert was sent by Perfect Money Webhook Health Monitor</p>
            <p>© ${new Date().getFullYear()} Perfect Money. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Perfect Money Alerts <onboarding@resend.dev>",
        to: [merchantEmail],
        subject: `✅ Webhook Endpoint Recovered: ${endpointName}`,
        html: htmlContent,
      }),
    });

    const result = await emailResponse.json();
    console.log("Recovery alert email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in webhook-recovery-alert function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

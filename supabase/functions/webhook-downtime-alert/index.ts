import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DowntimeAlertRequest {
  merchantEmail: string;
  endpointName: string;
  endpointUrl: string;
  consecutiveFailures: number;
  lastResponseTime: number | null;
  uptime: number;
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
      consecutiveFailures, 
      lastResponseTime,
      uptime,
      environment 
    }: DowntimeAlertRequest = await req.json();

    console.log(`Sending downtime alert for ${endpointName} to ${merchantEmail}`);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .alert-header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .alert-body { background: #fef2f2; border: 1px solid #fecaca; border-top: none; padding: 20px; border-radius: 0 0 8px 8px; }
          .stat-box { background: white; padding: 15px; border-radius: 6px; margin: 10px 0; border: 1px solid #e5e7eb; }
          .stat-label { color: #6b7280; font-size: 12px; text-transform: uppercase; }
          .stat-value { color: #111827; font-size: 18px; font-weight: bold; }
          .warning { color: #dc2626; }
          .code { background: #f3f4f6; padding: 8px 12px; border-radius: 4px; font-family: monospace; word-break: break-all; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="alert-header">
            <h1 style="margin: 0; font-size: 24px;">⚠️ Webhook Endpoint Alert</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your webhook endpoint is experiencing issues</p>
          </div>
          <div class="alert-body">
            <h2 style="margin-top: 0; color: #dc2626;">Endpoint Down: ${endpointName}</h2>
            
            <div class="stat-box">
              <div class="stat-label">Endpoint URL</div>
              <div class="code">${endpointUrl}</div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div class="stat-box">
                <div class="stat-label">Consecutive Failures</div>
                <div class="stat-value warning">${consecutiveFailures}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Current Uptime</div>
                <div class="stat-value ${uptime < 95 ? 'warning' : ''}">${uptime.toFixed(1)}%</div>
              </div>
            </div>
            
            <div class="stat-box">
              <div class="stat-label">Last Response Time</div>
              <div class="stat-value">${lastResponseTime !== null ? `${lastResponseTime}ms` : 'No response'}</div>
            </div>
            
            <div class="stat-box">
              <div class="stat-label">Environment</div>
              <div class="stat-value" style="text-transform: capitalize;">${environment}</div>
            </div>
            
            <h3 style="color: #374151;">Recommended Actions:</h3>
            <ul style="color: #4b5563; line-height: 1.8;">
              <li>Check if your server is running and accessible</li>
              <li>Verify the endpoint URL is correct</li>
              <li>Check server logs for errors</li>
              <li>Ensure firewall rules allow incoming requests</li>
              <li>Test the endpoint manually using a tool like cURL</li>
            </ul>
            
            <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px; color: #92400e;">
              <strong>Note:</strong> You will receive another notification when the endpoint recovers.
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
        subject: `⚠️ Webhook Endpoint Down: ${endpointName}`,
        html: htmlContent,
      }),
    });

    const result = await emailResponse.json();
    console.log("Downtime alert email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, ...result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in webhook-downtime-alert function:", error);
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

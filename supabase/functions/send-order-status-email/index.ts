import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  email: string;
  customerName: string;
  orderNumber: string;
  newStatus: string;
  items?: string[];
  totalAmount?: string;
}

const getStatusMessage = (status: string) => {
  switch (status) {
    case "0":
    case "Pending":
      return {
        title: "Order Received",
        message: "We have received your order and it is being processed.",
        color: "#f59e0b"
      };
    case "1":
    case "Processing":
      return {
        title: "Order Processing",
        message: "Your order is now being prepared for shipment.",
        color: "#3b82f6"
      };
    case "2":
    case "Shipped":
      return {
        title: "Order Shipped",
        message: "Your order has been shipped and is on its way to you!",
        color: "#8b5cf6"
      };
    case "3":
    case "Delivered":
      return {
        title: "Order Delivered",
        message: "Your order has been delivered. Thank you for shopping with us!",
        color: "#22c55e"
      };
    case "4":
    case "Cancelled":
      return {
        title: "Order Cancelled",
        message: "Your order has been cancelled. If you have any questions, please contact support.",
        color: "#ef4444"
      };
    default:
      return {
        title: "Order Update",
        message: "There has been an update to your order.",
        color: "#6b7280"
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Order status email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, customerName, orderNumber, newStatus, items, totalAmount }: OrderStatusEmailRequest = await req.json();

    console.log("Sending order status email:", { email, orderNumber, newStatus });

    const statusInfo = getStatusMessage(newStatus);

    const itemsList = items && items.length > 0 
      ? items.map(item => `<li style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${item}</li>`).join('')
      : '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">PM Store</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order Status Update</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: ${statusInfo.color}20; padding: 15px 30px; border-radius: 50px;">
                <span style="color: ${statusInfo.color}; font-weight: bold; font-size: 18px;">${statusInfo.title}</span>
              </div>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${customerName || 'Valued Customer'},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${statusInfo.message}
            </p>
            
            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Order Number</p>
              <p style="margin: 0; color: #dc2626; font-size: 24px; font-weight: bold; font-family: monospace;">${orderNumber}</p>
            </div>
            
            ${itemsList ? `
              <div style="margin: 25px 0;">
                <p style="color: #374151; font-weight: 600; margin-bottom: 10px;">Order Items:</p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${itemsList}
                </ul>
              </div>
            ` : ''}
            
            ${totalAmount ? `
              <div style="text-align: right; padding-top: 15px; border-top: 2px solid #e5e7eb;">
                <span style="color: #6b7280;">Total: </span>
                <span style="color: #dc2626; font-size: 20px; font-weight: bold;">${totalAmount} PM</span>
              </div>
            ` : ''}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Thank you for shopping with PM Store!
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                If you have any questions, please contact our support team.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © 2024 Perfect Money. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PM Store <onboarding@resend.dev>",
        to: [email],
        subject: `Order Update: ${statusInfo.title} - ${orderNumber}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order status email:", error);
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

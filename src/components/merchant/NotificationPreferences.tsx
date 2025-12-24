import { useState } from "react";
import { Bell, Mail, MessageSquare, Webhook, Shield, AlertTriangle, CheckCircle, DollarSign, RefreshCw, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  webhook: boolean;
  icon: React.ReactNode;
  category: "payment" | "security" | "system";
}

const NotificationPreferences = () => {
  const [emailAddress, setEmailAddress] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "payment_received",
      label: "Payment Received",
      description: "When a customer completes a payment",
      email: true,
      webhook: true,
      icon: <DollarSign className="h-4 w-4 text-green-500" />,
      category: "payment"
    },
    {
      id: "payment_failed",
      label: "Payment Failed",
      description: "When a payment attempt fails",
      email: true,
      webhook: true,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      category: "payment"
    },
    {
      id: "refund_processed",
      label: "Refund Processed",
      description: "When a refund is successfully processed",
      email: true,
      webhook: true,
      icon: <RefreshCw className="h-4 w-4 text-blue-500" />,
      category: "payment"
    },
    {
      id: "large_transaction",
      label: "Large Transaction Alert",
      description: "When a transaction exceeds $1,000",
      email: true,
      webhook: false,
      icon: <DollarSign className="h-4 w-4 text-yellow-500" />,
      category: "payment"
    },
    {
      id: "suspicious_activity",
      label: "Suspicious Activity",
      description: "Potential fraud or unusual patterns detected",
      email: true,
      webhook: true,
      icon: <Shield className="h-4 w-4 text-red-500" />,
      category: "security"
    },
    {
      id: "api_key_usage",
      label: "API Key Usage Alert",
      description: "When API keys are used from new IP addresses",
      email: true,
      webhook: false,
      icon: <Shield className="h-4 w-4 text-orange-500" />,
      category: "security"
    },
    {
      id: "webhook_failure",
      label: "Webhook Delivery Failed",
      description: "When webhook delivery fails after retries",
      email: true,
      webhook: false,
      icon: <Webhook className="h-4 w-4 text-red-500" />,
      category: "system"
    },
    {
      id: "endpoint_recovered",
      label: "Endpoint Recovered",
      description: "When a previously failing endpoint comes back online",
      email: true,
      webhook: false,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      category: "system"
    },
    {
      id: "daily_summary",
      label: "Daily Summary",
      description: "Daily digest of payments and activity",
      email: true,
      webhook: false,
      icon: <Mail className="h-4 w-4 text-primary" />,
      category: "system"
    }
  ]);

  const toggleNotification = (id: string, type: "email" | "webhook") => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, [type]: !n[type] } : n
    ));
  };

  const enableAll = (type: "email" | "webhook") => {
    setNotifications(prev => prev.map(n => ({ ...n, [type]: true })));
    toast.success(`All ${type} notifications enabled`);
  };

  const disableAll = (type: "email" | "webhook") => {
    setNotifications(prev => prev.map(n => ({ ...n, [type]: false })));
    toast.success(`All ${type} notifications disabled`);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage for demo
    localStorage.setItem("merchantNotificationPreferences", JSON.stringify({
      email: emailAddress,
      webhookUrl,
      notifications
    }));
    
    setIsSaving(false);
    toast.success("Notification preferences saved successfully!");
  };

  const paymentNotifications = notifications.filter(n => n.category === "payment");
  const securityNotifications = notifications.filter(n => n.category === "security");
  const systemNotifications = notifications.filter(n => n.category === "system");

  const NotificationRow = ({ notification }: { notification: NotificationSetting }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted">
          {notification.icon}
        </div>
        <div>
          <p className="font-medium text-sm">{notification.label}</p>
          <p className="text-xs text-muted-foreground">{notification.description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={notification.email}
            onCheckedChange={() => toggleNotification(notification.id, "email")}
          />
        </div>
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-muted-foreground" />
          <Switch
            checked={notification.webhook}
            onCheckedChange={() => toggleNotification(notification.id, "webhook")}
          />
        </div>
      </div>
    </div>
  );

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification Preferences</CardTitle>
          </div>
          <Badge variant="outline">Merchant Settings</Badge>
        </div>
        <CardDescription>
          Configure how you receive alerts for payment events and system notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Contact Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="merchant@example.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="webhook" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhook URL (Optional)
            </Label>
            <Input
              id="webhook"
              type="url"
              placeholder="https://yoursite.com/notifications"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => enableAll("email")}>
            <Mail className="h-4 w-4 mr-1" />
            Enable All Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => disableAll("email")}>
            <Mail className="h-4 w-4 mr-1" />
            Disable All Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => enableAll("webhook")}>
            <Webhook className="h-4 w-4 mr-1" />
            Enable All Webhook
          </Button>
          <Button variant="outline" size="sm" onClick={() => disableAll("webhook")}>
            <Webhook className="h-4 w-4 mr-1" />
            Disable All Webhook
          </Button>
        </div>

        <Separator />

        {/* Payment Notifications */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <DollarSign className="h-4 w-4 text-green-500" />
            Payment Events
          </h3>
          <div className="space-y-1 divide-y divide-border">
            {paymentNotifications.map(notification => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Security Notifications */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-red-500" />
            Security Alerts
          </h3>
          <div className="space-y-1 divide-y divide-border">
            {securityNotifications.map(notification => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </div>
        </div>

        <Separator />

        {/* System Notifications */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            System Notifications
          </h3>
          <div className="space-y-1 divide-y divide-border">
            {systemNotifications.map(notification => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </div>
        </div>

        <Separator />

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;

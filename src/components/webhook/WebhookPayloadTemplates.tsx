import { useState } from "react";
import { FileText, Copy, Check, Plus, Trash2, Save, Edit2, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PayloadTemplate {
  id: string;
  name: string;
  description: string;
  event: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  isDefault?: boolean;
}

const defaultTemplates: PayloadTemplate[] = [
  {
    id: "default_payment_success",
    name: "Payment Success",
    description: "Standard payment completed notification",
    event: "payment.completed",
    payload: {
      event: "payment.completed",
      payment_id: "{{payment_id}}",
      merchant_id: "{{merchant_id}}",
      amount: "{{amount}}",
      currency: "{{currency}}",
      order_id: "{{order_id}}",
      tx_hash: "{{tx_hash}}",
      customer_wallet: "{{customer_wallet}}",
      status: "completed",
      timestamp: "{{timestamp}}"
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: "default_payment_failed",
    name: "Payment Failed",
    description: "Payment failure with error details",
    event: "payment.failed",
    payload: {
      event: "payment.failed",
      payment_id: "{{payment_id}}",
      merchant_id: "{{merchant_id}}",
      amount: "{{amount}}",
      currency: "{{currency}}",
      order_id: "{{order_id}}",
      error_code: "{{error_code}}",
      error_message: "{{error_message}}",
      status: "failed",
      timestamp: "{{timestamp}}"
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: "default_refund",
    name: "Refund Processed",
    description: "Refund completion notification",
    event: "payment.refunded",
    payload: {
      event: "payment.refunded",
      payment_id: "{{payment_id}}",
      refund_id: "{{refund_id}}",
      merchant_id: "{{merchant_id}}",
      original_amount: "{{original_amount}}",
      refund_amount: "{{refund_amount}}",
      currency: "{{currency}}",
      reason: "{{reason}}",
      tx_hash: "{{tx_hash}}",
      status: "refunded",
      timestamp: "{{timestamp}}"
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: "default_subscription",
    name: "Subscription Payment",
    description: "Recurring subscription payment notification",
    event: "subscription.payment",
    payload: {
      event: "subscription.payment",
      subscription_id: "{{subscription_id}}",
      payment_id: "{{payment_id}}",
      merchant_id: "{{merchant_id}}",
      customer_id: "{{customer_id}}",
      amount: "{{amount}}",
      currency: "{{currency}}",
      billing_period: "{{billing_period}}",
      next_billing_date: "{{next_billing_date}}",
      tx_hash: "{{tx_hash}}",
      status: "completed",
      timestamp: "{{timestamp}}"
    },
    createdAt: new Date(),
    isDefault: true
  },
  {
    id: "default_checkout",
    name: "Checkout Completed",
    description: "E-commerce checkout with items detail",
    event: "checkout.completed",
    payload: {
      event: "checkout.completed",
      checkout_id: "{{checkout_id}}",
      payment_id: "{{payment_id}}",
      merchant_id: "{{merchant_id}}",
      customer_email: "{{customer_email}}",
      customer_wallet: "{{customer_wallet}}",
      items: [
        {
          name: "{{item_name}}",
          quantity: "{{quantity}}",
          price: "{{price}}"
        }
      ],
      subtotal: "{{subtotal}}",
      discount: "{{discount}}",
      total: "{{total}}",
      currency: "{{currency}}",
      shipping_address: "{{shipping_address}}",
      tx_hash: "{{tx_hash}}",
      status: "completed",
      timestamp: "{{timestamp}}"
    },
    createdAt: new Date(),
    isDefault: true
  }
];

export const WebhookPayloadTemplates = () => {
  const [templates, setTemplates] = useState<PayloadTemplate[]>(() => {
    const saved = localStorage.getItem("pm_webhook_templates");
    return saved ? [...defaultTemplates, ...JSON.parse(saved)] : defaultTemplates;
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New template form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newEvent, setNewEvent] = useState("");
  const [newPayload, setNewPayload] = useState("{\n  \n}");

  const saveCustomTemplates = (customTemplates: PayloadTemplate[]) => {
    const custom = customTemplates.filter(t => !t.isDefault);
    localStorage.setItem("pm_webhook_templates", JSON.stringify(custom));
  };

  const copyPayload = (template: PayloadTemplate) => {
    navigator.clipboard.writeText(JSON.stringify(template.payload, null, 2));
    setCopiedId(template.id);
    toast.success(`${template.name} payload copied!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const createTemplate = () => {
    if (!newName || !newEvent) {
      toast.error("Please fill in name and event type");
      return;
    }

    try {
      const parsedPayload = JSON.parse(newPayload);
      
      const newTemplate: PayloadTemplate = {
        id: `custom_${Date.now()}`,
        name: newName,
        description: newDescription,
        event: newEvent,
        payload: parsedPayload,
        createdAt: new Date(),
        isDefault: false
      };

      const updated = [...templates, newTemplate];
      setTemplates(updated);
      saveCustomTemplates(updated);
      
      setNewName("");
      setNewDescription("");
      setNewEvent("");
      setNewPayload("{\n  \n}");
      setIsCreating(false);
      toast.success("Template created successfully!");
    } catch {
      toast.error("Invalid JSON payload");
    }
  };

  const updateTemplate = (id: string, updates: Partial<PayloadTemplate>) => {
    const updated = templates.map(t => 
      t.id === id ? { ...t, ...updates } : t
    );
    setTemplates(updated);
    saveCustomTemplates(updated);
    setEditingId(null);
    toast.success("Template updated!");
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveCustomTemplates(updated);
    toast.success("Template deleted");
  };

  const exportAllTemplates = () => {
    const data = JSON.stringify(templates, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webhook-templates-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Templates exported!");
  };

  const getEventColor = (event: string) => {
    if (event.includes("completed") || event.includes("success")) return "text-green-500 border-green-500/50";
    if (event.includes("failed") || event.includes("error")) return "text-red-500 border-red-500/50";
    if (event.includes("refund")) return "text-yellow-500 border-yellow-500/50";
    if (event.includes("subscription")) return "text-purple-500 border-purple-500/50";
    return "text-blue-500 border-blue-500/50";
  };

  return (
    <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            <CardTitle>Webhook Payload Templates</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/50 text-indigo-500">
              {templates.length} Templates
            </Badge>
            <Button variant="outline" size="sm" onClick={exportAllTemplates}>
              <Code className="h-4 w-4 mr-1" />
              Export All
            </Button>
          </div>
        </div>
        <CardDescription>
          Customize webhook payloads for your integration needs. Use {"{{placeholders}}"} for dynamic values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create New Template Button */}
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="w-full border-dashed border-indigo-500/50 hover:bg-indigo-500/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Custom Template
          </Button>
        ) : (
          <div className="p-4 bg-background/50 rounded-lg border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input
                  placeholder="My Custom Template"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Input
                  placeholder="payment.custom"
                  value={newEvent}
                  onChange={(e) => setNewEvent(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Brief description of this template"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Payload (JSON)</Label>
              <Textarea
                className="font-mono text-sm min-h-[200px]"
                placeholder='{"key": "value"}'
                value={newPayload}
                onChange={(e) => setNewPayload(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={createTemplate} className="bg-indigo-500 hover:bg-indigo-600">
                <Save className="h-4 w-4 mr-2" />
                Save Template
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                template.isDefault 
                  ? "border-border bg-muted/30" 
                  : "border-indigo-500/30 bg-indigo-500/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{template.name}</h4>
                    {template.isDefault && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                  </p>
                </div>
                <Badge variant="outline" className={getEventColor(template.event)}>
                  {template.event}
                </Badge>
              </div>

              {/* Payload Preview */}
              <pre className="bg-muted/50 p-3 rounded text-xs overflow-x-auto max-h-32 mb-3">
                {JSON.stringify(template.payload, null, 2).slice(0, 300)}
                {JSON.stringify(template.payload, null, 2).length > 300 && "..."}
              </pre>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyPayload(template)}
                  className="flex-1"
                >
                  {copiedId === template.id ? (
                    <Check className="h-4 w-4 mr-1" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  Copy
                </Button>
                
                {!template.isDefault && (
                  <>
                    <Dialog open={editingId === template.id} onOpenChange={(open) => !open && setEditingId(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingId(template.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Template</DialogTitle>
                          <DialogDescription>
                            Modify your custom webhook payload template
                          </DialogDescription>
                        </DialogHeader>
                        <EditTemplateForm
                          template={template}
                          onSave={(updates) => updateTemplate(template.id, updates)}
                          onCancel={() => setEditingId(null)}
                        />
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Template Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Use {"{{placeholders}}"} for dynamic values that will be replaced at runtime</li>
            <li>• Common placeholders: {"{{payment_id}}"}, {"{{amount}}"}, {"{{timestamp}}"}, {"{{tx_hash}}"}</li>
            <li>• Export templates to share with your development team</li>
            <li>• Custom templates are saved locally and persist across sessions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Edit Template Form Component
const EditTemplateForm = ({
  template,
  onSave,
  onCancel
}: {
  template: PayloadTemplate;
  onSave: (updates: Partial<PayloadTemplate>) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description);
  const [event, setEvent] = useState(template.event);
  const [payload, setPayload] = useState(JSON.stringify(template.payload, null, 2));

  const handleSave = () => {
    try {
      const parsedPayload = JSON.parse(payload);
      onSave({
        name,
        description,
        event,
        payload: parsedPayload
      });
    } catch {
      toast.error("Invalid JSON payload");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Template Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Event Type</Label>
          <Input value={event} onChange={(e) => setEvent(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Payload (JSON)</Label>
        <Textarea
          className="font-mono text-sm min-h-[250px]"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} className="bg-indigo-500 hover:bg-indigo-600">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default WebhookPayloadTemplates;

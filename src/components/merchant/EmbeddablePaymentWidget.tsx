import { useState } from "react";
import { Code, Copy, Check, ExternalLink, Palette, Settings, Eye, CreditCard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface WidgetConfig {
  merchantId: string;
  amount: string;
  currency: string;
  orderId: string;
  productName: string;
  showLogo: boolean;
  buttonText: string;
  buttonColor: string;
  textColor: string;
  borderRadius: string;
  acceptedTokens: string[];
  callbackUrl: string;
  successUrl: string;
  cancelUrl: string;
}

export const EmbeddablePaymentWidget = ({ 
  merchantWallet 
}: { 
  merchantWallet: string;
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("dark");
  
  const [config, setConfig] = useState<WidgetConfig>({
    merchantId: merchantWallet?.slice(0, 10) || "merchant",
    amount: "100",
    currency: "PM",
    orderId: "ORDER-001",
    productName: "Product Name",
    showLogo: true,
    buttonText: "Pay with PM Token",
    buttonColor: "#dc2626",
    textColor: "#ffffff",
    borderRadius: "8",
    acceptedTokens: ["PM", "USDT", "USDC"],
    callbackUrl: "https://yoursite.com/webhook",
    successUrl: "https://yoursite.com/success",
    cancelUrl: "https://yoursite.com/cancel"
  });

  const updateConfig = (key: keyof WidgetConfig, value: unknown) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleToken = (token: string) => {
    setConfig(prev => ({
      ...prev,
      acceptedTokens: prev.acceptedTokens.includes(token)
        ? prev.acceptedTokens.filter(t => t !== token)
        : [...prev.acceptedTokens, token]
    }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Generate HTML embed code
  const generateHtmlEmbed = () => `<!-- Perfect Money Payment Widget -->
<div id="pm-payment-widget" data-config='${JSON.stringify(config)}'></div>
<script src="https://cdn.perfectmoney.cc/widget/v1/payment.js"></script>
<script>
  PMPaymentWidget.init({
    container: '#pm-payment-widget',
    merchantId: '${config.merchantId}',
    amount: '${config.amount}',
    currency: '${config.currency}',
    orderId: '${config.orderId}',
    productName: '${config.productName}',
    showLogo: ${config.showLogo},
    buttonText: '${config.buttonText}',
    buttonColor: '${config.buttonColor}',
    textColor: '${config.textColor}',
    borderRadius: '${config.borderRadius}px',
    acceptedTokens: ${JSON.stringify(config.acceptedTokens)},
    callbackUrl: '${config.callbackUrl}',
    successUrl: '${config.successUrl}',
    cancelUrl: '${config.cancelUrl}',
    onSuccess: function(data) {
      console.log('Payment successful:', data);
    },
    onError: function(error) {
      console.error('Payment failed:', error);
    },
    onCancel: function() {
      console.log('Payment cancelled');
    }
  });
</script>`;

  // Generate React component code
  const generateReactEmbed = () => `import { useEffect } from 'react';

// Perfect Money Payment Widget Component
const PMPaymentWidget = () => {
  useEffect(() => {
    // Load the PM Payment Widget script
    const script = document.createElement('script');
    script.src = 'https://cdn.perfectmoney.cc/widget/v1/payment.js';
    script.async = true;
    script.onload = () => {
      window.PMPaymentWidget.init({
        container: '#pm-payment-widget',
        merchantId: '${config.merchantId}',
        amount: '${config.amount}',
        currency: '${config.currency}',
        orderId: '${config.orderId}',
        productName: '${config.productName}',
        showLogo: ${config.showLogo},
        buttonText: '${config.buttonText}',
        buttonColor: '${config.buttonColor}',
        textColor: '${config.textColor}',
        borderRadius: '${config.borderRadius}px',
        acceptedTokens: ${JSON.stringify(config.acceptedTokens)},
        callbackUrl: '${config.callbackUrl}',
        successUrl: '${config.successUrl}',
        cancelUrl: '${config.cancelUrl}',
        onSuccess: (data) => console.log('Payment successful:', data),
        onError: (error) => console.error('Payment failed:', error),
        onCancel: () => console.log('Payment cancelled')
      });
    };
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="pm-payment-widget" />;
};

export default PMPaymentWidget;`;

  // Generate iframe embed code
  const generateIframeEmbed = () => {
    const params = new URLSearchParams({
      merchant: config.merchantId,
      amount: config.amount,
      currency: config.currency,
      order: config.orderId,
      product: config.productName,
      tokens: config.acceptedTokens.join(','),
      btnColor: config.buttonColor,
      btnText: config.buttonText,
      callback: config.callbackUrl,
      success: config.successUrl,
      cancel: config.cancelUrl
    });
    
    return `<!-- Perfect Money Payment Widget (iframe) -->
<iframe 
  src="https://pay.perfectmoney.cc/embed?${params.toString()}"
  width="400"
  height="500"
  frameborder="0"
  style="border-radius: ${config.borderRadius}px; border: 1px solid #333;"
  allow="payment"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
></iframe>`;
  };

  return (
    <Card className="border-emerald-500/30 bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            <CardTitle>Embeddable Payment Widget</CardTitle>
          </div>
          <Badge variant="outline" className="border-emerald-500/50 text-emerald-500">
            Customizable
          </Badge>
        </div>
        <CardDescription>
          Create a payment widget that can be embedded on any external website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-4 w-4 text-emerald-500" />
              <h3 className="font-medium">Widget Configuration</h3>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  value={config.amount}
                  onChange={(e) => updateConfig("amount", e.target.value)}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input
                  value={config.orderId}
                  onChange={(e) => updateConfig("orderId", e.target.value)}
                  placeholder="ORDER-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={config.productName}
                onChange={(e) => updateConfig("productName", e.target.value)}
                placeholder="Product Name"
              />
            </div>

            {/* Accepted Tokens */}
            <div className="space-y-2">
              <Label>Accepted Tokens</Label>
              <div className="flex flex-wrap gap-2">
                {["PM", "USDT", "USDC", "BNB"].map(token => (
                  <button
                    key={token}
                    onClick={() => toggleToken(token)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      config.acceptedTokens.includes(token)
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {token}
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance */}
            <div className="flex items-center gap-2 pt-2">
              <Palette className="h-4 w-4 text-emerald-500" />
              <h3 className="font-medium">Appearance</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.buttonColor}
                    onChange={(e) => updateConfig("buttonColor", e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={config.buttonColor}
                    onChange={(e) => updateConfig("buttonColor", e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Border Radius (px)</Label>
                <Input
                  type="number"
                  value={config.borderRadius}
                  onChange={(e) => updateConfig("borderRadius", e.target.value)}
                  min="0"
                  max="24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Button Text</Label>
              <Input
                value={config.buttonText}
                onChange={(e) => updateConfig("buttonText", e.target.value)}
                placeholder="Pay with PM Token"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-logo">Show PM Logo</Label>
              <Switch
                id="show-logo"
                checked={config.showLogo}
                onCheckedChange={(v) => updateConfig("showLogo", v)}
              />
            </div>

            {/* URLs */}
            <div className="space-y-2 pt-2">
              <Label>Callback URL (Webhook)</Label>
              <Input
                value={config.callbackUrl}
                onChange={(e) => updateConfig("callbackUrl", e.target.value)}
                placeholder="https://yoursite.com/webhook"
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Success URL</Label>
                <Input
                  value={config.successUrl}
                  onChange={(e) => updateConfig("successUrl", e.target.value)}
                  placeholder="https://..."
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label>Cancel URL</Label>
                <Input
                  value={config.cancelUrl}
                  onChange={(e) => updateConfig("cancelUrl", e.target.value)}
                  placeholder="https://..."
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-500" />
                <h3 className="font-medium">Live Preview</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMode("light")}
                  className={`px-2 py-1 rounded text-xs ${previewMode === "light" ? "bg-white text-black" : "bg-muted"}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setPreviewMode("dark")}
                  className={`px-2 py-1 rounded text-xs ${previewMode === "dark" ? "bg-gray-800 text-white" : "bg-muted"}`}
                >
                  Dark
                </button>
              </div>
            </div>

            {/* Widget Preview */}
            <div 
              className={`p-6 rounded-lg border-2 border-dashed ${
                previewMode === "dark" ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"
              }`}
            >
              <div 
                className="p-4 rounded-lg border"
                style={{ 
                  borderRadius: `${config.borderRadius}px`,
                  borderColor: previewMode === "dark" ? "#333" : "#ddd",
                  backgroundColor: previewMode === "dark" ? "#1a1a1a" : "#f9f9f9"
                }}
              >
                {config.showLogo && (
                  <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                        PM
                      </div>
                      <span className={`font-bold ${previewMode === "dark" ? "text-white" : "text-black"}`}>
                        Perfect Money
                      </span>
                    </div>
                  </div>
                )}

                <div className={`text-center mb-4 ${previewMode === "dark" ? "text-gray-300" : "text-gray-700"}`}>
                  <p className="text-sm mb-1">{config.productName}</p>
                  <p className="text-2xl font-bold">
                    {config.amount} <span className="text-lg">{config.currency}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Order: {config.orderId}</p>
                </div>

                {config.acceptedTokens.length > 1 && (
                  <div className="flex justify-center gap-2 mb-4">
                    {config.acceptedTokens.map(token => (
                      <Badge key={token} variant="outline" className="text-xs">
                        {token}
                      </Badge>
                    ))}
                  </div>
                )}

                <button
                  style={{ 
                    backgroundColor: config.buttonColor,
                    color: config.textColor,
                    borderRadius: `${config.borderRadius}px`
                  }}
                  className="w-full py-3 px-4 font-medium transition-opacity hover:opacity-90"
                >
                  <Zap className="inline-block h-4 w-4 mr-2" />
                  {config.buttonText}
                </button>

                <p className={`text-xs text-center mt-3 ${previewMode === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Secured by Perfect Money™
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Embed Code Tabs */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-4">
            <Code className="h-4 w-4 text-emerald-500" />
            <h3 className="font-medium">Embed Code</h3>
          </div>

          <Tabs defaultValue="html" className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="react">React</TabsTrigger>
              <TabsTrigger value="iframe">iFrame</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                  {generateHtmlEmbed()}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateHtmlEmbed(), "HTML")}
                >
                  {copiedType === "HTML" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="react" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                  {generateReactEmbed()}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateReactEmbed(), "React")}
                >
                  {copiedType === "React" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="iframe" className="mt-4">
              <div className="relative">
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64">
                  {generateIframeEmbed()}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copyToClipboard(generateIframeEmbed(), "iFrame")}
                >
                  {copiedType === "iFrame" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Tips */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Integration Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Test in sandbox mode before deploying to production</li>
            <li>• Ensure your callback URL is accessible and returns 200 OK</li>
            <li>• Widget automatically handles wallet connection prompts</li>
            <li>• Supports BEP-20 tokens: PM, USDT, USDC, BNB on BSC network</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmbeddablePaymentWidget;

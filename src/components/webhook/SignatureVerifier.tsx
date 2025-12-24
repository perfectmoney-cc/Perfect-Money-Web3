import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Copy, 
  RefreshCw,
  Key,
  FileText,
  Hash,
  AlertTriangle
} from "lucide-react";

interface VerificationResult {
  isValid: boolean;
  computedSignature: string;
  expectedSignature: string;
  timestamp: Date;
}

// Simple HMAC-SHA256 simulation (in production, use crypto API)
const computeHMAC = async (secret: string, payload: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);
  
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

const samplePayloads = [
  {
    name: "Payment Received",
    payload: JSON.stringify({
      event: "payment.received",
      data: {
        id: "pay_123456789",
        amount: "100.00",
        currency: "PM",
        status: "completed",
        timestamp: new Date().toISOString()
      }
    }, null, 2)
  },
  {
    name: "Order Created",
    payload: JSON.stringify({
      event: "order.created",
      data: {
        orderId: "ORD-987654",
        items: [{ name: "Product A", quantity: 2 }],
        total: "250.00",
        currency: "PM"
      }
    }, null, 2)
  },
  {
    name: "Refund Issued",
    payload: JSON.stringify({
      event: "refund.issued",
      data: {
        refundId: "ref_456789",
        originalPaymentId: "pay_123456",
        amount: "50.00",
        reason: "Customer request"
      }
    }, null, 2)
  }
];

export const SignatureVerifier = () => {
  const [secretKey, setSecretKey] = useState("");
  const [payload, setPayload] = useState(samplePayloads[0].payload);
  const [providedSignature, setProvidedSignature] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedSignature, setGeneratedSignature] = useState("");

  const generateSignature = async () => {
    if (!secretKey || !payload) {
      toast.error("Please provide both secret key and payload");
      return;
    }

    try {
      const signature = await computeHMAC(secretKey, payload);
      setGeneratedSignature(signature);
      toast.success("Signature generated");
    } catch (error) {
      toast.error("Failed to generate signature");
    }
  };

  const verifySignature = async () => {
    if (!secretKey || !payload || !providedSignature) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsVerifying(true);
    
    try {
      const computedSignature = await computeHMAC(secretKey, payload);
      const isValid = computedSignature.toLowerCase() === providedSignature.toLowerCase();
      
      setResult({
        isValid,
        computedSignature,
        expectedSignature: providedSignature,
        timestamp: new Date()
      });
      
      if (isValid) {
        toast.success("Signature verification passed!");
      } else {
        toast.error("Signature verification failed!");
      }
    } catch (error) {
      toast.error("Verification error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const loadSamplePayload = (index: number) => {
    setPayload(samplePayloads[index].payload);
    setResult(null);
    setGeneratedSignature("");
  };

  const generateRandomSecret = () => {
    const secret = `whsec_${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("")}`;
    setSecretKey(secret);
    setResult(null);
    setGeneratedSignature("");
  };

  return (
    <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20">
            <Shield className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg">HMAC Signature Verifier</CardTitle>
            <CardDescription>Validate webhook signatures against sample payloads</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Secret Key Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="secret" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Webhook Secret Key
            </Label>
            <Button variant="ghost" size="sm" onClick={generateRandomSecret}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Generate
            </Button>
          </div>
          <Input
            id="secret"
            type="password"
            placeholder="whsec_your_webhook_secret_key"
            value={secretKey}
            onChange={(e) => {
              setSecretKey(e.target.value);
              setResult(null);
            }}
            className="font-mono text-sm"
          />
        </div>

        {/* Payload Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="payload" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Webhook Payload
            </Label>
            <div className="flex gap-1">
              {samplePayloads.map((sample, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => loadSamplePayload(index)}
                >
                  {sample.name}
                </Button>
              ))}
            </div>
          </div>
          <Textarea
            id="payload"
            placeholder='{"event": "payment.received", ...}'
            value={payload}
            onChange={(e) => {
              setPayload(e.target.value);
              setResult(null);
            }}
            className="font-mono text-sm min-h-[120px]"
          />
        </div>

        {/* Generate Signature Section */}
        <div className="p-4 rounded-lg border bg-card/50 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Generate Signature
            </Label>
            <Button size="sm" onClick={generateSignature} disabled={!secretKey || !payload}>
              Generate HMAC
            </Button>
          </div>
          {generatedSignature && (
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 rounded bg-muted text-xs font-mono break-all">
                {generatedSignature}
              </code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => copyToClipboard(generatedSignature)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Verify Signature Section */}
        <div className="space-y-3">
          <Label htmlFor="signature" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Signature to Verify
          </Label>
          <div className="flex gap-2">
            <Input
              id="signature"
              placeholder="Paste the signature to verify..."
              value={providedSignature}
              onChange={(e) => {
                setProvidedSignature(e.target.value);
                setResult(null);
              }}
              className="font-mono text-sm"
            />
            <Button onClick={verifySignature} disabled={isVerifying || !secretKey || !payload || !providedSignature}>
              {isVerifying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Verify"
              )}
            </Button>
          </div>
        </div>

        {/* Verification Result */}
        {result && (
          <div className={`p-4 rounded-lg border ${
            result.isValid 
              ? "bg-green-500/10 border-green-500/30" 
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {result.isValid ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <XCircle className="h-6 w-6 text-red-500" />
              )}
              <div>
                <p className={`font-semibold ${result.isValid ? "text-green-500" : "text-red-500"}`}>
                  {result.isValid ? "Signature Valid" : "Signature Invalid"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Verified at {result.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={result.isValid ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}
              >
                {result.isValid ? "PASS" : "FAIL"}
              </Badge>
            </div>
            
            {!result.isValid && (
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Computed signature:</p>
                    <code className="text-xs break-all">{result.computedSignature}</code>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-muted-foreground">Provided signature:</p>
                    <code className="text-xs break-all">{result.expectedSignature}</code>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

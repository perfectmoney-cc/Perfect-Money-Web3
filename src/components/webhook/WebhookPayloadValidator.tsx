import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, AlertTriangle, Code, FileJson, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ValidationRule {
  field: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  enum?: string[];
}

interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: "error" | "warning";
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

// Default schema templates
const defaultSchemas: Record<string, ValidationRule[]> = {
  "payment.completed": [
    { field: "event", type: "string", required: true, enum: ["payment.completed"] },
    { field: "payment_id", type: "string", required: true, pattern: "^pay_[a-zA-Z0-9]+$" },
    { field: "merchant_id", type: "string", required: true },
    { field: "amount", type: "string", required: true, pattern: "^\\d+(\\.\\d{1,2})?$" },
    { field: "currency", type: "string", required: true, enum: ["PM", "USDT", "USDC", "BNB"] },
    { field: "tx_hash", type: "string", required: true, pattern: "^0x[a-fA-F0-9]{64}$" },
    { field: "status", type: "string", required: true, enum: ["completed"] },
    { field: "timestamp", type: "string", required: true }
  ],
  "payment.failed": [
    { field: "event", type: "string", required: true, enum: ["payment.failed"] },
    { field: "payment_id", type: "string", required: true },
    { field: "merchant_id", type: "string", required: true },
    { field: "error_code", type: "string", required: true },
    { field: "error_message", type: "string", required: true },
    { field: "status", type: "string", required: true, enum: ["failed"] },
    { field: "timestamp", type: "string", required: true }
  ],
  "payment.refunded": [
    { field: "event", type: "string", required: true, enum: ["payment.refunded"] },
    { field: "payment_id", type: "string", required: true },
    { field: "refund_id", type: "string", required: true, pattern: "^ref_[a-zA-Z0-9]+$" },
    { field: "original_amount", type: "string", required: true },
    { field: "refund_amount", type: "string", required: true },
    { field: "status", type: "string", required: true, enum: ["refunded"] },
    { field: "timestamp", type: "string", required: true }
  ]
};

export const WebhookPayloadValidator = () => {
  const [payload, setPayload] = useState<string>(`{
  "event": "payment.completed",
  "payment_id": "pay_abc123xyz",
  "merchant_id": "merchant_001",
  "amount": "100.00",
  "currency": "PM",
  "tx_hash": "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "status": "completed",
  "timestamp": "${new Date().toISOString()}"
}`);
  const [selectedSchema, setSelectedSchema] = useState<string>("payment.completed");
  const [customSchema, setCustomSchema] = useState<string>("");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate payload against schema
  const validatePayload = () => {
    setIsValidating(true);
    
    try {
      const parsedPayload = JSON.parse(payload);
      const schema = selectedSchema === "custom" 
        ? JSON.parse(customSchema) as ValidationRule[]
        : defaultSchemas[selectedSchema];
      
      const errors: ValidationResult["errors"] = [];
      const warnings: ValidationResult["warnings"] = [];

      // Check each rule
      schema.forEach(rule => {
        const value = parsedPayload[rule.field];
        
        // Check required
        if (rule.required && (value === undefined || value === null || value === "")) {
          errors.push({
            field: rule.field,
            message: `Required field "${rule.field}" is missing`,
            severity: "error"
          });
          return;
        }

        if (value === undefined) return;

        // Check type
        const actualType = Array.isArray(value) ? "array" : typeof value;
        if (actualType !== rule.type && !(rule.type === "number" && !isNaN(Number(value)))) {
          errors.push({
            field: rule.field,
            message: `Field "${rule.field}" expected ${rule.type}, got ${actualType}`,
            severity: "error"
          });
        }

        // Check pattern
        if (rule.pattern && typeof value === "string") {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(value)) {
            errors.push({
              field: rule.field,
              message: `Field "${rule.field}" does not match pattern ${rule.pattern}`,
              severity: "error"
            });
          }
        }

        // Check enum
        if (rule.enum && !rule.enum.includes(value)) {
          errors.push({
            field: rule.field,
            message: `Field "${rule.field}" must be one of: ${rule.enum.join(", ")}`,
            severity: "error"
          });
        }

        // Check length
        if (rule.minLength && typeof value === "string" && value.length < rule.minLength) {
          warnings.push({
            field: rule.field,
            message: `Field "${rule.field}" is shorter than recommended (${rule.minLength} chars)`
          });
        }

        if (rule.maxLength && typeof value === "string" && value.length > rule.maxLength) {
          warnings.push({
            field: rule.field,
            message: `Field "${rule.field}" exceeds maximum length (${rule.maxLength} chars)`
          });
        }
      });

      // Check for extra fields
      const schemaFields = new Set(schema.map(r => r.field));
      Object.keys(parsedPayload).forEach(key => {
        if (!schemaFields.has(key)) {
          warnings.push({
            field: key,
            message: `Unexpected field "${key}" not in schema (will be passed through)`
          });
        }
      });

      setValidationResult({
        valid: errors.length === 0,
        errors,
        warnings
      });

      if (errors.length === 0) {
        toast.success("Payload is valid!");
      } else {
        toast.error(`Found ${errors.length} validation error(s)`);
      }

    } catch (e) {
      setValidationResult({
        valid: false,
        errors: [{
          field: "payload",
          message: `Invalid JSON: ${e instanceof Error ? e.message : "Parse error"}`,
          severity: "error"
        }],
        warnings: []
      });
      toast.error("Invalid JSON format");
    }

    setIsValidating(false);
  };

  // Auto-validate on changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (payload.trim()) {
        validatePayload();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [payload, selectedSchema]);

  const formatPayload = () => {
    try {
      const parsed = JSON.parse(payload);
      setPayload(JSON.stringify(parsed, null, 2));
      toast.success("Payload formatted");
    } catch {
      toast.error("Cannot format invalid JSON");
    }
  };

  return (
    <Card className="border-violet-500/30 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-violet-500" />
            <CardTitle>Webhook Payload Validator</CardTitle>
          </div>
          {validationResult && (
            <Badge 
              variant={validationResult.valid ? "default" : "destructive"}
              className={validationResult.valid ? "bg-green-500" : ""}
            >
              {validationResult.valid ? "Valid" : `${validationResult.errors.length} Error(s)`}
            </Badge>
          )}
        </div>
        <CardDescription>
          Validate incoming webhook payloads against schema templates before processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Schema Selection */}
        <div className="space-y-2">
          <Label>Validation Schema</Label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(defaultSchemas).map(schema => (
              <button
                key={schema}
                onClick={() => setSelectedSchema(schema)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  selectedSchema === schema
                    ? "bg-violet-500 text-white"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                {schema}
              </button>
            ))}
            <button
              onClick={() => setSelectedSchema("custom")}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                selectedSchema === "custom"
                  ? "bg-violet-500 text-white"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              Custom Schema
            </button>
          </div>
        </div>

        {/* Custom Schema Input */}
        {selectedSchema === "custom" && (
          <div className="space-y-2">
            <Label>Custom Schema (JSON Array of Rules)</Label>
            <Textarea
              className="font-mono text-sm min-h-[150px]"
              placeholder='[{"field": "event", "type": "string", "required": true}]'
              value={customSchema}
              onChange={(e) => setCustomSchema(e.target.value)}
            />
          </div>
        )}

        {/* Payload Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Webhook Payload (JSON)</Label>
            <Button variant="ghost" size="sm" onClick={formatPayload}>
              <Code className="h-4 w-4 mr-1" />
              Format
            </Button>
          </div>
          <Textarea
            className="font-mono text-sm min-h-[200px]"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            placeholder='{"event": "payment.completed", ...}'
          />
        </div>

        {/* Validate Button */}
        <Button
          onClick={validatePayload}
          disabled={isValidating}
          className="w-full bg-violet-500 hover:bg-violet-600"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isValidating ? "Validating..." : "Validate Payload"}
        </Button>

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className={`p-4 rounded-lg border ${
              validationResult.valid 
                ? "border-green-500/30 bg-green-500/10" 
                : "border-red-500/30 bg-red-500/10"
            }`}>
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={`font-medium ${validationResult.valid ? "text-green-500" : "text-red-500"}`}>
                  {validationResult.valid 
                    ? "Payload is valid and matches the schema" 
                    : `Payload has ${validationResult.errors.length} validation error(s)`}
                </span>
              </div>
            </div>

            {/* Errors */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <Label className="text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Errors ({validationResult.errors.length})
                </Label>
                <div className="space-y-2">
                  {validationResult.errors.map((error, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded bg-red-500/10 border border-red-500/30 text-sm"
                    >
                      <code className="font-mono text-red-400">{error.field}</code>
                      <span className="text-muted-foreground ml-2">{error.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResult.warnings.length > 0 && (
              <div className="space-y-2">
                <Label className="text-yellow-500 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings ({validationResult.warnings.length})
                </Label>
                <div className="space-y-2">
                  {validationResult.warnings.map((warning, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded bg-yellow-500/10 border border-yellow-500/30 text-sm"
                    >
                      <code className="font-mono text-yellow-400">{warning.field}</code>
                      <span className="text-muted-foreground ml-2">{warning.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Schema Preview */}
            <details className="mt-4">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-2">
                <FileJson className="h-4 w-4" />
                View Current Schema Rules
              </summary>
              <pre className="mt-2 p-3 bg-muted/50 rounded text-xs overflow-x-auto">
                {JSON.stringify(
                  selectedSchema === "custom" 
                    ? (customSchema ? JSON.parse(customSchema) : [])
                    : defaultSchemas[selectedSchema],
                  null,
                  2
                )}
              </pre>
            </details>
          </div>
        )}

        {/* Tips */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">💡 Validation Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Validation runs automatically as you type (500ms debounce)</li>
            <li>• Use regex patterns for strict field format validation</li>
            <li>• Enum values ensure fields contain expected values only</li>
            <li>• Extra fields not in schema generate warnings, not errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookPayloadValidator;

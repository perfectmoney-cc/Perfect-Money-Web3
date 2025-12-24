import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, XCircle, RefreshCw, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
}

export const QRScannerModal = ({ isOpen, onClose, onScan }: QRScannerModalProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.error("Error stopping scanner:", err);
      } finally {
        scannerRef.current = null;
        if (mountedRef.current) {
          setIsScanning(false);
        }
      }
    }
  }, []);

  const startScanner = useCallback(async () => {
    const container = document.getElementById("qr-reader");
    if (!container) {
      console.error("QR reader container not found");
      return;
    }

    // Stop any existing scanner
    await stopScanner();

    try {
      setError(null);
      
      // Request camera permission first using getUserMedia
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: facingMode } 
        });
        // Stop the stream immediately - we just needed permission
        stream.getTracks().forEach(track => track.stop());
      } catch (permErr: any) {
        console.error("Permission error:", permErr);
        if (permErr.name === "NotAllowedError" || permErr.name === "PermissionDeniedError") {
          setError("Camera access denied. Please enable camera permissions in your browser settings.");
          return;
        } else if (permErr.name === "NotFoundError" || permErr.name === "DevicesNotFoundError") {
          setError("No camera found on this device.");
          return;
        } else if (permErr.name === "NotReadableError" || permErr.name === "TrackStartError") {
          setError("Camera is in use by another application.");
          return;
        }
      }

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (!devices || devices.length === 0) {
        setError("No cameras found on this device");
        return;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Try to find the best camera (prefer back camera)
      let cameraConfig: { facingMode: string } | { deviceId: string } = { facingMode };
      
      if (facingMode === "environment") {
        const backCamera = devices.find(d => 
          d.label.toLowerCase().includes("back") || 
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        );
        if (backCamera) {
          cameraConfig = { deviceId: backCamera.id };
        }
      } else {
        const frontCamera = devices.find(d => 
          d.label.toLowerCase().includes("front") || 
          d.label.toLowerCase().includes("user") ||
          d.label.toLowerCase().includes("selfie")
        );
        if (frontCamera) {
          cameraConfig = { deviceId: frontCamera.id };
        }
      }

      await scanner.start(
        cameraConfig,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText) => {
          if (mountedRef.current) {
            onScan(decodedText);
            stopScanner();
            onClose();
            toast.success("QR Code scanned successfully!");
          }
        },
        () => {
          // Ignore scan errors (no QR code found in frame)
        }
      );

      if (mountedRef.current) {
        setIsScanning(true);
      }
    } catch (err: any) {
      console.error("QR Scanner error:", err);
      if (mountedRef.current) {
        if (err.name === "NotAllowedError" || err.message?.includes("Permission")) {
          setError("Camera access denied. Please enable camera permissions in your browser settings.");
        } else if (err.name === "NotFoundError" || err.message?.includes("not found")) {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError" || err.message?.includes("in use")) {
          setError("Camera is in use by another application.");
        } else if (err.message?.includes("OverconstrainedError")) {
          // Try again without specific facing mode
          try {
            const scanner = new Html5Qrcode("qr-reader");
            scannerRef.current = scanner;
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
              await scanner.start(
                { deviceId: devices[0].id },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => {
                  if (mountedRef.current) {
                    onScan(decodedText);
                    stopScanner();
                    onClose();
                    toast.success("QR Code scanned successfully!");
                  }
                },
                () => {}
              );
              if (mountedRef.current) setIsScanning(true);
              return;
            }
          } catch {
            setError("Unable to access any camera on this device.");
          }
        } else {
          setError(`Unable to access camera: ${err.message || "Unknown error"}`);
        }
        toast.error("Camera access failed");
      }
    }
  }, [facingMode, onClose, onScan, stopScanner]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (isOpen) {
      // Delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startScanner();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      stopScanner();
    }

    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  const handleRetry = () => {
    setError(null);
    startScanner();
  };

  const handleSwitchCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    await stopScanner();
    setTimeout(() => startScanner(), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            Scan Voucher QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            id="qr-reader" 
            ref={containerRef}
            className="w-full aspect-square bg-muted rounded-lg overflow-hidden relative"
          >
            {!isScanning && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">
                  Initializing camera...
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
                <XCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleRetry} 
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Camera
              </Button>
            </div>
          )}
          
          {isScanning && (
            <Button 
              variant="outline" 
              onClick={handleSwitchCamera}
              className="w-full"
            >
              <SwitchCamera className="h-4 w-4 mr-2" />
              Switch Camera
            </Button>
          )}
          
          <p className="text-sm text-muted-foreground text-center">
            Position the QR code within the frame to scan
          </p>
          
          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

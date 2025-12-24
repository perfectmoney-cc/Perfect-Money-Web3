import { usePinLock } from "@/hooks/usePinLock";
import { PinLockScreen } from "./PinLockScreen";
import { PinSetupModal } from "./PinSetupModal";

interface PinLockProviderProps {
  children: React.ReactNode;
}

export const PinLockProvider = ({ children }: PinLockProviderProps) => {
  const { isLocked, needsPinSetup, unlock, completePinSetup, isConnected } = usePinLock();

  return (
    <>
      {children}
      
      {/* PIN Setup Modal - shows when wallet connects for first time */}
      {isConnected && needsPinSetup && (
        <PinSetupModal open={needsPinSetup} onComplete={completePinSetup} />
      )}
      
      {/* Lock Screen - shows after 2 minutes of inactivity */}
      {isConnected && isLocked && !needsPinSetup && (
        <PinLockScreen onUnlock={unlock} />
      )}
    </>
  );
};

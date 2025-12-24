import { useState, useEffect, useCallback } from "react";
import { useAccount } from "wagmi";

const DEFAULT_TIMEOUT = 2 * 60 * 1000; // 2 minutes
const EXTENDED_TIMEOUT = 30 * 60 * 1000; // 30 minutes for remembered devices

const getInactivityTimeout = () => {
  const rememberDevice = localStorage.getItem("pm_remember_device") === "true";
  return rememberDevice ? EXTENDED_TIMEOUT : DEFAULT_TIMEOUT;
};

export const usePinLock = () => {
  const { isConnected, address } = useAccount();
  const [isLocked, setIsLocked] = useState(false);
  const [needsPinSetup, setNeedsPinSetup] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Check if PIN setup is needed when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      const pinSetupComplete = localStorage.getItem("pm_pin_setup_complete");
      const storedPin = localStorage.getItem("pm_wallet_pin");
      
      if (!pinSetupComplete || !storedPin) {
        setNeedsPinSetup(true);
        setIsLocked(false);
      } else {
        setNeedsPinSetup(false);
        // Check if was previously locked
        const wasLocked = localStorage.getItem("pm_wallet_locked");
        if (wasLocked === "true") {
          setIsLocked(true);
        }
      }
    } else {
      setNeedsPinSetup(false);
      setIsLocked(false);
    }
  }, [isConnected, address]);

  // Reset activity timer
  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
  }, []);

  // Track user activity
  useEffect(() => {
    if (!isConnected || needsPinSetup) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];
    
    const handleActivity = () => {
      resetActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [isConnected, needsPinSetup, resetActivity]);

  // Check for inactivity and lock
  useEffect(() => {
    if (!isConnected || needsPinSetup || isLocked) return;

    const checkInactivity = () => {
      const now = Date.now();
      const timeout = getInactivityTimeout();
      if (now - lastActivity >= timeout) {
        setIsLocked(true);
        localStorage.setItem("pm_wallet_locked", "true");
      }
    };

    const interval = setInterval(checkInactivity, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [isConnected, needsPinSetup, isLocked, lastActivity]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    localStorage.setItem("pm_wallet_locked", "false");
    setLastActivity(Date.now());
  }, []);

  const completePinSetup = useCallback(() => {
    setNeedsPinSetup(false);
    setLastActivity(Date.now());
  }, []);

  return {
    isLocked,
    needsPinSetup,
    unlock,
    completePinSetup,
    isConnected,
  };
};

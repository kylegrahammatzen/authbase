"use client";

import { useEffect, useRef, useState } from "react";
import {
  AccountState,
  resendAccountEmailVerification,
} from "../actions/auth/auth";
import { toast } from "sonner";

type ResendCooldownProps = {
  accountState: AccountState;
};

export default function ResendCooldown(props: ResendCooldownProps) {
  const [countdown, setCountdown] = useState<number>(60);
  const [lastSent, setLastSent] = useState<number>(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (lastSent) {
      // Calculate the initial countdown value
      const updateCountdown = () => {
        const difference = Math.floor((Date.now() - lastSent) / 1000);
        setCountdown(difference >= 60 ? 0 : 60 - difference);
      };

      updateCountdown(); // Initial update

      // Update countdown every second
      intervalRef.current = setInterval(updateCountdown, 1000);

      // Clear the interval on component unmount or when countdown ends
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [lastSent]);

  async function onEmailVerificationResend() {
    const now = Date.now();
    if (lastSent == null || now - lastSent > 10000) {
      // Trigger resend logic...
      setLastSent(now);
      setCountdown(10);

      const serverResponse = await resendAccountEmailVerification(
        props.accountState
      );

      if (serverResponse.status == "error") {
        toast.error(serverResponse.message);
        return;
      }

      toast.info("Verification code sent");
    }
  }

  return (
    <div className="py-1.5 text-center">
      <button
        onClick={onEmailVerificationResend}
        disabled={countdown > 0}
        className="text-sm" // Apply common styles to the whole button
        type="button" // Ensure this is a button, not a submit input
      >
        Didn't get a code?{" "}
        <span
          className={`underline font-bold ${
            countdown > 0 ? "cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {countdown > 0
            ? `Click to resend in ${countdown}s`
            : "Click to resend"}
        </span>
      </button>
    </div>
  );
}

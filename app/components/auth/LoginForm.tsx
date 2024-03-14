"use client";

import { LOGIN_CALLBACK_URL } from "@/middleware";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  AccountState,
  getAccountSession,
  loginAccount,
} from "../../actions/auth/auth";
import Link from "next/link";
import VerifyEmailForm from "./VerifyEmailForm";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || LOGIN_CALLBACK_URL;
  const [isLoading, setIsLoading] = useState(false);

  // Account verification state
  const [showVerification, setShowVerification] = useState(false);
  const [accountState, setAccountState] = useState<AccountState>({
    accountId: "",
    email: "",
  });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const formData = new FormData(event.currentTarget);

    const formResponse = await loginAccount(formData);

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      setIsLoading(false);
      return;
    }

    if (formResponse.status == "unverified" && formResponse.account) {
      setAccountState({
        accountId: formResponse.account.id,
        email: formResponse.account.email,
      });
      setShowVerification(true);
      setIsLoading(false);
      toast.error(formResponse.message);
      return;
    }

    if (formResponse.status == "success") {
      toast.success(formResponse.message);

      router.push(callbackUrl);
    }
  }

  async function onSubmitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const serverResponse = await getAccountSession(accountState);

    if (serverResponse.status === "error") {
      toast.error(serverResponse.message);
      return;
    }

    toast.success(serverResponse.message);
    router.push(LOGIN_CALLBACK_URL);
  }

  return (
    <>
      {(!showVerification && (
        <>
          <form onSubmit={onSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="block p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="block p-2 border border-gray-300 rounded-md"
              required
            />
            <button
              type="submit"
              className="block p-2 text-white bg-blue-500 rounded-md"
            >
              Login
            </button>
          </form>
          <Link
            href="/sign-up"
            className="block p-2 w-[75px] text-white bg-red-500 rounded-md"
          >
            Sign up
          </Link>
          <Link
            href="/forgot-password"
            className="block p-2 w-36 text-white bg-green-500 rounded-md"
          >
            Forgot Password
          </Link>
        </>
      )) || (
        <VerifyEmailForm
          accountState={accountState}
          onSubmit={onSubmitVerification}
        />
      )}
    </>
  );
}

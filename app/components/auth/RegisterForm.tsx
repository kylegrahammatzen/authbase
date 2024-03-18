"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import {
  AccountState,
  createAccount,
  getAccountSession,
  verifyAccountEmail,
} from "../../actions/auth/auth";
import { useRouter } from "next/navigation";

import Link from "next/link";
import { LOGIN_CALLBACK_URL } from "@/middleware";
import Spinner from "../Spinner";
import ResendCooldown from "../ResendCooldown";
import VerifyForm from "./VerifyForm";

export default function RegisterForm() {
  const router = useRouter();
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

    const formResponse = await createAccount(formData);

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      setIsLoading(false);
      return;
    }

    if (formResponse.status === "success" && formResponse.account) {
      // Now TypeScript knows formResponse.account is defined
      setAccountState({
        accountId: formResponse.account.id,
        email: formResponse.account.email,
      });
      setShowVerification(true);
      setIsLoading(false);

      toast.success(formResponse.message);
    } else {
      toast.error("An error occurred. Please try again later.");
    }
  }

  async function onSubmitVerification(
    code: string,
    setIsLoading: (isLoading: boolean) => void
  ) {
    const formResponse = await verifyAccountEmail(code, accountState);

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      setIsLoading(false);
      return;
    }

    const serverResponse = await getAccountSession(accountState);

    if (serverResponse.status === "error") {
      toast.error(serverResponse.message);
      setIsLoading(false);
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
              type="text"
              name="name"
              placeholder="Name"
              required
              className="block p-2 border rounded-md border-gray-300"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="block p-2 border rounded-md border-gray-300"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="block p-2 border rounded-md border-gray-300"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              className="block p-2 border rounded-md border-gray-300"
            />
            <button
              type="submit"
              className="block p-2 bg-blue-500 text-white rounded-md"
            >
              {isLoading ? <Spinner /> : "Register"}
            </button>
          </form>
          <Link
            href="/sign-in"
            className="block p-2 w-[75px] text-white bg-red-500 rounded-md"
          >
            Sign in
          </Link>
        </>
      )) || (
        <VerifyForm
          buttonText={"Verify account"}
          accountState={accountState}
          onSubmit={onSubmitVerification}
          children={<ResendCooldown accountState={accountState} />}
        />
      )}
    </>
  );
}

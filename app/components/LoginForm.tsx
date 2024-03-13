"use client";

import { LOGIN_CALLBACK_URL } from "@/middleware";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { toast } from "sonner";
import { loginAccount } from "../actions/auth/auth";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || LOGIN_CALLBACK_URL;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formResponse = await loginAccount(formData);

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      return;
    }

    toast.success(formResponse.message);

    router.push(callbackUrl);
  }

  return (
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
  );
}

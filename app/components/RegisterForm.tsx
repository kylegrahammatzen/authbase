"use client";

import { FormEvent } from "react";
import { toast } from "sonner";
import { createAccount } from "../actions/auth/auth";
import { useRouter } from "next/navigation";
import { LOGIN_CALLBACK_URL } from "@/middleware";

export default function RegisterForm() {
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formResponse = await createAccount(formData);

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      return;
    }

    toast.success(formResponse.message);

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));

    router.push(LOGIN_CALLBACK_URL);
  }

  return (
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
        Register
      </button>
    </form>
  );
}

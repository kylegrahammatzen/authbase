"use client";

import { FormEvent } from "react";
import { toast } from "sonner";
import { resetAccountPassword } from "../../actions/auth/auth";
import Link from "next/link";

export default async function ForgotPasswordForm() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formResponse = await resetAccountPassword(formData);

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      return;
    }

    toast.success(formResponse.message);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="block p-2 border border-gray-300 rounded-md"
          required
        />
        <button
          type="submit"
          className="block p-2 text-white bg-blue-500 rounded-md"
        >
          Reset Password
        </button>
      </form>
      <Link
        href="/sign-in"
        className="block p-2 w-[75px] text-white bg-red-500 rounded-md"
      >
        Sign in
      </Link>
    </>
  );
}

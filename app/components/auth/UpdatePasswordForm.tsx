"use client";

import { updatePassword } from "@/app/actions/auth/auth";
import { LOGIN_CALLBACK_URL, LOGOUT_CALLBACK_URL } from "@/middleware";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { toast } from "sonner";

type UpdatePasswordFormProps = {
  accountId: string;
  token: string;
};

export default function UpdatePasswordForm(props: UpdatePasswordFormProps) {
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formResponse = await updatePassword(
      formData,
      props.accountId,
      props.token
    );

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      return;
    }

    if (formResponse.status === "invalid") {
      toast.error(formResponse.message);

      router.push(LOGOUT_CALLBACK_URL);
      return;
    }

    toast.success(formResponse.message);

    router.push(LOGIN_CALLBACK_URL);
  }

  return (
    <>
      <form className="space-y-4" onSubmit={onSubmit}>
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
          Update Password
        </button>
      </form>
    </>
  );
}

"use client";

import { registerAccount } from "@/app/(actions)/(account)/account-register-action";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default function AccountRegisterForm() {
  async function clientAction(formData: FormData) {
    const result = await registerAccount(formData);

    if (result?.has_error) {
      return toast.error(result.error_message);
    }

    return redirect(`/auth/verify?state=${result?.state}`);
  }

  return (
    <form className="space-y-6" action={clientAction}>
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Email address
        </label>
        <div className="mt-2">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Password
        </label>
        <div className="mt-2">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="confirm_password"
          className="block text-sm font-medium leading-6 text-gray-900"
        >
          Confirm Password
        </label>
        <div className="mt-2">
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="confirm-password"
            required
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        >
          Register
        </button>
      </div>
    </form>
  );
}

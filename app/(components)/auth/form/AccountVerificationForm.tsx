"use client";

import { verifyAccount } from "@/app/(actions)/(account)/account-verification-action";
import { redirect } from "next/navigation";
import { toast } from "sonner";

interface FormProps {
  email: string;
}

export default function AccountVerificationForm({ email }: FormProps) {
  async function clientAction(formData: FormData) {
    toast.info("Verifying your account...");

    const result = await verifyAccount(formData, email);

    if (result?.has_error) {
      return toast.error(result?.error_message);
    }

    toast.success("Account verified!");

    return redirect(`/auth/login`);
  }

  return (
    <>
      <form className="space-y-6" action={clientAction}>
        <div>
          <div className="flex justify-center">
            <div className="grid grid-cols-5 gap-5" data-hs-pin-input>
              {[...Array(5)].map((_, i) => (
                <input
                  key={i}
                  name={`code[${i}]`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  pattern="\d"
                  className="block w-14 h-14 rounded-md border-0 text-center text-lg font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                  data-hs-pin-input-item
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="flex w-full justify-center rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Verify account
          </button>
        </div>
      </form>
    </>
  );
}

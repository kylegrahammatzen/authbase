"use client";

import { toast } from "sonner";
import { deleteUserCookie } from "../(actions)/(account)/account-cookie-delete-action";
import { redirect } from "next/navigation";

export default function ProtectedUserCookie() {
  async function clientAction() {
    // Delete user cookie
    const result = await deleteUserCookie();

    if (result?.has_error) {
      return toast.error(result.error_message);
    }

    toast.success("User cookie deleted.");
  }

  return (
    <button
      onClick={clientAction}
      className="flex justify-center rounded-md bg-red-600 my-2 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
    >
      Delete User Cookie
    </button>
  );
}

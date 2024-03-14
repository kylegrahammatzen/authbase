"use client";

import { FormEvent } from "react";
import { logoutAccount } from "../../actions/auth/auth";
import { toast } from "sonner";

export async function LogoutLink() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await logoutAccount();

    toast.success("You have been signed out");
  }

  return (
    <form onSubmit={onSubmit}>
      <button
        type="submit"
        className="block p-2 w-24 text-white bg-red-500 rounded-md"
      >
        Sign out
      </button>
    </form>
  );
}

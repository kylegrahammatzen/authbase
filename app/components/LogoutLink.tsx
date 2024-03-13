"use client";

import { FormEvent } from "react";
import { logoutAccount } from "../actions/auth/auth";
import { toast } from "sonner";

export async function LogoutLink() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await logoutAccount();

    toast.success("You have been signed out");
  }

  return (
    <form onSubmit={onSubmit}>
      <button type="submit" className="text-blue-500">
        Sign out
      </button>
    </form>
  );
}

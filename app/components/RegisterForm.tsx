"use client";

import { FormEvent } from "react";
import { toast } from "sonner";
import { createAccount } from "../actions/auth/auth";

export default function RegisterForm() {
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formResponse = await createAccount(formData);

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      return;
    }

    toast.success(formResponse.message);
  }

  return (
    <form className="space-y-4 md:space-y-4" onSubmit={onSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        className="block p-3 border border-gray-300 rounded-md"
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        className="block p-3 border border-gray-300 rounded-md"
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        className="block p-3 border border-gray-300 rounded-md"
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        className="block p-3 border border-gray-300 rounded-md"
        required
      />
      <button
        type="submit"
        className="block p-3 text-white bg-blue-500 rounded-md"
      >
        Register
      </button>
    </form>
  );
}

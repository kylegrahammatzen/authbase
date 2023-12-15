"use server";

import { cookies } from "next/headers";

export const deleteUserCookie = async (): Promise<
  | {
      has_error: boolean;
      error_message: string;
    }
  | undefined
> => {
  try {
    cookies().delete("user-token");

    return {
      has_error: false,
      error_message: "",
    };
  } catch (error) {
    return {
      has_error: true,
      error_message: "Error deleting cookie",
    };
  }
};

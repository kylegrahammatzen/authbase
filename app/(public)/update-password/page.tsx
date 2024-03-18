import { checkAuthToken } from "@/app/actions/auth/auth";
import UpdatePasswordForm from "@/app/components/auth/UpdatePasswordForm";
import { LOGOUT_CALLBACK_URL } from "@/middleware";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: {
    token: string;
  };
};

export default async function UpdatePasswordPage(props: PageProps) {
  if (!props.searchParams.token) {
    redirect(LOGOUT_CALLBACK_URL);
  }

  const { token } = props.searchParams;

  // Check if the token is used/expired
  const serverResponse = await checkAuthToken(token);

  if (serverResponse.status === "error") {
    redirect(LOGOUT_CALLBACK_URL);
  }

  if (
    serverResponse.status !== "success" ||
    serverResponse.account === undefined
  ) {
    redirect(LOGOUT_CALLBACK_URL);
  }

  return (
    <>
      <UpdatePasswordForm accountId={serverResponse.account.id} token={token} />
    </>
  );
}

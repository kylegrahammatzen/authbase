import { getAccount } from "@/app/actions/auth/auth";
import { LogoutLink } from "@/app/components/LogoutLink";

export default async function ProtectedPage() {
  const account = await getAccount();

  console.log("Account:");
  console.log(account);

  return (
    <>
      <div>Protected Page</div>
      <LogoutLink />
    </>
  );
}

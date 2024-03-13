import { getAccount } from "@/app/actions/auth/auth";
import { LogoutLink } from "@/app/components/LogoutLink";

export default async function ProtectedPage() {
  const account = await getAccount();

  console.log("Account", account);

  return (
    <>
      <div>Protected Page</div>
      <div>
        <pre>{JSON.stringify(account, null, 2)}</pre>
      </div>
      <LogoutLink />
    </>
  );
}

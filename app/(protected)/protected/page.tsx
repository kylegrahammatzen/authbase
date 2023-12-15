import ProtectedUserCookie from "@/app/(components)/ProtectedUserCookie";
import { getUserSession } from "@/lib/auth/auth";

export default async function ProtectedPage() {
  const user = await getUserSession();

  console.log("User id:", user.session?.user_id);

  return (
    <>
      <h1>Protected</h1>
      <p>
        This page is protected. You must be logged in to view this page. If you
        are logged in, you will see your user id in server console.
      </p>
      <ProtectedUserCookie />
    </>
  );
}

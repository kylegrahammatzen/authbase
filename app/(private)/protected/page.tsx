import { LogoutLink } from "@/app/components/LogoutLink";

export default function ProtectedPage() {
  return (
    <>
      <div>Protected Page</div>
      <LogoutLink />
    </>
  );
}

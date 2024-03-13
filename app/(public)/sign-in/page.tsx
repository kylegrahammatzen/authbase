import LoginForm from "@/app/components/LoginForm";
import Link from "next/link";

export default function page() {
  return (
    <>
      <LoginForm />
      <Link href="/sign-up" className="text-red-500">
        Sign up
      </Link>
    </>
  );
}

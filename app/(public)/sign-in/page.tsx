import LoginForm from "@/app/components/LoginForm";
import Link from "next/link";

export default function page() {
  return (
    <>
      <LoginForm />
      <Link
        href="/sign-up"
        className="block p-2 w-[75px] text-white bg-red-500 rounded-md"
      >
        Sign up
      </Link>
    </>
  );
}

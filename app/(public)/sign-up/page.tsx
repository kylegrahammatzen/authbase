import RegisterForm from "@/app/components/RegisterForm";
import Link from "next/link";

export default function page() {
  return (
    <>
      <RegisterForm />
      <Link
        href="/sign-in"
        className="block p-2 w-[75px] text-white bg-red-500 rounded-md"
      >
        Sign in
      </Link>
    </>
  );
}

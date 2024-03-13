import RegisterForm from "@/app/components/RegisterForm";
import Link from "next/link";

export default function page() {
  return (
    <>
      <RegisterForm />
      <Link href="/sign-in" className="text-red-500">
        Sign in
      </Link>
    </>
  );
}

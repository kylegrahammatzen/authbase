import AccountEmailEncryption from "@/app/(components)/auth/AccountEmailEncryption";
import AccountVerificationForm from "@/app/(components)/auth/form/AccountVerificationForm";
import { decrypt } from "@/lib/auth/security";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function VerifyPage({
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  if (searchParams === undefined) {
    redirect("/auth/login");
  }

  const state = searchParams.state as string;

  let emailDecoded;

  try {
    emailDecoded = decrypt(state);
  } catch (error) {
    redirect("/auth/login");
  }

  const email = emailDecoded.split("email=")[1];

  return (
    <>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=red&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Check your account email
          </h2>
          <AccountEmailEncryption email={email} />
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <AccountVerificationForm email={email} />
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <p className="mt-6 text-center text-sm text-gray-500">
            Didn't get the email?{" "}
            <Link
              href="/auth/login"
              className="font-semibold leading-6 text-red-600 hover:text-red-500"
            >
              Login again
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

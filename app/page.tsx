import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <h1>Landing</h1>
      <p>
        This is the landing page. It is not protected. You can view this page
        without being logged in.
      </p>
      <Link href="/protected" className="text-blue-500">
        Go to protected page
      </Link>
      <br />
      <Link href="/sign-in" className="text-red-500">
        Sign in to view protected page
      </Link>
    </>
  );
}

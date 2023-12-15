import Link from "next/link";

export default function Home() {
  return (
    <>
      <h1>Home</h1>
      <p>
        This is the home page. It is not protected. You can view this page
        without being logged in.
      </p>
      <ul>
        <h2 className="text-md font-semibold text-gray-900 my-4">Options</h2>
        <li>
          <Link
            href="/auth/login"
            className="text-red-600 hover:text-red-500 transition duration-150 ease-in-out"
          >
            Login
          </Link>
        </li>
        <li>
          <Link
            href="/auth/register"
            className="text-red-600 hover:text-red-500 transition duration-150 ease-in-out"
          >
            Register
          </Link>
        </li>
        <li>
          <Link
            href="/protected"
            className="text-red-600 hover:text-red-500 transition duration-150 ease-in-out"
          >
            Protected Page
          </Link>
        </li>
      </ul>
    </>
  );
}

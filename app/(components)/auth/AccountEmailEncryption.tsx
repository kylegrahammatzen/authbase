interface ComponentProps {
  email: string;
}

export default function AccountVerificationForm({ email }: ComponentProps) {
  return (
    <p className="text-center text-sm font-medium leading-6 text-gray-900 dark:text-gray-300">
      We sent a code to <span className="underline">{email}</span>
    </p>
  );
}

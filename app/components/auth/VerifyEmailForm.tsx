"use client";

import {
  AccountEmailCode,
  AccountState,
  verifyAccountEmail,
} from "@/app/actions/auth/auth";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "../Spinner";
import ResendCooldown from "../ResendCooldown";

type VerifyEmailFormProps = {
  accountState: AccountState;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
};

export default function VerifyEmailForm(props: VerifyEmailFormProps) {
  const [codeState, setCodeState] = useState<AccountEmailCode>({
    code1: "",
    code2: "",
    code3: "",
    code4: "",
    code5: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fieldsRef = useRef<HTMLDivElement>(null);

  const inputFocus: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const currentIndex = Number(e.currentTarget.dataset.index);
    const isDigit = e.key.match(/^\d$/);

    let nextIndex =
      currentIndex +
      (isDigit ? 1 : e.key === "Backspace" || e.key === "Delete" ? -1 : 0);

    // Check if fieldsRef.current is not null before accessing children
    if (fieldsRef.current) {
      const nextInput = fieldsRef.current.children.item(
        nextIndex
      ) as HTMLInputElement;

      if (nextInput) nextInput.focus();
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement>,
    codeNumber: number
  ) => {
    let newValue = e.target.value.slice(-1);
    const key = `code${codeNumber}` as keyof AccountEmailCode;

    if (!/^\d$/.test(newValue)) {
      newValue = "";
    }

    setCodeState((prevState) => ({
      ...prevState,
      [key]: newValue,
    }));
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Check if all fields are filled
    const isAllFieldsFilled = Object.values(codeState).every(
      (value) => value.length > 0
    );

    if (!isAllFieldsFilled) {
      return toast.error("Please fill all fields");
    }

    setIsLoading(true);

    const numbersArray = Object.values(codeState).map((key) =>
      parseInt(key.replace("code", ""))
    );

    const formResponse = await verifyAccountEmail(
      numbersArray,
      props.accountState
    );

    if (formResponse.status == "error") {
      toast.error(formResponse.message);
      setIsLoading(false);
      return;
    }

    props.onSubmit(event);
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col items-center justify-center">
        <div ref={fieldsRef} className="grid grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => (
            <input
              key={i}
              data-index={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              pattern="\d"
              className="block w-14 h-14 rounded-md border-0 text-center text-lg font-bold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 focus:outline-none"
              placeholder="0"
              value={codeState[`code${i + 1}` as keyof AccountEmailCode]}
              onChange={(e) => handleChange(e, i + 1)}
              onKeyUp={inputFocus}
              disabled={isLoading}
            />
          ))}
        </div>
        <ResendCooldown accountState={props.accountState} />
        <button
          type="submit"
          className="flex justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {!isLoading ? "Verify account" : <Spinner />}
        </button>
      </div>
    </form>
  );
}

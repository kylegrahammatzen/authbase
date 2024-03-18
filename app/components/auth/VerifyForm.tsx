import { AccountEmailCode, AccountState } from "@/app/actions/auth/auth";
import { FormEvent, useRef, useState } from "react";
import ResendCooldown from "../ResendCooldown";
import Spinner from "../Spinner";
import { toast } from "sonner";

type VerifyFormProps = {
  buttonText: string;
  accountState: AccountState;
  onSubmit: (
    code: string,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
  ) => Promise<void>;
  children?: React.ReactNode;
};

export default function VerifyForm(props: VerifyFormProps) {
  const [codeState, setCodeState] = useState({
    code1: "",
    code2: "",
    code3: "",
    code4: "",
    code5: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const fieldsRef = useRef<HTMLDivElement>(null);

  const inputFocus: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    const currentIndex = Number(event.currentTarget.dataset.index);
    const isDigit = event.key.match(/^\d$/);

    let nextIndex =
      currentIndex +
      (isDigit ? 1 : event.key === "Backspace" || e.key === "Delete" ? -1 : 0);

    // Check if fieldsRef.current is not null before accessing children
    if (fieldsRef.current) {
      const nextInput = fieldsRef.current.children.item(
        nextIndex
      ) as HTMLInputElement;

      if (nextInput) nextInput.focus();
    }
  };

  async function onChange(
    event: React.ChangeEvent<HTMLInputElement>,
    codeNumber: number
  ) {
    const newValue = event.target.value.slice(-1);
    if (/^\d$/.test(newValue)) {
      setCodeState((prev) => ({ ...prev, [`code${codeNumber}`]: newValue }));
      // Automatically move focus to next input if applicable
      const nextSibling = event.target.nextElementSibling as HTMLInputElement;
      if (nextSibling) nextSibling.focus();
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    // Check if all fields are filled
    const isAllFieldsFilled = Object.values(codeState).every(
      (value) => value.length > 0
    );

    if (!isAllFieldsFilled) {
      setIsLoading(false);
      toast.error("Please fill all fields");
      return;
    }

    const code = Object.values(codeState)
      .map((key) => key)
      .join("");
    await props.onSubmit(code, setIsLoading);
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
              onChange={(e) => onChange(e, i + 1)}
              onKeyUp={inputFocus}
              disabled={isLoading}
            />
          ))}
        </div>
        {props.children}
        <button
          type="submit"
          className="flex justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {!isLoading ? `${props.buttonText}` : <Spinner />}
        </button>
      </div>
    </form>
  );
}

import Form from "next/form";

import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  mode = "login",
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultEmail?: string;
  mode?: "login" | "register";
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      {mode === "register" && (
        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-zinc-600 dark:text-zinc-400"
            htmlFor="name"
          >
            Name
          </Label>

          <Input
            autoComplete="name"
            autoFocus
            className="bg-muted text-md md:text-sm"
            id="name"
            name="name"
            placeholder="홍길동"
            type="text"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label
          className="font-normal text-zinc-600 dark:text-zinc-400"
          htmlFor="email"
        >
          Email Address
        </Label>

        <Input
          autoComplete="email"
          autoFocus={mode === "login"}
          className="bg-muted text-md md:text-sm"
          defaultValue={defaultEmail}
          id="email"
          name="email"
          placeholder="user@acme.com"
          required
          type="email"
        />
      </div>

      {mode === "register" && (
        <div className="flex flex-col gap-2">
          <Label
            className="font-normal text-zinc-600 dark:text-zinc-400"
            htmlFor="phone"
          >
            Phone Number
          </Label>

          <Input
            autoComplete="tel"
            className="bg-muted text-md md:text-sm"
            id="phone"
            name="phone"
            placeholder="010-1234-5678"
            type="tel"
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label
          className="font-normal text-zinc-600 dark:text-zinc-400"
          htmlFor="password"
        >
          Password
        </Label>

        <Input
          className="bg-muted text-md md:text-sm"
          id="password"
          name="password"
          required
          type="password"
        />
      </div>

      {children}
    </Form>
  );
}

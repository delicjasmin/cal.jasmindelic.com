import * as React from "react";

import { Input } from "./input";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    return (
      <Input
        type={showPassword ? "test" : "password"}
        className={className}
        {...props}
        ref={ref}
        suffix={
          showPassword ? (
            <EyeIcon width="20px" onClick={() => setShowPassword(false)} />
          ) : (
            <EyeOffIcon width="20px" onClick={() => setShowPassword(true)} />
          )
        }
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

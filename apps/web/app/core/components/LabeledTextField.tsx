import { forwardRef, PropsWithoutRef, ComponentPropsWithoutRef } from "react";
import { useFormContext } from "react-hook-form";

export interface LabeledTextFieldProps
  extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string;
  /** Field label. */
  label: string;
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number";
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>;
  labelProps?: ComponentPropsWithoutRef<"label">;
}

export const LabeledTextField = forwardRef<
  HTMLInputElement,
  LabeledTextFieldProps
  // eslint-disable-next-line prefer-arrow-callback
>(function LabeledTextField({ label, outerProps, labelProps, name, ...props }) {
  const {
    register,
    formState: { isSubmitting, errors },
  } = useFormContext();
  const error = Array.isArray(errors[name])
    ? (errors[name] as unknown as string[]).join(", ")
    : errors[name]?.message || errors[name];

  return (
    <div {...outerProps}>
      <label {...labelProps}>
        {label}
        <input disabled={isSubmitting} {...register(name)} {...props} />
      </label>

      {error && (
        <div role="alert" style={{ color: "red" }}>
          {error as string}
        </div>
      )}
    </div>
  );
});

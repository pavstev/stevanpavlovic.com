import { cn } from "@client/utils";
import { Label } from "@components/ui/label";
import { type AnyFieldApi } from "@tanstack/react-form";
import { Slot } from "radix-ui";
import * as React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormContext = React.createContext<any>(null);

export const Form = ({
  children,
  form,
  ...props
}: React.ComponentProps<"form"> & {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}): React.JSX.Element => (
  <FormContext.Provider value={form}>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      {...props}
    >
      {children}
    </form>
  </FormContext.Provider>
);

type FormFieldContextValue = {
  fieldApi: AnyFieldApi;
};

export const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

export const FormField = ({
  children,
  ...props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any & {
  children: (field: AnyFieldApi) => React.ReactNode;
  name: string;
}): React.JSX.Element => {
  const form = React.useContext(FormContext);
  if (!form) {
    throw new Error("FormField should be used within <Form>");
  }

  return (
    <form.Field
      {...props}
      children={(field: AnyFieldApi) => (
        <FormFieldContext.Provider value={{ fieldApi: field }}>
          {children(field)}
        </FormFieldContext.Provider>
      )}
    />
  );
};

export const useFormField = (): {
  error: string | undefined;
  formDescriptionId: string;
  formItemId: string;
  formMessageId: string;
  id: string;
  name: string;
} => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { fieldApi } = fieldContext;
  const { id } = itemContext;

  const error = fieldApi.state.meta.errors[0];

  return {
    error,
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    id,
    name: fieldApi.name,
  };
};

type FormItemContextValue = {
  id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

export const FormItem = ({
  className,
  ...props
}: React.ComponentProps<"div">): React.JSX.Element => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("grid gap-2", className)} data-slot="form-item" {...props} />
    </FormItemContext.Provider>
  );
};

export const FormControl = ({
  ...props
}: React.ComponentProps<typeof Slot.Root>): React.JSX.Element => {
  const { error, formDescriptionId, formItemId, formMessageId } = useFormField();

  return (
    <Slot.Root
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      data-slot="form-control"
      id={formItemId}
      {...props}
    />
  );
};

export const FormLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof Label>): React.JSX.Element => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn("data-[error=true]:text-destructive", className)}
      data-error={!!error}
      data-slot="form-label"
      htmlFor={formItemId}
      {...props}
    />
  );
};

export const FormDescription = ({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
};

export const FormMessage = ({
  className,
  ...props
}: React.ComponentProps<"p">): React.JSX.Element => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error) : props.children;

  if (!body) {
    return <></>;
  }

  return (
    <p
      className={cn("text-sm text-destructive", className)}
      data-slot="form-message"
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  );
};

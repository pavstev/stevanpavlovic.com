import { cn } from "@client/utils";
import { Label } from "@components/ui/label";
import { type AnyFieldApi } from "@tanstack/react-form";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type FC,
  type JSX,
  type ReactNode,
  useContext,
  useId,
} from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FormContext = createContext<any>(null);

export const Form = ({
  children,
  form,
  ...props
}: ComponentProps<"form"> & {
  children: ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
}): JSX.Element => (
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

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue);

export const FormField = ({
  children,
  ...props
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any & {
  children: (field: AnyFieldApi) => ReactNode;
  name: string;
}): JSX.Element => {
  const form = useContext(FormContext);
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

const useFormField = (): {
  error: string | undefined;
  formDescriptionId: string;
  formItemId: string;
  formMessageId: string;
  id: string;
  name: string;
} => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);

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

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue);

export const FormItem: FC<ComponentProps<"div">> = ({ className, ...props }) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("grid gap-2", className)} data-slot="form-item" {...props} />
    </FormItemContext.Provider>
  );
};

export const FormControl: FC<ComponentProps<typeof Slot.Root>> = ({ ...props }) => {
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

export const FormLabel: FC<ComponentProps<typeof Label>> = ({ className, ...props }) => {
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

const FormDescription: FC<ComponentProps<"p">> = ({ className, ...props }) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="form-description"
      id={formDescriptionId}
      {...props}
    />
  );
};

export const FormMessage: FC<ComponentProps<"p">> = ({ className, ...props }) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error) : props.children;

  if (!body) {
    return <></>;
  }

  return (
    <p
      className={cn("text-destructive text-sm", className)}
      data-slot="form-message"
      id={formMessageId}
      {...props}
    >
      {body}
    </p>
  );
};

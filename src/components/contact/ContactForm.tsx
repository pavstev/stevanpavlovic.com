import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import * as React from "react";
import { z } from "zod";

const contactFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const ContactForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const form = useForm({
    defaultValues: {
      email: "",
      message: "",
      name: "",
      subject: "",
    } as ContactFormValues,
    onSubmit: async ({ value }) => {
      // Simulate API call
      console.log("Form submitted:", value);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Message sent successfully!");
      onSuccess?.();
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: contactFormSchema,
    },
  });

  return (
    <Form className="space-y-4" form={form}>
      <FormField
        children={(field) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="John Doe"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        name="name"
      />

      <FormField
        children={(field) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="john.doe@example.com"
                type="email"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        name="email"
      />

      <FormField
        children={(field) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <FormControl>
              <Input
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Project Inquiry"
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        name="subject"
      />

      <FormField
        children={(field) => (
          <FormItem>
            <FormLabel>Message</FormLabel>
            <FormControl>
              <Textarea
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Tell me about your project..."
                value={field.state.value}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
        name="message"
      />

      <div className="flex justify-end pt-4">
        <form.Subscribe
          children={([canSubmit, isSubmitting]) => (
            <Button disabled={!canSubmit || isSubmitting} type="submit">
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          )}
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        />
      </div>
    </Form>
  );
};

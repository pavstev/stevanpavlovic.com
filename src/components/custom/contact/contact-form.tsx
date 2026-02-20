import { Button } from "@components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@components/ui/form";
import { Icon } from "@components/ui/icon";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { motion } from "framer-motion";
import { type FC, useState } from "react";
import { z } from "zod";

const contactFormSchema = z.object({
  email: z.email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export const ContactForm: FC<{
  onSuccess?: () => void;
}> = ({ onSuccess }) => {
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      message: "",
      name: "",
      subject: "",
    } as ContactFormValues,
    onSubmit: async ({ value }) => {
      console.log("Form submitted:", value);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        setIsSuccess(false);
      }, 2000);
    },
    validators: {
      onChange: contactFormSchema,
    },
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (isSuccess) {
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-4 py-12 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
      >
        <div className="bg-primary/10 text-primary ring-primary/20 ring-offset-background rounded-full p-4 ring-2 ring-offset-2">
          <Icon className="size-8" name="mdi:sparkles" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Message Sent!</h3>
          <p className="text-muted-foreground">
            Thanks for reaching out. I'll get back to you soon.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <Form className="space-y-4" form={form}>
      <motion.div
        animate="show"
        className="space-y-4"
        initial="hidden"
        variants={containerVariants}
      >
        <motion.div className="grid gap-4 md:grid-cols-2" variants={itemVariants}>
          <FormField
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background/50 focus:bg-background backdrop-blur-sm transition-all"
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
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background/50 focus:bg-background backdrop-blur-sm transition-all"
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="john@example.com"
                    type="email"
                    value={field.state.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
            name="email"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormField
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input
                    className="bg-background/50 focus:bg-background backdrop-blur-sm transition-all"
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
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormField
            children={(field: AnyFieldApi) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea
                    className="bg-background/50 focus:bg-background min-h-[120px] backdrop-blur-sm transition-all"
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
        </motion.div>

        <motion.div className="flex justify-end pt-2" variants={itemVariants}>
          <form.Subscribe<{ canSubmit: boolean; isSubmitting: boolean }>
            children={({ canSubmit, isSubmitting }) => (
              <Button
                className="w-full md:w-auto"
                disabled={!canSubmit || isSubmitting}
                size="lg"
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      className="mr-2 size-4 rounded-full border-2 border-current border-t-transparent"
                      transition={{ duration: 1, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Icon className="ml-2 size-4" name="mdi:send" />
                  </>
                )}
              </Button>
            )}
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          />
        </motion.div>
      </motion.div>
    </Form>
  );
};
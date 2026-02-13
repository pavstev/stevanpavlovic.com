import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import * as React from "react";

import { ContactForm } from "./ContactForm";

export const ContactDialog = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className="rounded-full px-8 text-lg font-medium shadow-lg transition-all hover:shadow-xl"
          size="lg"
        >
          Contact Me
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send Message</DialogTitle>
          <DialogDescription>
            Fill out the form below and I'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <ContactForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

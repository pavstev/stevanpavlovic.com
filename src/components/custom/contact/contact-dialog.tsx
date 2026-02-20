import { Button } from "@components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@components/ui/dialog";
import { type FC, useState } from "react";

import { ContactForm } from "./contact-form";

export const ContactDialog: FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className="group relative overflow-hidden rounded-full transition-all hover:shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.5)]"
          size="lg"
        >
          <span className="relative z-10 flex items-center gap-2">Contact Me</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border/50 bg-background/95 backdrop-blur-xl sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            Let's work together
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Fill out the form below and I'll get back to you as soon as possible.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ContactForm onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
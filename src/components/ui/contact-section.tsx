import type React from "react";

import { cn } from "@client/utils";
import { FullWidthDivider } from "@components/ui/full-width-divider";
import { Github, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";

import { PROFILE, SOCIALS } from "../../config";

type ContactBox = React.ComponentProps<"div"> & {
  description: string;
  icon: React.ReactNode;
  title: string;
};

export const ContactSection = () => (
  <div className="relative mx-auto min-h-screen max-w-5xl border-x bg-background">
    <div className="flex grow flex-col justify-center px-4 py-18 md:items-center">
      <h1 className="text-4xl font-bold md:text-5xl">Contact Us</h1>
      <p className="mb-5 text-base text-muted-foreground">Contact {PROFILE.name}.</p>
    </div>
    <FullWidthDivider />
    <div className="grid md:grid-cols-2">
      <Box description="We respond to all emails within 24 hours." icon={<Mail />} title="Email">
        <a
          className="font-mono text-sm font-medium tracking-wide hover:underline"
          href={`mailto:${PROFILE.email}`}
        >
          {PROFILE.email}
        </a>
      </Box>
      {/* <Box
					description="Drop by our office for a chat."
					icon={<MapPin />}
					title="Location"
				>
					<span className="font-medium font-mono text-sm tracking-wide">
						{PROFILE.location}
					</span>
				</Box> */}
      <Box
        className="border-b-0 md:border-r-0"
        description="Connect on social media."
        icon={<Phone />} // Using Phone as a placeholder for "Connect", or maybe Share?
        title="Socials"
      >
        <div className="flex flex-col gap-1">
          {SOCIALS.map((social) => (
            <a
              className="block font-mono text-sm font-medium tracking-wide hover:underline"
              href={social.href}
              key={social.name}
            >
              {social.name}
            </a>
          ))}
        </div>
      </Box>
    </div>
    <FullWidthDivider />
    <div className="z-1 flex h-full flex-col items-center justify-center gap-4 py-24">
      <h2 className="text-center text-2xl font-medium tracking-tight text-muted-foreground md:text-3xl">
        Find us <span className="text-foreground">online</span>
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        {SOCIALS.map((link) => {
          const IconComp = getSocialIcon(link.name);
          return (
            <a
              className="flex items-center gap-x-2 rounded-full border bg-card px-3 py-1.5 shadow hover:bg-accent"
              href={link.href}
              key={link.name}
              rel="noopener noreferrer"
              target="_blank"
            >
              <IconComp className="size-3.5 text-muted-foreground" />
              <span className="font-mono text-xs font-medium tracking-wide">{link.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  </div>
);

const Box = ({ children, className, description, title, ...props }: ContactBox) => (
  <div
    className={cn("flex flex-col justify-between border-b md:border-r md:border-b-0", className)}
  >
    <div
      className={cn(
        "flex items-center gap-x-3 border-b bg-secondary/50 p-4 dark:bg-secondary/20",
        "[&_svg]:stroke-width-1 [&_svg]:size-5 [&_svg]:text-muted-foreground"
      )}
    >
      {props.icon}
      <h2 className="font-heading text-lg font-medium tracking-wider">{title}</h2>
    </div>
    <div className="flex items-center gap-x-2 p-4 py-12">{children}</div>
    <div className="border-t p-4">
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

// Helper to map config social names to Lucide icons
const getSocialIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "email":
      return Mail;
    case "github":
      return Github;
    case "linkedin":
      return Linkedin;
    case "twitter":
      return Twitter;
    case "x":
      return Twitter;
    default:
      return Mail;
  }
};

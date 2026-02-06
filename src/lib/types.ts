import type { ImageMetadata } from "astro";

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface Experience {
  company: string;
  description: string;
  endDate?: string;
  period?: string;
  role: string;
  startDate: string;
}

export interface Profile {
  avatar?: ImageMetadata;
  email: string;
  location: string;
  name: string;
  phone?: string;
  role: string;
  summary: string;
  website?: string;
}

export interface ResumeData {
  education: Education[];
  experience: Experience[];
  profile: Profile;
  skills: string[];
}

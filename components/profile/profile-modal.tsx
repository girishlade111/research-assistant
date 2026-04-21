"use client";

import { Instagram, Linkedin, Github, Code2, Mail, Globe, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const socialLinks = [
  {
    name: "Website",
    url: "https://ladestack.in",
    icon: Globe,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    name: "GitHub",
    url: "https://github.com/girishlade111",
    icon: Github,
    color: "text-foreground",
    bg: "bg-foreground/10",
    border: "border-foreground/20",
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/girish-lade-075bba201/",
    icon: Linkedin,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    border: "border-blue-600/20",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/girish_lade_/",
    icon: Instagram,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
  },
  {
    name: "CodePen",
    url: "https://codepen.io/Girish-Lade-the-looper",
    icon: Code2,
    color: "text-foreground",
    bg: "bg-foreground/10",
    border: "border-foreground/20",
  },
  {
    name: "Email",
    url: "mailto:admin@ladestack.in",
    icon: Mail,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
];

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading tracking-tight">Developer Profile</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Connect with Girish Lade across the web.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col items-center space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
            <span className="text-3xl font-heading font-bold text-primary">GL</span>
          </div>
          
          <div className="text-center space-y-1">
            <h3 className="text-lg font-medium text-foreground">Girish Lade</h3>
            <p className="text-sm text-muted-foreground">Full Stack Developer</p>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-3 rounded-xl border p-3 transition-all hover:scale-[1.02] ${link.border} bg-background hover:${link.bg}`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${link.bg} ${link.color}`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{link.name}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground/50" />
              </a>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

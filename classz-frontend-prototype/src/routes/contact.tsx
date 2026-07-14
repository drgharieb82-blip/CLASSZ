import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { GlowCard } from "@/components/premium/GlowCard";
import { GradientButton } from "@/components/premium/GradientButton";
import { FloatingParticles } from "@/components/premium/FloatingParticles";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — CLASSZ" },
      { name: "description", content: "Get in touch with the CLASSZ team. We'd love to hear from students, teachers and parents." },
      { property: "og:title", content: "Contact — CLASSZ" },
      { property: "og:description", content: "Get in touch with the CLASSZ team." },
    ],
  }),
  component: ContactPage,
});

const info = [
  { icon: Mail, label: "Email", value: "hello@classz.io" },
  { icon: Phone, label: "Phone", value: "+1 (555) 010-2025" },
  { icon: MapPin, label: "Office", value: "123 Learning Ave, Knowledge City" },
];

function ContactPage() {
  return (
    <PublicLayout>
      <section className="relative overflow-hidden">
        <FloatingParticles />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Let's talk</h1>
            <p className="mt-3 max-w-md text-muted-foreground">Questions, feedback or partnership ideas? Our team usually replies within one business day.</p>
            <div className="mt-8 space-y-4">
              {info.map((it) => (
                <div key={it.label} className="flex items-center gap-4">
                  <span className="grid h-11 w-11 place-items-center rounded-xl gradient-brand text-white shadow-md">
                    <it.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs text-muted-foreground">{it.label}</p>
                    <p className="font-medium">{it.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <GlowCard>
            <form
              className="space-y-4 p-7"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Message sent! We'll get back to you soon.");
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" required placeholder="Your name" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required placeholder="you@email.com" className="rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="How can we help?" className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={5} placeholder="Tell us more…" className="rounded-xl" />
              </div>
              <GradientButton type="submit" className="w-full">
                Send message <Send className="h-4 w-4" />
              </GradientButton>
            </form>
          </GlowCard>
        </div>
      </section>
    </PublicLayout>
  );
}

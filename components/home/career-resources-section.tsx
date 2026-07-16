import { Banknote, Bookmark, FileText, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/typography/heading";
import { Card, CardContent } from "@/components/ui/card";

interface Resource {
  href: string;
  icon: LucideIcon;
  title: string;
  tint: string;
}

const RESOURCES: Resource[] = [
  { href: "/career-advice", icon: FileText, title: "Career Advice", tint: "bg-blue-100 text-blue-700" },
  { href: "/salary-guide", icon: Banknote, title: "Salary Guide", tint: "bg-emerald-100 text-emerald-700" },
  { href: "/saved", icon: Bookmark, title: "Saved Jobs", tint: "bg-amber-100 text-amber-700" },
  { href: "/jobs", icon: Search, title: "Browse All Jobs", tint: "bg-violet-100 text-violet-700" },
];

/** Homepage "Career Resources" shortcut row — real, working destinations only (no dead links). */
export function CareerResourcesSection() {
  return (
    <Section className="bg-surface" aria-labelledby="career-resources-heading">
      <Container className="flex flex-col gap-6 sm:gap-10">
        <Heading level="h2" as="h2" id="career-resources-heading" className="text-center text-xl sm:text-h2">
          Career Resources
        </Heading>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {RESOURCES.map((r) => (
            <Link key={r.href} href={r.href} className="block h-full">
              <Card className="h-full transition-shadow hover:shadow-soft-lg">
                <CardContent className="flex flex-col items-center gap-2 p-4 text-center sm:p-6">
                  <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${r.tint}`}>
                    <r.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-foreground">{r.title}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}

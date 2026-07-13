"use client";

import {
  Braces,
  Building2,
  ImageIcon,
  Mail,
  Search,
  Settings2,
  Share2,
  SlidersHorizontal,
} from "lucide-react";

import { BehaviorSettingsForm } from "@/components/admin/settings/behavior-settings-form";
import { BrandingSettingsPanel } from "@/components/admin/settings/branding-settings-panel";
import { ContactSettingsForm } from "@/components/admin/settings/contact-settings-form";
import { EmailSettingsForm } from "@/components/admin/settings/email-settings-form";
import { GeneralSettingsForm } from "@/components/admin/settings/general-settings-form";
import { GoogleSettingsForm } from "@/components/admin/settings/google-settings-form";
import { SeoSettingsForm } from "@/components/admin/settings/seo-settings-form";
import { SocialSettingsForm } from "@/components/admin/settings/social-settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WebsiteSettings } from "@/lib/settings-registry";

/**
 * `/admin/settings`'s tabbed shell — one tab per section, matching the
 * spec's eight sections exactly (Branding is its own tab rather than
 * folded into General, since its upload widgets have a materially
 * different interaction model than a text form). All eight sections'
 * current values are fetched once, server-side, and handed down as
 * props — each tab's form only re-fetches nothing; saving one section
 * doesn't require navigating away from or reloading the others.
 */
export function SettingsTabs({ settings }: { settings: WebsiteSettings }) {
  return (
    <Tabs defaultValue="general">
      <TabsList>
        <TabsTrigger value="general" className="gap-1.5">
          <Settings2 className="h-4 w-4" /> General
        </TabsTrigger>
        <TabsTrigger value="contact" className="gap-1.5">
          <Building2 className="h-4 w-4" /> Contact
        </TabsTrigger>
        <TabsTrigger value="social" className="gap-1.5">
          <Share2 className="h-4 w-4" /> Social Media
        </TabsTrigger>
        <TabsTrigger value="seo" className="gap-1.5">
          <Search className="h-4 w-4" /> SEO
        </TabsTrigger>
        <TabsTrigger value="google" className="gap-1.5">
          <Braces className="h-4 w-4" /> Google
        </TabsTrigger>
        <TabsTrigger value="email" className="gap-1.5">
          <Mail className="h-4 w-4" /> Email
        </TabsTrigger>
        <TabsTrigger value="behavior" className="gap-1.5">
          <SlidersHorizontal className="h-4 w-4" /> Behavior
        </TabsTrigger>
        <TabsTrigger value="branding" className="gap-1.5">
          <ImageIcon className="h-4 w-4" /> Branding
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettingsForm defaultValues={settings.general} />
      </TabsContent>
      <TabsContent value="contact">
        <ContactSettingsForm defaultValues={settings.contact} />
      </TabsContent>
      <TabsContent value="social">
        <SocialSettingsForm defaultValues={settings.social} />
      </TabsContent>
      <TabsContent value="seo">
        <SeoSettingsForm defaultValues={settings.seo} />
      </TabsContent>
      <TabsContent value="google">
        <GoogleSettingsForm defaultValues={settings.google} />
      </TabsContent>
      <TabsContent value="email">
        <EmailSettingsForm defaultValues={settings.email} />
      </TabsContent>
      <TabsContent value="behavior">
        <BehaviorSettingsForm defaultValues={settings.behavior} />
      </TabsContent>
      <TabsContent value="branding">
        <BrandingSettingsPanel general={settings.general} seo={settings.seo} />
      </TabsContent>
    </Tabs>
  );
}

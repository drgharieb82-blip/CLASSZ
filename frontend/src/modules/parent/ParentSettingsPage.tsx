import { BellRing, ShieldCheck, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";
import { SectionHeader } from "../../components/ui/SectionHeader";
import { linkingPolicyNotes, parentProfile } from "./parentMockData";

export function ParentSettingsPage() {
  const { t } = useTranslation();

  return (
    <PageContainer>
      <Card className="p-6 sm:p-8">
        <SectionHeader
          eyebrow={t("parentPortal.settings.eyebrow")}
          title={t("parentPortal.settings.title")}
          description={t("parentPortal.settings.description")}
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <SettingCard
            icon={Smartphone}
            title={t("parentPortal.settings.whatsAppTitle")}
            description={t("parentPortal.settings.whatsAppDescription", { whatsapp: parentProfile.whatsapp })}
          />
          <SettingCard
            icon={BellRing}
            title={t("parentPortal.settings.alertsTitle")}
            description={t("parentPortal.settings.alertsDescription")}
          />
          <SettingCard
            icon={ShieldCheck}
            title={t("parentPortal.settings.securityTitle")}
            description={t("parentPortal.settings.securityDescription")}
          />
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionHeader
            eyebrow={t("parentPortal.linking.registrationEyebrow")}
            title={t("parentPortal.linking.registrationTitle")}
            description={t("parentPortal.linking.registrationDescription")}
          />
          <div className="mt-4 space-y-3">
            {linkingPolicyNotes.duringRegistration.map((note) => (
              <p key={note} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                {note}
              </p>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader
            eyebrow={t("parentPortal.linking.selfEyebrow")}
            title={t("parentPortal.linking.selfTitle")}
            description={t("parentPortal.linking.selfDescription")}
          />
          <div className="mt-4 space-y-3">
            {linkingPolicyNotes.selfRegistration.map((note) => (
              <p key={note} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                {note}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}

type SettingCardProps = {
  icon: typeof Smartphone;
  title: string;
  description: string;
};

function SettingCard({ icon: Icon, title, description }: SettingCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-700 dark:text-teal-200">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

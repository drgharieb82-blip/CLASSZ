import { ArrowRight, ShieldCheck, Smartphone, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Card } from "../../components/ui/Card";
import { PageContainer } from "../../components/ui/PageContainer";

type ParentAuthPageProps = {
  mode: "login" | "register";
};

export function ParentAuthPage({ mode }: ParentAuthPageProps) {
  const { t } = useTranslation();
  const isRegister = mode === "register";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="surface-grid fixed inset-0 opacity-70" aria-hidden="true" />
      <PageContainer className="relative max-w-5xl">
        <Card className="overflow-hidden p-0">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.18),transparent_44%),linear-gradient(160deg,#0f172a,#1e293b)] p-8 text-white sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">{t("parentPortal.auth.eyebrow")}</p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight">
                {isRegister ? t("parentPortal.auth.registerTitle") : t("parentPortal.auth.loginTitle")}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-200">
                {isRegister ? t("parentPortal.auth.registerDescription") : t("parentPortal.auth.loginDescription")}
              </p>

              <div className="mt-8 space-y-4">
                <FeatureRow icon={Smartphone} text={t("parentPortal.auth.featureWhatsApp")} />
                <FeatureRow icon={ShieldCheck} text={t("parentPortal.auth.featureCodes")} />
                <FeatureRow icon={UserPlus} text={t("parentPortal.auth.featureChildren")} />
              </div>
            </div>

            <div className="p-8 sm:p-10">
              <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {t("parentPortal.auth.whatsAppLabel")}
                </label>
                <input
                  className="ui-input mt-2 w-full"
                  placeholder={t("parentPortal.auth.whatsAppPlaceholder")}
                  defaultValue="+20 101 234 5678"
                />

                <label className="mt-4 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {t("parentPortal.auth.passwordLabel")}
                </label>
                <input className="ui-input mt-2 w-full" type="password" placeholder="••••••••" defaultValue="parent-demo" />

                {isRegister ? (
                  <>
                    <label className="mt-4 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {t("parentPortal.auth.linkCodeLabel")}
                    </label>
                    <input className="ui-input mt-2 w-full" placeholder={t("parentPortal.auth.linkCodePlaceholder")} />
                  </>
                ) : null}

                <button type="button" className="ui-button ui-button-primary mt-6 w-full">
                  {isRegister ? t("parentPortal.auth.registerButton") : t("parentPortal.auth.loginButton")}
                </button>

                <Link
                  to="/parent/dashboard"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition hover:text-teal-600 dark:text-teal-300"
                >
                  {t("parentPortal.auth.demoEntry")}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-6 grid gap-4">
                <MiniCard title={t("parentPortal.linking.registrationTitle")} description={t("parentPortal.linking.registrationDescription")} />
                <MiniCard title={t("parentPortal.linking.selfTitle")} description={t("parentPortal.linking.selfDescription")} />
              </div>
            </div>
          </div>
        </Card>
      </PageContainer>
    </div>
  );
}

function FeatureRow({ icon: Icon, text }: { icon: typeof Smartphone; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-medium text-slate-100">{text}</span>
    </div>
  );
}

function MiniCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <h2 className="font-semibold text-slate-950 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

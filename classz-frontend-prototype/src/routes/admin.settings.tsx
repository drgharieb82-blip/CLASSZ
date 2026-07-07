import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Settings, Globe, CreditCard, MessageSquare, Shield, Sparkles,
  Save, Palette, Languages,
} from "lucide-react";
import { DashPage } from "@/components/common/DashPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useApp();

  /* General */
  const [platformName, setPlatformName] = useState("CLASSZ");
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");

  /* Localization */
  const [language, setLanguage] = useState("en");
  const [rtlEnabled, setRtlEnabled] = useState(false);

  /* Payments */
  const [vodafoneCash, setVodafoneCash] = useState(true);
  const [instaPay, setInstaPay] = useState(true);
  const [stripe, setStripe] = useState(true);
  const [bankTransfer, setBankTransfer] = useState(false);

  /* Communication */
  const [whatsapp, setWhatsapp] = useState(true);
  const [email, setEmail] = useState(true);

  /* Security */
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [sessionTimeout, setSessionTimeout] = useState("30");

  /* Feature Toggles */
  const [features, setFeatures] = useState({
    parentPortal: true,
    aiAssistant: true,
    leaderboard: true,
    certificates: true,
    competitionSystem: true,
    studentMemory: true,
    notifications: true,
  });

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <DashPage role="superadmin" title="sa.settings" subtitle="sa.settingsSubtitle" icon={Settings}>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            {t("set.general")}
          </TabsTrigger>
          <TabsTrigger value="localization" className="gap-1.5">
            <Languages className="h-3.5 w-3.5" />
            {t("set.localization")}
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            {t("set.payments")}
          </TabsTrigger>
          <TabsTrigger value="communication" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            {t("set.communication")}
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            {t("set.security")}
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            {t("set.features")}
          </TabsTrigger>
        </TabsList>

        {/* ── General ── */}
        <TabsContent value="general">
          <Card className="border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">{t("set.generalSettings")}</h3>
            </div>
            <div className="space-y-5 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="platformName">{t("set.platformName")}</Label>
                <Input
                  id="platformName"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="CLASSZ"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("set.logo")}</Label>
                <div className="flex items-center gap-3">
                  <div className="grid h-16 w-16 place-items-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted text-xs text-muted-foreground">
                    Logo
                  </div>
                  <Button variant="outline" size="sm">{t("set.upload")}</Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryColor">{t("set.primaryColor")}</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="max-w-[140px]"
                  />
                  <div
                    className="h-9 w-9 rounded-lg border shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Localization ── */}
        <TabsContent value="localization">
          <Card className="border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">{t("set.localizationSettings")}</h3>
            </div>
            <div className="space-y-5 max-w-lg">
              <div className="space-y-2">
                <Label>{t("set.language")}</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">{t("set.arabic")}</SelectItem>
                    <SelectItem value="en">{t("set.english")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t("set.rtlLayout")}</p>
                  <p className="text-xs text-muted-foreground">{t("set.rtlDescription")}</p>
                </div>
                <Switch checked={rtlEnabled} onCheckedChange={setRtlEnabled} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Payments ── */}
        <TabsContent value="payments">
          <Card className="border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">{t("set.paymentGateways")}</h3>
            </div>
            <div className="space-y-4 max-w-lg">
              {[
                { label: "Vodafone Cash", state: vodafoneCash, setter: setVodafoneCash, desc: "set.vodafoneCashDesc" },
                { label: "InstaPay", state: instaPay, setter: setInstaPay, desc: "set.instaPayDesc" },
                { label: "Stripe", state: stripe, setter: setStripe, desc: "set.stripeDesc" },
                { label: "Bank Transfer", state: bankTransfer, setter: setBankTransfer, desc: "set.bankTransferDesc" },
              ].map((gateway) => (
                <div key={gateway.label} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/30">
                  <div>
                    <p className="text-sm font-medium">{gateway.label}</p>
                    <p className="text-xs text-muted-foreground">{t(gateway.desc)}</p>
                  </div>
                  <Switch checked={gateway.state} onCheckedChange={gateway.setter} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* ── Communication ── */}
        <TabsContent value="communication">
          <Card className="border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">{t("set.communicationChannels")}</h3>
            </div>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/30">
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">{t("set.whatsappDesc")}</p>
                </div>
                <Switch checked={whatsapp} onCheckedChange={setWhatsapp} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/30">
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-xs text-muted-foreground">{t("set.emailDesc")}</p>
                </div>
                <Switch checked={email} onCheckedChange={setEmail} />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Security ── */}
        <TabsContent value="security">
          <Card className="border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">{t("set.securitySettings")}</h3>
            </div>
            <div className="space-y-5 max-w-lg">
              <div className="space-y-2">
                <Label htmlFor="minPassword">{t("set.minPasswordLength")}</Label>
                <Input
                  id="minPassword"
                  type="number"
                  value={minPasswordLength}
                  onChange={(e) => setMinPasswordLength(e.target.value)}
                  min={6}
                  max={32}
                  className="max-w-[120px]"
                />
                <p className="text-xs text-muted-foreground">{t("set.minPasswordDesc")}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>{t("set.sessionTimeout")}</Label>
                <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 {t("set.minutes")}</SelectItem>
                    <SelectItem value="30">30 {t("set.minutes")}</SelectItem>
                    <SelectItem value="60">60 {t("set.minutes")}</SelectItem>
                    <SelectItem value="120">120 {t("set.minutes")}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{t("set.sessionTimeoutDesc")}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* ── Feature Toggles ── */}
        <TabsContent value="features">
          <Card className="border bg-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-base font-semibold">{t("set.featureToggles")}</h3>
            </div>
            <div className="space-y-3 max-w-lg">
              {([
                { key: "parentPortal" as const, label: "set.parentPortal", desc: "set.parentPortalDesc" },
                { key: "aiAssistant" as const, label: "set.aiAssistant", desc: "set.aiAssistantDesc" },
                { key: "leaderboard" as const, label: "set.leaderboard", desc: "set.leaderboardDesc" },
                { key: "certificates" as const, label: "set.certificates", desc: "set.certificatesDesc" },
                { key: "competitionSystem" as const, label: "set.competitionSystem", desc: "set.competitionSystemDesc" },
                { key: "studentMemory" as const, label: "set.studentMemory", desc: "set.studentMemoryDesc" },
                { key: "notifications" as const, label: "set.notifications", desc: "set.notificationsDesc" },
              ]).map((feat) => (
                <div key={feat.key} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-accent/30">
                  <div>
                    <p className="text-sm font-medium">{t(feat.label)}</p>
                    <p className="text-xs text-muted-foreground">{t(feat.desc)}</p>
                  </div>
                  <Switch checked={features[feat.key]} onCheckedChange={() => toggleFeature(feat.key)} />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save */}
      <div className="flex justify-end">
        <Button size="lg" className="gap-2">
          <Save className="h-4 w-4" />
          {t("set.saveChanges")}
        </Button>
      </div>
    </DashPage>
  );
}

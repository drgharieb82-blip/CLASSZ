export type PlayerTab = "overview" | "notes" | "attachments" | "discussion";

const tabs: Array<{ id: PlayerTab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "notes", label: "Notes" },
  { id: "attachments", label: "Attachments" },
  { id: "discussion", label: "Discussion" },
];

type TabNavigationProps = {
  activeTab: PlayerTab;
  onTabChange: (tab: PlayerTab) => void;
};

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-white/10">
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              "relative px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#A855F7]",
              activeTab === tab.id ? "text-[#F8FAFC]" : "text-[#94A3B8] hover:text-[#CBD5E1]",
            ].join(" ")}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#A855F7]" aria-hidden="true" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

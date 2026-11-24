import { useState } from "react";
import ProfileView from "./ProfileView";
import GroupsView from "./GroupsView";

type ActiveTab = "profile" | "groups";

export default function AccountLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  return (
    <main className="account-shell mx-auto max-w-5xl px-4 py-5 pb-28 sm:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:gap-6">
        
        {/* Sidebar Lateral */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="rounded-[1.4rem] border border-che-line bg-che-paper/90 p-2 shadow-sm md:space-y-1.5 md:rounded-2xl md:border-2 md:border-che-ink md:p-3 md:shadow-che-md md:shadow-che-ink/10">
            <span className="hidden px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-che-ink-soft md:block">
              Mi Cuenta
            </span>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex min-h-12 w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-all active:scale-[.98] md:min-h-0 md:border-2 md:text-xs ${
                activeTab === "profile"
                  ? "border-che-ink bg-che-ink text-che-bg shadow-che-sm shadow-che-ink"
                  : "border-transparent text-che-ink hover:border-che-ink hover:bg-che-bg"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Mi Perfil
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("groups")}
              className={`flex min-h-12 w-full items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition-all active:scale-[.98] md:min-h-0 md:border-2 md:text-xs ${
                activeTab === "groups"
                  ? "border-che-ink bg-che-ink text-che-bg shadow-che-sm shadow-che-ink"
                  : "border-transparent text-che-ink hover:border-che-ink hover:bg-che-bg"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M7 23v-2a4 4 0 0 1 3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 1 3-3.85" />
                <path d="M1 21v-2a4 4 0 0 1 3-3.85" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              Mis Grupos
            </button>
          </div>
        </aside>

        {/* Panel Principal */}
        <section className="flex-1 min-w-0">
          <div className="rounded-[1.6rem] border border-che-line bg-che-paper p-4 shadow-sm sm:rounded-3xl sm:border-2 sm:border-che-ink sm:p-8 sm:shadow-che-lg sm:shadow-che-ink/10">
            {activeTab === "profile" ? <ProfileView /> : <GroupsView />}
          </div>
        </section>

      </div>
    </main>
  );
}

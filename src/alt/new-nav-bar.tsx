import {
  Activity,
  Anchor,
  ArrowRight,
  BarChart,
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  Cloud,
  Code,
  Coffee,
  Compass,
  Cpu,
  CreditCard,
  Database,
  FileText,
  Globe,
  Hexagon,
  Image as ImageIcon,
  Key,
  Layers,
  LogOut,
  Mail,
  Map,
  Menu,
  MessageSquare,
  Monitor,
  Moon,
  Search,
  Server,
  Settings,
  Shield,
  Sun,
  Terminal,
  User,
  Users,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

/* ----------------------------------------------------------
   1. CONFIGURATION & DATA
   ---------------------------------------------------------- */
const THEME = {
  dark: {
    activeBg: "bg-white/[0.1] text-white",
    body: "text-neutral-300",

    border: "border-white/10",
    caption: "text-neutral-500",
    divider: "bg-white/10",

    // Vivid dark glass with strong shadows
    glass: "bg-[#050505]/70 backdrop-blur-xl backdrop-saturate-150 border border-white/10 shadow-[0_40px_100px_-12px_rgba(0,0,0,1),_0_15px_40px_-15px_rgba(0,0,0,0.6)]",
    heading: "text-white",

    hoverBg: "hover:bg-white/[0.06]",
    iconActive: "text-white",
    iconColor: "text-neutral-400 group-hover:text-white",
    input: "text-white placeholder:text-neutral-500 bg-white/5 border border-white/10 focus:border-white/20",

    link: "text-white hover:text-neutral-200",
    // Active state seamless merge
    navActive: "bg-[#050505]/70 backdrop-blur-xl backdrop-saturate-150 border-white/10 border-b-transparent shadow-none",
    scrollbar: "scrollbar-dark",
    text: "text-neutral-300 hover:text-white",
    tocActive: "text-white border-l-white",
    tocInactive: "text-neutral-500 border-l-white/10 hover:text-neutral-300",
  },
  light: {
    activeBg: "bg-black/[0.06] text-black",
    body: "text-neutral-700",

    border: "border-black/5",
    caption: "text-neutral-400",
    divider: "bg-black/10",

    // Deep light glass with defined shadows
    glass: "bg-white/70 backdrop-blur-xl backdrop-saturate-150 border border-black/5 shadow-[0_40px_100px_-12px_rgba(0,0,0,0.12),_0_15px_40px_-15px_rgba(0,0,0,0.05)]",
    heading: "text-black",

    hoverBg: "hover:bg-black/[0.04]",
    iconActive: "text-black",
    iconColor: "text-neutral-500 group-hover:text-black",
    input: "text-black placeholder:text-neutral-400 bg-black/5 border border-black/5 focus:border-black/10",

    link: "text-black hover:text-neutral-600",
    navActive: "bg-white/70 backdrop-blur-xl backdrop-saturate-150 border-black/5 border-b-transparent shadow-none",
    scrollbar: "scrollbar-light",
    text: "text-neutral-600 hover:text-black",
    tocActive: "text-black border-l-black",
    tocInactive: "text-neutral-400 border-l-black/10 hover:text-neutral-600",
  },
};

const DOCS_NESTED = [
  { children: [{ icon: Terminal, label: "Installation" }, { icon: Layers, label: "Architecture" }], icon: Zap, label: "Getting Started" },
  { icon: Box, label: "Core Concepts" },
  { icon: Code, label: "API Reference" },
  { icon: Anchor, label: "Integrations" },
];

const DATA = {
  products: [
    { items: [{ icon: Cloud, label: "Serverless" }, { icon: Zap, label: "Edge Functions" }, { icon: Database, label: "Database" }, { icon: Server, label: "Storage" }], title: "Core Infrastructure" },
    { items: [{ icon: Layers, label: "Design System" }, { icon: Box, label: "Components" }, { icon: Terminal, label: "CLI Tools" }, { icon: Code, label: "SDKs" }], title: "Developer Experience" },
    { items: [{ icon: Cpu, label: "AI & ML" }, { icon: Search, label: "Vector Search" }, { icon: BarChart, label: "Analytics" }, { icon: Activity, label: "Logs" }], title: "Intelligence" },
  ],
  resources: [
    { items: [{ children: DOCS_NESTED, icon: FileText, label: "Documentation" }, { icon: Code, label: "API Ref" }, { icon: Zap, label: "Quick Starts" }, { icon: Box, label: "Tutorials" }], title: "Learning Hub" },
    { items: [{ icon: Users, label: "Forum" }, { icon: MessageSquare, label: "Discord" }, { icon: Code, label: "GitHub" }, { icon: Coffee, label: "Stories" }], title: "Community" },
    { items: [{ icon: FileText, label: "Changelog" }, { icon: Map, label: "Roadmap" }, { icon: Compass, label: "Careers" }, { icon: ImageIcon, label: "Press Kit" }], title: "Company" },
  ],
};

const SEARCH_ITEMS = [
  ...DATA.products.flatMap(g => g.items.map(i => ({ ...i, id: `p-${i.label}` }))),
  ...DATA.resources.flatMap(g => g.items.map(i => ({ ...i, id: `r-${i.label}` }))),
  { icon: Settings, id: "set", label: "Settings" },
  { icon: CreditCard, id: "bill", label: "Billing" },
];

/* ----------------------------------------------------------
   2. SHARED COMPONENTS
   ---------------------------------------------------------- */
const MenuItem = ({ active, depth = 0, isDark, item, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  const hasKids = item.children?.length > 0;

  return (
    <div className="flex flex-col">
      <button
        className={`group relative flex w-full shrink-0 items-center justify-between overflow-hidden rounded-xl px-2.5 py-2 transition-all duration-200 active:scale-[0.98]
          ${active || isOpen ? (isDark ? THEME.dark.activeBg : THEME.light.activeBg) : (isDark ? THEME.dark.hoverBg : THEME.light.hoverBg)}`}
        onClick={() => hasKids ? setIsOpen(!isOpen) : onClick?.(item)}
        style={{ paddingLeft: `${(depth * 12) + 10}px` }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <Icon
            className={`shrink-0 transition-colors ${active || isOpen ? (isDark ? THEME.dark.iconActive : THEME.light.iconActive) : (isDark ? THEME.dark.iconColor : THEME.light.iconColor)}`}
            size={16}
            strokeWidth={1.5}
          />
          <span className={`truncate text-[13px] font-medium ${active || isOpen ? (isDark ? "text-white" : "text-black") : (isDark ? "text-neutral-300 group-hover:text-white" : "text-neutral-600 group-hover:text-black")}`}>{item.label}</span>
        </div>
        {hasKids
          ? (
            <ChevronDown className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${isDark ? "text-neutral-500" : "text-neutral-400"}`} size={14} strokeWidth={1.5} />
          )
          : (
            !active && <ArrowRight className={`shrink-0 -translate-x-1 opacity-0 transition-transform duration-200 group-hover:translate-x-0 group-hover:opacity-100 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} size={14} strokeWidth={1.5} />
          )}
      </button>
      {hasKids && isOpen && (
        <div className="animate-in slide-in-from-top-1 fade-in mt-0.5 flex flex-col gap-0.5 duration-200">
          {item.children.map((child, i) => <MenuItem depth={depth + 1} isDark={isDark} item={child} key={i} />)}
        </div>
      )}
    </div>
  );
};

const MenuSection = ({ groups, isDark }) => (
  <div className="flex flex-col pb-1">
    {groups.map((g, i) => (
      <div className="mb-2 last:mb-0" key={i}>
        <div className={`mt-1.5 mb-0.5 px-2.5 py-1.5 text-[10px] font-bold tracking-widest uppercase opacity-80 ${isDark ? THEME.dark.caption : THEME.light.caption}`}>{g.title}</div>
        <div className="flex flex-col gap-0.5">
          {g.items.map((item, j) => <MenuItem isDark={isDark} item={item} key={j} />)}
        </div>
      </div>
    ))}
  </div>
);

/* ----------------------------------------------------------
   3. AUTH COMPONENT (Login/Signup/Profile)
   ---------------------------------------------------------- */
const AuthMenu = ({ isDark, isLoggedIn, setLoggedIn }) => {
  const [view, setView] = useState("login"); // 'login', 'signup', 'profile'

  if (isLoggedIn) {
    return (
      <div className="space-y-1 p-2">
        <div className={`mb-2 flex items-center gap-3 rounded-xl border px-2.5 py-3 ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"}`}>
          <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-lg">
            SJ
          </div>
          <div>
            <div className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}>Sarah Jenkings</div>
            <div className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>sarah@onyx.ui</div>
          </div>
        </div>
        <MenuItem isDark={isDark} item={{ icon: Settings, label: "Account Settings" }} />
        <MenuItem isDark={isDark} item={{ icon: CreditCard, label: "Billing & Plans" }} />
        <div className={`my-1 h-px ${isDark ? THEME.dark.divider : THEME.light.divider}`} />
        <MenuItem isDark={isDark} item={{ icon: LogOut, label: "Log Out" }} onClick={() => setLoggedIn(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Tabs */}
      <div className={`flex rounded-lg p-1 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
        <button
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${view === "login" ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm") : (isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black")}`}
          onClick={() => { setView("login"); }}
        >
          Log In
        </button>
        <button
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${view === "signup" ? (isDark ? "bg-white/10 text-white shadow-sm" : "bg-white text-black shadow-sm") : (isDark ? "text-neutral-400 hover:text-white" : "text-neutral-500 hover:text-black")}`}
          onClick={() => { setView("signup"); }}
        >
          Sign Up
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className={`ml-1 text-[11px] font-medium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Email</label>
          <div className="group relative">
            <Mail className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} size={14} />
            <input className={`w-full rounded-lg py-2 pr-3 pl-9 text-xs transition-all outline-none ${isDark ? THEME.dark.input : THEME.light.input}`} placeholder="name@example.com" type="email" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={`ml-1 text-[11px] font-medium ${isDark ? "text-neutral-400" : "text-neutral-500"}`}>Password</label>
          <div className="group relative">
            <Key className={`absolute top-1/2 left-3 -translate-y-1/2 ${isDark ? "text-neutral-500" : "text-neutral-400"}`} size={14} />
            <input className={`w-full rounded-lg py-2 pr-3 pl-9 text-xs transition-all outline-none ${isDark ? THEME.dark.input : THEME.light.input}`} placeholder="••••••••" type="password" />
          </div>
        </div>

        <button
          className={`mt-2 w-full rounded-lg py-2.5 text-xs font-bold shadow-lg transition-transform active:scale-95 ${isDark ? "bg-white text-black hover:bg-neutral-200" : "bg-black text-white hover:bg-neutral-800"}`}
          onClick={() => setLoggedIn(true)}
        >
          {view === "login" ? "Log In" : "Create Account"}
        </button>
      </div>

      <div className={`text-center text-[10px] ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
        Secured by Onyx Auth
      </div>
    </div>
  );
};

/* ----------------------------------------------------------
   4. MAIN COMPONENT
   ---------------------------------------------------------- */
export default function App() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mode, setMode] = useState("system");
  const [isDark, setIsDark] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState(SEARCH_ITEMS.slice(0, 8));
  const searchRef = useRef(null);
  const prevMenu = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => { setIsDark(mode === "system" ? mq.matches : mode === "dark"); };
    update(); mq.addEventListener("change", update);
    return () => { mq.removeEventListener("change", update); };
  }, [mode]);

  useEffect(() => {
    const click = () => { setActiveMenu(null); setSearch(""); prevMenu.current = null; };
    if (activeMenu) { window.addEventListener("click", click); }
    return () => { window.removeEventListener("click", click); };
  }, [activeMenu]);

  useEffect(() => {
    setResults(search ? SEARCH_ITEMS.filter(i => i.label.toLowerCase().includes(search.toLowerCase())) : SEARCH_ITEMS.slice(0, 8));
  }, [search]);

  // Toggle helper
  const toggle = (menu) => { setActiveMenu(activeMenu === menu ? null : menu); };

  return (
    <div className={`min-h-screen overflow-x-hidden font-sans transition-colors duration-700 ${isDark ? "bg-[#050505]" : "bg-[#f5f5f5]"}`}>
      <style>{`
        .scrollbar-dark::-webkit-scrollbar { width: 3px; } .scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 10px; }
        .scrollbar-light::-webkit-scrollbar { width: 3px; } .scrollbar-light::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>

      {/* Navbar Container */}
      <div className="group/nav fixed top-4 left-1/2 z-50 w-[calc(100%-32px)] max-w-xl -translate-x-1/2" onClick={(e) => { e.stopPropagation(); }}>

        {/* Nav Component */}
        <nav className={`
          relative z-20 flex items-center justify-between p-1.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${activeMenu ? (isDark ? THEME.dark.navActive : THEME.light.navActive) + " rounded-t-2xl" : (isDark ? THEME.dark.glass : THEME.light.glass) + " rounded-full"}
        `}>

          <button className="flex cursor-pointer items-center gap-2.5 pr-1 pl-2 transition-transform outline-none active:scale-95">
            <div className={`flex size-7 items-center justify-center rounded-lg shadow-lg ${isDark ? "border border-white/10 bg-gradient-to-br from-white/10 to-transparent" : "border border-black/5 bg-gradient-to-br from-black/5 to-transparent"}`}>
              <Hexagon className={isDark ? "text-white" : "text-black"} size={16} strokeWidth={2.5} />
            </div>
            <span className={`text-[13px] font-bold tracking-widest ${isDark ? "text-white" : "text-black"}`}>ONYX</span>
          </button>

          <div className="hidden items-center gap-1 md:flex">
            {["products", "resources"].map(tab => (
              <button className={`relative flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-all duration-200 active:scale-95 ${activeMenu === tab ? (isDark ? THEME.dark.activeBg : THEME.light.activeBg) : (isDark ? THEME.dark.text : THEME.light.text)}`} key={tab}
                onClick={() => { toggle(tab); }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} <ChevronDown className={`opacity-50 transition-transform duration-300 ${activeMenu === tab ? "rotate-180" : ""}`} size={12} />
              </button>
            ))}
            <button className={`relative rounded-full px-3 py-2 text-[13px] font-medium transition-all duration-200 active:scale-95 ${isDark ? THEME.dark.text : THEME.light.text}`}>Pricing</button>
          </div>

          <div className="flex items-center gap-1 pr-1">
            <div className={`mx-2 hidden h-4 w-px md:block ${isDark ? THEME.dark.divider : THEME.light.divider}`} />
            {[
              { icon: Search, id: "search" },
              { icon: mode === "dark" ? Moon : mode === "light" ? Sun : Monitor, id: "theme" },
            ].map(btn => (
              <button className={`flex size-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${activeMenu === btn.id ? (isDark ? THEME.dark.activeBg : THEME.light.activeBg) : (isDark ? THEME.dark.text : THEME.light.text)}`} key={btn.id} onClick={() => { toggle(btn.id); }}>
                <btn.icon size={16} strokeWidth={1.5} />
              </button>
            ))}

            {/* Account Toggle */}
            <button
              className={`flex size-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90 ${activeMenu === "account" ? (isDark ? THEME.dark.activeBg : THEME.light.activeBg) : (isDark ? THEME.dark.text : THEME.light.text)}`}
              onClick={() => { toggle("account"); }}
            >
              <User size={16} strokeWidth={1.5} />
            </button>

            <button className={`flex size-8 items-center justify-center rounded-full transition-colors active:scale-90 md:hidden ${activeMenu === "mobile" ? (isDark ? THEME.dark.activeBg : THEME.light.activeBg) : (isDark ? THEME.dark.text : THEME.light.text)}`} onClick={() => { toggle("mobile"); }}><Menu size={16} strokeWidth={1.5} /></button>
          </div>
        </nav>

        {/* Dropdown Container */}
        {activeMenu && (
          <div className={`
            absolute top-full left-0 w-full
            rounded-t-none rounded-b-2xl
            border-t-0 border-r border-b border-l
            ${isDark ? "border-white/10" : "border-black/5"}
            ${isDark ? "bg-[#050505]/70" : "bg-white/70"} backdrop-blur-xl backdrop-saturate-150
            ${isDark ? "shadow-[0_40px_100px_-12px_rgba(0,0,0,1)]" : "shadow-[0_40px_100px_-12px_rgba(0,0,0,0.1)]"}
            animate-in fade-in slide-in-from-top-2 z-10 flex
            origin-top flex-col overflow-hidden duration-200
          `} style={{ marginTop: "0px", maxHeight: "calc(100vh - 6rem)" }}>

            <div className={`relative z-10 flex-1 overflow-x-hidden overflow-y-auto p-2 ${isDark ? THEME.dark.scrollbar : THEME.light.scrollbar}`}>
              {(activeMenu === "products" || activeMenu === "resources") && <MenuSection groups={DATA[activeMenu]} isDark={isDark} />}

              {activeMenu === "theme" && (
                <div className="flex flex-col gap-0.5 p-1">
                  {["light", "dark", "system"].map(m => (
                    <MenuItem active={mode === m} isDark={isDark} item={{ icon: m === "light" ? Sun : m === "dark" ? Moon : Monitor, label: m.charAt(0).toUpperCase() + m.slice(1) }} key={m} onClick={() => { setMode(m); }} />
                  ))}
                </div>
              )}

              {/* ACCOUNT MENU */}
              {activeMenu === "account" && (
                <AuthMenu isDark={isDark} isLoggedIn={isLoggedIn} setLoggedIn={setIsLoggedIn} />
              )}

              {activeMenu === "search" && (
                <div className="flex h-full flex-col">
                  <div className={`flex shrink-0 items-center gap-2 border-b px-2 pt-1 pb-2 ${isDark ? THEME.dark.border : THEME.light.border}`}>
                    <Search className={isDark ? "text-neutral-500" : "text-neutral-400"} size={16} />
                    <input className={`h-6 w-full bg-transparent text-[14px] font-medium outline-none ${isDark ? "text-white" : "text-black"}`} onChange={(e) => { setSearch(e.target.value); }} placeholder="Type to search..." ref={searchRef} type="text" value={search} />
                  </div>
                  <div className="mt-1 flex flex-1 flex-col gap-0.5">
                    <div className={`px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase opacity-80 ${isDark ? THEME.dark.caption : THEME.light.caption}`}>{search ? "Results" : "Recent"}</div>
                    {results.map((item, i) => <MenuItem isDark={isDark} item={item} key={i} />)}
                  </div>
                </div>
              )}

              {activeMenu === "mobile" && (
                <div className="flex h-full flex-col pb-2">
                  <MenuSection groups={[DATA.products[0], DATA.resources[0]]} isDark={isDark} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className={`absolute top-0 left-0 size-full bg-gradient-to-b ${isDark ? "from-neutral-900 to-black" : "from-neutral-100 to-white"}`} />
      </div>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pt-32 pb-20 text-left">
        {/* BREADCRUMBS */}
        <div className={`mb-6 flex items-center gap-2 text-[11px] font-medium ${isDark ? "text-neutral-500" : "text-neutral-400"}`}>
          <span className="cursor-pointer hover:text-current">Blog</span>
          <ChevronRight size={12} />
          <span className="cursor-pointer hover:text-current">Engineering</span>
          <ChevronRight size={12} />
          <span className={isDark ? "text-white" : "text-black"}>Materiality in UI</span>
        </div>

        {/* HEADER */}
        <h1 className={`mb-4 text-3xl leading-tight font-bold tracking-tight md:text-5xl ${isDark ? THEME.dark.heading : THEME.light.heading}`}>
          The Materiality of Light:<br/>A Study in Glassmorphism
        </h1>
        <p className={`mb-6 max-w-3xl text-base leading-relaxed md:text-lg ${isDark ? THEME.dark.body : THEME.light.body}`}>
          Exploring how physics, depth, and refraction can create interfaces that feel not just visible, but tangible.
        </p>

        {/* AUTHOR */}
        <div className="mb-10 flex items-center gap-4">
          <div className={`size-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-600`} />
          <div>
            <div className={`text-[13px] font-bold ${isDark ? THEME.dark.heading : THEME.light.heading}`}>Sarah Jenkings</div>
            <div className={`text-[11px] ${isDark ? THEME.dark.caption : THEME.light.caption}`}>Principal Product Designer</div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="hidden lg:col-span-3 lg:block">
            <div className={`sticky top-32 rounded-2xl border p-5 backdrop-blur-md ${isDark ? "border-white/10 bg-white/5" : "border-black/5 bg-black/5"}`}>
              <h3 className={`mb-4 text-[11px] font-bold tracking-widest uppercase ${isDark ? THEME.dark.caption : THEME.light.caption}`}>Contents</h3>
              <ul className={`space-y-3 border-l text-[13px] ${isDark ? "border-white/10" : "border-black/10"}`}>
                <li className={`-ml-[1px] border-l-2 pl-3 ${isDark ? THEME.dark.tocActive : THEME.light.tocActive}`}>Introduction</li>
                <li className={`-ml-[1px] cursor-pointer border-l-2 border-transparent pl-3 transition-colors ${isDark ? THEME.dark.tocInactive : THEME.light.tocInactive}`}>The Physics of Light</li>
                <li className={`-ml-[1px] cursor-pointer border-l-2 border-transparent pl-3 transition-colors ${isDark ? THEME.dark.tocInactive : THEME.light.tocInactive}`}>Implementing Blur</li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-9">
            <article className="prose prose-lg max-w-none">
              <p className={`text-[15px] leading-loose ${isDark ? THEME.dark.body : THEME.light.body}`}>
                    We often talk about "lightweight" interfaces, but rarely do we consider the material implications of that term. In the physical world, light is the medium through which we perceive depth, texture, and form. In the digital realm, we simulate these properties to create hierarchy and focus.
              </p>

              <h3 className={`mt-8 mb-4 text-xl font-bold ${isDark ? THEME.dark.heading : THEME.light.heading}`}>The Physics of Light</h3>
              <p className={`text-[15px] leading-loose ${isDark ? THEME.dark.body : THEME.light.body}`}>
                    Glassmorphism isn't just about making things blurry. It's about establishing a z-index of reality. When an element floats above the background, it should interact with what lies beneath it.
              </p>
              <p className={`mt-4 text-[15px] leading-loose ${isDark ? THEME.dark.body : THEME.light.body}`}>
                    Notice the navigation bar at the top of this page. As you scroll, the content doesn't just disappear; it becomes part of the interface's texture. The colors bleed through, muted but present, grounding the floating element in the context of the page.
              </p>

              <div className={`my-8 rounded-2xl border p-8 ${isDark ? "border-white/10 bg-white/5" : "border-black/10 bg-black/5"}`}>
                <div className="mb-4 flex items-center gap-4">
                  <div className={`rounded-lg p-2 ${isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}><Code size={20}/></div>
                  <span className={`font-mono text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>style_tokens.css</span>
                </div>
                <pre className={`overflow-x-auto font-mono text-sm ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>
                  {`.glass-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}`}
                </pre>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}

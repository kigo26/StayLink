/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Building,
  ShieldCheck,
  DollarSign,
  Users,
  AlertOctagon,
  Settings,
  Bot,
  TrendingUp,
  BarChart4,
  PlusCircle,
  Trash,
  RefreshCw,
  Star,
  MapPin,
  Check,
  AlertTriangle,
  ShieldAlert,
  Search,
  Briefcase,
  Clock,
  Heart,
  Percent,
  Layers,
  Activity,
  CheckCircle2,
  XCircle,
  Plus,
  Edit2,
  Sparkles,
  UserCheck,
  Shield,
  BookOpen,
  ChevronRight,
  Share2,
  HelpCircle,
  MoreVertical,
  MessageSquare,
  History,
  Flag,
} from "lucide-react";
import {
  Property,
  Transaction,
  PlatformStats,
  Booking,
  RoommateProfile,
  ChatSession,
  Message,
} from "../types";

interface ConsoleProps {
  properties: Property[];
  transactions: Transaction[];
  stats: PlatformStats;
  onUpdateProperties: (props: Property[]) => void;
  onToggleVerification: () => void;
  bookings: Booking[];
  onUpdateBookings: (bookings: Booking[]) => void;
  roommates?: RoommateProfile[];
  onStateUpdate?: (data: {
    properties?: Property[];
    roommates?: RoommateProfile[];
    chats?: ChatSession[];
    messagesList?: Record<string, Message[]>;
    transactions?: Transaction[];
  }) => void;
}

// Custom types for local logs & configurations
interface SecurityThresholds {
  minKilimaniPrice: number;
  minWestlandsPrice: number;
  minKarenPrice: number;
  offPlatformKeywordWeight: number;
  unverifiedHostWeight: number;
}

export default function AdminConsole({
  properties,
  transactions,
  stats,
  onUpdateProperties,
  onToggleVerification,
  bookings,
  onUpdateBookings,
  roommates = [],
  onStateUpdate,
}: ConsoleProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "overview" | "assets" | "roommates" | "escrow" | "security"
  >("overview");

  // Search/Filters within tabs
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState<
    | "all"
    | "rent"
    | "sale"
    | "airbnb"
    | "hostel"
    | "roommate"
    | "unverified"
    | "flagged"
  >("all");

  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerFilter, setLedgerFilter] = useState<
    | "all"
    | "deposit"
    | "booking_payment"
    | "booking_payout"
    | "commission_payout"
  >("all");

  const [roommateSearch, setRoommateSearch] = useState("");
  const [roommateGenderFilter, setRoommateGenderFilter] = useState<
    "all" | "Male" | "Female"
  >("all");

  // Chart timescale
  const [chartTimescale, setChartTimescale] = useState<
    "1D" | "1W" | "1M" | "3M"
  >("1M");

  // Fraud alerts simulation state
  const [securityThresholds, setSecurityThresholds] =
    useState<SecurityThresholds>({
      minKilimaniPrice: 18000,
      minWestlandsPrice: 20000,
      minKarenPrice: 24000,
      offPlatformKeywordWeight: 35,
      unverifiedHostWeight: 20,
    });

  const [activePropertyScanId, setActivePropertyScanId] = useState<
    string | null
  >(null);
  const [isScanningFraud, setIsScanningFraud] = useState(false);
  const [customScanText, setCustomScanText] = useState(
    "Urgently need to release keys today. Direct deposit KSh 15,000 via WhatsApp at 0712345678 only.",
  );
  const [customScanResults, setCustomScanResults] = useState<any>(null);

  // New Listing creation modal / portal
  const [isAddingListing, setIsAddingListing] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newLocation, setNewLocation] = useState("Westlands, Nairobi");
  const [newPrice, setNewPrice] = useState(25000);
  const [newType, setNewType] = useState<
    "apartment" | "airbnb" | "roommate" | "sale" | "hotel"
  >("apartment");
  const [newDescr, setNewDescr] = useState(
    "Stunning premium rental located in central Nairobi. Ready for secure checking.",
  );

  // Roommate compatibility sandbox state
  const [sandboxCandidateAId, setSandboxCandidateAId] = useState<string>("");
  const [sandboxCandidateBId, setSandboxCandidateBId] = useState<string>("");
  const [isSandboxRunning, setIsSandboxRunning] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  // Hover states for dynamic charts
  const [hoveredChartIndex, setHoveredChartIndex] = useState<number | null>(
    null,
  );

  // Tenant/Roommate context menu state
  const [activeTenantMenuId, setActiveTenantMenuId] = useState<string | null>(null);

  // Initialize Roommate Selector dropdowns
  React.useEffect(() => {
    if (roommates.length >= 2) {
      setSandboxCandidateAId(roommates[0].uid);
      setSandboxCandidateBId(roommates[1].uid);
    }
  }, [roommates]);

  // Bulk operation actions
  const handleBulkVerify = () => {
    const updated = properties.map((p) => {
      if (p.verificationStatus !== "verified") {
        return {
          ...p,
          verifiedByAdmin: true,
          verificationStatus: "verified" as const,
        };
      }
      return p;
    });
    onUpdateProperties(updated);
  };

  const handlePriceInflation = (multiplier: number) => {
    const updated = properties.map((p) => ({
      ...p,
      price: Math.round(p.price * multiplier),
    }));
    onUpdateProperties(updated);
  };

  // Safe Property creations
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProp: Property = {
      id: `prop_admin_${Date.now()}`,
      title: newTitle,
      description: newDescr,
      price: Number(newPrice),
      location: newLocation,
      category: 'Residential',
      coordinates: {
        lat: -1.2921 + (Math.random() - 0.5) * 0.05,
        lng: 36.8219 + (Math.random() - 0.5) * 0.05,
      },
      type: newType,
      images: [
        "https://images.unsplash.com/photo-15df8a5a4c522-a2707f59d571?q=80&w=600&auto=format&fit=crop",
      ],
      bedrooms: 2,
      bathrooms: 2,
      amenities: ["WiFi", "Security Guard", "Backup Generator", "Paved Access"],
      landlordId: "user_john_doe",
      landlordName: "John Mwangi",
      landlordAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
      aiQualityScore: Math.floor(Math.random() * 15 + 85),
      neighborhoodMetrics: {
        safety: 88,
        transit: 80,
        noise: 35,
        hospitalsNear: 2,
        schoolsNear: 3,
        mallsNear: 1,
        commuteToCBD: "15 mins driving",
      },
      responseSpeedMinutes: 4,
      bookingSuccessRate: 99,
      isPromoted: false,
      isFlagged: false,
      createdAt: new Date().toISOString(),
      likesCount: 5,
      commentsCount: 2,
    };

    onUpdateProperties([newProp, ...properties]);
    setNewTitle("");
    setNewDescr(
      "Stunning premium rental located in central Nairobi. Ready for secure checking.",
    );
    setIsAddingListing(false);
  };

  // Run cyber scan detection formulas
  const runAntiFraudScan = (prop: Property) => {
    setActivePropertyScanId(prop.id);
    setIsScanningFraud(true);
    setCustomScanResults(null);

    // Simulate cyber telemetry scanning
    setTimeout(() => {
      let score = 5;
      const reasons: string[] = [];
      const lowerLoc = prop.location.toLowerCase();
      const lowerDesc = prop.description.toLowerCase();

      // Check prices
      if (
        lowerLoc.includes("muthaiga") &&
        prop.price < securityThresholds.minKarenPrice
      ) {
        score += 45;
        reasons.push(
          `Suspicious pricing: under market value inside elite Muthaiga`,
        );
      }
      if (
        lowerLoc.includes("kilimani") &&
        prop.price < securityThresholds.minKilimaniPrice
      ) {
        score += 35;
        reasons.push(
          `Suspicious pricing: under market value inside center Kilimani`,
        );
      }
      if (
        lowerLoc.includes("westlands") &&
        prop.price < securityThresholds.minWestlandsPrice
      ) {
        score += 35;
        reasons.push(
          `Suspicious pricing: under market value inside prime Westlands`,
        );
      }

      // Check description keywords
      if (
        lowerDesc.includes("deposit first") ||
        lowerDesc.includes("pay deposit before") ||
        lowerDesc.includes("whatsapp only")
      ) {
        score += securityThresholds.offPlatformKeywordWeight;
        reasons.push(
          `Keywords alert: Direct out-of-app deposit warnings detected`,
        );
      }
      if (
        lowerDesc.includes("urgently") ||
        lowerDesc.includes("immediate keys") ||
        lowerDesc.includes("owner leaving today")
      ) {
        score += 20;
        reasons.push(`Urgency signals: High-pressure rental description vibes`);
      }

      // Verify state
      if (!prop.verifiedByAdmin && prop.verificationStatus !== "verified") {
        score += securityThresholds.unverifiedHostWeight;
        reasons.push(`Profile alert: Unverified partner publisher`);
      }

      score = Math.min(100, Math.max(2, score));
      let level: "SAFE" | "MODERATE_RISK" | "HIGH_RISK_SCAM" = "SAFE";
      if (score > 60) level = "HIGH_RISK_SCAM";
      else if (score > 30) level = "MODERATE_RISK";

      // Apply automatic flag in properties list
      if (level === "HIGH_RISK_SCAM") {
        const updated = properties.map((p) =>
          p.id === prop.id ? { ...p, isFlagged: true } : p,
        );
        onUpdateProperties(updated);
      }

      setCustomScanResults({
        targetId: prop.id,
        targetTitle: prop.title,
        scamProbability: score,
        riskLevel: level,
        flags:
          reasons.length > 0
            ? reasons
            : ["Within standard Nairobi rental parity checks."],
        rationale: `Secure scanning executed using localized threat indicators. Pricing index: KSh ${prop.price.toLocaleString()} vs locale average. ${level === "HIGH_RISK_SCAM" ? "⚠️ High hazard profile detected: immediate quarantine advisable." : "No urgent quarantine alerts."}`,
      });

      setIsScanningFraud(false);
    }, 700);
  };

  // Scanner Simulator for typed text
  const runDescriptiveSimScan = () => {
    setIsScanningFraud(true);
    setCustomScanResults(null);

    setTimeout(() => {
      let score = 15;
      const reasons: string[] = [];
      const text = customScanText.toLowerCase();

      if (
        text.includes("whatsapp") ||
        text.includes("07") ||
        text.includes("+254")
      ) {
        score += 35;
        reasons.push(`Hard contact leak: private phone digits leak detected.`);
      }
      if (
        text.includes("deposit first") ||
        text.includes("direct deposit") ||
        text.includes("manual pay")
      ) {
        score += 40;
        reasons.push(`Direct cash: seeks deposit beforehand.`);
      }
      if (
        text.includes("urgently") ||
        text.includes("today only") ||
        text.includes("cannot view") ||
        text.includes("secure now")
      ) {
        score += 25;
        reasons.push(`High urgency stress signals.`);
      }

      score = Math.min(100, score);
      let level: "SAFE" | "MODERATE_RISK" | "HIGH_RISK_SCAM" = "SAFE";
      if (score > 55) level = "HIGH_RISK_SCAM";
      else if (score > 25) level = "MODERATE_RISK";

      setCustomScanResults({
        targetId: "custom_sim",
        targetTitle: "Interactive Sandbox Description",
        scamProbability: score,
        riskLevel: level,
        flags:
          reasons.length > 0
            ? reasons
            : ["Simple copy matching acceptable standard standards."],
        rationale: `Neural sandbox matching executed on mock landlord text. Found multiple warning vectors regarding payments. StayLink Escrow protection holds are configured to automatically intercept these.`,
      });
      setIsScanningFraud(false);
    }, 500);
  };

  // Run roommate compatibility scoring sandbox
  const runSandboxMatch = () => {
    if (!sandboxCandidateAId || !sandboxCandidateBId) return;
    setIsSandboxRunning(true);

    setTimeout(() => {
      const romA = roommates.find((r) => r.uid === sandboxCandidateAId);
      const romB = roommates.find((r) => r.uid === sandboxCandidateBId);

      if (!romA || !romB) {
        setIsSandboxRunning(false);
        return;
      }

      // Mathematical compatibility scoring
      let budgetDiff = Math.abs(romA.budget - romB.budget);
      let maxBudget = Math.max(romA.budget, romB.budget) || 1;
      let budgetScore = Math.round(
        Math.max(30, 100 - (budgetDiff / maxBudget) * 50),
      );

      let sleepScore = 60;
      if (romA.sleepSchedule === romB.sleepSchedule) sleepScore = 100;
      else if (
        romA.sleepSchedule === "Flexible" ||
        romB.sleepSchedule === "Flexible"
      )
        sleepScore = 85;

      let cleanlinessScore = 55;
      if (romA.cleanliness === romB.cleanliness) cleanlinessScore = 100;
      else if (
        ["Medium", "High"].includes(romA.cleanliness) &&
        ["Medium", "High"].includes(romB.cleanliness)
      )
        cleanlinessScore = 80;

      // Lifestyle overlaps
      const sharedLifestyle = romA.lifestyle.filter((l) =>
        romB.lifestyle.includes(l),
      );
      let lifestyleScore = 50 + sharedLifestyle.length * 15;
      lifestyleScore = Math.min(100, lifestyleScore);

      const calculatedPercent = Math.round(
        (budgetScore + sleepScore + cleanlinessScore + lifestyleScore) / 4,
      );

      setSandboxResult({
        pairedA: romA,
        pairedB: romB,
        score: calculatedPercent,
        categories: {
          budget: budgetScore,
          sleep: sleepScore,
          cleanliness: cleanlinessScore,
          lifestyle: lifestyleScore,
        },
        sharedLifestyle,
        compatibilityVerdict:
          calculatedPercent > 80
            ? "EXCELLENT MATCH"
            : calculatedPercent > 55
              ? "STABLE CORDIAL"
              : "HIGH CHAFING RISK",
      });

      setIsSandboxRunning(false);
    }, 600);
  };

  // Force Match roommate pairing action
  const handleForceMatchRoommates = () => {
    if (!sandboxResult || !onStateUpdate) return;
    const uidA = sandboxResult.pairedA.uid;
    const uidB = sandboxResult.pairedB.uid;

    const updatedRoommates = roommates.map((r) => {
      if (r.uid === uidA || r.uid === uidB) {
        return { ...r, partnerFound: true };
      }
      return r;
    });

    onStateUpdate({ roommates: updatedRoommates });
    setSandboxResult(null);
  };

  // Escrow financial variables
  const totalVolumeCalculated = useMemo(() => {
    const successTrx = transactions.filter((t) => t.status === "success");
    const deposits = successTrx
      .filter((t) => t.type === "booking_payment")
      .reduce((sum, t) => sum + t.amount, 0);
    return stats.totalVolumeKsh + deposits;
  }, [transactions, stats]);

  const totalCommissionsCalculated = useMemo(() => {
    const successTrx = transactions.filter((t) => t.status === "success");
    const calculated = successTrx
      .filter((t) => t.type === "booking_payment")
      .reduce((sum, t) => sum + (t.commissionCalculated || t.amount * 0.1), 0);
    return stats.commissionKsh + calculated;
  }, [transactions, stats]);

  const totalEscrowCalculated = useMemo(() => {
    // Escrow held currently consists of bookings in "active" or "pending" status
    return bookings
      .filter((b) => b.status === "pending" || b.status === "active")
      .reduce((sum, b) => sum + b.amountPaid, 0);
  }, [bookings]);

  // SVG Chart Data generator based on timespans
  const activeVolumeTrends = useMemo(() => {
    // Generate simulated dynamic data structures for area chart
    const monthlyDataPoints = [
      { label: "May 05", escrow: 125000, profit: 12500 },
      { label: "May 10", escrow: 210000, profit: 21000 },
      { label: "May 15", escrow: 185000, profit: 18500 },
      { label: "May 20", escrow: 340000, profit: 34000 },
      { label: "May 25", escrow: 480000, profit: 48000 },
      { label: "May 30", escrow: 512000, profit: 51200 },
      {
        label: "Jun 02",
        escrow: totalVolumeCalculated || 580000,
        profit: totalCommissionsCalculated || 58000,
      },
    ];

    if (chartTimescale === "1D") return monthlyDataPoints.slice(-2);
    if (chartTimescale === "1W") return monthlyDataPoints.slice(-3);
    if (chartTimescale === "1M") return monthlyDataPoints;
    return monthlyDataPoints;
  }, [chartTimescale, totalVolumeCalculated, totalCommissionsCalculated]);

  // Radial metrics calculations
  const typeShares = useMemo(() => {
    const counts = { apartment: 0, airbnb: 0, roommate: 0, sale: 0, hotel: 0 };
    properties.forEach((p) => {
      if (counts[p.type] !== undefined) counts[p.type]++;
    });

    const total = properties.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name:
        name === "apartment"
          ? "Rentals"
          : name === "roommate"
            ? "Cohorts"
            : name.toUpperCase(),
      count,
      percent: Math.round((count / total) * 100),
    }));
  }, [properties]);

  // Grid filter properties list
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const matchSearch =
        prop.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
        prop.location.toLowerCase().includes(propertySearch.toLowerCase()) ||
        prop.landlordName.toLowerCase().includes(propertySearch.toLowerCase());

      if (!matchSearch) return false;
      if (propertyFilter === "all") return true;
      if (propertyFilter === "unverified")
        return !prop.verifiedByAdmin && prop.verificationStatus !== "verified";
      if (propertyFilter === "flagged") return prop.isFlagged;
      return prop.type === propertyFilter;
    });
  }, [properties, propertySearch, propertyFilter]);

  // Ledger elements filtrations
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
      const query = ledgerSearch.toLowerCase();
      const matchSearch =
        trx.reference.toLowerCase().includes(query) ||
        trx.userName.toLowerCase().includes(query) ||
        (trx.propertyTitle && trx.propertyTitle.toLowerCase().includes(query));

      if (!matchSearch) return false;
      if (ledgerFilter === "all") return true;
      return trx.type === ledgerFilter;
    });
  }, [transactions, ledgerSearch, ledgerFilter]);

  // Roommates lists filtration
  const filteredRoommatesList = useMemo(() => {
    return roommates.filter((rom) => {
      const matchSearch =
        rom.name.toLowerCase().includes(roommateSearch.toLowerCase()) ||
        rom.occupation.toLowerCase().includes(roommateSearch.toLowerCase()) ||
        rom.lifestyle.some((l) =>
          l.toLowerCase().includes(roommateSearch.toLowerCase()),
        );

      if (!matchSearch) return false;
      if (roommateGenderFilter === "all") return true;
      return rom.gender === roommateGenderFilter;
    });
  }, [roommates, roommateSearch, roommateGenderFilter]);

  const activeLogsMock = [
    {
      id: 1,
      time: "14 mins ago",
      icon: "✔",
      text: "M-PESA checkout callback verified for Ref: ST-998A",
    },
    {
      id: 2,
      time: "28 mins ago",
      icon: "🕵️",
      text: "Fraud Shield flagged low rental pricing warning inside Karen",
    },
    {
      id: 3,
      time: "1 hr ago",
      icon: "🤝",
      text: "Roommate cohorts matches matched at 85% budget concordance",
    },
    {
      id: 4,
      time: "3 hrs ago",
      icon: "🏡",
      text: "Landlord partner Mwangi submitted verified Westlands unit",
    },
  ];

  return (
    <div className="flex-1 text-white bg-slate-950 flex flex-col w-full h-full text-left font-sans select-none overflow-hidden sm:rounded-3xl border border-white/5 relative shadow-inner">
      {/* Super App Dashboard Top Ticker Band */}
      <div className="w-full bg-[#0a0f24] px-4 py-2 border-b border-white/5 shrink-0 flex items-center justify-between text-[11px] font-mono select-none overflow-x-auto gap-4">
        <div className="flex items-center gap-1.5 shrink-0 text-sky-400 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
          STAYLINK CORE SYSTEM: ONLINE
        </div>
        <div className="flex items-center gap-4 text-white/50 text-[10px] shrink-0 font-medium">
          <span>
            LATENCY: <span className="text-white">24ms</span>
          </span>
          <span className="hidden xs:inline">
            NODES:{" "}
            <span className="text-white">
              {properties.length * 2 + 15} channels
            </span>
          </span>
          <span>
            TIME: <span className="text-sky-300">Nairobi UTC+3</span>
          </span>
        </div>
      </div>

      {/* Primary Top Header Layout */}
      <div className="px-5 py-4 bg-slate-900/60 border-b border-white/5 shrink-0 flex flex-col xxs:flex-row xxs:justify-between items-start xxs:items-center gap-4 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] bg-sky-500/10 text-sky-300 border border-sky-500/20 py-0.5 px-2 rounded-md font-black uppercase tracking-wider font-mono">
              FINTECH SYSTEM HQ
            </span>
            <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 py-0.5 px-2 rounded-md font-black uppercase tracking-wider font-mono">
              v4.2
            </span>
          </div>
          <h1 className="text-xl xs:text-2xl font-black mt-1 bg-gradient-to-r from-white via-neutral-100 to-sky-400 bg-clip-text text-transparent italic leading-tight flex items-center gap-1.5">
            Admin HQ Dashboard
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 w-full xxs:w-auto">
          <button
            onClick={() => setIsAddingListing(true)}
            className="flex-1 xxs:flex-none py-1.5 px-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:shadow-lg flex items-center justify-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> ADD LISTING
          </button>

          <button
            onClick={onToggleVerification}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white border border-white/5 rounded-xl text-slate-300 transition shrink-0 cursor-pointer"
            title="System Diagnostics Check"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Selection Row Controls */}
      <div className="flex overflow-x-auto border-b border-white/5 bg-slate-900/30 shrink-0 p-1 divide-x divide-white/5 no-scrollbar">
        {[
          {
            id: "overview",
            label: "Overview",
            icon: BarChart4,
            color: "text-sky-400",
          },
          {
            id: "assets",
            label: "Properties",
            icon: Building,
            color: "text-teal-400",
          },
          {
            id: "bookings",
            label: "Escrow Ledgers",
            icon: BookOpen,
            color: "text-indigo-400",
          },
          {
            id: "roommates",
            label: "Tenants Section",
            icon: Users,
            color: "text-pink-400",
          },
          {
            id: "security",
            label: "AI Cyber Shield",
            icon: ShieldCheck,
            color: "text-amber-400",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 min-w-[95px] flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold transition-all duration-200 outline-none cursor-pointer border-none ${
                isActive
                  ? "bg-slate-900/80 text-white shadow-inner font-extrabold relative"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/20"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${tab.color} ${isActive ? "scale-110" : ""}`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-pink-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dashboard Sub-screen Content Renderers */}
      <div className="flex-1 overflow-y-auto p-4 content-container">
        {/* OVERVIEW SCREEN */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            {/* Ticker Cards Stats Dashboard Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Total Users Node Card */}
              <div className="relative overflow-hidden bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-sky-500/20 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Active Hosts & Cohorts
                  </span>
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl xs:text-2xl font-black font-mono tracking-tight text-white">
                    {stats.totalUsers +
                      roommates.length +
                      properties.length * 3}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> +18.4% growth
                  </span>
                </div>
              </div>

              {/* Secure Escrow Volume Card */}
              <div className="relative overflow-hidden bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-teal-500/20 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Gross Trust Escrow (GTV)
                  </span>
                  <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl xs:text-2xl font-black font-mono tracking-tight text-teal-400">
                    KSh {totalVolumeCalculated.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Automated splits
                  </span>
                </div>
              </div>

              {/* Commission Profit Platform Earnings split */}
              <div className="relative overflow-hidden bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    StayLink Commission Cut 10%
                  </span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl xs:text-2xl font-black font-mono tracking-tight text-indigo-400">
                    KSh {totalCommissionsCalculated.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-indigo-300 font-bold flex items-center gap-0.5 mt-1.5">
                    <Activity className="w-3.5 h-3.5" /> 10% split active
                  </span>
                </div>
              </div>

              {/* Escrow Held Right Now Reserve */}
              <div className="relative overflow-hidden bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-pink-500/20 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <span className="text-[9px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                    Escrow Held in Transit
                  </span>
                  <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-xl xs:text-2xl font-black font-mono tracking-tight text-pink-400">
                    KSh {totalEscrowCalculated.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-pink-300 font-bold flex items-center gap-0.5 mt-1.5">
                    <Shield className="w-3.5 h-3.5" /> Safeguarded holds
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Custom SVG Area & Bar Graphics Graph Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Financial Area Chart Block (Cols: 2) */}
              <div className="bg-slate-900/50 border border-white/5 bg-gradient-to-b from-slate-900 to-slate-950 rounded-2.5xl p-5 md:col-span-2 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> Financial Escrow Flow
                      Trends
                    </h3>
                    <p className="text-[10px] text-white/50">
                      Simulated dynamic transaction volume over timeline
                    </p>
                  </div>

                  {/* Period selection */}
                  <div className="flex bg-black/40 rounded-xl p-0.5 border border-white/5 gap-0.5 font-mono text-[9px] text-slate-300">
                    {(["1D", "1W", "1M", "3M"] as any[]).map((per) => (
                      <button
                        key={per}
                        onClick={() => setChartTimescale(per)}
                        className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                          chartTimescale === per
                            ? "bg-sky-650 text-white font-extrabold"
                            : "hover:bg-white/5"
                        }`}
                      >
                        {per}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Area Chart Representation */}
                <div className="relative pt-2 h-44 w-full bg-slate-950/40 rounded-xl border border-white/5 overflow-hidden">
                  <svg
                    className="w-full h-full p-2"
                    viewBox="0 0 500 150"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="escrowGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#0284c7"
                          stopOpacity="0.45"
                        />
                        <stop
                          offset="100%"
                          stopColor="#0284c7"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                      <linearGradient
                        id="profitGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#4f46e5"
                          stopOpacity="0.30"
                        />
                        <stop
                          offset="100%"
                          stopColor="#4f46e5"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Guideline lines */}
                    <line
                      x1="0"
                      y1="37.5"
                      x2="500"
                      y2="37.5"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="75"
                      x2="500"
                      y2="75"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />
                    <line
                      x1="0"
                      y1="112.5"
                      x2="500"
                      y2="112.5"
                      stroke="rgba(255,255,255,0.03)"
                      strokeWidth="1"
                    />

                    {/* Escrow GTV Area Line dynamic calculation */}
                    {chartTimescale === "1M" ? (
                      <>
                        {/* Area */}
                        <path
                          d="M 5,145 L 80,120 L 160,95 L 240,110 L 320,65 L 400,35 L 495,15 L 495,145 Z"
                          fill="url(#escrowGrad)"
                        />
                        {/* Line */}
                        <path
                          d="M 5,145 L 80,120 L 160,95 L 240,110 L 320,65 L 400,35 L 495,15"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </>
                    ) : (
                      <>
                        <path
                          d="M 5,130 L 150,110 L 300,55 L 495,20 L 495,145 Z"
                          fill="url(#escrowGrad)"
                        />
                        <path
                          d="M 5,130 L 150,110 L 300,55 L 495,20"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {/* Interactive dots triggers and visual indicators */}
                    {activeVolumeTrends.map((point, index) => {
                      const totalPoints = activeVolumeTrends.length;
                      const x = 5 + (index / (totalPoints - 1)) * 490;
                      // Sim calculation coordinates
                      const y = 145 - (point.escrow / 600000) * 125;
                      const isHovered = hoveredChartIndex === index;

                      return (
                        <g key={index}>
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 6 : 4}
                            fill={isHovered ? "#34d399" : "#0284c7"}
                            stroke="#0f172a"
                            strokeWidth="2"
                            onMouseEnter={() => setHoveredChartIndex(index)}
                            onMouseLeave={() => setHoveredChartIndex(null)}
                            className="cursor-pointer transition-all duration-150"
                          />
                        </g>
                      );
                    })}
                  </svg>

                  {/* Tooltip on Chart Elements */}
                  <div className="absolute top-2 right-4 text-right pointer-events-none">
                    {hoveredChartIndex !== null ? (
                      <div className="p-1 px-2.5 bg-slate-900 border border-emerald-500/20 rounded-lg text-[9px] font-mono leading-none tracking-tight">
                        <span className="block text-slate-400 uppercase font-black tracking-widest">
                          {activeVolumeTrends[hoveredChartIndex].label}
                        </span>
                        <span className="block font-extrabold text-emerald-400 mt-1">
                          Escrow: KSh{" "}
                          {Math.round(
                            activeVolumeTrends[hoveredChartIndex].escrow,
                          ).toLocaleString()}
                        </span>
                        <span className="block font-bold text-sky-400 mt-0.5">
                          Proj Profit: KSh{" "}
                          {Math.round(
                            activeVolumeTrends[hoveredChartIndex].profit,
                          ).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[8px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                        Hover data nodes to inspect
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                  <span>Start Loop: May 05</span>
                  <span>Trend Volume Multiplier: 1.25x</span>
                  <span>End Phase: Nairobi Active Stream</span>
                </div>
              </div>

              {/* Property distribution Radial/Bar Breakdown */}
              <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Category Shares
                  </h3>
                  <p className="text-[10px] text-white/50">
                    Market share split across listings
                  </p>
                </div>

                {/* Listing category indicators bar pile */}
                <div className="space-y-3.5 pt-1">
                  {typeShares.map((type) => {
                    let color = "bg-sky-500";
                    let textClass = "text-sky-400";
                    if (type.name === "AIRBNB") {
                      color = "bg-teal-400";
                      textClass = "text-teal-400";
                    }
                    if (type.name === "Cohorts") {
                      color = "bg-pink-400";
                      textClass = "text-pink-400";
                    }
                    if (type.name === "SALE") {
                      color = "bg-amber-400";
                      textClass = "text-amber-400";
                    }
                    if (type.name === "HOTEL") {
                      color = "bg-violet-400";
                      textClass = "text-violet-400";
                    }

                    return (
                      <div key={type.name} className="text-xs">
                        <div className="flex justify-between items-center font-bold text-[10px] mb-1.5">
                          <span className="text-neutral-200">
                            {type.name} ({type.count})
                          </span>
                          <span className={textClass}>
                            {type.percent}% share
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-950/60 rounded-full overflow-hidden flex border border-white/5">
                          <span
                            className={`h-full rounded-full transition-all duration-1000 ${color}`}
                            style={{ width: `${type.percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Admin Live Logs Actions & Quick Utilities */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Live Alerts Stream Panel */}
              <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-3.5 lg:col-span-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 animate-pulse" /> Live Telemetry
                  Feed Log
                </h3>

                <div className="space-y-2 max-h-[170px] overflow-y-auto invisible-scrollbar pr-1">
                  {activeLogsMock.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-2xl flex items-center justify-between gap-3 text-xs transition-all duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center border border-white/10 shrink-0 text-sky-400 font-bold">
                          {log.icon}
                        </span>
                        <span className="text-neutral-200 font-medium leading-relaxed">
                          {log.text}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 shrink-0 uppercase tracking-tight">
                        {log.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Admin Task Runner Panel */}
              <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Settings className="w-4 h-4" /> Bulk Automation Run
                </h3>

                <div className="grid grid-cols-1 gap-2.5 pt-1">
                  <button
                    onClick={handleBulkVerify}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-indigo-600 hover:text-white text-indigo-300 rounded-xl text-[11px] font-bold border border-white/5 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> Bulk Verify Listings
                  </button>
                  <button
                    onClick={() => handlePriceInflation(1.1)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-300 rounded-xl text-[11px] font-bold border border-white/5 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" /> Inflate Prices (+10%)
                  </button>
                  <button
                    onClick={() => handlePriceInflation(0.9)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-rose-400 rounded-xl text-[11px] font-bold border border-white/5 transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" /> Reduce Prices (-10%)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROPERTIES ASSETS TAB */}
        {activeTab === "assets" && (
          <div className="space-y-4 animate-fade-in">
            {/* Filter Search Header Panel */}
            <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2.5xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Query property titles, locations or hosts..."
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  className="w-full bg-slate-950/60 border border-white/5 focus:border-sky-500 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition font-medium"
                />
              </div>

              {/* Status types dropdown selection */}
              <div className="flex items-center gap-2 overflow-x-auto shrink-0 font-sans">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider select-none shrink-0">
                  Type:
                </span>
                <select
                  value={propertyFilter}
                  onChange={(e) => setPropertyFilter(e.target.value as any)}
                  className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold font-sans text-white focus:ring-1 focus:ring-sky-500 cursor-pointer outline-none shrink-0"
                >
                  <option value="all">
                    All listings ({properties.length})
                  </option>
                  <option value="apartment">Standard Rentals</option>
                  <option value="airbnb">Airbnb (Daily)</option>
                  <option value="sale">Sales</option>
                  <option value="roommate">Cohorts</option>
                  <option value="unverified">Unverified Check</option>
                  <option value="flagged">Flagged Scams</option>
                </select>
              </div>
            </div>

            {/* List Property items grid */}
            <div className="space-y-3">
              {filteredProperties.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/5 rounded-2.5xl bg-slate-900/10">
                  <AlertCircle2 className="w-10 h-10 text-slate-500 mx-auto mb-2.5" />
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    No Properties Matched Filters
                  </p>
                  <p className="text-[10px] text-slate-500 max-w-sm mx-auto leading-normal mt-1">
                    Adjust your keyword query or property category to explore
                    existing listings records in Kenya.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProperties.map((prop) => {
                    const isVerified =
                      prop.verifiedByAdmin ||
                      prop.verificationStatus === "verified";
                    const isRejected = prop.verificationStatus === "rejected";

                    return (
                      <div
                        key={prop.id}
                        className={`p-4 rounded-2.5xl bg-slate-900/40 border transition-all duration-300 relative flex flex-col justify-between hover:border-white/10 ${
                          prop.isFlagged
                            ? "border-rose-950 bg-rose-950/10"
                            : "border-white/5"
                        }`}
                      >
                        {/* High-risk flagged banner alert */}
                        {prop.isFlagged && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-rose-600 text-white font-extrabold text-[8px] px-2 py-0.5 rounded-full font-mono uppercase tracking-widest leading-none shadow-md z-1">
                            <ShieldAlert
                              className="w-2.5 h-2.5"
                              fill="currentColor"
                            />{" "}
                            flagged scam
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="relative h-28 rounded-xl overflow-hidden border border-white/5">
                            <img
                              src={prop.images[0]}
                              className="w-full h-full object-cover"
                            />
                            {prop.isPromoted && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 text-[8px] font-black uppercase rounded tracking-widest leading-none flex items-center gap-0.5 shadow">
                                <Star className="w-2.5 h-2.5 fill-current" />{" "}
                                Promoted
                              </span>
                            )}
                            <div className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/60 rounded backdrop-blur-xs font-mono text-[9px] text-white/90">
                              KSh {prop.price.toLocaleString()}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[8px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 font-bold">
                                {prop.id}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded border text-[8px] uppercase font-bold tracking-wider ${
                                  isVerified
                                    ? "bg-emerald-950 text-emerald-300 border-emerald-900/35"
                                    : isRejected
                                      ? "bg-rose-950 text-rose-300 border-rose-900/35"
                                      : "bg-amber-950 text-amber-300 border-amber-900/35"
                                }`}
                              >
                                {prop.verificationStatus || "Pending"}
                              </span>
                            </div>

                            <h4 className="font-bold text-white text-xs mt-2 leading-tight line-clamp-1">
                              {prop.title}
                            </h4>
                            <p className="text-[10px] text-white/50 flex items-center gap-0.5 mt-0.5">
                              <MapPin className="w-3 h-3 text-sky-400" />{" "}
                              {prop.location}
                            </p>
                          </div>
                        </div>

                        {/* Property Controls */}
                        <div className="border-t border-white/5 pt-3.5 mt-3.5 space-y-2">
                          <div className="flex items-center justify-between text-[10px] text-white/50">
                            <span>
                              Quality:{" "}
                              <span className="font-mono font-bold text-indigo-400">
                                {prop.aiQualityScore || 90}%
                              </span>
                            </span>
                            <span>
                              Host:{" "}
                              <span className="font-semibold text-neutral-200">
                                {prop.landlordName}
                              </span>
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-1 font-sans">
                            {/* Verify toggle */}
                            {!isVerified ? (
                              <button
                                onClick={() => {
                                  const updated = properties.map((p) =>
                                    p.id === prop.id
                                      ? {
                                          ...p,
                                          verifiedByAdmin: true,
                                          verificationStatus:
                                            "verified" as const,
                                        }
                                      : p,
                                  );
                                  onUpdateProperties(updated);
                                }}
                                className="py-1 px-2.5 bg-sky-655 hover:bg-sky-600 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-all duration-150 flex items-center justify-center gap-0.5 cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> VERIFY
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const updated = properties.map((p) =>
                                    p.id === prop.id
                                      ? {
                                          ...p,
                                          verifiedByAdmin: false,
                                          verificationStatus:
                                            "pending" as const,
                                        }
                                      : p,
                                  );
                                  onUpdateProperties(updated);
                                }}
                                className="py-1 px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all duration-150 flex items-center justify-center gap-0.5 cursor-pointer border border-white/5"
                              >
                                UNVERIFY
                              </button>
                            )}

                            {/* Flag toggle */}
                            <button
                              onClick={() => {
                                const updated = properties.map((p) =>
                                  p.id === prop.id
                                    ? { ...p, isFlagged: !p.isFlagged }
                                    : p,
                                );
                                onUpdateProperties(updated);
                              }}
                              className={`py-1 px-2.5 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all duration-150 flex items-center justify-center gap-0.5 cursor-pointer ${
                                prop.isFlagged
                                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                                  : "bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-white/5"
                              }`}
                            >
                              <ShieldAlert className="w-2.5 h-2.5" />{" "}
                              {prop.isFlagged ? "UNFLAG" : "QUARANTINE"}
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 pt-0.5 font-sans">
                            {/* Promoted Toggle */}
                            <button
                              onClick={() => {
                                const updated = properties.map((p) =>
                                  p.id === prop.id
                                    ? { ...p, isPromoted: !p.isPromoted }
                                    : p,
                                );
                                onUpdateProperties(updated);
                              }}
                              className={`py-1 px-2 bg-slate-800 hover:bg-slate-700 font-bold text-[9px] uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-0.5 cursor-pointer ${
                                prop.isPromoted
                                  ? "text-amber-400 border border-amber-500/25"
                                  : "text-slate-400 border border-white/5"
                              }`}
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${prop.isPromoted ? "fill-current" : ""}`}
                              />{" "}
                              {prop.isPromoted ? "FEATURED" : "PROMOTE"}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => {
                                const updated = properties.filter(
                                  (p) => p.id !== prop.id,
                                );
                                onUpdateProperties(updated);
                              }}
                              className="py-1 px-2 bg-slate-800 hover:bg-rose-900 hover:text-rose-100 text-slate-400 border border-white/5 font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-0.5 cursor-pointer"
                            >
                              <Trash className="w-3 h-3" /> PURGE
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ESCROW & TRANSACTIONS LEDGERS TAB */}
        {activeTab === "bookings" && (
          <div className="space-y-6 animate-fade-in">
            {/* Split Registry Panel */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Layers className="w-4.5 h-4.5" /> Bookings & Escrow
                    Registry Hold
                  </h3>
                  <p className="text-[10px] text-white/50">
                    Authorize check-ins, release payouts and manage secure
                    transactions keys refunding
                  </p>
                </div>
              </div>

              {/* Bookings registry timeline logs */}
              {bookings.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl bg-white/1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    No Escrow Registry Hold active
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Bookings initiated on Mobile panel will populate the trust
                    escrow system automatically.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[350px] overflow-y-auto invisible-scrollbar pr-1">
                  {bookings.map((booking) => {
                    let statusColor =
                      "bg-amber-950 text-amber-300 border-amber-900/40";
                    if (booking.status === "active")
                      statusColor =
                        "bg-emerald-950 text-emerald-300 border-emerald-900/40";
                    if (booking.status === "completed")
                      statusColor = "bg-sky-950 text-sky-300 border-sky-900/40";
                    if (booking.status === "cancelled")
                      statusColor =
                        "bg-rose-950 text-rose-300 border-rose-900/40";

                    let stepWidth = "33.3%";
                    let holdLabel = "Awaiting Check-in";
                    if (booking.status === "active") {
                      stepWidth = "66.6%";
                      holdLabel = "Escrow Held Securely";
                    } else if (booking.status === "completed") {
                      stepWidth = "100%";
                      holdLabel = "Released to Host";
                    } else if (booking.status === "cancelled") {
                      stepWidth = "100%";
                      holdLabel = "Refunded to Guest";
                    }

                    return (
                      <div
                        key={booking.id}
                        className="p-3.5 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-2xl flex flex-col gap-3 transition"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={booking.propertyImage}
                              className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[9px] text-sky-400 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5 font-extrabold">
                                  {booking.id}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded border text-[9px] uppercase font-black tracking-wider ${statusColor}`}
                                >
                                  {booking.status}
                                </span>
                              </div>
                              <h4 className="font-bold text-white text-xs mt-1.5 leading-tight">
                                {booking.propertyTitle}
                              </h4>
                              <p className="text-[10px] text-white/55 mt-0.5">
                                Tenant:{" "}
                                <span className="text-neutral-200 font-semibold">
                                  {booking.tenantName}
                                </span>{" "}
                                • Landlord ID:{" "}
                                <span className="text-neutral-200 font-mono text-[9px]">
                                  {booking.landlordId}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Escrow volume splits detail */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full md:w-auto items-end gap-3.5 pt-3 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                            <div className="text-right">
                              <span className="text-[8px] text-slate-500 font-bold block uppercase font-mono tracking-wider">
                                M-PESA ESCROW
                              </span>
                              <span className="font-extrabold text-white font-mono text-sm">
                                KSh {booking.amountPaid.toLocaleString()}
                              </span>
                              <span className="text-[9px] text-emerald-400 block font-medium mt-0.5">
                                Split: Landlord KSh{" "}
                                {booking.payoutAmount.toLocaleString()} / Plat
                                KSh {booking.commissionAmount.toLocaleString()}
                              </span>
                            </div>

                            {/* Control button splits inside registries */}
                            <div className="flex gap-1.5 font-sans shrink-0">
                              {booking.status === "pending" && (
                                <button
                                  onClick={() => {
                                    const updated = bookings.map((b) =>
                                      b.id === booking.id
                                        ? { ...b, status: "active" as const }
                                        : b,
                                    );
                                    onUpdateBookings(updated);
                                  }}
                                  className="bg-emerald-655 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg cursor-pointer transition"
                                >
                                  Check In
                                </button>
                              )}
                              {booking.status === "active" && (
                                <>
                                  <button
                                    onClick={() => {
                                      const updated = bookings.map((b) =>
                                        b.id === booking.id
                                          ? {
                                              ...b,
                                              status: "completed" as const,
                                              escrowStatus: "released" as const,
                                            }
                                          : b,
                                      );
                                      onUpdateBookings(updated);
                                    }}
                                    className="bg-sky-600 hover:bg-sky-500 text-white font-black text-[9px] uppercase tracking-wider py-1.5 px-3 rounded-lg cursor-pointer transition"
                                  >
                                    RELEASE ESCROW
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = bookings.map((b) =>
                                        b.id === booking.id
                                          ? {
                                              ...b,
                                              status: "cancelled" as const,
                                              escrowStatus: "refunded" as const,
                                            }
                                          : b,
                                      );
                                      onUpdateBookings(updated);
                                    }}
                                    className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-extrabold text-[9px] uppercase tracking-wider py-1.5 px-2.5 rounded-lg cursor-pointer transition"
                                  >
                                    REFUND
                                  </button>
                                </>
                              )}
                              {booking.status === "completed" && (
                                <span className="font-mono text-[9px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-1 rounded-lg">
                                  ✔ LEDGER DISPATCHED
                                </span>
                              )}
                              {booking.status === "cancelled" && (
                                <span className="font-mono text-[9px] font-black text-slate-400 bg-slate-900 border border-white/5 px-2 py-1 rounded-lg">
                                  ✘ ESCROW REFUNDED
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Visual Step-progress Bar */}
                        <div className="w-full mt-1.5">
                          <div className="flex justify-between text-[8px] font-mono mb-1.5 uppercase font-bold tracking-widest text-slate-500">
                            <span>Progress state</span>
                            <span className={statusColor.split(" ")[1]}>
                              {holdLabel}
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-950/80 rounded-full overflow-hidden flex border border-white/5 shadow-inner">
                            <span
                              className="h-full bg-indigo-500 rounded-full transition-all duration-700 relative shadow-[0_0_10px_#4f46e5]"
                              style={{ width: stepWidth }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Financial Ledger Log Lists */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                  <BarChart4 className="w-4.5 h-4.5" /> Reconciled Escrow Split
                  Journals
                </h3>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 font-sans w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search Reference, host..."
                    value={ledgerSearch}
                    onChange={(e) => setLedgerSearch(e.target.value)}
                    className="w-full sm:w-48 bg-slate-950/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-sky-500 font-medium"
                  />
                  <select
                    value={ledgerFilter}
                    onChange={(e) => setLedgerFilter(e.target.value as any)}
                    className="w-full sm:w-auto bg-slate-950 border border-white/5 text-xs font-bold font-sans rounded-xl px-3 py-1.5 text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Splits</option>
                    <option value="booking_payment">Guest checkout pays</option>
                    <option value="booking_payout">
                      Host released payouts
                    </option>
                    <option value="commission_payout">
                      Platform split audits
                    </option>
                  </select>
                </div>
              </div>

              {/* Transactions records ledger table */}
              <div className="overflow-x-auto text-[11px] no-scrollbar">
                <table className="w-full text-left space-y-1">
                  <thead>
                    <tr className="text-slate-500 border-b border-white/10 pb-2 font-mono uppercase tracking-wider font-extrabold text-[9px]">
                      <th className="py-2.5">Reference</th>
                      <th>Beneficiary Node</th>
                      <th>Method</th>
                      <th>Ledger Type</th>
                      <th>Volume</th>
                      <th>Status State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((trx) => {
                      const isComm = trx.type === "commission_payout";
                      const isPayout = trx.type === "booking_payout";
                      return (
                        <tr
                          key={trx.id}
                          className="border-b border-white/5 hover:bg-slate-900/10 transition-all"
                        >
                          <td className="py-3.5 font-mono font-bold text-sky-400">
                            {trx.reference}
                          </td>
                          <td className="font-bold text-white text-xs">
                            {trx.userName}
                          </td>
                          <td className="uppercase font-mono tracking-wider font-bold text-slate-400 text-[10px]">
                            {trx.provider}
                          </td>
                          <td>
                            <span
                              className={`px-2 py-0.5 rounded-sm font-bold text-[9px] uppercase tracking-wider ${
                                isComm
                                  ? "bg-indigo-950 text-indigo-300 border border-indigo-900/40"
                                  : isPayout
                                    ? "bg-pink-950 text-pink-300 border border-pink-900/40"
                                    : "bg-teal-950 text-teal-300 border border-teal-900/40"
                              }`}
                            >
                              {trx.type.replace("_", " ")}
                            </span>
                          </td>
                          <td className="font-extrabold font-mono text-white text-right">
                            KSh {trx.amount.toLocaleString()}
                          </td>
                          <td>
                            <span className="text-emerald-400 font-mono uppercase tracking-widest font-black text-[9px]">
                              ✔ reconciled
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ROOMMATE MATCHMAKING HUB TAB */}
        {activeTab === "roommates" && (
          <div className="space-y-6 animate-fade-in">
            {/* Interactive Matching Sandbox Module */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-4 bg-gradient-to-br from-slate-900 via-slate-950 to-[#100c24]">
              <div>
                <span className="text-[9px] bg-pink-500/15 text-pink-300 border border-pink-500/20 py-0.5 px-2 rounded-md font-extrabold uppercase tracking-widest font-mono">
                  Cohorts Match sandbox
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5 mt-1">
                  <Sparkles className="w-4.5 h-4.5 animate-spin-slow" /> Neural
                  Compatibility Sandbox
                </h3>
                <p className="text-[10px] text-white/50">
                  Simulate algorithmic roommates match alignments across budget,
                  schedule, sleeping habits & lifestyles
                </p>
              </div>

              {/* Pairing Selectors Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-black/30 p-4 rounded-2xl border border-white/5">
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">
                    Candidate A
                  </label>
                  <select
                    value={sandboxCandidateAId}
                    onChange={(e) => setSandboxCandidateAId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-neutral-200 outline-none cursor-pointer"
                  >
                    {roommates.map((r) => (
                      <option
                        key={r.uid}
                        value={r.uid}
                        disabled={r.partnerFound}
                      >
                        {r.name} ({r.gender} • Budget KSh{" "}
                        {r.budget.toLocaleString()}){" "}
                        {r.partnerFound ? " - MATCHED" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">
                    Candidate B
                  </label>
                  <select
                    value={sandboxCandidateBId}
                    onChange={(e) => setSandboxCandidateBId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-neutral-200 outline-none cursor-pointer"
                  >
                    {roommates.map((r) => (
                      <option
                        key={r.uid}
                        value={r.uid}
                        disabled={r.partnerFound}
                      >
                        {r.name} ({r.gender} • Budget KSh{" "}
                        {r.budget.toLocaleString()}){" "}
                        {r.partnerFound ? " - MATCHED" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    onClick={runSandboxMatch}
                    disabled={
                      isSandboxRunning ||
                      sandboxCandidateAId === sandboxCandidateBId
                    }
                    className="w-full py-3 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Activity className="w-4 h-4" />{" "}
                    {isSandboxRunning
                      ? "SIMULATING ALGORITHMS..."
                      : "RUN MATCH sandbox ENGINE"}
                  </button>
                  {sandboxCandidateAId === sandboxCandidateBId && (
                    <p className="text-[9px] text-rose-400 font-bold tracking-wide mt-1.5 text-center">
                      ⚠️ Select two distinct roommate candidates to compare
                      compatibilities.
                    </p>
                  )}
                </div>
              </div>

              {/* Compatibility score result display */}
              {sandboxResult && (
                <div className="p-4 bg-slate-950/80 border border-pink-500/10 rounded-2.5xl space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <div>
                      <span className="text-[9px] font-mono uppercase bg-pink-500/15 text-pink-300 py-0.5 px-2 rounded-md font-bold">
                        Compatibility Report
                      </span>
                      <h4 className="text-white font-extrabold text-xs mt-1.5">
                        {sandboxResult.pairedA.name} ⚔{" "}
                        {sandboxResult.pairedB.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[8px] text-slate-500 block font-mono font-bold tracking-widest uppercase">
                          Verdict
                        </span>
                        <span className="text-[10px] font-black text-pink-400 uppercase font-mono tracking-tight">
                          {sandboxResult.compatibilityVerdict}
                        </span>
                      </div>
                      <div className="h-10 w-10 rounded-full border-2 border-pink-500/20 bg-pink-500/5 flex items-center justify-center font-mono font-black text-sm text-pink-400">
                        {sandboxResult.score}%
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Categories dial Bars */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        label: "Budget Share",
                        val: sandboxResult.categories.budget,
                        color: "text-sky-400",
                        bg: "bg-sky-500",
                      },
                      {
                        label: "Sleep Parity",
                        val: sandboxResult.categories.sleep,
                        color: "text-indigo-400",
                        bg: "bg-indigo-500",
                      },
                      {
                        label: "Clean Hygiene",
                        val: sandboxResult.categories.cleanliness,
                        color: "text-teal-400",
                        bg: "bg-teal-500",
                      },
                      {
                        label: "Lifestyles Concord",
                        val: sandboxResult.categories.lifestyle,
                        color: "text-pink-400",
                        bg: "bg-pink-500",
                      },
                    ].map((cat) => (
                      <div
                        key={cat.label}
                        className="p-2.5 bg-black/20 rounded-xl border border-white/5 space-y-1"
                      >
                        <span className="text-[9px] text-slate-400 font-bold block truncate uppercase">
                          {cat.label}
                        </span>
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span className={cat.color}>{cat.val}%</span>
                        </div>
                        <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden flex">
                          <span
                            className={`h-full rounded-full ${cat.bg}`}
                            style={{ width: `${cat.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Lifestyle Overlaps */}
                  {sandboxResult.sharedLifestyle.length > 0 && (
                    <div className="text-xs">
                      <span className="text-[9px] text-slate-400 uppercase font-mono font-bold">
                        Shared Cohorts Vibe Indicators:
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {sandboxResult.sharedLifestyle.map((life: string) => (
                          <span
                            key={life}
                            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-bold text-neutral-300"
                          >
                            🌿 {life}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Force Pairing Action */}
                  <div className="border-t border-white/5 pt-3.5 flex justify-end">
                    <button
                      onClick={handleForceMatchRoommates}
                      className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 leading-none font-mono"
                    >
                      <UserCheck className="w-3.5 h-3.5" /> Force Match Pair
                      Units
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Roommate Candidates lists */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5" /> Roommate Co-Living
                    Candidates list
                  </h3>
                  <p className="text-[10px] text-white/50 font-medium">
                    Browse active roommate matching profiles in Kenya
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 font-sans w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search by occupation, habits..."
                    value={roommateSearch}
                    onChange={(e) => setRoommateSearch(e.target.value)}
                    className="w-full sm:w-48 bg-slate-950/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-pink-500 font-medium"
                  />
                  <select
                    value={roommateGenderFilter}
                    onChange={(e) =>
                      setRoommateGenderFilter(e.target.value as any)
                    }
                    className="w-full sm:w-auto bg-slate-950 border border-white/5 text-xs font-bold font-sans rounded-xl px-3 py-1.5 text-white outline-none cursor-pointer"
                  >
                    <option value="all">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              {/* Roommates grid items display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredRoommatesList.map((rom) => (
                  <div
                    key={rom.uid}
                    className={`p-4 rounded-2.5xl bg-slate-950/40 border transition relative flex flex-col justify-between ${
                      rom.partnerFound
                        ? "border-emerald-900 bg-emerald-950/5 opacity-60"
                        : "border-white/5"
                    }`}
                  >
                    <div className="absolute top-2 right-2 flex items-center gap-2">
                      {rom.partnerFound && (
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 font-bold text-[8px] rounded-full font-mono uppercase tracking-widest border border-emerald-500/20">
                          MATCHED
                        </span>
                      )}
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTenantMenuId(activeTenantMenuId === rom.uid ? null : rom.uid);
                          }}
                          className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeTenantMenuId === rom.uid && (
                          <>
                            <div 
                              className="fixed inset-0 z-40"
                              onClick={() => setActiveTenantMenuId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden animate-fade-in origin-top-right">
                              <button 
                                onClick={() => setActiveTenantMenuId(null)}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Send Message
                              </button>
                              <button 
                                onClick={() => setActiveTenantMenuId(null)}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <History className="w-3.5 h-3.5" />
                                View History
                              </button>
                              <div className="h-px bg-white/5 my-1 mx-2" />
                              <button 
                                onClick={() => setActiveTenantMenuId(null)}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Flag className="w-3.5 h-3.5" />
                                Flag Account
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-3 mt-4">
                      <img
                        src={rom.avatar}
                        className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-white text-xs">
                          {rom.name}{" "}
                          <span className="text-slate-400 font-medium font-mono text-[10px]">
                            ({rom.age}y, {rom.gender})
                          </span>
                        </h4>
                        <p className="text-[10px] text-indigo-400 font-mono mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-indigo-400" />{" "}
                          {rom.occupation}
                        </p>
                        <p className="text-[10px] text-white/50 mt-1">
                          Budget:{" "}
                          <span className="font-extrabold text-neutral-100 font-mono">
                            KSh {rom.budget.toLocaleString()}
                          </span>
                          /mo
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-3 space-y-2">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">
                        <span>Sleep schedule</span>
                        <span className="text-neutral-200 font-extrabold">
                          {rom.sleepSchedule}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">
                        <span>Hygiene habit</span>
                        <span className="text-neutral-200 font-extrabold">
                          {rom.cleanliness} Clean
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {rom.lifestyle.map((style) => (
                          <span
                            key={style}
                            className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[8px] font-bold text-neutral-300"
                          >
                            {style}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI CYBER SHIELD TAB */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fade-in">
            {/* Cyber Scam configurations adjustments panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Threat multiplier Configuration coefficients block */}
              <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 md:col-span-1 space-y-4">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Settings className="w-4 h-4" /> Hazard Scoring Matrix
                  </h3>
                  <p className="text-[10px] text-white/50">
                    Tweak automatic cyber scam audit thresholds coefficients
                  </p>
                </div>

                <div className="space-y-4 pt-1 font-sans text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                      <span>Kilimani Standard Min (KSh)</span>
                      <span className="text-amber-400 font-semibold">
                        {securityThresholds.minKilimaniPrice.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10000"
                      max="30000"
                      step="1000"
                      value={securityThresholds.minKilimaniPrice}
                      onChange={(e) =>
                        setSecurityThresholds((prev) => ({
                          ...prev,
                          minKilimaniPrice: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                      <span>Westlands Standard Min (KSh)</span>
                      <span className="text-amber-400 font-semibold">
                        {securityThresholds.minWestlandsPrice.toLocaleString()}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="12000"
                      max="35000"
                      step="1000"
                      value={securityThresholds.minWestlandsPrice}
                      onChange={(e) =>
                        setSecurityThresholds((prev) => ({
                          ...prev,
                          minWestlandsPrice: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-slate-400">
                      <span>Contact Leak Penalty weight</span>
                      <span className="text-rose-400 font-semibold">
                        {securityThresholds.offPlatformKeywordWeight}% hazard
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={securityThresholds.offPlatformKeywordWeight}
                      onChange={(e) =>
                        setSecurityThresholds((prev) => ({
                          ...prev,
                          offPlatformKeywordWeight: Number(e.target.value),
                        }))
                      }
                      className="w-full accent-rose-505 cursor-pointer"
                    />
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl rounded-b-lg">
                    <p className="text-[10px] text-amber-300 leading-normal font-sans font-medium flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 shrink-0" /> Local
                      Heuristic rules are synchronized real-time. If listings
                      underprice this median margin, cyber scanner flags
                      automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Secure sandbox simulator room description scanner */}
              <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 md:col-span-2 space-y-4">
                <div>
                  <span className="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 py-0.5 px-2 rounded-md font-extrabold uppercase tracking-widest font-mono">
                    Anti-scam Laboratory
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mt-1">
                    <Bot className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />{" "}
                    Cyber Sandbox Copy Scanner
                  </h3>
                  <p className="text-[10px] text-white/50">
                    Simulate scanner responses to custom landlord descriptions
                    containing urgent wording, external payments or phone leaks
                  </p>
                </div>

                <div className="space-y-3.5 pt-1">
                  <textarea
                    rows={3}
                    value={customScanText}
                    onChange={(e) => setCustomScanText(e.target.value)}
                    className="w-full bg-slate-950/60 border border-white/5 focus:border-indigo-500 p-3 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-medium leading-relaxed"
                    placeholder="Type customized mock description copy..."
                  />

                  <button
                    onClick={runDescriptiveSimScan}
                    disabled={isScanningFraud || !customScanText.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition flex items-center justify-center gap-1 shadow-lg cursor-pointer font-mono"
                  >
                    <Activity className="w-4 h-4 animate-spin-slow" /> RUN
                    SECURITY TEXT ANALYSIS
                  </button>
                </div>
              </div>
            </div>

            {/* Cyber scanner interactive targets grid */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2.5xl p-5 space-y-4">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5" /> Live Landlords Cyber
                  Scam Target Watch
                </h3>
                <p className="text-[10px] text-white/50">
                  Initiate automated heuristic checks on current landlords
                  listings feed parameters
                </p>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto invisible-scrollbar pr-1">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 bg-slate-950/40 border border-white/5 hover:border-white/10 rounded-2xl flex justify-between items-center text-xs transition"
                  >
                    <div>
                      <p className="font-bold text-white line-clamp-1">
                        {p.title}
                      </p>
                      <span className="text-[10px] text-white/50 font-mono">
                        {p.location} • KSh {p.price.toLocaleString()} • Host:{" "}
                        {p.landlordName}
                      </span>
                    </div>

                    <button
                      onClick={() => runAntiFraudScan(p)}
                      disabled={isScanningFraud}
                      className="py-1 px-3 bg-slate-800 hover:bg-amber-600 hover:text-white text-amber-400 rounded-lg text-[9px] font-mono font-black tracking-tight border border-white/5 cursor-pointer uppercase transition-all"
                    >
                      {isScanningFraud && activePropertyScanId === p.id
                        ? "SCANNING LAB..."
                        : "RUN CORE AUDIT"}
                    </button>
                  </div>
                ))}
              </div>

              {/* Scanner Results outputs */}
              {customScanResults && (
                <div
                  className={`p-4 rounded-2.5xl border flex flex-col gap-2.5 text-xs text-left animate-fade-in ${
                    customScanResults.riskLevel === "HIGH_RISK_SCAM"
                      ? "bg-rose-950/50 border-rose-500/20 text-rose-100"
                      : "bg-slate-950 border-white/10 text-neutral-200"
                  }`}
                >
                  <div className="flex justify-between font-black text-[10px] uppercase tracking-wider font-mono">
                    <span>
                      Diagnostic target:{" "}
                      <span className="text-white">
                        {customScanResults.targetTitle}
                      </span>
                    </span>
                    <span
                      className={
                        customScanResults.riskLevel === "HIGH_RISK_SCAM"
                          ? "text-rose-400"
                          : "text-emerald-400"
                      }
                    >
                      {customScanResults.riskLevel?.replace("_", " ")}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-300">
                      Hazard probability coefficient:{" "}
                      <span className="font-mono text-white text-[13px]">
                        {customScanResults.scamProbability}% probability
                      </span>
                    </p>
                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden flex border border-white/5 mt-1 text-xs">
                      <span
                        className={`h-full rounded-full transition-all duration-500 ${
                          customScanResults.riskLevel === "HIGH_RISK_SCAM"
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${customScanResults.scamProbability}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase block text-slate-400 tracking-wider">
                      Intercept warning flags:
                    </span>
                    {customScanResults.flags.map((fl: string, x: number) => (
                      <p
                        key={x}
                        className="text-[10.5px] font-medium text-slate-300 flex items-center gap-1 border-b border-white/5 pb-1 last:border-0"
                      >
                        ⚠️ {fl}
                      </p>
                    ))}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed font-mono mt-1.5 italic font-medium bg-black/20 p-2.5 rounded-xl">
                    Rapport analysis digest:{" "}
                    <span className="text-neutral-200">
                      {customScanResults.rationale}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RENDER MODAL FORM: Submit listing landlord portal overlay */}
      {isAddingListing && (
        <div className="fixed inset-0 bg-slate-950/90 flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <PlusCircle className="w-4.5 h-4.5" /> partner landlord portal
              </h3>
              <button
                onClick={() => setIsAddingListing(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer border-none bg-transparent"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleCreateProperty}
              className="space-y-3.5 text-xs text-left"
            >
              <div className="space-y-1">
                <label className="text-slate-400 block uppercase font-mono text-[9px] tracking-wider">
                  Listing Title Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Westside Studio Kilimani"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 py-2 px-3 rounded-xl text-white focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-400 block uppercase font-mono text-[9px] tracking-wider">
                    Monthly Price (KSh)
                  </label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/5 py-2 px-3 rounded-xl text-white focus:outline-none focus:border-sky-500 font-mono text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block uppercase font-mono text-[9px] tracking-wider">
                    Property Category
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/5 py-2 px-3 rounded-xl text-white focus:outline-none font-semibold cursor-pointer text-xs"
                  >
                    <option value="apartment">Standard Rental</option>
                    <option value="airbnb">Airbnb (Daily)</option>
                    <option value="roommate">Cohort Roommate</option>
                    <option value="hotel">Boutique Hotel</option>
                    <option value="sale">Outright Sale</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block uppercase font-mono text-[9px] tracking-wider">
                  Kenya Location District
                </label>
                <select
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 py-2.5 px-3 rounded-xl text-white focus:outline-none focus:border-sky-500 font-semibold cursor-pointer text-xs"
                >
                  <option value="Kilimani, Nairobi">Kilimani, Nairobi</option>
                  <option value="Westlands, Nairobi">Westlands, Nairobi</option>
                  <option value="Karen, Nairobi">Karen, Nairobi</option>
                  <option value="Nyali, Mombasa">Nyali, Mombasa</option>
                  <option value="Muthaiga, Nairobi">
                    Muthaiga, Nairobi (Scam Check)
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block uppercase font-mono text-[9px] tracking-wider">
                  Description & Amenities list
                </label>
                <textarea
                  rows={2}
                  required
                  value={newDescr}
                  onChange={(e) => setNewDescr(e.target.value)}
                  className="w-full bg-slate-950 border border-white/5 p-3 rounded-xl text-white focus:outline-none focus:border-sky-500 font-medium leading-relaxed resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-sky-650 via-indigo-650 to-indigo-700 hover:opacity-90 text-white rounded-xl font-bold uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Building className="w-4 h-4" /> Deploy Listing live on Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline fallback icon helper for clear matches
function AlertCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
      />
    </svg>
  );
}

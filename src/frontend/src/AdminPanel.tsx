import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  LogOut,
  Package,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";
import type { Booking } from "./backend.d";
import { useActor } from "./hooks/useActor";

// ─── Constants ───────────────────────────────────────────────
const ADMIN_PASSWORD = "freshfold2024";
const SESSION_KEY = "adminAuth";

// ─── Service Label Map ────────────────────────────────────────
const serviceLabels: Record<string, string> = {
  washFold: "Wash & Fold",
  washIron: "Wash & Iron",
  dryCleaning: "Dry Cleaning",
  expressLaundry: "Express Laundry",
  blanketBedsheet: "Blanket & Bedsheet",
};

const serviceBadgeColor: Record<string, string> = {
  washFold: "bg-emerald/10 text-emerald-dark border-emerald/20",
  washIron: "bg-navy/10 text-navy border-navy/20",
  dryCleaning: "bg-purple-100 text-purple-700 border-purple-200",
  expressLaundry: "bg-amber-100 text-amber-700 border-amber-200",
  blanketBedsheet: "bg-sky-100 text-sky-700 border-sky-200",
};

function getServiceKey(serviceType: { __kind__?: string } | string): string {
  if (typeof serviceType === "string") return serviceType;
  if (
    serviceType &&
    typeof serviceType === "object" &&
    "__kind__" in serviceType
  ) {
    return (serviceType as { __kind__: string }).__kind__;
  }
  return String(serviceType);
}

function formatServiceLabel(serviceType: Booking["serviceType"]): string {
  const key = getServiceKey(serviceType as unknown as string);
  return serviceLabels[key] ?? key;
}

function getServiceBadgeClass(serviceType: Booking["serviceType"]): string {
  const key = getServiceKey(serviceType as unknown as string);
  return serviceBadgeColor[key] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

// ─── Date helpers ─────────────────────────────────────────────
function formatTimestamp(ts: bigint): string {
  const ms = Number(ts / BigInt(1_000_000));
  return new Date(ms).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(ts: bigint): boolean {
  const ms = Number(ts / BigInt(1_000_000));
  const d = new Date(ms);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function getMostPopularService(bookings: Booking[]): string {
  if (!bookings.length) return "—";
  const counts: Record<string, number> = {};
  for (const b of bookings) {
    const key = getServiceKey(b.serviceType as unknown as string);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return top ? (serviceLabels[top[0]] ?? top[0]) : "—";
}

// ─── Login Screen ─────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      onLogin();
    } else {
      setError("Incorrect password. Please try again.");
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div className="min-h-screen admin-login-bg flex items-center justify-center px-4">
      {/* Back link */}
      <a
        href="/"
        data-ocid="admin.back_link"
        className="fixed top-6 left-6 flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to site
      </a>

      <div className={`w-full max-w-sm ${isShaking ? "animate-shake" : ""}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald mb-4 shadow-glow">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white mb-1">
            Fresh<span className="text-emerald">Fold</span> Admin
          </h1>
          <p className="text-white/50 text-sm">Sign in to manage bookings</p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="admin-password"
                  className="text-white/80 text-sm font-medium"
                >
                  Admin Password
                </Label>
                <Input
                  id="admin-password"
                  data-ocid="admin.login.password_input"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus-visible:ring-emerald focus-visible:border-emerald/50 rounded-xl"
                  autoFocus
                />
              </div>

              {error && (
                <div
                  data-ocid="admin.login.error_state"
                  className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5 text-red-300 text-sm"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                data-ocid="admin.login.submit_button"
                type="submit"
                className="w-full bg-emerald hover:bg-emerald-dark text-white font-semibold py-5 rounded-xl shadow-glow hover:shadow-lg transition-all duration-200"
              >
                Sign In
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
}

// ─── Stats Card ───────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  ocid,
  iconClass,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  ocid: string;
  iconClass: string;
}) {
  return (
    <Card data-ocid={ocid} className="border-border shadow-card bg-card">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <div className="font-display text-3xl font-black text-navy mb-1">
          {value}
        </div>
        <div className="text-sm font-semibold text-foreground mb-0.5">
          {label}
        </div>
        {sub && (
          <div className="text-xs text-muted-foreground truncate">{sub}</div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { actor, isFetching: actorFetching } = useActor();

  const {
    data: bookings = [],
    isLoading,
    isError,
  } = useQuery<Booking[]>({
    queryKey: ["adminBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30_000,
  });

  // Sort by newest first
  const sorted = [...bookings].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  const todayCount = bookings.filter((b) => isToday(b.timestamp)).length;
  const popularService = getMostPopularService(bookings);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Top Bar ──────────────────────────── */}
      <header className="sticky top-0 z-40 bg-navy border-b border-navy-light/30 shadow-navy-glow/20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-white text-lg leading-none">
                Fresh<span className="text-emerald">Fold</span>
              </span>
              <div className="text-white/40 text-[10px] font-medium uppercase tracking-wider leading-none mt-0.5">
                Admin Panel
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/"
              data-ocid="admin.back_link"
              className="hidden sm:flex items-center gap-1.5 text-white/60 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to site
            </a>
            <Button
              data-ocid="admin.logout_button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-white/20 text-white bg-white/5 hover:bg-white/15 rounded-lg gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─────────────────────── */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-navy mb-1">
            Booking Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            View and manage all customer bookings
          </p>
        </div>

        {/* ─── Stats Row ────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Users}
            label="Total Bookings"
            value={isLoading ? "…" : String(bookings.length)}
            sub="All time"
            ocid="admin.stats.total_card"
            iconClass="bg-navy/10 text-navy"
          />
          <StatCard
            icon={CalendarDays}
            label="Today's Bookings"
            value={isLoading ? "…" : String(todayCount)}
            sub={new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
            ocid="admin.stats.today_card"
            iconClass="bg-emerald/10 text-emerald-dark"
          />
          <StatCard
            icon={Star}
            label="Most Popular Service"
            value={isLoading ? "…" : ""}
            sub={isLoading ? "Loading..." : popularService}
            ocid="admin.stats.popular_card"
            iconClass="bg-amber-100 text-amber-700"
          />
        </div>

        {/* ─── Bookings Table ───────────────── */}
        <Card className="border-border shadow-card">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl text-navy flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-emerald-dark" />
                All Bookings
              </CardTitle>
              {!isLoading && (
                <Badge className="bg-accent text-accent-foreground border-0 font-semibold">
                  {bookings.length} total
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading || actorFetching ? (
              <div
                data-ocid="admin.bookings.loading_state"
                className="p-6 space-y-3"
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : isError ? (
              <div
                data-ocid="admin.bookings.error_state"
                className="p-12 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="font-semibold text-navy mb-1">
                  Failed to load bookings
                </p>
                <p className="text-sm text-muted-foreground">
                  Please refresh the page to try again.
                </p>
              </div>
            ) : sorted.length === 0 ? (
              <div
                data-ocid="admin.bookings.empty_state"
                className="p-16 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/50 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-display font-bold text-navy text-lg mb-2">
                  No bookings yet
                </p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  When customers submit bookings, they'll appear here.
                </p>
                <a href="/" className="inline-block mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-border text-navy"
                  >
                    View site
                  </Button>
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table data-ocid="admin.bookings.table">
                  <TableHeader>
                    <TableRow className="bg-accent/30 hover:bg-accent/30">
                      <TableHead className="text-navy font-bold pl-6 py-3 w-12">
                        #
                      </TableHead>
                      <TableHead className="text-navy font-bold py-3">
                        Name
                      </TableHead>
                      <TableHead className="text-navy font-bold py-3">
                        Phone
                      </TableHead>
                      <TableHead className="text-navy font-bold py-3">
                        Address
                      </TableHead>
                      <TableHead className="text-navy font-bold py-3">
                        Pickup Date
                      </TableHead>
                      <TableHead className="text-navy font-bold py-3">
                        Service
                      </TableHead>
                      <TableHead className="text-navy font-bold py-3 text-center">
                        Items
                      </TableHead>
                      <TableHead className="text-navy font-bold py-3 pr-6 hidden md:table-cell">
                        Booked On
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sorted.map((booking, index) => {
                      const rowNum = index + 1;
                      const ocid =
                        rowNum <= 10
                          ? (`admin.booking.row.${rowNum}` as const)
                          : undefined;
                      return (
                        <TableRow
                          key={String(booking.id)}
                          data-ocid={ocid}
                          className="hover:bg-accent/20 transition-colors group"
                        >
                          <TableCell className="pl-6 py-4 text-muted-foreground text-sm font-mono">
                            {String(booking.id)}
                          </TableCell>
                          <TableCell className="py-4 font-semibold text-navy">
                            {booking.name}
                          </TableCell>
                          <TableCell className="py-4">
                            <a
                              href={`tel:${booking.phone}`}
                              className="text-emerald-dark font-medium hover:underline text-sm"
                            >
                              {booking.phone}
                            </a>
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className="text-muted-foreground text-sm max-w-[200px] block truncate"
                              title={booking.address}
                            >
                              {booking.address}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-1.5 text-sm text-foreground">
                              <CalendarDays className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                              {booking.pickupDate}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getServiceBadgeClass(booking.serviceType)}`}
                            >
                              {formatServiceLabel(booking.serviceType)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-navy/5 text-navy font-bold text-sm">
                              {String(booking.numClothes)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 pr-6 hidden md:table-cell text-muted-foreground text-sm">
                            <div className="flex items-center gap-1.5">
                              <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                              {formatTimestamp(booking.timestamp)}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-muted-foreground text-xs">
          © {new Date().getFullYear()} FreshFold. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-navy transition-colors underline underline-offset-2"
          >
            caffeine.ai
          </a>
        </div>
      </main>
    </div>
  );
}

// ─── Admin Panel Root ─────────────────────────────────────────
export default function AdminPanel() {
  const [isAuthed, setIsAuthed] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true",
  );

  const handleLogin = () => setIsAuthed(true);

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthed(false);
  };

  if (!isAuthed) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <Dashboard onLogout={handleLogout} />;
}

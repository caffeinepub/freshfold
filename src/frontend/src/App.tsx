import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Bed,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Instagram,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  Package,
  Phone,
  Shirt,
  Sparkles,
  Star,
  Truck,
  WashingMachine,
  Wind,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { ServiceType } from "./backend.d";
import { MapPickerDialog } from "./components/MapPickerDialog";
import { useActor } from "./hooks/useActor";

// ─── Scroll Reveal Hook ──────────────────────────────────────
function useScrollReveal() {
  const refs = useRef<(HTMLElement | null)[]>([]);

  const addRef = useCallback((el: HTMLElement | null) => {
    if (el && !refs.current.includes(el)) {
      refs.current.push(el);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    for (const el of refs.current) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return addRef;
}

// ─── Service Type Mapping ───────────────────────────────────
const serviceTypeMap: Record<string, ServiceType> = {
  washFold: ServiceType.washFold,
  washIron: ServiceType.washIron,
  dryCleaning: ServiceType.dryCleaning,
  expressLaundry: ServiceType.expressLaundry,
  blanketBedsheet: ServiceType.blanketBedsheet,
};

const serviceLabels: Record<string, string> = {
  washFold: "Wash & Fold",
  washIron: "Wash & Iron",
  dryCleaning: "Dry Cleaning",
  expressLaundry: "Express Laundry",
  blanketBedsheet: "Blanket & Bedsheet Cleaning",
};

// ─── Item Pricing Data ──────────────────────────────────────
const itemPrices = [
  { item: "Shirt / T-Shirt", price: "₹40" },
  { item: "Jeans / Trouser", price: "₹50" },
  { item: "Kurta", price: "₹50" },
  { item: "Bedsheet", price: "₹40" },
  { item: "Pillow Cover", price: "₹20" },
  { item: "Blanket Single", price: "₹239" },
  { item: "Blanket Double", price: "₹339" },
  { item: "Curtain", price: "₹90" },
  { item: "Jacket", price: "₹120" },
];

// ─── Testimonials ───────────────────────────────────────────
const testimonials = [
  {
    name: "Priya S.",
    location: "Guwahati",
    text: "FreshFold is amazing! My clothes come back perfectly folded and smelling fresh. The pickup was right on time!",
    initials: "PS",
  },
  {
    name: "Rahul D.",
    location: "Guwahati",
    text: "Best laundry service in the city. The express option saved me before an important meeting!",
    initials: "RD",
  },
  {
    name: "Anjali B.",
    location: "Guwahati",
    text: "Incredibly convenient. I love that I can book online and track my order. Highly recommend!",
    initials: "AB",
  },
  {
    name: "Suresh K.",
    location: "Guwahati",
    text: "The blanket cleaning service is top-notch. Will definitely use FreshFold again!",
    initials: "SK",
  },
];

// ─── Main App ───────────────────────────────────────────────
export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const addRevealRef = useScrollReveal();
  const { actor } = useActor();

  // Booking form state
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingService, setBookingService] = useState("");
  const [bookingClothes, setBookingClothes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingId, setBookingId] = useState<bigint | null>(null);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);

  // Nav scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (
      !bookingName.trim() ||
      !bookingPhone.trim() ||
      !bookingAddress.trim() ||
      !bookingDate ||
      !bookingService ||
      !bookingClothes
    ) {
      setSubmitError("Please fill in all required fields.");
      return;
    }

    const clothesCount = Number.parseInt(bookingClothes, 10);
    if (Number.isNaN(clothesCount) || clothesCount < 1) {
      setSubmitError("Please enter a valid number of clothes.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (!actor) {
        setSubmitError("Service unavailable. Please try again.");
        setIsSubmitting(false);
        return;
      }
      const serviceType = serviceTypeMap[bookingService];
      if (!serviceType) {
        setSubmitError("Please select a valid service type.");
        setIsSubmitting(false);
        return;
      }
      const id = await actor.submitBooking(
        bookingName.trim(),
        bookingPhone.trim(),
        bookingAddress.trim(),
        bookingDate,
        serviceType,
        BigInt(clothesCount),
      );
      setBookingId(id);
      setConfirmOpen(true);

      // Send instant WhatsApp notification to owner with all booking details
      const serviceLabel = serviceLabels[bookingService] ?? bookingService;
      const notifyMsg = encodeURIComponent(
        `🧺 *New FreshFold Booking!*\n\n*Booking ID:* #${id}\n*Name:* ${bookingName.trim()}\n*Phone:* ${bookingPhone.trim()}\n*Address:* ${bookingAddress.trim()}\n*Pickup Date:* ${bookingDate}\n*Service:* ${serviceLabel}\n*No. of Clothes:* ${clothesCount}`,
      );
      window.open(`https://wa.me/919613206589?text=${notifyMsg}`, "_blank");

      // Reset form
      setBookingName("");
      setBookingPhone("");
      setBookingAddress("");
      setBookingDate("");
      setBookingService("");
      setBookingClothes("");
    } catch (err) {
      console.error(err);
      setSubmitError(
        "Something went wrong. Please try again or use WhatsApp to book.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappText = encodeURIComponent(
    "Hi FreshFold! I want to book a laundry pickup.",
  );
  const whatsappUrl = `https://wa.me/919613206589?text=${whatsappText}`;

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Services", id: "services" },
    { label: "Pricing", id: "pricing" },
    { label: "Book Now", id: "booking" },
  ];

  return (
    <div className="min-h-screen font-body bg-background overflow-x-hidden">
      {/* ─── Navbar ──────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 navbar-glass transition-all duration-300 ${navScrolled ? "scrolled" : ""}`}
      >
        <nav className="container max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <button
            type="button"
            onClick={() => scrollTo("home")}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-navy">
              Fresh<span className="text-emerald">Fold</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  type="button"
                  data-ocid="nav.link"
                  onClick={() => scrollTo(link.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    ${
                      link.id === "booking"
                        ? "bg-emerald text-white hover:bg-emerald-dark shadow-sm hover:shadow-glow"
                        : "text-navy/70 hover:text-navy hover:bg-accent"
                    }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-navy hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-border px-4 pb-4 animate-fadeIn">
            <ul className="flex flex-col gap-1 pt-2">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    type="button"
                    data-ocid="nav.link"
                    onClick={() => scrollTo(link.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${
                        link.id === "booking"
                          ? "bg-emerald text-white mt-1"
                          : "text-navy/80 hover:text-navy hover:bg-accent"
                      }`}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section
        id="home"
        className="hero-bg min-h-screen flex items-center pt-16 relative overflow-hidden"
      >
        {/* Decorative blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-400/5 blur-3xl pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-0 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
                <span className="text-white/80 text-sm font-medium">
                  Now serving Guwahati
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6 animate-fadeInUp">
                Laundry Made{" "}
                <span className="relative">
                  <span className="text-emerald">Effortless</span>
                  <svg
                    aria-hidden="true"
                    className="absolute -bottom-1 left-0 w-full"
                    viewBox="0 0 200 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 6 Q50 2 100 5 Q150 8 198 3"
                      stroke="oklch(0.65 0.19 160)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>

              <p className="text-white/70 text-lg sm:text-xl mb-8 leading-relaxed animate-fadeInUp delay-200">
                Doorstep Pickup&nbsp;•&nbsp;Professional
                Cleaning&nbsp;•&nbsp;Fast Delivery
              </p>

              <div className="flex flex-wrap gap-4 animate-fadeInUp delay-300">
                <Button
                  data-ocid="hero.primary_button"
                  size="lg"
                  onClick={() => scrollTo("booking")}
                  className="bg-emerald hover:bg-emerald-dark text-white font-semibold px-8 py-6 text-base rounded-xl shadow-glow hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  Book Pickup
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Button>
                <Button
                  data-ocid="hero.secondary_button"
                  size="lg"
                  variant="outline"
                  onClick={() => scrollTo("pricing")}
                  className="border-white/30 text-white bg-white/10 hover:bg-white/20 font-semibold px-8 py-6 text-base rounded-xl backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5"
                >
                  View Pricing
                </Button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 mt-12 animate-fadeInUp delay-400">
                {[
                  { value: "500+", label: "Happy Customers" },
                  { value: "24h", label: "Express Delivery" },
                  { value: "4.9★", label: "Rating" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-display font-bold text-white">
                      {stat.value}
                    </div>
                    <div className="text-white/50 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration */}
            <div className="flex justify-center lg:justify-end animate-fadeInRight delay-200">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-emerald/10 blur-2xl scale-110" />
                <img
                  src="/assets/generated/hero-laundry.dim_600x500.png"
                  alt="FreshFold laundry service illustration"
                  className="relative rounded-3xl animate-float max-w-[480px] w-full object-cover shadow-navy-glow"
                  loading="eager"
                />
                {/* Floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-3 shadow-card flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-emerald-dark" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Free delivery
                    </div>
                    <div className="text-sm font-semibold text-navy">
                      All orders
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-card flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-emerald-dark" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Express</div>
                    <div className="text-sm font-semibold text-navy">
                      24h delivery
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            aria-hidden="true"
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 80V40C240 0 480 80 720 40C960 0 1200 80 1440 40V80H0Z"
              fill="oklch(0.98 0.005 220)"
            />
          </svg>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div
            ref={(el) => addRevealRef(el)}
            className="reveal text-center mb-16"
          >
            <Badge className="mb-4 bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium">
              Simple Process
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Three simple steps to clean, fresh laundry at your door.
            </p>
          </div>

          <div className="relative">
            {/* Desktop connector line */}
            <div className="hidden md:block absolute top-14 left-[calc(16.67%+32px)] right-[calc(16.67%+32px)] h-0.5 bg-gradient-to-r from-emerald via-emerald/40 to-emerald z-0" />

            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {[
                {
                  icon: CalendarDays,
                  step: "01",
                  title: "Schedule Pickup",
                  desc: "Book your preferred pickup date and time from our easy online form or WhatsApp.",
                  color: "bg-emerald/10 text-emerald-dark",
                },
                {
                  icon: WashingMachine,
                  step: "02",
                  title: "We Wash & Dry",
                  desc: "Our professionals clean your clothes with premium detergents and expert care.",
                  color: "bg-navy/10 text-navy",
                },
                {
                  icon: Truck,
                  step: "03",
                  title: "FreshFold Delivery",
                  desc: "Your fresh, neatly folded laundry is delivered right back to your doorstep.",
                  color: "bg-emerald/10 text-emerald-dark",
                },
              ].map((s, i) => (
                <div
                  key={s.step}
                  ref={(el) => addRevealRef(el)}
                  className="reveal card-hover bg-card rounded-2xl p-8 shadow-card border border-border text-center"
                  style={{ transitionDelay: `${i * 0.15}s` }}
                >
                  <div className="flex justify-center mb-5">
                    <div
                      className={`w-16 h-16 rounded-2xl ${s.color} flex items-center justify-center`}
                    >
                      <s.icon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="text-4xl font-display font-black text-border mb-2">
                    {s.step}
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy mb-3">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Services Section ─────────────────────────────────── */}
      <section
        id="services"
        className="py-24 bg-gradient-to-b from-background to-accent/20"
      >
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div
            ref={(el) => addRevealRef(el)}
            className="reveal text-center mb-16"
          >
            <Badge className="mb-4 bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium">
              What We Offer
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              Our Services
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Professional laundry care tailored to every fabric and need.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shirt,
                title: "Wash & Fold",
                desc: "Fresh, clean clothes neatly folded and ready to wear. Uses premium detergents.",
                badge: "Most Popular",
                badgeColor: "bg-emerald/10 text-emerald-dark",
              },
              {
                icon: Wind,
                title: "Wash & Iron",
                desc: "Spotlessly clean and crisply ironed. Perfect for office wear and formal attire.",
                badge: null,
                badgeColor: "",
              },
              {
                icon: Sparkles,
                title: "Dry Cleaning",
                desc: "Expert dry cleaning for delicate fabrics, suits, and premium garments.",
                badge: "Premium",
                badgeColor: "bg-navy/10 text-navy",
              },
              {
                icon: Bed,
                title: "Blanket & Bedsheet Cleaning",
                desc: "Deep-clean your blankets, duvets, and bedsheets for a fresh night's sleep.",
                badge: null,
                badgeColor: "",
              },
              {
                icon: Zap,
                title: "Express Laundry",
                desc: "Same-day turnaround for urgent needs. Ready in as little as 24 hours.",
                badge: "Fast",
                badgeColor: "bg-amber-100 text-amber-700",
              },
              {
                icon: Package,
                title: "Special Garments",
                desc: "Curtains, jackets, and large items cleaned with specialized care and expertise.",
                badge: null,
                badgeColor: "",
              },
            ].map((service, i) => (
              <div
                key={service.title}
                ref={(el) => addRevealRef(el)}
                className="reveal card-hover bg-card rounded-2xl p-6 shadow-card border border-border group cursor-default"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald/10 flex items-center justify-center group-hover:bg-emerald/20 transition-colors">
                    <service.icon className="w-6 h-6 text-emerald-dark" />
                  </div>
                  {service.badge && (
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${service.badgeColor}`}
                    >
                      {service.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg font-bold text-navy mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Packages ─────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div
            ref={(el) => addRevealRef(el)}
            className="reveal text-center mb-16"
          >
            <Badge className="mb-4 bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium">
              Plans & Pricing
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              No hidden charges. Just clean clothes at honest prices.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Starter Plan */}
            <div
              data-ocid="pricing.item.1"
              ref={(el) => addRevealRef(el)}
              className="reveal card-hover bg-card rounded-2xl p-8 border border-border shadow-card"
            >
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-navy mb-1">
                  Starter Plan
                </h3>
                <p className="text-muted-foreground text-sm">
                  Perfect to get started
                </p>
              </div>
              <div className="mb-6">
                <span className="font-display text-5xl font-black text-navy">
                  ₹499
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  /order
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "7 pieces laundry",
                  "Wash & Fold",
                  "Free pickup",
                  "Free delivery",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                data-ocid="pricing.book_now.button.1"
                onClick={() => scrollTo("booking")}
                variant="outline"
                className="w-full border-navy/20 text-navy hover:bg-navy hover:text-white transition-all duration-200 rounded-xl font-semibold py-5"
              >
                Book Now
              </Button>
            </div>

            {/* Student Plan (Popular) */}
            <div
              data-ocid="pricing.item.2"
              ref={(el) => addRevealRef(el)}
              className="reveal popular-card rounded-2xl p-8 relative -mt-4 mb-4 md:mt-0 md:mb-0 md:scale-105 z-10"
              style={{ transitionDelay: "0.1s" }}
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-emerald text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-glow">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-white mb-1">
                  Student Plan
                </h3>
                <p className="text-white/60 text-sm">
                  Great for students & couples
                </p>
              </div>
              <div className="mb-6">
                <span className="font-display text-5xl font-black text-white">
                  ₹899
                </span>
                <span className="text-white/60 text-sm ml-1">/order</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "15 pieces laundry",
                  "Wash & Iron",
                  "Free pickup",
                  "Free delivery",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-white"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                data-ocid="pricing.book_now.button.2"
                onClick={() => scrollTo("booking")}
                className="w-full bg-emerald hover:bg-emerald-dark text-white rounded-xl font-semibold py-5 shadow-glow hover:shadow-lg transition-all"
              >
                Book Now
              </Button>
            </div>

            {/* Premium Plan */}
            <div
              data-ocid="pricing.item.3"
              ref={(el) => addRevealRef(el)}
              className="reveal card-hover bg-card rounded-2xl p-8 border border-border shadow-card"
              style={{ transitionDelay: "0.2s" }}
            >
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-navy mb-1">
                  Premium Plan
                </h3>
                <p className="text-muted-foreground text-sm">
                  For families & businesses
                </p>
              </div>
              <div className="mb-6">
                <span className="font-display text-5xl font-black text-navy">
                  ₹1499
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  /order
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "30 pieces laundry",
                  "Priority cleaning",
                  "Free pickup",
                  "Free delivery",
                ].map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 text-sm text-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                data-ocid="pricing.book_now.button.3"
                onClick={() => scrollTo("booking")}
                variant="outline"
                className="w-full border-navy/20 text-navy hover:bg-navy hover:text-white transition-all duration-200 rounded-xl font-semibold py-5"
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Item-wise Pricing ─────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-background to-accent/10">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <div
            ref={(el) => addRevealRef(el)}
            className="reveal text-center mb-12"
          >
            <Badge className="mb-4 bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium">
              Per Item Rates
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              Item-wise Pricing
            </h2>
            <p className="text-muted-foreground text-lg">
              Transparent, per-item rates — always ₹10 cheaper than the
              competition.
            </p>
          </div>

          <div
            ref={(el) => addRevealRef(el)}
            className="reveal bg-card rounded-2xl border border-border shadow-card overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="bg-navy hover:bg-navy">
                  <TableHead className="text-white font-semibold text-base py-4 pl-6">
                    Item
                  </TableHead>
                  <TableHead className="text-white font-semibold text-base py-4 pr-6 text-right">
                    Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemPrices.map((row, i) => (
                  <TableRow
                    key={row.item}
                    className={`price-row transition-colors hover:bg-accent/50 ${i % 2 === 0 ? "" : "bg-background/60"}`}
                  >
                    <TableCell className="py-4 pl-6 font-medium text-foreground">
                      {row.item}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right font-bold text-emerald-dark text-lg">
                      {row.price}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* ─── Booking Form ─────────────────────────────────────── */}
      <section id="booking" className="py-24 bg-background">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div
            ref={(el) => addRevealRef(el)}
            className="reveal text-center mb-16"
          >
            <Badge className="mb-4 bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium">
              Ready to Start?
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              Book Your Pickup
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Fill in the form and we'll confirm your pickup within minutes.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div
              ref={(el) => addRevealRef(el)}
              className="reveal lg:col-span-2"
            >
              <form
                onSubmit={handleBookingSubmit}
                className="bg-card rounded-2xl border border-border shadow-card p-8 space-y-5"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="booking-name"
                      className="text-sm font-semibold text-navy"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="booking-name"
                      data-ocid="booking.input"
                      type="text"
                      placeholder="Your full name"
                      value={bookingName}
                      onChange={(e) => setBookingName(e.target.value)}
                      required
                      className="rounded-xl border-border focus-visible:ring-emerald"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="booking-phone"
                      className="text-sm font-semibold text-navy"
                    >
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="booking-phone"
                      data-ocid="booking.phone_input"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      required
                      className="rounded-xl border-border focus-visible:ring-emerald"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="booking-address"
                    className="text-sm font-semibold text-navy"
                  >
                    Pickup Address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="booking-address"
                    data-ocid="booking.address_textarea"
                    placeholder="Your full address for pickup"
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    required
                    rows={3}
                    className="rounded-xl border-border focus-visible:ring-emerald resize-none"
                  />
                  <button
                    type="button"
                    data-ocid="booking.map_marker"
                    onClick={() => setMapPickerOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-dark hover:text-emerald transition-colors py-1 px-2 rounded-lg hover:bg-emerald/10"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Or pick on map
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="booking-date"
                      className="text-sm font-semibold text-navy"
                    >
                      Pickup Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="booking-date"
                      data-ocid="booking.pickup_date_input"
                      type="date"
                      min={today}
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      className="rounded-xl border-border focus-visible:ring-emerald"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="booking-clothes"
                      className="text-sm font-semibold text-navy"
                    >
                      Number of Clothes <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="booking-clothes"
                      data-ocid="booking.clothes_input"
                      type="number"
                      placeholder="e.g. 10"
                      min={1}
                      value={bookingClothes}
                      onChange={(e) => setBookingClothes(e.target.value)}
                      required
                      className="rounded-xl border-border focus-visible:ring-emerald"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-navy">
                    Service Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={bookingService}
                    onValueChange={setBookingService}
                    required
                  >
                    <SelectTrigger
                      data-ocid="booking.service_select"
                      className="rounded-xl border-border focus:ring-emerald"
                    >
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(serviceLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {submitError && (
                  <div
                    data-ocid="booking.error_state"
                    className="flex flex-col gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{submitError}</span>
                    </div>
                    {submitError.includes("Something went wrong") && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bf5b] text-white font-semibold px-3 py-2 rounded-lg text-xs transition-colors w-fit"
                      >
                        <SiWhatsapp className="w-3.5 h-3.5" />
                        Book via WhatsApp instead
                      </a>
                    )}
                  </div>
                )}

                <Button
                  data-ocid="booking.submit_button"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-navy hover:bg-navy-light text-white font-semibold py-6 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 hover:shadow-navy-glow disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Confirming Booking...
                    </>
                  ) : (
                    <>
                      <ClipboardList className="mr-2 h-4 w-4" />
                      Confirm Booking
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div
              ref={(el) => addRevealRef(el)}
              className="reveal lg:col-span-1"
              style={{ transitionDelay: "0.15s" }}
            >
              <div className="bg-navy rounded-2xl p-6 sticky top-24 text-white">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <ClipboardList className="w-4 h-4 text-emerald" />
                  </div>
                  <h3 className="font-display font-bold text-lg">
                    Order Summary
                  </h3>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: "Service",
                      value: bookingService
                        ? serviceLabels[bookingService]
                        : "—",
                      icon: Shirt,
                    },
                    {
                      label: "Pickup Date",
                      value: bookingDate
                        ? new Date(bookingDate).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—",
                      icon: CalendarDays,
                    },
                    {
                      label: "No. of Clothes",
                      value: bookingClothes ? `${bookingClothes} items` : "—",
                      icon: Package,
                    },
                    {
                      label: "Delivery",
                      value: "Free doorstep",
                      icon: Truck,
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-3.5 h-3.5 text-emerald" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">
                          {item.label}
                        </div>
                        <div className="text-sm font-medium text-white mt-0.5">
                          {item.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-5 border-t border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                    Free pickup & delivery included
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-xs mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
                    Booking confirmation in minutes
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-white/10">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bf5b] text-white font-semibold text-sm transition-colors"
                  >
                    <SiWhatsapp className="w-4 h-4" />
                    Book via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Customer Reviews ─────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-b from-background to-accent/10">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div
            ref={(el) => addRevealRef(el)}
            className="reveal text-center mb-16"
          >
            <Badge className="mb-4 bg-accent text-accent-foreground border-0 px-4 py-1.5 text-sm font-medium">
              Customer Love
            </Badge>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-navy mb-4">
              What Our Customers Say
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Thousands of happy customers trust FreshFold with their laundry.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                ref={(el) => addRevealRef(el)}
                className="reveal card-hover bg-card rounded-2xl p-6 border border-border shadow-card flex flex-col"
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {["s1", "s2", "s3", "s4", "s5"].map((k) => (
                    <Star
                      key={k}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <p className="text-foreground text-sm leading-relaxed flex-1 mb-5">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-emerald-dark">
                      {t.initials}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-navy">
                      {t.name}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5" />
                      {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="bg-navy text-white py-16">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-2xl">
                  Fresh<span className="text-emerald">Fold</span>
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5 max-w-xs">
                Cleanliness, delivered. Professional laundry services right at
                your doorstep in Guwahati.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-9 h-9 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/40 flex items-center justify-center transition-colors"
                >
                  <SiWhatsapp className="w-4 h-4 text-[#25D366]" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white/40 mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(link.id)}
                      className="text-white/70 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-bold text-sm uppercase tracking-wider text-white/40 mb-4">
                Contact
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald flex-shrink-0 mt-0.5" />
                  <span className="text-white/70 text-sm">
                    Guwahati, Assam, India
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald flex-shrink-0" />
                  <a
                    href="tel:+919613206589"
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    +91 9XXXX XXXXX
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-[#25D366] flex-shrink-0" />
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    WhatsApp Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} FreshFold. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                Terms & Conditions
              </button>
              <button
                type="button"
                className="text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                Privacy Policy
              </button>
            </div>
            <p className="text-white/30 text-xs">
              Built with ❤️ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white/60 transition-colors underline underline-offset-2"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* ─── Sticky WhatsApp Button ────────────────────────────── */}
      <a
        data-ocid="whatsapp.button"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="whatsapp-btn fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform duration-200"
      >
        <SiWhatsapp className="w-7 h-7" />
      </a>

      {/* ─── Map Picker Dialog ────────────────────────────────── */}
      <MapPickerDialog
        open={mapPickerOpen}
        onOpenChange={setMapPickerOpen}
        onConfirm={(address) => setBookingAddress(address)}
      />

      {/* ─── Booking Confirmation Dialog ──────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          data-ocid="booking.confirm_dialog"
          className="sm:max-w-md rounded-2xl"
        >
          <DialogHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-9 h-9 text-emerald" />
            </div>
            <DialogTitle className="font-display text-2xl font-bold text-navy">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-2">
              Your laundry pickup has been scheduled.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-accent/30 rounded-xl px-5 py-4 my-4 text-center">
            <div className="text-sm text-muted-foreground mb-1">Booking ID</div>
            <div className="font-display text-2xl font-bold text-navy">
              #{bookingId !== null ? bookingId.toString() : "—"}
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            We'll contact you shortly to confirm the pickup details.
          </p>

          <DialogFooter className="flex flex-col gap-3 mt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bf5b] text-white font-semibold text-sm transition-colors"
            >
              <SiWhatsapp className="w-4 h-4" />
              WhatsApp Us
            </a>
            <Button
              data-ocid="booking.dialog_close_button"
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="w-full rounded-xl border-border text-navy font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "@/i18n/client";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import {
  ArrowRight,
  Sparkles,
  Smartphone,
  BarChart3,
  ShieldCheck,
  Zap,
  PlayCircle,
  Users,
  Building2,
  ChevronDown,
  TrendingUp,
  Clock,
  QrCode,
  Globe2,
  HandCoins,
  Wand2,
  Gauge,
  MousePointerClick,
  CheckCircle2,
  Receipt,
  HeartHandshake,
  Shield,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const FloatingNav = () => {
  const t = useTranslations("landing");
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 animate-fade-in-down">
      <nav className="mx-auto max-w-6xl bg-white/10 backdrop-blur-lg border border-white/15 rounded-full px-6 py-3 shadow-xl flex items-center justify-between text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">T</div>
          <span className="font-heading font-bold text-xl tracking-tight">Tipsio</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="#value" className="hover:text-sky-200 transition-colors">{t("navNew.value")}</Link>
          <Link href="#product" className="hover:text-sky-200 transition-colors">{t("navNew.product")}</Link>
          <Link href="#features" className="hover:text-sky-200 transition-colors">{t("navNew.features")}</Link>
          <Link href="#faq" className="hover:text-sky-200 transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link href="/venue/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex rounded-full text-white hover:text-white hover:bg-white/10">{t("navNew.login")}</Button>
          </Link>
          <Link href="/venue/register">
            <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-100">{t("navNew.start")}</Button>
          </Link>
        </div>
      </nav>
    </header>
  );
};


const HeroSection = () => {
  const t = useTranslations("landing");
  return (
    <section className="relative min-h-screen pt-28 pb-16 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="absolute inset-x-0 -top-20 mx-auto w-[620px] h-[620px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-purple-500/25 blur-2xl" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),transparent_45%)]" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          <div className="text-left space-y-6">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ duration: 0.4 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sky-100 text-sm font-medium">
              <Sparkles size={16} />
              <span>{t("betaBadge")}</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.1 }} className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.05]">
              {t("heroNew.headline")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-purple-400">{t("heroNew.highlight")}</span>
            </motion.h1>
            <motion.p variants={fadeInUp} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.15 }} className="text-lg text-slate-200/90 leading-relaxed max-w-xl">
              {t("heroNew.subheadline")}
            </motion.p>
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.2 }} className="flex flex-col sm:flex-row gap-4">
              <Link href="/venue/register">
                <Button className="h-14 px-8 rounded-full text-base bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/20">
                  {t("heroNew.cta")} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" className="h-14 px-8 rounded-full text-base border-white/20 bg-white/5 hover:bg-white/10 text-white">
                <PlayCircle className="mr-2 w-5 h-5" /> {t("heroNew.watchDemo")}
              </Button>
            </motion.div>
            <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.3 }} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-200/80">
              {[t("heroNew.trust1"), t("heroNew.trust2"), t("heroNew.trust3")].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  {item}
                </div>
              ))}
            </motion.div>
          </div>
          <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ duration: 0.5, delay: 0.2 }} className="relative lg:ml-6">
            <div className="relative rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/10 border border-white/10 shadow-xl p-4 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-300" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] text-white/70 bg-white/10 rounded-full px-3 py-1">app.tipsio.io/dashboard</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{t("dashboard.today")}</h3>
                    <p className="text-xs text-white/60">{t("dashboard.date")}</p>
                  </div>
                  <div className="flex gap-1">
                    <div className="px-2 py-1 bg-white/10 rounded text-[11px] text-white/80 border border-white/10">{t("dashboard.week")}</div>
                    <div className="px-2 py-1 bg-gradient-to-r from-sky-500 to-blue-500 rounded text-[11px] text-white shadow-lg shadow-sky-500/30">{t("dashboard.month")}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl p-3 border border-white/10 bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-200 flex items-center justify-center mb-2"><TrendingUp className="w-4 h-4" /></div>
                    <div className="text-xl font-bold text-white">₽ 24,500</div>
                    <div className="text-xs text-white/60">{t("dashboard.tipsToday")}</div>
                  </div>
                  <div className="rounded-xl p-3 border border-white/10 bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-100 flex items-center justify-center mb-2"><Users className="w-4 h-4" /></div>
                    <div className="text-xl font-bold text-white">47</div>
                    <div className="text-xs text-white/60">{t("dashboard.transactions")}</div>
                  </div>
                  <div className="rounded-xl p-3 border border-white/10 bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-100 flex items-center justify-center mb-2"><Clock className="w-4 h-4" /></div>
                    <div className="text-xl font-bold text-white">₽ 521</div>
                    <div className="text-xs text-white/60">{t("dashboard.avgTip")}</div>
                  </div>
                  <div className="rounded-xl p-3 border border-white/10 bg-white/5">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-100 flex items-center justify-center mb-2"><QrCode className="w-4 h-4" /></div>
                    <div className="text-xl font-bold text-white">8</div>
                    <div className="text-xs text-white/60">{t("dashboard.activeQr")}</div>
                  </div>
                </div>
                <div className="rounded-xl p-3 border border-white/10 bg-gradient-to-b from-white/5 to-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{t("dashboard.dynamics")}</span>
                    <span className="text-xs text-emerald-300 font-medium">+23%</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-16">
                    {[35, 55, 40, 70, 45, 85, 60, 90, 75, 95, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-sky-400 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-6 top-16 z-10 hidden sm:block animate-float">
              <div className="bg-white/15 backdrop-blur-lg p-3 rounded-xl shadow-xl border border-white/20 flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-100 flex items-center justify-center"><Zap size={16} /></div>
                <div>
                  <div className="text-[10px] text-white/70">{t("dashboard.newTip")}</div>
                  <div className="text-sm font-bold text-white">+ ₽ 500</div>
                </div>
              </div>
            </div>
            <div className="absolute -left-6 bottom-16 z-10 hidden sm:block animate-float-delayed">
              <div className="bg-white/15 backdrop-blur-lg p-3 rounded-xl shadow-xl border border-white/20 flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold">M</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold">A</div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-bold">K</div>
                </div>
                <div className="text-xs font-medium text-white">{t("dashboard.teamGrowing")}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};


const ImpactRibbon = () => {
  const t = useTranslations("landing");
  const cards = [
    { key: "owners", title: t("impact.owners.title"), desc: t("impact.owners.desc"), pill: t("impact.owners.pill"), icon: Building2 },
    { key: "team", title: t("impact.team.title"), desc: t("impact.team.desc"), pill: t("impact.team.pill"), icon: Users },
    { key: "guests", title: t("impact.guests.title"), desc: t("impact.guests.desc"), pill: t("impact.guests.pill"), icon: HeartHandshake },
  ];
  return (
    <section id="value" className="py-14 px-6 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 pointer-events-none" />
      <div className="absolute -left-20 top-10 w-72 h-72 bg-sky-500/15 blur-2xl rounded-full" />
      <div className="absolute -right-12 bottom-0 w-72 h-72 bg-purple-500/15 blur-2xl rounded-full" />
      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">Tipsio 2.0</p>
            <h3 className="text-3xl font-heading font-bold">{t("impact.title")}</h3>
          </div>
          <p className="text-white/70 max-w-2xl text-base md:text-right">{t("impact.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cards.map((card, idx) => (
            <motion.div key={card.key} variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} transition={{ delay: idx * 0.1, duration: 0.4 }} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><card.icon className="w-5 h-5" /></div>
                <span className="text-[11px] uppercase tracking-wide px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70">{card.pill}</span>
              </div>
              <h4 className="text-lg font-semibold mb-2">{card.title}</h4>
              <p className="text-sm text-white/70 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ValueColumns = () => {
  const t = useTranslations("landing");
  const columns = [
    { key: "venues", title: t("valueDeck.venues.title"), points: [t("valueDeck.venues.point1"), t("valueDeck.venues.point2"), t("valueDeck.venues.point3")], icon: ShieldCheck, accent: "from-sky-500/15" },
    { key: "staff", title: t("valueDeck.staff.title"), points: [t("valueDeck.staff.point1"), t("valueDeck.staff.point2"), t("valueDeck.staff.point3")], icon: HandCoins, accent: "from-purple-500/15" },
    { key: "guests", title: t("valueDeck.guests.title"), points: [t("valueDeck.guests.point1"), t("valueDeck.guests.point2"), t("valueDeck.guests.point3")], icon: Globe2, accent: "from-amber-500/15" },
  ];
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-900 text-white border border-slate-900">{t("valueDeck.title")}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">{t("valueDeck.subtitle")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.key} className="rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${col.accent} to-white via-white`} />
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><col.icon className="w-5 h-5" /></div>
                  <h3 className="text-xl font-semibold text-slate-900">{col.title}</h3>
                </div>
                <ul className="space-y-3 text-slate-600">
                  {col.points.map((point) => (
                    <li key={point} className="flex gap-2 items-start">
                      <CheckCircle2 className="w-4 h-4 text-slate-900 mt-1 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ProductShowcase = () => {
  const t = useTranslations("landing");
  return (
    <section id="product" className="py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.06),transparent_30%),radial-gradient(circle_at_80%_50%,rgba(168,85,247,0.06),transparent_32%)]" />
      <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div className="space-y-5">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em] bg-white/10 border border-white/10">Product peek</div>
          <h2 className="text-3xl md:text-4xl font-heading font-bold">{t("productShowcase.title")}</h2>
          <p className="text-lg text-white/80 leading-relaxed">{t("productShowcase.subtitle")}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold">{t("productShowcase.dashboard.title")}</h4>
                <p className="text-sm text-white/70">{t("productShowcase.dashboard.desc")}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <Zap className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold">{t("productShowcase.payouts.title")}</h4>
                <p className="text-sm text-white/70">{t("productShowcase.payouts.desc")}</p>
              </div>
            </div>
          </div>
        </div>
        <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.5 }} className="relative">
          <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-lg p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center"><Smartphone className="w-5 h-5 text-white" /></div>
                <div>
                  <p className="text-xs text-white/60">{t("productShowcase.guest.title")}</p>
                  <p className="font-semibold text-white">QR #23 / table 4</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-100 text-xs">Apple Pay · GPay · QRIS</div>
            </div>
            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
              <p className="text-sm text-white/70">{t("productShowcase.guest.desc")}</p>
              <div className="grid grid-cols-3 gap-2">
                {[20, 50, 100].map((sum) => (
                  <button key={sum} className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 text-sm font-semibold transition-colors">{sum}k IDR</button>
                ))}
                <button className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-white py-3 text-sm font-semibold shadow-lg shadow-sky-500/30">{t("productShowcase.customAmount")}</button>
                <button className="rounded-xl bg-white text-slate-900 py-3 text-sm font-semibold col-span-2">{t("productShowcase.leaveTip")}</button>
              </div>
            </div>
          </div>
          <motion.div variants={fadeInUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.25, duration: 0.5 }} className="absolute -left-6 -bottom-10 w-full max-w-[420px] hidden md:block">
            <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-100 flex items-center justify-center"><BarChart3 className="w-5 h-5" /></div>
                  <div>
                    <p className="text-xs text-white/60">{t("productShowcase.dashboard.title")}</p>
                    <p className="text-lg font-semibold text-white">+18% к чаевым</p>
                  </div>
                </div>
                <div className="text-xs text-emerald-300">Live</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ label: t("productShowcase.stats.today"), value: "2.3m IDR" }, { label: t("productShowcase.stats.shift"), value: "640k IDR" }, { label: t("productShowcase.stats.payouts"), value: "15" }].map((item) => (
                  <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="text-[11px] text-white/60">{item.label}</p>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-5 gap-1 h-12">
                {[35, 55, 40, 70, 90].map((h, i) => (
                  <div key={i} className="bg-gradient-to-t from-purple-500 to-blue-400 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};


const FeatureMosaic = () => {
  const t = useTranslations("landing");
  const features = [
    { icon: QrCode, title: t("featuresNew.items.f1.title"), desc: t("featuresNew.items.f1.desc") },
    { icon: Zap, title: t("featuresNew.items.f2.title"), desc: t("featuresNew.items.f2.desc") },
    { icon: BarChart3, title: t("featuresNew.items.f3.title"), desc: t("featuresNew.items.f3.desc") },
    { icon: Shield, title: t("featuresNew.items.f4.title"), desc: t("featuresNew.items.f4.desc") },
    { icon: Globe2, title: t("featuresNew.items.f5.title"), desc: t("featuresNew.items.f5.desc") },
    { icon: Wand2, title: t("featuresNew.items.f6.title"), desc: t("featuresNew.items.f6.desc") },
  ];
  return (
    <section id="features" className="py-20 px-6 bg-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.06),transparent_35%)]" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12 space-y-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-900 text-white border border-slate-900">{t("featuresNew.title")}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate-900">{t("featuresNew.subtitle")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/60 hover:-translate-y-1 transition-transform duration-200">
              <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-4"><feature.icon className="w-5 h-5" /></div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const JourneySection = () => {
  const t = useTranslations("landing");
  const steps = [
    { title: t("journey.steps.s1.title"), desc: t("journey.steps.s1.desc"), icon: MousePointerClick },
    { title: t("journey.steps.s2.title"), desc: t("journey.steps.s2.desc"), icon: Gauge },
    { title: t("journey.steps.s3.title"), desc: t("journey.steps.s3.desc"), icon: Receipt },
  ];
  return (
    <section className="py-20 px-6 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_30%,rgba(56,189,248,0.06),transparent_35%),radial-gradient(circle_at_90%_70%,rgba(168,85,247,0.06),transparent_30%)]" />
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">{t("journey.title")}</p>
            <h2 className="text-3xl md:text-4xl font-heading font-bold">{t("journey.subtitle")}</h2>
          </div>
          <Link href="/venue/register">
            <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full">{t("heroNew.cta")} <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {steps.map((step, idx) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"><step.icon className="w-5 h-5 text-white" /></div>
                <span className="text-sm text-white/60">0{idx + 1}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations("landing.faq");
  const questions = ["q1", "q2", "q3", "q4", "q5"];
  return (
    <section id="faq" className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-heading font-bold text-slate-900">{t("title")}</h2>
        </div>
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <button onClick={() => setOpenIndex(openIndex === idx ? null : idx)} className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-lg text-slate-900">{t(`${q}.question`)}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${openIndex === idx ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100">{t(`${q}.answer`)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const t = useTranslations("landing");
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <FloatingNav />
      <HeroSection />
      <ImpactRibbon />
      <ProductShowcase />
      <ValueColumns />
      <FeatureMosaic />
      <JourneySection />
      <FaqSection />
      <section className="py-24 px-6 relative overflow-hidden bg-slate-900">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-2xl" />
        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-8">{t("ctaNew.title")}</h2>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">{t("ctaNew.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/venue/register">
              <Button className="h-14 px-8 text-base rounded-full bg-white text-slate-900 hover:bg-slate-100">{t("heroNew.cta")} <ArrowRight className="ml-2" /></Button>
            </Link>
          </div>
        </div>
      </section>
      <footer className="py-12 px-6 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-slate-500">© 2025 Tipsio. All rights reserved.</div>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="#" className="text-slate-500 hover:text-slate-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

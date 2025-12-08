"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { CountingNumber } from "@/components/animate-ui/primitives/texts/counting-number";
import {
  ArrowRight,
  MessageCircle,
  Shield,
  Zap,
  BarChart3,
  QrCode,
  Users,
  Building2,
  Heart,
  ChevronDown,
  Lock,
  Smartphone,
  CreditCard,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

// ============ NAVIGATION ============
const Navigation = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
    <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
      <Link href="/landing-v3" className="text-2xl font-heading font-bold text-gradient">
        Tipsio
      </Link>

      <div className="flex items-center gap-3">
        <a
          href="https://wa.me/message"
          className="hidden sm:flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          <MessageCircle size={18} />
          <span>Поддержка</span>
        </a>
        <LanguageSwitcher />
        <Link href="/venue/login">
          <Button variant="ghost" size="sm" className="text-slate-700">
            Войти
          </Button>
        </Link>
        <Link href="/venue/register">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5">
            Подключить заведение
            <ArrowRight className="ml-1 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </nav>
  </header>
);

// ============ HERO ============
const HeroSection = () => (
  <section className="pt-28 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div>
          {/* Badge */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6"
          >
            <span className="text-lg">🇮🇩</span>
            <span>Работает на Бали · Комиссия 0% (Beta)</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-slate-900 leading-tight mb-6"
          >
            Не теряйте чаевые из-за того,{" "}
            <span className="text-blue-600">что у гостей нет наличных</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-lg text-slate-600 mb-8 leading-relaxed"
          >
            Туристы привыкли платить телефоном. Дайте им возможность оставить чаевые
            через QRIS, GoPay или карту за 7 секунд. Деньги поступают сразу на ваш счёт Midtrans.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <Link href="/venue/register">
              <Button className="h-14 px-8 text-base rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/25">
                Запустить бесплатно за 1 час
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.4, delay: 0.25 }}
            className="flex flex-wrap gap-6 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-green-600" />
              <span>Прямые выплаты (без посредников)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>Гостям не нужно приложение</span>
            </div>
          </motion.div>
        </div>

        {/* Right: Dashboard mockup */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="relative rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-4">
            {/* Browser chrome */}
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="text-[11px] text-slate-500 bg-slate-800 rounded-full px-3 py-1">
                app.tipsio.io/dashboard
              </div>
            </div>

            {/* Dashboard content */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-400">Сегодня</h3>
                  <p className="text-xs text-slate-500">Пятница, 6 декабря</p>
                </div>
                <div className="flex gap-1">
                  <div className="px-2 py-1 bg-slate-700 rounded text-[10px] text-slate-400">Неделя</div>
                  <div className="px-2 py-1 bg-blue-600 rounded text-[10px] text-white">Месяц</div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl p-3 bg-slate-700/50 border border-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center mb-2">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-white flex items-center">
                    IDR{" "}
                    <CountingNumber
                      number={2450}
                      fromNumber={0}
                      transition={{ stiffness: 60, damping: 30 }}
                      inView
                      inViewOnce
                    />
                    k
                  </div>
                  <div className="text-[11px] text-slate-400">Чаевые сегодня</div>
                </div>
                <div className="rounded-xl p-3 bg-slate-700/50 border border-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-white">47</div>
                  <div className="text-[11px] text-slate-400">Транзакций</div>
                </div>
                <div className="rounded-xl p-3 bg-slate-700/50 border border-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-white">52k</div>
                  <div className="text-[11px] text-slate-400">Средний чек</div>
                </div>
                <div className="rounded-xl p-3 bg-slate-700/50 border border-slate-600">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div className="text-lg font-bold text-white">12</div>
                  <div className="text-[11px] text-slate-400">Активных QR</div>
                </div>
              </div>

              {/* Chart */}
              <div className="rounded-xl p-3 bg-slate-700/50 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-300">Динамика</span>
                  <span className="text-xs text-green-400 font-medium">+18%</span>
                </div>
                <div className="flex items-end gap-1.5 h-14">
                  {[35, 55, 40, 70, 45, 85, 60, 90, 75, 95, 80, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification */}
          <div className="absolute -right-4 top-12 bg-white rounded-xl shadow-lg p-3 border border-slate-200 animate-float hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Zap size={14} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500">Новые чаевые</p>
                <p className="text-sm font-bold text-slate-900">+ IDR 50k</p>
              </div>
            </div>
          </div>

          {/* Floating team badge */}
          <div className="absolute -left-4 bottom-12 bg-white rounded-xl shadow-lg p-3 border border-slate-200 animate-float-delayed hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">М</div>
                <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">А</div>
                <div className="w-6 h-6 rounded-full bg-pink-500 border-2 border-white flex items-center justify-center text-white text-[9px] font-bold">К</div>
              </div>
              <span className="text-xs font-medium text-slate-700">8 сотрудников</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);


// ============ LOGO BAR ============
const LogoBar = () => (
  <section className="py-8 px-6 bg-slate-50 border-y border-slate-100">
    <div className="max-w-4xl mx-auto">
      <p className="text-center text-sm text-slate-500 mb-6">
        Гости платят привычным способом
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <CreditCard size={24} />
          <span>Visa</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <CreditCard size={24} />
          <span>Mastercard</span>
        </div>
        <div className="px-3 py-1 bg-slate-200 rounded text-slate-700 font-bold text-sm">
          QRIS
        </div>
        <div className="text-slate-700 font-semibold">GoPay</div>
        <div className="text-slate-700 font-semibold">OVO</div>
        <div className="text-slate-700 font-semibold">Google Pay</div>
      </div>
    </div>
  </section>
);

// ============ PROBLEM / SOLUTION ============
const ProblemSection = () => (
  <section className="py-20 px-6 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 mb-6">
            С каждым годом наличных всё меньше
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-6">
            Ваши гости хотят отблагодарить сервис, но чувствуют неловкость, когда в кошельке пусто.
            Без удобного способа оставить чаевые вы теряете значительную часть дохода персонала.
          </p>
          <p className="text-lg text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-900">Tipsio</span> превращает
            «Спасибо, но у меня только карта» в реальные деньги для вашей команды.
            Без покупки терминалов.
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          {/* Phone mockup */}
          <div className="relative mx-auto w-64 h-[500px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-6 bg-slate-900 rounded-full z-10" />
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col">
              {/* Screen content - centered vertically */}
              <div className="flex-1 p-6 flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl">
                    👋
                  </div>
                  <p className="text-sm text-slate-500">Cafe Organic</p>
                  <p className="font-semibold text-slate-900">Скажите спасибо!</p>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 w-full">
                  {["20k", "50k", "100k"].map((amount) => (
                    <button
                      key={amount}
                      className="py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {amount}
                    </button>
                  ))}
                </div>

                <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-semibold text-sm">
                  Оплатить с Google Pay
                </button>

                <p className="text-xs text-slate-400 text-center mt-4">
                  Безопасная оплата через Midtrans
                </p>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          {/* Top right - Speed */}
          <div className="absolute -right-4 top-16 bg-white rounded-xl shadow-lg p-3 border border-slate-100 hidden sm:block animate-float">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Zap size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Оплата за</p>
                <p className="font-bold text-slate-900">7 секунд</p>
              </div>
            </div>
          </div>

          {/* Middle right - No app */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-3 border border-slate-100 hidden sm:block animate-float-delayed">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Гостю</p>
                <p className="font-bold text-slate-900">Без приложения</p>
              </div>
            </div>
          </div>

          {/* Bottom right - Security */}
          <div className="absolute -right-4 bottom-24 bg-white rounded-xl shadow-lg p-3 border border-slate-100 hidden sm:block animate-float">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield size={16} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Платежи</p>
                <p className="font-bold text-slate-900">Через Midtrans</p>
              </div>
            </div>
          </div>

          {/* Left side - Direct payout */}
          <div className="absolute -left-4 top-1/3 bg-white rounded-xl shadow-lg p-3 border border-slate-100 hidden lg:block animate-float-delayed">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Деньги</p>
                <p className="font-bold text-slate-900">Напрямую вам</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);


// ============ HOW IT WORKS ============
const HowItWorksSection = () => {
  const steps = [
    {
      icon: Shield,
      label: "Safe",
      title: "Ваш Midtrans — Ваши правила",
      desc: "Вы подключаете свой существующий аккаунт Midtrans. Мы не касаемся денег — транзакции идут напрямую от гостя к вам.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: QrCode,
      label: "Fast",
      title: "QR-коды везде",
      desc: "Разместите QR на столах, в папках для счёта или на бейджах. Гость сканирует камерой → выбирает сумму → оплачивает в 2 касания.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: BarChart3,
      label: "Fair",
      title: "Умный баланс",
      desc: "Система сама считает, сколько заработал каждый сотрудник (или общая «банка»). В конце смены вы видите точные суммы для выплаты.",
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 mb-4">
            Полный контроль и прозрачность
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Три шага к безопасным цифровым чаевым
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                  <step.icon size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {step.label}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ PRODUCT DEMO ============
const ProductDemoSection = () => (
  <section className="py-20 px-6 bg-white">
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 mb-6">
            Создано для туристов и экспатов
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <span className="text-slate-600">Интерфейс на английском языке</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <span className="text-slate-600">Никаких регистраций для гостя</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-600 text-sm">✓</span>
              </div>
              <span className="text-slate-600">Предустановленные суммы повышают средний чек чаевых</span>
            </li>
          </ul>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 rounded-2xl p-6 shadow-xl"
        >
          {/* Dashboard mockup */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-2 text-xs text-slate-500">dashboard.tipsio.io</span>
          </div>

          <div className="bg-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-slate-400 text-sm">Сегодня</p>
                <p className="text-white text-2xl font-bold flex items-center gap-1">
                  IDR{" "}
                  <CountingNumber
                    number={2450000}
                    fromNumber={0}
                    transition={{ stiffness: 50, damping: 30 }}
                    inView
                    inViewOnce
                  />
                </p>
              </div>
              <div className="text-green-400 text-sm font-medium">+18%</div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Транзакций", value: "47" },
                { label: "Средний чек", value: "52k" },
                { label: "Активных QR", value: "12" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-700/50 rounded-lg p-3">
                  <p className="text-slate-400 text-xs">{stat.label}</p>
                  <p className="text-white font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);


// ============ BENEFITS ============
const BenefitsSection = () => {
  const benefits = [
    {
      icon: Building2,
      title: "Бизнесу: Удержание команды",
      desc: "Хорошие чаевые — лучшая мотивация. Снизьте текучку кадров, дав персоналу легальный способ зарабатывать больше с безналичных гостей.",
      color: "bg-blue-600",
    },
    {
      icon: Users,
      title: "Команде: Честность",
      desc: "Официанты видят свои накопления в реальном времени. Никаких споров о том, кто и сколько заработал за смену.",
      color: "bg-purple-600",
    },
    {
      icon: Heart,
      title: "Гостям: Комфорт",
      desc: "Никакого чувства вины из-за отсутствия кэша. Оплата в 2 клика, комиссию можно настроить так, чтобы её оплачивал гость.",
      color: "bg-pink-600",
    },
  ];

  return (
    <section className="py-20 px-6 bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Выигрывают все
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={benefit.title}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4`}>
                <benefit.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-slate-300 leading-relaxed">{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============ FAQ ============
const FAQSection = () => {
  const faqs = [
    {
      q: "Нужно ли мне открывать новый счёт?",
      a: "Нет, если у вас уже есть Midtrans, мы интегрируемся с ним. Если нет — поможем подключить.",
    },
    {
      q: "Деньги проходят через счета Tipsio?",
      a: "Никогда. Технически деньги идут: Карта гостя → Ваш Midtrans → Ваш банковский счёт. Мы предоставляем только IT-инфраструктуру.",
    },
    {
      q: "Сколько это стоит для заведения?",
      a: "Сейчас сервис полностью бесплатен (Beta). В будущем комиссия составит 5%, но вы сможете настроить её оплату за счёт гостя (сверх суммы чаевых).",
    },
    {
      q: "Как платить налоги?",
      a: "Чаевые (Service Charge / Gratuity) имеют свои особенности в Индонезии. Tipsio предоставляет детальные отчёты для вашей бухгалтерии, чтобы всё было «белым».",
    },
    {
      q: "Нужен ли интернет персоналу?",
      a: "Только чтобы проверить баланс. Для приёма чаевых нужен только напечатанный QR-код.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 mb-4">
            Вопросы владельцев
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="border border-slate-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-semibold text-slate-900">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    openIndex === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                  {faq.a}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};


// ============ FINAL CTA ============
const FinalCTASection = () => (
  <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
    <div className="max-w-4xl mx-auto text-center">
      <motion.h2
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold mb-6"
      >
        Верните чаевые в заведение уже сегодня
      </motion.h2>

      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto"
      >
        Настройка занимает меньше часа. Поможем на каждом этапе в WhatsApp.
      </motion.p>

      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        <Link href="/venue/register">
          <Button className="h-14 px-10 text-lg rounded-full bg-white text-blue-600 hover:bg-blue-50 shadow-xl shadow-blue-900/30">
            Подключить заведение бесплатно
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </motion.div>
    </div>
  </section>
);

// ============ FOOTER ============
const Footer = () => (
  <footer className="py-10 px-6 bg-slate-900 text-slate-400">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <Link href="/landing-v3" className="text-xl font-heading font-bold text-gradient">
        Tipsio
      </Link>

      <div className="flex gap-6 text-sm">
        <a
          href="https://wa.me/message"
          className="hover:text-white transition-colors flex items-center gap-2"
        >
          <MessageCircle size={16} />
          WhatsApp Support
        </a>
        <Link href="#" className="hover:text-white transition-colors">
          Terms of Service
        </Link>
        <Link href="#" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
      </div>

      <p className="text-sm">
        © 2025 Tipsio Bali. Made with ❤️ in Canggu
      </p>
    </div>
  </footer>
);

// ============ MAIN PAGE ============
export default function LandingV3() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navigation />
      <HeroSection />
      <LogoBar />
      <ProblemSection />
      <HowItWorksSection />
      <ProductDemoSection />
      <BenefitsSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}

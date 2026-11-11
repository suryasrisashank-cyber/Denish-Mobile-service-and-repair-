"use client";

import React, { useState } from 'react';
import { ThemeProvider } from '@/context/ThemeContext';
import { BackgroundVideo } from '@/components/BackgroundVideo';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ServicesSection } from '@/components/ServicesSection';
import { CostEstimator } from '@/components/CostEstimator';
import { HowItWorks } from '@/components/HowItWorks';
import { LabShowcase } from '@/components/LabShowcase';
import { BookingForm } from '@/components/BookingForm';
import { OrderTracker } from '@/components/OrderTracker';
import { ContactSection } from '@/components/ContactSection';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Footer } from '@/components/Footer';
import WhyChooseUs from '@/components/WhyChooseUs';
import ServicesExplained from '@/components/ServicesExplained';
import CustomerReviews from '@/components/CustomerReviews';
import { ServiceCategory, RepairOrder } from '@/types';

export default function DenishApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [prefilledBooking, setPrefilledBooking] = useState<{
    brand?: string;
    model?: string;
    serviceType?: string;
    estimatedPrice?: string;
  }>({});
  const [trackerPhone, setTrackerPhone] = useState('');

  const handleSelectService = (service: ServiceCategory) => {
    setPrefilledBooking({
      serviceType: service.name,
      estimatedPrice: undefined
    });
    setActiveTab('book');
    if (typeof window !== 'undefined') {
      const el = document.getElementById('book');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleProceedToBooking = (details: {
    brand: string;
    model: string;
    serviceType: string;
    estimatedPrice?: string;
  }) => {
    setPrefilledBooking(details);
    setActiveTab('book');
    if (typeof window !== 'undefined') {
      const el = document.getElementById('book');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleOrderCreated = (order: RepairOrder) => {
    setTrackerPhone(order.serviceId);
  };

  const handleTrackOrderClick = (phone: string) => {
    setTrackerPhone(phone);
    setActiveTab('track');
    if (typeof window !== 'undefined') {
      const el = document.getElementById('track');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-[#101820]/90 transition-colors relative selection:bg-amber-500/20 selection:text-amber-700 pb-24 sm:pb-0">
        {/* Ambient Video & Scrim Background */}
        <BackgroundVideo />

        {/* Global Navigation from GitHub UI */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Flow */}
        <main className="relative z-10">
          <div id="home">
            <HeroSection
              onBookClick={() => {
                setActiveTab('book');
                if (typeof window !== 'undefined') {
                  document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              onEstimatorClick={() => {
                setActiveTab('estimator');
                if (typeof window !== 'undefined') {
                  document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
          </div>

          {/* Core 8 Services Grid from GitHub UI */}
          <ServicesSection onSelectService={handleSelectService} />

          {/* Interactive Cost Estimator from GitHub UI */}
          <CostEstimator onProceedToBooking={handleProceedToBooking} />

          {/* 3-Step Process from GitHub UI */}
          <HowItWorks
            onBookClick={() => {
              setActiveTab('book');
              if (typeof window !== 'undefined') {
                document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {/* Certified Lab Workbench Showcase from GitHub UI */}
          <LabShowcase />

          {/* Comprehensive Device Brands & Technical Details */}
          <WhyChooseUs />
          <ServicesExplained />
          <CustomerReviews />

          {/* Genuine Repair Booking Form from GitHub UI */}
          <BookingForm
            initialValues={prefilledBooking}
            onOrderCreated={handleOrderCreated}
            onTrackOrderClick={handleTrackOrderClick}
          />

          {/* Real-time Order Tracker from GitHub UI */}
          <OrderTracker
            initialPhone={trackerPhone}
            onBookNewClick={() => {
              setActiveTab('book');
              if (typeof window !== 'undefined') {
                document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          />

          {/* Workshop Contact, Address & Location from GitHub UI */}
          <ContactSection />
        </main>

        {/* Global Footer from GitHub UI */}
        <Footer
          onNavClick={(tab) => {
            setActiveTab(tab);
            if (typeof window !== 'undefined') {
              document.getElementById(tab)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* Mobile Bottom Thumb Navigation from GitHub UI */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (typeof window !== 'undefined') {
              document.getElementById(tab)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      </div>
    </ThemeProvider>
  );
}

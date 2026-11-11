import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BackgroundVideo } from './components/BackgroundVideo';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { CostEstimator } from './components/CostEstimator';
import { HowItWorks } from './components/HowItWorks';
import { LabShowcase } from './components/LabShowcase';
import { BookingForm } from './components/BookingForm';
import { OrderTracker } from './components/OrderTracker';
import { ContactSection } from './components/ContactSection';
import { AdminPortal } from './components/AdminPortal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ServiceCategory, RepairOrder } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
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
      estimatedPrice: service.estimatedPriceRange
    });
    setActiveTab('book');
    const el = document.getElementById('book');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleProceedToBooking = (details: {
    brand: string;
    model: string;
    serviceType: string;
    estimatedPrice: string;
  }) => {
    setPrefilledBooking(details);
    setActiveTab('book');
    const el = document.getElementById('book');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderCreated = (order: RepairOrder) => {
    setTrackerPhone(order.serviceId);
  };

  const handleTrackOrderClick = (phone: string) => {
    setTrackerPhone(phone);
    setActiveTab('track');
    const el = document.getElementById('track');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-[#101820]/90 transition-colors relative selection:bg-amber-500/20 selection:text-amber-700">
        {/* Ambient Video & Scrim Background */}
        <BackgroundVideo />

        {/* Global Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Main Content Flow */}
        <main className="relative z-10">
          <div id="home">
            <HeroSection
              onBookClick={() => {
                setActiveTab('book');
                document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onEstimatorClick={() => {
                setActiveTab('estimator');
                document.getElementById('estimator')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </div>

          <ServicesSection onSelectService={handleSelectService} />

          <CostEstimator onProceedToBooking={handleProceedToBooking} />

          <HowItWorks
            onBookClick={() => {
              setActiveTab('book');
              document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <LabShowcase />

          <BookingForm
            initialValues={prefilledBooking}
            onOrderCreated={handleOrderCreated}
            onTrackOrderClick={handleTrackOrderClick}
          />

          <OrderTracker
            initialPhone={trackerPhone}
            onBookNewClick={() => {
              setActiveTab('book');
              document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          <ContactSection />
        </main>

        {/* Footer */}
        <Footer
          onNavClick={(tab) => {
            setActiveTab(tab);
            document.getElementById(tab)?.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* Mobile Bottom Thumb Navigation */}
        <MobileBottomNav
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            document.getElementById(tab)?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* Admin Dashboard Modal */}
        <AdminPortal
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
        />
      </div>
    </ThemeProvider>
  );
}

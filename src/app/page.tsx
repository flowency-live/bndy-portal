'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from 'bndy-ui/auth';
import { BndyLogo } from 'bndy-ui';
import { FaMusic, FaCalendar, FaUsers, FaMapMarkerAlt, FaStar, FaBuilding } from 'react-icons/fa';

type PersonaType = 'artist' | 'venue' | 'agent';

interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Persona {
  id: PersonaType;
  title: string;
  tagline: string;
  color: string;
  bgColor: string;
  currentFeatures: Feature[];
  comingSoonFeatures: Feature[];
}

const personas: Record<PersonaType, Persona> = {
  artist: {
    id: 'artist',
    title: 'Artist',
    tagline: 'Showcase your talent and connect with venues that need your sound',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    currentFeatures: [
      { title: 'Profile Creation', description: 'Build your artist profile with photos, music, and bio', icon: FaUsers },
      { title: 'Music Management', description: 'Upload and organize your tracks, setlists, and repertoire', icon: FaMusic },
      { title: 'Venue Discovery', description: 'Find venues that match your style and requirements', icon: FaMapMarkerAlt },
      { title: 'Booking Tools', description: 'Manage gig requests and communication with venues', icon: FaCalendar }
    ],
    comingSoonFeatures: [
      { title: 'Smart Matching', description: 'AI-powered venue recommendations based on your style', icon: FaStar },
      { title: 'Performance Analytics', description: 'Track your gig success and audience growth', icon: FaBuilding },
      { title: 'Collaboration Hub', description: 'Connect with other musicians for collaborations', icon: FaUsers }
    ]
  },
  venue: {
    id: 'venue',
    title: 'Venue',
    tagline: 'Book the perfect acts for your space and grow your live music community',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    currentFeatures: [
      { title: 'Event Management', description: 'Create and manage your live music events', icon: FaCalendar },
      { title: 'Venue Promotion', description: 'Showcase your space with photos and details', icon: FaBuilding },
      { title: 'Artist Discovery', description: 'Browse and discover artists that fit your vibe', icon: FaUsers },
      { title: 'Booking System', description: 'Streamlined booking and communication tools', icon: FaMusic }
    ],
    comingSoonFeatures: [
      { title: 'Audience Insights', description: 'Understand your audience preferences and demographics', icon: FaStar },
      { title: 'Revenue Tracking', description: 'Monitor your events performance and profitability', icon: FaMapMarkerAlt },
      { title: 'Community Building', description: 'Build a loyal following for your venue', icon: FaUsers }
    ]
  },
  agent: {
    id: 'agent',
    title: 'Agent',
    tagline: 'Represent artists and manage bookings with professional tools',
    color: 'text-green-500',
    bgColor: 'bg-green-500',
    currentFeatures: [
      { title: 'Artist Management', description: 'Manage multiple artists from one dashboard', icon: FaUsers },
      { title: 'Booking Pipeline', description: 'Track opportunities and manage negotiations', icon: FaCalendar },
      { title: 'Contract Tools', description: 'Generate and manage performance contracts', icon: FaBuilding },
      { title: 'Revenue Tracking', description: 'Monitor commissions and artist earnings', icon: FaMapMarkerAlt }
    ],
    comingSoonFeatures: [
      { title: 'Tour Planning', description: 'Plan and coordinate multi-venue tours', icon: FaStar },
      { title: 'Market Analytics', description: 'Industry insights and booking trends', icon: FaMusic },
      { title: 'Network Building', description: 'Connect with venues and other industry professionals', icon: FaUsers }
    ]
  }
};

export default function Home() {
  const { currentUser } = useAuth();
  const [activePersona, setActivePersona] = useState<PersonaType>('artist');

  const currentPersona = personas[activePersona];

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div data-testid="homepage" className="min-h-screen bg-slate-900 text-white">
      <main role="main">
        {/* Hero Section */}
        <section role="region" aria-label="Hero" className="px-4 sm:px-6 py-8 sm:py-12 md:py-16 text-center bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="max-w-4xl mx-auto">
            {/* Auth Actions - Top Right on Desktop, Top on Mobile */}
            {!currentUser && (
              <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-end mb-6 sm:mb-8">
                <Link
                  href="/auth?mode=signin"
                  data-testid="cta-login"
                  className="min-h-[44px] touch-target px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center"
                  aria-label="Log in to your account"
                >
                  Log In
                </Link>
                <Link
                  href="/auth?mode=signup"
                  data-testid="cta-signup"
                  className="min-h-[44px] touch-target px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center font-medium"
                  aria-label="Sign up for a new account"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {currentUser && (
              <div className="flex justify-center mb-6 sm:mb-8">
                <Link
                  href="/dashboard"
                  data-testid="go-to-dashboard"
                  className="min-h-[44px] touch-target px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center font-medium"
                >
                  Go to Dashboard
                </Link>
              </div>
            )}

            {/* Logo */}
            <div className="mb-6 sm:mb-8">
              <BndyLogo 
                data-testid="bndy-logo"
                className="w-32 sm:w-48 md:w-64 mx-auto" 
                color={activePersona === 'artist' ? '#f97316' : activePersona === 'venue' ? '#3b82f6' : '#22c55e'}
                holeColor="#1e293b"
              />
            </div>

            {/* Main Brand Statement */}
            <h1 
              data-testid="main-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4"
            >
              <span className="text-white">Keeping </span>
              <span className="text-cyan-500">LIVE</span>
              <span className="text-white"> Music </span>
              <span className="text-orange-500">ALIVE</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              A community-driven platform connecting people to grassroots live music events. 
              No ads, no clutter, just the music you love.
            </p>
            
            {/* Persona Toggles */}
            <div 
              data-testid="persona-toggles"
              className="flex flex-wrap justify-center gap-3 mb-6 sm:mb-8"
            >
              {Object.values(personas).map((persona) => (
                <button
                  key={persona.id}
                  data-testid={`persona-${persona.id}`}
                  role="button"
                  aria-label={`Switch to ${persona.title} view`}
                  tabIndex={0}
                  onClick={() => setActivePersona(persona.id)}
                  onKeyDown={(e) => handleKeyDown(e, () => setActivePersona(persona.id))}
                  className={`min-h-[44px] touch-target px-4 py-2 rounded-full transition-all duration-200 font-medium ${
                    activePersona === persona.id 
                      ? `${persona.bgColor} text-white shadow-lg` 
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {persona.title}
                </button>
              ))}
            </div>
            
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto italic">
              {currentPersona.tagline}
            </p>
          </div>
        </section>

        {/* Current Features Section */}
        <section 
          role="region" 
          aria-label="Current Features"
          data-testid="current-features"
          className="py-12 sm:py-16 px-4 sm:px-6 bg-white text-slate-900"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Current <span className={currentPersona.color}>Features</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                Tools we've built to help {currentPersona.title.toLowerCase()}s manage their music journey more efficiently.
              </p>
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {currentPersona.currentFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full bg-${activePersona === 'artist' ? 'orange' : activePersona === 'venue' ? 'blue' : 'green'}-100 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${currentPersona.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                        <p className="text-slate-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Community Focus Section */}
        <section 
          role="region" 
          aria-label="Community Focus"
          className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200"
        >
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-slate-900">Built For Musicians</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-full mx-auto bg-gradient-to-r from-orange-500 to-cyan-500 flex items-center justify-center mb-4">
                  <FaBuilding data-testid="building-icon" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Supporting Grassroots</h3>
                <p className="text-slate-600">
                  Built specifically for independent artists, bands, and venues to simplify music management.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-full mx-auto bg-gradient-to-r from-orange-500 to-cyan-500 flex items-center justify-center mb-4">
                  <FaStar data-testid="star-icon" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">Collaborative Tools</h3>
                <p className="text-slate-600">
                  Work together with your band members in real-time with shared access to profiles and bookings.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-md">
                <div className="w-12 h-12 rounded-full mx-auto bg-gradient-to-r from-orange-500 to-cyan-500 flex items-center justify-center mb-4">
                  <FaUsers data-testid="users-icon" className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">By Musicians, For Musicians</h3>
                <p className="text-slate-600">
                  Created by musicians who understand the challenges of managing bands and gigs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Features */}
        <section 
          role="region" 
          aria-label="Coming Soon Features"
          data-testid="coming-soon-features"
          className="py-12 sm:py-16 px-4 sm:px-6 bg-white"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                <span>Coming Soon</span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
                New features we're working on to make BNDY even better for {currentPersona.title.toLowerCase()}s.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {currentPersona.comingSoonFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="bg-slate-50 p-6 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full bg-${activePersona === 'artist' ? 'orange' : activePersona === 'venue' ? 'blue' : 'green'}-100 flex items-center justify-center mb-4`}>
                        <Icon className={`w-5 h-5 ${currentPersona.color}`} />
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-600">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section 
          role="region" 
          aria-label="Call to Action"
          className={`py-12 sm:py-16 px-4 sm:px-6 text-center bg-gradient-to-r ${
            activePersona === 'artist' ? 'from-orange-500 to-orange-600' : 
            activePersona === 'venue' ? 'from-blue-500 to-blue-600' : 
            'from-green-500 to-green-600'
          } text-white`}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-white">
              Ready to simplify your {currentPersona.title.toLowerCase()} journey?
            </h2>
            <p className="text-lg sm:text-xl text-white mb-8 opacity-90">
              Join the community that's keeping live music alive.
            </p>
            
            {!currentUser ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/auth?mode=signup"
                  className={`min-h-[44px] touch-target px-8 py-3 rounded-full bg-white ${currentPersona.color} font-medium text-lg shadow-lg transition-all hover:shadow-xl inline-flex items-center justify-center`}
                >
                  Get Started Free
                </Link>
              </div>
            ) : (
              <Link 
                href="/dashboard"
                className="min-h-[44px] touch-target px-8 py-3 rounded-full bg-white text-slate-900 font-medium text-lg shadow-lg transition-all hover:shadow-xl inline-flex items-center justify-center"
              >
                Continue to Dashboard
              </Link>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
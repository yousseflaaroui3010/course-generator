import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      'Generate 2 courses per month',
      'Basic AI models',
      'Standard video generation',
      'Community support'
    ],
    buttonText: 'Current Plan',
    highlight: false
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '$19',
    period: '/mo',
    description: 'For serious learners and creators',
    features: [
      'Unlimited course generation',
      'Advanced AI models (Gemini 1.5 Pro)',
      'High-quality video production',
      'Priority support',
      'Custom branding'
    ],
    buttonText: 'Upgrade to Pro',
    highlight: true,
    priceId: 'price_H5ggY9q12345' // Placeholder Stripe Price ID
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations and schools',
    features: [
      'Bulk licensing',
      'Dedicated account manager',
      'Custom AI training',
      'SLA & Security compliance',
      'API access'
    ],
    buttonText: 'Contact Sales',
    highlight: false
  }
];

export default function Pricing() {
  const { user, profile } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      showToast('Please sign in to subscribe', 'error');
      return;
    }

    setLoading(priceId);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId: user.uid })
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">
          Simple, Transparent <span className="text-indigo-600">Pricing</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the plan that's right for your learning journey. Upgrade or cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${
              plan.highlight 
                ? 'bg-white dark:bg-gray-900 border-indigo-500 shadow-2xl scale-105 z-10' 
                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800 hover:border-indigo-300'
            }`}
          >
            {plan.highlight && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center">
                <Sparkles className="w-4 h-4 mr-1" />
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-gray-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-500 ml-1">{plan.period}</span>}
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                  <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
              disabled={loading !== null || (plan.id === 'free' && profile?.role === 'student')}
              className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center transition-all ${
                plan.highlight
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              {loading === plan.priceId ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {plan.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto text-center">
        <div>
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-indigo-600" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Instant Access</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Get started with your new features immediately after payment.</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Secure Payments</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">All transactions are encrypted and processed securely by Stripe.</p>
        </div>
        <div>
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Check className="w-6 h-6 text-indigo-600" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Cancel Anytime</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">No long-term contracts. Pause or cancel your subscription at any time.</p>
        </div>
      </div>
    </div>
  );
}

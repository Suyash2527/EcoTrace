import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAnnouncer } from '../../hooks/useAnnouncer';
import { useNavigate } from 'react-router-dom';

export function OnboardingFlow() {
  const { profile, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { announce } = useAnnouncer();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    location: profile?.location || '',
    householdSize: profile?.householdSize || 1,
    carType: profile?.carType || 'none',
    dietType: profile?.dietType || 'omnivore'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 1 : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleNext = () => {
    setStep(s => s + 1);
    announce(`Step ${step + 1} of 3`);
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await updateProfile({
        ...formData,
        carType: formData.carType,
        dietType: formData.dietType,
        onboardingComplete: true,
        createdAt: new Date().toISOString(),
        totalCO2Kg: 0
      });
      announce('Profile completed successfully');
      navigate('/dashboard');
    } catch {
      announce('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-forest-800 rounded-2xl border border-forest-400/20 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-cream-100">Complete your profile</h2>
        <div className="flex space-x-2 mt-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-amber-400' : 'bg-forest-900'}`} />
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {step === 1 && (
          <div className="animate-in space-y-4">
            <h3 className="text-lg text-cream-200">The Basics</h3>
            <Input
              name="displayName"
              label="What should we call you?"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Your name"
            />
            <Input
              name="location"
              label="Where do you live? (City, Country)"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. London, UK"
              helperText="Helps AI give better localized tips."
            />
            <Button onClick={handleNext} disabled={!formData.displayName || !formData.location} className="mt-4 w-full">
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in space-y-4">
            <h3 className="text-lg text-cream-200">Household & Transport</h3>
            <Input
              name="householdSize"
              type="number"
              label="How many people in your household?"
              value={formData.householdSize}
              onChange={handleChange}
              min="1" max="20"
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-cream-200 mb-1">Primary Transport</label>
              <select
                name="carType"
                value={formData.carType}
                onChange={handleChange}
                className="w-full bg-forest-900 border border-forest-600 rounded-md py-2 px-3 text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="none">No Car (Public Transit / Bike / Walk)</option>
                <option value="electric">Electric Vehicle</option>
                <option value="hybrid">Hybrid Vehicle</option>
                <option value="petrol">Petrol Car</option>
                <option value="diesel">Diesel Car</option>
              </select>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleNext}>Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in space-y-4">
            <h3 className="text-lg text-cream-200">Dietary Preferences</h3>
            <div className="w-full">
              <label className="block text-sm font-medium text-cream-200 mb-1">What's your typical diet?</label>
              <select
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
                className="w-full bg-forest-900 border border-forest-600 rounded-md py-2 px-3 text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="vegan">Vegan (Plant-based)</option>
                <option value="vegetarian">Vegetarian (Includes dairy/eggs)</option>
                <option value="omnivore">Omnivore (Average meat consumption)</option>
                <option value="heavy-meat">Heavy Meat (Meat with most meals)</option>
              </select>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleComplete} isLoading={loading}>Start Tracking</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

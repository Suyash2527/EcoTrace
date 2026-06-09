import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Toast } from '../components/ui/Toast';

export function Settings() {
  const { profile, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  
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

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({
        ...formData,
        carType: formData.carType as any,
        dietType: formData.dietType as any,
      });
      setToast({ message: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8 animate-in relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50">
          <Toast 
            id="settings-toast" 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        </div>
      )}

      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-cream-100 mb-2">Settings</h1>
          <p className="text-forest-300">Manage your profile and preferences.</p>
        </div>
        <Button variant="danger" onClick={logout}>Sign Out</Button>
      </header>

      <Card>
        <h3 className="text-lg font-medium text-cream-100 mb-6">Profile Settings</h3>
        
        <div className="space-y-6">
          <Input
            name="displayName"
            label="Display Name"
            value={formData.displayName}
            onChange={handleChange}
          />
          <Input
            name="location"
            label="Location"
            value={formData.location}
            onChange={handleChange}
          />
          <Input
            name="householdSize"
            type="number"
            label="Household Size"
            min="1"
            value={formData.householdSize}
            onChange={handleChange}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-1">Primary Transport</label>
              <select
                name="carType"
                value={formData.carType}
                onChange={handleChange}
                className="w-full bg-forest-900 border border-forest-600 rounded-md py-2 px-3 text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="none">No Car / Public Transit</option>
                <option value="electric">Electric Vehicle</option>
                <option value="hybrid">Hybrid Vehicle</option>
                <option value="petrol">Petrol Car</option>
                <option value="diesel">Diesel Car</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-cream-200 mb-1">Diet Type</label>
              <select
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
                className="w-full bg-forest-900 border border-forest-600 rounded-md py-2 px-3 text-cream-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="omnivore">Omnivore</option>
                <option value="heavy-meat">Heavy Meat</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-forest-400/20 flex justify-end">
            <Button onClick={handleSave} isLoading={loading}>
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

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

  React.useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        location: profile.location || '',
        householdSize: profile.householdSize || 1,
        carType: profile.carType || 'none',
        dietType: profile.dietType || 'omnivore'
      });
    }
  }, [profile]);

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
        onboardingComplete: true
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
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences.</p>
        </div>
        <button className="btn btn-danger" onClick={logout}>Sign Out</button>
      </header>

      <div className="glass-panel p-8 rounded-3xl" style={{ borderRadius: 28 }}>
        <h3 className="text-lg font-bold mb-6 text-gray-900">Profile Settings</h3>
        
        <div className="space-y-6">
          <div>
            <label className="field-label">Display Name</label>
            <input className="input-field" name="displayName" value={formData.displayName} onChange={handleChange} />
          </div>
          <div>
            <label className="field-label">Location</label>
            <input className="input-field" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div>
            <label className="field-label">Household Size</label>
            <input className="input-field" type="number" min="1" name="householdSize" value={formData.householdSize} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="field-label">Primary Transport</label>
              <select
                name="carType"
                value={formData.carType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="none">No Car / Public Transit</option>
                <option value="electric">Electric Vehicle</option>
                <option value="hybrid">Hybrid Vehicle</option>
                <option value="petrol">Petrol Car</option>
                <option value="diesel">Diesel Car</option>
              </select>
            </div>
            
            <div>
              <label className="field-label">Diet Type</label>
              <select
                name="dietType"
                value={formData.dietType}
                onChange={handleChange}
                className="input-field"
              >
                <option value="vegan">Vegan</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="omnivore">Omnivore</option>
                <option value="heavy-meat">Heavy Meat</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t flex justify-end" style={{ borderColor: 'rgba(22,163,74,0.1)' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

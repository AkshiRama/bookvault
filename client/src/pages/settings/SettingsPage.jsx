import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { Settings, Save, ShieldAlert } from 'lucide-react';

export const SettingsPage = () => {
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    libraryName: '',
    contactEmail: '',
    phone: '',
    address: '',
    maxBooksPerMember: 5,
    borrowingDuration: 14,
    finePerDay: 10
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        setSettings(res.data.data);
      } catch (err) {
        error('Failed to load library settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', settings);
      success('Library settings updated successfully');
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Library Configuration</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Adjust institutional policies, borrowing limits, overdue fine amounts, and contact details.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Institutional Information
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Contact coordinates and facility details</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Library Name
              </label>
              <input
                type="text"
                required
                name="libraryName"
                value={settings.libraryName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Official Contact Email
              </label>
              <input
                type="email"
                required
                name="contactEmail"
                value={settings.contactEmail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Physical Address
              </label>
              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div className="border-b border-slate-100 pb-4 pt-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Circulation Rules & Fine Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Parameters applied during loan issuance and return</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Max Books per Member
              </label>
              <input
                type="number"
                min="1"
                required
                name="maxBooksPerMember"
                value={settings.maxBooksPerMember}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 5 books</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Borrowing Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                required
                name="borrowingDuration"
                value={settings.borrowingDuration}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 14 days</span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Fine Rate (₹ / Overdue Day)
              </label>
              <input
                type="number"
                min="0"
                required
                name="finePerDay"
                value={settings.finePerDay}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: ₹10 / day</span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

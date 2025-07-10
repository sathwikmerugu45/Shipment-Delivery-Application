import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { ShipmentList } from './ShipmentList';
import { CreateShipment } from './CreateShipment';
import { TrackShipment } from './TrackShipment';
import { DashboardStats } from './DashboardStats';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Shipment } from '../../types';
import { Package, Plus, Search, BarChart3 } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipments' | 'create' | 'track'>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchShipments();
  }, [user]);

  const fetchShipments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShipmentCreated = (newShipment: Shipment) => {
    setShipments([newShipment, ...shipments]);
    setActiveTab('shipments');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'shipments', label: 'My Shipments', icon: Package },
    { id: 'create', label: 'Create Shipment', icon: Plus },
    { id: 'track', label: 'Track Package', icon: Search },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'dashboard' && (
            <DashboardStats shipments={shipments} />
          )}
          
          {activeTab === 'shipments' && (
            <ShipmentList shipments={shipments} loading={loading} onRefresh={fetchShipments} />
          )}
          
          {activeTab === 'create' && (
            <CreateShipment onShipmentCreated={handleShipmentCreated} />
          )}
          
          {activeTab === 'track' && (
            <TrackShipment />
          )}
        </div>
      </div>
    </div>
  );
};
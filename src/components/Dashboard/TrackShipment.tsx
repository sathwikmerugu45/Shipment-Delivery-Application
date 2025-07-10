import React, { useState } from 'react';
import { Shipment, TrackingEvent } from '../../types';
import { Search, Package, MapPin, Clock, CheckCircle, Truck, Calendar } from 'lucide-react';
import { getShipmentByTrackingNumber, getTrackingEventsByShipmentId } from '../../lib/localStorage';

export const TrackShipment: React.FC = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');
    setShipment(null);
    setTrackingEvents([]);

    try {
      // Fetch shipment from local storage
      const shipmentData = getShipmentByTrackingNumber(trackingNumber.trim());
      
      if (!shipmentData) {
        setError('Tracking number not found');
        return;
      }

      setShipment(shipmentData);

      // Fetch tracking events from local storage
      const eventsData = getTrackingEventsByShipmentId(shipmentData.id);
      // Sort by timestamp descending
      const sortedEvents = eventsData.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setTrackingEvents(sortedEvents);
      
    } catch (err: any) {
      setError(err.message || 'Failed to track shipment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'picked_up':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'out_for_delivery':
        return <MapPin className="w-5 h-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Track Your Shipment</h2>
        <p className="text-gray-600">Enter your tracking number to get real-time updates</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleTrack} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., ST1234567890123)"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Shipment Details */}
      {shipment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{shipment.tracking_number}</h3>
              <p className="text-sm text-gray-500">
                Created on {new Date(shipment.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.status)}`}>
              {getStatusIcon(shipment.status)}
              <span className="ml-2">{shipment.status.replace('_', ' ')}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sender</h4>
              <p className="text-sm text-gray-600">{shipment.sender_name}</p>
              <p className="text-sm text-gray-500">{shipment.sender_address}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Receiver</h4>
              <p className="text-sm text-gray-600">{shipment.receiver_name}</p>
              <p className="text-sm text-gray-500">{shipment.receiver_address}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Package Details</h4>
              <p className="text-sm text-gray-600">{shipment.package_weight} kg</p>
              <p className="text-sm text-gray-500">{shipment.package_dimensions}</p>
              <p className="text-sm text-gray-500">Service: {shipment.service_type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Estimated Delivery</h4>
              </div>
              <p className="text-blue-700">
                {new Date(shipment.estimated_delivery).toLocaleDateString()}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Payment Details</h4>
              </div>
              <div className="space-y-1">
                <p className="text-green-700">Amount: ₹{shipment.cost}</p>
                <p className={`text-sm font-medium ${
                  shipment.payment_status === 'paid' ? 'text-green-700' :
                  shipment.payment_status === 'failed' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  Status: {shipment.payment_status.charAt(0).toUpperCase() + shipment.payment_status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Timeline */}
      {trackingEvents.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>
          
          <div className="space-y-4">
            {trackingEvents.map((event, index) => (
              <div key={event.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(event.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{event.description}</h4>
                    <span className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{event.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sample tracking numbers for testing */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Need a sample tracking number?</h3>
        <p className="text-blue-700 mb-4">
          If you don't have a tracking number, you can create a new shipment from the "Create Shipment" tab.
        </p>
        <p className="text-sm text-blue-600">
          Once you create a shipment, you'll receive a tracking number that you can use to track your package.
        </p>
      </div>
    </div>
  );
};
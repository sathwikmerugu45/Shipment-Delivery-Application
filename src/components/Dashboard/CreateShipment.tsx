import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shipment } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Package, User, MapPin, Phone, Weight, Ruler, CreditCard } from 'lucide-react';
import { PaymentModal } from '../Payment/PaymentModal';
import { saveShipment, createTrackingEvent } from '../../lib/localStorage';

interface CreateShipmentProps {
  onShipmentCreated: (shipment: Shipment) => void;
}

export const CreateShipment: React.FC<CreateShipmentProps> = ({ onShipmentCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingShipment, setPendingShipment] = useState<any>(null);
  const [formData, setFormData] = useState({
    senderName: '',
    senderAddress: '',
    senderPhone: '',
    receiverName: '',
    receiverAddress: '',
    receiverPhone: '',
    packageWeight: '',
    packageDimensions: '',
    serviceType: 'standard' as 'standard' | 'express' | 'overnight',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateCost = () => {
    const weight = parseFloat(formData.packageWeight) || 0;
    const baseRate = 50;
    const weightRate = weight * 20;
    const serviceMultiplier = 
      formData.serviceType === 'overnight' ? 3 :
      formData.serviceType === 'express' ? 2 : 1;
    
    return Math.round((baseRate + weightRate) * serviceMultiplier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a shipment');
      return;
    }

    setError('');

    // Prepare shipment data for payment
    const trackingNumber = `ST${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const cost = calculateCost();
    const estimatedDelivery = new Date();
    
    // Add delivery time based on service type
    const deliveryDays = 
      formData.serviceType === 'overnight' ? 1 :
      formData.serviceType === 'express' ? 2 : 5;
    
    estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

    const shipmentData = {
      id: uuidv4(),
      user_id: user.id,
      tracking_number: trackingNumber,
      sender_name: formData.senderName,
      sender_address: formData.senderAddress,
      sender_phone: formData.senderPhone,
      receiver_name: formData.receiverName,
      receiver_address: formData.receiverAddress,
      receiver_phone: formData.receiverPhone,
      package_weight: parseFloat(formData.packageWeight),
      package_dimensions: formData.packageDimensions,
      service_type: formData.serviceType,
      status: 'pending' as const,
      estimated_delivery: estimatedDelivery.toISOString(),
      cost,
      payment_status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setPendingShipment(shipmentData);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!pendingShipment) return;

    setLoading(true);
    setError('');

    try {
      // Update payment status to paid
      const updatedShipmentData = {
        ...pendingShipment,
        payment_status: 'paid' as const,
      };

      // Save shipment to local storage
      saveShipment(updatedShipmentData);
      
      // Create initial tracking event
      createTrackingEvent(updatedShipmentData, 'pending');

      onShipmentCreated(updatedShipmentData);
      
      // Reset form and state
      setFormData({
        senderName: '',
        senderAddress: '',
        senderPhone: '',
        receiverName: '',
        receiverAddress: '',
        receiverPhone: '',
        packageWeight: '',
        packageDimensions: '',
        serviceType: 'standard',
      });
      setPendingShipment(null);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const cost = calculateCost();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Shipment</h2>
          <p className="text-gray-600">Fill in the details to create a new shipment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sender Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Sender Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="senderPhone"
                    value={formData.senderPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <textarea
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Receiver Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="receiverPhone"
                    value={formData.receiverPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <textarea
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Package Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-600" />
              Package Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    name="packageWeight"
                    value={formData.packageWeight}
                    onChange={handleChange}
                    step="0.1"
                    min="0.1"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (LxWxH cm)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="packageDimensions"
                    value={formData.packageDimensions}
                    onChange={handleChange}
                    placeholder="e.g., 30x20x10"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="standard">Standard (5 days)</option>
                  <option value="express">Express (2 days)</option>
                  <option value="overnight">Overnight (1 day)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Cost Summary
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Rate:</span>
                <span className="font-medium">₹50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight Charge ({formData.packageWeight || 0} kg):</span>
                <span className="font-medium">₹{((parseFloat(formData.packageWeight) || 0) * 20).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Multiplier ({formData.serviceType}):</span>
                <span className="font-medium">
                  {formData.serviceType === 'overnight' ? '3x' :
                   formData.serviceType === 'express' ? '2x' : '1x'}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Cost:</span>
                  <span className="text-green-600">₹{cost}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !formData.senderName || !formData.receiverName || !formData.packageWeight}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </form>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setPendingShipment(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
        amount={pendingShipment?.cost || 0}
        shipmentDetails={{
          trackingNumber: pendingShipment?.tracking_number || '',
          senderName: pendingShipment?.sender_name || '',
          receiverName: pendingShipment?.receiver_name || '',
          serviceType: pendingShipment?.service_type || '',
        }}
      />
    </div>
  );
};
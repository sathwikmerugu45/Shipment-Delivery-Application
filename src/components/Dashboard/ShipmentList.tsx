import React, { useState } from 'react';
import { Shipment } from '../../types';
import { Package, Search, Filter, Eye, RefreshCw } from 'lucide-react';

interface ShipmentListProps {
  shipments: Shipment[];
  loading: boolean;
  onRefresh: () => void;
}

export const ShipmentList: React.FC<ShipmentListProps> = ({ shipments, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'express': return 'bg-orange-100 text-orange-800';
      case 'overnight': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading shipments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Shipments</h2>
          <p className="text-gray-600 mt-1">Manage and track all your shipments</p>
        </div>
        
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tracking number, sender, or receiver..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="picked_up">Picked Up</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Shipments List */}
      {filteredShipments.length > 0 ? (
        <div className="grid gap-6">
          {filteredShipments.map((shipment) => (
            <div key={shipment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{shipment.tracking_number}</h3>
                    <p className="text-sm text-gray-500">
                      Created on {new Date(shipment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.status.replace('_', ' ')}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getServiceTypeColor(shipment.service_type)}`}>
                    {shipment.service_type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sender</h4>
                  <p className="text-sm text-gray-600">{shipment.sender_name}</p>
                  <p className="text-sm text-gray-500">{shipment.sender_phone}</p>
                  <p className="text-sm text-gray-500">{shipment.sender_address}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Receiver</h4>
                  <p className="text-sm text-gray-600">{shipment.receiver_name}</p>
                  <p className="text-sm text-gray-500">{shipment.receiver_phone}</p>
                  <p className="text-sm text-gray-500">{shipment.receiver_address}</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-6">
                    <div>
                      <p className="text-sm text-gray-500">Weight</p>
                      <p className="font-medium text-gray-900">{shipment.package_weight} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dimensions</p>
                      <p className="font-medium text-gray-900">{shipment.package_dimensions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cost</p>
                      <p className="font-medium text-gray-900">₹{shipment.cost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Payment</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        shipment.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                        shipment.payment_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {shipment.payment_status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                      <Eye className="w-4 h-4" />
                      <span>Track</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shipments found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria' 
              : 'Create your first shipment to get started'}
          </p>
        </div>
      )}
    </div>
  );
};
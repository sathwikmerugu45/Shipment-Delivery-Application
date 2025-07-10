import React from 'react';
import { Shipment } from '../../types';
import { Package, Clock, CheckCircle, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface DashboardStatsProps {
  shipments: Shipment[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ shipments }) => {
  const stats = {
    total: shipments.length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
    inTransit: shipments.filter(s => s.status === 'in_transit').length,
    pending: shipments.filter(s => s.status === 'pending').length,
    totalSpent: shipments.reduce((sum, s) => sum + s.cost, 0),
  };

  const recentShipments = shipments.slice(0, 5);

  const statCards = [
    {
      title: 'Total Shipments',
      value: stats.total,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'In Transit',
      value: stats.inTransit,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: AlertCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
        <p className="text-blue-100">Track and manage all your shipments in one place</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Spending Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Total Spending</h3>
          <DollarSign className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            ₹{stats.totalSpent.toLocaleString()}
          </span>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
        </div>
        
        {recentShipments.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentShipments.map((shipment) => (
              <div key={shipment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{shipment.tracking_number}</p>
                        <p className="text-sm text-gray-500">
                          {shipment.sender_name} → {shipment.receiver_name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      shipment.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                      shipment.status === 'pending' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {shipment.status.replace('_', ' ')}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">₹{shipment.cost}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No shipments yet. Create your first shipment to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
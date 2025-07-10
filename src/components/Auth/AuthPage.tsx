import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Truck, Package, Shield, Clock } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-12 flex-col justify-center">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                <Truck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">ShipTracker Pro</h1>
            </div>
            
            <h2 className="text-4xl font-bold mb-6">
              Streamline Your Shipping Experience
            </h2>
            
            <p className="text-blue-100 mb-8 text-lg">
              Track, manage, and optimize your shipments with our comprehensive logistics platform.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <Package className="w-4 h-4" />
                </div>
                <span>Real-time package tracking</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Secure payment processing</span>
              </div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Fast delivery options</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">ShipTracker Pro</h1>
              </div>
            </div>

            {isLogin ? (
              <LoginForm onToggleForm={toggleForm} />
            ) : (
              <SignupForm onToggleForm={toggleForm} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
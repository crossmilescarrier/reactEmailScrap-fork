import React from 'react';

// Primary spinner for loading states
export function Spinner({ size = "md", color = "blue", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };
  
  const colorClasses = {
    blue: "border-blue-600",
    white: "border-white",
    gray: "border-gray-600",
    green: "border-green-600",
    red: "border-red-600"
  };
  
  return (
    <div 
      className={`animate-spin rounded-full border-2 border-transparent ${colorClasses[color]} border-t-transparent ${sizeClasses[size]} ${className}`}
      style={{ borderTopColor: 'transparent' }}
    />
  );
}

// Inline spinner for buttons and small areas
export function InlineSpinner({ size = "sm", color = "white", className = "" }) {
  return <Spinner size={size} color={color} className={className} />;
}

// Full page loading component
export function PageLoader({ message = "Loading...", dark = false }) {
  return (
    <div className={`w-full px-12 py-20 flex justify-center ${dark ? 'bg-gray-900' : ''}`}>
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="xl" color={dark ? "white" : "blue"} />
        <p className={`text-center text-md ${dark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wide`}>
          {message}
        </p>
      </div>
    </div>
  );
}

// Fixed overlay loader
export function OverlayLoader({ message = "Loading...", show = false }) {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <Spinner size="lg" color="blue" />
          <p className="text-gray-700 text-lg font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default Spinner;

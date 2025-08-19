import React from 'react';
import { Spinner } from './Spinner';

// Enhanced Loading Component with multiple variants
const Loading = ({
  variant = 'spinner',
  size = 'md',
  color = 'blue',
  message = '',
  className = '',
  overlay = false,
  fullPage = false,
  inline = false,
  show = true,
  theme = 'light',
  animated = true
}) => {
  // Don't render if show is false
  if (!show) return null;

  // Color schemes
  const colorSchemes = {
    light: {
      bg: 'bg-white',
      text: 'text-gray-700',
      subtext: 'text-gray-500',
      border: 'border-gray-200'
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-gray-100',
      subtext: 'text-gray-400',
      border: 'border-gray-700'
    },
    transparent: {
      bg: 'bg-transparent',
      text: 'text-gray-700',
      subtext: 'text-gray-500',
      border: 'border-transparent'
    }
  };

  const colors = colorSchemes[theme] || colorSchemes.light;

  // Size configurations
  const sizeConfig = {
    xs: { spinner: 'sm', text: 'text-xs', padding: 'p-2', space: 'space-y-1' },
    sm: { spinner: 'sm', text: 'text-sm', padding: 'p-3', space: 'space-y-2' },
    md: { spinner: 'md', text: 'text-base', padding: 'p-4', space: 'space-y-3' },
    lg: { spinner: 'lg', text: 'text-lg', padding: 'p-6', space: 'space-y-4' },
    xl: { spinner: 'xl', text: 'text-xl', padding: 'p-8', space: 'space-y-5' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  // Different loading animations
  const LoadingVariants = {
    // Standard spinner
    spinner: () => (
      <div className="flex flex-col items-center justify-center">
        <Spinner size={config.spinner} color={color} />
        {message && (
          <p className={`mt-3 ${config.text} ${colors.text} font-medium animate-pulse`}>
            {message}
          </p>
        )}
      </div>
    ),

    // Dots animation
    dots: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 ${color === 'white' ? 'bg-white' : `bg-${color}-500`} rounded-full animate-bounce`}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
        {message && (
          <p className={`mt-3 ${config.text} ${colors.text} font-medium`}>
            {message}
          </p>
        )}
      </div>
    ),

    // Pulse animation
    pulse: () => (
      <div className="flex flex-col items-center justify-center">
        <div className={`w-8 h-8 ${color === 'white' ? 'bg-white' : `bg-${color}-500`} rounded-full animate-pulse`} />
        {message && (
          <p className={`mt-3 ${config.text} ${colors.text} font-medium animate-pulse`}>
            {message}
          </p>
        )}
      </div>
    ),

    // Bars animation
    bars: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="flex space-x-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-1 h-6 ${color === 'white' ? 'bg-white' : `bg-${color}-500`} animate-pulse`}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {message && (
          <p className={`mt-3 ${config.text} ${colors.text} font-medium`}>
            {message}
          </p>
        )}
      </div>
    ),

    // Ring animation
    ring: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="relative">
          <div className={`w-8 h-8 border-4 border-${color}-200 rounded-full`}></div>
          <div className={`absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-${color}-500 rounded-full animate-spin`}></div>
        </div>
        {message && (
          <p className={`mt-3 ${config.text} ${colors.text} font-medium`}>
            {message}
          </p>
        )}
      </div>
    ),

    // Text only with animated dots
    text: () => (
      <div className="flex items-center justify-center">
        <span className={`${config.text} ${colors.text} font-medium`}>
          {message || 'Loading'}
          <span className="animate-pulse">...</span>
        </span>
      </div>
    )
  };

  const LoadingContent = LoadingVariants[variant] || LoadingVariants.spinner;

  // Inline variant - minimal styling
  if (inline) {
    return (
      <span className={`inline-flex items-center ${className}`}>
        <LoadingContent />
      </span>
    );
  }

  // Overlay variant - covers entire screen
  if (overlay) {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm ${className}`}>
        <div className={`${colors.bg} rounded-lg shadow-xl ${config.padding} min-w-[200px]`}>
          <LoadingContent />
        </div>
      </div>
    );
  }

  // Full page variant - takes full container height
  if (fullPage) {
    return (
      <div className={`w-full min-h-screen flex items-center justify-center ${colors.bg} ${className}`}>
        <div className={`${config.padding}`}>
          <LoadingContent />
        </div>
      </div>
    );
  }

  // Default variant - flexible container
  return (
    <div className={`w-full flex items-center justify-center ${config.padding} ${className}`}>
      <LoadingContent />
    </div>
  );
};

// Specialized loading components for common use cases
export const ButtonLoader = ({ show = true, size = 'sm', color = 'white', className = '' }) => (
  <Loading
    variant="spinner"
    size={size}
    color={color}
    inline={true}
    show={show}
    className={className}
  />
);

export const PageLoader = ({ message = 'Loading...', theme = 'light', variant = 'spinner' }) => (
  <Loading
    variant={variant}
    message={message}
    fullPage={true}
    theme={theme}
    size="lg"
  />
);

export const OverlayLoader = ({ show = false, message = 'Processing...', variant = 'spinner', theme = 'light' }) => (
  <Loading
    variant={variant}
    message={message}
    overlay={true}
    show={show}
    theme={theme}
    size="lg"
  />
);

export const CardLoader = ({ message = '', height = 'h-32', variant = 'spinner', theme = 'light' }) => (
  <div className={`w-full ${height} flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50`}>
    <Loading
      variant={variant}
      message={message}
      theme={theme}
      size="md"
    />
  </div>
);

export const InlineLoader = ({ message = 'Loading', variant = 'dots', size = 'sm', color = 'blue' }) => (
  <Loading
    variant={variant}
    message={message}
    inline={true}
    size={size}
    color={color}
  />
);

export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex space-x-4 py-2">
        {Array.from({ length: columns }).map((_, j) => (
          <div key={j} className="flex-1 h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonLoader = ({ lines = 3, height = 'h-4', className = '' }) => (
  <div className={`animate-pulse space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className={`${height} bg-gray-200 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      ></div>
    ))}
  </div>
);

export const ChatLoader = () => (
  <div className="space-y-4 p-4">
    {/* Received message skeleton */}
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
      <div className="flex-1">
        <div className="bg-gray-200 rounded-lg p-3 animate-pulse">
          <div className="h-3 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    </div>
    
    {/* Sent message skeleton */}
    <div className="flex items-start space-x-3 justify-end">
      <div className="flex-1 flex justify-end">
        <div className="bg-blue-200 rounded-lg p-3 animate-pulse max-w-xs">
          <div className="h-3 bg-blue-300 rounded mb-2"></div>
          <div className="h-3 bg-blue-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  </div>
);

// Loading states hook for managing multiple loading states
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = React.useState({});

  const setLoading = (key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key) => Boolean(loadingStates[key]);
  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates
  };
};

export default Loading;

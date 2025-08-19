import { useState, useEffect } from 'react';

/**
 * Debounce function to limit the rate at which a function can fire
 * Useful for search inputs to prevent excessive API calls
 * 
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds (default: 300ms)
 * @returns {Function} - The debounced function
 */
export const debounce = (func, delay = 700) => {
  let timeoutId;
  
  return (...args) => {
    // Clear the previous timeout if it exists
    clearTimeout(timeoutId);
    
    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

/**
 * React hook for debounced search functionality
 * 
 * @param {string} value - The current search value
 * @param {number} delay - The delay in milliseconds (default: 300ms)
 * @returns {string} - The debounced value
 */

export const useDebounce = (value, delay = 700) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default debounce;

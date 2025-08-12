import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

// Custom hook for handling API calls with consistent error handling
export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiFunction, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      successMessage, 
      errorMessage,
      showErrorToast = true,
      showSuccessToast = false 
    } = options;

    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction();
      
      if (response && response.status === true) {
        if (successMessage && showSuccessToast) {
          toast.success(successMessage);
        }
        if (onSuccess) {
          onSuccess(response);
        }
        return response;
      } else {
        const errorMsg = response?.message || errorMessage || 'Operation failed';
        if (showErrorToast) {
          toast.error(errorMsg);
        }
        setError(errorMsg);
        if (onError) {
          onError(errorMsg);
        }
        return null;
      }
    } catch (err) {
      console.error('API call error:', err);
      const errorMsg = err?.response?.data?.message || err?.message || errorMessage || 'An unexpected error occurred';
      
      if (showErrorToast) {
        toast.error(errorMsg);
      }
      setError(errorMsg);
      
      if (onError) {
        onError(errorMsg);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
};

export default useApiCall;

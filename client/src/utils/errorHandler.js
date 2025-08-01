import { toast } from 'sonner';

export const handleApiError = (error, defaultMessage = 'An error occurred') => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || defaultMessage;
    toast.error(message);
    return message;
  } else if (error.request) {
    // Network error
    toast.error('Network error. Please check your connection.');
    return 'Network error';
  } else {
    // Other error
    toast.error(defaultMessage);
    return defaultMessage;
  }
};

export const handleAsyncError = (asyncFn, errorMessage) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleApiError(error, errorMessage);
      throw error;
    }
  };
};

export const withErrorHandling = (Component) => {
  return function WrappedComponent(props) {
    const [error, setError] = React.useState(null);
    
    const handleError = (error) => {
      setError(error);
      handleApiError(error);
    };
    
    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Something went wrong</p>
          <button
            onClick={() => setError(null)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    return <Component {...props} onError={handleError} />;
  };
};
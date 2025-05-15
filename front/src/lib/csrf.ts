export const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };
  
  // Improved fetch wrapper with proper token handling
  export const csrfFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    
    // Always include CSRF token if available
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers.set('X-CSRFToken', csrfToken);
    }
    
    // Add Authorization header with the token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('Using token for authentication:', token.substring(0, 5) + '...');
    } else {
      console.log('No token found, falling back to session authentication');
    }
    
    // Debug headers
    console.log('Request headers:', {
      url,
      method: options.method || 'GET',
      hasCSRF: !!csrfToken,
      hasToken: !!token
    });
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  };
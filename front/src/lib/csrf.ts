export const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    return cookieValue || '';
  };
  
  // Обертка для fetch
  export const csrfFetch = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers);
    headers.set('X-CSRFToken', getCSRFToken());
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });
  };
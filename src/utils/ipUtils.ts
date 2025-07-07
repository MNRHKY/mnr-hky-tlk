// Utility function to get user's IP address
export const getUserIP = async (): Promise<string | null> => {
  try {
    // Try to get IP from a public API service
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || null;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return null;
  }
};

// Alternative method using multiple services as fallback
export const getUserIPWithFallback = async (): Promise<string | null> => {
  const services = [
    'https://api.ipify.org?format=json',
    'https://httpbin.org/ip',
    'https://jsonip.com'
  ];

  for (const service of services) {
    try {
      const response = await fetch(service);
      const data = await response.json();
      
      // Different services return IP in different formats
      const ip = data.ip || data.origin || data.IP;
      if (ip) {
        return ip;
      }
    } catch (error) {
      console.error(`Failed to get IP from ${service}:`, error);
      continue;
    }
  }

  return null;
};
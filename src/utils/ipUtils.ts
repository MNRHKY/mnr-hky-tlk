// Utility function to get user's IP address
export const getUserIP = async (): Promise<string | null> => {
  try {
    // Try to get IP from a public API service
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('IP address fetched successfully:', data.ip);
    return data.ip || null;
  } catch (error) {
    console.error('Failed to get IP address from ipify:', error);
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

  console.log('Attempting to fetch IP address...');

  for (const service of services) {
    try {
      console.log(`Trying service: ${service}`);
      const response = await fetch(service, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Response from ${service}:`, data);
      
      // Different services return IP in different formats
      const ip = data.ip || data.origin || data.IP;
      if (ip) {
        console.log(`Successfully got IP address: ${ip}`);
        return ip;
      }
    } catch (error) {
      console.error(`Failed to get IP from ${service}:`, error);
      continue;
    }
  }

  console.error('All IP services failed, returning null');
  return null;
};
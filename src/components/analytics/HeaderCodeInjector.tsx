import { useEffect } from 'react';
import { useForumSettings } from '@/hooks/useForumSettings';

export const HeaderCodeInjector = () => {
  const { getSetting } = useForumSettings();
  const headerCode = getSetting('header_code', '');

  useEffect(() => {
    if (!headerCode) return;

    // Remove any existing custom header elements to avoid duplicates
    const existingElements = document.querySelectorAll('[data-custom-header]');
    existingElements.forEach(el => el.remove());

    // Create a container for the custom header code
    const container = document.createElement('div');
    container.setAttribute('data-custom-header', 'true');
    container.innerHTML = headerCode;

    // Append to head
    document.head.appendChild(container);

    return () => {
      // Cleanup on unmount or when header code changes
      const elements = document.querySelectorAll('[data-custom-header]');
      elements.forEach(el => el.remove());
    };
  }, [headerCode]);

  return null;
};
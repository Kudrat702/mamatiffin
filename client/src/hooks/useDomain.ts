// frontend/src/hooks/useDomain.ts - ENHANCED VERSION
import { useState, useEffect } from 'react';

interface DomainInfo {
  isAdmin: boolean;
  hostname: string;
  isLocal: boolean;
  domain: string;
}

export const useDomain = (): DomainInfo => {
  const [domainInfo, setDomainInfo] = useState<DomainInfo>({
    isAdmin: false,
    hostname: '',
    isLocal: false,
    domain: ''
  });

  useEffect(() => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    const isLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1');
   
    let isAdmin = false;
    let domain = hostname;
   
    // Check for admin subdomain
    if (hostname.startsWith('admin.')) {
      isAdmin = true;
      domain = hostname.replace('admin.', '');
      document.title = 'Admin Dashboard - MamaTiffin';
    } else {
      document.title = 'mamatiffin - Home Food Delivery';
    }
   
    // For local testing - additional check
    if (isLocal && hostname.includes('admin')) {
      isAdmin = true;
    }
   
    setDomainInfo({
      isAdmin,
      hostname,
      isLocal,
      domain
    });
   
    // Enhanced logging
    console.log('🌐 Domain Detection:', {
      isAdmin: isAdmin ? '👨‍💼 Admin' : '👤 User',
      hostname,
      isLocal: isLocal ? '🏠 Local' : '🌍 Production',
      domain,
      pathname,
      timestamp: new Date().toISOString()
    });
  }, []); // Empty dependency array - only run once on mount

  return domainInfo;
};

// Simple hook for components that only need admin check
export const useIsAdmin = (): boolean => {
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const hostname = window.location.hostname;
    setIsAdmin(hostname.startsWith('admin.') || hostname.includes('admin.'));
  }, []);
  
  return isAdmin;
};

// Utility hook for getting just the domain
export const useDomainName = (): string => {
  const { domain } = useDomain();
  return domain;
};

// NEW: Hook for getting the correct API base URL based on domain
export const useApiBaseUrl = (): string => {
  const { isLocal } = useDomain();
  
  return isLocal 
    ? 'http://localhost:3000'
    : 'https://api.yourdomain.com'; // Replace with your production API URL
};

// NEW: Hook for handling domain-specific navigation
export const useDomainNavigation = () => {
  const { isLocal } = useDomain();

  const navigateToAdmin = (path: string = '/admin') => {
    const baseUrl = isLocal ? 'http://admin.localhost:5173' : 'https://admin.yourdomain.com';
    window.location.href = `${baseUrl}${path}`;
  };

  const navigateToUser = (path: string = '/home') => {
    const baseUrl = isLocal ? 'http://localhost:5173' : 'https://yourdomain.com';
    window.location.href = `${baseUrl}${path}`;
  };

  return { navigateToAdmin, navigateToUser };
};
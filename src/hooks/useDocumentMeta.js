import { useEffect } from 'react';

const useDocumentMeta = ({ title, description, image, url }) => {
  useEffect(() => {
    const siteTitle = 'cred.blue';
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const defaultDescription = 'Generate a Bluesky credibility score. Understand your Atproto data footprint. Vibe check strangers and new accounts.';
    const defaultImage = `${window.location.origin}/cred-blue-banner.jpg`;
    
    // Update standard meta tags
    document.title = fullTitle;
    
    // Helper function to update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      let meta = document.querySelector(property ? `meta[property="${name}"]` : `meta[name="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Update description
    updateMetaTag('description', description || defaultDescription);
    
    // Update Open Graph meta tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', description || defaultDescription, true);
    updateMetaTag('og:image', image || defaultImage, true);
    updateMetaTag('og:url', url || window.location.href, true);
    updateMetaTag('og:type', 'website', true);
    
    // Update Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', description || defaultDescription);
    updateMetaTag('twitter:image', image || defaultImage);
    
    // Cleanup function
    return () => {
      // Optional: Reset to default values when component unmounts
      document.title = siteTitle;
    };
  }, [title, description, image, url]);
};

export default useDocumentMeta;
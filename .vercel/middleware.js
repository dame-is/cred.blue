// frontend/.vercel/middleware.js
export const config = {
    matcher: '/:path*',
  };
  
  export default function middleware(request) {
    // Check if the request is from a bot
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
    const isBot = userAgent.includes('bot') || 
                  userAgent.includes('crawler') || 
                  userAgent.includes('spider') ||
                  userAgent.includes('preview');
  
    if (!isBot) {
      return new Response(null, { status: 404 });
    }
  
    const url = new URL(request.url);
    const path = url.pathname;
  
    // Define meta tags for different routes
    const metaTags = {
      '/about': {
        title: 'About - cred.blue',
        description: 'Learn more about cred.blue and how we calculate credibility scores for Bluesky accounts.',
        image: 'https://cred.blue/cred-blue-banner.jpg',
      },
      '/alt-text': {
        title: 'Alt Text Rating Tool - cred.blue',
        description: 'Rate and improve your alt text descriptions for better accessibility.',
        image: 'https://cred.blue/cred-blue-banner.jpg',
      },
      '/compare': {
        title: 'Compare Scores - cred.blue',
        description: 'Compare credibility scores between different Bluesky accounts.',
        image: 'https://cred.blue/cred-blue-banner.jpg',
      },
      // Add other routes as needed
    };
  
    // Get the appropriate meta tags
    let tags;
    if (metaTags[path]) {
      tags = metaTags[path];
    } else if (path.match(/^\/[^\/]+$/)) {
      // Handle user profile routes
      const username = path.slice(1);
      tags = {
        title: `${username}'s Profile - cred.blue`,
        description: `Check ${username}'s credibility score and profile on cred.blue`,
        image: 'https://cred.blue/cred-blue-banner.jpg',
      };
    } else {
      // Default meta tags
      tags = {
        title: 'cred.blue',
        description: 'Generate a Bluesky credibility score. Understand your Atproto data footprint.',
        image: 'https://cred.blue/cred-blue-banner.jpg',
      };
    }
  
    // Create HTML with meta tags
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="utf-8" />
      <link rel="icon" href="https://cred.blue/favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      
      <!-- Basic Meta Tags -->
      <meta name="description" content="${tags.description}" />
      <title>${tags.title}</title>
      
      <!-- OpenGraph Meta Tags -->
      <meta property="og:title" content="${tags.title}" />
      <meta property="og:description" content="${tags.description}" />
      <meta property="og:image" content="${tags.image}" />
      <meta property="og:url" content="https://cred.blue${path}" />
      <meta property="og:type" content="website" />
      
      <!-- Twitter Card Meta Tags -->
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${tags.title}" />
      <meta name="twitter:description" content="${tags.description}" />
      <meta name="twitter:image" content="${tags.image}" />
      
      <link rel="apple-touch-icon" href="https://cred.blue/credblue-logo-small.png" />
      <link rel="manifest" href="https://cred.blue/manifest.json" />
      <link rel="stylesheet" href="https://use.typekit.net/yhs0sil.css">
  </head>
  <body>
      <div id="root"></div>
  </body>
  </html>`;
  
    return new Response(html, {
      headers: {
        'content-type': 'text/html',
      },
    });
  }
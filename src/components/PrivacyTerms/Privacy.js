import React from 'react';
import './PrivacyTerms.css';

const Privacy = () => {
  return (
    <>
      <main className="privacy-terms-page">
        <div className="alt-card">
          <h1>Privacy Policy</h1>
          <div className="last-updated">Last Updated: February 19, 2025</div>

          <h2>Introduction</h2>
          <p>This Privacy Policy explains how cred.blue ("we," "our," or "us") collects, uses, and protects information when you use our website and services. We are committed to protecting your privacy and being transparent about our data practices.</p>

          <h2>Information We Collect</h2>
          
          <h3>Information You Provide</h3>
          <ul>
            <li>Email addresses and related information when you opt-in to receive updates or notifications</li>
            <li>Bluesky authentication credentials when you choose to log in (processed through Bluesky's authentication system)</li>
          </ul>

          <h3>Information We Collect and Store</h3>
          <ul>
            <li>Public Bluesky/AT Protocol PDS data associated with searched user accounts</li>
            <li>This includes publicly available posts, follows, likes, and other public account information</li>
            <li>We create and maintain a database of this public information when usernames are searched or when credibility scores are generated</li>
            <li>This stored data helps us improve our service, provide enhanced analytics, and develop new features</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li>Standard server logs</li>
            <li>Device information</li>
            <li>Browser type and version</li>
            <li>IP address</li>
            <li>Pages visited and features used</li>
          </ul>

          <h2>How We Use Information</h2>
          
          <h3>Public Bluesky Data</h3>
          <ul>
            <li>To calculate credibility scores and provide analytics</li>
            <li>To display user statistics and insights</li>
            <li>To maintain historical data for trend analysis and feature improvement</li>
            <li>To develop and enhance our scoring algorithms</li>
            <li>To provide comparative analytics and historical insights</li>
          </ul>

          <h3>User-Provided Information</h3>
          <ul>
            <li>To send requested updates and notifications</li>
            <li>To provide enhanced tools and services for logged-in users</li>
            <li>To improve our services and user experience</li>
          </ul>

          <h2>Data Storage and Security</h2>
          <ul>
            <li>We maintain a secure database of public Bluesky data collected through our service</li>
            <li>This data is stored and processed in accordance with industry standard security practices</li>
            <li>Email addresses and related information for notifications are stored securely</li>
            <li>We implement appropriate technical and organizational security measures to protect stored information</li>
            <li>We regularly review and update our security practices to maintain data protection</li>
          </ul>

          <h2>Data Retention</h2>
          <ul>
            <li>We retain collected public data for as long as necessary to provide and improve our services</li>
            <li>You may request information about how your public data is being used</li>
            <li>We regularly review our data retention practices and may update them as needed</li>
          </ul>

          <h2>Third-Party Services</h2>
          <ul>
            <li>We use Bluesky's authentication system for user login</li>
            <li>We access public data through AT Protocol/Bluesky PDSs</li>
            <li>We do not share collected information with third parties unless necessary to establish and maintain important services or features</li>
          </ul>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Opt-out of email notifications at any time</li>
            <li>Request deletion of your email address and associated information</li>
            <li>Access information about how we use your data</li>
            <li>Request information about what public data we have stored</li>
          </ul>

          <div className="contact">
            <h2>Contact Us</h2>
            <p>For privacy-related questions or concerns, please contact us at privacy@cred.blue</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Privacy;
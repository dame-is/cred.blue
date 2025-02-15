// src/components/PrivacyTerms/Terms.jsx

import React from 'react';
import './PrivacyTerms.css';

const Terms = () => {
  return (
    <>
      <main className="about-page">
      <div className="alt-card">
            <h1>Terms of Service</h1>
            <div class="last-updated">Last Updated: February 13, 2025</div>

            <div class="section">
                <h2>1. Acceptance of Terms</h2>
                <p>By accessing or using cred.blue ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.</p>
            </div>

            <div class="section">
                <h2>2. Description of Service</h2>
                <p>cred.blue provides:</p>
                <ul>
                    <li>Analysis of public Bluesky user data</li>
                    <li>Credibility scoring based on public information</li>
                    <li>Enhanced tools for authenticated Bluesky users</li>
                    <li>Optional email updates and notifications</li>
                </ul>
            </div>

            <div class="section">
                <h2>3. User Responsibilities</h2>
                <p>You agree to:</p>
                <ul>
                    <li>Use the Service in compliance with all applicable laws</li>
                    <li>Not attempt to manipulate or game the credibility scoring system</li>
                    <li>Not use the Service to harass, abuse, or harm others</li>
                    <li>Not attempt to access non-public data or bypass security measures</li>
                </ul>
            </div>

            <div class="section">
                <h2>4. Intellectual Property</h2>
                <ul>
                    <li>All content, features, and functionality are owned by cred.blue</li>
                    <li>The Service's credibility scoring system and algorithms are proprietary</li>
                    <li>Users may not reproduce, distribute, or create derivative works without permission</li>
                </ul>
            </div>

            <div class="section">
                <h2>5. Account Terms</h2>
                <ul>
                    <li>Authentication is handled through Bluesky's system</li>
                    <li>You are responsible for maintaining the security of your Bluesky credentials</li>
                    <li>We reserve the right to terminate access to enhanced features at our discretion</li>
                </ul>
            </div>

            <div class="section">
                <h2>6. Disclaimer of Warranties</h2>
                <ul>
                    <li>The Service is provided "as is" without warranties of any kind</li>
                    <li>We do not guarantee the accuracy of credibility scores or analytics</li>
                    <li>We are not responsible for the accuracy of public Bluesky data</li>
                </ul>
            </div>

            <div class="section">
                <h2>7. Limitation of Liability</h2>
                <p>We shall not be liable for:</p>
                <ul>
                    <li>Any indirect, incidental, or consequential damages</li>
                    <li>Decisions made based on credibility scores or analytics</li>
                    <li>Temporary service interruptions or data unavailability</li>
                </ul>
            </div>

            <div class="section">
                <h2>8. Modifications to Service</h2>
                <p>We reserve the right to:</p>
                <ul>
                    <li>Modify or discontinue any part of the Service</li>
                    <li>Update these Terms at any time</li>
                    <li>Change our scoring algorithms and methodologies</li>
                </ul>
            </div>

            <div class="section">
                <h2>9. Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of [Jurisdiction], without regard to its conflict of law provisions.</p>
            </div>

            <div class="contact">
                <h2>10. Contact Information</h2>
                <p>For questions about these Terms, please contact us at terms @ cred.blue</p>
            </div>
      </div>
      </main>
    </>
  );
};

export default Terms;

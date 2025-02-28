// src/components/common/RelatedPagesNav.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './RelatedPagesNav.css';

const RelatedPagesNav = ({ currentPage }) => {
  // Define the pages and their properties
  const pages = [
    {
      id: "about",
      path: "/about",
      title: "About cred.blue",
      description: "Learn what cred.blue is and why it was created"
    },
    {
      id: "methodology",
      path: "/methodology",
      title: "Scoring Methodology",
      description: "Understand how the scoring algorithm works"
    },
    {
      id: "definitions",
      path: "/definitions",
      title: "Definitions & Terms",
      description: "Explore key terms and social status details"
    }
  ];

  // Filter out the current page
  const otherPages = pages.filter(page => page.id !== currentPage);

  return (
    <div className="related-pages-container">
      <h3 className="related-pages-title">Related Pages</h3>
      <div className="related-pages-links">
        {otherPages.map(page => (
          <Link key={page.id} to={page.path} className="related-page-link">
            <div className="related-page-content">
              <h4>{page.title}</h4>
              <p>{page.description}</p>
            </div>
            <span className="related-page-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedPagesNav;
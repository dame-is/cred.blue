import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const navigate = useNavigate();

  // Filter out the current page
  const otherPages = pages.filter(page => page.id !== currentPage);

  // Function to handle navigation and scroll to top
  const handleNavigation = (path, e) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <div className="related-pages-container">
      <h3 className="related-pages-title">Related Pages</h3>
      <div className="related-pages-links">
        {otherPages.map(page => (
          <a 
            key={page.id}
            href={page.path}
            className="related-page-link"
            onClick={(e) => handleNavigation(page.path, e)}
          >
            <div className="related-page-content">
              <h4>{page.title}</h4>
              <p>{page.description}</p>
            </div>
            <span className="related-page-arrow">→</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default RelatedPagesNav;
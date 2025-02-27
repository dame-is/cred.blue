import React, { useState, useEffect } from 'react';
import { submitResource, getCategories } from '../services/supabase';

const ResourceSubmission = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    domain: '',
    category_id: '',
    subcategory_id: '',
    submitter_email: '',
    submitter_handle: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Fetch categories
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
    
    fetchCategories();
  }, []);
  
  // Auto-extract domain from URL
  useEffect(() => {
    if (formData.url) {
      try {
        const url = new URL(formData.url);
        setFormData(prev => ({ ...prev, domain: url.hostname }));
      } catch (error) {
        // Not a valid URL yet, ignore
      }
    }
  }, [formData.url]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // When category changes, fetch relevant subcategories
    if (name === 'category_id') {
      setSelectedCategory(value);
      // You would add API call to get subcategories here
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitResource(formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        name: '',
        url: '',
        description: '',
        domain: '',
        category_id: '',
        subcategory_id: '',
        submitter_email: '',
        submitter_handle: ''
      });
    } catch (error) {
      setError('There was an error submitting your resource. Please try again.');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="submission-form-container">
      <h2>Submit a Resource</h2>
      <p>Know a great tool for Bluesky? Submit it here for consideration.</p>
      
      {submitSuccess ? (
        <div className="success-message">
          <h3>Thank you for your submission!</h3>
          <p>Your resource has been submitted for review. We'll consider adding it to our directory.</p>
          <button onClick={() => setSubmitSuccess(false)}>Submit Another Resource</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="name">Resource Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="url">URL*</label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description*</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category_id">Category*</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.emoji} {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Add subcategory dropdown */}
          
          <div className="form-group">
            <label htmlFor="submitter_email">Your Email (optional)</label>
            <input
              type="email"
              id="submitter_email"
              name="submitter_email"
              value={formData.submitter_email}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="submitter_handle">Your Bluesky Handle (optional)</label>
            <input
              type="text"
              id="submitter_handle"
              name="submitter_handle"
              value={formData.submitter_handle}
              onChange={handleInputChange}
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Resource'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResourceSubmission;
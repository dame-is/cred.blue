// src/components/Admin/ResourcesManager.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import './ResourcesManager.css';

const ResourcesManager = () => {
  const [activeTab, setActiveTab] = useState('resources');
  const [resources, setResources] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For editing a resource
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    domain: '',
    category_id: '',
    subcategory: '',
    quality: 3,
    featured: false
  });
  
  // For filtering and sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab, sortField, sortDirection]);
  
  // Load categories
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('position');
          
        if (error) throw error;
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please refresh the page.');
      }
    }
    
    fetchCategories();
  }, []);

  // Fetch resources or submissions based on active tab
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'resources') {
        const { data, error } = await supabase
          .from('resources')
          .select(`
            *,
            category:categories(id, name, emoji)
          `)
          .order(sortField, { ascending: sortDirection === 'asc' });
          
        if (error) throw error;
        setResources(data || []);
      } else if (activeTab === 'submissions') {
        const { data, error } = await supabase
          .from('resource_submissions')
          .select(`
            *,
            category:categories(id, name, emoji)
          `)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setSubmissions(data || []);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      setError(`Failed to load ${activeTab}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approving a submission
  const handleApproveSubmission = async (submission) => {
    try {
      // First, insert the submission as a new resource
      const { error: insertError } = await supabase
        .from('resources')
        .insert([{
          name: submission.name,
          url: submission.url,
          description: submission.description,
          domain: submission.domain,
          category_id: submission.category_id,
          subcategory: submission.subcategory,
          quality: 3, // Default quality
          featured: false,
          is_new: true,
          created_at: new Date().toISOString()
        }]);
        
      if (insertError) throw insertError;
      
      // Then update the submission status to approved
      const { error: updateError } = await supabase
        .from('resource_submissions')
        .update({ status: 'approved' })
        .eq('id', submission.id);
        
      if (updateError) throw updateError;
      
      // Refresh submissions list
      fetchData();
      
    } catch (error) {
      console.error('Error approving submission:', error);
      setError('Failed to approve submission. Please try again.');
    }
  };

  // Handle rejecting a submission
  const handleRejectSubmission = async (submissionId) => {
    try {
      const { error } = await supabase
        .from('resource_submissions')
        .update({ status: 'rejected' })
        .eq('id', submissionId);
        
      if (error) throw error;
      
      // Refresh submissions list
      fetchData();
      
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setError('Failed to reject submission. Please try again.');
    }
  };

  // Handle editing a resource
  const handleEditResource = (resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      url: resource.url,
      description: resource.description,
      domain: resource.domain,
      category_id: resource.category_id,
      subcategory: resource.subcategory || '',
      quality: resource.quality,
      featured: resource.featured
    });
  };

  // Handle saving edited resource
  const handleSaveResource = async (e) => {
    e.preventDefault();
    
    try {
      if (editingResource.id) {
        // Update existing resource
        const { error } = await supabase
          .from('resources')
          .update({
            name: formData.name,
            url: formData.url,
            description: formData.description,
            domain: formData.domain,
            category_id: formData.category_id,
            subcategory: formData.subcategory || null,
            quality: formData.quality,
            featured: formData.featured,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingResource.id);
          
        if (error) throw error;
      } else {
        // Create new resource
        const { error } = await supabase
          .from('resources')
          .insert([{
            name: formData.name,
            url: formData.url,
            description: formData.description,
            domain: formData.domain,
            category_id: formData.category_id,
            subcategory: formData.subcategory || null,
            quality: formData.quality,
            featured: formData.featured,
            is_new: true,
            created_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
      }
      
      // Reset form and refresh data
      setEditingResource(null);
      fetchData();
      
    } catch (error) {
      console.error('Error saving resource:', error);
      setError('Failed to save resource. Please try again.');
    }
  };

  // Handle deleting a resource
  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);
        
      if (error) throw error;
      
      // Refresh resources list
      fetchData();
      
    } catch (error) {
      console.error('Error deleting resource:', error);
      setError('Failed to delete resource. Please try again.');
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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

  // Filter resources based on search term and category
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.domain.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === '' || 
      resource.category_id === categoryFilter;
      
    return matchesSearch && matchesCategory;
  });

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Render quality stars
  const renderQualityStars = (quality) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`quality-star ${i <= quality ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="admin-resources-manager">
      <h1>Resources Manager</h1>
      
      {error && <div className="admin-error-alert">{error}</div>}
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'resources' ? 'active' : ''}
          onClick={() => setActiveTab('resources')}
        >
          Resources
        </button>
        <button 
          className={activeTab === 'submissions' ? 'active' : ''}
          onClick={() => setActiveTab('submissions')}
        >
          Submissions {submissions.length > 0 && <span className="badge">{submissions.length}</span>}
        </button>
      </div>
      
      {activeTab === 'resources' && (
        <div className="resources-management">
          <div className="admin-toolbar">
            <div className="admin-search">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="admin-filter">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button 
              className="admin-add-button"
              onClick={() => {
                setEditingResource({});
                setFormData({
                  name: '',
                  url: '',
                  description: '',
                  domain: '',
                  category_id: '',
                  subcategory: '',
                  quality: 3,
                  featured: false
                });
              }}
            >
              Add New Resource
            </button>
          </div>
          
          {isLoading ? (
            <div className="admin-loading">Loading resources...</div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSortChange('name')} className="sortable">
                      Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Domain</th>
                    <th onClick={() => handleSortChange('category_id')} className="sortable">
                      Category {sortField === 'category_id' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSortChange('quality')} className="sortable">
                      Quality {sortField === 'quality' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th onClick={() => handleSortChange('created_at')} className="sortable">
                      Added {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map(resource => (
                    <tr key={resource.id} className={resource.is_new ? 'new-resource' : ''}>
                      <td>{resource.name}</td>
                      <td>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {resource.domain}
                        </a>
                      </td>
                      <td>
                        {resource.category?.emoji} {resource.category?.name}
                        {resource.subcategory && <span className="subcategory"> / {resource.subcategory}</span>}
                      </td>
                      <td>{renderQualityStars(resource.quality)}</td>
                      <td>{new Date(resource.created_at).toLocaleDateString()}</td>
                      <td>{resource.featured ? '✅' : '❌'}</td>
                      <td className="action-buttons">
                        <button className="edit-button" onClick={() => handleEditResource(resource)}>Edit</button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteResource(resource.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredResources.length === 0 && (
                <div className="admin-no-results">No resources found matching your criteria.</div>
              )}
            </>
          )}
        </div>
      )}
      
      {activeTab === 'submissions' && (
        <div className="submissions-management">
          <h2>Pending Submissions</h2>
          
          {isLoading ? (
            <div className="admin-loading">Loading submissions...</div>
          ) : (
            <>
              {submissions.length === 0 ? (
                <div className="admin-no-results">No pending submissions.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>URL</th>
                      <th>Category</th>
                      <th>Submitted By</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map(submission => (
                      <tr key={submission.id}>
                        <td>{submission.name}</td>
                        <td>
                          <a href={submission.url} target="_blank" rel="noopener noreferrer">
                            {submission.domain}
                          </a>
                        </td>
                        <td>
                          {submission.category?.emoji} {submission.category?.name}
                          {submission.subcategory && <span className="subcategory"> / {submission.subcategory}</span>}
                        </td>
                        <td>
                          {submission.submitter_handle || submission.submitter_email || 'Anonymous'}
                        </td>
                        <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                        <td className="action-buttons">
                          <button 
                            className="approve-button"
                            onClick={() => handleApproveSubmission(submission)}
                          >
                            Approve
                          </button>
                          <button 
                            className="reject-button"
                            onClick={() => handleRejectSubmission(submission.id)}
                          >
                            Reject
                          </button>
                          <button 
                            className="edit-approve-button"
                            onClick={() => {
                              setEditingResource({
                                ...submission,
                                isSubmission: true
                              });
                              setFormData({
                                name: submission.name,
                                url: submission.url,
                                description: submission.description,
                                domain: submission.domain,
                                category_id: submission.category_id,
                                subcategory: submission.subcategory || '',
                                quality: 3,
                                featured: false
                              });
                            }}
                          >
                            Edit & Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      )}
      
      {/* Edit/Create Resource Modal */}
      {editingResource && (
        <div className="admin-modal">
          <div className="admin-modal-content">
            <h2>{editingResource.id ? 'Edit Resource' : 'Add New Resource'}</h2>
            
            <form onSubmit={handleSaveResource}>
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
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="domain">Domain</label>
                <input
                  type="text"
                  id="domain"
                  name="domain"
                  value={formData.domain}
                  onChange={handleInputChange}
                  disabled
                />
                <small>This field is auto-filled from the URL.</small>
              </div>
              
              <div className="form-row">
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
                
                <div className="form-group">
                  <label htmlFor="subcategory">Subcategory</label>
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    placeholder="e.g., Feed Tools"
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="quality">Quality Rating*</label>
                  <select
                    id="quality"
                    name="quality"
                    value={formData.quality}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Very Good</option>
                    <option value="3">3 - Good</option>
                    <option value="2">2 - Fair</option>
                    <option value="1">1 - Poor</option>
                  </select>
                </div>
                
                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                    />
                    Featured Resource
                  </label>
                </div>
              </div>
              
              {editingResource.isSubmission && (
                <div className="form-group">
                  <p className="submission-info">
                    <strong>Submitted by:</strong> {editingResource.submitter_handle || editingResource.submitter_email || 'Anonymous'}<br />
                    <strong>Submitted on:</strong> {new Date(editingResource.created_at).toLocaleString()}
                  </p>
                </div>
              )}
              
              <div className="form-buttons">
                <button type="submit" className="save-button">
                  {editingResource.isSubmission ? 'Approve with Changes' : 'Save Resource'}
                </button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setEditingResource(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesManager;
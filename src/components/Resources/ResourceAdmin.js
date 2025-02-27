import React, { useState, useEffect } from 'react';
import { 
  getResources, 
  getPendingSubmissions, 
  approveSubmission 
} from '../lib/supabase';

const ResourceAdmin = () => {
  const [resources, setResources] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [activeTab, setActiveTab] = useState('resources');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, [activeTab]);
  
  async function fetchData() {
    setIsLoading(true);
    try {
      if (activeTab === 'resources') {
        const data = await getResources();
        setResources(data);
      } else if (activeTab === 'submissions') {
        const data = await getPendingSubmissions();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleApproveSubmission = async (id) => {
    try {
      await approveSubmission(id);
      // Refresh the submissions list
      const data = await getPendingSubmissions();
      setSubmissions(data);
    } catch (error) {
      console.error('Error approving submission:', error);
    }
  };
  
  // More admin functions here...
  
  return (
    <div className="admin-dashboard">
      <h1>Resource Admin</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'resources' ? 'active' : ''}
          onClick={() => setActiveTab('resources')}
        >
          Manage Resources
        </button>
        <button 
          className={activeTab === 'submissions' ? 'active' : ''}
          onClick={() => setActiveTab('submissions')}
        >
          Review Submissions
        </button>
      </div>
      
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-content">
          {activeTab === 'resources' && (
            <div className="resources-management">
              <h2>Resources ({resources.length})</h2>
              {/* Resource management table */}
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Quality</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map(resource => (
                    <tr key={resource.id}>
                      <td>{resource.name}</td>
                      <td>{resource.category.name}</td>
                      <td>{resource.quality}</td>
                      <td>{resource.featured ? 'Yes' : 'No'}</td>
                      <td>
                        <button>Edit</button>
                        <button>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'submissions' && (
            <div className="submissions-review">
              <h2>Pending Submissions ({submissions.length})</h2>
              {/* Submission review table */}
              {submissions.length === 0 ? (
                <p>No pending submissions.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>URL</th>
                      <th>Category</th>
                      <th>Submitted</th>
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
                        <td>{submission.category.name}</td>
                        <td>{new Date(submission.created_at).toLocaleDateString()}</td>
                        <td>
                          <button onClick={() => handleApproveSubmission(submission.id)}>
                            Approve
                          </button>
                          <button>Reject</button>
                          <button>View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceAdmin;
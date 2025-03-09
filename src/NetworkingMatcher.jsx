import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// Your Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbx2h4B6jNF3tQtH82Rmc-IM6vQonSw_SJc0KXjw9Tpj_YQ_rVKAT93PgBL28UMGo5Ad/exec';

const RetentionMessage = () => (
  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
    <p className="text-sm text-yellow-800">
      <strong>Privacy Notice:</strong> Your data will only be kept for the duration of SXSW 2025 and deleted afterward. 
      We do not share your information with third parties.
    </p>
  </div>
);

const AskSection = ({ index, data, onChange, onRemove, categories, isRequired }) => {
  return (
    <div className={`${index > 0 ? 'mt-5' : ''} ${index < 2 ? 'pb-5 border-b' : ''}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">
          Ask #{index + 1} {isRequired && <span className="text-red-500">*</span>}
        </h3>
        {!isRequired && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name={`category`}
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
            required={isRequired}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Details</label>
          <textarea
            name={`details`}
            value={data.details}
            onChange={(e) => onChange({ ...data, details: e.target.value })}
            required={isRequired}
            placeholder="Describe specifically what you're looking for..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            rows="2"
          />
        </div>
      </div>
    </div>
  );
};

const OfferSection = ({ index, data, onChange, onRemove, categories, isRequired }) => {
  return (
    <div className={`${index > 0 ? 'mt-5' : ''} ${index < 2 ? 'pb-5 border-b' : ''}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">
          Offer #{index + 1} {isRequired && <span className="text-red-500">*</span>}
        </h3>
        {!isRequired && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name={`category`}
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
            required={isRequired}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Details</label>
          <textarea
            name={`details`}
            value={data.details}
            onChange={(e) => onChange({ ...data, details: e.target.value })}
            required={isRequired}
            placeholder="Describe specifically what you can offer..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            rows="2"
          />
        </div>
      </div>
    </div>
  );
};

// New component for editing submissions
const EditSubmissionForm = ({ userSubmission, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: userSubmission.Name || '',
    email: userSubmission.Email || '',
    linkedin: userSubmission.LinkedIn || '',
    asks: userSubmission.asks || [{ category: '', details: '' }],
    offers: userSubmission.offers || [{ category: '', details: '' }]
  });

  // Ensure at least one ask and offer exists
  useEffect(() => {
    if (!formData.asks || formData.asks.length === 0) {
      setFormData(prev => ({...prev, asks: [{ category: '', details: '' }]}));
    }
    
    if (!formData.offers || formData.offers.length === 0) {
      setFormData(prev => ({...prev, offers: [{ category: '', details: '' }]}));
    }
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle ask update
  const handleAskChange = (index, updatedAsk) => {
    const newAsks = [...formData.asks];
    newAsks[index] = updatedAsk;
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Handle offer update
  const handleOfferChange = (index, updatedOffer) => {
    const newOffers = [...formData.offers];
    newOffers[index] = updatedOffer;
    setFormData({
      ...formData,
      offers: newOffers
    });
  };

  // Add a new ask
  const addAsk = () => {
    if (formData.asks.length < 3) {
      setFormData({
        ...formData,
        asks: [...formData.asks, { category: '', details: '' }]
      });
    }
  };

  // Add a new offer
  const addOffer = () => {
    if (formData.offers.length < 3) {
      setFormData({
        ...formData,
        offers: [...formData.offers, { category: '', details: '' }]
      });
    }
  };

  // Remove an ask
  const removeAsk = (index) => {
    const newAsks = formData.asks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Remove an offer
  const removeOffer = (index) => {
    const newOffers = formData.offers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      offers: newOffers
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Edit Your Submission</h2>
        <button 
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
          </div>
        </div>
        
        {/* What You're Looking For */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-red-600">What You're Looking For <span className="text-gray-500 text-sm font-normal">(up to 3)</span></h2>
          
          {/* Render Ask sections */}
          {formData.asks.map((ask, index) => (
            <AskSection
              key={`ask-${index}`}
              index={index}
              data={ask}
              onChange={(updatedAsk) => handleAskChange(index, updatedAsk)}
              onRemove={() => removeAsk(index)}
              categories={categories}
              isRequired={index === 0}
            />
          ))}
          
          {/* Add Ask button */}
          {formData.asks.length < 3 && (
            <button
              type="button"
              onClick={addAsk}
              className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Ask {formData.asks.length + 1} (Optional)
            </button>
          )}
        </div>
        
        {/* What You Can Offer */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-green-600">What You Can Offer <span className="text-gray-500 text-sm font-normal">(up to 3)</span></h2>
          
          {/* Render Offer sections */}
          {formData.offers.map((offer, index) => (
            <OfferSection
              key={`offer-${index}`}
              index={index}
              data={offer}
              onChange={(updatedOffer) => handleOfferChange(index, updatedOffer)}
              onRemove={() => removeOffer(index)}
              categories={categories}
              isRequired={index === 0}
            />
          ))}
          
          {/* Add Offer button */}
          {formData.offers.length < 3 && (
            <button
              type="button"
              onClick={addOffer}
              className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Offer {formData.offers.length + 1} (Optional)
            </button>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

// PDF Printable component for matches
const PrintableMatches = React.forwardRef(({ userInfo, matches }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">SXSW 2025 - Build Your Village</h1>
        <h2 className="text-xl mt-2">Matches for {userInfo.name}</h2>
        <p className="text-sm text-gray-500 mt-1">{userInfo.email}</p>
      </div>
      
      {/* User's own submission */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">Your Submission</h2>
        
        {userInfo.asks && userInfo.asks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-blue-700">What You're Looking For:</h3>
            <div className="mt-2 space-y-2">
              {userInfo.asks.map((ask, index) => (
                <div key={`ask-${index}`} className="bg-white p-2 rounded border border-blue-100 text-sm">
                  <span className="font-medium">{ask.category}:</span> {ask.details}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {userInfo.offers && userInfo.offers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-blue-700">What You Can Offer:</h3>
            <div className="mt-2 space-y-2">
              {userInfo.offers.map((offer, index) => (
                <div key={`offer-${index}`} className="bg-white p-2 rounded border border-blue-100 text-sm">
                  <span className="font-medium">{offer.category}:</span> {offer.details}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Matches */}
      <h2 className="text-xl font-bold mt-8 mb-4 page-break-before">Your Matches ({matches.length})</h2>
      
      {matches.length === 0 ? (
        <p>No matches found yet. Check back later!</p>
      ) : (
        <div className="space-y-8">
          {matches.map((match, index) => (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-200 mb-4 overflow-hidden page-break-inside-avoid">
              {/* Header */}
              <div className="p-4 border-b">
                <h3 className="font-bold text-lg">{match.Name}</h3>
                <p className="text-sm text-gray-500">{match.Email}</p>
                {match.LinkedIn && (
                  <p className="text-sm break-words">
                    LinkedIn: {match.LinkedIn}
                  </p>
                )}
                <div className="mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {match.matchQuality === 'strong' ? 'Strong Match' : 'Good Match'}
                </div>
              </div>
              
              {/* Your Ask Matches Their Offer */}
              {match.askMatches.map((askMatch, idx) => (
                <div key={`ask-match-${idx}`} className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Panel - Your Ask */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">You're Looking For</h4>
                      <p className="font-medium">{askMatch.userAskCategory}</p>
                      <p className="text-sm mt-1">{askMatch.userAskDetails}</p>
                    </div>
                    
                    {/* Right Panel - Their Offer */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">They're Offering</h4>
                      <p className="font-medium">{askMatch.theirOfferCategory}</p>
                      <p className="text-sm mt-1">{askMatch.theirOfferDetails}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Their Ask Matches Your Offer */}
              {match.offerMatches.map((offerMatch, idx) => (
                <div key={`offer-match-${idx}`} className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Panel - Their Ask */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">They're Looking For</h4>
                      <p className="font-medium">{offerMatch.theirAskCategory}</p>
                      <p className="text-sm mt-1">{offerMatch.theirAskDetails}</p>
                    </div>
                    
                    {/* Right Panel - Your Offer */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">You're Offering</h4>
                      <p className="font-medium">{offerMatch.userOfferCategory}</p>
                      <p className="text-sm mt-1">{offerMatch.userOfferDetails}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Generated on {new Date().toLocaleDateString()} for SXSW 2025 - Build Your Village</p>
        <p className="mt-1">Your data will only be kept for the duration of SXSW 2025 and deleted afterward.</p>
      </div>
    </div>
  );
});

const NetworkingMatcher = () => {
  // Custom event theme colors
  const theme = {
    primary: '#FF5A5F', // SXSW-inspired reddish color
    secondary: '#00C4CC',
    background: '#F7F7F7',
    text: '#484848',
  };

  // Categories for dropdowns
  const categories = [
    "Mentorship",
    "Business Development",
    "Funding",
    "VC Connections",
    "Angel Investors",
    "Software Development",
    "Data Science",
    "UI/UX",
    "Marketing",
    "Growth Hacking",
    "Content Strategy",
    "Social Media",
    "SEO",
    "Graphic Design",
    "Product Design",
    "Legal Advice",
    "IP Protection",
    "Contract Review",
    "Partnerships",
    "Co-Founder",
    "Career Advice",
    "Job Opportunities",
    "Industry Connections",
    "Speaking Opportunities",
    "Media Exposure",
    "Podcast Guest",
    "Customer Introductions",
    "User Testing",
    "Product Feedback",
    "Operations",
    "HR/Recruiting",
    "Finance",
    "Sales Strategy",
    "Product",
    "Brainstorming",
    "Pitch Feedback",
    "Startup Strategy",
    "Industry Research",
    "AI/Machine Learning",
    "Blockchain/Web3",
    "Community Building",
    "Event Planning",
    "Public Relations",
    "Fundraising Strategy",
    "International Expansion",
    "Creative Direction",
    "Video Production",
    "Music Industry",
    "Gaming Industry",
    "Film Industry",
    "Sustainability",
    "Diversity & Inclusion",
    "Nonprofit Strategy", 
    "Government Relations",
    "Other"
  ];

  const [userSubmissionInfo, setUserSubmissionInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    asks: [
      { category: '', details: '' }
    ],
    offers: [
      { category: '', details: '' }
    ]
  });
  const [submissions, setSubmissions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const [view, setView] = useState('form'); // 'form', 'thanks', 'matches', 'edit'
  const printRef = useRef();

  // Setup PDF printing capability
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `SXSW_Matches_${userSubmissionInfo?.email || 'user'}`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setLoading(true);
        resolve();
      });
    },
    onAfterPrint: () => {
      setLoading(false);
    }
  });

  // Load data from Google Sheets API and feedback data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // The API returns both records and feedback
        setSubmissions(data.records || data);
        
        // Set feedback if available
        if (data.feedback) {
          setFeedbackData(data.feedback);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Could not load existing data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Handle basic form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle ask update
  const handleAskChange = (index, updatedAsk) => {
    const newAsks = [...formData.asks];
    newAsks[index] = updatedAsk;
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Handle offer update
  const handleOfferChange = (index, updatedOffer) => {
    const newOffers = [...formData.offers];
    newOffers[index] = updatedOffer;
    setFormData({
      ...formData,
      offers: newOffers
    });
  };

  // Add a new ask
  const addAsk = () => {
    if (formData.asks.length < 3) {
      setFormData({
        ...formData,
        asks: [...formData.asks, { category: '', details: '' }]
      });
    }
  };

  // Add a new offer
  const addOffer = () => {
    if (formData.offers.length < 3) {
      setFormData({
        ...formData,
        offers: [...formData.offers, { category: '', details: '' }]
      });
    }
  };

  // Remove an ask
  const removeAsk = (index) => {
    const newAsks = formData.asks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Remove an offer
  const removeOffer = (index) => {
    const newOffers = formData.offers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      offers: newOffers
    });
  };
  
  // Handle match feedback (relevant/irrelevant)
  const handleMatchFeedback = async (matchEmail, feedbackType) => {
    // Get current user email
    const currentUserEmail = formData.email || 
      (userSubmissionInfo ? userSubmissionInfo.email : '');
      
    if (!currentUserEmail) {
      alert("Please enter your email to provide feedback");
      return;
    }
    
    try {
      setLoading(true);
      
      // Send feedback to Google Sheets
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'feedback',
          userEmail: currentUserEmail,
          matchEmail: matchEmail,
          feedbackType: feedbackType
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        const feedbackKey = `${currentUserEmail}-${matchEmail}`;
        const newFeedback = {
          ...feedbackData,
          [feedbackKey]: feedbackType
        };
        setFeedbackData(newFeedback);
        
        // Show acknowledgment
        alert(`Thank you for your feedback! This will improve future matches.`);
        
        // Refresh matches if in matches view
        if (view === 'matches') {
          const userSubmission = submissions.find(
            sub => sub.Email.toLowerCase() === currentUserEmail.toLowerCase()
          );
          
          if (userSubmission) {
            findMatches(userSubmission, submissions);
          }
        }
      } else {
        alert("Could not save your feedback. Please try again later.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert("Error connecting to the server. Please try again later.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate that required fields are filled
      if (!formData.asks[0].category || !formData.asks[0].details ||
          !formData.offers[0].category || !formData.offers[0].details) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      
      // Send data to Google Sheets
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          linkedin: formData.linkedin,
          asks: formData.asks,
          offers: formData.offers
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add submission to local state for immediate UI update
        const newSubmission = {
          Name: formData.name,
          Email: formData.email,
          LinkedIn: formData.linkedin,
          asks: formData.asks,
          offers: formData.offers,
          Timestamp: new Date().toString()
        };
        
        const newSubmissions = [...submissions, newSubmission];
        setSubmissions(newSubmissions);
        
        // Store user's submission info
        setUserSubmissionInfo({
          name: formData.name,
          email: formData.email,
          asks: formData.asks,
          offers: formData.offers
        });
        
        // Find matches
        findMatches(newSubmission, newSubmissions);
        
        // Show thank you screen
        setView('thanks');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          linkedin: '',
          asks: [{ category: '', details: '' }],
          offers: [{ category: '', details: '' }]
        });
      } else {
        setError("Error saving your information. Please try again.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError("Error connecting to the server. Please try again later.");
      setLoading(false);
    }
  };

  // Handle updating an existing submission
  const handleUpdateSubmission = async (updatedData) => {
    try {
      setLoading(true);
      
      // Validate that required fields are filled
      if (!updatedData.asks[
          return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md" style={{backgroundColor: theme.background, color: theme.text}}>
      {/* Hidden printable component for PDF download */}
      <div style={{ display: 'none' }}>
        <PrintableMatches 
          ref={printRef} 
          userInfo={userSubmissionInfo || { name: '', email: '', asks: [], offers: [] }}
          matches={matches} 
        />
      </div>
      
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded">
          <p>{error}</p>
          <button 
            className="text-sm underline mt-1"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      
      {view === 'form' && (
        <>
          <div className="mb-8 text-center">
            <svg width="280" height="150" viewBox="0 0 1200 700" className="mx-auto">
              <text x="50%" y="35%" dominantBaseline="middle" textAnchor="middle" style={{fontSize: '180px', fontFamily: 'Arial Black, sans-serif', fontWeight: 'bold'}}>SXSW</text>
              <text x="82%" y="35%" dominantBaseline="middle" textAnchor="middle" style={{fontSize: '120px', fontFamily: 'Arial Black, sans-serif', fontWeight: 'bold'}}>↱</text>
              <text x="50%" y="70%" dominantBaseline="middle" textAnchor="middle" style={{fontSize: '200px', fontFamily: 'Arial Black, sans-serif', fontWeight: 'bold'}}>2025</text>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-6 text-center">[SXSW] Not-Your-Regular-Meetup : Build Your Village Attendee Match</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional, but recommended for easier connections</p>
                </div>
              </div>
            </div>
            
            {/* What You're Looking For */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-red-600">What You're Looking For <span className="text-gray-500 text-sm font-normal">(up to 3)</span></h2>
              
              {/* Render Ask sections */}
              {formData.asks.map((ask, index) => (
                <AskSection
                  key={`ask-${index}`}
                  index={index}
                  data={ask}
                  onChange={(updatedAsk) => handleAskChange(index, updatedAsk)}
                  onRemove={() => removeAsk(index)}
                  categories={categories}
                  isRequired={index === 0}
                />
              ))}
              
              {/* Add Ask button */}
              {formData.asks.length < 3 && (
                <button
                  type="button"
                  onClick={addAsk}
                  className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Ask {formData.asks.length + 1} (Optional)
                </button>
              )}
            </div>
            
            {/* What You Can Offer */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 text-green-600">What You Can Offer <span className="text-gray-500 text-sm font-normal">(up to 3)</span></h2>
              
              {/* Render Offer sections */}
              {formData.offers.map((offer, index) => (
                <OfferSection
                  key={`offer-${index}`}
                  index={index}
                  data={offer}
                  onChange={(updatedOffer) => handleOfferChange(index, updatedOffer)}
                  onRemove={() => removeOffer(index)}
                  categories={categories}
                  isRequired={index === 0}
                />
              ))}
              
              {/* Add Offer button */}
              {formData.offers.length < 3 && (
                <button
                  type="button"
                  onClick={addOffer}
                  className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Offer {formData.offers.length + 1} (Optional)
                </button>
              )}
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              style={{backgroundColor: theme.primary, opacity: loading ? 0.7 : 1}}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            
            <RetentionMessage />
            
            {/* Check Matches */}
            <div className="mt-6 pt-6 border-t">
              <h2 className="text-lg font-medium mb-4 text-center">Already submitted? Check your matches!</h2>
              <div className="flex space-x-2">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
                />
                <button
                  type="button"
                  onClick={checkMatches}
                  disabled={loading}
                  className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                  style={{backgroundColor: theme.secondary, opacity: loading ? 0.7 : 1}}
                >
                  {loading ? '...' : 'Check'}
                </button>
              </div>
            </div>
          </form>
        </>
      )}
                  import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

// Your Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbx2h4B6jNF3tQtH82Rmc-IM6vQonSw_SJc0KXjw9Tpj_YQ_rVKAT93PgBL28UMGo5Ad/exec';

const RetentionMessage = () => (
  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
    <p className="text-sm text-yellow-800">
      <strong>Privacy Notice:</strong> Your data will only be kept for the duration of SXSW 2025 and deleted afterward. 
      We do not share your information with third parties.
    </p>
  </div>
);

const AskSection = ({ index, data, onChange, onRemove, categories, isRequired }) => {
  return (
    <div className={`${index > 0 ? 'mt-5' : ''} ${index < 2 ? 'pb-5 border-b' : ''}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">
          Ask #{index + 1} {isRequired && <span className="text-red-500">*</span>}
        </h3>
        {!isRequired && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name={`category`}
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
            required={isRequired}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Details</label>
          <textarea
            name={`details`}
            value={data.details}
            onChange={(e) => onChange({ ...data, details: e.target.value })}
            required={isRequired}
            placeholder="Describe specifically what you're looking for..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            rows="2"
          />
        </div>
      </div>
    </div>
  );
};

const OfferSection = ({ index, data, onChange, onRemove, categories, isRequired }) => {
  return (
    <div className={`${index > 0 ? 'mt-5' : ''} ${index < 2 ? 'pb-5 border-b' : ''}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">
          Offer #{index + 1} {isRequired && <span className="text-red-500">*</span>}
        </h3>
        {!isRequired && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-gray-500 hover:text-red-500"
          >
            Remove
          </button>
        )}
      </div>
      
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name={`category`}
            value={data.category}
            onChange={(e) => onChange({ ...data, category: e.target.value })}
            required={isRequired}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Details</label>
          <textarea
            name={`details`}
            value={data.details}
            onChange={(e) => onChange({ ...data, details: e.target.value })}
            required={isRequired}
            placeholder="Describe specifically what you can offer..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
            rows="2"
          />
        </div>
      </div>
    </div>
  );
};

// New component for editing submissions
const EditSubmissionForm = ({ userSubmission, categories, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: userSubmission.Name || '',
    email: userSubmission.Email || '',
    linkedin: userSubmission.LinkedIn || '',
    asks: userSubmission.asks || [{ category: '', details: '' }],
    offers: userSubmission.offers || [{ category: '', details: '' }]
  });

  // Ensure at least one ask and offer exists
  useEffect(() => {
    if (!formData.asks || formData.asks.length === 0) {
      setFormData(prev => ({...prev, asks: [{ category: '', details: '' }]}));
    }
    
    if (!formData.offers || formData.offers.length === 0) {
      setFormData(prev => ({...prev, offers: [{ category: '', details: '' }]}));
    }
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle ask update
  const handleAskChange = (index, updatedAsk) => {
    const newAsks = [...formData.asks];
    newAsks[index] = updatedAsk;
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Handle offer update
  const handleOfferChange = (index, updatedOffer) => {
    const newOffers = [...formData.offers];
    newOffers[index] = updatedOffer;
    setFormData({
      ...formData,
      offers: newOffers
    });
  };

  // Add a new ask
  const addAsk = () => {
    if (formData.asks.length < 3) {
      setFormData({
        ...formData,
        asks: [...formData.asks, { category: '', details: '' }]
      });
    }
  };

  // Add a new offer
  const addOffer = () => {
    if (formData.offers.length < 3) {
      setFormData({
        ...formData,
        offers: [...formData.offers, { category: '', details: '' }]
      });
    }
  };

  // Remove an ask
  const removeAsk = (index) => {
    const newAsks = formData.asks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Remove an offer
  const removeOffer = (index) => {
    const newOffers = formData.offers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      offers: newOffers
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Edit Your Submission</h2>
        <button 
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourprofile"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              />
            </div>
          </div>
        </div>
        
        {/* What You're Looking For */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-red-600">What You're Looking For <span className="text-gray-500 text-sm font-normal">(up to 3)</span></h2>
          
          {/* Render Ask sections */}
          {formData.asks.map((ask, index) => (
            <AskSection
              key={`ask-${index}`}
              index={index}
              data={ask}
              onChange={(updatedAsk) => handleAskChange(index, updatedAsk)}
              onRemove={() => removeAsk(index)}
              categories={categories}
              isRequired={index === 0}
            />
          ))}
          
          {/* Add Ask button */}
          {formData.asks.length < 3 && (
            <button
              type="button"
              onClick={addAsk}
              className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Ask {formData.asks.length + 1} (Optional)
            </button>
          )}
        </div>
        
        {/* What You Can Offer */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 text-green-600">What You Can Offer <span className="text-gray-500 text-sm font-normal">(up to 3)</span></h2>
          
          {/* Render Offer sections */}
          {formData.offers.map((offer, index) => (
            <OfferSection
              key={`offer-${index}`}
              index={index}
              data={offer}
              onChange={(updatedOffer) => handleOfferChange(index, updatedOffer)}
              onRemove={() => removeOffer(index)}
              categories={categories}
              isRequired={index === 0}
            />
          ))}
          
          {/* Add Offer button */}
          {formData.offers.length < 3 && (
            <button
              type="button"
              onClick={addOffer}
              className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Offer {formData.offers.length + 1} (Optional)
            </button>
          )}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

// PDF Printable component for matches
const PrintableMatches = React.forwardRef(({ userInfo, matches }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">SXSW 2025 - Build Your Village</h1>
        <h2 className="text-xl mt-2">Matches for {userInfo.name}</h2>
        <p className="text-sm text-gray-500 mt-1">{userInfo.email}</p>
      </div>
      
      {/* User's own submission */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-3 text-blue-800">Your Submission</h2>
        
        {userInfo.asks && userInfo.asks.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-blue-700">What You're Looking For:</h3>
            <div className="mt-2 space-y-2">
              {userInfo.asks.map((ask, index) => (
                <div key={`ask-${index}`} className="bg-white p-2 rounded border border-blue-100 text-sm">
                  <span className="font-medium">{ask.category}:</span> {ask.details}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {userInfo.offers && userInfo.offers.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-blue-700">What You Can Offer:</h3>
            <div className="mt-2 space-y-2">
              {userInfo.offers.map((offer, index) => (
                <div key={`offer-${index}`} className="bg-white p-2 rounded border border-blue-100 text-sm">
                  <span className="font-medium">{offer.category}:</span> {offer.details}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Matches */}
      <h2 className="text-xl font-bold mt-8 mb-4 page-break-before">Your Matches ({matches.length})</h2>
      
      {matches.length === 0 ? (
        <p>No matches found yet. Check back later!</p>
      ) : (
        <div className="space-y-8">
          {matches.map((match, index) => (
            <div key={index} className="bg-white rounded-lg shadow border border-gray-200 mb-4 overflow-hidden page-break-inside-avoid">
              {/* Header */}
              <div className="p-4 border-b">
                <h3 className="font-bold text-lg">{match.Name}</h3>
                <p className="text-sm text-gray-500">{match.Email}</p>
                {match.LinkedIn && (
                  <p className="text-sm break-words">
                    LinkedIn: {match.LinkedIn}
                  </p>
                )}
                <div className="mt-2 inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {match.matchQuality === 'strong' ? 'Strong Match' : 'Good Match'}
                </div>
              </div>
              
              {/* Your Ask Matches Their Offer */}
              {match.askMatches.map((askMatch, idx) => (
                <div key={`ask-match-${idx}`} className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Panel - Your Ask */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">You're Looking For</h4>
                      <p className="font-medium">{askMatch.userAskCategory}</p>
                      <p className="text-sm mt-1">{askMatch.userAskDetails}</p>
                    </div>
                    
                    {/* Right Panel - Their Offer */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">They're Offering</h4>
                      <p className="font-medium">{askMatch.theirOfferCategory}</p>
                      <p className="text-sm mt-1">{askMatch.theirOfferDetails}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Their Ask Matches Your Offer */}
              {match.offerMatches.map((offerMatch, idx) => (
                <div key={`offer-match-${idx}`} className="p-4 border-b">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Panel - Their Ask */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">They're Looking For</h4>
                      <p className="font-medium">{offerMatch.theirAskCategory}</p>
                      <p className="text-sm mt-1">{offerMatch.theirAskDetails}</p>
                    </div>
                    
                    {/* Right Panel - Your Offer */}
                    <div>
                      <h4 className="text-sm uppercase text-gray-500 mb-2">You're Offering</h4>
                      <p className="font-medium">{offerMatch.userOfferCategory}</p>
                      <p className="text-sm mt-1">{offerMatch.userOfferDetails}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>Generated on {new Date().toLocaleDateString()} for SXSW 2025 - Build Your Village</p>
        <p className="mt-1">Your data will only be kept for the duration of SXSW 2025 and deleted afterward.</p>
      </div>
    </div>
  );
});

const NetworkingMatcher = () => {
  // Custom event theme colors
  const theme = {
    primary: '#FF5A5F', // SXSW-inspired reddish color
    secondary: '#00C4CC',
    background: '#F7F7F7',
    text: '#484848',
  };

  // Categories for dropdowns
  const categories = [
    "Mentorship",
    "Business Development",
    "Funding",
    "VC Connections",
    "Angel Investors",
    "Software Development",
    "Data Science",
    "UI/UX",
    "Marketing",
    "Growth Hacking",
    "Content Strategy",
    "Social Media",
    "SEO",
    "Graphic Design",
    "Product Design",
    "Legal Advice",
    "IP Protection",
    "Contract Review",
    "Partnerships",
    "Co-Founder",
    "Career Advice",
    "Job Opportunities",
    "Industry Connections",
    "Speaking Opportunities",
    "Media Exposure",
    "Podcast Guest",
    "Customer Introductions",
    "User Testing",
    "Product Feedback",
    "Operations",
    "HR/Recruiting",
    "Finance",
    "Sales Strategy",
    "Product",
    "Brainstorming",
    "Pitch Feedback",
    "Startup Strategy",
    "Industry Research",
    "AI/Machine Learning",
    "Blockchain/Web3",
    "Community Building",
    "Event Planning",
    "Public Relations",
    "Fundraising Strategy",
    "International Expansion",
    "Creative Direction",
    "Video Production",
    "Music Industry",
    "Gaming Industry",
    "Film Industry",
    "Sustainability",
    "Diversity & Inclusion",
    "Nonprofit Strategy", 
    "Government Relations",
    "Other"
  ];

  const [userSubmissionInfo, setUserSubmissionInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    asks: [
      { category: '', details: '' }
    ],
    offers: [
      { category: '', details: '' }
    ]
  });
  const [submissions, setSubmissions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedbackData, setFeedbackData] = useState({});
  const [view, setView] = useState('form'); // 'form', 'thanks', 'matches', 'edit'
  const printRef = useRef();

  // Setup PDF printing capability
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `SXSW_Matches_${userSubmissionInfo?.email || 'user'}`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        setLoading(true);
        resolve();
      });
    },
    onAfterPrint: () => {
      setLoading(false);
    }
  });

  // Load data from Google Sheets API and feedback data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        const data = await response.json();
        
        // The API returns both records and feedback
        setSubmissions(data.records || data);
        
        // Set feedback if available
        if (data.feedback) {
          setFeedbackData(data.feedback);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Could not load existing data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Handle basic form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle ask update
  const handleAskChange = (index, updatedAsk) => {
    const newAsks = [...formData.asks];
    newAsks[index] = updatedAsk;
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Handle offer update
  const handleOfferChange = (index, updatedOffer) => {
    const newOffers = [...formData.offers];
    newOffers[index] = updatedOffer;
    setFormData({
      ...formData,
      offers: newOffers
    });
  };

  // Add a new ask
  const addAsk = () => {
    if (formData.asks.length < 3) {
      setFormData({
        ...formData,
        asks: [...formData.asks, { category: '', details: '' }]
      });
    }
  };

  // Add a new offer
  const addOffer = () => {
    if (formData.offers.length < 3) {
      setFormData({
        ...formData,
        offers: [...formData.offers, { category: '', details: '' }]
      });
    }
  };

  // Remove an ask
  const removeAsk = (index) => {
    const newAsks = formData.asks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      asks: newAsks
    });
  };

  // Remove an offer
  const removeOffer = (index) => {
    const newOffers = formData.offers.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      offers: newOffers
    });
  };
  
  // Handle match feedback (relevant/irrelevant)
  const handleMatchFeedback = async (matchEmail, feedbackType) => {
    // Get current user email
    const currentUserEmail = formData.email || 
      (userSubmissionInfo ? userSubmissionInfo.email : '');
      
    if (!currentUserEmail) {
      alert("Please enter your email to provide feedback");
      return;
    }
    
    try {
      setLoading(true);
      
      // Send feedback to Google Sheets
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'feedback',
          userEmail: currentUserEmail,
          matchEmail: matchEmail,
          feedbackType: feedbackType
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        const feedbackKey = `${currentUserEmail}-${matchEmail}`;
        const newFeedback = {
          ...feedbackData,
          [feedbackKey]: feedbackType
        };
        setFeedbackData(newFeedback);
        
        // Show acknowledgment
        alert(`Thank you for your feedback! This will improve future matches.`);
        
        // Refresh matches if in matches view
        if (view === 'matches') {
          const userSubmission = submissions.find(
            sub => sub.Email.toLowerCase() === currentUserEmail.toLowerCase()
          );
          
          if (userSubmission) {
            findMatches(userSubmission, submissions);
          }
        }
      } else {
        alert("Could not save your feedback. Please try again later.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert("Error connecting to the server. Please try again later.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate that required fields are filled
      if (!formData.asks[0].category || !formData.asks[0].details ||
          !formData.offers[0].category || !formData.offers[0].details) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      
      // Send data to Google Sheets
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          linkedin: formData.linkedin,
          asks: formData.asks,
          offers: formData.offers
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add submission to local state for immediate UI update
        const newSubmission = {
          Name: formData.name,
          Email: formData.email,
          LinkedIn: formData.linkedin,
          asks: formData.asks,
          offers: formData.offers,
          Timestamp: new Date().toString()
        };
        
        const newSubmissions = [...submissions, newSubmission];
        setSubmissions(newSubmissions);
        
        // Store user's submission info
        setUserSubmissionInfo({
          name: formData.name,
          email: formData.email,
          asks: formData.asks,
          offers: formData.offers
        });
        
        // Find matches
        findMatches(newSubmission, newSubmissions);
        
        // Show thank you screen
        setView('thanks');
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          linkedin: '',
          asks: [{ category: '', details: '' }],
          offers: [{ category: '', details: '' }]
        });
      } else {
        setError("Error saving your information. Please try again.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError("Error connecting to the server. Please try again later.");
      setLoading(false);
    }
  };

  // Handle updating an existing submission
  const handleUpdateSubmission = async (updatedData) => {
    try {
      setLoading(true);
      
      // Validate that required fields are filled
      if (!updatedData.asks[0].category || !updatedData.asks[0].details ||
          !updatedData.offers[0].category || !updatedData.offers[0].details) {
        alert("Please fill in all required fields.");
        setLoading(false);
        return;
      }
      
      // Send data to Google Sheets
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          action: 'update',
          name: updatedData.name,
          email: updatedData.email,
          linkedin: updatedData.linkedin,
          asks: updatedData.asks,
          offers: updatedData.offers
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update submission in local state
        const updatedSubmissions = submissions.map(sub => {
          if (sub.Email.toLowerCase() === updatedData.email.toLowerCase()) {
            return {
              ...sub,
              Name: updatedData.name,
              Email: updatedData.email,
              LinkedIn: updatedData.linkedin,
              asks: updatedData.asks,
              offers: updatedData.offers,
              Timestamp: new Date().toString() // Update timestamp
            };
          }
          return sub;
        });
        
        setSubmissions(updatedSubmissions);
        
        // Update user's submission info
        setUserSubmissionInfo({
          name: updatedData.name,
          email: updatedData.email,
          asks: updatedData.asks,
          offers: updatedData.offers
        });
        
        // Find updated matches
        const updatedUser = {
          Name: updatedData.name,
          Email: updatedData.email,
          LinkedIn: updatedData.linkedin,
          asks: updatedData.asks,
          offers: updatedData.offers,
          Timestamp: new Date().toString()
        };
        
        findMatches(updatedUser, updatedSubmissions);
        
        // Show matches view
        setView('matches');
        
        // Show success message
        alert("Your submission has been successfully updated!");
      } else {
        setError("Error updating your information. Please try again.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error updating submission:', err);
      setError("Error connecting to the server. Please try again later.");
      setLoading(false);
    }
  };

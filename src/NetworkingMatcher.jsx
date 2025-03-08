import React, { useState, useEffect } from 'react';

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
  const [view, setView] = useState('form'); // 'form', 'thanks', 'matches'

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

  const findMatches = (currentUser, allUsers) => {
    // Enhanced keyword extraction with better stopwords list
    const extractKeywords = (text) => {
      if (!text) return [];
      
      // Expanded stopwords list - common words that don't add matching value
      const stopwords = [
        'a', 'an', 'the', 'and', 'or', 'but', 'i', 'in', 'with', 'for', 'to', 'from', 'by', 
        'on', 'at', 'of', 'about', 'as', 'into', 'like', 'through', 'after', 'over', 'between', 
        'out', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 
        'do', 'does', 'did', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 
        'could', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our', 
        'their', 'what', 'which', 'who', 'whom', 'whose', 'when', 'where', 'why', 'how',
        'all', 'any', 'both', 'each', 'few', 'more', 'most', 'some', 'such', 'no', 'nor',
        'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'looking',
        'want', 'need', 'help', 'someone', 'anyone', 'everyone', 'interested', 'able',
        'possible', 'trying', 'going', 'based', 'make', 'makes', 'made', 'making'
      ];
      
      // Extract words, convert to lowercase, remove common words and short words
      return text.toLowerCase()
        .split(/[\s,;.!?()\[\]"'-]+/)
        .filter(word => word.length > 3 && !stopwords.includes(word));
    };
    
    // Define match thresholds - these can be adjusted based on testing
    const CATEGORY_MATCH_WEIGHT = 5;          // Weight for exact category match
    const KEYWORD_MATCH_WEIGHT = 1;           // Base weight for keyword match
    const SPECIFIC_KEYWORD_BONUS = 0.5;       // Bonus for longer/more specific keywords
    const MINIMUM_MATCH_THRESHOLD = 3;        // Minimum score to be considered a match
    const TWO_WAY_MATCH_THRESHOLD = 6;        // Threshold for two-way match
    
    // Process all potential matches
    const potentialMatches = allUsers
      .filter(user => user.Email !== currentUser.Email) // Exclude self
      .map(user => {
        // Array to store detailed match information
        const askMatches = [];
        const offerMatches = [];
        let totalMatchScore = 0;
        
        // Check each of the user's asks against the other user's offers
        currentUser.asks.forEach((userAsk, userAskIndex) => {
          // Skip empty asks
          if (!userAsk || !userAsk.category || !userAsk.details) return;
          
          const userAskKeywords = extractKeywords(userAsk.details);
          
          // Check against each of their offers
          user.offers.forEach((theirOffer, theirOfferIndex) => {
            // Skip empty offers
            if (!theirOffer || !theirOffer.category || !theirOffer.details) return;
            
            let matchScore = 0;
            const matchedTerms = new Set();
            
            // Category match (high weight)
            if (userAsk.category === theirOffer.category) {
              matchScore += CATEGORY_MATCH_WEIGHT;
            }
            
            // Keyword matches
            const theirOfferKeywords = extractKeywords(theirOffer.details);
            
            userAskKeywords.forEach(myKeyword => {
              const matches = theirOfferKeywords.filter(theirKeyword => 
                theirKeyword.includes(myKeyword) || myKeyword.includes(theirKeyword)
              );
              
              if (matches.length > 0) {
                // Add base score for the match
                matchScore += KEYWORD_MATCH_WEIGHT;
                
                // Add bonus for longer, more specific keywords
                if (myKeyword.length > 6) {
                  matchScore += SPECIFIC_KEYWORD_BONUS;
                }
                
                // Track matched keywords
                matchedTerms.add(myKeyword);
                matches.forEach(match => matchedTerms.add(match));
              }
            });
            
            // If the match score is high enough, record this match
            if (matchScore >= MINIMUM_MATCH_THRESHOLD) {
              askMatches.push({
                userAskIndex,
                theirOfferIndex,
                userAskCategory: userAsk.category,
                userAskDetails: userAsk.details,
                theirOfferCategory: theirOffer.category,
                theirOfferDetails: theirOffer.details,
                matchScore,
                matchedTerms: Array.from(matchedTerms)
              });
              
              totalMatchScore += matchScore;
            }
          });
        });
        
        // Check each of the user's offers against the other user's asks
        currentUser.offers.forEach((userOffer, userOfferIndex) => {
          // Skip empty offers
          if (!userOffer || !userOffer.category || !userOffer.details) return;
          
          const userOfferKeywords = extractKeywords(userOffer.details);
          
          // Check against each of their asks
          user.asks.forEach((theirAsk, theirAskIndex) => {
            // Skip empty asks
            if (!theirAsk || !theirAsk.category || !theirAsk.details) return;
            
            let matchScore = 0;
            const matchedTerms = new Set();
            
            // Category match (high weight)
            if (userOffer.category === theirAsk.category) {
              matchScore += CATEGORY_MATCH_WEIGHT;
            }
            
            // Keyword matches
            const theirAskKeywords = extractKeywords(theirAsk.details);
            
            userOfferKeywords.forEach(myKeyword => {
              const matches = theirAskKeywords.filter(theirKeyword => 
                theirKeyword.includes(myKeyword) || myKeyword.includes(theirKeyword)
              );
              
              if (matches.length > 0) {
                // Add base score for the match
                matchScore += KEYWORD_MATCH_WEIGHT;
                
                // Add bonus for longer, more specific keywords
                if (myKeyword.length > 6) {
                  matchScore += SPECIFIC_KEYWORD_BONUS;
                }
                
                // Track matched keywords
                matchedTerms.add(myKeyword);
                matches.forEach(match => matchedTerms.add(match));
              }
            });
            
            // If the match score is high enough, record this match
            if (matchScore >= MINIMUM_MATCH_THRESHOLD) {
              offerMatches.push({
                userOfferIndex,
                theirAskIndex,
                userOfferCategory: userOffer.category,
                userOfferDetails: userOffer.details,
                theirAskCategory: theirAsk.category,
                theirAskDetails: theirAsk.details,
                matchScore,
                matchedTerms: Array.from(matchedTerms)
              });
              
              totalMatchScore += matchScore;
            }
          });
        });
        
        // Check for user feedback on this match from Google Sheets
        const feedbackKey = `${currentUser.Email}-${user.Email}`;
        const hasPositiveFeedback = feedbackData[feedbackKey] === 'relevant';
        const hasNegativeFeedback = feedbackData[feedbackKey] === 'irrelevant';
        
        // Apply feedback adjustments
        let adjustedScore = totalMatchScore;
        if (hasPositiveFeedback) {
          adjustedScore += 3; // Boost score for positive feedback
        } else if (hasNegativeFeedback) {
          adjustedScore -= 5; // Significantly reduce score for negative feedback
        }
        
        // Return match information
        return {
          ...user,
          matchScore: adjustedScore,
          matchQuality: adjustedScore >= TWO_WAY_MATCH_THRESHOLD ? 'strong' : 'moderate',
          askMatches,
          offerMatches,
          hasFeedback: hasPositiveFeedback || hasNegativeFeedback
        };
      })
      // Filter out entries with no matches
      .filter(match => (match.askMatches.length > 0 || match.offerMatches.length > 0 || match.hasFeedback))
      // Sort by score (highest first)
      .sort((a, b) => b.matchScore - a.matchScore);
    
    setMatches(potentialMatches);
    return potentialMatches;
  };

  const checkMatches = async () => {
    if (!formData.email) {
      alert("Please enter your email address to check matches");
      return;
    }
    
    try {
      setLoading(true);
      
      // Refresh data to get latest matches
      const response = await fetch(API_URL);
      const data = await response.json();
      
      // Set submissions and feedback from the response
      setSubmissions(data.records || data);
      if (data.feedback) {
        setFeedbackData(data.feedback);
      }
      
      // Find matches for the email entered
      const userSubmission = (data.records || data).find(
        sub => sub.Email.toLowerCase() === formData.email.toLowerCase()
      );
      
      if (userSubmission) {
        // Store the user's submission info
        setUserSubmissionInfo({
          name: userSubmission.Name,
          email: userSubmission.Email,
          asks: userSubmission.asks || [],
          offers: userSubmission.offers || []
        });
        
        // Find actual matches
        const actualMatches = findMatches(userSubmission, data.records || data);
        setMatches(actualMatches);
        
        setView('matches');
      } else {
        alert("Email not found. Please submit the form first.");
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error checking matches:', err);
      setError("Error connecting to the server. Please try again later.");
      setLoading(false);
    }
  };

  // Calculate if this is a multi-directional match
  const isMultiDirectionalMatch = (match) => {
    return match.askMatches.length > 0 && match.offerMatches.length > 0;
  };

  // Get the appropriate match quality text
  const getMatchQualityText = (match) => {
    if (match.matchQuality === 'strong') {
      return "Strong Match";
    } else {
      return "Good Match";
    }
  };

  // Get the appropriate match quality color
  const getMatchQualityColor = (match) => {
    if (match.matchQuality === 'strong') {
      return "bg-indigo-600";
    } else {
      return "bg-blue-600";
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md" style={{backgroundColor: theme.background, color: theme.text}}>
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
      
      {view === 'thanks' && (
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Thank you for submitting!</h1>
          <p className="mb-6">Your information has been recorded.</p>
          
          {matches.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">You have {matches.length} potential matches!</h2>
              <button
                onClick={() => setView('matches')}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                style={{backgroundColor: theme.secondary}}
              >
                View Matches
              </button>
            </div>
          )}
          
          <button
            onClick={() => setView('form')}
            className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
            style={{backgroundColor: theme.primary}}
          >
            Return to Form
          </button>
        </div>
      )}
      
      {view === 'matches' && (
        <div>
          <h1 className="text-2xl font-bold mb-4">Your Matches</h1>
          
          {/* User's own submission reminder */}
          {userSubmissionInfo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-lg font-semibold mb-3 text-blue-800">Your Submission</h2>
              
              {userSubmissionInfo.asks && userSubmissionInfo.asks.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-blue-700">What You're Looking For:</h3>
                  <div className="mt-2 space-y-2">
                    {userSubmissionInfo.asks.map((ask, index) => (
                      <div key={`ask-${index}`} className="bg-white p-2 rounded border border-blue-100 text-sm">
                        <span className="font-medium">{ask.category}:</span> {ask.details}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {userSubmissionInfo.offers && userSubmissionInfo.offers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-blue-700">What You Can Offer:</h3>
                  <div className="mt-2 space-y-2">
                    {userSubmissionInfo.offers.map((offer, index) => (
                      <div key={`offer-${index}`} className="bg-white p-2 rounded border border-blue-100 text-sm">
                        <span className="font-medium">{offer.category}:</span> {offer.details}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {matches.length === 0 ? (
            <p>No matches found yet. Check back later!</p>
          ) : (
            <div className="space-y-5">
              {matches.map((match, index) => (
                <div key={index} className="bg-white rounded-lg shadow border border-gray-200 mb-4 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{match.Name}</h3>
                      <p className="text-sm text-gray-500">{match.Email}</p>
                      {match.LinkedIn && (
                        <a 
                          href={match.LinkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm text-blue-600 hover:underline flex items-center mt-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                    <div className={`${getMatchQualityColor(match)} text-white px-3 py-1 rounded-md text-xs font-medium`}>
                      {getMatchQualityText(match)}
                    </div>
                  </div>
                  
                  {/* Your Ask Matches Their Offer */}
                  {match.askMatches.map((askMatch, idx) => (
                    <div key={`ask-match-${idx}`} className={idx === 0 ? '' : 'border-t'}>
                      {idx === 0 && match.askMatches.length + match.offerMatches.length > 1 && (
                        <div className="bg-blue-50 px-4 py-2 text-blue-700 text-sm font-medium border-t">
                          Match #{idx + 1}
                        </div>
                      )}
                      <div className="grid grid-cols-2 divide-x">
                        {/* Left Panel - Your Ask */}
                        <div className="p-4">
                          <h4 className="text-sm uppercase text-gray-500 mb-2">You're Looking For</h4>
                          <p className="font-medium">{askMatch.userAskCategory}</p>
                          <p className="text-sm mt-1">{askMatch.userAskDetails}</p>
                        </div>
                        
                        {/* Right Panel - Their Offer */}
                        <div className="p-4">
                          <h4 className="text-sm uppercase text-gray-500 mb-2">They're Offering</h4>
                          <p className="font-medium">{askMatch.theirOfferCategory}</p>
                          <p className="text-sm mt-1">{askMatch.theirOfferDetails}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Their Ask Matches Your Offer */}
                  {match.offerMatches.map((offerMatch, idx) => (
                    <div key={`offer-match-${idx}`} className={(match.askMatches.length > 0 || idx > 0) ? 'border-t' : ''}>
                      {(match.askMatches.length > 0 || idx > 0) && match.askMatches.length + match.offerMatches.length > 1 && (
                        <div className="bg-blue-50 px-4 py-2 text-blue-700 text-sm font-medium">
                          Match #{match.askMatches.length + idx + 1}
                        </div>
                      )}
                      <div className="grid grid-cols-2 divide-x">
                        {/* Left Panel - Their Ask */}
                        <div className="p-4">
                          <h4 className="text-sm uppercase text-gray-500 mb-2">They're Looking For</h4>
                          <p className="font-medium">{offerMatch.theirAskCategory}</p>
                          <p className="text-sm mt-1">{offerMatch.theirAskDetails}</p>
                        </div>
                        
                        {/* Right Panel - Your Offer */}
                        <div className="p-4">
                          <h4 className="text-sm uppercase text-gray-500 mb-2">You're Offering</h4>
                          <p className="font-medium">{offerMatch.userOfferCategory}</p>
                          <p className="text-sm mt-1">{offerMatch.userOfferDetails}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Feedback Section */}
                  <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
                    <span className="text-xs text-gray-500">Rate this match (improves recommendations only):</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleMatchFeedback(match.Email, 'relevant')}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        👍 Helpful
                      </button>
                      <button
                        onClick={() => handleMatchFeedback(match.Email, 'irrelevant')}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        👎 Not Helpful
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={() => setView('form')}
            className="mt-6 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
            style={{backgroundColor: theme.primary}}
          >
            Return to Form
          </button>
        </div>
      )}
    </div>
  );
};

export default NetworkingMatcher;

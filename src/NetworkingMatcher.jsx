import React, { useState, useEffect } from 'react';

// Your Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbw0Er7Ub0xnTMzHHsWuqQkghYAlvgrfmZLaOb2WDcv1r_P2l00Z9TJyBwf1aEP8yfkg/exec';

const RetentionMessage = () => (
  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
    <p className="text-sm text-yellow-800">
      <strong>Privacy Notice:</strong> Your data will only be kept for the duration of SXSW 2025 and deleted afterward. 
      We do not share your information with third parties.
    </p>
  </div>
);

const NetworkingMatcher = () => {
  // Custom event theme colors
  const theme = {
    primary: '#FF5A5F', // SXSW-inspired reddish color
    secondary: '#00C4CC',
    background: '#F7F7F7',
    text: '#484848',
  };

  const [userSubmissionInfo, setUserSubmissionInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    askCategory: '',
    asking: '',
    giveCategory: '',
    giving: '',
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Send data to Google Sheets
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          linkedin: formData.linkedin,
          askCategory: formData.askCategory,
          asking: formData.asking,
          giveCategory: formData.giveCategory,
          giving: formData.giving
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Add submission to local state for immediate UI update
        const newSubmission = {
          Name: formData.name,
          Email: formData.email,
          LinkedIn: formData.linkedin,
          AskCategory: formData.askCategory,
          AskingDetails: formData.asking,
          GiveCategory: formData.giveCategory,
          GivingDetails: formData.giving,
          Timestamp: new Date().toString()
        };
        
        const newSubmissions = [...submissions, newSubmission];
        setSubmissions(newSubmissions);
        
        // Store user's submission info
        setUserSubmissionInfo({
          askCategory: formData.askCategory,
          asking: formData.asking,
          giveCategory: formData.giveCategory,
          giving: formData.giving,
          email: formData.email
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
          askCategory: '',
          asking: '',
          giveCategory: '',
          giving: '',
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
    // More sophisticated matching algorithm with weighted scoring and better keyword extraction
    
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
    
    // Get keywords from current user's asking and giving
    const userAskingKeywords = extractKeywords(currentUser.AskingDetails);
    const userGivingKeywords = extractKeywords(currentUser.GivingDetails);
    
    // Define match thresholds - these can be adjusted based on testing
    const CATEGORY_MATCH_WEIGHT = 5;          // Weight for exact category match
    const KEYWORD_MATCH_WEIGHT = 1;           // Base weight for keyword match
    const SPECIFIC_KEYWORD_BONUS = 0.5;       // Bonus for longer/more specific keywords
    const MINIMUM_MATCH_THRESHOLD = 3;        // Minimum score to be considered a match
    const TWO_WAY_MATCH_THRESHOLD = 6;        // Threshold for two-way match
    
    // Process all potential matches
    const scoredMatches = allUsers
      .filter(user => user.Email !== currentUser.Email) // Exclude self
      .map(user => {
        // Initialize match data
        let askingMatchScore = 0;
        let givingMatchScore = 0;
        let theyAskWhatIOffer = false;
        let theyOfferWhatIAsk = false;
        
        // Check for exact category matches (high weight)
        if (currentUser.AskCategory && user.GiveCategory === currentUser.AskCategory) {
          theyOfferWhatIAsk = true;
          askingMatchScore += CATEGORY_MATCH_WEIGHT;
        }
        
        if (currentUser.GiveCategory && user.AskCategory === currentUser.GiveCategory) {
          theyAskWhatIOffer = true;
          givingMatchScore += CATEGORY_MATCH_WEIGHT;
        }
        
        // Extract keywords from their asking and giving
        const theirAskingKeywords = extractKeywords(user.AskingDetails);
        const theirGivingKeywords = extractKeywords(user.GivingDetails);
        
        // Create sets of matched keywords for explanation
        const matchedGivingKeywords = new Set();
        const matchedAskingKeywords = new Set();
        
        // Check if what I'm giving matches what they're asking for
        userGivingKeywords.forEach(myKeyword => {
          const matches = theirAskingKeywords.filter(theirKeyword => 
            theirKeyword.includes(myKeyword) || myKeyword.includes(theirKeyword)
          );
          
          if (matches.length > 0) {
            // Add base score for the match
            givingMatchScore += KEYWORD_MATCH_WEIGHT;
            
            // Add bonus for longer, more specific keywords
            if (myKeyword.length > 6) {
              givingMatchScore += SPECIFIC_KEYWORD_BONUS;
            }
            
            // Track matched keywords for explanation
            matchedGivingKeywords.add(myKeyword);
            matches.forEach(match => matchedGivingKeywords.add(match));
          }
        });
        
        // Check if what I'm asking for matches what they're giving
        userAskingKeywords.forEach(myKeyword => {
          const matches = theirGivingKeywords.filter(theirKeyword => 
            theirKeyword.includes(myKeyword) || myKeyword.includes(theirKeyword)
          );
          
          if (matches.length > 0) {
            // Add base score for the match
            askingMatchScore += KEYWORD_MATCH_WEIGHT;
            
            // Add bonus for longer, more specific keywords
            if (myKeyword.length > 6) {
              askingMatchScore += SPECIFIC_KEYWORD_BONUS;
            }
            
            // Track matched keywords for explanation
            matchedAskingKeywords.add(myKeyword);
            matches.forEach(match => matchedAskingKeywords.add(match));
          }
        });
        
        // Apply match thresholds
        if (givingMatchScore >= MINIMUM_MATCH_THRESHOLD) {
          theyAskWhatIOffer = true;
        }
        
        if (askingMatchScore >= MINIMUM_MATCH_THRESHOLD) {
          theyOfferWhatIAsk = true;
        }
        
        // Calculate total match score
        const totalMatchScore = askingMatchScore + givingMatchScore;
        
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
        
        // Return enhanced match data
        return { 
          ...user, 
          matchScore: adjustedScore,
          askingMatchScore,
          givingMatchScore,
          matchQuality: adjustedScore >= TWO_WAY_MATCH_THRESHOLD ? 'strong' : 'moderate',
          matchExplanation: {
            askingMatches: Array.from(matchedAskingKeywords),
            givingMatches: Array.from(matchedGivingKeywords)
          },
          matchTypes: {
            theyAskWhatIOffer,
            theyOfferWhatIAsk
          },
          hasFeedback: hasPositiveFeedback || hasNegativeFeedback
        };
      })
      // Filter out low-scoring matches
      .filter(match => (match.matchScore >= MINIMUM_MATCH_THRESHOLD) || match.hasFeedback)
      // Sort by score (highest first)
      .sort((a, b) => b.matchScore - a.matchScore);
    
    setMatches(scoredMatches);
    return scoredMatches;
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
        // Create user info object for display
        const userInfo = {
          askCategory: userSubmission.AskCategory,
          asking: userSubmission.AskingDetails,
          giveCategory: userSubmission.GiveCategory,
          giving: userSubmission.GivingDetails,
          email: userSubmission.Email
        };
        
        // Store the user's submission info
        setUserSubmissionInfo(userInfo);
        
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

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md" style={{backgroundColor: theme.background, color: theme.text}}>
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
          <h1 className="text-2xl font-bold mb-4">[SXSW] Not-Your-Regular-Meetup : Build Your Village Attendee Match</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700">What category are you asking for?</label>
              <select
                name="askCategory"
                value={formData.askCategory}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              >
                <option value="">Select a category</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Business Development">Business Development</option>
                <option value="Investment">Investment</option>
                <option value="Funding">Funding</option>
                <option value="VC Connections">VC Connections</option>
                <option value="Angel Investors">Angel Investors</option>
                <option value="Technical Skills">Technical Skills</option>
                <option value="Software Development">Software Development</option>
                <option value="Data Science">Data Science</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Marketing">Marketing</option>
                <option value="Growth Hacking">Growth Hacking</option>
                <option value="Content Strategy">Content Strategy</option>
                <option value="Social Media">Social Media</option>
                <option value="SEO">SEO</option>
                <option value="Design">Design</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Product Design">Product Design</option>
                <option value="Legal Advice">Legal Advice</option>
                <option value="IP Protection">IP Protection</option>
                <option value="Contract Review">Contract Review</option>
                <option value="Partnerships">Partnerships</option>
                <option value="Co-Founder">Co-Founder</option>
                <option value="Career Advice">Career Advice</option>
                <option value="Job Opportunities">Job Opportunities</option>
                <option value="Resume Review">Resume Review</option>
                <option value="Interview Prep">Interview Prep</option>
                <option value="Industry Connections">Industry Connections</option>
                <option value="Speaking Opportunities">Speaking Opportunities</option>
                <option value="Media Exposure">Media Exposure</option>
                <option value="Podcast Guest">Podcast Guest</option>
                <option value="Customer Introductions">Customer Introductions</option>
                <option value="User Testing">User Testing</option>
                <option value="Product Feedback">Product Feedback</option>
                <option value="Operations">Operations</option>
                <option value="HR/Recruiting">HR/Recruiting</option>
                <option value="Finance">Finance</option>
                <option value="Sales Strategy">Sales Strategy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">What are you asking for? (Be specific)</label>
              <textarea
                name="asking"
                value={formData.asking}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Describe specifically what you're looking for..."
                rows="3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">What category can you offer?</label>
              <select
                name="giveCategory"
                value={formData.giveCategory}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
              >
                <option value="">Select a category</option>
                <option value="Mentorship">Mentorship</option>
                <option value="Business Development">Business Development</option>
                <option value="Investment">Investment</option>
                <option value="Funding">Funding</option>
                <option value="VC Connections">VC Connections</option>
                <option value="Angel Investors">Angel Investors</option>
                <option value="Technical Skills">Technical Skills</option>
                <option value="Software Development">Software Development</option>
                <option value="Data Science">Data Science</option>
                <option value="UI/UX">UI/UX</option>
                <option value="Marketing">Marketing</option>
                <option value="Growth Hacking">Growth Hacking</option>
                <option value="Content Strategy">Content Strategy</option>
                <option value="Social Media">Social Media</option>
                <option value="SEO">SEO</option>
                <option value="Design">Design</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Product Design">Product Design</option>
                <option value="Legal Advice">Legal Advice</option>
                <option value="IP Protection">IP Protection</option>
                <option value="Contract Review">Contract Review</option>
                <option value="Partnerships">Partnerships</option>
                <option value="Co-Founder">Co-Founder</option>
                <option value="Career Advice">Career Advice</option>
                <option value="Job Opportunities">Job Opportunities</option>
                <option value="Resume Review">Resume Review</option>
                <option value="Interview Prep">Interview Prep</option>
                <option value="Industry Connections">Industry Connections</option>
                <option value="Speaking Opportunities">Speaking Opportunities</option>
                <option value="Media Exposure">Media Exposure</option>
                <option value="Podcast Guest">Podcast Guest</option>
                <option value="Customer Introductions">Customer Introductions</option>
                <option value="User Testing">User Testing</option>
                <option value="Product Feedback">Product Feedback</option>
                <option value="Operations">Operations</option>
                <option value="HR/Recruiting">HR/Recruiting</option>
                <option value="Finance">Finance</option>
                <option value="Sales Strategy">Sales Strategy</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">What can you offer? (Be specific)</label>
              <textarea
                name="giving"
                value={formData.giving}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                placeholder="Describe specifically what you can offer..."
                rows="3"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              style={{backgroundColor: theme.primary, opacity: loading ? 0.7 : 1}}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
          
          <RetentionMessage />
          
          <div className="mt-6 pt-4 border-t">
            <h2 className="text-lg font-medium mb-2 text-center">Already submitted? Check your matches!</h2>
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
                onClick={checkMatches}
                disabled={loading}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                style={{backgroundColor: theme.secondary, opacity: loading ? 0.7 : 1}}
              >
                {loading ? '...' : 'Check'}
              </button>
            </div>
          </div>
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
              <h2 className="text-lg font-semibold mb-2 text-blue-800">Your Submission</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-blue-800">You're asking for:</p>
                  <p className="text-sm font-bold">{userSubmissionInfo.askCategory}</p>
                  <p className="text-sm">{userSubmissionInfo.asking}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">You're offering:</p>
                  <p className="text-sm font-bold">{userSubmissionInfo.giveCategory}</p>
                  <p className="text-sm">{userSubmissionInfo.giving}</p>
                </div>
              </div>
            </div>
          )}
          
          {matches.length === 0 ? (
            <p>No matches found yet. Check back later!</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match, index) => {
                // Determine match types
                const theyAskWhatIOffer = match.matchTypes && match.matchTypes.theyAskWhatIOffer;
                const theyOfferWhatIAsk = match.matchTypes && match.matchTypes.theyOfferWhatIAsk;
                const mutualMatch = theyAskWhatIOffer && theyOfferWhatIAsk;
                
                return (
                <div key={index} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{match.Name}</h3>
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
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      match.matchQuality === 'strong' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {mutualMatch ? "Two-way Match!" : "Match"} 
                      {match.matchQuality === 'strong' && " ★★★"}
                      {match.matchQuality === 'moderate' && " ★★"}
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    {(theyAskWhatIOffer || mutualMatch) && (
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-xs uppercase font-semibold text-red-700">They're Looking For</p>
                        <p className="text-sm font-medium">{match.AskCategory}</p>
                        <p className="text-sm mt-1">{match.AskingDetails}</p>
                        <div className="text-xs text-green-600 mt-2 italic">
                          <p>This matches what you can offer</p>
                          {match.matchExplanation && match.matchExplanation.givingMatches.length > 0 && (
                            <p className="mt-1">Matching terms: {match.matchExplanation.givingMatches.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {(theyOfferWhatIAsk || mutualMatch) && (
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-xs uppercase font-semibold text-green-700">They're Offering</p>
                        <p className="text-sm font-medium">{match.GiveCategory}</p>
                        <p className="text-sm mt-1">{match.GivingDetails}</p>
                        <div className="text-xs text-red-600 mt-2 italic">
                          <p>This matches what you're looking for</p>
                          {match.matchExplanation && match.matchExplanation.askingMatches.length > 0 && (
                            <p className="mt-1">Matching terms: {match.matchExplanation.askingMatches.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Match Feedback Controls */}
                    <div className="mt-2 flex items-center justify-end space-x-2">
                      <span className="text-xs text-gray-500">Is this match relevant?</span>
                      <button 
                        onClick={() => handleMatchFeedback(match.Email, 'relevant')}
                        className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => handleMatchFeedback(match.Email, 'irrelevant')}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              )})}
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

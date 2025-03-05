import React, { useState, useEffect } from 'react';

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

  const [view, setView] = useState('form'); // 'form', 'thanks', 'matches'
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

  // Simulating loading saved data
  useEffect(() => {
    // In a real app, this would load from a database
    const savedData = localStorage.getItem('networkingData');
    if (savedData) {
      setSubmissions(JSON.parse(savedData));
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add submission to the list
    const newSubmissions = [...submissions, formData];
    setSubmissions(newSubmissions);
    
    // Save to localStorage (in a real app, save to database)
    localStorage.setItem('networkingData', JSON.stringify(newSubmissions));
    
    // Find matches
    findMatches(formData, newSubmissions);
    
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
  };

  const findMatches = (currentUser, allUsers) => {
    // More sophisticated matching algorithm with keywords and categories
    
    // Extract keywords from the asking/giving text
    const extractKeywords = (text) => {
      if (!text) return [];
      // Remove common words and split by spaces, commas, etc.
      const commonWords = ['a', 'an', 'the', 'and', 'or', 'but', 'i', 'in', 'with', 'for'];
      return text.toLowerCase()
        .split(/[\s,;.!?]+/)
        .filter(word => word.length > 2 && !commonWords.includes(word));
    };
    
    const userAskingKeywords = extractKeywords(currentUser.asking);
    const userGivingKeywords = extractKeywords(currentUser.giving);
    
    const potentialMatches = allUsers.filter(user => {
      if (user.email === currentUser.email) return false;
      
      // Score each potential match
      let matchScore = 0;
      
      // Category matches (direct category matches are strong signals)
      if (currentUser.askCategory && user.giveCategory === currentUser.askCategory) {
        matchScore += 3;
      }
      
      if (currentUser.giveCategory && user.askCategory === currentUser.giveCategory) {
        matchScore += 3;
      }
      
      // Keyword matches
      const theirAskingKeywords = extractKeywords(user.asking);
      const theirGivingKeywords = extractKeywords(user.giving);
      
      // What I'm giving matches what they're asking
      userGivingKeywords.forEach(keyword => {
        if (theirAskingKeywords.includes(keyword) || user.asking.toLowerCase().includes(keyword)) {
          matchScore += 1;
        }
      });
      
      // What I'm asking matches what they're giving
      userAskingKeywords.forEach(keyword => {
        if (theirGivingKeywords.includes(keyword) || user.giving.toLowerCase().includes(keyword)) {
          matchScore += 1;
        }
      });
      
      // Return true if there's a significant match
      return matchScore >= 1;
    });
    
    // Sort matches by score (most relevant first)
    const scoredMatches = potentialMatches.map(user => {
      let score = 0;
      
      // Recalculate score for sorting
      if (currentUser.askCategory && user.giveCategory === currentUser.askCategory) score += 3;
      if (currentUser.giveCategory && user.askCategory === currentUser.giveCategory) score += 3;
      
      const keywords1 = extractKeywords(currentUser.giving);
      const keywords2 = extractKeywords(user.asking);
      keywords1.forEach(k => {
        if (keywords2.includes(k) || user.asking.toLowerCase().includes(k)) score += 1;
      });
      
      const keywords3 = extractKeywords(currentUser.asking);
      const keywords4 = extractKeywords(user.giving);
      keywords3.forEach(k => {
        if (keywords4.includes(k) || user.giving.toLowerCase().includes(k)) score += 1;
      });
      
      return { ...user, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);
    
    setMatches(scoredMatches);
  };

  const checkMatches = () => {
    // Find matches for the email entered
    const userSubmission = submissions.find(
      sub => sub.email === formData.email
    );
    
    if (userSubmission) {
      findMatches(userSubmission, submissions);
      setView('matches');
    } else {
      alert("Email not found. Please submit the form first.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md" style={{backgroundColor: theme.background, color: theme.text}}>
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
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              style={{backgroundColor: theme.primary}}
            >
              Submit
            </button>
          </form>
          
          <RetentionMessage />
          
          <div className="mt-6 pt-4 border-t">
            <h2 className="text-lg font-medium mb-2 text-center">Already submitted? Check your matches!</h2>
            <div className="flex space-x-2">
              <input
                type="email"
                name="email"
                onChange={handleChange}
                placeholder="Enter your email"
                className="flex-1 rounded-md border-gray-300 shadow-sm p-2 border"
              />
              <button
                onClick={checkMatches}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                style={{backgroundColor: theme.secondary}}
              >
                Check
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
          
          {matches.length === 0 ? (
            <p>No matches found yet. Check back later!</p>
          ) : (
            <div className="space-y-4">
              {matches.map((match, index) => (
                <div key={index} className="border rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{match.name}</h3>
                      <p className="text-sm text-gray-500">{match.email}</p>
                      {match.linkedin && (
                        <a 
                          href={match.linkedin} 
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
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Match Strength: {match.matchScore}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="bg-red-50 p-2 rounded">
                      <p className="text-xs uppercase font-semibold text-red-700">Asking for</p>
                      <p className="text-sm font-medium">{match.askCategory}</p>
                      <p className="text-sm mt-1">{match.asking}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-xs uppercase font-semibold text-green-700">Offering</p>
                      <p className="text-sm font-medium">{match.giveCategory}</p>
                      <p className="text-sm mt-1">{match.giving}</p>
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

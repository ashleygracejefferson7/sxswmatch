import React, { useState, useEffect, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import nlp from 'compromise';
import AskSection from './AskSection';
import OfferSection from './OfferSection';
import RetentionMessage from './RetentionMessage';
import EditSubmissionForm from './EditSubmissionForm';
import PrintableMatches from './PrintableMatches';

// Expanded concept mappings for related terms
const CONCEPT_MAPPINGS = {
  'coding': ['development', 'programming', 'software', 'engineer', 'developer', 'coding', 'code', 'tech', 'technical', 'app', 'application', 'web', 'backend', 'frontend', 'fullstack', 'full-stack', 'develop', 'coder', 'engineering', 'programmer', 'devops', 'stack', 'debugging', 'architecture'],
  'marketing': ['growth', 'advertising', 'promotion', 'brand', 'market', 'audience', 'customers', 'acquisition', 'seo', 'content', 'digital', 'social media', 'campaign', 'conversion', 'engagement', 'channels', 'outreach', 'influencer', 'strategy', 'visibility', 'leads', 'funnel', 'inbound', 'b2b', 'b2c', 'customer', 'client'],
  'funding': ['investment', 'capital', 'investor', 'financing', 'money', 'fundraising', 'venture', 'vc', 'angel', 'seed', 'series', 'round', 'pitch', 'deck', 'valuation', 'term sheet', 'equity', 'dilution', 'bootstrap', 'revenue', 'raise', 'funding', 'finance', 'cash', 'budget', 'runway'],
  'startup': ['venture', 'founding', 'founder', 'entrepreneurship', 'business', 'company', 'launch', 'scale', 'growth', 'lean', 'mvp', 'minimum viable product', 'product market fit', 'pmf', 'innovation', 'disrupt', 'accelerator', 'incubator', 'early stage', 'startup', 'start-up', 'exit', 'acquisition'],
  'design': ['ui', 'ux', 'user interface', 'user experience', 'graphic', 'visual', 'creative', 'interface', 'prototype', 'wireframe', 'mockup', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'animation', 'interaction', 'mobile', 'responsive', 'accessibility', 'a11y', 'usability'],
  'product': ['feature', 'roadmap', 'development', 'management', 'specification', 'launch', 'mvp', 'backlog', 'sprint', 'agile', 'scrum', 'kanban', 'user story', 'epics', 'prioritization', 'product owner', 'product manager', 'requirement', 'feedback', 'iteration', 'release', 'rollout'],
  'data': ['analytics', 'metrics', 'statistics', 'analysis', 'science', 'machine learning', 'ai', 'artificial intelligence', 'big data', 'data mining', 'data warehouse', 'database', 'sql', 'nosql', 'visualization', 'dashboard', 'tableau', 'power bi', 'predictive', 'forecasting', 'modeling', 'algorithm'],
  'networking': ['connections', 'introductions', 'referrals', 'relationship', 'meetup', 'network', 'connect', 'contact', 'community', 'ecosystem', 'industry', 'professional', 'linkedin', 'social'],
  'business development': ['partnership', 'alliance', 'collaboration', 'agreement', 'contract', 'channel', 'sales', 'revenue', 'client', 'customer', 'bizdev', 'deal', 'pipeline', 'leads', 'prospect', 'opportunity', 'market expansion', 'business model'],
  'mentorship': ['advice', 'guidance', 'coaching', 'mentor', 'mentee', 'experience', 'knowledge', 'wisdom', 'career', 'growth', 'learning', 'development', 'sounding board', 'advocate', 'sponsor', 'advisor']
};

// Function to calculate semantic similarity between texts
const getSemanticSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;
  
  try {
    // Parse texts with compromise
    const doc1 = nlp(text1);
    const doc2 = nlp(text2);
    
    // Extract normalized nouns, verbs, and adjectives
    const terms1 = new Set([
      ...doc1.nouns().out('array'),
      ...doc1.verbs().out('array'),
      ...doc1.adjectives().out('array')
    ]);
    
    const terms2 = new Set([
      ...doc2.nouns().out('array'),
      ...doc2.verbs().out('array'),
      ...doc2.adjectives().out('array')
    ]);

    // Calculate Jaccard similarity (intersection over union)
    const intersection = [...terms1].filter(term => terms2.has(term));
    const union = new Set([...terms1, ...terms2]);
    
    // Return similarity score between 0-1
    return union.size === 0 ? 0 : intersection.length / union.size;
  } catch (err) {
    console.error('Error calculating semantic similarity:', err);
    return 0; // Fallback in case of errors
  }
};

// Function to find related concepts in text
const findRelatedConcepts = (text) => {
  if (!text) return [];
  
  try {
    const lowerText = text.toLowerCase();
    const conceptMatches = [];
    
    Object.entries(CONCEPT_MAPPINGS).forEach(([concept, relatedTerms]) => {
      for (const term of relatedTerms) {
        if (lowerText.includes(term)) {
          conceptMatches.push(concept);
          break; // Once we match one term in a concept, move to next concept
        }
      }
    });
    
    return [...new Set(conceptMatches)]; // Remove duplicates
  } catch (err) {
    console.error('Error finding related concepts:', err);
    return []; // Fallback in case of errors
  }
};

// Function to extract important industry terms
const extractIndustryTerms = (text) => {
  if (!text) return [];
  
  // List of important industry terms that should match more specifically
  const industryTerms = [
    'fintech', 'healthtech', 'edtech', 'medtech', 'biotech', 'proptech', 'legaltech', 
    'cleantech', 'greentech', 'agtech', 'insurtech', 'regtech', 'foodtech', 'adtech',
    'healthcare', 'finance', 'health', 'medical', 'education', 'real estate', 'insurance', 'retail',
    'manufacturing', 'transportation', 'logistics', 'energy', 'sustainability',
    'blockchain', 'crypto', 'web3', 'ai', 'machine learning', 'saas', 'enterprise',
    'consumer', 'b2b', 'b2c', 'd2c', 'marketplace', 'platform'
  ];
  
  const lowerText = text.toLowerCase();
  const foundTerms = [];
  
  industryTerms.forEach(term => {
    if (lowerText.includes(term)) {
      foundTerms.push(term);
    }
  });
  
  return [...new Set(foundTerms)]; // Remove duplicates
};

// Your Google Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbx2h4B6jNF3tQtH82Rmc-IM6vQonSw_SJc0KXjw9Tpj_YQ_rVKAT93PgBL28UMGo5Ad/exec';

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
  
  // Find the most recent submission for an email
  const findLatestSubmissionByEmail = (email) => {
    if (!email || !submissions.length) return null;
    
    // Filter submissions by email
    const userSubmissions = submissions.filter(
      sub => sub.Email.toLowerCase() === email.toLowerCase()
    );
    
    if (!userSubmissions.length) return null;
    
    // If multiple submissions exist, sort by timestamp and return the latest
    if (userSubmissions.length > 1) {
      // Sort by timestamp (newest first)
      return userSubmissions.sort((a, b) => {
        const dateA = new Date(a.Timestamp);
        const dateB = new Date(b.Timestamp);
        return dateB - dateA;
      })[0];
    }
    
    return userSubmissions[0];
  };
  
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
          const userSubmission = findLatestSubmissionByEmail(currentUserEmail);
          
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
        
        // Update submissions list - if email already exists, replace the entry
        const existingSubmissionIndex = submissions.findIndex(
          sub => sub.Email.toLowerCase() === formData.email.toLowerCase()
        );
        
        let newSubmissions;
        if (existingSubmissionIndex !== -1) {
          // Replace existing submission
          newSubmissions = [...submissions];
          newSubmissions[existingSubmissionIndex] = newSubmission;
        } else {
          // Add new submission
          newSubmissions = [...submissions, newSubmission];
        }
        
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
      
      // Ensure action parameter is included
      const submissionData = {
        ...updatedData,
        action: 'update'
      };
      
      // Send data to Google Sheets
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(submissionData)
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
        'possible', 'trying', 'going', 'based', 'make', 'makes', 'made', 'making',
        // Additional stopwords to reduce generic matches
        'any', 'many', 'support', 'service', 'services', 'help', 'helping', 'work', 'working'
      ];
      
      // Extract words, convert to lowercase, remove common words and short words
      return text.toLowerCase()
        .split(/[\s,;.!?()\[\]"'-]+/)
        .filter(word => word.length > 3 && !stopwords.includes(word));
    };
    
    // Define match thresholds - modified for better quality
    const CATEGORY_MATCH_WEIGHT = 12;         // Primary factor - exact category match
    const KEYWORD_MATCH_WEIGHT = 2;           // Base weight for keyword match
    const SPECIFIC_KEYWORD_BONUS = 1;         // Bonus for longer keywords
    const SEMANTIC_MATCH_WEIGHT = 8;          // Weight for semantic matching
    const CONCEPT_MATCH_WEIGHT = 5;           // Weight for concept matching
    const INDUSTRY_TERM_MATCH_WEIGHT = 10;    // High weight for matching specific industries
    const INDUSTRY_MISMATCH_PENALTY = -8;     // Penalty for industry mismatch
    
    // Higher thresholds for more meaningful matches
    const MINIMUM_MATCH_THRESHOLD = 5;        // Increased from 2 to 5
    const GOOD_MATCH_THRESHOLD = 10;          // Threshold for "Good Match"
    const STRONG_MATCH_THRESHOLD = 18;        // Threshold for "Strong Match"
    const BIDIRECTIONAL_BONUS = 8;            // Bonus for matches that go both ways
    
    // Process all potential matches
    const potentialMatches = allUsers
      .filter(user => user.Email !== currentUser.Email) // Exclude self
      .map(user => {
        // Array to store detailed match information
        const askMatches = [];
        const offerMatches = [];
        let totalMatchScore = 0;
        let hasBidirectionalMatch = false;
        
        // Check each of the user's asks against the other user's offers
        currentUser.asks.forEach((userAsk, userAskIndex) => {
          // Skip empty asks
          if (!userAsk || !userAsk.category || !userAsk.details) return;
          
          const userAskKeywords = extractKeywords(userAsk.details);
          const userAskConcepts = findRelatedConcepts(userAsk.details);
          const userAskIndustryTerms = extractIndustryTerms(userAsk.details);
          
          // Check against each of their offers
          user.offers.forEach((theirOffer, theirOfferIndex) => {
            // Skip empty offers
            if (!theirOffer || !theirOffer.category || !theirOffer.details) return;
            
            let matchScore = 0;
            const matchedTerms = new Set();
            const matchedConcepts = new Set();
            const matchedIndustryTerms = new Set();
            const matchReasons = [];
            
            // 1. Category match (high weight)
            if (userAsk.category === theirOffer.category) {
              matchScore += CATEGORY_MATCH_WEIGHT;
              matchReasons.push("Exact category match");
            }
            
            // 2. Keyword matches
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
                
                matchReasons.push(`Keyword match: ${myKeyword}`);
              }
            });
            
            // 3. Semantic similarity score
            const semanticScore = getSemanticSimilarity(userAsk.details, theirOffer.details);
            matchScore += semanticScore * SEMANTIC_MATCH_WEIGHT;
            
            if (semanticScore > 0.2) {
              matchReasons.push(`Semantic similarity: ${(semanticScore * 100).toFixed(0)}%`);
            }
            
            // 4. Concept matching
            const theirOfferConcepts = findRelatedConcepts(theirOffer.details);
            const matchingConcepts = userAskConcepts.filter(c => theirOfferConcepts.includes(c));
            
            matchingConcepts.forEach(concept => {
              matchScore += CONCEPT_MATCH_WEIGHT;
              matchedConcepts.add(concept);
              matchReasons.push(`Shared concept: ${concept}`);
            });
            
            // 5. Industry term matching
            const theirOfferIndustryTerms = extractIndustryTerms(theirOffer.details);
            
            // Check for industry term matches
            userAskIndustryTerms.forEach(term => {
              if (theirOfferIndustryTerms.includes(term)) {
                matchScore += INDUSTRY_TERM_MATCH_WEIGHT;
                matchedIndustryTerms.add(term);
                matchReasons.push(`Industry match: ${term}`);
              }
            });
            
            // Apply penalty if industry terms don't match when both parties specify them
            if (userAskIndustryTerms.length > 0 && theirOfferIndustryTerms.length > 0 && 
                matchedIndustryTerms.size === 0) {
              matchScore += INDUSTRY_MISMATCH_PENALTY;
              matchReasons.push(`Industry mismatch: ${userAskIndustryTerms.join(', ')} vs ${theirOfferIndustryTerms.join(', ')}`);
            }
            
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
                matchedTerms: Array.from(matchedTerms),
                matchedConcepts: Array.from(matchedConcepts),
                matchedIndustryTerms: Array.from(matchedIndustryTerms),
                semanticScore: semanticScore.toFixed(2),
                matchReasons // Store reasons for debugging
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
          const userOfferConcepts = findRelatedConcepts(userOffer.details);
          const userOfferIndustryTerms = extractIndustryTerms(userOffer.details);
          
          // Check against each of their asks
          user.asks.forEach((theirAsk, theirAskIndex) => {
            // Skip empty asks
            if (!theirAsk || !theirAsk.category || !theirAsk.details) return;
            
            let matchScore = 0;
            const matchedTerms = new Set();
            const matchedConcepts = new Set();
            const matchedIndustryTerms = new Set();
            const matchReasons = [];
            
            // 1. Category match (high weight)
            if (userOffer.category === theirAsk.category) {
              matchScore += CATEGORY_MATCH_WEIGHT;
              matchReasons.push("Exact category match");
            }
            // 2. Keyword matches
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
                
                matchReasons.push(`Keyword match: ${myKeyword}`);
              }
            });
            
            // 3. Semantic similarity score
            const semanticScore = getSemanticSimilarity(userOffer.details, theirAsk.details);
            matchScore += semanticScore * SEMANTIC_MATCH_WEIGHT;
            
            if (semanticScore > 0.2) {
              matchReasons.push(`Semantic similarity: ${(semanticScore * 100).toFixed(0)}%`);
            }
            
            // 4. Concept matching
            const theirAskConcepts = findRelatedConcepts(theirAsk.details);
            const matchingConcepts = userOfferConcepts.filter(c => theirAskConcepts.includes(c));
            
            matchingConcepts.forEach(concept => {
              matchScore += CONCEPT_MATCH_WEIGHT;
              matchedConcepts.add(concept);
              matchReasons.push(`Shared concept: ${concept}`);
            });
            
            // 5. Industry term matching
            const theirAskIndustryTerms = extractIndustryTerms(theirAsk.details);
            
            // Check for industry term matches
            userOfferIndustryTerms.forEach(term => {
              if (theirAskIndustryTerms.includes(term)) {
                matchScore += INDUSTRY_TERM_MATCH_WEIGHT;
                matchedIndustryTerms.add(term);
                matchReasons.push(`Industry match: ${term}`);
              }
            });
            
            // Apply penalty if industry terms don't match when both parties specify them
            if (userOfferIndustryTerms.length > 0 && theirAskIndustryTerms.length > 0 && 
                matchedIndustryTerms.size === 0) {
              matchScore += INDUSTRY_MISMATCH_PENALTY;
              matchReasons.push(`Industry mismatch: ${userOfferIndustryTerms.join(', ')} vs ${theirAskIndustryTerms.join(', ')}`);
            }
            
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
                matchedTerms: Array.from(matchedTerms),
                matchedConcepts: Array.from(matchedConcepts),
                matchedIndustryTerms: Array.from(matchedIndustryTerms),
                semanticScore: semanticScore.toFixed(2),
                matchReasons // Store reasons for debugging
              });
              
              totalMatchScore += matchScore;
            }
          });
        });
        
        // Check for bidirectional matches
        hasBidirectionalMatch = askMatches.length > 0 && offerMatches.length > 0;
        
        // Apply bonus for bidirectional matches
        if (hasBidirectionalMatch) {
          totalMatchScore += BIDIRECTIONAL_BONUS;
        }
        
        // Check for user feedback on this match from Google Sheets
        const feedbackKey = `${currentUser.Email}-${user.Email}`;
        const hasPositiveFeedback = feedbackData[feedbackKey] === 'relevant';
        const hasNegativeFeedback = feedbackData[feedbackKey] === 'irrelevant';
        
        // Apply feedback adjustments
        let adjustedScore = totalMatchScore;
        if (hasPositiveFeedback) {
          adjustedScore += 5; // Boost for positive feedback
        } else if (hasNegativeFeedback) {
          adjustedScore -= 10; // Increased penalty for negative feedback
        }
        
        // Determine match quality based on adjusted score
        let matchQuality = 'moderate';
        if (adjustedScore >= STRONG_MATCH_THRESHOLD || (hasBidirectionalMatch && adjustedScore >= GOOD_MATCH_THRESHOLD)) {
          matchQuality = 'strong';
        } else if (adjustedScore >= GOOD_MATCH_THRESHOLD) {
          matchQuality = 'good';
        }
        
        // Return match information
        return {
          ...user,
          matchScore: adjustedScore,
          matchQuality,
          askMatches,
          offerMatches,
          hasBidirectionalMatch,
          hasFeedback: hasPositiveFeedback || hasNegativeFeedback
        };
      })
      // Filter out entries with low match scores
      .filter(match => (
        match.matchQuality !== 'moderate' || 
        match.hasFeedback || 
        (match.askMatches.length > 0 && match.offerMatches.length > 0)
      ))
      // Sort by score (highest first) and then by bidirectional status
      .sort((a, b) => {
        // First sort by match score
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        // If scores are equal, prioritize bidirectional matches
        return b.hasBidirectionalMatch - a.hasBidirectionalMatch;
      });
    
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
      
      // Find the most recent submission for this email
      const userSubmission = findLatestSubmissionByEmail(formData.email);
      
      if (userSubmission) {
        // Store the user's submission info
        setUserSubmissionInfo({
          name: userSubmission.Name,
          email: userSubmission.Email,
          linkedin: userSubmission.LinkedIn,
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
    } else if (match.matchQuality === 'good') {
      return "Good Match";
    } else {
      return "Moderate Match";
    }
  };

  // Get the appropriate match quality color
  const getMatchQualityColor = (match) => {
    if (match.matchQuality === 'strong') {
      return "bg-indigo-600";
    } else if (match.matchQuality === 'good') {
      return "bg-blue-600";
    } else {
      return "bg-gray-500";
    }
  };
  
  // Function to refresh matches after editing or updating
  const refreshMatches = async () => {
    if (!userSubmissionInfo || !userSubmissionInfo.email) return;
    
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
      
      // Find the most recent submission
      const userSubmission = findLatestSubmissionByEmail(userSubmissionInfo.email);
      
      if (userSubmission) {
        // Update user's submission info if needed
        setUserSubmissionInfo({
          name: userSubmission.Name,
          email: userSubmission.Email,
          linkedin: userSubmission.LinkedIn,
          asks: userSubmission.asks || [],
          offers: userSubmission.offers || []
        });
        
        // Find updated matches
        findMatches(userSubmission, data.records || data);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing matches:', err);
      setError("Error connecting to the server. Please try again later.");
      setLoading(false);
    }
  };

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
      
      {view === 'edit' && userSubmissionInfo && (
        <EditSubmissionForm 
          userSubmission={findLatestSubmissionByEmail(userSubmissionInfo.email)}
          categories={categories}
          onSubmit={handleUpdateSubmission}
          onCancel={() => setView('matches')}
        />
      )}
      
      {view === 'matches' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Your Matches</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setView('edit')}
                className="py-1 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Edit Submission
              </button>
              <button
                onClick={handlePrint}
                className="py-1 px-3 text-sm bg-blue-100 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-200"
              >
                Download PDF
              </button>
            </div>
          </div>
          
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
                          
                          {/* Display matched concepts if available */}
                          {askMatch.matchedConcepts && askMatch.matchedConcepts.length > 0 && (
                            <div className="mt-2 text-xs bg-green-50 p-1 rounded border border-green-100">
                              <span className="font-medium text-green-800">Matched topics:</span>{' '}
                              <span className="text-green-700">{askMatch.matchedConcepts.join(', ')}</span>
                            </div>
                          )}
                          
                          {/* Display matched industry terms if available */}
                          {askMatch.matchedIndustryTerms && askMatch.matchedIndustryTerms.length > 0 && (
                            <div className="mt-2 text-xs bg-indigo-50 p-1 rounded border border-indigo-100">
                              <span className="font-medium text-indigo-800">Industry match:</span>{' '}
                              <span className="text-indigo-700">{askMatch.matchedIndustryTerms.join(', ')}</span>
                            </div>
                          )}
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
                          
                          {/* Display matched concepts if available */}
                          {offerMatch.matchedConcepts && offerMatch.matchedConcepts.length > 0 && (
                            <div className="mt-2 text-xs bg-green-50 p-1 rounded border border-green-100">
                              <span className="font-medium text-green-800">Matched topics:</span>{' '}
                              <span className="text-green-700">{offerMatch.matchedConcepts.join(', ')}</span>
                            </div>
                          )}
                          
                          {/* Display matched industry terms if available */}
                          {offerMatch.matchedIndustryTerms && offerMatch.matchedIndustryTerms.length > 0 && (
                            <div className="mt-2 text-xs bg-indigo-50 p-1 rounded border border-indigo-100">
                              <span className="font-medium text-indigo-800">Industry match:</span>{' '}
                              <span className="text-indigo-700">{offerMatch.matchedIndustryTerms.join(', ')}</span>
                            </div>
                          )}
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
          
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => setView('form')}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              style={{backgroundColor: theme.primary}}
            >
              Return to Form
            </button>
            
            <button
              onClick={refreshMatches}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
              style={{backgroundColor: theme.secondary}}
            >
              Refresh Matches
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NetworkingMatcher;

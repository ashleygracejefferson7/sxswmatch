import React from 'react';

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

export default PrintableMatches;

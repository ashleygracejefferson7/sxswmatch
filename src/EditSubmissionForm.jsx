import React, { useState, useEffect } from 'react';
import AskSection from './AskSection';
import OfferSection from './OfferSection';

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

export default EditSubmissionForm;

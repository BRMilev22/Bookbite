'use client';

import { useState, useEffect } from 'react';
import { Input, Textarea, Button, Card, Badge } from "@heroui/react";
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

// Define a form data interface
interface ReservationFormData {
  tableId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  specialRequests: string;
  occasion?: string;
  dietaryRestrictions: string[];
  promoCode?: string;
}

// Base pricing information
const BASE_RESERVATION_FEE = 10.00;
const SERVICE_CHARGE_PERCENTAGE = 5;
const PER_PERSON_FEE = 5.00; // Additional fee per person

// Common occasions and dietary restrictions
const COMMON_OCCASIONS = [
  'Birthday', 
  'Anniversary', 
  'Business Meeting', 
  'Date Night', 
  'Family Gathering', 
  'Other'
];

const COMMON_DIETARY_RESTRICTIONS = [
  'Vegetarian', 
  'Vegan', 
  'Gluten-Free', 
  'Dairy-Free', 
  'Nut Allergy', 
  'Shellfish Allergy',
  'Kosher',
  'Halal'
];

export default function ReservationPage() {
  const [step, setStep] = useState(1);
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<ReservationFormData>({
    tableId: 1, // Default to the first table
    reservationDate: '',
    startTime: '',
    endTime: '',
    partySize: 2,
    specialRequests: '',
    dietaryRestrictions: []
  });
  
  // Add calculated price state
  const [calculatedPrice, setCalculatedPrice] = useState({
    baseFee: BASE_RESERVATION_FEE,
    serviceFee: 0,
    personFee: 0,
    subtotal: 0,
    discountAmount: 0,
    total: 0
  });
  
  const validatePromoCode = (code: string) => {
    if (!code) {
      setPromoCodeValid(false);
      setDiscount(0);
      return;
    }
    
    console.log(`Attempting to validate promo code: ${code}`);
    
    fetch(`http://localhost:8080/api/promo-codes/validate/${code}`)
      .then(response => {
        console.log('Promo code validation response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('Promo code validation response data:', data);
        setPromoCodeValid(data.isValid);
        setDiscount(data.isValid ? data.discountPercentage : 0);
        calculatePrice(formData.partySize, data.isValid ? data.discountPercentage : 0);
      })
      .catch(error => {
        console.error('Error validating promo code:', error);
        setPromoCodeValid(false);
        setDiscount(0);
      });
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Recalculate price when party size changes
    if (name === 'partySize') {
      calculatePrice(parseInt(value), discount);
    }
    
    // Validate promo code whenever it changes
    if (name === 'promoCode') {
      validatePromoCode(value);
    }
  };
  
  const handleDietaryRestrictionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const restriction = e.target.value;
    const isChecked = e.target.checked;
    
    if (isChecked) {
      // Add restriction to the array
      setFormData({
        ...formData,
        dietaryRestrictions: [...formData.dietaryRestrictions, restriction]
      });
    } else {
      // Remove restriction from the array
      setFormData({
        ...formData,
        dietaryRestrictions: formData.dietaryRestrictions.filter(item => item !== restriction)
      });
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('http://localhost:8080/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reservation');
      }
      
      setSubmitSuccess(true);
      // Optionally reset form or redirect
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to create reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a function to calculate the price
  const calculatePrice = (partySize: number, discountPercentage: number = 0) => {
    const personFee = Math.max(0, partySize - 1) * PER_PERSON_FEE; // First person included in base fee
    const subtotal = BASE_RESERVATION_FEE + personFee;
    const serviceFee = (subtotal * SERVICE_CHARGE_PERCENTAGE) / 100;
    const beforeDiscount = subtotal + serviceFee;
    const discountAmount = (beforeDiscount * discountPercentage) / 100;
    const total = beforeDiscount - discountAmount;
    
    setCalculatedPrice({
      baseFee: BASE_RESERVATION_FEE,
      serviceFee,
      personFee,
      subtotal: beforeDiscount,
      discountAmount,
      total
    });
  };

  // Initialize price calculation on component mount
  useEffect(() => {
    calculatePrice(formData.partySize);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">Make a Reservation</h1>
        <p className="text-tableease-textgray">Reserve your table at BookBite with just a few steps.</p>
        
        {submitSuccess ? (
          <Card className="bg-tableease-darkgray border-tableease-lightgray p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-tableease-primary mb-4">Reservation Successful!</h2>
              <p className="text-white mb-6">Your table has been reserved. We're looking forward to serving you!</p>
              <Button
                variant="primary"
                onClick={() => window.location.href = '/'}
              >
                Return to Home
              </Button>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 mt-8">
            {/* Main form */}
            <div className="lg:w-2/3 space-y-6">
              <Card className="bg-tableease-darkgray border-tableease-lightgray">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div 
                          className={`rounded-full h-10 w-10 flex items-center justify-center border-2 
                          ${step === i 
                            ? 'border-tableease-primary bg-tableease-primary text-black font-bold' 
                            : step > i 
                              ? 'border-tableease-primary bg-tableease-primary/20 text-tableease-primary' 
                              : 'border-tableease-lightgray text-tableease-textgray'
                          }`}
                        >
                          {i}
                        </div>
                        <span className={`text-xs mt-2 ${step === i ? 'text-tableease-primary' : 'text-tableease-textgray'}`}>
                          {i === 1 ? 'Meal' : i === 2 ? 'Billing' : 'Contact'}
                        </span>
                      </div>
                    ))}

                    <div className="hidden sm:block absolute left-0 right-0 h-0.5 top-5 -z-10">
                      <div className="h-full bg-tableease-lightgray">
                        <div 
                          className="h-full bg-tableease-primary transition-all" 
                          style={{ width: `${((step - 1) / 2) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 1: Meal Selection */}
                {step === 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Step 1: Select Your Meal</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-tableease-textgray text-sm font-medium mb-1">
                          Number of Guests
                        </label>
                        <select 
                          name="partySize"
                          value={formData.partySize}
                          onChange={handleInputChange}
                          className="bg-tableease-lightgray border-none text-white rounded-md p-2 focus:ring-1 focus:ring-tableease-primary w-full"
                        >
                          <option value={1}>1 Person</option>
                          <option value={2}>2 People</option>
                          <option value={3}>3 People</option>
                          <option value={4}>4 People</option>
                          <option value={5}>5 People</option>
                          <option value={6}>6 People</option>
                          <option value={7}>7 People</option>
                          <option value={8}>8 People</option>
                          <option value={10}>More than 8 people</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-tableease-textgray text-sm font-medium mb-1">
                          Reservation Date
                        </label>
                        <Input 
                          type="date"
                          name="reservationDate"
                          value={formData.reservationDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-tableease-textgray text-sm font-medium mb-1">
                          Start Time
                        </label>
                        <Input 
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-tableease-textgray text-sm font-medium mb-1">
                          End Time
                        </label>
                        <Input 
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-tableease-textgray text-sm font-medium mb-1">
                        Dietary Restrictions
                      </label>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        {COMMON_DIETARY_RESTRICTIONS.map(restriction => (
                          <label key={restriction} className="flex items-center text-white">
                            <input
                              type="checkbox"
                              value={restriction}
                              checked={formData.dietaryRestrictions.includes(restriction)}
                              onChange={handleDietaryRestrictionChange}
                              className="mr-2"
                            />
                            {restriction}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-tableease-textgray text-sm font-medium mb-1">
                        Special Requests
                      </label>
                      <Textarea 
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                        placeholder="Please let us know if you have any special requests..."
                        className="h-24"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-tableease-textgray text-sm font-medium mb-1">
                        Special Occasion?
                      </label>
                      <select
                        name="occasion"
                        value={formData.occasion || ''}
                        onChange={handleInputChange}
                        className="bg-tableease-lightgray border-none text-white rounded-md p-2 focus:ring-1 focus:ring-tableease-primary w-full"
                      >
                        <option value="">None</option>
                        {COMMON_OCCASIONS.map(occasion => (
                          <option key={occasion} value={occasion}>
                            {occasion}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Step 2: Billing Information */}
                {step === 2 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Step 2: Billing Information</h2>
                    
                    <div>
                      <label className="block text-tableease-textgray text-sm font-medium mb-1">
                        Billing Address
                      </label>
                      <Input 
                        placeholder="Enter your address"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-tableease-textgray text-sm font-medium mb-1">
                          Postal Code
                        </label>
                        <Input 
                          placeholder="Enter postal code"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-tableease-textgray text-sm font-medium mb-1">
                          City
                        </label>
                        <Input 
                          placeholder="Enter city"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Contact Information */}
                {step === 3 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">Step 3: Contact Information</h2>
                    
                    <div>
                      <label className="block text-tableease-textgray text-sm font-medium mb-1">
                        Email Address
                      </label>
                      <Input 
                        type="email"
                        placeholder="Enter your email address"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-tableease-textgray text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <Input 
                        type="tel"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-tableease-textgray text-sm font-medium mb-1">
                        Promo Code
                      </label>
                      <div className="flex space-x-2">
                        <Input 
                          name="promoCode"
                          value={formData.promoCode || ''}
                          onChange={handleInputChange}
                          placeholder="Enter promo code if you have one"
                        />
                        {formData.promoCode && (
                          <Badge color={promoCodeValid ? "green" : "red"} className="self-center">
                            {promoCodeValid ? `${discount}% OFF` : 'Invalid'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {submitError && (
                      <div className="bg-red-500/20 border border-red-500 p-3 rounded-md text-red-500">
                        {submitError}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button 
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center"
                    >
                      <ChevronLeftIcon className="h-5 w-5 mr-1" />
                      Back
                    </Button>
                  ) : (
                    <div></div> 
                  )}
                  
                  {step < 3 ? (
                    <Button 
                      variant="primary" 
                      onClick={nextStep}
                      className="flex items-center"
                    >
                      Next
                      <ChevronRightIcon className="h-5 w-5 ml-1" />
                    </Button>
                  ) : (
                    <Button 
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Reservation'}
                    </Button>
                  )}
                </div>
              </Card>
            </div>
            
            {/* Summary card */}
            <div className="lg:w-1/3">
              <Card className="bg-tableease-darkgray border-tableease-lightgray sticky top-4">
                <h2 className="text-xl font-semibold text-white mb-4">Reservation Summary</h2>
                
                {Object.entries(formData).length > 0 && (
                  <div className="space-y-3">
                    {formData.reservationDate && (
                      <div>
                        <p className="text-tableease-textgray text-sm">Date</p>
                        <p className="text-white">{new Date(formData.reservationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    )}
                    
                    {formData.startTime && formData.endTime && (
                      <div>
                        <p className="text-tableease-textgray text-sm">Time</p>
                        <p className="text-white">{formData.startTime} - {formData.endTime}</p>
                      </div>
                    )}
                    
                    {formData.partySize && (
                      <div>
                        <p className="text-tableease-textgray text-sm">Party Size</p>
                        <p className="text-white">{formData.partySize} {formData.partySize === 1 ? 'person' : 'people'}</p>
                      </div>
                    )}
                    
                    {formData.occasion && (
                      <div>
                        <p className="text-tableease-textgray text-sm">Occasion</p>
                        <p className="text-white">{formData.occasion}</p>
                      </div>
                    )}
                    
                    {formData.dietaryRestrictions.length > 0 && (
                      <div>
                        <p className="text-tableease-textgray text-sm">Dietary Restrictions</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.dietaryRestrictions.map((restriction) => (
                            <Badge key={restriction} color="primary" className="text-xs">
                              {restriction}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {formData.specialRequests && (
                      <div>
                        <p className="text-tableease-textgray text-sm">Special Requests</p>
                        <p className="text-white">{formData.specialRequests}</p>
                      </div>
                    )}
                    
                    {/* Add price breakdown section */}
                    <div className="mt-4 pt-4 border-t border-tableease-lightgray/40">
                      <p className="text-tableease-textgray text-sm font-medium mb-2">Price Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-tableease-textgray text-sm">Reservation Fee</span>
                          <span className="text-white">${calculatedPrice.baseFee.toFixed(2)}</span>
                        </div>
                        
                        {calculatedPrice.personFee > 0 && (
                          <div className="flex justify-between">
                            <span className="text-tableease-textgray text-sm">Additional Guests</span>
                            <span className="text-white">${calculatedPrice.personFee.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between">
                          <span className="text-tableease-textgray text-sm">Service Fee ({SERVICE_CHARGE_PERCENTAGE}%)</span>
                          <span className="text-white">${calculatedPrice.serviceFee.toFixed(2)}</span>
                        </div>
                        
                        {promoCodeValid && discount > 0 && (
                          <div className="flex justify-between text-green-500">
                            <span>Discount ({discount}%)</span>
                            <span>-${calculatedPrice.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        
                        <div className="flex justify-between font-medium pt-2 border-t border-tableease-lightgray/40">
                          <span className="text-white">Total</span>
                          <span className="text-tableease-primary">${calculatedPrice.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Promo code status indicator */}
                    {formData.promoCode && (
                      <div className="mt-2">
                        <p className="text-tableease-textgray text-sm">Promo Code Status</p>
                        <div className={`flex items-center mt-1 ${promoCodeValid ? 'text-green-500' : 'text-red-500'}`}>
                          <span className="text-sm">
                            {promoCodeValid 
                              ? `"${formData.promoCode}" applied successfully (${discount}% off)` 
                              : `"${formData.promoCode}" is invalid or expired`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="border-t border-tableease-lightgray/40 mt-4 pt-4">
                  <p className="text-tableease-textgray text-sm">Need to make changes?</p>
                  <p className="text-white text-sm">Call us at (555) 123-4567</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
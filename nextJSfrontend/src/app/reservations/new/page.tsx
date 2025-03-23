'use client';

import { useState, useEffect } from 'react';
import { Input, Textarea, Button, Card, Badge } from "@heroui/react";
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

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
  // Add billing information
  billingAddress?: string;
  postalCode?: string;
  city?: string;
  paymentMethod?: string;
  cardNumber?: string;
  cardLastFour?: string;
  paymentToken?: string;
  cardExpiry?: string;
  cardCvc?: string;
  nameOnCard?: string;
  // Add contact information
  email?: string;
  phoneNumber?: string;
  userId?: number;
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

// Add validation types and functions
interface ValidationError {
  field: string;
  message: string;
}

export default function ReservationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [promoCodeValid, setPromoCodeValid] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/reservations/new');
    }
  }, [user, router]);
  
  // Form data state
  const [formData, setFormData] = useState<ReservationFormData>({
    tableId: 1, // Default to the first table
    reservationDate: '',
    startTime: '',
    endTime: '',
    partySize: 2,
    specialRequests: '',
    dietaryRestrictions: [],
    // Initialize billing info fields
    billingAddress: '',
    postalCode: '',
    city: '',
    paymentMethod: 'creditCard', // Default payment method
    cardNumber: '',
    cardLastFour: '',
    paymentToken: '',
    cardExpiry: '',
    cardCvc: '',
    nameOnCard: '',
    // Initialize contact info fields
    email: '',
    phoneNumber: '',
    promoCode: '',
    userId: user?.id,
  });
  
  // Effect to log and update user data when it changes
  useEffect(() => {
    console.log('User context changed:', user);
    if (user) {
      console.log('User ID from context:', user.id);
      console.log('User context complete:', {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    }
  }, [user]);
  
  // Update userId when user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        userId: user.id,
        email: user.email || prev.email,
        phoneNumber: user.phone || prev.phoneNumber,
      }));
      console.log('Updated formData with userId:', user.id);
    }
  }, [user]);
  
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
  
  // Function to validate email format
  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  // Function to validate phone number
  const validatePhone = (phone: string): boolean => {
    // Basic validation - can be made more sophisticated
    return phone.replace(/[^0-9]/g, '').length >= 10;
  };
  
  // Validate postal code
  const validatePostalCode = (postalCode: string): boolean => {
    return postalCode.length > 3;
  };
  
  // Validate credit card number using Luhn algorithm
  const validateCardNumber = (cardNumber: string): boolean => {
    // Remove spaces and non-digits
    const digits = cardNumber.replace(/\D/g, '');
    
    if (digits.length < 13 || digits.length > 19) {
      return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let doubled = false;
    
    // Loop from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));
      
      // Double every second digit
      if (doubled) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      doubled = !doubled;
    }
    
    return sum % 10 === 0;
  };
  
  // Validate card expiry (MM/YY format)
  const validateCardExpiry = (expiry: string): boolean => {
    const pattern = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!pattern.test(expiry)) {
      return false;
    }
    
    // Extract month and year
    const [month, year] = expiry.split('/');
    const expiryDate = new Date();
    
    // Set to the first day of the next month
    expiryDate.setFullYear(2000 + parseInt(year), parseInt(month), 0);
    
    // Compare with current date
    const today = new Date();
    return expiryDate > today;
  };
  
  // Validate CVV/CVC (3-4 digits)
  const validateCVC = (cvc: string): boolean => {
    return /^[0-9]{3,4}$/.test(cvc);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Clear error for this field when user starts typing
    setFieldErrors({...fieldErrors, [name]: ''});
    
    // Handle checkbox inputs separately
    if (type === 'checkbox') {
      return; // This is handled by handleDietaryRestrictionChange
    }
    
    // Handle radio buttons
    if (type === 'radio') {
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
      return;
    }
    
    // Special handling for cardNumber to save last 4 digits
    if (name === 'cardNumber') {
      const cleanValue = value.replace(/\D/g, ''); // Remove non-digits
      const formatted = cleanValue.match(/.{1,4}/g)?.join(' ') || ''; // Format as 4-digit groups
      
      setFormData({
        ...formData,
        [name]: formatted,
        cardLastFour: cleanValue.slice(-4),
        // In a real app, this would be a token from a payment processor
        paymentToken: cleanValue ? `TOKEN_${Math.random().toString(36).substr(2, 9)}` : ''
      });
      return;
    }
    
    // Format card expiry
    if (name === 'cardExpiry') {
      const expiry = value.replace(/\D/g, '');
      if (expiry.length > 0) {
        const formatted = expiry.length <= 2 
          ? expiry 
          : `${expiry.substring(0, 2)}/${expiry.substring(2, 4)}`;
        
        setFormData({
          ...formData,
          [name]: formatted
        });
      } else {
        setFormData({
          ...formData,
          [name]: ''
        });
      }
      return;
    }
    
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
  
  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    let isValid = true;
    
    // Required fields validation
    if (!formData.reservationDate) {
      errors.reservationDate = 'Reservation date is required';
      isValid = false;
    }
    
    if (!formData.startTime) {
      errors.startTime = 'Start time is required';
      isValid = false;
    }
    
    if (formData.email && !validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
      errors.phoneNumber = 'Please enter a valid phone number';
      isValid = false;
    }
    
    // Billing form validation if payment method is credit card
    if (formData.paymentMethod === 'creditCard') {
      if (formData.billingAddress && formData.billingAddress.length < 5) {
        errors.billingAddress = 'Please enter a valid address';
        isValid = false;
      }
      
      if (formData.postalCode && !validatePostalCode(formData.postalCode)) {
        errors.postalCode = 'Please enter a valid postal code';
        isValid = false;
      }
      
      if (formData.cardNumber && !validateCardNumber(formData.cardNumber)) {
        errors.cardNumber = 'Please enter a valid card number';
        isValid = false;
      }
      
      if (formData.cardExpiry && !validateCardExpiry(formData.cardExpiry)) {
        errors.cardExpiry = 'Please enter a valid expiry date (MM/YY)';
        isValid = false;
      }
      
      if (formData.cardCvc && !validateCVC(formData.cardCvc)) {
        errors.cardCvc = 'Please enter a valid security code (3-4 digits)';
        isValid = false;
      }
    }
    
    setFieldErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    // Check if user is logged in
    if (!user) {
      setSubmitError('Please log in to make a reservation');
      setIsSubmitting(false);
      router.push('/auth/login?redirect=/reservations/new');
      return;
    }
    
    console.log('Current user:', user);
    console.log('User ID:', user.id);
    
    // Validate the form
    if (!validateForm()) {
      setSubmitError('Please correct the errors in the form');
      setIsSubmitting(false);
      return;
    }

    // Format the data for submission - Do not send full card details to backend
    const reservationData = {
      ...formData,
      userId: user.id, // Ensure userId is included
      // Add any additional calculated fields
      total: calculatedPrice.total,
      baseFee: calculatedPrice.baseFee,
      serviceFee: calculatedPrice.serviceFee,
      personFee: calculatedPrice.personFee,
      discountAmount: calculatedPrice.discountAmount,
      discountPercentage: discount,
      // Remove sensitive data but keep what we need
      cardNumber: undefined, // Remove for security
      cardCvc: undefined,    // Remove for security
      // Make sure these fields are explicitly included
      cardLastFour: formData.cardLastFour || '',
      paymentToken: formData.paymentToken || '',
      nameOnCard: formData.nameOnCard || '',
      // Add created timestamp
      created: new Date().toISOString()
    };
    
    console.log('Payment details being sent:', {
      cardLastFour: reservationData.cardLastFour,
      paymentToken: reservationData.paymentToken,
      nameOnCard: reservationData.nameOnCard
    });
    
    console.log('User ID being sent:', reservationData.userId);
    
    try {
      // Create a copy of the data and explicitly extract userId from user object
      const userData = user ? { id: user.id, role: user.role } : null;
      console.log('Current user data:', userData);
      
      const reservationDataWithUserId = {
        ...reservationData,
        userId: user?.id, // Ensure userId is set from user context
        id: user?.id,     // Also include as id for compatibility
      };
      
      console.log('Submitting reservation data:', reservationDataWithUserId);
      
      const response = await fetch('http://localhost:8080/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservationDataWithUserId)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create reservation');
      }
      
      setSubmitSuccess(true);
      console.log('Reservation created successfully:', data);
      // You could store the reservation ID for future reference
      // localStorage.setItem('lastReservationId', data.id);
    } catch (error) {
      console.error('Error creating reservation:', error);
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
    <div className="bg-tableease-dark min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Make a Reservation</h1>
          <p className="text-gray-400 mt-2">Reserve your table at BookBite with just a few steps.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            {submitSuccess ? (
              <Card className="bg-tableease-darkgray border border-gray-700 rounded-xl p-8 shadow-lg">
                <div className="text-center py-10">
                  <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-2">Reservation Confirmed!</h2>
                  <p className="text-gray-400 mb-6">Your reservation has been successfully booked.</p>
                  <p className="text-white mb-1">Confirmation number: <span className="font-medium">REF-{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</span></p>
                  <p className="text-gray-400 mb-8">A confirmation has been sent to your email.</p>
                  <Button variant="primary" size="lg" className="px-6 tableease-btn">
                    Return to Homepage
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-tableease-darkgray border border-gray-700 rounded-xl p-8 shadow-lg">
                {/* Step indicator */}
                <div className="step-indicator">
                  <div className={`step-circle ${step >= 1 ? 'active' : 'inactive'} ${step > 1 ? 'completed' : ''}`}>
                    1
                    <span className="absolute bottom-[-24px] whitespace-nowrap text-xs text-gray-400">Meal</span>
                  </div>
                  <div className={`step-connector ${step >= 2 ? 'active' : ''}`}></div>
                  <div className={`step-circle ${step >= 2 ? 'active' : 'inactive'} ${step > 2 ? 'completed' : ''}`}>
                    2
                    <span className="absolute bottom-[-24px] whitespace-nowrap text-xs text-gray-400">Billing</span>
                  </div>
                  <div className={`step-connector ${step >= 3 ? 'active' : ''}`}></div>
                  <div className={`step-circle ${step >= 3 ? 'active' : 'inactive'}`}>
                    3
                    <span className="absolute bottom-[-24px] whitespace-nowrap text-xs text-gray-400">Contact</span>
                  </div>
                </div>

                {/* Step 1: Select Your Meal */}
                {step === 1 && (
                  <div className="form-section">
                    <h2 className="form-section-heading">Step 1: Select Your Meal</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="form-group">
                        <label className="form-label">Number of Guests</label>
                        <select 
                          className="tableease-input w-full"
                          name="partySize"
                          value={formData.partySize}
                          onChange={handleInputChange}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Reservation Date</label>
                        <input 
                          type="date"
                          className="tableease-input w-full"
                          name="reservationDate"
                          value={formData.reservationDate}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="form-group">
                        <label className="form-label">Start Time</label>
                        <input 
                          type="time"
                          className="tableease-input w-full"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">End Time</label>
                        <input 
                          type="time"
                          className="tableease-input w-full"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Dietary Restrictions</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {COMMON_DIETARY_RESTRICTIONS.map((restriction) => (
                          <div key={restriction} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`restriction-${restriction}`}
                              value={restriction}
                              checked={formData.dietaryRestrictions.includes(restriction)}
                              onChange={handleDietaryRestrictionChange}
                              className="w-4 h-4 rounded border-gray-600 text-tableease-primary focus:ring-tableease-primary mr-2"
                            />
                            <label htmlFor={`restriction-${restriction}`} className="text-gray-300 text-sm">
                              {restriction}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Special Occasion?</label>
                      <select
                        className="tableease-input w-full"
                        name="occasion"
                        value={formData.occasion || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">None</option>
                        {COMMON_OCCASIONS.map(occasion => (
                          <option key={occasion} value={occasion}>{occasion}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group mb-0">
                      <label className="form-label">Special Requests</label>
                      <textarea
                        className="tableease-input w-full min-h-[120px]"
                        placeholder="Please let us know if you have any special requests..."
                        name="specialRequests"
                        value={formData.specialRequests}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Billing Information */}
                {step === 2 && (
                  <div className="form-section">
                    <h2 className="form-section-heading">Step 2: Billing Information</h2>
                    
                    <div className="form-group">
                      <label className="form-label">Billing Address</label>
                      <input 
                        type="text"
                        className={`tableease-input w-full ${fieldErrors.billingAddress ? 'border-red-500 bg-red-50' : ''}`}
                        name="billingAddress"
                        value={formData.billingAddress || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                      />
                      {fieldErrors.billingAddress && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.billingAddress}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="form-group">
                        <label className="form-label">Postal Code</label>
                        <input 
                          type="text"
                          className={`tableease-input w-full ${fieldErrors.postalCode ? 'border-red-500 bg-red-50' : ''}`}
                          name="postalCode"
                          value={formData.postalCode || ''}
                          onChange={handleInputChange}
                          placeholder="Enter postal code"
                        />
                        {fieldErrors.postalCode && (
                          <p className="text-red-500 text-xs mt-1">{fieldErrors.postalCode}</p>
                        )}
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input 
                          type="text"
                          className={`tableease-input w-full ${fieldErrors.city ? 'border-red-500 bg-red-50' : ''}`}
                          name="city"
                          value={formData.city || ''}
                          onChange={handleInputChange}
                          placeholder="Enter city"
                        />
                        {fieldErrors.city && (
                          <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                        )}
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                        <div className="relative">
                          <input 
                            type="radio" 
                            id="payment-card" 
                            name="paymentMethod" 
                            value="creditCard"
                            checked={formData.paymentMethod === 'creditCard'}
                            onChange={handleInputChange}
                            className="sr-only peer" 
                          />
                          <label htmlFor="payment-card" className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg peer-checked:border-tableease-primary peer-checked:bg-tableease-primary/10 cursor-pointer transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span className="text-sm text-gray-300">Credit Card</span>
                          </label>
                        </div>
                        <div className="relative">
                          <input 
                            type="radio" 
                            id="payment-paypal" 
                            name="paymentMethod" 
                            value="paypal"
                            checked={formData.paymentMethod === 'paypal'}
                            onChange={handleInputChange}
                            className="sr-only peer" 
                          />
                          <label htmlFor="payment-paypal" className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg peer-checked:border-tableease-primary peer-checked:bg-tableease-primary/10 cursor-pointer transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-300">PayPal</span>
                          </label>
                        </div>
                        <div className="relative">
                          <input 
                            type="radio" 
                            id="payment-apple" 
                            name="paymentMethod" 
                            value="applePay"
                            checked={formData.paymentMethod === 'applePay'}
                            onChange={handleInputChange}
                            className="sr-only peer" 
                          />
                          <label htmlFor="payment-apple" className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg peer-checked:border-tableease-primary peer-checked:bg-tableease-primary/10 cursor-pointer transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-300">Apple Pay</span>
                          </label>
                        </div>
                        <div className="relative">
                          <input 
                            type="radio" 
                            id="payment-google" 
                            name="paymentMethod" 
                            value="googlePay"
                            checked={formData.paymentMethod === 'googlePay'}
                            onChange={handleInputChange}
                            className="sr-only peer" 
                          />
                          <label htmlFor="payment-google" className="flex flex-col items-center justify-center p-3 border border-gray-600 rounded-lg peer-checked:border-tableease-primary peer-checked:bg-tableease-primary/10 cursor-pointer transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            <span className="text-sm text-gray-300">Google Pay</span>
                          </label>
                        </div>
                      </div>

                      {formData.paymentMethod === 'creditCard' && (
                        <div className="form-group">
                          <label className="form-label">Card Information</label>
                          <div className="space-y-4">
                            <div>
                              <input 
                                type="text"
                                className={`tableease-input w-full ${fieldErrors.cardNumber ? 'border-red-500 bg-red-50' : ''}`}
                                name="cardNumber"
                                value={formData.cardNumber || ''}
                                onChange={handleInputChange}
                                placeholder="Card number"
                              />
                              {fieldErrors.cardNumber && (
                                <p className="text-red-500 text-xs mt-1">{fieldErrors.cardNumber}</p>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <input 
                                  type="text"
                                  className={`tableease-input w-full ${fieldErrors.cardExpiry ? 'border-red-500 bg-red-50' : ''}`}
                                  name="cardExpiry"
                                  value={formData.cardExpiry || ''}
                                  onChange={handleInputChange}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                />
                                {fieldErrors.cardExpiry && (
                                  <p className="text-red-500 text-xs mt-1">{fieldErrors.cardExpiry}</p>
                                )}
                              </div>
                              <div>
                                <input 
                                  type="text"
                                  className={`tableease-input w-full ${fieldErrors.cardCvc ? 'border-red-500 bg-red-50' : ''}`}
                                  name="cardCvc"
                                  value={formData.cardCvc || ''}
                                  onChange={handleInputChange}
                                  placeholder="CVC"
                                  maxLength={4}
                                />
                                {fieldErrors.cardCvc && (
                                  <p className="text-red-500 text-xs mt-1">{fieldErrors.cardCvc}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="form-group mb-0">
                        <label className="form-label">Name on Card</label>
                        <input 
                          type="text"
                          className={`tableease-input w-full ${fieldErrors.nameOnCard ? 'border-red-500 bg-red-50' : ''}`}
                          name="nameOnCard"
                          value={formData.nameOnCard || ''}
                          onChange={handleInputChange}
                          placeholder="Enter name as shown on card"
                        />
                        {fieldErrors.nameOnCard && (
                          <p className="text-red-500 text-xs mt-1">{fieldErrors.nameOnCard}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Contact Information */}
                {step === 3 && (
                  <div className="form-section">
                    <h2 className="form-section-heading">Step 3: Contact Information</h2>
                    
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input 
                        type="email"
                        className={`tableease-input w-full ${fieldErrors.email ? 'border-red-500 bg-red-50' : ''}`}
                        name="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                      />
                      {fieldErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="tel"
                        className={`tableease-input w-full ${fieldErrors.phoneNumber ? 'border-red-500 bg-red-50' : ''}`}
                        name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                      {fieldErrors.phoneNumber && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.phoneNumber}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Promo Code</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="text"
                          className={`tableease-input w-full ${fieldErrors.promoCode ? 'border-red-500 bg-red-50' : ''}`}
                          name="promoCode"
                          value={formData.promoCode || ''}
                          onChange={handleInputChange}
                          placeholder="Enter promo code if you have one"
                        />
                        {formData.promoCode && (
                          <div className={`py-1 px-3 rounded-full text-white text-xs ${promoCodeValid ? 'bg-green-600' : 'bg-red-600'}`}>
                            {promoCodeValid ? `${discount}% OFF` : 'Invalid'}
                          </div>
                        )}
                      </div>
                      {fieldErrors.promoCode && (
                        <p className="text-red-500 text-xs mt-1">{fieldErrors.promoCode}</p>
                      )}
                    </div>
                    
                    {submitError && (
                      <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg text-red-500 mb-4">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {submitError}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-nav-buttons">
                  {step > 1 ? (
                    <Button 
                      onClick={prevStep}
                      className="flex items-center bg-transparent hover:bg-tableease-lightgray text-white border border-gray-600 px-5 py-2 rounded-lg transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div></div> 
                  )}
                  
                  {step < 3 ? (
                    <Button 
                      onClick={nextStep}
                      className="tableease-btn px-5 py-2 flex items-center"
                    >
                      Next
                      <ChevronRightIcon className="h-5 w-5 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="tableease-btn px-5 py-2"
                    >
                      {isSubmitting ? 'Submitting...' : 'Complete Reservation'}
                    </Button>
                  )}
                </div>
              </Card>
            )}
          </div>
          
          {/* Reservation Summary */}
          <div className="w-full lg:w-1/3">
            <Card className="bg-tableease-darkgray border border-gray-700 rounded-xl p-8 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-6 pb-3 border-b border-gray-700">Reservation Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-2">Party Size</h3>
                  <p className="text-white font-medium">{formData.partySize} {formData.partySize === 1 ? 'person' : 'people'}</p>
                </div>
                
                {formData.reservationDate && (
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Date & Time</h3>
                    <p className="text-white font-medium">
                      {new Date(formData.reservationDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      {formData.startTime && `, ${formData.startTime}`}
                    </p>
                  </div>
                )}
                
                {formData.occasion && (
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Occasion</h3>
                    <p className="text-white">{formData.occasion}</p>
                  </div>
                )}
                
                {formData.dietaryRestrictions.length > 0 && (
                  <div>
                    <h3 className="text-gray-400 text-sm font-medium mb-2">Dietary Restrictions</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.dietaryRestrictions.map(restriction => (
                        <span key={restriction} className="bg-tableease-lightgray text-white text-xs py-1 px-2 rounded-full">
                          {restriction}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 border-t border-gray-700 pt-4 mb-6">
                <h3 className="text-white font-medium mb-3">Price Breakdown</h3>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Reservation Fee</span>
                  <span className="text-white">${calculatedPrice.baseFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Additional Guests</span>
                  <span className="text-white">${calculatedPrice.personFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Service Fee ({SERVICE_CHARGE_PERCENTAGE}%)</span>
                  <span className="text-white">${calculatedPrice.serviceFee.toFixed(2)}</span>
                </div>
                
                {calculatedPrice.discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount ({discount}%)</span>
                    <span>-${calculatedPrice.discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-4">
                <span className="text-white">Total</span>
                <span className="text-tableease-primary">${calculatedPrice.total.toFixed(2)}</span>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm mb-2">Need to make changes?</p>
                <p className="text-white">Call us at <span className="text-tableease-primary">(555) 123-4567</span></p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 
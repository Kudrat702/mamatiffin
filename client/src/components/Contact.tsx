import React, { useState } from 'react';
import { Phone, MapPin, Clock, MessageCircle, Send, CheckCircle, AlertCircle, User } from 'lucide-react';
import { apiEndpoints } from '../configapi/api';

const Contact: React.FC = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Type guard to ensure name is not undefined
    if (!name) return;

    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: '' });
    }
  };

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!contactForm.name.trim() || contactForm.name.length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    
    if (!contactForm.email.trim() || !/\S+@\S+\.\S+/.test(contactForm.email)) {
      errors.push('Please enter a valid email address');
    }
    
    if (!contactForm.phone.trim() || !/^[0-9]{10}$/.test(contactForm.phone)) {
      errors.push('Please enter a valid 10-digit phone number');
    }
    
    if (!contactForm.subject) {
      errors.push('Please select a subject');
    }
    
    if (!contactForm.message.trim() || contactForm.message.length < 10) {
      errors.push('Message must be at least 10 characters long');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    // Validate form
    const errors = validateForm();
    if (errors.length > 0) {
      setSubmitStatus({
        type: 'error',
        message: errors[0]
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch(apiEndpoints.messages, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Message sent successfully! We will get back to you soon.'
        });
        
        // Reset form
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error: unknown) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Failed to send message. Please try again later.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Modern Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-8" 
               style={{ backgroundColor: 'rgb(50, 140, 129)' }}>
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6" style={{ color: 'rgb(50, 140, 129)' }}>
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're here to help you with any questions or concerns. Get in touch with our team and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Information - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Cards */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
              
              <div className="space-y-6">
                {/* WhatsApp */}
                <div className="group flex items-center space-x-5 p-5 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-100">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center" 
                       style={{ backgroundColor: 'rgb(50, 140, 129)' }}>
                    <Phone className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">WhatsApp</h3>
                    <p className="font-medium mb-1" style={{ color: 'rgb(50, 140, 129)' }}>
                      +91 7903528149
                    </p>
                    <p className="text-sm text-gray-600">24/7 Available for orders & support</p>
                  </div>
                </div>

                {/* Email
                <div className="group flex items-center space-x-5 p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-100">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                    <Mail className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-blue-600 font-medium mb-1">xgmail.com</p>
                    <p className="text-sm text-gray-600">For queries & feedback</p>
                  </div>
                </div> */}

                {/* Location */}
                <div className="group flex items-center space-x-5 p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 transition-all duration-300 border border-purple-100">
                  <div className="flex-shrink-0 w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Location</h3>
                    <p className="text-purple-600 font-medium mb-1">Matwari, Hazaribagh</p>
                    <p className="text-sm text-gray-600">Free delivery in Hazaribagh city</p>
                  </div>
                </div>

                {/* Service Hours */}
                <div className="group flex items-center space-x-5 p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all duration-300 border border-orange-100">
                  <div className="flex-shrink-0 w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Service Hours</h3>
                    <p className="text-orange-600 font-medium mb-1">7 AM - 10 PM</p>
                    <p className="text-sm text-gray-600">Monday to Sunday</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours Card */}
            {/* <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <Calendar className="w-8 h-8 mr-3" style={{ color: 'rgb(50, 140, 129)' }} />
                <h3 className="text-2xl font-bold text-gray-900">Business Hours</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Monday - Friday</span>
                  <span className="text-gray-900 font-semibold">7:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700 font-medium">Saturday</span>
                  <span className="text-gray-900 font-semibold">8:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 font-medium">Sunday</span>
                  <span className="text-gray-900 font-semibold">9:00 AM - 9:00 PM</span>
                </div>
              </div>
            </div> */}
          </div>

          {/* Contact Form - Right Side */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center mb-8">
                <User className="w-8 h-8 mr-3" style={{ color: 'rgb(50, 140, 129)' }} />
                <h2 className="text-3xl font-bold text-gray-900">Send us a Message</h2>
              </div>
              
              {/* Status Message */}
              {submitStatus.type && (
                <div className={`mb-8 p-5 rounded-2xl flex items-center space-x-4 ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-50 border-2 border-green-200 text-green-800'
                    : 'bg-red-50 border-2 border-red-200 text-red-800'
                }`}>
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  )}
                  <p className="font-medium">{submitStatus.message}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400"
                    style={{ '--tw-border-opacity': '1', borderColor: 'rgb(50, 140, 129)' } as React.CSSProperties}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={contactForm.phone}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400"
                    style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                    placeholder="10-digit phone number"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400"
                  style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Subject Field */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 bg-white"
                  style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="order">Order Related</option>
                  <option value="delivery">Delivery Issue</option>
                  <option value="subscription">Subscription Inquiry</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Message Field */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-current transition-all duration-300 text-gray-900 placeholder-gray-400 resize-none"
                  style={{ '--tw-border-opacity': '1' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = 'rgb(50, 140, 129)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgb(229, 231, 235)'}
                  placeholder="Please describe your message in detail..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full py-5 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'text-white hover:opacity-90'
                }`}
                style={{ 
                  backgroundColor: isSubmitting ? '#9ca3af' : 'rgb(50, 140, 129)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Sending Message...</span>
                  </>
                ) : (
                  <>
                    <Send size={24} />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-sm mt-4">
                We'll get back to you within 24 hours
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
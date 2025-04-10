import React, { useState } from 'react';
import { FiMail, FiX, FiSend, FiUser } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const CustomEmailForm = ({ isOpen, onClose }) => {
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSendEmail = async () => {
    if (!recipientEmail.trim() || !subject.trim() || !body.trim()) {
      toast.error('Please complete all fields');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSending(true);
    
    try {
      const response = await axios.post('/api/send-email', {
        email: recipientEmail,
        name: recipientName || 'Recipient',
        subject: subject,
        body: body.replace(/\n/g, '<br>')
      });
      
      if (response.data.success) {
        toast.success(`Email sent to ${recipientEmail}`);
        onClose();
        
        // Reset the form
        setRecipientName('');
        setRecipientEmail('');
        setSubject('');
        setBody('');
      } else {
        toast.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error.response?.data?.detail || 'Error sending email');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden scale-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="bg-primary-50 p-2 rounded-full mr-3">
              <FiMail className="text-primary-600 h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Send Custom Email
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="recipient-name" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Name:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="recipient-name"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Enter recipient name (optional)"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="recipient-email" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email: <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                id="recipient-email"
                className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient email"
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="email-subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="email-body" className="block text-sm font-medium text-gray-700 mb-1">
              Message: <span className="text-red-500">*</span>
            </label>
            <textarea
              id="email-body"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent min-h-[200px]"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter your message here..."
              required
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending}
              className={`btn btn-primary flex items-center ${isSending ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isSending ? (
                <>
                  <span className="mr-2">Sending</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                </>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomEmailForm;

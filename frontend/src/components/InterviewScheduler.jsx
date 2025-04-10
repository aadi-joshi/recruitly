import React, { useState } from 'react';
import { FiCalendar, FiX, FiClock, FiSend, FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const InterviewScheduler = ({ candidate, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState(`Hi ${candidate?.name},\n\nWe'd like to schedule an interview to discuss your application further. Please confirm if the proposed time works for you.`);
  const [isSending, setIsSending] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Generate available times (normally would come from the API)
  const generateAvailableTimes = () => {
    const times = [];
    for (let i = 9; i <= 16; i++) {
      times.push(`${i}:00`);
      if (i !== 16) times.push(`${i}:30`);
    }
    return times;
  };
  
  // Generate next 7 business days (normally would check against calendar API)
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const handleSendInvite = async () => {
    if (!selectedDate || !selectedTime) {
      toast.warning('Please select both date and time');
      return;
    }
    
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setShowConfirmation(true);
    }, 1500);
    
    // In a real implementation, you would call the API:
    // try {
    //   await axios.post('/api/schedule-interview', {
    //     candidateId: candidate.id,
    //     date: selectedDate,
    //     time: selectedTime,
    //     notes: notes
    //   });
    //   setShowConfirmation(true);
    // } catch (error) {
    //   toast.error('Failed to schedule interview');
    // } finally {
    //   setIsSending(false);
    // }
  };

  return (
    <div className="p-0">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="bg-green-50 p-2 rounded-lg mr-3">
            <FiCalendar className="text-green-600 h-5 w-5" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">
            Schedule Interview with {candidate?.name}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      {!showConfirmation ? (
        <div className="p-5">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date:</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Select a date</option>
              {generateAvailableDates().map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time:</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              disabled={!selectedDate}
            >
              <option value="">Select a time</option>
              {generateAvailableTimes().map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes:</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400 min-h-[100px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSendInvite}
              disabled={isSending || !selectedDate || !selectedTime}
              className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center ${
                (isSending || !selectedDate || !selectedTime) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSending ? (
                <>
                  <span className="mr-2">Sending</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                </>
              ) : (
                <>
                  <FiSend className="mr-2" />
                  Send Interview Invitation
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-5">
          <div className="text-center py-8">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <FiCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Interview Scheduled!</h3>
            <p className="text-gray-600 mb-6">
              An invitation has been sent to {candidate?.name} for an interview on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {selectedTime}.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;

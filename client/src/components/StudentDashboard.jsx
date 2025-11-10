import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import PaymentForm from './PaymentForm';
import '../styles/Dashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  const [payments, setPayments] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedText, setAnimatedText] = useState({
    line1: '',
    line2: '',
    line3: ''
  });

  const slides = [
    'https://vignan.ac.in/newvignan/assets/images/home/image-11.webp',
    'https://vignan.ac.in/newvignan/assets/images/home/image-12.webp',
    'https://akm-img-a-in.tosshub.com/sites/resources/campus/prod/img/videos/2023/8/thumbnail170564767163.jpg'
  ];

  useEffect(() => {
    fetchPayments();
    
    // Text animation
    const textAnimation = setTimeout(() => {
      animateText();
    }, 500);

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(textAnimation);
    };
  }, []);

  const animateText = () => {
    const collegeName = "Vignan's Online Payment System";
    const tagline = "FOUNDATION FOR SCIENTIFIC RESEARCH & EDUCATION";
    const welcomeText = `Welcome ${user?.name || 'Student'}, to Vignan's Online Payments`;

    // Animate first line
    let i = 0;
    const typeLine1 = setInterval(() => {
      if (i <= collegeName.length) {
        setAnimatedText(prev => ({ ...prev, line1: collegeName.slice(0, i) }));
        i++;
      } else {
        clearInterval(typeLine1);
        // Start second line
        let j = 0;
        const typeLine2 = setInterval(() => {
          if (j <= tagline.length) {
            setAnimatedText(prev => ({ ...prev, line2: tagline.slice(0, j) }));
            j++;
          } else {
            clearInterval(typeLine2);
            // Start third line
            let k = 0;
            const typeLine3 = setInterval(() => {
              if (k <= welcomeText.length) {
                setAnimatedText(prev => ({ ...prev, line3: welcomeText.slice(0, k) }));
                k++;
              } else {
                clearInterval(typeLine3);
              }
            }, 50);
          }
        }, 30);
      }
    }, 80);
  };

  const fetchPayments = async () => {
    try {
      const response = await paymentAPI.getStudentPayments();
      setPayments(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to fetch payments');
      setPayments([]);
    }
  };

  const hasPaid = (feeType) => {
    return Array.isArray(payments) && payments.some(payment => 
      payment?.feeType === feeType && payment?.status === 'completed'
    );
  };

  const feeDetails = {
    tuition: { amount: 50000, name: 'Tuition Fee' },
    bus: { amount: 10000, name: 'Bus Fee' },
    hostel: { amount: 30000, name: 'Hostel Fee' },
    supply: { amount: 1000, name: 'Supply Fee' },
    condonation: { amount: 500, name: 'Condonation Fee' },
    uniform: { amount: 1500, name: 'Uniform Fee' },
    idcard: { amount: 100, name: 'ID Fee' },
    crt: { amount: 5000, name: 'CRT Fee' },
    other_registrations: { amount: 500, name: 'Other Fee' }
  };

  return (
    <div className="dashboard">
      {/* Updated Animated Welcome Section - Centered and Clean */}
      <div className="welcome-section-fullwidth">
        <div className="welcome-container-fullwidth">
          <div className="college-brand-fullwidth">
            <h1 className="college-name-fullwidth typing-animation">
              {animatedText.line1}
              <span className="cursor">|</span>
            </h1>
            <div className="college-tagline-fullwidth slide-in-animation">
              {animatedText.line2}
            </div>
          </div>
          <div className="welcome-message-fullwidth fade-in-animation">
            {animatedText.line3}
          </div>
        </div>
      </div>

      {/* Rest of your components remain exactly the same */}
      <div className="slideshow-section">
        <div className="slideshow">
          <div 
            className="slideshow-container"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => (
              <div key={index} className="slide">
                <img src={slide} alt={`Campus ${index + 1}`} />
                <div className="slide-overlay"></div>
              </div>
            ))}
          </div>
          <div className="slideshow-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="benefits-section">
        <h2>Benefits of Online Fee Payment</h2>
        <ul>
          <li>⭐ Instant payment confirmation</li>
          <li>⭐ 24/7 availability</li>
          <li>⭐ Secure payment gateway</li>
          <li>⭐ Digital receipt generation</li>
          <li>⭐ No waiting in queues</li>
          <li>⭐ Environment friendly</li>
          <li>⭐ Flexibility</li>
          <li>⭐ Reduces Administrative Burden</li>
          <li>⭐ Financial Management</li>
        </ul>
      </div>

      <div className="payment-prompt">
        <h2>Want to pay fee?</h2>
        <div className="payment-buttons">
          <button 
            className="btn-yes"
            onClick={() => setShowPaymentOptions(true)}
          >
            Yes, Pay Online
          </button>
          <button className="btn-no">
            Not Now
          </button>
        </div>
      </div>

      {showPaymentOptions && (
        <div className="fee-options">
          <h3>Select Fee Type</h3>
          <div className="fee-cards">
            {Object.entries(feeDetails).map(([type, details]) => (
              <div key={type} className={`fee-card ${hasPaid(type) ? 'paid' : ''}`}>
                <h4>{details.name}</h4>
                <p>Amount: ₹{details.amount}</p>
                {hasPaid(type) ? (
                  <div className="paid-badge">✅ Paid</div>
                ) : (
                  <button 
                    className="pay-btn"
                    onClick={() => setSelectedFeeType(type)}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFeeType && (
        <PaymentForm
          feeType={selectedFeeType}
          amount={feeDetails[selectedFeeType].amount}
          onClose={() => {
            setSelectedFeeType(null);
            fetchPayments();
          }}
        />
      )}

      <div className="payment-history">
        <h3>Your Payment History</h3>
        {!payments || payments.length === 0 ? (
          <p>No payments made yet</p>
        ) : (
          <div className="payment-list">
            {payments.map((payment, index) => (
              <div key={payment?._id || `payment-${index}`} className="payment-item">
                <span>{(payment?.feeType || 'Unknown').toUpperCase()} Fee</span>
                <span>₹{payment?.amount || 'N/A'}</span>
                <span className={`status ${payment?.status || 'unknown'}`}>
                  {payment?.status || 'Unknown'}
                </span>
                <span>
                  {payment?.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'Date not available'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
import React, { useState } from 'react';
import { paymentAPI } from '../utils/api';
import { toast } from 'react-toastify';
import Receipt from './Receipt';
import '../styles/Dashboard.css';


const PaymentForm = ({ feeType, amount, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [customAmount, setCustomAmount] = useState(amount); 
  const [completedPayment, setCompletedPayment] = useState(null);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load');
        return;
      }

      const orderResponse = await paymentAPI.createOrder({
        feeType,
        amount: customAmount
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Vignan University',
        description: `${feeType} Fee Payment`,
        order_id: orderResponse.data.orderId,
        handler: async function(response) {
          try {
            // Verify payment
            await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: orderResponse.data.paymentId
            });

            // Fetch the completed payment details
            const paymentsResponse = await paymentAPI.getStudentPayments();
            const latestPayment = paymentsResponse.data.find(
              payment => payment.razorpayOrderId === orderResponse.data.orderId
            );
            
            if (latestPayment) {
              setCompletedPayment(latestPayment);
              setShowReceipt(true);
              toast.success('Payment successful!');
            } else {
              toast.error('Payment verification completed but receipt not available');
              onClose();
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed');
            onClose();
          }
        },
        prefill: {
          name: 'Student Name',
          email: 'student@vignan.com',
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: function() {
            toast.info('Payment cancelled by user');
            setLoading(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function(response) {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      paymentObject.open();
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Payment initiation failed');
      setLoading(false);
    }
  };

  const handleReceiptClose = () => {
    setShowReceipt(false);
    setCompletedPayment(null);
    onClose();
  };

  // Show receipt if payment is completed
  if (showReceipt && completedPayment) {
    return (
      <Receipt 
        payment={completedPayment} 
        onClose={handleReceiptClose}
      />
    );
  }

  return (
    <div className="payment-modal">
      <div className="payment-form">
        <div className="payment-header">
          <h3>Payment Details</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="payment-info">
          <div className="fee-details">
            <div className="fee-item">
              <span className="fee-label">Fee Type:</span>
              <span className="fee-value">{getFeeTypeName(feeType)}</span>
            </div>
            <div className="fee-item">
              <span className="fee-label">Amount:</span>
              <div className="amount-input-container">
                  <input
                    type="number"
                    className="partial-amount-input"
                    value={customAmount}
                    onChange={(e) => {
                    let val = Number(e.target.value);
                    // ✅ Prevent negative or invalid numbers
                    if (val < 1) val = 1;
                    // ✅ Prevent user entering above total
                    if (val > amount) val = amount;
                    setCustomAmount(val);
                  }}
                    min="1"
                    max={amount}
                    placeholder="Enter amount"
                  />

                <small className="note">Maximum: ₹{amount.toLocaleString()}</small>
              </div>
            </div>

            <div className="fee-item">
              <span className="fee-label">Payment Method:</span>
              <span className="fee-value">Razorpay (Secure)</span>
            </div>
          </div>

          <div className="security-features">
            <h4>🔒 Secure Payment</h4>
            <ul>
              <li>✅ SSL Encrypted Transaction</li>
              <li>✅ PCI DSS Compliant</li>
              <li>✅ Instant Confirmation</li>
              <li>✅ Digital Receipt</li>
            </ul>
          </div>
        </div>
        
        <div className="payment-actions">
          <button 
            className="pay-now-btn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Processing...
              </>
            ) : (
              `Pay ₹${customAmount.toLocaleString()}`
            )}
          </button>
          <button 
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

        <div className="payment-footer">
          <p>By proceeding, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

// Helper function to get proper fee type name
const getFeeTypeName = (feeType) => {
  const feeNames = {
    tuition: 'Tuition Fee',
    bus: 'Bus Transportation Fee',
    hostel: 'Hostel Accommodation Fee'
  };
  return feeNames[feeType] || feeType;
};

export default PaymentForm;
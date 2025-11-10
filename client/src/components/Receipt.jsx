import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const Receipt = ({ payment, onClose }) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isSending, setIsSending] = useState(false);
  const receiptRef = useRef();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFeeTypeName = (feeType) => {
    const feeNames = {
      tuition: 'Tuition Fee',
      bus: 'Bus Fee',
      hostel: 'Hostel Fee'
    };
    return feeNames[feeType] || feeType;
  };

  const handleSendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSending(true);
    try {
      // In a real implementation, you would call an API endpoint to send the receipt
      // await receiptAPI.sendReceipt({ email, paymentId: payment._id });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Receipt sent successfully to ${email}`);
    } catch (error) {
      toast.error('Failed to send receipt');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = () => {
    // In a real implementation, you would generate a PDF
    toast.info('Download functionality would be implemented here');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-modal">
      <div className="receipt-container">
        <div className="receipt-header">
          <h2>Payment Receipt</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="receipt-content" ref={receiptRef}>
          {/* University Header */}
          <div className="receipt-university-header">
            <h1>Vignan University</h1>
            <p>Approved by AICTE & Affiliated to JNTU</p>
            <p>Vadlamudi, Guntur - 522213, Andhra Pradesh</p>
          </div>

          {/* Receipt Details */}
          <div className="receipt-details">
            <div className="receipt-meta">
              <div className="receipt-number">
                <strong>Receipt No:</strong> RCPT{payment._id.slice(-8).toUpperCase()}
              </div>
              <div className="receipt-date">
                <strong>Date:</strong> {formatDate(payment.createdAt)}
              </div>
            </div>

            <div className="student-info">
              <h3>Student Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Name:</strong> {user?.name}
                </div>
                <div className="info-item">
                  <strong>Registration No:</strong> {user?.regNo}
                </div>
                <div className="info-item">
                  <strong>Department:</strong> {user?.department}
                </div>
                <div className="info-item">
                  <strong>Email:</strong> {user?.email}
                </div>
                <div className="info-item">
                  <strong>Mobile:</strong> {user?.mobile}
                </div>
              </div>
            </div>

            <div className="payment-info">
              <h3>Payment Details</h3>
              <table className="payment-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{getFeeTypeName(payment.feeType)}</td>
                    <td>₹{payment.amount}</td>
                    <td className="status-completed">
                      <span className="status-badge">Completed</span>
                    </td>
                  </tr>
                  <tr className="total-row">
                    <td><strong>Total Amount</strong></td>
                    <td colSpan="2"><strong>₹{payment.amount}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="transaction-info">
              <h3>Transaction Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <strong>Transaction ID:</strong> {payment.razorpayPaymentId}
                </div>
                <div className="info-item">
                  <strong>Order ID:</strong> {payment.razorpayOrderId}
                </div>
                <div className="info-item">
                  <strong>Payment Method:</strong> Razorpay
                </div>
                <div className="info-item">
                  <strong>Payment Date:</strong> {formatDate(payment.updatedAt)}
                </div>
              </div>
            </div>

            {/* Authorization */}
            <div className="authorization">
              <div className="signature">
                <p>_________________________</p>
                <p>Authorized Signature</p>
              </div>
              <div className="stamp">
                <div className="stamp-circle">
                  <span>PAID</span>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="receipt-footer">
              <p>
                <strong>Note:</strong> This is a computer-generated receipt and does not require a physical signature.
              </p>
              <p>
                For any queries, contact: accounts@vignanuniversity.edu.in | Phone: +91-863-2345678
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="receipt-actions">
          <div className="email-section">
            <input
              type="email"
              placeholder="Enter email to send receipt"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="email-input"
            />
            <button 
              onClick={handleSendEmail} 
              disabled={isSending}
              className="send-email-btn"
            >
              {isSending ? 'Sending...' : 'Send to Email'}
            </button>
          </div>
          
          <div className="action-buttons">
            <button onClick={handleDownload} className="download-btn">
              📥 Download PDF
            </button>
            <button onClick={handlePrint} className="print-btn">
              🖨️ Print Receipt
            </button>
            <button onClick={onClose} className="close-receipt-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
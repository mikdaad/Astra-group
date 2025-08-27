"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

export type PaymentReceiptData = {
  transactionId: string;
  amount: number;
  paymentType: "registration" | "card_issue" | "subscription" | "scheme_payment";
  schemeName?: string;
  month?: string;
  periodIndex?: number;
  cardId?: string;
  schemeId?: string;
  timestamp: string;
  userName: string;
  userPhone: string;
  paymentMethod: string;
  status: string;
  // Optional fields for different payment types
  referralCode?: string;
  userId?: string;
  description?: string;
};

interface PaymentSuccessPopupProps {
  receipt: PaymentReceiptData;
  onClose: () => void;
  onPrintReceipt?: () => void;
  customTitle?: string;
  customSuccessMessage?: string;
}

export function PaymentSuccessPopup({ 
  receipt, 
  onClose, 
  onPrintReceipt,
  customTitle,
  customSuccessMessage
}: PaymentSuccessPopupProps) {
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowReceipt(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Get title based on payment type
  const getReceiptTitle = () => {
    if (customTitle) return customTitle;
    
    switch (receipt.paymentType) {
      case "registration":
        return "REGISTRATION RECEIPT";
      case "card_issue":
        return "CARD ISSUE RECEIPT";
      case "subscription":
      case "scheme_payment":
        return "PAYMENT RECEIPT";
      default:
        return "PAYMENT RECEIPT";
    }
  };

  // Get success message based on payment type
  const getSuccessMessage = () => {
    if (customSuccessMessage) return customSuccessMessage;
    
    switch (receipt.paymentType) {
      case "registration":
        return `Your registration fee of ₹${receipt.amount} has been processed successfully.`;
      case "card_issue":
        return `Your card issue payment of ₹${receipt.amount} has been processed successfully.`;
      case "subscription":
      case "scheme_payment":
        return `Your payment of ₹${receipt.amount} has been processed successfully.`;
      default:
        return `Your payment of ₹${receipt.amount} has been processed successfully.`;
    }
  };

  // Get header color based on payment type
  const getHeaderColor = () => {
    switch (receipt.paymentType) {
      case "registration":
        return "bg-blue-600";
      case "card_issue":
        return "bg-purple-600";
      case "subscription":
      case "scheme_payment":
        return "bg-green-600";
      default:
        return "bg-green-600";
    }
  };

  const handlePrintReceipt = () => {
    if (onPrintReceipt) {
      onPrintReceipt();
    } else {
      // Default print functionality
      const content = generateReceiptContent();
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt_${receipt.transactionId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const generateReceiptContent = () => {
    return `
${getReceiptTitle()}
${receipt.userName}
TRANSACTION ID: ${receipt.transactionId}

Amount: ₹${receipt.amount.toFixed(2)}
${receipt.schemeName ? `Scheme: ${receipt.schemeName}` : ''}
${receipt.month ? `Month: ${receipt.month}` : ''}
${receipt.periodIndex ? `Period Index: ${receipt.periodIndex}` : ''}
${receipt.cardId ? `Card ID: ${receipt.cardId}` : ''}
${receipt.referralCode ? `Referral Code: ${receipt.referralCode}` : ''}
Phone: ${receipt.userPhone}
Payment Method: ${receipt.paymentMethod}
Status: ${receipt.status}
Date & Time: ${new Date(receipt.timestamp).toLocaleString()}
${receipt.description ? `Description: ${receipt.description}` : ''}
    `.trim();
  };

  if (!showReceipt) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white text-center max-w-sm w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <motion.svg
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
            >
              <path d="M20 6L9 17l-5-5" />
            </motion.svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="text-2xl font-bold mb-2"
          >
            Payment Successful!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="text-white/90 mb-4"
          >
            {getSuccessMessage()}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.4 }}
            className="text-sm text-white/70"
          >
            Preparing your receipt...
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-900 overflow-hidden z-50">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      </div>
      <div className="relative z-10 h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-start min-h-full p-4 py-8">
          <div className="flex flex-col w-full max-w-md mx-auto space-y-6">
            
            {/* Close Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onClose}
              className="self-end text-white/80 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
            
            {/* Receipt Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative w-full"
            >
              <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
                <div className="relative z-20 pt-16 pb-16 px-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-center mb-6"
                  >
                    <div className={`${getHeaderColor()} text-white py-2 px-4 rounded-t-lg`}>
                      <h1 className="text-lg font-bold">{getReceiptTitle()}</h1>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-b-lg">
                      <h2 className="text-xl font-bold">{receipt.userName}</h2>
                      <p className="text-sm opacity-90">TRANSACTION ID</p>
                      <p className="text-lg font-semibold">{receipt.transactionId}</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="space-y-3 mb-6"
                  >
                    <ReceiptRow label="Amount" value={`₹${receipt.amount.toFixed(2)}`} />
                    {receipt.schemeName && <ReceiptRow label="Scheme" value={receipt.schemeName} />}
                    {receipt.month && <ReceiptRow label="Month" value={receipt.month} />}
                    {receipt.periodIndex && <ReceiptRow label="Period Index" value={String(receipt.periodIndex)} />}
                    {receipt.cardId && <ReceiptRow label="Card ID" value={receipt.cardId} />}
                    {receipt.referralCode && <ReceiptRow label="Referral Code" value={receipt.referralCode} />}
                    <ReceiptRow label="Phone" value={receipt.userPhone} />
                    <ReceiptRow label="Payment Method" value={receipt.paymentMethod} />
                    <ReceiptRow label="Status" value={receipt.status} />
                    <ReceiptRow label="Date & Time" value={new Date(receipt.timestamp).toLocaleString()} />
                    {receipt.description && <ReceiptRow label="Description" value={receipt.description} />}
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="flex flex-col gap-4 w-full"
            >
              <button
                onClick={handlePrintReceipt}
                className="flex items-center justify-center gap-3 bg-transparent border-2 border-white/30 text-white py-3 px-6 rounded-lg hover:bg-white/10 transition-all duration-200 min-h-[52px]"
              >
                <Download size={20} />
                <span className="font-medium">Print Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 min-h-[52px]"
              >
                <span className="font-medium">Close</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for receipt rows
function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-600 text-sm font-medium">{label}</span>
      <span className="text-gray-800 text-sm font-semibold">{value}</span>
    </div>
  );
}
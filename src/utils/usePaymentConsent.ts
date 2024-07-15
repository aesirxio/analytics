import { useEffect, useState } from 'react';

declare global {
  interface Window {
    funcAfterPaymentConsent: any;
  }
}
const usePaymentConsent = () => {
  const [showPaymentConsent, setShowPaymentConsent] = useState<Boolean>(false);

  const openPaymentConsent = () => {
    setShowPaymentConsent(true);
  };
  const handleConsent = () => {
    sessionStorage.setItem('aesirx-analytics-payment', 'true');
    window?.funcAfterPaymentConsent && window.funcAfterPaymentConsent();
    setShowPaymentConsent(false);
  };
  const closePaymentConsent = () => {
    setShowPaymentConsent(false);
  };

  useEffect(() => {
    if (sessionStorage.getItem('aesirx-analytics-payment') === 'true') {
      window.funcAfterPaymentConsent && window.funcAfterPaymentConsent();
    }
  }, []);

  return {
    showPaymentConsent,
    openPaymentConsent,
    handleConsent,
    closePaymentConsent,
  };
};

export default usePaymentConsent;

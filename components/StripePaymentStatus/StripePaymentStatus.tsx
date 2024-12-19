import { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useStripe } from '@stripe/react-stripe-js';
import { StatusPopup } from '../popups/StatusPopup';

interface Props {
  successMessage: string;
  replaceUrl: string;
}

export const StripePaymentStatus: FC<Props> = ({ replaceUrl, successMessage }) => {
  const router = useRouter();
  const stripe = useStripe();
  const [status, setStatus] = useState<'success' | 'failure' | 'processing' | undefined>();
  const { payment_intent_client_secret } = router.query;
  const handleClose = async () => {
    await router.push(replaceUrl);
    router.reload();
  };
  useEffect(() => {
    if (!stripe || !payment_intent_client_secret || typeof payment_intent_client_secret !== 'string') return;
    stripe
      .retrievePaymentIntent(payment_intent_client_secret)
      .then(({ paymentIntent }) => {
        switch (paymentIntent?.status) {
          case 'succeeded':
            setStatus('success');
            break;
          case 'processing':
            setStatus('processing');
            break;
          case 'requires_payment_method':
          default:
            setStatus('failure');
            break;
        }
      })
  }, [payment_intent_client_secret, stripe]);

  return (
    <>
      {status === 'failure' && (
        <StatusPopup label="Payment failed." type="failure" onClose={handleClose} />
      )}
      {status === 'processing' && (
        <StatusPopup label="Payment processing." type="info" onClose={handleClose} />
      )}
      {status === 'success' && (
        <StatusPopup label={successMessage} type="success" onClose={handleClose} />
      )}
    </>
  );
};

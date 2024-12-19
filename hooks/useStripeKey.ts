import { loadStripe } from '@stripe/stripe-js';

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_KEY;
if (!stripeKey) throw new Error('Stripe key not specified');
const stripePromise = loadStripe(stripeKey);

export const useStripeData = () => ({ stripeKey, stripePromise });

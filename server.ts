/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';

dotenv.config();

const app = express();
const PORT = 3000;

// Mount json body parser
app.use(express.json());

// Lazy-initialize Stripe client
let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripeClient) {
    // Avoid API version type mismatch blockages by typing cast
    stripeClient = new Stripe(key, {
      apiVersion: '2023-10-16' as any,
    });
  }
  return stripeClient;
}

// -------------------------------------------------------------
// SECURED API GATEWAY ROUTINGS
// -------------------------------------------------------------

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Secure payments checkout session creator
app.post('/api/checkout-session', async (req, res) => {
  try {
    const { items, email, userId, shippingAddress } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Shopping cart items array is required.' });
      return;
    }

    const stripe = getStripe();
    if (!stripe) {
      console.warn('STRIPE_SECRET_KEY was not supplied. Falling back to sandbox simulator mode.');
      res.json({
        stripeActive: false,
        message: 'Stripe credentials missing in server secrets. Pre-authorizing transactional sandbox.'
      });
      return;
    }

    // Convert cart items into secure Stripe Hosted Checkout price lines
    // RWF is not directly supported by all global card standard providers as a checkout currency
    // so we can convert RWF to USD or check if RWF works (usually we convert or fallback to USD at e.g. 1 USD = 1300 RWF)
    // To ensure compatibility with international Stripe accounts we will use USD or EUR, or RWF if account supports it.
    // Let's settle on USD for global payment standards (1 USD ~ 1300 RWF). This prevents currency restriction rejections!
    const lineItems = items.map((item: any) => {
      const priceInUSD = Math.max(1, Math.round(item.price / 1300));
      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
            description: `Model division checkout checkout`,
          },
          unit_amount: priceInUSD * 100, // Stripe requires subunit currency formats (cents)
        },
        quantity: item.quantity,
      };
    });

    const appUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');

    // Construct checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `${appUrl}/?status=success&orderId=LV-{CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?status=cancelled`,
      metadata: {
        userId,
        customerName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        district: shippingAddress.district,
        street: shippingAddress.streetAddress,
        kigaliNotes: shippingAddress.notes || 'none'
      }
    });

    res.json({
      stripeActive: true,
      url: session.url,
      sessionId: session.id
    });
  } catch (err: any) {
    console.error('Stripe API transactional error:', err);
    res.status(500).json({ error: err.message || 'Stripe payments creation failed.' });
  }
});

// -------------------------------------------------------------
// VITE OR STATIC PLATFORM SERVER MIDDLEWARE SETUP
// -------------------------------------------------------------
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LISA VOLT LINK Kigali Server bound to http://localhost:${PORT}`);
  });
}

bootstrap();

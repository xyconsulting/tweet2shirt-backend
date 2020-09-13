require('dotenv').config({path: './.env'});

const express = require('express');
const cors = require('cors')
const app = express();

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

app.use(express.json());
app.use(cors({origin:true,credentials: true}));

app.post("/create-checkout-session", async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        shipping_address_collection: {
            allowed_countries: ['US'],
        },
        payment_method_types: ["card"],
        line_items: [
            {
                price:req.body.id,
                quantity: 1,
            },
        ],
        payment_intent_data: {
            metadata: {
                image: req.body.product.images[1],
                variant: req.body.size
            },
        },
        mode: "payment",
        success_url: "http://localhost:3000/thanks",
        cancel_url: `http://localhost:3000/product/${req.body.id}`,
    });
    res.json({ id: session.id });
});

app.post("/create-payment-intent", async (req, res) => {
    const intent = await stripe.paymentIntents.create({
        amount: 3000,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {
            size:req.body.size,
            image:req.body.image
        },
    });
    console.log("Did it!")
    res.json({'secret':intent.client_secret});
});

app.post("/price", async (req, res) => {
    const priceId = req.body.id;
    const price = await stripe.prices.retrieve(priceId, {
        expand: ['product']
    });
    console.log(price)
    res.json(price);
});

app.listen(4242, () => console.log("running on http://localhost:4242"));
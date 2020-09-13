require('dotenv').config({path: './.env'});

const express = require('express');
const cors = require('cors')
const app = express();

const stripe = require('stripe')(process.env.STRIPE_TEST_SECRET_KEY);

app.get('/', (req, res) => {
    res.send("Yo this worked");
});
app.use(express.json());
app.use(cors());

app.post("/create-checkout-session", async (req, res) => {
    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        shipping_address_collection: {
            allowed_countries: ['US'],
        },
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: req.body.name,
                        images:[
                            req.body.mockup
                        ]
                    },
                    unit_amount: 2000,
                },
                quantity: 1,
            },
        ],
        payment_intent_data: {
            metadata: {
                id: req.body.id,
                image: req.body.mockup,
                variant: 4013
            },
        },
        mode: "payment",
        success_url: "http://localhost:3000/123456",
        cancel_url: "http://localhost:3000/123456",
    });
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.json({ id: session.id });
});

app.post("/create-payment-intent", async (req, res) => {
    const intent = await stripe.paymentIntents.create({
        amount: 3000,
        currency: 'usd',
        // Verify your integration in this guide by including this parameter
        metadata: {
            name:req.body.name,
            email:req.body.email,
            address:req.body.address,
            city:req.body.city,
            state:req.body.state,
            size:req.body.size,
            zipcode:req.body.zipcode,
            image:req.body.image
        },
    });
    console.log("Did it!")
    res.json({'secret':intent.client_secret});
});

app.post("/product", async (req, res) => {
    const productId = req.body.id;
    const product = await stripe.products.retrieve(productId);
    res.json(product);
});

app.listen(4242, () => console.log("running on http://localhost:4242"));
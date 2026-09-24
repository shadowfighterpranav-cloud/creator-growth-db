const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Creator = require("../models/creatorModel");
const Booking = require("../models/bookingModel");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked creator
  const creator = await Creator.findById(req.params.creatorId);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/?creator=${req.params.creatorId}&user=${req.user.id}&price=${creator.price || 100}`,
    cancel_url: `${req.protocol}://${req.get("host")}/creator/${creator.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.creatorId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: (creator.price || 100) * 100, // Price in cents
          product_data: {
            name: `${creator.name} Consulting/Sponsorship`,
            description: creator.summary,
          },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
  });

  // 3) Send session as response
  res.status(200).json({
    status: "success",
    session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // Temporary workaround before Webhooks
  const { creator, user, price } = req.query;

  if (!creator || !user || !price) return next();
  await Booking.create({ creator, user, price });

  res.redirect(req.originalUrl.split("?")[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

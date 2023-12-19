const request = require("request");

const myTestSecretKey = `Bearer ${process.env.paystackSecretKey}`;

const initializeSubScriptionPayment = (form, myCallback) => {
  //Incluing plan as part of the field in form maakes it a ssusbcription payment
  const options = {
    url: "https://api.paystack.co/transaction/iniialize",
    headers: {
      authorization: myTestSecretKey,
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
    form,
  };

  const callback = (error, response, body) => {
    return myCallback(error, body);
  };

  request.post(options, callback);
};

const verifyPayment = (ref, myCallback) => {
  const options = {
    url:
      "https://api.paystack.co/transaction/verify/" + encodeURIComponent(ref),
    headers: {
      authorization: myTestSecretKey,
      "content-type": "application/json",
      "cache-control": "no-cache",
    },
  };
  const callback = (error, response, body) => {
    return myCallback(error, body);
  };
  request(options, callback);
};

const Paystack = { initializeSubScriptionPayment, verifyPayment };

module.exports = Paystack;

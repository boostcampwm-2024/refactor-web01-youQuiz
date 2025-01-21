let pinCode = null;

module.exports = {
  loadPinCode: function (req, res, context, events, done) {
    if (!pinCode) {
      return done(new Error('pinCode is not available yet'));
    }
    context.vars.pinCode = pinCode;
    return done();
  },

  savePinCode: function (req, res, context, events, done) {
    pinCode = context.vars.pinCode;
    return done();
  },
};

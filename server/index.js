
const path = require('path');
const express = require('express');
const { sendToSupport } = require('./support');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  express.static(path.join(__dirname, '..', 'public'), {
    extensions: ['html']
  })
);

app.post('/contact', (req, res) => {

  console.log('CONTACT FORM ROUTE REACHED');

  // Honeypot check
  const website = req.body.website || '';

  // Timing check
  const loadedAt = Number(req.body.form_loaded_at);
  const elapsedTime = Date.now() - loadedAt;

  // Temporary debugging information
  console.log('Submission received:', {
    honeypotFilled: website.trim() !== '',
    elapsedTime
  });

  // Silently drop suspicious submissions
  if (
    website.trim() !== '' ||
    !Number.isFinite(loadedAt) ||
    loadedAt <= 0 ||
    elapsedTime < 3000
  ) {
    console.log('Submission dropped. Spam protection triggered.');

    return res.json({ ok: true });
  }

  // Collect legitimate form information
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim();
  const message = (req.body.message || '').trim();

  // Validate required fields
  if (!name || !email || !message) {
    return res.status(400).json({
      ok: false,
      error: 'Please fill in your name, email and message.'
    });
  }

  // Send legitimate submissions to support
  console.log('Legitimate submission accepted. Calling sendToSupport().');

  sendToSupport({ name, email, message });

  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Calico Media site running at http://localhost:${PORT}`);
});

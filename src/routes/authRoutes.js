import express from 'express';
import { gauth_callback, github_callbackk} from '../controllers/userController.js'; // Import gauth_callback dari userController.js
import { google } from 'googleapis';

const router = express.Router();

// Redirect user to Google's OAuth 2.0 server
router.get('/google', (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/auth/google/callback'
  );

  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  });

  res.redirect(url);
});

// Handle the callback from Google's OAuth 2.0 server
router.get('/google/callback', gauth_callback);

// Redirect user to GitHub's OAuth 2.0 server
router.get('/github', (req, res) => {
  const githubAuthUrl = 'https://github.com/login/oauth/authorize';
  const clientId = process.env.GITHUB_CLIENT;
  const redirectUri = encodeURIComponent('http://localhost:3000/auth/github/callback'); // Menggunakan http
  const scope = 'user:email'; // Meminta izin untuk mengakses email pengguna

  const url = `${githubAuthUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

  res.redirect(url);
});

// Handle the callback from GitHub's OAuth 2.0 server
router.get('/github/callback', github_callbackk);

export default router;

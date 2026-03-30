/* ================================================================
   SENTINEL CHATBOT CONFIGURATION — TEMPLATE
   ================================================================
   
   To enable the AI chatbot:
   1. Copy this file to config.js (in the same directory)
   2. Get a FREE Gemini API key from https://aistudio.google.com/apikey
   3. Replace 'YOUR_GEMINI_API_KEY_HERE' with your actual key
   
   Without an API key, SENTINEL will use local keyword matching.
   With an API key, SENTINEL becomes a full AI assistant.
   ================================================================ */

var SENTINEL_CONFIG = {
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE',
  GEMINI_MODEL: 'gemini-2.0-flash'
};

window.SENTINEL_CONFIG = SENTINEL_CONFIG;

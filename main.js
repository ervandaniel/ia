import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import Base64 from 'base64-js';
import MarkdownIt from 'markdown-it';
import { maybeShowApiKeyBanner } from './gemini-api-banner';
import './style.css';

// 🔥🔥 FILL THIS OUT FIRST! 🔥🔥
// Get your Gemini API key by:
// - Selecting "Add Gemini API" in the "Project IDX" panel in the sidebar
// - Or by visiting https://g.co/ai/idxGetGeminiKey
let API_KEY = 'AIzaSyDy-gO89e2191Utm9a3vgVHbhsEsM6F-kA'; // Ganti dengan API Key Anda

let form = document.querySelector('form');
let promptInput = document.querySelector('input[name="prompt"]');
let output = document.querySelector('.output');

let conversationHistory = [];

form.onsubmit = async (ev) => {
  ev.preventDefault();
  output.textContent = 'Generating...';

  const userMessage = promptInput.value;
  conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });

  try {
    let contents = conversationHistory;

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro", 
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
    });

    const result = await model.generateContentStream({ contents });

    let buffer = [];
    let md = new MarkdownIt();
    for await (let response of result.stream) {
      buffer.push(response.text());
    }

    const responseText = md.render(buffer.join(''));
    conversationHistory.push({ role: 'model', parts: [{ text: responseText }] }); // Perbaikan di sini

    output.innerHTML = '';
    conversationHistory.forEach(item => {
      output.innerHTML += `<b>${item.role}:</b> ${item.parts[0].text}<br>`; 
    });

  } catch (e) {
    output.innerHTML += '<hr>' + e;
  }
};

maybeShowApiKeyBanner(API_KEY);

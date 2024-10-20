const axios = require('axios');
const fs = require('fs');

module.exports = {
 config: {
 name: "xi",
 version: "1.2",
 author: "ArYAN",
 countDown: 0,
 role: 0,
 longDescription: {
 en: "."
 },
 category: "media",
 guide: {
 en: "{p}xi <prompt>"
 }
 },

 onStart: async function({ message, args, api, event }) {
 try {
 const prompt = args.join(" ");
 if (!prompt) {
 return message.reply("Please provide your prompts.");
 }

 api.setMessageReaction("⌛", event.messageID, () => {}, true);

 const startTime = new Date().getTime();

 const baseURL = `https://c-v3.onrender.com/v1/xi?prompt=${encodeURIComponent(prompt)}&count=4`;
 const response = await axios.get(baseURL);
 const imageUrls = response.data; 

 const endTime = new Date().getTime();
 const timeTaken = (endTime - startTime) / 1000;

 api.setMessageReaction("✅", event.messageID, () => {}, true);

 const filePaths = await Promise.all(imageUrls.map(async (imageUrl, index) => {
 const fileName = `xi_${index + 1}.png`;
 const filePath = `/tmp/${fileName}`;

 const imageResponse = await axios.get(imageUrl, { responseType: 'stream' });
 const writerStream = fs.createWriteStream(filePath);
 
 return new Promise((resolve, reject) => {
 imageResponse.data.pipe(writerStream);

 writerStream.on('finish', () => resolve(filePath));
 writerStream.on('error', (err) => {
 console.error('Error writing the file:', err);
 reject("❌ Failed to save the generated image.");
 });
 });
 }));

 const attachments = filePaths.map(filePath => fs.createReadStream(filePath));
 message.reply({
 body: "Here are your generated images:",
 attachment: attachments
 });

 } catch (error) {
 console.error('Error generating image:', error);
 message.reply("❌ Failed to generate your images.");
 }
 }
}

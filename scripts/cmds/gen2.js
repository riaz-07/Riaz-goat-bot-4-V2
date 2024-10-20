const axios = require('axios');
const fs = require('fs');

module.exports = {
 config: {
 name: "gen",
 version: "1.2",
 author: "ArYAN",
 countDown: 10,
 role: 0,
 longDescription: {
 en: ""
 },
 category: "media",
 guide: {
 en: "{p}gen <prompt>"
 }
 },

 onStart: async function({ message, args, api, event }) {
 try {
 const prompt = args.join(" ");
 if (!prompt) {
 return message.reply("Please provide your prompts.");
 }

 api.setMessageReaction("⏰", event.messageID, () => {}, true);

 const startTime = new Date().getTime();

 const baseURL = `https://c-v3.onrender.com/v1/gen?prompt=${encodeURIComponent(prompt)}`;

 const response = await axios.get(baseURL);
 console.log('API Response:', response.data);
 const imageUrl = response.data;
 console.log('Image URL:', imageUrl);

 const endTime = new Date().getTime();
 const timeTaken = (endTime - startTime) / 1000;

 api.setMessageReaction("✅", event.messageID, () => {}, true);

 const fileName = 'gen.png';
 const filePath = `/tmp/${fileName}`;

 const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });

 fs.writeFile(filePath, imageResponse.data, (err) => {
 if (err) {
 console.error('Error saving the image:', err);
 return message.reply("❌ Failed to save the generated image.");
 }

 message.reply({
 body: `✅| Here is your generated image in ${timeTaken} seconds`,
 attachment: fs.createReadStream(filePath)
 });
 });

 } catch (error) {
 console.error('Error generating image:', error.response ? error.response.data : error.message);
 message.reply("❌ Failed to generate your image.");
 }
 }
};

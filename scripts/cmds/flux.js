const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');

module.exports = {
  config: {
    name: "flux",
    version: "10.5",
    author: "ArYAN",
    shortDescription: { en: '' },
    longDescription: { en: "" },
    category: "image",
    countDown: 10,
    role: 0,
    guide: { en: '{pn} your prompt' }
  },

  onStart: async function ({ api, event, args, message }) {
    const startTime = new Date().getTime();
    const text = args.join(" ");

    if (!text) {
      return message.reply("❌");
    }

    message.reply(`Creating......`, async (err, info) => {
      if (err) {
        console.error("Error sending initial message:", err);
        return;
      }
      
      let ui = info.messageID;
      api.setMessageReaction("⏰", event.messageID, () => {}, true);

      try {
        console.log("Sending request to Bing API with prompt:", text);
        const response = await axios.get(`https://c-v1.onrender.com/flux/v1?prompt=${encodeURIComponent(text)}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        console.log("Received response from API:", response.data);
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        const images = response.data.data.output;
        if (!images || images.length === 0) {
          throw new Error("No images found in the response");
        }

        api.unsendMessage(ui);

        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;

        let imagesInfo = ``;

        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bing-'));

        const imagePaths = await Promise.all(
          images.map(async (img, index) => {
            const imgPath = path.join(tempDir, `image_${index}.jpg`);
            const writer = fs.createWriteStream(imgPath);

            const response = await axios({
              url: img,
              method: 'GET',
              responseType: 'stream'
            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
              writer.on('finish', () => resolve(imgPath));
              writer.on('error', reject);
            });
          })
        );

        const imageAttachments = imagePaths.map(imgPath => fs.createReadStream(imgPath));

        console.log("Sending message with images.");
        message.reply({
          body: imagesInfo,
          attachment: imageAttachments
        }, async (err) => {
          if (err) {
            console.error("Failed to send message with images", err);
          }
          
          imagePaths.forEach(imgPath => fs.unlinkSync(imgPath));
          fs.rmdirSync(tempDir);
        });
      } catch (error) {
        console.error("Error during image generation or sending", error);
        api.unsendMessage(ui);
        api.sendMessage(`There was an error processing your request. Please check the logs for details.`, event.threadID, event.messageID);
      }
    });
  },
};

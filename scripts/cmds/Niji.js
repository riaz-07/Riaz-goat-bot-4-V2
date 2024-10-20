const axios = require('axios'), fs = require('fs');

module.exports = {
  config: { name: "niji", author: "ArYAN", countDown: "20" },

  onStart: async ({ message, args, api }) => {
    if (args.length < 1) return message.reply("Invalid prompts.");
    
    const v = await message.reply("Generating your image\n By Riaz Dado...");
    try {
      const { data } = await axios.get(`https://apizaryan.onrender.com/v1/niji?prompt=${encodeURIComponent(args.join(" "))}`, { responseType: 'arraybuffer' });
      fs.writeFile('/tmp/niji.png', data, () => {
        message.reply({ body: "📦| NIJI 1.1", attachment: fs.createReadStream('/tmp/niji.png') });
        });
    } catch {
      message.reply("Failed.");
    }
  }
}

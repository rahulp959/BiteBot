const fs = require('fs');
const Discord = require('discord.js');
require('dotenv').config();
const AsciiTable = require('ascii-table')

const client = new Discord.Client();
 
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const savedChompsFile = 'savedChomps.json';
let rawSavedData;

if(fs.existsSync(savedChompsFile)) {
  rawSavedData = fs.readFileSync(savedChompsFile);
}

let biters = {};

if(rawSavedData) {
  biters = JSON.parse(rawSavedData)
}


client.on('message', msg => {

  if (msg.content.startsWith('$bite')) {
    for (const [key, userMentioned] of msg.mentions.users) {
      let biterRecord = biters?.[msg.author.username];

      if(!biterRecord) {
        biterRecord = biters[msg.author.username] = {}
      }

      let biteeRecord = biterRecord?.[userMentioned.username]

      if(!biteeRecord) {
        biteeRecord = biterRecord[userMentioned.username] = 0;
      }
    
      biteeRecord = biterRecord[userMentioned.username] += 1;
      
      msg.reply(`Bite against <@${userMentioned.id}> recorded, use $table to see the current leaderboard.`, {
        allowedMentions: {
          parse: ['users']
        }
      });
    }

    fs.writeFileSync(savedChompsFile, JSON.stringify(biters))
  }

  if(msg.content.startsWith('$table')) {
    for(const [key, userMentioned] of msg.mentions.users) {
      const table = new AsciiTable()
      table.setHeading('Chomper', 'Number of Chomps');

      const biterRecord = biters[userMentioned.username];

      if(biterRecord) {
        for(const [chomper, count] of Object.entries(biterRecord)) {
          table.addRow(`@${chomper}`, count)
        }

        console.log(table.toString())

        msg.reply(`\n\n\`\`\`\n${table.toString()}\`\`\``)
      }
      else {
        msg.reply('No table for that user')
      }
    }
  }
});
 
client.login(process.env.BOT_TOKEN);
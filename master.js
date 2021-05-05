require('dotenv').config();
const MasterBot = new (require('discord.js').Client)();

async function MasterLogin() {
    await MasterBot.login(process.env.DISCORDTOKEN);
    console.log(`[DISC] Logged in as ${process.env.DISCORDNAME}`);
    return MasterBot;
}

// Example handler shows
var Handlers = {
    '812110810670170142': require('./won/won.js'),
    '812110847194693693': require('./Serhii/serhii.js'),
    '812110768602480680': require('./hongze/hongze.js'),
    '812110829285015642': require('./arash/arash.js'),
};

// Distribute messages to the appropriate handlers
MasterBot.on('message', msg => {
    (Handlers[msg.channel.id] || {onMessage: () => null}).onMessage(msg);
});

// Activate intervals on all handlers
Object.keys(Handlers).map((k => setInterval(Handlers[k].Interval(MasterBot), 5000)));

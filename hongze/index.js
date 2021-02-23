require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const fetch = require('node-fetch');

var TOKEN = process.env.DISCORDTOKEN;
var NAME = process.env.DISCORDNAME;
var CHANNEL = '812110768602480680'; // ID of the channel which this bot looks at

Bot.sendMessage = (content, channel) => (Bot.channels.cache.get(channel ?? CHANNEL) ?? {send: () => null}).send(content);

async function BotLogin(token, name, channel) {
    if(token) TOKEN = token;
    if(name) NAME= name;
    if(channel) CHANNEL = channel;
    await Bot.login(TOKEN);
    console.log(`[DISC] Logged in as ${NAME}`);
}

Bot.on('error', err => {
    console.log(`[DISC] !! Error in bot ${NAME}:\n{err}`);
});

// Dictates bot behavior when it sees a message being sent.
async function onMessage(msg) {
  if(msg.content.toUpperCase() === 'PING')
    msg.channel.send('Pong');
  else if(msg.content.toLowerCase() === 'hi')
    msg.channel.send('Hi DEVHUB! How is everyone?');
  else if(msg.content.toLowerCase().startsWith('tell me about yourself'))
    msg.channel.send("My name is Hongze Chen, and I\'m a second-year majoring in mathematics and minoring in CS. "+
    "Like most people I\'m slowly going insane during the pandemic, but I generally enjoy assembling and fixing things, "+
    "the internet, traveling, etc. I am easygoing, but also extremely meticulous and perfectionistic, especially when it "+
    "comes to working with software. I hope to be a helpful and dedicated teammate to everyone throughout this semester.");
  else if(msg.content.toLowerCase().startsWith("what's the weather")){
    //is there a way to conceal my API code?
    fetch("http://api.openweathermap.org/data/2.5/weather?q=Charlottesville,US&units=imperial&appid=52520c6b8e3b1737918c28a63960625d").then(
      r => r.json()).then(data => {
        const s = `Right now the weather in Charlottesville is ${data.weather[0].main.toLowerCase()}, and the temperature is ${data.main.temp}°F.`;
        msg.channel.send(s);
      }, r => msg.channel.send('Whoops! Something went wrong during the API fetch. Try again later'))
  }
}


// Behavior independent of messages goes here.
// Function executed every 5 seconds.
var time = 0;
function onInterval(Client) {
    // There's some interesting syntax going on here but your code goes inside the inner curly braces.
    return async () => {
        time += 5;
        console.log('Executed interval.');
    }
}

// Requires Nodejs v14.6.0
// Runs only if this file is the main process.
if(require.main === module) {
    BotLogin();
    Bot.on('message', msg => {
        // Ignore messages from other bots
        // Ignore messages from other channels
        if(msg.author.bot || msg.channel.id !== CHANNEL) return;
        onMessage(msg);
    });

    setInterval(onInterval(Bot), 5000);
}

module.exports = {
    Bot: Bot,
    Interval: onInterval,
}

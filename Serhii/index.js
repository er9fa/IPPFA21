require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const axios = require('axios');

var TOKEN = process.env.DISCORDTOKEN;
var NAME = process.env.DISCORDNAME;
var CHANNEL = '812110847194693693'; // ID of the channel which this bot looks at

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
    const Discord = require('discord.js');

    //Test
    if(msg.content === '!test'){
      const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Test')
        .setAuthor('Serhii')
        .setDescription('Test of embeded messages!')
        .addFields(
          { name: 'Regular field title', value: 'Some value here' },
          { name: '\u200B', value: '\u200B' },
          { name: 'Inline field title', value: 'Some value here', inline: true },
          { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .addField('Inline field title', 'Some value here', true)
        .setImage('https://image.shutterstock.com/image-photo/view-metro-link-shuttle-bus-600w-1939366444.jpg')
        .setTimestamp()
        .setFooter('Some footer text here');
      msg.channel.send(exampleEmbed);
    }

    //Help
    if(msg.content ==='!help'){
      const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('!help')
        .setAuthor('Serhii')
        .setDescription('List of commands:\n!help - list of commands\n!weather - weather at Charlottesville'
         + '\n!busses - list of busses at Charlottesville\n!map - a map of Charlottesville')
        .setTimestamp()
        .setFooter('Use !help to get a list of commands');
      msg.channel.send(helpEmbed)
    }

    //Weather
    if(msg.content === '!weather'){
      let getWeather = async () => {
        let response = await axios.get('http://api.openweathermap.org/data/2.5/weather?q=Charlottesville&appid=8c7aec8bcf09c0c9181b2258c865837c')
        let weather = response.data
        return weather
      }
      let weatherValue = await getWeather()

      const weatherEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('!weather')
        .setAuthor('Serhii')
        .setDescription(`City: ${weatherValue['name']}. Temperature: ${weatherValue['main']['temp']} (absolute temperature in Kelvin).`+
          ` Weather description: ${weatherValue['weather']['0']['description']}`)
        .setTimestamp()
        .setFooter('Use !weather to get a weather at Charlottesville');

      msg.channel.send(weatherEmbed);
    }

    //busses
    if(msg.content === '!busses'){
      let getBusses = async () => {
        let response = await axios.get('https://api.devhub.virginia.edu/v1/transit/vehicles')
        let busses = response.data
        return busses
      }
      let bussesData = await getBusses()

      const bussesEmbed = new Discord.MessageEmbed()
        .setColor('#111111')
        .setTitle('List of busses:')
        .setAuthor('Serhii')
        .setTimestamp()
        .setFooter('type !busses to get information about busses');

      var array_of_busses = [];
      var array_of_stops = [];
      var array_of_curr = [];

      for (const property in bussesData["vehicles"]) {
        array_of_busses.push(bussesData["vehicles"][property]["id"])
        array_of_stops.push(bussesData["vehicles"][property]["next_stop"])
        array_of_curr.push(bussesData["vehicles"][property]["service_status"])
      }

      bussesEmbed.addFields({ name: 'Busses:', value: array_of_busses, inline: true });
      bussesEmbed.addFields({ name: 'Next Stop:', value: array_of_stops, inline: true });
      bussesEmbed.addFields({ name: 'Service Status:', value: array_of_curr, inline: true });

      msg.channel.send(bussesEmbed);
    }

    //map
    if (msg.content === '!map'){
      const mapEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('!weather')
        .setAuthor('Serhii')
        .setDescription(`Charlottesville map:`)
        .setImage('https://i.postimg.cc/0NNGgKjN/Map.png')
        .setTimestamp()
        .setFooter('Use !map to get a map of Charlottesville');

      msg.channel.send(mapEmbed);
    }
}

// Behavior independent of messages goes here.
// Function executed every 5 seconds.
var time = 0;
function onInterval(Client) {
    const Discord = require('discord.js');
    // There's some interesting syntax going on here but your code goes inside the inner curly braces.
    return async () => {
        time += 5;
        console.log('Executed interval.');

        let getStops = async () => {
          let response = await axios.get('https://api.devhub.virginia.edu/v1/transit/bus-stops')
          let stops = response.data
          return stops
        }

        let stopsData = await getStops()
        let myStop = null;
        let previousStop = null;

        for (const property in stopsData["stops"]) {
          if (stopsData["stops"][property]["id"] == 4248160){
            myStop = stopsData["stops"][property];
          }

          if (stopsData["stops"][property]["id"] == 4235200){
            previousStop = stopsData["stops"][property];
          }

        }

        let getBusses = async () => {
          let response = await axios.get('https://api.devhub.virginia.edu/v1/transit/vehicles')
          let busses = response.data
          return busses
        }

        let bussesData = await getBusses()

        var stringData = JSON.stringify(bussesData);

        var bussInZone = false;
        const arrivalEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('There is a bus in the zone!')
          .setAuthor('Serhii')
          .setTimestamp()
          .setFooter('Information about busses in zone');

        var array_of_busses = [];
        var array_of_stops = [];

        for (const property in bussesData["vehicles"]) {
          let x = bussesData["vehicles"][property]["position"][0];
          let y = bussesData["vehicles"][property]["position"][1];
          let stopx = myStop["position"][0];
          let stopy = myStop["position"][1];

          if ((Math.abs(x-stopx)<=0.003) && (Math.abs(x-stopx)<=0.003)){
            bussInZone = true;
            array_of_busses.push(bussesData["vehicles"][property]["id"])
            array_of_stops.push(bussesData["vehicles"][property]["next_stop"])
          }
        }

        if (bussInZone == true){
          arrivalEmbed.addFields({ name: 'Busses', value: array_of_busses, inline: true });
          arrivalEmbed.addFields({ name: 'Next Stop', value: array_of_stops, inline: true });
          Bot.sendMessage(arrivalEmbed);
        }
        bussInZone = false;

        //CODE FOR NEXT AND PREVIOUS STOPS
        // for (const property in bussesData["vehicles"]){
        //   if (bussesData["vehicles"][property]["next_stop"] == previousStop["id"]){
        //     Bot.sendMessage("Your bus is approaching the stop before yours");
        //   }
        //
        //   if (bussesData["vehicles"][property]["current_stop_id"] == previousStop["id"]){
        //     Bot.sendMessage("Your bus is at the stop before yours");
        //   }
        //
        //   if (bussesData["vehicles"][property]["next_stop"] == myStop["id"]){
        //     Bot.sendMessage("Your bus is approaching your stop");
        //   }
        //
        // }
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

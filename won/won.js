require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const fetch = require('node-fetch');

var TOKEN = process.env.DISCORDTOKEN;
var NAME = process.env.DISCORDNAME;
var CHANNEL = '812110810670170142'; // ID of the channel which this bot looks at

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
    if(msg.content === 'hi')
      msg.channel.send('Hi DEVHUB! How is everyone?');

      const Discord = require('discord.js');

// inside a command, event listener, etc.
    const exampleEmbed = new Discord.MessageEmbed()
	     .setColor('#0099ff')
	     .setTitle('Example Embed')
	     .setAuthor('Won')
	     .setDescription('This is an example of an embedded message')
	     .addFields(
		       { name: 'Regular field title', value: 'Some value here' },
		       { name: '\u200B', value: '\u200B' },
		       { name: 'Inline field title', value: 'Some value here', inline: true },
		       { name: 'Inline field title', value: 'Some value here', inline: true },
	     )
	    .addField('Inline field title', 'Some value here', true)
	    .setTimestamp()
	    .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');

      if(msg.content === '!embed'){
        msg.channel.send(exampleEmbed);
      }

    else if(msg.content.toLowerCase() === ('tell me about yourself?'))
      msg.channel.send('Hi! My name is Won and I am a fourth year student at UVA' +
      ' studying Cognitive Science. Some of my hobbies include playing basketball,' +
      ' fishing and listening to new music. Nice to meet you, I hope you are keeping' +
      ' well during the pandemic!');

    else if(msg.content === '!weather'){
      fetch('http://api.openweathermap.org/data/2.5/weather?q=Charlottesville,US&appid=053f96ec8527cdb8c811437a5dd2922e')
      .then(response => response.json()).then(weatherData => {
        msg.channel.send(weatherData.main.temp)},
        response => msg.channel.send('Error.'))
      }

    else if(msg.content.toLowerCase() === '!randomStop'){
      fetch('https://api.devhub.virginia.edu/v1/transit/bus-stops')
      .then(response => response.json()).then(stop => {
        let randomValue = stop.stops[Math.floor(Math.random() * stop.stops.length)];
        msg.channel.send(randomValue.name)},
        response => msg.channel.send('Error'))
    }

    else if(msg.content.toLowerCase() === '!help'){
      var commandHelp = ['!earlybusses', '!ontimebusses', 'latebusses']
      var commandDescriptions = ['List of all early busses', ' List of all on time busses', 'List of all late busses']
      const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Command Help')
        .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setDescription('List of all commands and their functions')
        .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .addFields(
          { name: 'Command name', value: commandHelp, inline: true },
          { name: 'Function', value: commandDescriptions, inline: true}
        )
        .setFooter('Use !help command any time you want to see a list of all commands and their functions.')
        .setTimestamp()
      msg.channel.send(helpEmbed)
    }

    else if(msg.content.toLowerCase() === '!earlybusses'){
      fetch('https://api.devhub.virginia.edu/v1/transit/vehicles')
      .then(response => response.json()).then(data => {
        var earlyArr = []
        var vehicleLength = data.vehicles.length
        for (var i = 0; i < vehicleLength; i++){
          if (data.vehicles[i].arrival_status === "Early"){
            earlyArr.push(data.vehicles[i].call_name)
          }
        }
        if (earlyArr.length < 1){
          msg.channel.send('There are no early busses right now.')
        }
        else {
          const exampleEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Early Busses')
          .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
          .setDescription('List of all early busses currently running at UVA')
          .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
          .addFields(
             { name: 'Early bus list', value: earlyArr, inline: true },
          )
          .setFooter('Use !earlybusses command any time you want to see early busses.')
          .setTimestamp()
          msg.channel.send(exampleEmbed)}},
      response => msg.channel.send('Error'))
    }

    else if(msg.content.toLowerCase() === '!ontimebusses'){
      fetch('https://api.devhub.virginia.edu/v1/transit/vehicles')
      .then(response => response.json()).then(data => {
        var onTimeArr = []
        for (const prop in data["vehicles"]){
          if (data["vehicles"][prop]["arrival_status"] === "On-Time"){
            onTimeArr.push(data["vehicles"][prop]["call_name"])
          }
        }
        if (onTimeArr.length < 1){
          msg.channel.send('There are no on time busses right now.')
        }
        else {
          const exampleEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('On Time Busses')
          .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
          .setDescription('List of all on time busses currently running at UVA')
          .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
          .addFields(
             { name: 'On time bus list', value: onTimeArr, inline: true },
          )
          .setFooter('Use !ontimebusses command any time you want to see on time busses.')
          .setTimestamp()
          msg.channel.send(exampleEmbed)}},
      response => msg.channel.send('Error'))
    }

    else if(msg.content.toLowerCase() === '!latebusses'){
      fetch('https://api.devhub.virginia.edu/v1/transit/vehicles')
      .then(response => response.json()).then(data => {
        var lateArr = []
        for (const prop in data["vehicles"]){
          if (data["vehicles"][prop]["arrival_status"] === "Late"){
            lateArr.push(data["vehicles"][prop]["call_name"])
          }
        }
        if (lateArr.length < 1){
          msg.channel.send('There are no late busses right now.')
        }
        else {
          const exampleEmbed = new Discord.MessageEmbed()
          .setColor('#0099ff')
          .setTitle('Late Busses')
          .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
          .setDescription('List of all late busses currently running at UVA')
          .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
          .addFields(
             { name: 'Late bus list', value: lateArr, inline: true },
          )
          .setFooter('Use !latebusses command any time you want to see late busses.')
          .setTimestamp()
          msg.channel.send(exampleEmbed)}},
      response => msg.channel.send('Error'))
    }

    else if(msg.content.startsWith('!assignRole')){
     let roleName = msg.content;
     roleName = roleName.slice(roleName.indexOf(" ") + 1);
     console.log(roleName);
     let role = msg.guild.roles.cache.find(r => r.name === roleName);
     let member = msg.member;
     member.roles.add(role).catch(console.error);

      const roleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('You have assigned yourself the following role')
        .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setDescription(roleName)
        .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setTimestamp()
        .setFooter('Use !assignRole command to assign yourself a role.')
      msg.channel.send(roleEmbed);
          }

    else if(msg.content.startsWith('!removeRole')){
      let roleName = msg.content;
      roleName = roleName.slice(roleName.indexOf(" ") + 1);
      console.log(roleName);
      let role = msg.guild.roles.cache.find(r => r.name === roleName);
      let member = msg.member;
      member.roles.remove(role).catch(console.error);

      const roleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('You have removed yourself from the following role')
        .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setDescription(roleName)
        .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setTimestamp()
        .setFooter('Use !removeRole command to remove yourself from a role.')
    msg.channel.send(roleEmbed);
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

        async function getMyStop() {
         fetch('https://api.devhub.virginia.edu/v1/transit/bus-stops')
         .then(response => response.json()).then(getMyStopData => {
           let myStopData = getMyStopData["stops"][getMyStopData.stops.length-2]},
           //console.log(myStopData)},
       response => msg.channel.send('Error'))
        }

      let myStop = getMyStop();
      //console.log(myStop["id"]); // not sure why this is undefined

      async function getBusses() {
        fetch('https://api.devhub.virginia.edu/v1/transit/vehicles')
        .then(response => response.json()).then(getBusData => {
          for (const prop in getBusData["vehicles"]) {
            if (getBusData["vehicles"][prop]["next_stop"] === 4250394){
              Bot.sendMessage('Your bus is arriving soon.');
            }
            if (getBusData["vehicles"][prop]["current_stop_id"] === 4250394){
              Bot.sendMessage("Your bus has arrived.");
            }
        }
      },
      response => msg.channel.send('Error'))
    }

    let a = getBusses();
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

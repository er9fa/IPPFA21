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
    if(msg.content === '!embed'){
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
      fetch('https://api.devhub.virginia.edu/v1/transit/bus-stops') // gets data from api
      .then(response => response.json()).then(stop => {
        let randomValue = stop.stops[Math.floor(Math.random() * stop.stops.length)]; // gets a random number and grabs corresponding stop data with that number
        msg.channel.send(randomValue.name)}, // sends the stop data to discord channel
        response => msg.channel.send('Error'))
    }

    else if(msg.content.toLowerCase() === '!help'){
      var commandHelp = ['!earlybusses', '!ontimebusses', 'latebusses'] // list of commands
      var commandDescriptions = ['List of all early busses', ' List of all on time busses', 'List of all late busses'] // command description
      const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Command Help') // title of embed
        .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg') // embed author and picture
        .setDescription('List of all commands and their functions') // embed description
        .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg') // embed thumbnail
        .addFields(
          { name: 'Command name', value: commandHelp, inline: true }, // displays name of commands
          { name: 'Function', value: commandDescriptions, inline: true} // displays description of commands
        )
        .setFooter('Use !help command any time you want to see a list of all commands and their functions.')
        .setTimestamp()
      msg.channel.send(helpEmbed) // sends embed to channel
    }

    else if(msg.content.toLowerCase() === '!earlybusses'){ // checks if message received is for the early busses
      fetch('https://api.devhub.virginia.edu/v1/transit/vehicles') // grabs data from api
      .then(response => response.json()).then(data => {
        var earlyArr = [] // empty array for early busses
        var vehicleLength = data.vehicles.length // number of vehicles
        for (var i = 0; i < vehicleLength; i++){
          if (data.vehicles[i].arrival_status === "Early"){ // checks if arrival status is early for each vehicle
            earlyArr.push(data.vehicles[i].call_name) // if early, adds the bus name into array
          }
        }
        if (earlyArr.length < 1){ // checks if array is empty, means there are no early busses
          msg.channel.send('There are no early busses right now.') // send to channel
        }
        else { // if array is not empty, embeds the bus list and sends into channel
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

    else if(msg.content.toLowerCase() === '!ontimebusses'){ // checks if message received is for on time busses
      fetch('https://api.devhub.virginia.edu/v1/transit/vehicles') // grabs api data
      .then(response => response.json()).then(data => {
        var onTimeArr = [] // empty array for on time busses
        for (const prop in data["vehicles"]){
          if (data["vehicles"][prop]["arrival_status"] === "On-Time"){ // checks if bus is on time or not
            onTimeArr.push(data["vehicles"][prop]["call_name"]) // if on time, pushes bus name into array list
          }
        }
        if (onTimeArr.length < 1){ // checks if array is empty
          msg.channel.send('There are no on time busses right now.') // sends to channel
        }
        else { // if there are on time busses, sends embed to discord channel
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
          if (data["vehicles"][prop]["arrival_status"] === "Late"){ // checks if there are late busses
            lateArr.push(data["vehicles"][prop]["call_name"]) // pushes late bus to array
          }
        }
        if (lateArr.length < 1){ // lets channel know if there are no late busses
          msg.channel.send('There are no late busses right now.')
        }
        else { // if there are late busses, sends embed to discord channel
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

    else if(msg.content.startsWith('!assignRole')){ // checks if message starts with !assignRole
     let roleName = msg.content; // role name is the entire message
     roleName = roleName.slice(roleName.indexOf(" ") + 1); // slices mesage after the space so that name of role can be grabbed
     console.log(roleName);
     let role = msg.guild.roles.cache.find(r => r.name === roleName); // finds the corresponding role for the name
     let member = msg.member; // whoever sent the message will have their role changed
     member.roles.add(role).catch(console.error); // adds the role for the member

      const roleEmbed = new Discord.MessageEmbed() // sends embed notifying role addition
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
      let roleName = msg.content; // message is set as role name
      roleName = roleName.slice(roleName.indexOf(" ") + 1); // role name is spliced at the space
      console.log(roleName);
      let role = msg.guild.roles.cache.find(r => r.name === roleName); // finds role corresonding to the name
      let member = msg.member; // whoever sent the message is set as the member
      member.roles.remove(role).catch(console.error); // role is removed from the member

      const roleEmbed = new Discord.MessageEmbed() // embed notification of role removal
        .setColor('#0099ff')
        .setTitle('You have removed yourself from the following role')
        .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setDescription(roleName)
        .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setTimestamp()
        .setFooter('Use !removeRole command to remove yourself from a role.')
    msg.channel.send(roleEmbed);
      }

    else if(msg.content.toLowerCase() === '!gettingstarted'){
      const startEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Getting Started')
        .setAuthor('BusBot', 'https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setDescription('Welcome to BusBot! With BusBot, you can get notifications about UVA buses without ever opening your phone.' +
         ' In order to see a full list of commands and their functions, use the !help command.' +
         ' Role names correspond with different bus stops. Set a role for yourself to get information about different buses' +
         ' that pass through your selected stop.' + ' First, assign a role for yourself using the !assignRole command. Then '
         + ' use the !trackRoute command to save the desired route that passes through the stop.')
        .setThumbnail('https://parking.virginia.edu/sites/parking.virginia.edu/files/UTS_Bus_Rebrand_SS_05.jpg')
        .setFooter('Use !help to get a full list of commands and their descriptions.')
        .setTimestamp();
      msg.channel.send(startEmbed);
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
           let myStopData = getMyStopData["stops"][getMyStopData.stops.length-2]}, // hard coded for my personal stop
           //console.log(myStopData)},
       response => msg.channel.send('Error'))
        }

      let myStop = getMyStop();
      //console.log(myStop["id"]); // not sure why this is undefined

      async function getBusses() {
        fetch('https://api.devhub.virginia.edu/v1/transit/vehicles')
        .then(response => response.json()).then(getBusData => {
          for (const prop in getBusData["vehicles"]) {
            if (getBusData["vehicles"][prop]["next_stop"] === 4250394){ // runs through all the vehicles in the api and checks if its next stop matches my bus stop
              Bot.sendMessage('Your bus is arriving soon.'); // notifies that bus is approaching
            }
            if (getBusData["vehicles"][prop]["current_stop_id"] === 4250394){ // runs through all vehicles in api and checks if its current stop matches my bus stop
              Bot.sendMessage("Your bus has arrived."); // notifies that bus has arrived
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

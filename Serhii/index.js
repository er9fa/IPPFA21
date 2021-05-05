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

var listOfRoles = []; // List of roles of the user
var listOfTracked = []; // List of tracked routes
var gettingStartedCommand = false; //Getting Started message was not sent yet

// Dictates bot behavior when it sees a message being sent.
async function onMessage(msg) {
    const Discord = require('discord.js');

    //List of all roles (only logs in the console)
    if (msg.content === "!roles"){
      console.log(listOfRoles[0]['name']);
    }

    //Removes the role from the list of assigned roles
    if (msg.content.startsWith("!deleteRoute")){
      let index = 0;
      let routeName = msg.content;
      routeName = routeName.slice(msg.content.indexOf(" ") + 1);
      for (const prop in listOfTracked){
        if (routeName == listOfTracked[prop]){
          index = prop;
        }
      }
      listOfTracked.splice(index, 1);
      const addRouteEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('You deleted a route:')
        .setAuthor('Serhii')
        .setDescription(routeName)
        .setTimestamp()
        .setFooter('!deleteRoute to stop tracking route');
      msg.channel.send(addRouteEmbed);
    }

    //Prints out the list of routes
    if (msg.content === "!routes"){
      let getRoutes = async () => {
        let response = await axios.get('https://api.devhub.virginia.edu/v1/transit/routes')
        let routes = response.data
        return routes
      }
      let routesData = await getRoutes()
      let listOfRoutes = {}
      for (const prop in routesData["routes"]){
        listOfRoutes[routesData["routes"][prop]["id"]] = routesData["routes"][prop]["long_name"];
      }
      var ids = Object.keys(listOfRoutes);
      var names = Object.values(listOfRoutes);
      const arrivalEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('All routes:')
        .setAuthor('Serhii')
        .setTimestamp()
        .setFooter('!routes to get information about routes');
      arrivalEmbed.addFields({ name: 'Routes ids', value: ids, inline: true });
      arrivalEmbed.addFields({ name: 'Routes names', value: names, inline: true });
      Bot.sendMessage(arrivalEmbed);
      console.log(listOfRoutes);
    }

    //Add a route to the list of tracked routes
    if (msg.content.startsWith("!trackRoute")){
      let routeName = msg.content;
      routeName = routeName.slice(msg.content.indexOf(" ") + 1);
      listOfTracked.push(routeName);

      const addRouteEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('New tracked route:')
        .setAuthor('Serhii')
        .setDescription(routeName)
        .setTimestamp()
        .setFooter('!trackRoute to add a route to track');
      msg.channel.send(addRouteEmbed);
      console.log(routeName);
    }

    //Add role to the list of tracked roles
    if (msg.content.startsWith("!assignRole")){
      let roleName = msg.content;
      roleName = roleName.slice(roleName.indexOf(" ") + 1);
      console.log(roleName);
      let role = msg.guild.roles.cache.find(r => r.name === roleName);
      let member = msg.member;
      member.roles.add(role).catch(console.error);
      listOfRoles.push(role);
      const addRoleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Your new role is:')
        .setAuthor('Serhii')
        .setDescription(roleName)
        .setTimestamp()
        .setFooter('!assignRole to add yourself to a role');
      msg.channel.send(addRoleEmbed);
    }

    //Delete role from the list of tracked roles
    if (msg.content.startsWith("!deleteRole")){
      let roleName = msg.content;
      roleName = roleName.slice(msg.content.indexOf(" ") + 1);
      console.log(roleName);
      let role = msg.guild.roles.cache.find(r => r.name === roleName);
      let member = msg.member;
      member.roles.remove(role).catch(console.error);
      let index = 0;
      for (const prop in listOfRoles){
        if (roleName == listOfRoles[prop]){
          index = prop;
        }
      }
      listOfRoles.splice(index, 1);
      const addRoleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('You deleted a role:')
        .setAuthor('Serhii')
        .setDescription(roleName)
        .setTimestamp()
        .setFooter('!deleteRole to add yourself to a role');
      msg.channel.send(addRoleEmbed);
    }

    //Test
    // if(msg.content === '!test'){
    //   const exampleEmbed = new Discord.MessageEmbed()
    //     .setColor('#0099ff')
    //     .setTitle('Test')
    //     .setAuthor('Serhii')
    //     .setDescription('Test of embeded messages!')
    //     .addFields(
    //       { name: 'Regular field title', value: 'Some value here' },
    //       { name: '\u200B', value: '\u200B' },
    //       { name: 'Inline field title', value: 'Some value here', inline: true },
    //       { name: 'Inline field title', value: 'Some value here', inline: true },
    //     )
    //     .addField('Inline field title', 'Some value here', true)
    //     .setImage('https://image.shutterstock.com/image-photo/view-metro-link-shuttle-bus-600w-1939366444.jpg')
    //     .setTimestamp()
    //     .setFooter('Some footer text here');
    //   msg.channel.send(exampleEmbed);
    // }

    //Help
    if(msg.content ==='!help'){
      const helpEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('!help')
        .setAuthor('Serhii')
        .setDescription('List of commands:\n!help - list of commands\n!weather - weather at Charlottesville'
         + '\n!busses - list of busses at Charlottesville\n!map - a map of Charlottesville'
         + '\n!routes - list of routes\n!trackRoute - track a route\n!deleteRoute - stop tracking route'
         + '\n!addRole - add a bus stop\n!deleteRole - delete a bus stop')
        .setTimestamp()
        .setFooter('Use !help to get a list of commands');
      msg.channel.send(helpEmbed)
    }

    //Weather at Charlottesville
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

    if(msg.content === '!gettingStarted'){
      const startedEmbed = new Discord.MessageEmbed()
        .setColor('#111111')
        .setTitle('Welcome to UVA Bus Bot!')
        .setAuthor('Serhii')
        .setTimestamp()
        .setDescription('This bot is used to keep track of your bus stops.'
        + ' It notifies you when a bus is approaching your stop.'
        + ' You have to select stops and routes that you want to track.')
        .setFooter('type !help to get the list of commands');
      msg.channel.send(startedEmbed);
    }

    //List of busses running at Charlottesville
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
        array_of_stops.push(bussesData["vehicles"][property]["route_id"])
        array_of_curr.push(bussesData["vehicles"][property]["service_status"])
      }

      bussesEmbed.addFields({ name: 'Busses:', value: array_of_busses, inline: true });
      bussesEmbed.addFields({ name: 'Route id:', value: array_of_stops, inline: true });
      bussesEmbed.addFields({ name: 'Service Status:', value: array_of_curr, inline: true });

      msg.channel.send(bussesEmbed);
    }

    //Map of Charlottesville
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

        if (gettingStartedCommand == false){
          const startedEmbed = new Discord.MessageEmbed()
            .setColor('#111111')
            .setTitle('Welcome to UVA Bus Bot!')
            .setAuthor('Serhii')
            .setTimestamp()
            .setDescription('!gettingStarted to get information about the bot')
            .setFooter('type !help to get the list of commands');
          Bot.sendMessage(startedEmbed);
          gettingStartedCommand = true;
        }


        console.log('Executed interval.');

        let getStops = async () => {
          let response = await axios.get('https://api.devhub.virginia.edu/v1/transit/bus-stops')
          let stops = response.data
          return stops
        }

        let stopsData = await getStops()
        let stops = [];
        let previousStop = null;

        //If name of role == name of stop, add stop to the list of tracked stops
        for (const prop1 in stopsData["stops"]) {
          for (const prop2 in listOfRoles){
            if (stopsData["stops"][prop1]["name"] == listOfRoles[prop2]["name"]){
              stops.push(stopsData["stops"][prop1]);
            }
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


        var array_of_busses = [];
        var array_of_routes = [];
        var tracked = false;
        var route = null;

        myStop = null;
        for (const prop in stops){
          array_of_busses = [];
          array_of_routes = [];
          tracked = false;
          route = null;
          myStop = stops[prop];
          for (const property in bussesData["vehicles"]) {
            let x = bussesData["vehicles"][property]["position"][0];
            let y = bussesData["vehicles"][property]["position"][1];
            let stopx = myStop["position"][0];
            let stopy = myStop["position"][1];
            tracked = false;
            route = null;

            for (const pr in listOfTracked){
              if (bussesData["vehicles"][property]["route_id"] == listOfTracked[pr]){
                tracked = true;
                route = listOfTracked[pr];
              }
            }

            if ((Math.abs(x-stopx)<=1) && (Math.abs(x-stopx)<=1) && (tracked == true)){
              bussInZone = true;
              array_of_busses.push(bussesData["vehicles"][property]["id"])
              array_of_routes.push(route)
            }
          }
          if (bussInZone == true){
            const arrivalEmbed = new Discord.MessageEmbed()
              .setColor('#0099ff')
              .setTitle(myStop["name"])
              .setAuthor('Serhii')
              .setTimestamp()
              .setFooter('Information about busses in zone');
            arrivalEmbed.addFields({ name: 'Busses', value: array_of_busses, inline: true });
            arrivalEmbed.addFields({ name: 'Route', value: array_of_routes, inline: true });
            Bot.sendMessage(arrivalEmbed);
          }
          bussInZone = false;
        }
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

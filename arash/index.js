require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const fetch = require('node-fetch');
const Discord = require('discord.js');

var TOKEN = process.env.DISCORDTOKEN;
var NAME = process.env.DISCORDNAME;
var CHANNEL = '812110829285015642'; // ID of the channel which this bot looks at

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
  if(msg.content === 'hi') {
    msg.channel.send('Hi Arash! I hope you are doing well!')
  }

  else if(msg.content === 'embedtest') {
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor('#04446f')
      .setTitle('Test of Embedded Messages')
      .setAuthor("Arash's Bot")
      .addFields(
        { name: 'Regular field title', value: 'Some value here' },
    	)
      .setDescription('Here is a test of embedded messages')
      .setTimestamp()
    msg.channel.send(exampleEmbed)
  }

  else if(msg.content === '!help') {
      var helpCMDS = ['!allbuses', '!buses', '!29Nstops', '!BUCK-Estops', '!BUCK-Nstops', '!LOVEstops', '!BLUEstops', '!REDstops', '!CROZ-Lstops', '!SLVstops', '!GRNstops', '!GLstops', '!ORstops', '!RDXstops'];
      var helpDescriptions = ['Lists all bus routes available at UVA',
                              'Lists active and inactive bus routes',
                              'Lists all stop locations for 29 North CONNECT',
                              'Lists all stop locations for Buckingham East CONNECT',
                              'Lists all stop locations for Buckingham North CONNECT',
                              'Lists all stop locations for Lovingston CONNECT',
                              'Lists all stop locations for Blueline',
                              'Lists all stop locations for Redline',
                              'Lists all stop locations for Crozet CONNECT Loop',
                              'Lists all stop locations for Silver Line',
                              'Lists all stop locations for Green Line',
                              'Lists all stop locations for Gold Line',
                              'Lists all stop locations for Orange Line',
                              'Lists all stop locations for Redline Express']
    const exampleEmbed = new Discord.MessageEmbed()
      .setColor('#83A4BA')
      .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
      .setTitle('List of Commands')
      .setDescription('Below are all the commands and their functions')
      .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
      .addFields(
        { name: 'Command', value: helpCMDS, inline: true },
        { name: 'Command Function', value: helpDescriptions, inline: true},
      )
      .setTimestamp()
      .setFooter("Use !help command anytime you want to see all commands and their uses")
    msg.channel.send(exampleEmbed)
  }

  else if(msg.content === '!allbuses') {
    fetch("https://api.devhub.virginia.edu/v1/transit/routes/").then(r => r.json()).then(data => {
      var routesLength = data.routes.length;
      var longarr = []
      var shortarr = []
      for (var i = 0; i < routesLength; i++) {
      	longarr.push(data.routes[i].long_name);
        shortarr.push(data.routes[i].short_name);
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('List of All Buses')
       .setDescription('Each bus below are able to be used at UVA')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'Full Name', value: longarr, inline: true },
         { name: 'Shortened Name', value: shortarr, inline: true},
     	 )
       .setTimestamp()
       .setFooter("Use !allbuses command anytime you want to see all bus route names")
      msg.channel.send(exampleEmbed)},
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!buses') {
    fetch("https://api.devhub.virginia.edu/v1/transit/routes/").then(r => r.json()).then(data => {
      var routesLength = data.routes.length;
      var longActiveArr = [];
      var longInactiveArr = [];
      var shortActiveArr = [];
      var shortInactiveArr = [];
      for (var i = 0; i < routesLength; i++) {
        if (data.routes[i].is_active === true) {
      		longActiveArr.push(data.routes[i].long_name);
          shortActiveArr.push(data.routes[i].short_name);
        }
       }
      for (var i = 0; i < routesLength; i++) {
       if (data.routes[i].is_active === false) {
      		longInactiveArr.push(data.routes[i].long_name);
          shortInactiveArr.push(data.routes[i].short_name);
       }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Active and Inactive Bus Routes')
       .setDescription('The active routes below can be currently used while inactive routes cannot be used currently.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'Full Name for Active Routes', value: longActiveArr, inline: true },
         { name: 'Shortened Name for Active Routes', value: shortActiveArr, inline: true},
         { name: '\u200B', value: '\u200B' },
         { name: 'Full Name for Inactive Routes', value: longInactiveArr, inline: true },
         { name: 'Shortened Name for Inactive Routes', value: shortInactiveArr, inline: true},
     	 )
       .setTimestamp()
       .setFooter("Use buses! command anytime you want to see active and inactive bus routes")
      msg.channel.send(exampleEmbed)},
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'movingbuses!') {
    fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json()).then(data => {
      var arr = [];
      for (const vehicle in data["vehicles"]) {
        if (data["vehicles"][vehicle]["speed"] > 0) {
          //fetch("https://api.devhub.virginia.edu/v1/transit/routes").then(r => r.json()).then(routesData => {
            //for (const route in routesData["routes"]) {
              //if (data["vehicles"][vehicle]["route_id"] === routesData["routes"][route]["id"]) {
                //arr.push(routesData["routes"][route][short_name])
              //}
            //}
            //},
          //r => msg.channel.send('Cannot access weather'))
      		arr.push(data["vehicles"][vehicle]["call_name"])
          }
      }
      msg.channel.send("Moving buses: ")
      msg.channel.send(arr)},
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!29Nstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[0].stops.length; i++) {
        idArr.push(data.routes[0].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('29 North CONNECT Stops')
       .setDescription('The location of all stops for the 29 North CONNECT routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All 29N Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !29Nstops command anytime you want to see 29N stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!BUCK-Estops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[1].stops.length; i++) {
        idArr.push(data.routes[1].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Buckingham East CONNECT Stops')
       .setDescription('The location of all stops for the Buckingham East CONNECT routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All BUCK-E Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !BUCK-Estops command anytime you want to see BUCK-E stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!BUCK-Nstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[2].stops.length; i++) {
        idArr.push(data.routes[2].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Buckingham North CONNECT Stops')
       .setDescription('The location of all stops for the Buckingham North CONNECT routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All BUCK-N Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !BUCK-Nstops command anytime you want to see BUCK-N stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!LOVEstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[3].stops.length; i++) {
        idArr.push(data.routes[3].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Lovingston CONNECT Stops')
       .setDescription('The location of all stops for the Lovingston CONNECT routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All LOVE Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !LOVEstops command anytime you want to see LOVE stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!BLUEstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[4].stops.length; i++) {
        idArr.push(data.routes[4].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Blueline Stops')
       .setDescription('The location of all stops for the Blueline routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All BLUE Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !BLUEstops command anytime you want to see BLUE stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!REDstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[5].stops.length; i++) {
        idArr.push(data.routes[5].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Redline Stops')
       .setDescription('The location of all stops for the Redline routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All RED Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !REDstops command anytime you want to see RED stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!CROZ-Lstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[6].stops.length; i++) {
        idArr.push(data.routes[6].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Crozet CONNECT Loop Stops')
       .setDescription('The location of all stops for the Crozet CONNECT Loop routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All CROZ-L Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !CROZ-Lstops command anytime you want to see CROZ-L stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!SLVstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[7].stops.length; i++) {
        idArr.push(data.routes[7].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Silver Line Stops')
       .setDescription('The location of all stops for the Silver Line routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All SLV Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !SLVstops command anytime you want to see SLV stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!GRNstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[8].stops.length; i++) {
        idArr.push(data.routes[8].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Green Line Stops')
       .setDescription('The location of all stops for the Green Line routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All GRN Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !GRNstops command anytime you want to see GRN stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!GLstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[9].stops.length; i++) {
        idArr.push(data.routes[9].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Gold Line Stops')
       .setDescription('The location of all stops for the Gold Line routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All GL Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !GLstops command anytime you want to see GL stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!ORstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[10].stops.length; i++) {
        idArr.push(data.routes[10].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Orange Line Stops')
       .setDescription('The location of all stops for the Orange Line routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All OR Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !ORstops command anytime you want to see OR stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === '!RDXstops') {
    fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
      var idArr = [];
      var stopArr = [];
      for (let i = 0; i < data.routes[11].stops.length; i++) {
        idArr.push(data.routes[11].stops[i])
      }
      for (let i = 0; i < idArr.length; i++) {
        for (let j = 0; j < data.stops.length; j++) {
          if (idArr[i] === data.stops[j].id) {
            stopArr.push(data.stops[j].name);
          }
        }
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#83A4BA')
       .setAuthor("Arash's Bot", "https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg")
       .setTitle('Redline Express Stops')
       .setDescription('The location of all stops for the Redline Express routes are listed.')
       .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
       .addFields(
         { name: 'All RDX Stop Locations', value: stopArr, inline: true },
     	 )
       .setTimestamp()
       .setFooter("Use !RDXstops command anytime you want to see RDX stop locations.")
      msg.channel.send(exampleEmbed);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'What is the weather?'){
    fetch("https://api.weatherbit.io/v2.0/current?city=Charlottesville,VA&key=932b1f06a2164b0ea1b137d62b1eee51&include=minutely").then(r => r.json()).then(data => {
      msg.channel.send(data.data[0].weather.description)},
      r => msg.channel.send('Cannot access weather'))
    }

  else if(msg.content === 'What is your favorite color?')
      msg.channel.send('My favorite color is blue.')

  else if(msg.content === 'Tell me about yourself')
      msg.channel.send('My name is Arash Azizi. My favorite food is chocolate and my favorite football team is the Eagles.')
}

// Behavior independent of messages goes here.
// Function executed every 5 seconds.
var time = 0;
function onInterval(Client) {
    // There's some interesting syntax going on here but your code goes inside the inner curly braces.
    return async () => {
        time += 5;
        console.log('Executed interval.');

        fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json()).then(data => {
          let userStop = 4235134;
          for (const dataField in data["vehicles"]) {
            //console.log(data["vehicles"][dataField]["call_name"])
            if (data["vehicles"][dataField]["current_stop_id"] === userStop) {
              Bot.sendMessage("Bus is at your stop!");
            }
          }
          },
          r => Bot.sendMessage('Cannot access Bus Information'))
        //Bot.sendMessage("First");

        fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json()).then(data => {
          let userStop = 4235134;
          for (const dataField in data["vehicles"]) {
            //console.log(data["vehicles"][dataField]["id"])
            if (data["vehicles"][dataField]["next_stop"] === userStop) {
              Bot.sendMessage("Bus will be at your stop soon!");
            }
          }
          },
          r => Bot.sendMessage('Cannot access Bus Information'))
        /*
        fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json()).then(data => {
          let stopLong = 0;
          let stopLat = 0;
          for (const dataField in data["stops"]) {
            if (data["stops"][dataField]["id"] === 4235134) {
              stopLat = data["stops"][dataField]["position"][0]
              stopLong = = data["stops"][dataField]["position"][0]
            }
          }
          },
        r => Bot.sendMessage('Cannot access Bus Information'))
        //Bot.sendMessage("Second");
        */
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

fetch("https://api.weatherbit.io/v2.0/current?city=Charlottesville,VA&key=932b1f06a2164b0ea1b137d62b1eee51&include=minutely").then(r => r.json()).then(data => {
  let weatherReport = data.data[0].weather.description;
})

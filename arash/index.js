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

  else if(msg.content === 'allbuses!') {
    fetch("https://api.devhub.virginia.edu/v1/transit/routes/").then(r => r.json()).then(data => {
      var routesLength = data.routes.length;
      var longarr = []
      var shortarr = []
      for (var i = 0; i < routesLength; i++) {
      	longarr.push(data.routes[i].long_name);
        shortarr.push(data.routes[i].short_name);
      }
      const exampleEmbed = new Discord.MessageEmbed()
       .setColor('#407294')
       .setAuthor("Arash's Bot")
       .setTitle('List of All Buses')
       .setDescription('Each bus below are able to be used by students at UVA')
       .addFields(
         { name: 'Full Name', value: longarr, inline: true },
         { name: 'Shortened Name', value: shortarr, inline: true},
     	 )
       .setTimestamp()
      msg.channel.send(exampleEmbed)},
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'buses!') {
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
       .setAuthor("Arash's Bot")
       .setTitle('Active and Inactive Buses')
       .setDescription('The active buses below can be currently used while inactive buses cannot be used currently.')
       .addFields(
         { name: 'Full Name for Active Buses', value: longActiveArr, inline: true },
         { name: 'Shortened Name for Active Buses', value: shortActiveArr, inline: true},
         { name: '\u200B', value: '\u200B' },
         { name: 'Full Name for Inactive Buses', value: longInactiveArr, inline: true },
         { name: 'Shortened Name for Inactive Buses', value: shortInactiveArr, inline: true},
     	 )
       .setTimestamp()
       .setFooter("Use buses! command anytime you want to see active and inactive buses")
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

  else if(msg.content === '29Nstops!') {
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
      msg.channel.send("List of all 29 North CONNECT Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'BUCK-Estops!') {
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
      msg.channel.send("List of all Buckingham East CONNECT Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'BUCK-Nstops!') {
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
      msg.channel.send("List of all Buckingham North CONNECT Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'LOVEstops!') {
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
      msg.channel.send("List of all Lovingston CONNECT Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'BLUEstops!') {
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
      msg.channel.send("List of all Blueline Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'REDstops!') {
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
      msg.channel.send("List of all Redline Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'CROZ-Lstops!') {
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
      msg.channel.send("List of all Crozet CONNECT Loop Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'SLVstops!') {
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
      msg.channel.send("List of all Silver Line Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'GRNstops!') {
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
      msg.channel.send("List of all Green Line Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'GLstops!') {
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
      msg.channel.send("List of all Gold Line Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'ORstops!') {
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
      msg.channel.send("List of all Orange Line Stops: ");
      msg.channel.send(stopArr);
      },
      r => msg.channel.send('Cannot access weather'))
  }

  else if(msg.content === 'RDXstops!') {
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
      msg.channel.send("List of all Redline Express Stops: ");
      msg.channel.send(stopArr);
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

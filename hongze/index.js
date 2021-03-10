require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const fetch = require('node-fetch');

var TOKEN = process.env.DISCORDTOKEN;
var NAME = process.env.DISCORDNAME;
var CHANNEL = '812110768602480680'; // ID of the channel which this bot looks at

var routeID = new Map();
var routeNames = new Map();
var stopNames = new Map();
var stopID = new Map();
var routeData = undefined;
var busData = undefined;
var stopData = undefined;
var waiting = new Map();
var arriving = new Map();
var arrived = new Map();

Bot.sendMessage = (content, channel) => (Bot.channels.cache.get(channel ?? CHANNEL) ?? {send: () => null}).send(content);

async function BotLogin(token, name, channel) {
    if(token) TOKEN = token;
    if(name) NAME= name;
    if(channel) CHANNEL = channel;
    await Bot.login(TOKEN);
    console.log(`[DISC] Logged in as ${NAME}`);
    await refresh();
}

Bot.on('error', err => {
    console.log(`[DISC] !! Error in bot ${NAME}:\n{err}`);
});

async function refresh(){
  let p1 = fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json());
  let p2 = fetch("https://api.devhub.virginia.edu/v1/transit/routes").then(r => r.json());
  let p3 = fetch("https://api.devhub.virginia.edu/v1/transit/bus-stops").then(r => r.json());
  Promise.all([p1,p2,p3]).then(values => {
    busData = values[0];
    routeData = values[1];
    stopData = values[2];
    routeID.clear();
    routeNames.clear();
    stopID.clear();
    stopNames.clear();
    for(let i=0; i<routeData.routes.length; i++){
      routeID.set(routeData.routes[i].short_name, routeData.routes[i].id);
      routeNames.set(routeData.routes[i].id, routeData.routes[i].short_name);
    }
    for(let i=0; i<stopData.stops.length; i++){
      stopNames.set(stopData.stops[i].id, stopData.stops[i].name);
      stopID.set(stopData.stops[i].name, stopData.stops[i].id)
    }
    console.log("Refresh Complete!");
  }, r=>{console.log("Refresh Failed...");});
}

// Dictates bot behavior when it sees a message being sent.
async function onMessage(msg) {
  /*
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
  }*/
  if(msg.content==="!refresh"){
    await refresh();
    msg.channel.send("Refreshed!");
  }
  else if(msg.content.startsWith("!await")){
    const request = msg.content.split(" ");
    if(request.length===1)
      msg.channel.send("Not enough arguments. Please specify bus stop id, optionally followed by bus routes");
    else{
      if(!stopNames.has(parseInt(request[1])))
        msg.channel.send("Invalid bus stop ID; please try again");
      else if(request.length===2){
        let s="";
        if(waiting.has(parseInt(request[1])))
          s+="Overwriting previous await request at"+stopNames.get(parseInt(request[1]))+'\n';
        waiting.set(parseInt(request[1]), null);
        arriving.set(parseInt(request[1]), []);
        arrived.set(parseInt(request[1]), []);
        msg.channel.send(s+`Now awaiting: ${stopNames.get(parseInt(request[1]))}\nRoutes: all`);
        updateBuses();
      }
      else{
        let routes = [];
        let invalid = [];
        for(let i=2; i<request.length; i++){
          if(!isNaN(request[i]) && routeNames.has(parseInt(request[i])))
            routes.push(parseInt(request[i]));
          else if(routeID.has(request[i].toUpperCase()))
            routes.push(routeID.get(request[i].toUpperCase()));
          else
            invalid.push(request[i]);
        }
        if(routes.length===0)
          msg.channel.send("Invalid bus route(s) specified; please try again"); //nothing is set
        else{
          let s="";
          if(waiting.has(parseInt(request[1])))
            s+="Overwriting previous await request at"+stopNames.get(parseInt(request[1]))+'\n';
          waiting.set(parseInt(request[1]), routes);
          arriving.set(parseInt(request[1]), new Set());
          arrived.set(parseInt(request[1]), new Set());
          s += `Now awaiting: ${stopNames.get(parseInt(request[1]))}\nRoutes: ${routes.map(x=>routeNames.get(x))}`;
          if(invalid.length>0)
            s+= `\nInvalid Arguments: ${invalid}`;
          let inactive=[];
          for(const r of routes){
            const data = await fetch("https://api.devhub.virginia.edu/v1/transit/routes/"+r).then(r=>r.json())
            if(data.routes.is_active===false)
              inactive.push(data.routes.short_name);
          }
          if(inactive.length>0)
            s+=`\nWarning: The following route(s) are currently inactive: ${inactive}`
          msg.channel.send(s);
          updateBuses();
        }
      }
    }
  }
  else if(msg.content==="!status"){
    if(waiting.size===0)
      msg.channel.send("You are not currently waiting for any buses.");
    else{
      let s = "Currently waiting for buses at:";
      for(const entry of waiting)
        s += `\n${stopNames.get(entry[0])}; Routes: ${entry[1]!==null ? entry[1].map(x=>routeNames.get(x)) : "all"}`;
      msg.channel.send(s);
    }
  }
  else if(msg.content.toLowerCase()==="!clearall"){
    waiting.clear();
    arriving.clear();
    arrived.clear();
    msg.channel.send("All await requests cleared")
  }
}

function updateBuses(){
  for(const stop of waiting.keys()){
    const arriving_buses = busData.vehicles.filter(x=> x.next_stop===stop && (waiting.get(stop)===null ? true : waiting.get(stop).includes(x.route_id))).map(x=>[x.id, x.route_id]);
    const arrived_buses = busData.vehicles.filter(x=> x.current_stop===stop && (waiting.get(stop)===null ? true : waiting.get(stop).includes(x.route_id))).map(x=>[x.id, x.route_id]);
    let new_buses = [];
    for(const bus of arriving_buses){
      if(!arriving.get(stop).has(bus[0]))
        new_buses.push(bus[1]);
    }
    if(new_buses.length>0)
      for(const bus_route of new_buses)
        Bot.sendMessage(`Alert: A ${routeNames.get(bus_route)} bus is one stop away from ${stopNames.get(stop)}!`,CHANNEL);

    new_buses = [];
    for(const bus of arrived_buses){
      if(!arrived.get(stop).has(bus[0]))
        new_buses.push(bus[1]);
    }
    if(new_buses.length>0)
      for(const bus_route of new_buses)
        Bot.sendMessage(`Alert: A ${routeNames.get(bus_route)} bus has arrived at ${stopNames.get(stop)}!`,CHANNEL);
    arriving.set(stop, new Set(arriving_buses.map(x=>x[0])))
    arrived.set(stop, new Set(arrived_buses.map(x=>x[0])))
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
        busData = await fetch("https://api.devhub.virginia.edu/v1/transit/vehicles").then(r => r.json());
        updateBuses();
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

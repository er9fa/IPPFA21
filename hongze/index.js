require('dotenv').config();
const Bot = new (require('discord.js').Client)();
const fetch = require('node-fetch');
const Discord = require('discord.js');

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
    updateBuses();
  }
  else if(msg.content.startsWith("!await")){
    const request = msg.content.split(" ");
    const awaitEmbed = await awaitRequest(request);
    msg.channel.send(awaitEmbed);
  }

  else if(msg.content==="!status"){
    const statusEmbed = new Discord.MessageEmbed().setTitle("Awaited Buses");
    if(waiting.size===0)
      msg.channel.send(statusEmbed.setDescription("You are not currently waiting for any buses."));
    else{
      statusEmbed.setDescription("Currently waiting for buses at:");
      let s="";
      let t="";
      let count=0;
      for(const entry of waiting){
        s += `${++count}: ${stopNames.get(entry[0])}`;
        t += `${entry[1]!==null ? entry[1].map(x=>routeNames.get(x)) : "all"}\n`;
      }
      statusEmbed.addFields(
        { name: 'Stop', value:s, inline: true },
        { name: 'Routes', value:t, inline:true},
      )
      msg.channel.send(statusEmbed);
    }
  }
  else if(msg.content.toLowerCase()==="!clearall"){
    waiting.clear();
    arriving.clear();
    arrived.clear();
    msg.channel.send(new Discord.MessageEmbed().setTitle('Cleared Awaits').setDescription("All await requests cleared!"));
  }
  /*
  else if(msg.content.startsWith("!clear")){
    const request = msg.content.split(" ");
    const clearEmbed = new Discord.MessageEmbed().setTitle('Cleared Awaits');
    if(request.length===1){
      clearEmbed.setDescription("Please specify one or more await requests to clear.")
    }
    else{
      let cleared=false;
      let s="";
      let t="";
      for(let i=1; i<request.length; i++){
        const n = parseInt(request[i]);
        if(n===NaN || n>=waiting.length)
          continue;


      }
    }
*/

  else if(msg.content.startsWith("!lookup")){
    const request = msg.content.split(" ");
    const lookupEmbed = new Discord.MessageEmbed()
      .setTitle('Bus Stop Lookup')
    let search = "";
    if(request.length>1)
      search = request[1];
    else {
      lookupEmbed.setDescription("Please add a search term.");
      msg.channel.send(lookupEmbed);
      return;
    }
    let s = "";
    let t = "";
    for(const key of Array.from(stopID, x=>x[0]).sort()){
      if(key.toUpperCase().startsWith(search.toUpperCase())){
        //s+=key+": "+stopID.get(key)+"\n";
        s+=key+"\n";
        t+=stopID.get(key)+"\n";
      }
    }
    console.log(s);
    if(s!=""){
      lookupEmbed.addFields({ name: 'Stop Name', value: s, inline:true},
                            { name: 'ID', value: t, inline:true});
    }
    else{
      lookupEmbed.setDescription("No bus stops found. Try changing your search term");
    }
    msg.channel.send(lookupEmbed);
  }

  else if(msg.content.toLowerCase().startsWith("!addstop")){
    const request = msg.content.split(" ");
    const embed = new Discord.MessageEmbed().setTitle("Bus Stop Role Assignment");
    if(request.length===1 || parseInt(request[1])===NaN)
      embed.setDescription("Please enter a valid stop ID.");
    else{
      const id = parseInt(request[1]);
      if(!stopNames.has(id))
        embed.setDescription("Invalid stop ID; use !lookup to find your stop");
      else{
        let role = msg.guild.roles.cache.find(role => role.name === stopNames.get(id));
        let member = msg.member;
        member.roles.add(role).catch(console.error);
        embed.setDescription("Saved Stop: "+stopNames.get(id));
      }
    }
    msg.channel.send(embed);
  }
  else if(msg.content.toLowerCase().startsWith("!removestop")){
    const request = msg.content.split(" ");
    const embed = new Discord.MessageEmbed().setTitle("Bus Stop Role Assignment");
    if(request.length===1 || parseInt(request[1])===NaN)
      embed.setDescription("Please enter a valid stop ID.");
    else{
      const id = parseInt(request[1]);
      if(!stopNames.has(id))
        embed.setDescription("Invalid stop ID; use !lookup to find your stop");
      else{
        let role = msg.guild.roles.cache.find(role => role.name === stopNames.get(id));
        let member = msg.member;
        if(!member.roles.cache.has(role.id))
          embed.setDescription("You do not have this stop saved!");
        else{
          member.roles.remove(role).catch(console.error);
          embed.setDescription("Removed Stop: "+stopNames.get(id));
        }
      }
    }
    msg.channel.send(embed);
  }

  else if(msg.content === "!printStatus"){
    console.log(arriving);
    console.log(arrived);
  }
  else if(msg.content.startsWith("!test")){
    const request = msg.content.split(" ");
    let route = routeID.get(request[2]);
    const s = generateEmbed(parseInt(request[1]), route);
    console.log(request);
    msg.channel.send(s);
  }

  else if(msg.content.toLowerCase()==="!help"){
    var helpCMDS = ['!refresh','!await','!status','!clearAll','!lookup', '!addStop', '!removeStop'];
    var helpDescriptions = ['Immediately refreshes bus data',
                            'Creates an await request at a given bus stop',// (and route(s))',
                            'Shows created await requests',
                            'Deletes all active await requests',
                            'Looks up bus stop IDs by name/search term',
                            'Adds a role corresponding to a bus stop',
                            'Removes a role']
  const helpEmbed = new Discord.MessageEmbed()
    .setColor("LUMINOUS_VIVID_PINK")
    .setAuthor('BusBot', 'attachment://Bus.jpg', 'https://uva.transloc.com/')
    .setTitle('Commands List')
    .setDescription('A list of commands the BusBot can accept:')
    .setThumbnail('https://www.piedmontforum.com/wp-content/uploads/2017/05/busdriver.jpg')
    .addFields(
      { name: 'Command', value: helpCMDS, inline: true },
      { name: 'Function', value: helpDescriptions, inline: true},
    )
    .setTimestamp()
    .setFooter("Use !help command anytime to view all commands.")
  msg.channel.send(helpEmbed)
  }
}

async function awaitRequest(request){
  const awaitEmbed = new Discord.MessageEmbed().setTitle('New Await Request');
  if(request.length===1)
    awaitEmbed.setDescription("Not enough arguments. Please specify bus stop id, optionally followed by bus routes");
  else{
    if(!stopNames.has(parseInt(request[1])))
      awaitEmbed.setDescription("Invalid bus stop ID; please try again");
      //msg.channel.send("Invalid bus stop ID; please try again");
    else if(request.length===2){ //no route parameters
      //let s="";
      if(waiting.has(parseInt(request[1])))
        awaitEmbed.setDescription("Overwriting previous await request at"+stopNames.get(parseInt(request[1]))+'\n');
      else
        awaitEmbed.setDescription("New await request created!");
      waiting.set(parseInt(request[1]), null);
      arriving.set(parseInt(request[1]), new Set());
      arrived.set(parseInt(request[1]), new Set());
      //msg.channel.send(s+`Now awaiting: ${stopNames.get(parseInt(request[1]))}\nRoutes: all`);
      awaitEmbed.addFields(
        { name: 'Stop', value: stopNames.get(parseInt(request[1])), inline: true },
        { name: 'Routes', value: "All", inline: true },
      )
      updateBuses();

    }
    else{ //route parameters
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
        awaitEmbed.setDescription("Invalid bus route(s) specified; please try again"); //nothing is set
      else{
        if(waiting.has(parseInt(request[1])))
          awaitEmbed.setDescription("Overwriting previous await request at"+stopNames.get(parseInt(request[1]))+'\n');
        else
          awaitEmbed.setDescription("New await request created!");
        waiting.set(parseInt(request[1]), routes);
        arriving.set(parseInt(request[1]), new Set());
        arrived.set(parseInt(request[1]), new Set());
        //s += `Now awaiting: ${stopNames.get(parseInt(request[1]))}\nRoutes: ${routes.map(x=>routeNames.get(x))}`;
        let rn = routes.map(x=>routeNames.get(x));
        //let s = "";
        //rn.forEach(element=>s += element+"\n")
        awaitEmbed.addFields(
          { name: 'Stop', value: stopNames.get(parseInt(request[1])), inline: true },
          { name: 'Routes', value: rn, inline: true },
        )
        if(invalid.length>0){
          //let s="";
          //invalid.forEach(element=>s += element+"\n");
          awaitEmbed.addFields('Invalid Arguments',invalid, true)
        }
        let inactive=[];
        for(const r of routes){
          const data = await fetch("https://api.devhub.virginia.edu/v1/transit/routes/"+r).then(r=>r.json());
          if(data.routes.is_active===false)
            inactive.push(data.routes.short_name);
        }
        if(inactive.length>0){
          //let s="";
          //inactive.forEach(element=>s += element+"\n");
          awaitEmbed.addField('Warning: The following route(s) are currently inactive:', inactive);
        }
        updateBuses();
      }
    }
  }
  return awaitEmbed;
}

function updateBuses(){
  for(const stop of waiting.keys()){
    const arriving_buses = busData.vehicles.filter(x=> x.next_stop===stop && (waiting.get(stop)===null ? true : waiting.get(stop).includes(x.route_id))).map(x=>[x.id, x.route_id]);
    const arrived_buses = busData.vehicles.filter(x=> x.current_stop_id===stop && (waiting.get(stop)===null ? true : waiting.get(stop).includes(x.route_id))).map(x=>[x.id, x.route_id]);
    let new_buses = [];
    for(const bus of arriving_buses){
      if(!arriving.get(stop).has(bus[0]))
        new_buses.push(bus[1]);
    }
    if(new_buses.length>0)
      for(const bus_route of new_buses){
        //Bot.sendMessage(`Alert: A ${routeNames.get(bus_route)} bus is one stop away from ${stopNames.get(stop)}!`,CHANNEL);
        Bot.sendMessage(generateEmbed(bus_route, stop),CHANNEL);
      }
    new_buses = [];
    for(const bus of arrived_buses){
      if(!arrived.get(stop).has(bus[0]))
        new_buses.push(bus[1]);
    }
    if(new_buses.length>0)
      for(const bus_route of new_buses){
        //Bot.sendMessage(`Alert: A ${routeNames.get(bus_route)} bus has arrived at ${stopNames.get(stop)}!`,CHANNEL);
        Bot.sendMessage(generateEmbed(bus_route, stop),CHANNEL);
      }
    arriving.set(stop, new Set(arriving_buses.map(x=>x[0])))
    arrived.set(stop, new Set(arrived_buses.map(x=>x[0])))
  }

}

function generateEmbed(stop_id, route_id){
  route_name = routeNames.get(route_id)
  stop_name = stopNames.get(stop_id)
  let color="";
  let name="";
  if(route_name==="RED"){
    color="RED";
    name="Redline";
  }else if(route_name==="RDX"){
    color="DARK_RED";
    name="Redline Express";
  }else if(route_name==="BLUE"){
    color="BLUE";
    name="Blueline";
  }else if(route_name==="GL"){
    color="GOLD";
    name="Gold Line";
  }else if(route_name==="GRN"){
    color="GREEN";
    name="Green Line";
  }else if(route_name==="OR"){
    color="ORANGE";
    name="Orange Line";
  }else if(route_name==="SLV"){
    color="LIGHT_GREY";
    name="Silver Line";
  }else{
    color="BLURPLE";
    name=route_name;
  }
  const busEmbed = new Discord.MessageEmbed()
  .attachFiles(['./Bus.jpg', './Map.png'])
	.setColor(color)
	.setTitle('Bus Arrival')
	.setAuthor('BusBot', 'attachment://Bus.jpg', 'https://uva.transloc.com/')
	.setDescription('A bus is arriving at your stop!')
	.setThumbnail('attachment://Bus.jpg')
	.addFields(
		{ name: 'Stop', value: stop_name, inline: true },
		{ name: 'Route', value: name, inline: true },
    //{ name: 'Bus Number', value: "???", inline: true},
	)
	.setImage("attachment://Map.png")
	.setTimestamp()
	.setFooter('Can\'t think of a better footer.', 'https://i.imgur.com/wSTFkRM.png');
  return busEmbed;
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

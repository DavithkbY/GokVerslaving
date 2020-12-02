const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();


client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}



const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();
const talkedRecently = new Set();
const prefix = '!';
const botconfig = require('./botconfig.json');
Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
        }
		const newUser = await Users.create({ user_id: id, balance: 1000,daily:"2020-11-30T22:00" });
		currency.set(id, newUser);
		return newUser;
	},
});


Reflect.defineProperty(currency, 'getDaily', {
	value: async function add(id) {
		const user = currency.get(id);
		if (user) {
            if(user.daily==="2020-11-30T22:00"){
                user.daily = new Date().toJSON().substring(0,16);
            }
            
			return user.save();
        }

		const newUser = await Users.create({ user_id: id, balance: 1000,daily: "2020-11-30T22:00" });
		currency.set(id, newUser);
		return newUser.daily;
	},
});

Reflect.defineProperty(currency, 'setDaily', {
	value: async function add(id) {
		const user = currency.get(id);
		if (user) {
            user.daily = new Date().toJSON().substring(0,16);
			return user.save();
        }
	},
});


Reflect.defineProperty(currency, 'getBalance', {
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});








client.once('ready', async () => {
    const storedBalances = await Users.findAll();
    storedBalances.forEach(b => currency.set(b.user_id, b));
    console.log(`Logged in as ${client.user.tag}!`);
});




client.on('message', async message => {

	if (message.author.bot) return;
	// ZO VOEG JE CURRENCY TOE currency.add(message.author.id, 1);
    if (talkedRecently.has(message.author.id)) {
        message.channel.send(`Je typte te snel, wacht nog even ${message.author}`);
    } else {
        if (!message.content.startsWith(prefix)) return;
        const input = message.content.slice(prefix.length).trim();
        if (!input.length) return;
        const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

        if (command === 'balans') {
            const target = message.mentions.users.first() || message.author;
            const commandList = new Discord.MessageEmbed()
            .setColor('#009900')
            .addFields(
                { name: `:credit_card: Balans ${target.tag} `, value: `€ ${currency.getBalance(target.id)}`}
            )
            .setTimestamp()
            .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');
            message.channel.send(commandList);

        } 
        else if (command === 'inventory') {
            const target = message.mentions.users.first() || message.author;
            const user = await Users.findOne({ where: { user_id: target.id } });
            const items = await user.getItems();

            if (!items.length) message.channel.send(`${target.tag} has nothing!`);
            else{
                message.channel.send(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
            }
            
        } 
        else if (command === 'schooi') {
            client.commands.get('schooi').execute(message, currency,Date);
        } 
        else if (command === 'cheatgeld') {
            client.commands.get('cheatgeld').execute(message, currency);
        } 
        else if (command === 'help') {
            client.commands.get('help').execute(message, Discord);
        } 
        else if (command === 'overschrijving') {
            client.commands.get('overschrijving').execute(message, currency,commandArgs,Discord);
        } 
        else if (command === 'dobbel') {
            client.commands.get('dobbel').execute(message, currency,commandArgs,Discord);
        } 
        else if (command === 'koop') {
            const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
            if (!item) message.channel.send(`That item doesn't exist.`);
            else if (item.cost > currency.getBalance(message.author.id)) {
                message.channel.send(`You currently have ${currency.getBalance(message.author.id)}, but the ${item.name} costs ${item.cost}!`);
            }
            else {
                const user = await Users.findOne({ where: { user_id: message.author.id } });
                currency.add(message.author.id, -item.cost);
                await user.addItem(item);
                message.channel.send(`You've bought: ${item.name}.`);
            }
        }
        else if (command === 'aldi') {
            const items = await CurrencyShop.findAll();
            message.channel.send(items.map(item => `${item.name}: ${item.cost}💰`).join('\n'), { code: true });
        } 
        else if (command === 'ranking') {
            client.commands.get('ranking').execute(message, currency,commandArgs,Discord,client);
        }

    }
    talkedRecently.add(message.author.id);
    setTimeout(() => {
        talkedRecently.delete(message.author.id);
      }, 2000);
      return;
});
















client.login(botconfig.token);
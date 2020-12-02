const Discord = require('discord.js');
const client = new Discord.Client();
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





const fs = require('fs');
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'))
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command)

}

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
            const target = message.mentions.users.first() || message.author;

            currency.getDaily(target.id).then(function(result) {
                const dateUser = result;
                var dateNow = new Date().toJSON().substring(0,16)
                if(dateUser.daily==="2020-11-30T22:00"){
                    message.channel.send(`Daily toegevoegd`);
                    
                }
                else if(dateUser.daily == null){
                    message.channel.send(`Daily toegevoegd!`);
                }
                else{

                    var timestamp = Date.parse(dateUser.daily); // Tijd van de user

                    var d = new Date(); // today!
                    var milli = d.getTime()

                    if((timestamp+43200000)<=milli){
                        currency.setDaily(target.id)
                        currency.add(message.author.id, 1000);
                        message.channel.send(`Daily toegevoegd!`);
                    }
                    else{
                        var time= new Date(timestamp+43200000-milli);
                        message.channel.send(`Je moet nog ${time.getHours()} uur wachten.`);
                    }
                }

            });

        } 
        else if (command === 'cheatgeld') {
            if(message.member.roles.cache.some(role => role.name === 'Botfixer')){
                currency.add(message.author.id, 10000);
            }
        } 
        else if (command === 'help') {
        const commandList = new Discord.MessageEmbed()
            .setColor('#009900')
            .setTitle('GokVerslaving')
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .setDescription('Hier is een lijstje met alle commands voor de GokVerslaving bot!')
            .setThumbnail('https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png')
            .addFields(
                { name: ':credit_card: !balans', value: 'Toont jouw balans' },
                { name: '🏦 !overschrijving', value: 'Schrijf geld over naar je tante' },
                { name: '🛒 !aldi', value: 'Koop wat skere shit en hoop hiermee geld te verdienen' },
                { name: ':money_with_wings: !koop', value: 'Splash je monies' },
                { name: ':bar_chart: !ranking', value: "Kijk wie de rijkste tata's zijn" },
                { name: ':raised_hands: !schooi', value: 'Schooi voor een beetje geld bij Davit'  },
                { name: '🎲 !dobbel [getal] [bedrag]', value: 'Gok met dobbellen'  },
            )
            .setTimestamp()
            .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');

            message.channel.send(commandList);
        } 
        else if (command === 'overschrijving') {
            const currentAmount = currency.getBalance(message.author.id);
            const transferAmount = commandArgs.split(/ +/g).find(arg => !/<@!?\d+>/g.test(arg));
            const transferTarget = message.mentions.users.first();

            if (!transferAmount || isNaN(transferAmount)) message.channel.send(`Sorry ${message.author}, that's an invalid amount.`);
            else if (transferAmount > currentAmount) message.channel.send(`Sorry ${message.author}, you only have ${currentAmount}.`);
            else if (transferAmount <= 0) message.channel.send(`Please enter an amount greater than zero, ${message.author}.`);
            else {
                currency.add(message.author.id, -transferAmount);
                currency.add(transferTarget.id, transferAmount);
    
                message.channel.send(`Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your current balance is ${currency.getBalance(message.author.id)}💰`);
            }

        } 
        else if (command === 'dobbel') {


            const currentAmount = currency.getBalance(message.author.id);

            const num = commandArgs.split(' ');

            const gambleNumber = parseInt(num[0],10);
            const playAmount = parseInt(num[1],10);


            if(!(gambleNumber >0) || !(gambleNumber<=6)){
                message.channel.send(`Je ingegeven getal is ongeldig.`);
            }
            else if(!(playAmount>0)){
                message.channel.send(`Je ingegeven bedrag is ongeldig.`);
            }
            else if (playAmount > currentAmount) {
                message.channel.send(`Sorry ${message.author}, je hebt maar ${currentAmount} geld.`)
            }
            
            else{
                const rol = Math.floor(Math.random() * 6) + 1

                if(rol === gambleNumber){
                    const winnings = 6*playAmount;
                    currency.add(message.author.id, winnings)
                    const winningMessage = new Discord.MessageEmbed()
                    .setColor('#009900')
                    .setTitle('🎲Aan het rollen...')
                    .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                    .setDescription(`${rol} Werd gerold! ${message.author} wint € ${winnings}.`)
                    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2-Dice-Icon.svg/1200px-2-Dice-Icon.svg.png')
                    .addFields(
                        { name: ':money_with_wings: Nieuwe balans', value: `€ ${currency.getBalance(message.author.id)}` }
                    )
                    .setTimestamp()
                    .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');
            
                    message.channel.send(winningMessage);
                }
                else{
                    currency.add(message.author.id, -playAmount);
                    const losingMessage = new Discord.MessageEmbed()
                    .setColor('#FF0000')
                    .setTitle('🎲Aan het rollen...')
                    .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
                    .setDescription(`${rol} Werd gerold! ${message.author} verliest € ${playAmount} :(`)
                    .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2-Dice-Icon.svg/1200px-2-Dice-Icon.svg.png')
                    .addFields(
                        { name: ':money_with_wings: Nieuwe balans', value: `€ ${currency.getBalance(message.author.id)}` }
                    )
                    .setTimestamp()
                    .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');
            
                    message.channel.send(losingMessage);
                }
            }

        } 
        
        else if (command === 'koop') {
            const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
            if (!item) message.channel.send(`That item doesn't exist.`);
            if (item.cost > currency.getBalance(message.author.id)) {
                message.channel.send(`You currently have ${currency.getBalance(message.author.id)}, but the ${item.name} costs ${item.cost}!`);
            }

            const user = await Users.findOne({ where: { user_id: message.author.id } });
            currency.add(message.author.id, -item.cost);
            await user.addItem(item);

            message.channel.send(`You've bought: ${item.name}.`);
        } else if (command === 'aldi') {
            const items = await CurrencyShop.findAll();
            message.channel.send(items.map(item => `${item.name}: ${item.cost}💰`).join('\n'), { code: true });
        } else if (command === 'ranking') {
            message.channel.send(
                currency.sort((a, b) => b.balance - a.balance)
                    .filter(user => client.users.cache.has(user.user_id))
                    .first(10)
                    .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
                    .join('\n'),
                { code: true }
            );
        }

    }
    talkedRecently.add(message.author.id);
    setTimeout(() => {
        talkedRecently.delete(message.author.id);
      }, 2000);
      return;
});
















client.login(botconfig.token);
const Discord = require('discord.js');
const client = new Discord.Client();
const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();

// https://discord.com/oauth2/authorize?client_id=782735410257330226&scope=bot&permissions=2147483647

const prefix = '!';

Reflect.defineProperty(currency, 'add', {
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
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

	if (!message.content.startsWith(prefix)) return;
	const input = message.content.slice(prefix.length).trim();
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

	if (command === 'balance') {
		const target = message.mentions.users.first() || message.author;
        const commandList = new Discord.MessageEmbed()
        .setColor('#009900')
        .setTitle(`🤑Balans ${target.tag} 🤑`)
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setDescription(`€ ${currency.getBalance(target.id)}`)
        .setTimestamp()
        .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');

        return message.channel.send(commandList);

	} else if (command === 'inventory') {
		const target = message.mentions.users.first() || message.author;
        const user = await Users.findOne({ where: { user_id: target.id } });
        const items = await user.getItems();

        if (!items.length) return message.channel.send(`${target.tag} has nothing!`);
        return message.channel.send(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
    } 
    else if (command === 'cheatgeld') {


        if(message.member.roles.cache.some(role => role.name === 'Botfixer')){
            currency.add(message.author.id, 999);
        }

    } 
    else if (command === 'help') {
    const commandList = new Discord.MessageEmbed()
        .setColor('#009900')
        .setTitle('🤑GokVerslaving🤑')
        .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        .setDescription('Hier is een lijstje met alle commands voor de GokVerslaving bot!')
        .setThumbnail('https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png')
        .addFields(
            { name: ':money_with_wings: !buy', value: 'Some value here' },
            { name: '🏦!transfer', value: 'Some value here' },
            { name: '🛒!shop', value: 'Some value here' },
            { name: ':bar_chart: !leaderboard', value: 'Some value here' },
        )
        .setTimestamp()
        .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');

        return message.channel.send(commandList);
	} else if (command === 'transfer') {
		const currentAmount = currency.getBalance(message.author.id);
        const transferAmount = commandArgs.split(/ +/g).find(arg => !/<@!?\d+>/g.test(arg));
        const transferTarget = message.mentions.users.first();

        if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Sorry ${message.author}, that's an invalid amount.`);
        if (transferAmount > currentAmount) return message.channel.send(`Sorry ${message.author}, you only have ${currentAmount}.`);
        if (transferAmount <= 0) return message.channel.send(`Please enter an amount greater than zero, ${message.author}.`);

        currency.add(message.author.id, -transferAmount);
        currency.add(transferTarget.id, transferAmount);

        return message.channel.send(`Successfully transferred ${transferAmount}💰 to ${transferTarget.tag}. Your current balance is ${currency.getBalance(message.author.id)}💰`);
    } 
    else if (command === 'dice') {


		const currentAmount = currency.getBalance(message.author.id);

        const num = commandArgs.split(' ');

        var gambleNumber = parseInt(num[0],10);
        var playAmount = parseInt(num[1],10);


        if(!(gambleNumber >0) || !(gambleNumber<=6)){
            return message.channel.send(`Je ingegeven getal is ongeldig.`);
        }
        if(!(playAmount>0)){
            return message.channel.send(`Je ingegeven bedrag is ongeldig.`);
        }
        else{
            if (playAmount > currentAmount) return message.channel.send(`Sorry ${message.author}, je hebt maar ${currentAmount} geld.`);
        }

        

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
                { name: ':money_with_wings: Nieuw balans', value: `€ ${currentAmount}` }
            )
            .setTimestamp()
            .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');
    
            return message.channel.send(winningMessage);
        }
        else{
            currency.add(message.author.id, -playAmount);

            const losingMessage = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('🎲Aan het rollen...')
            .setURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
            .setDescription(`${rol} Werd gerold! ${message.author} verliest € ${playAmount} :(.`)
            .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/2-Dice-Icon.svg/1200px-2-Dice-Icon.svg.png')
            .addFields(
                { name: ':money_with_wings: Nieuw balans', value: `€ ${currentAmount}` }
            )
            .setTimestamp()
            .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');
    
            return message.channel.send(losingMessage);
        }

        

    } 
    
    else if (command === 'buy') {
		const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
        if (!item) return message.channel.send(`That item doesn't exist.`);
        if (item.cost > currency.getBalance(message.author.id)) {
            return message.channel.send(`You currently have ${currency.getBalance(message.author.id)}, but the ${item.name} costs ${item.cost}!`);
        }

        const user = await Users.findOne({ where: { user_id: message.author.id } });
        currency.add(message.author.id, -item.cost);
        await user.addItem(item);

        message.channel.send(`You've bought: ${item.name}.`);
	} else if (command === 'shop') {
		const items = await CurrencyShop.findAll();
        return message.channel.send(items.map(item => `${item.name}: ${item.cost}💰`).join('\n'), { code: true });
	} else if (command === 'leaderboard') {
		return message.channel.send(
            currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.has(user.user_id))
                .first(10)
                .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
                .join('\n'),
            { code: true }
        );
	}

});
















client.login(process.env.token);
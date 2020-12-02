module.exports = {
	name: 'dobbel',
	description: 'Ping!',
	execute(message, currency,commandArgs,Discord) {
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
	},
};


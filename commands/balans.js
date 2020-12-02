module.exports = {
	name: 'balans',
	description: 'Balans!',
    execute(message, currency,commandArgs,Discord,Date) {
        const target = message.mentions.users.first() || message.author;
        const commandList = new Discord.MessageEmbed()
        .setColor('#009900')
        .addFields(
            { name: `:credit_card: Balans ${target.tag} `, value: `€ ${currency.getBalance(target.id)}`}
        )
        .setTimestamp()
        .setFooter('Gemaakt door Amazing', 'https://cdn0.iconfinder.com/data/icons/sin-city-memories/128/777-slots-handle-512.png');
        message.channel.send(commandList);
	},
};
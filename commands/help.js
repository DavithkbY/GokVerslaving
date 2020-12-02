module.exports = {
	name: 'help',
	description: 'Help!',
    execute(message, Discord) {
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
	},
};
module.exports = {
	name: 'overschrijving',
	description: 'Overschrijving!',
	execute(message, currency,commandArgs) {
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
	},
};
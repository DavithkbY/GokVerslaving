module.exports = {
	name: 'cheatgeld',
	description: 'Cheatgeld!',
    execute(message, currency) {
        if(message.member.roles.cache.some(role => role.name === 'Botfixer')){
            currency.add(message.author.id, 10000);
        }
	},
};
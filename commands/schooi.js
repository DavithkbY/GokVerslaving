module.exports = {
	name: 'schooi',
	description: 'Schooi!',
    execute(message, currency,commandArgs,Discord,Date) {
        const target = message.mentions.users.first() || message.author;

        currency.getDaily(target.id).then(function(result) {
            const dateUser = result;
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
	},
};
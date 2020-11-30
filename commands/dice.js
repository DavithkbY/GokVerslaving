module.exports = {
    name: 'dice',
    description: 'Dit is een dice command!',
    execute(message, args){
        const random = Math.floor(Math.random() * 7);
        message.channel.send(random);
    }
}
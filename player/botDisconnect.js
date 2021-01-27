module.exports = (client, message, queue) => {
    message.channel.send(`${client.emotes.error} - You disconnected me from the channel, can't play music anymore ...`);
};

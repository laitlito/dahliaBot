module.exports = (client, message, queue) => {
    message.channel.send(`${client.emotes.error} - There's no one in the channel, I'm leaving`);
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////Canvas for welcoming new members////////////////////////
////////////////////////////////////////////////////////////////////////////////
client.on('guildMemberAdd', member =>{
  const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
  if (!channel) return;
  channel.send(`Glad to see you here ${member}, I was told you are the best :smirk_cat:`)
});
////////////////////////////////////////////////////////////////////////////////
const applyText = (canvas, text) => {
  const ctx = canvas.getContext('2d');
  let fontSize = 70;
  do {
    ctx.font = `${fontSize -=10}px Quicksand Medium`;
  }
  while (ctx.measureText(text).width > canvas.width - 300);
  return ctx.font;
};
////////////////////////////////////////////////////////////////////////////////
const { registerFont, createCanvas } = require('canvas')
registerFont('./Quicksand-VariableFont_wght.ttf', { family: 'Quicksand Medium' })
client.on('guildMemberAdd', async member => {
	const channel = member.guild.channels.cache.find(ch => ch.name === 'welcome');
	if (!channel) return;
  const canvas = Canvas.createCanvas(750, 869);                                //Crée le canvas, dimension ici 1016, 444
  const ctx = canvas.getContext('2d');                                          //context, modifie la plupart du canvas
  const background = await Canvas.loadImage('./welcomecanvase.jpg');

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);                 //étire l'image au canvas entier
  ctx.strokeStyle = '#ffffff';                                                 //couleur du contour
  ctx.lineWidth = '10';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = '47px Quicksand Medium';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Welcome to the server,', canvas.width / 3.1, canvas.height / 1.23);

  ctx.font = applyText(canvas, `${member.displayName} !`);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(member.displayName, canvas.width / 3.1, canvas.height / 1.12);

  ctx.beginPath();
  ctx.arc(125, 725, 100, 0, Math.PI * 2, true);                                 //fais le cercle
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format : 'png'}));
  ctx.drawImage(avatar, 25, 625, 210, 210);

  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
  channel.send(attachment);
  });
////////////////////////////////////////////////////////////////////////////////

const fs = require('fs');
const Discord = require('discord.js');
const Canvas = require('canvas');
const client = new Discord.Client({ disableMentions: 'everyone' });
const PREFIX = '!';
const { Player } = require('discord-player');
const events = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const player = fs.readdirSync('./player').filter(file => file.endsWith('.js'));
const avatarEmbed = require('discord.js-avatar');
const {query} = require('mathram');
var quest = "";

////////////////////////////////////////////////////////////////////////////////
let stats =
{
	serverID: '774916982385803274',
	total: "803728491798855722",
	member: "803978150710083614",
	bots: "803978329296338975"
}


client.on('guildMemberAdd', member =>
{
	if(member.guild.id !==stats.serverID) return;
	client.channels.cache.get(stats.total).setName(`Membres : ${member.guild.memberCount}`);
	//client.channels.cache.get(stats.member).setName(`Members : ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
	//client.channels.cache.get(stats.bots).setName(`Bots : ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
})

client.on('guildMemberRemove', member =>
{
	if(member.guild.id !==stats.serverID) return;
	client.channels.cache.get(stats.total).setName(`Membres : ${member.guild.memberCount}`);
	//client.channels.cache.get(stats.member).setName(`Members : ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
	//client.channels.cache.get(stats.bots).setName(`Bots : ${member.guild.members.cache.filter(m => !m.user.bot).size}`);
})

////////////////////////////////////////////////////////////////////////////////

const { Users, CurrencyShop } = require('./dbObjects');
const { Op } = require('sequelize');
const currency = new Discord.Collection();

Reflect.defineProperty(currency, 'add', {
	/* eslint-disable-next-line func-name-matching */
	value: async function add(id, amount) {
		const user = currency.get(id);
		if (user) {
			user.balance += Number(amount);
			return user.save();
		}
		const newUser = await Users.create({ user_id: id, balance: amount });
		currency.set(id, newUser);
		return newUser;
	},
});
//alpha
Reflect.defineProperty(currency, 'getBalance',
{
	value: function getBalance(id) {
		const user = currency.get(id);
		return user ? user.balance : 0;
	},
});

client.once('ready', async () =>
{
  const storedBalances = await Users.findAll();
  storedBalances.forEach(b => currency.set(b.user_id, b));
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', async message =>
{
	if (message.author.bot) return;
	currency.add(message.author.id, 1);
  if (!message.content.startsWith(PREFIX)) return;
	const input = message.content.slice(PREFIX.length).trim();
	if (!input.length) return;
	const [, command, commandArgs] = input.match(/(\w+)\s*([\s\S]*)/);

	if (command === 'compte')
  {
    const target = message.mentions.users.first() || message.author;
    return message.channel.send(`${target.tag} a ${currency.getBalance(target.id)}💰`);
  }

  else if (command === 'inventaire')
  {
    const target = message.mentions.users.first() || message.author;
    const user = await Users.findOne({ where: { user_id: target.id } });
    const items = await user.getItems();
    if (!items.length) return message.channel.send(`${target.tag} n'a rien!`);
    return message.channel.send(`${target.tag} a actuellement ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
  }

  else if (command === 'transfer')
  {
    const currentAmount = currency.getBalance(message.author.id);
    const transferAmount = commandArgs.split(/ +/g).find(arg => !/<@!?\d+>/g.test(arg));
    const transferTarget = message.mentions.users.first();
    if (!transferAmount || isNaN(transferAmount)) return message.channel.send(`Désolé ${message.author}, ce n'est pas un montant valide.`);
    if (transferAmount > currentAmount) return message.channel.send(`Désolé ${message.author} mais, tu n'as que ${currentAmount}.`);
    if (transferAmount <= 0) return message.channel.send(`Tu ne peux pas transférer 0, ${message.author}.`);
    currency.add(message.author.id, -transferAmount);
    currency.add(transferTarget.id, transferAmount);
    return message.channel.send(`${transferAmount}💰 ont été transférés à ${transferTarget.tag}. Il te reste ${currency.getBalance(message.author.id)}💰`);
  }

  else if (command === 'acheter')
  {
    const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: commandArgs } } });
    if (!item) return message.channel.send(`Cet objet n'existe pas.`);
    if (item.cost > currency.getBalance(message.author.id))
    {
	  return message.channel.send(`Tu as actuellement ${currency.getBalance(message.author.id)}, mais ${item.name} coûte ${item.cost}!`);
    }
    const user = await Users.findOne({ where: { user_id: message.author.id } });
    currency.add(message.author.id, -item.cost);
    await user.addItem(item);
    message.channel.send(`Tu as acheté : ${item.name}.`);
  }

  else if (command === 'boutique')
  {
    const items = await CurrencyShop.findAll();
    return message.channel.send(items.map(item => `${item.name}: ${item.cost}💰, ${item.stats}`).join('\n'), { code: true });
  }
  else if (command === 'classement')
  {
    return message.channel.send(
	  currency.sort((a, b) => b.balance - a.balance)
		.filter(user => client.users.cache.has(user.user_id))
		.first(10)
		.map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance}💰`)
		.join('\n'),
	{ code: true }
    );
  }
});



////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////Canvas test

var facts =
    [
        "Hé bien, je pense que oui",
        "Je ne suis pas sûre du tout...",
        "C'est sûr à 100%",
        "Catégoriquement non",
        "C'est impossible",
        "O U I",
        "C'est certain",
        "Les dieux en ont décidé ainsi",
        "Sans aucun doute",
        "Oui, c'est sûr",
        "C'est possible, en effet",
        "Hmmm oui je vois, je pense que oui",
        "Ça m'a l'air d'être ça",
        "Oui",
        "Redemande-moi plus tard, ça ne s'annonce pas bon pour toi",
        "Il vaut mieux pas pour toi que je te dise tout de suite",
        "Je ne peux pas en être sûr à 100%",
        "N'y compte pas",
        "Ma reponse est non",
        "Mes sources disent que non",
        "J'en doute énormément",
      ];
var fact = Math.floor(Math.random() * facts.length);
//////////////////////////////////////////////////////////////////////////////// All constants declared on top
client.player = new Player(client);
client.config = require('./config/bot');
client.emotes = client.config.emojis;
client.filters = client.config.filters;
client.commands = new Discord.Collection();
////////////////////////////////////////////////////////////////////////////////KissCommand rand function
function doKissAction()
{
    var rand =
    [
        'https://tenor.com/view/anime-kiss-love-sweet-gif-5095865',
        'https://tenor.com/view/anww-hug-kiss-anime-cartoon-gif-4874618',
        'https://tenor.com/view/anime-kiss-gif-4829336',
        'https://tenor.com/view/kiss-anime-love-gif-4958649',
        'https://tenor.com/view/anime-ano-natsu-de-matteru-gif-9670722',
        'https://tenor.com/view/toloveru-unexpected-surprise-kiss-gif-5372258',
        'https://tenor.com/view/kiss-anime-love-couple-gif-14240425',
        'https://tenor.com/view/anime-kiss-romance-gif-5649376',
        'https://tenor.com/view/eden-of-the-east-anime-kiss-love-couple-gif-14958166',
        'https://tenor.com/view/koi-to-uso-anime-kiss-gif-13344412',
        'https://tenor.com/view/anime-kiss-tongue-drool-passionate-gif-13516822',
        'https://tenor.com/view/anime-kiss-goodnight-passionate-passion-gif-12887241',
        'https://tenor.com/view/rascal-does-not-dream-of-bunny-girl-senpai-mai-sakurajima-mai-anime-gif-15997716',
        'https://tenor.com/view/kiss-anime-love-you-couple-sweet-gif-15974229'
    ];
    return rand [Math.floor(Math.random() * rand.length)];
}

function doHugAction()
{
    var rand =
    [
        'https://tenor.com/view/anime-cheeks-hugs-gif-14106856',
        'https://tenor.com/view/sakura-quest-anime-animes-hug-hugging-gif-14721541',
        'https://tenor.com/view/hug-anime-gif-7552075',
        'https://tenor.com/view/anime-hug-sweet-love-gif-14246498',
        'https://tenor.com/view/hug-cuddle-comfort-love-friends-gif-5166500',
        'https://tenor.com/view/love-hug-anime-affection-gif-5634630',
        'https://tenor.com/view/%e0%b8%81%e0%b8%ad%e0%b8%94-gif-18374323',
        'https://tenor.com/view/tackle-hug-couple-anime-cute-couple-love-gif-17023255',
        'https://tenor.com/view/anime-choke-hug-too-tight-gif-14108949',
        'https://tenor.com/view/hugging-snuggle-nuzzle-anime-girl-anime-boy-gif-12010176',
        'https://tenor.com/view/hug-anime-gif-7552077',
        'https://tenor.com/view/excited-hug-gif-18169149',
        'https://tenor.com/view/abra%c3%a7o-hug-love-bff-gif-14903952',
        'https://tenor.com/view/hug-cuddle-anime-cute-anime-hug-gif-18960633',
        'https://tenor.com/view/anime-hug-anime-happy-anime-cute-hug-gif-19679142',
        'https://cdn.weeb.sh/images/HkfgF_QvW.gif',
    ];
    return rand [Math.floor(Math.random() * rand.length)];
}

function doSpankAction()
{
    var rand =
    [
        'https://tenor.com/view/bad-beat-spank-punishment-gif-13569259',
        'https://tenor.com/view/taritari-anime-spank-out-gif-13665166',
        'https://tenor.com/view/bad-spank-cry-anime-gif-15905904',
        'https://tenor.com/view/anime-spank-giyu-tomioka-shinobu-kocho-giyu-spank-tomioka-spank-gif-17299734',
        'https://tenor.com/view/onizuka-spank-spanking-angry-anime-gif-5458569',
        'https://tenor.com/view/anime-girl-spank-animegirl-spanking-gif-15964704',
        'https://tenor.com/view/gintama-anime-seesaw-spank-costume-gif-7885617',
        'https://tenor.com/view/anime-spanking-spank-naughty-girl-punishment-gif-18105116',
        'https://tenor.com/view/spank-spanked-spanking-otk-anime-gif-9610049',
        'https://tenor.com/view/anime-spanking-spank-schoolgirl-naughty-gif-16082139',
        'https://tenor.com/view/ifeel-your-resolve-spank-anime-punishment-asobi-asobase-gif-17314327',
        'https://tenor.com/view/spank-gif-15492225',
        'https://tenor.com/view/spank-whip-hurt-gif-15492223',
    ];
    return rand [Math.floor(Math.random() * rand.length)];
}

function doAdmireAction()
{
    var rand =
    [
        'https://tenor.com/view/mafuyu-satou-sato-given-anime-gif-14792743',
        'https://tenor.com/view/anime-amazed-eyes-sparkle-gif-11618062',
        'https://tenor.com/view/happy-anime-sparkle-gif-6014343',
        'https://tenor.com/view/anime-sparkle-happy-gif-6014345',
        'https://tenor.com/view/anime-sparkle-happy-gif-6014346',
        'https://tenor.com/view/hearts-maid-anime-sparkle-love-gif-15810159',
        'https://tenor.com/view/nose-bleed-anime-sparkle-gif-5469034',
        'https://tenor.com/view/anime-sparkle-happy-stare-blush-gif-12341412',
        'https://tenor.com/view/sparkle-anime-boy-surprised-amazed-gif-17652605',
        'https://tenor.com/view/anime-sparkle-happy-gif-6014346',
        'https://tenor.com/view/tohka-yatogami-date-alive-anime-sparkle-happy-gif-17497378',
        'https://tenor.com/view/nezuko-nezuko-kamado-kimetsu-no-yaiba-anime-sparkle-gif-15686132',
        'https://tenor.com/view/anime-sparkle-happy-excited-hyper-gif-12390201',
        'https://tenor.com/view/akame-anime-pretty-sparkle-gif-14953637',
        'https://tenor.com/view/anime-girl-kawaii-sparkle-happy-gif-14223414',
    ];
    return rand [Math.floor(Math.random() * rand.length)];
}

function doWinkAction()
{
    var rand =
    [
        'https://tenor.com/view/chika-fujiwara-kaguya-sama-love-is-war-anime-wink-smile-gif-18043249',
        'https://tenor.com/view/monster-musume-smith-san-anime-wink-glasses-gif-16282623',
        'https://tenor.com/view/anime-girl-wink-star-tease-gif-12188360',
        'https://tenor.com/view/mikoto-mikoshiba-wink-anime-gif-14683647',
        'https://tenor.com/view/smile-anime-wink-star-gif-15516760',
        'https://tenor.com/view/anime-girl-wink-flirty-hibike-euphonium-gif-5364920',
        'https://tenor.com/view/wink-misaki-shokuhou-anime-girl-winking-gif-16944825',
        'https://tenor.com/view/taiga-peace-wink-anime-gif-16357344',
        'https://tenor.com/view/anime-wink-sorry-gif-14132778',
        'https://tenor.com/view/wink-cute-kid-heart-anime-gif-12381398',
        'https://tenor.com/view/rin-tohsaka-anime-wink-gif-19713912',
        'https://tenor.com/view/kuriyama-beyond-the-boundary-wink-anime-weeb-gif-19889203',
        'https://tenor.com/view/anime-wink-victory-smile-gif-15018586',
        'https://tenor.com/view/anime-wink-cute-kawaii-gif-9032310',
        'https://tenor.com/view/anime-wink-flirt-flirty-gif-5213500',
        'https://tenor.com/view/anime-wink-marumaru-gif-12003936',
        'https://tenor.com/view/anime-wink-cute-kitty-ears-meme-gif-16978916',
        'https://tenor.com/view/fate-grand-order-da-vinci-caster-anime-wink-gif-17733854',
        'https://tenor.com/view/strawberry-panic-girl-anime-wink-cute-gif-16395437',
        'https://tenor.com/view/anime-smile-wink-gif-15157914',
        'https://tenor.com/view/akari-akaza-yuri-yuri-anime-wink-heart-gif-17516431',
      ];

    return rand [Math.floor(Math.random() * rand.length)];
}

function doBoobAction()
{
    var rand =
    [
        'https://tenor.com/view/boobs-anime-tits-shirt-off-unbutton-gif-15403637',
        'https://tenor.com/view/balloons-bouncy-boobies-boobs-anime-gif-14831350',
        'https://tenor.com/view/purple-jiggly-big-breast-boobs-gif-13759918',
        'https://tenor.com/view/bounce-boobs-anime-titties-titty-gif-15526960',
        'https://tenor.com/view/swinging-saggy-boobs-cleavage-old-woman-running-gif-15812771',
        'https://tenor.com/view/anime-boobs-hot-bounce-gif-14858500',
        'https://tenor.com/view/anime-bread-boobs-gif-4736054',
        'https://tenor.com/view/anime-boobs-thicc-swimsuit-milf-gif-14659275',
        'https://tenor.com/view/anime-girl-boobs-bouncing-gif-17030864',
        'https://tenor.com/view/boobs-anime-gif-18953661',
        'https://tenor.com/view/huge-boobs-anime-gif-9967327',
        'https://tenor.com/view/anime-excited-bounce-boobs-heart-gif-4968431',
        'https://tenor.com/view/anime-oppai-bounce-jiggle-boobs-gif-15939386',
      ];

    return rand [Math.floor(Math.random() * rand.length)];
}

function doThighsAction()
{
    var rand =
    [
        'https://tenor.com/view/anime-thighs-thigh-highs-getting-ready-sexy-gif-17290686',
        'https://tenor.com/view/squirm-thighs-blushing-touching-squirming-gif-15759446',
        'https://tenor.com/view/thighs-anime-girl-skirt-sexy-gif-9521582',
        'https://tenor.com/view/thigh-socks-tights-anime-hot-gif-15403625',
        'https://tenor.com/view/hyouka-kyo-ani-hot-spring-onsen-gif-5047017',
        'https://tenor.com/view/thigh-socks-anime-sexy-sock-gif-16660071',
        'https://tenor.com/view/nami-yo-kiitekure-thigh-crash-anime-wave-listen-to-me-gif-17900485',
        'https://tenor.com/view/anime-thigh-animethighs-aesthetic-gif-18636667',
        'https://tenor.com/view/anime-thighs-gif-19807306',
        'https://tenor.com/view/anime-thighs-gif-19807308',
        'https://tenor.com/view/thighs-thick-anime-thigh-gif-19183929',
        'https://tenor.com/view/zettai-ryouiki-anime-pooscetter-thigh-gif-9659677',
        'https://tenor.com/view/nisekoi-chitoge-thigh-anime-gif-13855632',
        'https://tenor.com/view/ruke-thick-ass-thighs-gif-19664224',
        'https://tenor.com/view/anime-gum-thighs-crowds-thicc-chick-gif-14065923',
        'https://tenor.com/view/anime-ecchi-gif-13465250',
        'https://data.whicdn.com/images/351127505/original.gif',
        'https://78.media.tumblr.com/dafdc155a614220661fe225ac88bda19/tumblr_oofsjs3DxC1tx45yjo1_500.gif',
        'https://i.imgur.com/6TGsags.gif',
        'https://data.whicdn.com/images/348459930/original.gif',
        'https://66.media.tumblr.com/b94d201bbbd3377a59646591603f352b/tumblr_plnpgvQlly1qbkiaho1_540.gif',
      ];

    return rand [Math.floor(Math.random() * rand.length)];
}

function doSlapAction()
{
    var rand =
    [
        'https://tenor.com/view/bunny-girl-slap-angry-girlfriend-anime-gif-15144612',
        'https://tenor.com/view/anime-manga-japanese-anime-japanese-manga-toradora-gif-5373994',
        'https://tenor.com/view/powerful-head-slap-anime-death-tragic-gif-14358509',
        'https://tenor.com/view/no-angry-anime-slap-gif-7355956',
        'https://tenor.com/view/chikku-neesan-girl-hit-wall-stfu-anime-girl-smack-gif-17078255',
        'https://tenor.com/view/girl-slap-anime-mad-student-gif-17423278',
        'https://tenor.com/view/oreimo-gif-10937039',
        'https://tenor.com/view/shikamaru-temari-naruto-gif-shippuden-gif-8576304',
        'https://tenor.com/view/chika-loveiswar-anime-slap-funny-gif-13595529',
        'https://tenor.com/view/anime-slap-hit-hurt-angry-gif-12396060',
        'https://tenor.com/view/mm-emu-emu-anime-slap-strong-gif-7958720',
        'https://tenor.com/view/anime-slap-slapping-smacking-heavens-lost-property-gif-5738394',
        'https://tenor.com/view/naruto-anime-slap-slapping-sakura-gif-17897216',
        'https://tenor.com/view/fate-grand-order-fate-fou-slap-anime-slap-gif-18461579',
        'https://tenor.com/view/slap-%e0%b8%99%e0%b8%8a-neon-genesis-evangelion-anime-rei-ayanami-gif-17303228',
        'https://tenor.com/view/anime-slap-gif-7602649',
        'https://tenor.com/view/ritsu-ristsu-tainaka-yui-yui-hirasawa-kon-gif-17759867',
        'https://tenor.com/view/my-collection-anime-slap-gif-16819981',
        'https://tenor.com/view/kename-funny-anime-slap-gif-5160096',
        'https://tenor.com/view/anime-kiss-slap-gif-14844123',
        'https://tenor.com/view/nami-sanji-slap-one-piece-anime-gif-19985101',

      ];

    return rand [Math.floor(Math.random() * rand.length)];
}
////////////////////////////////////////////////////////////////////////////////

fs.readdirSync('./commands').forEach(dirs =>
  {
    const commands = fs.readdirSync(`./commands/${dirs}`).filter(files => files.endsWith('.js'));
    for (const file of commands) {
        const command = require(`./commands/${dirs}/${file}`);
        console.log(`Loading command ${file}`);
        client.commands.set(command.name.toLowerCase(), command);
    };
});
////////////////////////////////////////////////////////////////////////////////Fonction du !dice
function getRandomInt(max)
{
  return Math.floor(Math.random() * Math.floor(max));
}
////////////////////////////////////////////////////////////////////////////////Embed example, this one is used for !bio
const valhallaBio = new Discord.MessageEmbed()
	.setColor('##ffc0c6')
	.setTitle('𝗟𝗲 𝗩𝗮𝗹𝗵𝗮𝗹𝗹𝗮')
	.setURL('https://discord.gg/7MWbJSAsu9')
	.setAuthor('', '', '')
	.setDescription('Bienvenue au Valhalla‍')
	.setThumbnail('https://image.noelshack.com/fichiers/2021/04/2/1611692097-image4-1-zeaze.jpg')
	.addFields(
		{ name: 'Créateurs', value: '╲⎝⧹𝑩𝒂𝒓𝒕𝒐𝒌⧸⎠╱, ╲⎝⧹𝑶𝒏𝒊𝑳𝒊𝒏𝒌⧸⎠╱' },
		{ name: 'Bots du serveur', value: "Dahlia (!), Hydra (<#780114117246582834>)", inline: true },
    //{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	//.addField('Inline field title', 'Some value here', true)
	.setImage('https://image.noelshack.com/fichiers/2021/04/2/1611691235-thumb-1920-495521-2.png')


const helpmusique = new Discord.MessageEmbed()
	.setColor('LUMINOUS_VIVID_PINK')
	.setTitle('Voici comment marchent les commandes pour la musique')
	.setThumbnail('https://image.noelshack.com/fichiers/2021/04/2/1611692097-image4-1-zeaze.jpg')
	.addFields(
		{ name: '!play', value: 'Ajoutez le nom ou le lien de la musique que vous voulez écouter'},
		{ name: '!pause', value: 'Pause la musique'},
		{ name: '!skip', value: 'Passe à la musique suivante'},
		{ name: '!volume', value: "Suivi d'un nombre compris entre 0 et 100, change le volume de la musique"},
		{ name: '!stop', value: 'Arrete la musique'}
	)


const helpfun = new Discord.MessageEmbed()
	.setColor('LUMINOUS_VIVID_PINK')
	.setTitle("Voici comment marchent les commandes d'action")
	.setThumbnail('https://image.noelshack.com/fichiers/2021/04/2/1611692097-image4-1-zeaze.jpg')
	.addFields(
		{ name: '!kiss', value: 'Embrasse la personne que tu désignes'},
		{ name: '!hug', value: 'Fais un calin à la personne que tu désignes'},
		{ name: '!spank', value: 'Met une fessée'},
		{ name: '!admire', value: "Admire la personne que tu désignes"},
		{ name: '!wink', value: "Fais un clin d'œil"},
		{ name: '!oppai', value: 'Montre les seins de la personne que tu désignes'},
		{ name: '!thighs', value: 'Montre les cuisses de la personne que tu désignes'},
		{ name: '!slap', value: 'Met une claque'},
	)


const helpgen = new Discord.MessageEmbed()
	.setColor('LUMINOUS_VIVID_PINK')
	.setTitle("Voici comment marchent les commandes générales")
	.setThumbnail('https://image.noelshack.com/fichiers/2021/04/2/1611692097-image4-1-zeaze.jpg')
	.addFields(
		{ name: '!clear', value: 'Supprime un certain nombre de message, exemple !clear 5'},
		{ name: '!dé', value: 'Lance un dé à 6 faces'},
		{ name: '!bio', value: 'Montre les informations du serveur'},
		{ name: '!avatar', value: "Envoie la photo de profil de l'utilisateur"},
		{ name: '!question', value: "Pose-moi une question"}
	)

////////////////////////////////////////////////////////////////////////////////
for (const file of events)
{
    console.log(`Loading discord.js event ${file}`);
    const event = require(`./events/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
};
////////////////////////////////////////////////////////////////////////////////
for (const file of player)
{
    console.log(`Loading discord-player event ${file}`);
    const event = require(`./player/${file}`);
    client.player.on(file.split(".")[0], event.bind(null, client));
};
////////////////////////////////////////////////////////////////////////////////
client.on('guildMemberAdd', member =>
{
  const channel = member.guild.channels.cache.find(ch => ch.name === '👋-hall');
  const rules = member.guild.channels.cache.find(ch => ch.name === '📜-règlement');
  const colors = member.guild.channels.cache.find(ch => ch.name === 'colors');
  if (!channel) return;
  channel.send(`Bienvenue au Valhalla ${member} . J'ai entendu dire que tu étais un valeureux guerrier, rend toi dans le salon ${rules} pour prendre connaissance des règles à respecter ici.`)
});

const applyText = (canvas, text) =>
{
  const ctx = canvas.getContext('2d');
  let fontSize = 125;
  do
  {
    ctx.font = `${fontSize -=10}px Quicksand Medium`;
  }
  while (ctx.measureText(text).width > canvas.width - 300);
  return ctx.font;
};

const { registerFont, createCanvas } = require('canvas')
registerFont('./WelcomeCanvas/Quicksand-SemiBold.ttf', { family: 'Quicksand Medium' })

client.on('guildMemberAdd', async member =>
{
	const channel = member.guild.channels.cache.find(ch => ch.name === '👋-hall');
	if (!channel) return;
  const canvas = Canvas.createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');
  const background = await Canvas.loadImage('./WelcomeCanvas/welcome.jpg');

  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = '15';
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.font = '115px Quicksand Medium';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Bienvenue au Valhalla,', canvas.width / 4.2, canvas.height / 1.27);

  ctx.font = applyText(canvas, `${member.displayName} !`);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(member.displayName, canvas.width / 4.2, canvas.height / 1.12);

  ctx.beginPath();
  ctx.arc(230, 850, 200, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format : 'png'}));
  ctx.drawImage(avatar, 30, 650, 400, 400);

  const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
  channel.send(attachment);
});                                  //Fonction du canvas, si membre ajouté
////////////////////////////////////////////////////////////////////////////////
client.on('message', message =>
{
  let args=message.content.substring(PREFIX.length).split(" ");
  switch (args[0])
  {
    case 'clear':
        if(!args[1])
        {
          message.reply("combien de messages faut-il que je supprime ?");
          break;
        }
        if(isNaN(args[1]))
        {
          message.reply("ce n'est pas un nombre donc je ne sais pas combien de messages je dois supprimer");
          break;
        }
        if(args[1] >= 51)
        {
          message.reply("je ne peux pas supprimer autant de messages, ça serait trop dangereux");
          break;
        }
        if(args[1] < 1)
        {
          message.reply("je ne peux pas supprimer 0 messages");
          break;
        }
        if(args[0])
        {
          message.channel.bulkDelete(args[1]);
          break;
        }

    case 'PamiDose':
      message.channel.send("https://tenor.com/view/sexy-18-pamibabyy-girl-tik-tok-gif-18555399");
      message.channel.send("https://i.pinimg.com/originals/f6/4b/db/f64bdb1ffe75955fe54315633cfb81d5.jpg");
      message.channel.send("https://tenor.com/view/pamibabyy-gif-19229007");
      message.channel.send("https://tenor.com/view/w3nz-pamibaby-gif-18793751");
      message.channel.send("https://i.redd.it/ybks1nw5ehq51.jpg");
      message.channel.send("https://tenor.com/view/pamibaby-pami-gif-18015951");
      message.channel.send("https://pbs.twimg.com/media/Ef_--8VXsAEoeBe.jpg:large");
      message.channel.send("https://tenor.com/view/pamibaby-gif-18016026");
      message.channel.send("https://p16-va-tiktok.ibyteimg.com/img/musically-maliva-obj/8d1e17a61ea9a839d8d316bb9c31dab4~c5_720x720.jpeg");
      message.channel.send("https://i.pinimg.com/originals/0e/65/38/0e6538ff15ab9dbf5fcc03b0b1c22cfa.jpg");
      message.channel.send("https://tenor.com/view/pamibabyy-girl-hot-tiktok-bang-gif-18625109");
      message.channel.send("https://i.redd.it/cadifzgji0m51.jpg");
      message.channel.send("https://tenor.com/view/sex-sexy-girl-boobs-tits-gif-18568813");
      message.channel.send("https://i.ytimg.com/vi/X-WHYO6h3dw/hqdefault.jpg");
      message.channel.send("https://i.pinimg.com/originals/5a/96/5c/5a965c3a3e7849a010dbe7962917e9d9.jpg");
      message.channel.send("https://media.tenor.com/images/18b98d49cee0c741df9db730ac091d02/tenor.gif");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610544483-129720909-376083670316709-8591234984718387137-n.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610544514-eia-iywxkai0boh.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610544733-c59fafb76b8a7be059974939e92a1721.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610545207-unknown.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610545241-unknown-1.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610545579-unknown-2.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610545679-9879d17a817974e2db8ed9fcad7fa0b4-c5-720x720.jpeg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610545811-3fdd42691a9a4ebebf0bfb71b2b21c85-1592618946.png");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610545975-telechargement.jpeg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610546134-k39e8xz93j961.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610546357-oam2quokvc861.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610546435-132644729-2856921017917247-8652718729112077575-n.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610546480-130885300-4071310299563120-79737639757662954-n.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610546518-pamibabiii-20201207-2.jpeg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610546802-sffxbq6jts761.jpg");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/3/1610546947-aepzf7r3jhv51.jpg");
      message.guild.member(client.user).setNickname('Dahlia');
      break;

    case 'specialGift':
      message.reply("Check dms baby I sent you a pic just for you 👅💋");
      message.author.send("https://tenor.com/bkKml.gif");
      message.guild.member(client.user).setNickname('Dahlia');
      break;

    case 'love':
      message.reply("Sorry babe I'm already taken ...");
      message.channel.send("https://image.noelshack.com/fichiers/2021/02/1/1610393795-pamicouple.png");
      message.guild.member(client.user).setNickname('Dahlia');
      break;

    case 'dé':
      message.channel.send("Je lance un dé à 6 faces ...");
      message.channel.send(":game_die:");
      message.channel.send("Le resultat est ") && message.channel.send(getRandomInt(6)+1);
      message.guild.member(client.user).setNickname('Dahlia');
      break;

    case 'bio':
      message.channel.send(valhallaBio);
      message.guild.member(client.user).setNickname('Dahlia');
      break;

    case 'avatar':
      avatarEmbed(message, language = 'english');
      message.guild.member(client.user).setNickname('Dahlia');
      client.user.setUsername("Dahlia");
      break;

    case 'join':
      client.emit('guildMemberAdd', message.member);
      message.guild.member(client.user).setNickname('Dahlia');
      break;

    case 'test':
      if (message.author.id !== '227444282989084672')
      {
        return message.channel.send("This command can only be done by the owner of this bot!")
      }
      break;

    case 'question':
      if(!args[1])
      {
        message.reply("quelle est ta question ?");
        break;
      }
      message.channel.send(":crystal_ball: Je regarde dans ma boule de cristal ...") && message.channel.send(facts[fact]);
      message.guild.member(client.user).setNickname('Dahlia');
      break;

		case 'help':
			if(!args[1])
			{
				message.reply("de quel type d'aide as-tu besoin ? général, musique, action")
			}
			if(args[1]=== 'musique')
			{
				message.channel.send(helpmusique);
			}
			if(args[1]=== 'action')
			{
				message.channel.send(helpfun);
			}
			if(args[1]=== 'général')
			{
				message.channel.send(helpgen);
			}
			break;

////////////////////////////////////////////////////////////////////////////////Kiss command
    case 'kiss':
    const kisser = message.author.username
    const user1 = message.mentions.users.first();
    if(user1 === undefined)
    {
      message.channel.send("Qui veux-tu embrasser ?");
      break;
    }
    if(user1.id === '690182114158575649')
    {
      message.channel.bulkDelete(1);
      return;
    }
    const kissed = message.mentions.users.first().username
    if(kisser === kissed)
    {
      message.channel.send("Comment veux-tu t'embrasser toi-même ?");
      break;
    }
    if(args[0])
    {
      message.channel.send(doKissAction());
      message.channel.send(`**${kisser}** a embrassé **${kissed}** :kissing_heart:`);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }

    case 'hug':
    const hugger = message.author.username
    const user2 = message.mentions.users.first();
    if(user2 === undefined)
    {
      message.channel.send("À qui veux-tu faire un calin ?");
      break;
    }
    const hugged = message.mentions.users.first().username
    if(hugger === hugged)
    {
      message.channel.send("Comment veux-tu te faire un calin à toi-même ?");
      break;
    }
    if(args[0])
    {
      message.channel.send(doHugAction());
      message.channel.send(`**${hugger}** fait un calin à **${hugged}** :hugging:`);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }

    case 'spank':
    const spanker = message.author.username
    const user3 = message.mentions.users.first();
    if(user3 === undefined)
    {
      message.channel.send("À qui veux-tu mettre une fessée ?");
      break;
    }
    const spanked = message.mentions.users.first().username
    if(spanker === spanked)
    {
      message.channel.send("Pourquoi tu veux te mettre une fessée ??");
      break;
    }
    if(args[0])
    {
      message.channel.send(doSpankAction());
      message.channel.send(`**${spanker}** met une fessée à **${spanked}** :smirk:`);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }

    case 'admire':
    const admirer = message.author.username
    const user4 = message.mentions.users.first();
    if(user4 === undefined)
    {
      message.channel.send("Qui veux-tu admirer ?");
      break;
    }
    const admired = message.mentions.users.first().username
    if(args[0])
    {
      message.channel.send(doAdmireAction());
      message.channel.send(`**${admirer}** admire **${admired}** :star_struck:`);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }

    case 'wink':
    const winker = message.author.username
    const user5 = message.mentions.users.first();
    if(user5 === undefined)
    {
      message.channel.send("À qui veux-tu faire un clin-d'œil ?");
      break;
    }
    const winked = message.mentions.users.first().username
    if(args[0])
    {
      message.channel.send(doWinkAction());
      message.channel.send(`**${winker}** fait un clin d'œil à  **${winked}** :wink:`);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }

    case 'oppai':
    const oppaier = message.author.username
    const user6 = message.mentions.users.first();
    if(user6 === undefined)
    {
      message.channel.send("De qui veux-tu voir les seins?");
      break;
    }
    if(user6.id === '690182114158575649')
    {
      message.channel.bulkDelete(1);
      return;
    }
    const oppaied = message.mentions.users.first().username
    if(args[0])
    {
      message.channel.send(doBoobAction());
      message.channel.send(`**${oppaier}** :  voici les seins de **${oppaied}** :smirk: `);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }

    case 'thighs':
    const thigher = message.author.username
    const user7 = message.mentions.users.first();
    if(user7 === undefined)
    {
      message.channel.send("De qui veux-tu voir les cuisses ?");
      break;
    }
    if(user7.id === '690182114158575649')
    {
      message.channel.bulkDelete(1);
      return;
    }
    const thighed = message.mentions.users.first().username
    if(args[0])
    {
      message.channel.send(doThighsAction());
      message.channel.send(`**${thigher}** : voici les cuisses de **${thighed}** \<:LewdMegumin:774930516628996106> `);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }

    case 'slap':
    const slapper = message.author.username
    const user8 = message.mentions.users.first();
    if(user8 === undefined)
    {
      message.channel.send("À qui veux-tu mettre une baffe ?");
      break;
    }
    const slapped = message.mentions.users.first().username
    if(args[0])
    {
      message.channel.send(doSlapAction());
      message.channel.send(`**${slapper}** baffe **${slapped}**`);
      message.guild.member(client.user).setNickname('Dahlia');
      break;
    }
////////////////////////////////////////////////////////////////////////////////




  }
})
////////////////////////////////////////////////////////////////////////////////Simple commands that doesn't require outer scripts
client.login(client.config.discord.token);

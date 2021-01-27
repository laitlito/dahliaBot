const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const CurrencyShop = require('./models/CurrencyShop')(sequelize, Sequelize.DataTypes);
require('./models/Users')(sequelize, Sequelize.DataTypes);
require('./models/UserItems')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const shop = [
		CurrencyShop.upsert({ name: 'Casque leger', cost: 20, stats: '+15 armure'}),
		CurrencyShop.upsert({ name: 'Épaulières en fer', cost: 40, stats: '+15 armure'}),
		CurrencyShop.upsert({ name: 'Cotte de maille', cost: 50, stats: '+30 armure'}),
		CurrencyShop.upsert({ name: 'Jambières lourdes', cost: 45, stats: '+25 armure'}),
		CurrencyShop.upsert({ name: 'Bottes du Berserker', cost: 15, stats: '+10 armure'}),
		CurrencyShop.upsert({ name: 'Gants en peau', cost: 10, stats: '+5 armure'}),
		CurrencyShop.upsert({ name: 'Casque de Viking lourd', cost: 400, stats: '+120 armure'}),
		CurrencyShop.upsert({ name: 'Épaulières de Jarl', cost: 450, stats: '+150 armure'}),
		CurrencyShop.upsert({ name: 'Plastron de Thor', cost: 600, stats: '+230 armure'}),
		CurrencyShop.upsert({ name: 'Jambières de Odin', cost: 500, stats: '+200 armure'}),
		CurrencyShop.upsert({ name: 'Bottes des Valkyries', cost: 300, stats: '+100 armure'}),
    CurrencyShop.upsert({ name: 'Épée en fer', cost: 50, stats: '+15 attaque'}),
    CurrencyShop.upsert({ name: 'Hache de guerre', cost: 60, stats: '+20 attaque'}),
    CurrencyShop.upsert({ name: 'Arc long', cost: 55, stats: 'Les dégats dépendent des flêches'}),
    CurrencyShop.upsert({ name: 'Flêches en os', cost: 10, stats: '+5 dégats'}),
    CurrencyShop.upsert({ name: 'Flêches en pierre', cost: 15, stats: '+10 dégats'}),
    CurrencyShop.upsert({ name: 'Flêches en fer', cost: 25, stats: '+20 dégats'}),
    CurrencyShop.upsert({ name: 'Catalyseur antique', cost: 65, stats: '+50 attaque'}),
    CurrencyShop.upsert({ name: 'Dague', cost: 35, stats: '+10 attaque'}),
		CurrencyShop.upsert({ name: 'Gungnir', cost: 10000, stats: '+1000 attaque'}),
		CurrencyShop.upsert({ name: 'Mjöllnir', cost: 30000, stats: '+3000 attaque'}),
		CurrencyShop.upsert({ name: 'Lance de Longinus', cost: 1000, stats: '+500 attaque, +1000 dépression'}),
		CurrencyShop.upsert({ name: 'Svalinn', cost: 800, stats: '+300 armure'})




	];
	await Promise.all(shop);
	console.log('Database synced');
	sequelize.close();
}).catch(console.error);

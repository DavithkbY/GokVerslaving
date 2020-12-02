module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		balance: {
			type: DataTypes.INTEGER,
			defaultValue: 1000,
			allowNull: false,
		},
		daily: {
			type: DataTypes.STRING,
			defaultValue: '2020-11-30T22:00',
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};
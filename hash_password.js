const bcrypt = require('bcryptjs');

const password = 'teacher777'; // Замените на нужный пароль
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashed password:', hash);
});

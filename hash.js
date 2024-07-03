const bcrypt = require('bcrypt');
bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash("zetatech@123", salt, function(err, hash) {
        console.log(hash)
    });
});
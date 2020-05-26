const db = require('../dbconnect');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRcode = require('qrcode');
const bcrypt = require('bcrypt');
const jwtsecret = 'hello'

const login = async(data) => {
    try{
        let emailCheck = await db.query(`
            SELECT * FROM users WHERE email = $1
        `, [data.email]);

        if(emailCheck.length > 0){
            let pwdCheck = await bcrypt.compare(data.password, emailCheck[0].password);
            if(pwdCheck){
                let secret = await speakeasy.generateSecret({
                    name:"Login"
                  });
        
                await db.query('UPDATE users SET secret = $1 WHERE id = $2',[secret.base32, emailCheck[0].id]);

                let qr = await QRcode.toDataURL(secret.otpauth_url);
                let jwttoken = jwt.sign({ id:emailCheck[0].id, email:data.email }, jwtsecret, {expiresIn:'1h'});

                return {
                    qr:qr,
                    jwt:jwttoken
                }

            }else{
                return 'Wrong password';
            }
        }else{
            return 'Wrong Email';
        }
    }catch(err){
        return err.message;
    }
};

const verify = async(data) => {
    try{
        let varified = jwt.verify(data.jwt, jwtsecret);
        
        try{
            let query = await db.query('SELECT secret FROM users WHERE email = $1', [varified.email]);
            let secretkey = query[0].secret;

            let validated = speakeasy.totp.verify({
                secret:secretkey,
                encoding:'base32',
                token:data.token,
                window: 0
            });

            if(validated){
                return 'Validated';
            }else{
                return 'Invalidated';
            }
        }catch(err){
            return err.message;
        }
    }catch(err){
        return 'Wrong jwt';
    }
}

module.exports = {
    login:login,
    verify:verify
}
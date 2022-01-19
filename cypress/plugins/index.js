const Login = require('./oidc');

module.exports = (on, config) => {
  on('task', {
    LoginPuppeteer: Login,
  });
};

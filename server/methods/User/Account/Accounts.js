Accounts.emailTemplates.siteName = 'Cryptostamped.com';
Accounts.emailTemplates.from = 'Cryptostamped <office@cryptostamped.com>';


Accounts.emailTemplates.verifyEmail = {
  subject() {
    return 'Подтвердите ваш email';
  },
  text(user, url) {
    return `Доброго времени суток, ${user}. Подтвердите ваш email по ссылке ${url}`;
  },
};

Accounts.urls.verifyEmail = (token) => {
  return Meteor.absoluteUrl(`verify-myemail/${token}`);
};
Accounts.urls.resetPassword = (token) => {
  return Meteor.absoluteUrl(`resetpassword/${token}`);
};

Accounts.emailTemplates.resetPassword = {
  subject(user) {
    return 'Восстановление пароля';
  },
  text(user, url) {
    return `Доброго времени суток, ${user}. Восстановите ваш пароль по ссылке ${url}`;
  },
};
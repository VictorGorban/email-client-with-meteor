Accounts.onLogin((data) => {
  // console.log(data);
    Timeline.insert({user: data.user._id, action: 'Вход', _createdAt: new Date(), company: data.user.company})
});



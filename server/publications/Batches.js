publishComposite('action.one', function (id) {
  return {
    find() {
      return Actions.find({_id: id});
    },
    children: [
      {
        find(x) {
          if (x.condition == 'видео') {
            return Media.find({_id: x.item}).cursor;
          }
        },
      },
      {
        find(x) {
          if (x.condition == 'товар') {
            return Products.find({_id: x.item});
          }
        },

      },
      // {
      //   find(x) {
      //     return Documents.find({_id: x.mhistoryfile}).cursor;
      //   },
      //
      // },
    ],
  }
})
;

publishComposite('company.actionsList', function (companyId) {
  return {
    find() {
      // console.log(Actions.find({company: companyId}).fetch());
      return Actions.find({company: companyId});
    },
    children: [
      {
        find(action) { // search item
          // console.log('action.item: '+action.item);
          if (!action.item) {
            return undefined;
          }
          switch (action.condition) {
            case 'товар':
              return Products.find(action.item);
            case 'опрос':
              return Surveys.find(action.item);
            case 'видео':
              return Media.find(action.item).cursor;
            case 'новостной пост':
              return Contents.find(action.item);
            default:
              return undefined // null вызывает ошибку в либе, а undefined должен не позволять записи добавляться
          }
        },
      },
    ],
  }
});
const { forwardTo } = require('prisma-binding');
const { hasPermission } = require('../utils');

const Query = {
  items: forwardTo('db'),
  item: forwardTo('db'),
  itemsConnection: forwardTo('db'),
  me(parent, args, ctx, info) {
    // Check if there is a current userid
    if (!ctx.request.userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: ctx.request.userId }
      },
      info
    );
  },
  async users(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new Error('You must be logged in');
    }

    hasPermission(ctx.request.user, ['ADMIN', 'PERMISSIONUPDATE']);

    return ctx.db.query.users({}, info);
  },
  async order(parent, args, ctx, info) {
    if (!ctx.request.userId) {
      throw new error('Ur not logged');
    }
    const order = await ctx.db.query.order(
      {
        where: { id: args.id }
      },
      info
    );
    const ownsOrder = order.user.id === ctx.request.userId;
    const hasPermissionToSeeOrder = ctx.request.user.permissions.includes(
      'ADMIN'
    );
    if (!ownsOrder || !hasPermissionToSeeOrder) {
      throw new Error('You Cant see this bud');
    }
    return order;
  },
  async orders(parent, args, ctx, info) {
    const { userId } = ctx.request;
    if(!userId) {
      throw new Error('You must be logged in')
    }
    return ctx.db.query.orders({
      where: {
        user: { id: userId}
      }
    }, info)
  }
};

module.exports = Query;

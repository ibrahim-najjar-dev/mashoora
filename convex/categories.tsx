import { query } from "./_generated/server";

export const getCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();

    return categories;
  },
});

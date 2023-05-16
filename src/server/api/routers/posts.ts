import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { Post } from "@prisma/client";
import { prisma } from "~/server/db";

const addUserDataToPost = async (posts: Post[]) => {
  const users = await prisma.user.findMany({
    take: 100,
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });
    return { post: post, author: author };
  });
};

export const postRouter = createTRPCRouter({
  createNewPost: publicProcedure
    .input(z.object({ content: z.string().min(10) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });

      const post = await ctx.prisma.post.create({
        data: {
          authorId: ctx.session.user.id,
          content: input.content,
        },
      });
      return post;
    }),
  getAllPosts: publicProcedure.query(async ({ ctx }) => {
    const posts = ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
    });

    return await addUserDataToPost(await posts);
  }),
});

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
    .input(z.object({ content: z.string().min(10).max(254) }))
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
  removePost: publicProcedure
    .input(z.object({ id: z.string().min(24).max(26) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.post.delete({
        where: { id: input.id },
      });
    }),
  updatePost: publicProcedure
    .input(
      z.object({
        postId: z.string().min(24).max(26),
        content: z.string().min(10).max(254),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatePost = await ctx.prisma.post.update({
        where: { id: input.postId },
        data: {
          content: input.content,
          isEdited: true,
        },
      });
      return updatePost;
    }),
});

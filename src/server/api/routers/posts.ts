import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { Post } from "@prisma/client";
import { prisma } from "~/server/db";

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

    return posts;
  }),
});

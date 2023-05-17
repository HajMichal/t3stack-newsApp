import React, { useState } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { RouterOutputs, api } from "~/utils/api";
import { VscEdit, VscTrash } from "react-icons/vsc";
import { useSession } from "next-auth/react";

dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["post"]["getAllPosts"][number];

export const PostView = ({ author, post }: PostWithUser) => {
  const { data } = useSession();
  const ctx = api.useContext();

  const [editPost, setEditPost] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState(post.content);

  const { mutate: remover } = api.post.removePost.useMutation({
    onSuccess() {
      console.log("Toast here ");
      void ctx.post.getAllPosts.invalidate();
    },
  });
  const { mutate: editor } = api.post.updatePost.useMutation({
    onSuccess() {
      console.log("Toast here ");
      void ctx.post.getAllPosts.invalidate();
      setEditPost(false);
    },
  });

  return (
    <div key={post.id} className="flex w-full justify-center">
      <div className="h-auto w-full rounded-l-md bg-white p-3">
        {editPost ? (
          <div className="max-w-xs pl-2">
            <div className="flex items-center gap-2 pb-2">
              <h3 className="text-md max-w-[190px] overflow-hidden font-semibold text-slate-600">
                @{author.name}
              </h3>
              <label className="text-xs text-slate-400">
                {dayjs(post.createdAt).fromNow()}
                {post.isEdited && "· edited"}
              </label>
            </div>
            <textarea
              defaultValue={post.content}
              onChange={(e) => setTextAreaValue(e.target.value)}
              rows={5}
              className="scrollbar h-auto w-full resize-none overflow-auto border border-zinc-500 bg-slate-200 p-1 pl-2"
            />
            <div className="flex w-full justify-end">
              <button
                type="submit"
                onClick={() =>
                  editor({ postId: post.id, content: textAreaValue })
                }
                className=" rounded-md bg-gradient-to-r from-[#6700f7] to-[#9248f3] p-1 px-6 font-semibold text-white duration-200 active:scale-110"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-xs pl-2">
            <div className="flex items-center gap-2 pb-2">
              <h3 className="text-md max-w-[190px] overflow-hidden font-semibold text-slate-600">
                @{author.name}
              </h3>
              <label className="text-xs text-slate-400">
                · {dayjs(post.createdAt).fromNow()}
                {post.isEdited && " · edited"}
              </label>
            </div>
            <p>{post.content}</p>
          </div>
        )}
      </div>
      <div className="flex w-10 flex-col items-end justify-start gap-3 rounded-r-md bg-white">
        {data?.user.id === post.authorId && (
          <>
            <button
              onClick={() => setEditPost(!editPost)}
              className="flex h-6 w-6 items-center justify-center rounded-l-full rounded-r-md bg-gradient-to-br from-[#0055f3] to-[#00c0fa] pl-1 duration-200 ease-in-out hover:w-10"
            >
              <VscEdit />
            </button>
            <button
              onClick={() => remover({ id: post.id })}
              className="flex h-6 w-6 items-center justify-center rounded-l-full rounded-r-md bg-gradient-to-br from-[#ff042d] to-[#ff4b63] pl-1 duration-200 ease-in-out hover:w-10"
            >
              <VscTrash />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

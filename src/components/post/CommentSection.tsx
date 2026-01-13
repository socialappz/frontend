import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { axiosPublic } from "../../utils/axiosConfig";
import type { IComment } from "../../interfaces/post/IPost";
import moment from "moment";
import { useContext } from "react";
import { mainContext } from "../../context/MainProvider";

moment.locale("en");

interface CommentSectionProps {
  postId: string;
  comments: IComment[];
  onCommentAdded: () => void;
}

export default function CommentSection({
  postId,
  comments,
  onCommentAdded,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useContext(mainContext);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    try {
      setIsSubmitting(true);
      await axiosPublic.post(
        `/api/posts/${postId}/comment`,
        { text: commentText.trim() },
        { withCredentials: true }
      );
      setCommentText("");
      onCommentAdded();
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id || Math.random()} className="flex gap-3">
              <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-black">
                    {comment.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {moment(comment.createdAt).fromNow()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!commentText.trim() || isSubmitting}
            className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      )}
    </div>
  );
}

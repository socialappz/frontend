import { useState } from "react";
import { Heart, MessageCircle, Trash2 } from "lucide-react";
import { axiosPublic } from "../../utils/axiosConfig";
import type { IPost } from "../../interfaces/post/IPost";
import moment from "moment";
import CommentSection from "./CommentSection";
import DeletePostModal from "./DeletePostModal";
import { Link } from "react-router-dom";

moment.locale("en");

interface PostCardProps {
  post: IPost;
  currentUser: string;
  onUpdate: () => void;
}

export default function PostCard({
  post,
  currentUser,
  onUpdate,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.likes.includes(currentUser));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const authorInfo = typeof post.authorId === "object" ? post.authorId : null;
  const authorName = authorInfo?.username || post.author;
  const authorImage = authorInfo?.userImage || "/default-avatar.png";
  const authorId =
    typeof post.authorId === "object"
      ? (post.authorId as any)?._id || post.authorId
      : post.authorId;

  const handleLike = async () => {
    try {
      const resp = await axiosPublic.post(
        `/api/posts/${post._id}/like`,
        {},
        { withCredentials: true }
      );
      setIsLiked(resp.data.isLiked);
      setLikeCount((prev) => (resp.data.isLiked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await axiosPublic.delete(`/api/posts/${post._id}`, {
        withCredentials: true,
      });
      setShowDeleteModal(false);
      onUpdate();
    } catch (err) {
      console.error("Error deleting post:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b">
        <Link
          to={`/matche/${authorId}`}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <div className="flex items-center gap-3">
            <img
              src={authorImage}
              alt={authorName}
              className="w-10 h-10 rounded-full object-cover border border-black"
            />
            <div>
              <p className="font-semibold text-black">{authorName}</p>
              <p className="text-sm text-gray-500">
                {moment(post.createdAt).fromNow()}
                {!post.isPublic && (
                  <span className="ml-2 text-xs bg-gray-200 px-2 py-0.5 rounded">
                    Private
                  </span>
                )}
              </p>
            </div>
          </div>
        </Link>
        {post.author === currentUser && (
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
            className="p-2 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="w-full bg-gray-100">
          <img
            src={post.image}
            alt="Post"
            className="w-full max-h-96 object-contain"
          />
        </div>
      )}

      {/* Text */}
      {post.text && (
        <div className="px-6 py-4">
          <p className="text-black whitespace-pre-wrap">{post.text}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 border-t">
        <div className="flex items-center gap-6 mb-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <Heart
              className={`w-6 h-6 ${
                isLiked ? "fill-red-500 text-red-500" : "text-white"
              }`}
            />
            <span className="text-white font-medium">{likeCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <MessageCircle className="w-6 h-6 text-white" />
            <span className="text-white font-medium">
              {post.comments.length}
            </span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <CommentSection
            postId={post._id}
            comments={post.comments}
            onCommentAdded={onUpdate}
          />
        )}
      </div>

      {showDeleteModal && (
        <DeletePostModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}

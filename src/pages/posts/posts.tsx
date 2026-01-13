import { useContext, useEffect, useState } from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import type { IPost } from "../../interfaces/post/IPost";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import PostCard from "../../components/post/PostCard";
import CreatePostModal from "../../components/post/CreatePostModal";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Posts() {
  const { user } = useContext(mainContext);
  const [posts, setPosts] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) {
      navigate("/signin");
      return;
    }
    fetchPosts();
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await axiosPublic.get<{ posts: IPost[] }>("/api/posts", {
        withCredentials: true,
      });
      setPosts(resp.data.posts || []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Error loading posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
    setShowCreateModal(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <NoDataMessage message={error} linkText="Back" linkTo="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-black">Posts</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create</span>
          </button>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              No posts yet
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user?.username || ""}
                onUpdate={fetchPosts}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
}

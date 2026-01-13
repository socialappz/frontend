import { useState } from "react";
import { X } from "lucide-react";
import { axiosPublic } from "../../utils/axiosConfig";
import { uploadImg } from "../../functions/uploadImg";
import LoadingSpinner from "../common/LoadingSpinner";

interface CreatePostModalProps {
  onClose: () => void;
  onPostCreated: () => void;
}

export default function CreatePostModal({
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const [image, setImage] = useState<string>("");
  const [text, setText] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const base64Image = await uploadImg(e);
      setImage(base64Image);
      setError(null);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Error uploading image");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!image && !text.trim()) {
      setError("Please add an image or text");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axiosPublic.post(
        "/api/posts",
        {
          image,
          text: text.trim(),
          isPublic,
        },
        { withCredentials: true }
      );

      onPostCreated();
    } catch (err: any) {
      console.error("Error creating post:", err);
      setError(err.response?.data?.error || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-black">Create Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
            {image && (
              <div className="mt-4 relative">
                <img
                  src={image}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Text (optional)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What would you like to share?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
            />
            <label
              htmlFor="isPublic"
              className="text-sm font-medium text-gray-700"
            >
              Public (visible to everyone) / Private (only for matches)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-white flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!image && !text.trim())}
              className="flex-1 px-6 py-3 bg-black! text-white rounded-xl hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="small" /> : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

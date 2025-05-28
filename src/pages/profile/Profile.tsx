import { useEffect, useState } from "react";
import { useParams , Link} from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import { ArrowLeft } from "lucide-react";



export default function Profile() {
  const { id } = useParams();
  const [matchUser, setMatchUser] = useState<any>(null);


  useEffect(() => {
    const getUser = async () => {
      try {
        const resp = await axiosPublic.get(`/getmatchuser/${id}`, {
          withCredentials: true,
        });
        setMatchUser(resp.data.matchUser);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    getUser();
  }, [id]);

  if (!matchUser) {
    return <div className="text-center mt-20 text-xl">Loading...</div>;
  }

return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-50 rounded-3xl shadow-lg">
    
    <Link to="/matche">
      <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
    </Link> 

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <img
          src={matchUser.userImage || "/default-avatar.png"}
          alt={matchUser.username}
          className="w-44 h-44 rounded-full object-cover border-8 border-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-lg"
        />
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">{matchUser.username}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-lg">
            <div>
              <strong>Email:</strong> <span className="text-gray-600">{matchUser.email}</span>
            </div>
            <div>
              <strong>Gender:</strong> <span className="text-gray-600">{matchUser.gender}</span>
            </div>
            <div>
              <strong>Language:</strong> <span className="text-gray-600">{matchUser.language}</span>
            </div>
            <div>
              <strong>Dog Breed:</strong> <span className="text-gray-600">{matchUser.dogBreed}</span>
            </div>
          </div>

          {matchUser.description && (
            <p className="mt-4 text-gray-700 italic border-l-4 border-blue-500 pl-4">
              {matchUser.description}
            </p>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Availability</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {matchUser.availability?.weekDay?.map((day: string, idx: number) => (
                <li key={idx}>{day}</li>
              ))}
            </ul>
            <p className="mt-2 text-gray-700">
              <strong>Time:</strong> {matchUser.availability?.dayTime || "Not specified"}
            </p>
          </div>

          <Link
            to={`/chat/${matchUser._id}`}
            className="mt-8 inline-block bg-black !text-white font-bold py-3 px-8 rounded-full shadow-lg hover:brightness-110 transition duration-300"
          >
            Start Chat 💬
          </Link>
        </div>
      </div>
    </div>
  );
}

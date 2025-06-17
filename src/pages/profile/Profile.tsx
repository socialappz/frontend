import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
    return (
      <div
        className="mt-5 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      ></div>
    );
  }

  const calculateAge = (birthday: string) => {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDogAge = (age: string | number): string => {
    const ageNum = parseFloat(age as string);
    if (isNaN(ageNum)) return "Not specified";
    
    if (ageNum < 1) {
      const months = Math.round(ageNum * 12);
      return `${months} ${months === 1 ? 'Month' : 'Months'}`;
    } else {
      const years = Math.floor(ageNum);
      const months = Math.round((ageNum - years) * 12);
      if (months === 0) {
        return `${years} ${years === 1 ? 'Year' : 'Years'}`;
      } else {
        return `${years} ${years === 1 ? 'Year' : 'Years'} and ${months} ${months === 1 ? 'Month' : 'Months'}`;
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-50 rounded-3xl shadow-lg">
      <Link to="/matche">
        <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
      </Link>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <img
            src={matchUser.userImage || "/default-avatar.png"}
            alt={matchUser.username}
            className="w-44 h-44 rounded-full object-cover border-8 border-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-lg"
          />
          {matchUser.dogImage && (
            <img
              src={matchUser.dogImage}
              alt={`${matchUser.username}'s dog`}
              className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 shadow-lg"
            />
          )}
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">{matchUser.username}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-lg">
            <div>
              <strong>Gender:</strong> <span className="text-gray-600">{matchUser.gender}</span>
            </div>
            <div>
              <strong>Age:</strong>{" "}
              <span className="text-gray-600">
                {matchUser.birthday ? calculateAge(matchUser.birthday) : "Not specified"}
              </span>
            </div>
            <div>
              <strong>Languages:</strong>{" "}
              <span className="text-gray-600">
                {Array.isArray(matchUser.languages)
                  ? matchUser.languages.join(", ")
                  : matchUser.languages || "Not specified"}
              </span>
            </div>
            <div>
              <strong>Dog Breed:</strong>{" "}
              <span className="text-gray-600">{matchUser.dogBreed || "Not specified"}</span>
            </div>
            <div>
              <strong>Dog's Age:</strong>{" "}
              <span className="text-gray-600">{matchUser.dogAge ? formatDogAge(matchUser.dogAge) : "Not specified"}</span>
            </div>
            {matchUser.favoriteToy && (
              <div>
                <strong>Favorite Toy:</strong>{" "}
                <span className="text-gray-600">{matchUser.favoriteToy}</span>
              </div>
            )}
          </div>

          {matchUser.description && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">About Me</h2>
              <p className="text-gray-700 italic border-l-4 border-blue-500 pl-4">
                {matchUser.description}
              </p>
            </div>
          )}

          {matchUser.dogDescription && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">About My Dog</h2>
              <p className="text-gray-700 italic border-l-4 border-yellow-500 pl-4">
                {matchUser.dogDescription}
              </p>
            </div>
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

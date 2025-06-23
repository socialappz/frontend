import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brush } from "lucide-react";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";

interface myProfileProps {
  user: IUser;
}

export default function MyProfile() {
  const { user } = useContext(mainContext) as myProfileProps;

  const half = Math.ceil(user?.availability?.weekDay.length / 2);
  const firstColumn = user?.availability?.weekDay?.slice(0, half);
  const secondColumn = user?.availability?.weekDay.slice(half);

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

  if (!user) {
    return (
      <div
        className="mt-5 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      ></div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-50 rounded-3xl shadow-lg">
      <div className="flex justify-between">
        <Link to="/matche">
          <ArrowLeft className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </Link>

        <Link to={"/dashboard"}>
          <Brush className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="flex flex-col items-center gap-4">
          <img
            src={user.userImage || "/default-avatar.png"}
            alt={user.username}
            className="w-44 h-44 rounded-full object-cover border-8 border-gradient-to-tr from-blue-400 via-purple-500 to-pink-500 shadow-lg"
          />
          {user?.dogImage && (
            <img
              src={user?.dogImage}
              alt={`${user?.username}'s dog`}
              className="w-32 h-32 rounded-full object-cover border-4 border-gradient-to-tr from-yellow-400 via-orange-500 to-red-500 shadow-lg"
            />
          )}
        </div>
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">{user?.username}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700 text-lg">
            <div>
              <strong>Gender:</strong> <span className="text-gray-600">{user?.gender}</span>
            </div>
            <div>
              <strong>Age:</strong>{" "}
              <span className="text-gray-600">
                {user.birthday ? calculateAge(user.birthday) : "Not specified"}
              </span>
            </div>
            <div>
              <strong>Languages:</strong>{" "}
              <span className="text-gray-600">
                {Array.isArray(user.languages)
                  ? user.languages.join(", ")
                  : user.languages || "Not specified"}
              </span>
            </div>
            <div>
              <strong>Dog Breed:</strong>{" "}
              <span className="text-gray-600">{user.dogBreed || "Not specified"}</span>
            </div>
            <div>
              <strong>Dog's Age:</strong>{" "}
              <span className="text-gray-600">{user?.dogAge ? formatDogAge(user?.dogAge) : "Not specified"}</span>
            </div>
            {user.favoriteToy && (
              <div>
                <strong>Favorite Toy:</strong>{" "}
                <span className="text-gray-600">{user?.favoriteToy}</span>
              </div>
            )}
          </div>

          {user?.description && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">About Me</h2>
              <p className="text-gray-700 italic border-l-4 border-blue-500 pl-4">
                {user?.description}
              </p>
            </div>
          )}

          {user?.dogDescription && (
            <div className="mt-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">About My Dog</h2>
              <p className="text-gray-700 italic border-l-4 border-yellow-500 pl-4">
                {user?.dogDescription}
              </p>
            </div>
          )}

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Availability</h2>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-1 list-disc ml-5">
                {firstColumn?.map((day, key) => (
                  <li key={key}>{day}</li>
                ))}
              </ul>
              <ul className="space-y-1 list-disc ml-5">
                {secondColumn?.map((day, key) => (
                  <li key={key + half}>{day}</li>
                ))}
              </ul>
            </div>
            <p className="mt-2 text-gray-700">
              <strong>Time:</strong> {user?.availability?.dayTime || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

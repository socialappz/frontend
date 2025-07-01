import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brush } from "lucide-react";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";
import { Carousel } from "react-bootstrap";

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
    <div className="max-w-md mx-auto p-0 bg-white rounded-3xl shadow-lg flex flex-col items-center min-h-screen">
      <div className="w-full flex flex-col items-center mt-8">
        <div className="w-full flex justify-between px-4">
          <Link to="/matche">
            <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-gray-700" />
          </Link>
          <Link to={"/dashboard"}>
            <Brush className="w-6 h-6 text-gray-400 hover:text-gray-700" />
          </Link>
        </div>
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex justify-center">
            <div className="w-80 h-96 flex items-center justify-center">
              <Carousel indicators={true} controls={true} interval={null} className="w-full h-full">
                <Carousel.Item>
                  <img
                    src={user.userImage || "/default-avatar.png"}
                    alt={user.username}
                    className="d-block w-full h-96 object-cover rounded-2xl shadow-md"
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    src={user.dogImage || "/default-dog.png"}
                    alt={user.dogBreed ? `${user.username}'s dog` : "Kein Hundebild"}
                    className="d-block w-full h-96 object-cover rounded-2xl shadow-md"
                  />
                </Carousel.Item>
              </Carousel>
            </div>
          </div>
          <div className="w-full flex flex-col items-center mt-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">{user.username}, {user.birthday ? calculateAge(user.birthday) : "-"}</h1>
            <div className="text-gray-500 text-center text-lg mt-1">{user.gender}</div>
            {user.description && (
              <p className="mt-4 text-gray-700 text-center text-base px-4">{user.description}</p>
            )}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {user.languages && Array.isArray(user.languages) && user.languages.map((lang: string, idx: number) => (
                <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{lang}</span>
              ))}
              {user.dogBreed && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">{user.dogBreed}</span>
              )}
              {user.dogAge && (
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">{formatDogAge(user.dogAge)}</span>
              )}
              {user.favoriteToy && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">{user.favoriteToy}</span>
              )}
            </div>
            {user.dogDescription && (
              <p className="mt-4 text-gray-700 text-center text-base px-4">🐶 {user.dogDescription}</p>
            )}
            <div className="mt-6 w-full flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Availability</h2>
              <div className="flex flex-col items-center">
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-center">
                  {firstColumn?.map((day, key) => (
                    <li key={key}>{day}</li>
                  ))}
                </ul>
                <ul className="list-disc list-inside text-gray-700 space-y-1 text-center">
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
    </div>
  );
}

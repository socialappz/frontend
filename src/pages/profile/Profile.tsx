import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";
import { ArrowLeft, Heart } from "lucide-react";
import { useContext } from "react";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";
import Carousel from "react-bootstrap/Carousel";

interface IProfileProps {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

export default function Profile() {
  const { id } = useParams();
  const [matchUser, setMatchUser] = useState<any>(null);
  const [likeSent, setLikeSent] = useState(false);
  const [isMatch, setIsMatch] = useState(false);
  const [checkingMatch, setCheckingMatch] = useState(false);
  const [notification, setNotification] = useState("");
  const { user, setUser } = useContext(mainContext) as IProfileProps;
  const [canChat, setCanChat] = useState(false);

  const normalize = (name: string) => name.toLowerCase().replace(/\s+/g, "");

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

  useEffect(() => {
    if (!user || !matchUser) return;
    const targetUsername = normalize(matchUser.username);
    const alreadyLiked = user.likes?.map(normalize).includes(targetUsername);
    setLikeSent(alreadyLiked);
    const alreadyMatched = user.matches
      ?.map(normalize)
      .includes(targetUsername);
    setIsMatch(alreadyMatched);
  }, [user, matchUser]);

  useEffect(() => {
    if (!user || !matchUser) return;
    const myUsername = normalize(user.username);
    const targetUsername = normalize(matchUser.username);
    setCheckingMatch(false);
    axiosPublic
      .get(`/isMatch/${myUsername}/${targetUsername}`, {
        withCredentials: true,
      })
      .then((res) => {
        setIsMatch(res.data.isMatch);
      })
      .finally(() => setCheckingMatch(true));
  }, [user, matchUser]);

  useEffect(() => {
    if (!user || !matchUser) return;
    const myUsername = normalize(user.username);
    const targetUsername = normalize(matchUser.username);
    axiosPublic
      .get(`/canChat/${myUsername}/${targetUsername}`, {
        withCredentials: true,
      })
      .then((res) => {
        setCanChat(res.data.canChat);
      });
  }, [user, matchUser, likeSent, isMatch]);

  const refreshUser = async () => {
    try {
      const resp = await axiosPublic.get("/currentUser", {
        withCredentials: true,
      });
      setUser(resp.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    if (!user) return;
    try {
      const targetUsername = normalize(matchUser.username);
      await axiosPublic.post(
        "/like",
        { likedUsername: targetUsername },
        { withCredentials: true }
      );
      setLikeSent(true);
      setNotification("Like sent. Waiting for a match!");
      await refreshUser();

      const myUsername = normalize(user.username);
      const res = await axiosPublic.get(
        `/isMatch/${myUsername}/${targetUsername}`,
        { withCredentials: true }
      );
      setIsMatch(res.data.isMatch);
      const canChatRes = await axiosPublic.get(
        `/canChat/${myUsername}/${targetUsername}`,
        { withCredentials: true }
      );
      setCanChat(canChatRes.data.canChat);
    } catch (err) {
      setNotification("Error liking or already liked.");
    }
  };

  useEffect(() => {
    let interval: number;
    if (likeSent && user && matchUser && !isMatch) {
      const myUsername = normalize(user.username);
      const targetUsername = normalize(matchUser.username);
      const checkMatch = async () => {
        try {
          const res = await axiosPublic.get(
            `/isMatch/${myUsername}/${targetUsername}`,
            { withCredentials: true }
          );
          if (res.data.isMatch) {
            setNotification("You have a match! Now you can chat.");
            setIsMatch(true);
            await refreshUser();
            clearInterval(interval);
          }
        } catch (err) {}
      };
      interval = window.setInterval(checkMatch, 3000);
      return () => clearInterval(interval);
    }
  }, [likeSent, user, matchUser, isMatch]);

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
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDogAge = (age: string | number): string => {
    const ageNum = parseFloat(age as string);
    if (isNaN(ageNum)) return "Not specified";

    if (ageNum < 1) {
      const months = Math.round(ageNum * 12);
      return `${months} ${months === 1 ? "Month" : "Months"}`;
    } else {
      const years = Math.floor(ageNum);
      const months = Math.round((ageNum - years) * 12);
      if (months === 0) {
        return `${years} ${years === 1 ? "Year" : "Years"}`;
      } else {
        return `${years} ${years === 1 ? "Year" : "Years"} and ${months} ${
          months === 1 ? "Month" : "Months"
        }`;
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-0 bg-white rounded-3xl shadow-lg flex flex-col items-center min-h-screen">
      <div className="w-full flex flex-col items-center mt-8">
        <div className="w-full flex justify-start px-4">
          <Link to="/matche">
            <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-gray-700" />
          </Link>
        </div>
        <div className="w-full flex flex-col items-center">
          <div className="w-full flex justify-center">
            <div className="w-80 h-96 flex items-center justify-center">
              <Carousel
                indicators={true}
                controls={true}
                interval={null}
                className="w-full h-full"
              >
                <Carousel.Item>
                  <img
                    src={matchUser.userImage || "/default-avatar.png"}
                    alt={matchUser.username}
                    className="d-block w-full h-96 object-cover rounded-2xl shadow-md"
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    src={matchUser.dogImage || "/default-dog.png"}
                    alt={
                      matchUser.dogBreed
                        ? `${matchUser.username}'s dog`
                        : "Kein Hundebild"
                    }
                    className="d-block w-full h-96 object-cover rounded-2xl shadow-md"
                  />
                </Carousel.Item>
              </Carousel>
            </div>
          </div>
          <div className="w-full flex flex-col items-center mt-6">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              {matchUser.username},{" "}
              {matchUser.birthday ? calculateAge(matchUser.birthday) : "-"}
            </h1>
            <div className="text-gray-500 text-center text-lg mt-1">
              {matchUser.gender}
            </div>
            {matchUser.description && (
              <p className="mt-4 text-gray-700 text-center text-base px-4">
                {matchUser.description}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {matchUser.languages &&
                Array.isArray(matchUser.languages) &&
                matchUser.languages.map((lang: string, idx: number) => (
                  <span
                    key={idx}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {lang}
                  </span>
                ))}
              {matchUser.dogBreed && (
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {matchUser.dogBreed}
                </span>
              )}
              {matchUser.dogAge && (
                <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm">
                  {formatDogAge(matchUser.dogAge)}
                </span>
              )}
              {matchUser.favoriteToy && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {matchUser.favoriteToy}
                </span>
              )}
            </div>
            {matchUser.dogDescription && (
              <p className="mt-4 text-gray-700 text-center text-base px-4">
                🐶 {matchUser.dogDescription}
              </p>
            )}
            <div className="mt-6 w-full flex flex-col items-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                availability
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-1 text-center">
                {matchUser.availability?.weekDay?.map(
                  (day: string, idx: number) => (
                    <li key={idx}>{day}</li>
                  )
                )}
              </ul>
              <p className="mt-2 text-gray-700">
                <strong>Time:</strong>{" "}
                {matchUser.availability?.dayTime || "not available"}
              </p>
            </div>
            <div className="mt-8 flex flex-col items-center gap-2 w-full">
              {!likeSent && (
                <button
                  onClick={handleLike}
                  className="flex items-center gap-2 px-6 py-2 rounded-full border-2 border-pink-500 text-pink-500 hover:bg-pink-100 transition font-semibold text-lg shadow-sm"
                >
                  <Heart className="w-6 h-6" /> Like
                </button>
              )}
              <span className="text-pink-600 text-sm">{notification}</span>
              {!likeSent && !isMatch && (
                <div className="mt-2 text-sm text-gray-500">
                  Please Wait, util you get like from another Person
                </div>
              )}
              <Link
                to={canChat ? `/chat/${matchUser._id}` : "#"}
                className={`mt-4 mb-4 inline-block bg-black text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ${
                  !canChat
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : "hover:brightness-110"
                }`}
                tabIndex={canChat ? 0 : -1}
                aria-disabled={!canChat}
              >
                {checkingMatch && !canChat ? "like back.." : "Chat starten 💬"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

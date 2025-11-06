import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Brush } from "lucide-react";
import { mainContext } from "../../context/MainProvider";
import type { IUser } from "../../interfaces/user/IUser";
import { Carousel } from "react-bootstrap";
import { calculateAge } from "../../functions/calculateAge";
import { formatDogAge } from "../../functions/formatDogAge";
interface myProfileProps {
  user: IUser;
}

export default function MyProfile() {
  const { user } = useContext(mainContext) as myProfileProps;

  if (!user) {
    return (
      <div
        className="mt-5 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      ></div>
    );
  }

  return (
    <div className="w-100 bg-white min-h-screen">
      <div className="container max-w-6xl mx-auto py-6 px-3">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <Link className="mb-0" to="/matche" title="Back">
            <ArrowLeft className="w-6 h-6 text-gray-400 hover:text-gray-700" />
          </Link>
          <Link className="mb-0" to={"/dashboard"} title="Edit profile">
            <Brush className="w-6 h-6 text-gray-400 hover:text-gray-700" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-3xl overflow-hidden shadow border border-light bg-white">
            <div className="w-100 h-[360px] sm:h-[420px] md:h-[480px] lg:h-[520px] xl:h-[560px] overflow-hidden">
              <Carousel
                indicators={true}
                controls={true}
                interval={null}
                className="w-100 h-100"
              >
                <Carousel.Item>
                  <img
                    src={user.userImage || "/default-avatar.png"}
                    alt={user.username}
                    className="d-block w-100 h-100 object-cover"
                  />
                </Carousel.Item>
                <Carousel.Item>
                  <img
                    src={user.dogImage || "/default-dog.png"}
                    alt={user.dogBreed ? `${user.username}'s dog` : "not available"}
                    className="d-block w-100 h-100 object-cover"
                  />
                </Carousel.Item>
              </Carousel>
            </div>
            <div className="p-4 border-top position-relative z-10 bg-white">
              <h1 className="h4 fw-bold text-dark mb-1">
                {user.username}{" "}
                <span className="text-secondary">
                  {user.birthday ? `• ${calculateAge(user.birthday)}` : ""}
                </span>
              </h1>
              <div className="text-secondary small mb-2">{user.gender}</div>
              {user.description && (
                <p className="text-dark m-0">{user.description}</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-3xl p-4 shadow border border-light bg-white">
              <h2 className="h6 fw-semibold text-dark mb-3">Info</h2>
              <div className="d-flex flex-wrap gap-2">
                {user.languages &&
                  Array.isArray(user.languages) &&
                  user.languages.map((lang: string, idx: number) => (
                    <span key={idx} className="badge bg-light text-dark border">
                      {lang}
                    </span>
                  ))}
                {user.dogBreed && (
                  <span className="badge bg-warning-subtle text-warning-emphasis border">
                    {user.dogBreed}
                  </span>
                )}
                {user.dogAge && (
                  <span className="badge bg-pink-100 text-pink-700 border">
                    {formatDogAge(user.dogAge)}
                  </span>
                )}
                {user.favoriteToy && (
                  <span className="badge bg-primary-subtle text-primary-emphasis border">
                    {user.favoriteToy}
                  </span>
                )}
              </div>
              {user.dogDescription && (
                <p className="mt-3 text-dark">🐶 {user.dogDescription}</p>
              )}
            </div>

            <div className="rounded-3xl p-4 shadow border border-light bg-white">
              <h2 className="h6 fw-semibold text-dark mb-3">Availability</h2>
              <ul className="mb-2">
                {user?.availability?.weekDay?.map((day: string, idx: number) => (
                  <li key={idx} className="text-dark small">
                    {day}
                  </li>
                ))}
              </ul>
              <div className="text-dark small">
                <strong>Time:</strong>{" "}
                {user?.availability?.dayTime || "Not specified"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import type { IMatchUser } from "../../interfaces/match/IMatchUser";
import { Heart } from "lucide-react";

export default function MatchCard({
  matchUser,
  likes,
}: {
  matchUser: IMatchUser;
  likes: string[];
  currentUsername: string;
}) {
  const isLiked = likes.includes(matchUser.username);

  return (
    <Link to={`/matche/${matchUser._id}`} className="text-decoration-none">
      <div className="card text-center border-0 shadow-sm match-card-hover  hover:text-red-500!">
        <div className="d-flex flex-column align-items-center p-4 bg-white rounded">
          <div
            className="position-relative mb-3"
            style={{ width: "8rem", height: "8rem" }}
          >
            <img
              src={matchUser.userImage}
              alt={matchUser.username}
              className="w-100 h-100 rounded-circle border-4 border-dark match-card-img"
              style={{ objectFit: "cover" }}
            />
            <span style={{ position: "absolute", bottom: -10, right: -10 }}>
              {isLiked ? (
                <Heart fill="#e11d48" color="#e11d48" />
              ) : (
                <Heart className="hover:fill-white!" />
              )}
            </span>
          </div>
          <div>
            <h3 className="h5 fw-semibold text-dark mb-1 match-card-username">
              {matchUser.username}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
}

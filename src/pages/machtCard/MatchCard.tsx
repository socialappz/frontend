import { Link } from "react-router-dom";
import type { IMatchUser } from "../../interfaces/match/IMatchUser";

export default function MatchCard({ matchUser }: { matchUser: IMatchUser }) {
  return (
    <Link to={`/matche/${matchUser._id}`} className="text-decoration-none">
      <div className="card text-center border-0 shadow-sm match-card-hover">
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

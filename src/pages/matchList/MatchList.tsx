import { useContext, useEffect, useState, useCallback } from "react";
import { axiosPublic } from "../../utils/axiosConfig";
import MatchCard from "../machtCard/MatchCard";
import { useNavigate } from "react-router-dom";
import { mainContext } from "../../context/MainProvider";
import type { IMatchUser } from "../../interfaces/match/IMatchUser";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";

export default function MatchList() {
  const { matchUsers, setMatchUsers, user } = useContext(mainContext);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const getMatchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await axiosPublic.get<IMatchUser[]>("/getMatchedUsers", {
        withCredentials: true,
      });
      setMatchUsers(Array.isArray(resp.data) ? resp.data : []);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Fehler beim Laden der Matches");
      setMatchUsers([]);
    } finally {
      setLoading(false);
    }
  }, [setMatchUsers]);

  useEffect(() => {
    if (user === null) {
      navigate("/signin");
      return;
    }
    getMatchUsers();
  }, [user, navigate, getMatchUsers]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={getMatchUsers}
            className="mt-2 text-red-700 hover:text-red-900 underline"
          >
            Try again!
          </button>
        </div>
      </div>
    );
  }

  if (!matchUsers.length) {
    return (
      <NoDataMessage 
        message="Keine Matches gefunden"
        linkText="Finde neue Freunde"
        linkTo="/dashboard"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h4 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
          your Matches
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {matchUsers.map((matchUser) => (
            <div 
              key={matchUser._id}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <MatchCard matchUser={matchUser} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import type { IMatchUser } from "../../interfaces/match/IMatchUser";
import MatchCard from "../machtCard/MatchCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { useNavigate } from "react-router-dom";

function rectanglesOverlap(
  aBl?: number[],
  aTr?: number[],
  bBl?: number[],
  bTr?: number[]
) {
  if (!aBl || !aTr || !bBl || !bTr) return false;
  const [aBlLat, aBlLng] = aBl;
  const [aTrLat, aTrLng] = aTr;
  const [bBlLat, bBlLng] = bBl;
  const [bTrLat, bTrLng] = bTr;

  const noOverlap =
    aTrLat < bBlLat || bTrLat < aBlLat || aTrLng < bBlLng || bTrLng < aBlLng;
  return !noOverlap;
}

export default function CoordinationResults() {
  const { user, matchUsers, setMatchUsers, setMapOpen } =
    useContext(mainContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchIfNeeded = useCallback(async () => {
    if (Array.isArray(matchUsers) && matchUsers.length > 0) return;
    try {
      setLoading(true);
      const resp = await axiosPublic.get<IMatchUser[]>(
        "/auth/getMatchedUsers",
        {
          withCredentials: true,
        }
      );
      setMatchUsers(Array.isArray(resp.data) ? resp.data : []);
    } catch (e) {
      setError("Fehler beim Laden der Ergebnisse");
      setMatchUsers([]);
    } finally {
      setLoading(false);
    }
  }, [matchUsers, setMatchUsers]);

  useEffect(() => {
    if (user === null) {
      navigate("/signin");
      return;
    }
    fetchIfNeeded();
  }, [user, fetchIfNeeded, navigate]);

  const results = useMemo(() => {
    const myBl = (user as any)?.location?.bottomLeft;
    const myTr = (user as any)?.location?.topRight;
    if (!myBl || !myTr) return [] as IMatchUser[];

    return (matchUsers || []).filter((m) =>
      rectanglesOverlap(
        myBl,
        myTr,
        m.location?.bottomLeft,
        m.location?.topRight
      )
    );
  }, [user, matchUsers]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <NoDataMessage message={error} linkText="Back" linkTo="/" />;

  if (!results.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <NoDataMessage
          message="any Matches found in your coordination area"
          linkText="change your coordination area"
          linkTo="/coordination-results"
        />
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setMapOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Open Coordination Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h4 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
          Your Matches
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {results.map((matchUser, index) => (
            <div key={index}>
              <MatchCard
                matchUser={matchUser}
                likes={user?.likes || []}
                currentUsername={user?.username || ""}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

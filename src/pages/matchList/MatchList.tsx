import { useContext, useEffect } from "react";
import { axiosPublic } from "../../utils/axiosConfig";
import MatchCard from "../machtCard/MatchCard";
import { Link, useNavigate } from "react-router-dom";
import { mainContext } from "../../context/MainProvider";

export default function MatchList() {

  const {matchUsers, setMatchUsers, user} = useContext(mainContext)
  const navigate = useNavigate()

   if (user === null) {
    navigate("/signin")
  }


  const getMatchUsers = async () => {
    const resp = await axiosPublic.get("/getMatchedUsers", {
      withCredentials: true,
    });
    setMatchUsers(resp.data);
  };

  useEffect(() => {
    getMatchUsers();
  }, []);


if (!matchUsers.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="bg-black border border-white text-white px-4 py-3 rounded">
          <p>You have any Match</p>
          <br/>
         <Link className="text-white! text-shadow-amber-100" to={"/dashboard"}>Find some new Friend</Link>
        </div>
      </div>
    );
  }





return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
          Your Matches
        </h1>

        {matchUsers.length !== 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {matchUsers.map((matchUser, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                <MatchCard matchUser={matchUser} />
              </div>
            ))}
          </div>
        ) : (
           <div
    className="mt-5 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    role="status">
  </div>
        )}
      </div>
    </div>
  );

}

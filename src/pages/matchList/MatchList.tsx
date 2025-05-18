import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosPublic } from "../../utils/axiosConfig";

export default function MatchList() {

    const [matchUsers, setMatchUsers] = useState([]);
    const [showCard, setShowCard] = useState(false);

    const getMatchUsers = async () => {
    const resp = await axiosPublic.get("/getMatchedUsers", {
      withCredentials: true,
    });
    console.log(resp.data);
    setMatchUsers(resp.data);
  };


useEffect(() => {
    getMatchUsers();
}, []);


  return (
    <div>MatchList
        <Link to="/dashboard">Back to Profile</Link>
    </div>
  )
}

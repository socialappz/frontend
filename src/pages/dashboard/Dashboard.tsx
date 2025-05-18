import React, { useContext, useEffect, useRef, useState } from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import { uploadImg } from "../../functions/uploadImg";
import { Map, Draggable } from "pigeon-maps";
import locationpin from "../../../public/locationpin.svg";
import type { IUser } from "../../interfaces/user/IUser";
import { useNavigate } from "react-router-dom";

interface IUserProps {
  user: IUser;
  setUser: (value: any) => void;
}

export default function Dashboard() {
  const { user, setUser } = useContext(mainContext) as IUserProps;
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null);
  const [resizedImage, setResizedImage] = useState("");
  const [anchor, setAnchor] = useState<[number, number]>([50.879, 4.6997]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[] | any>([]);

  useEffect(() => {
    const getUser = async () => {
      const resp = await axiosPublic.get("/currentUser", {
        withCredentials: true,
      });

      const fetchedUser: IUser = resp.data;
      setSelectedWeekdays(fetchedUser.availability.weekDay)

      const lat: number = fetchedUser?.location?.bottomLeft?.[0];
      const lng: number = fetchedUser?.location?.topRight?.[0];

      setUser(fetchedUser);
      setSelectedWeekdays(fetchedUser.availability.weekDay);
      setAnchor([lat, lng]);
    };    getUser();
  }, []);

  console.log(user);

  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const newDays = checked
      ? [...selectedWeekdays, value]
      : selectedWeekdays.filter((day: string) => day !== value);
    setSelectedWeekdays(newDays);
    console.log(newDays);
    setUser({
      ...user,
      availability: {
        ...user.availability,
        weekDay: newDays,
      },
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const base64 = await uploadImg(e);
    setResizedImage(base64);
  };

  const userProfilHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      userImage: resizedImage || user.userImage,
      location: {
        bottomLeft: [anchor[0]],
        topRight: [anchor[1]],
      },
    };

    setUser(updatedUser);

    try {
      const response = await axiosPublic.post("/userprofil", updatedUser, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("Profil gespeichert:", response.data);
      navigate("/matche")
    } catch (error) {
      console.error("Fehler beim Speichern des Profils:", error);
    }
  };

  return (
    <div>
      <h2>Welcome Back {user?.username}</h2>
      <form
        ref={formRef}
        onSubmit={userProfilHandler}
        className="space-y-6 p-6 max-w-xl mx-auto bg-white shadow rounded text-black"
      >
        {/* Gender */}
        <div>
          <label className="block font-bold mb-1">Your Gender:</label>
          <div className="space-x-4">
            {["female", "male", "other"].map((g) => (
              <label key={g} className="capitalize">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={user?.gender === g}
                  onChange={() => setUser({ ...user, gender: g })}
                  className="mr-1"
                />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block font-bold mb-1">Spoken Language:</label>
          <select
            name="language"
            value={user?.language}
            onChange={(e) => setUser({ ...user, language: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">-- Select --</option>
            <option value="Ca">Chinese</option>
            <option value="En">English</option>
            <option value="FR">French</option>
            <option value="Ge">German</option>
            <option value="Tr">Turkish</option>
            <option value="ES">Spanish</option>
          </select>
        </div>

        {/* Dog Breed */}
        <div>
          <label className="block font-bold mb-1">Dog Breed:</label>
          <select
            name="dogBreed"
            value={user?.dogBreed || ""}
            onChange={(e) => setUser({ ...user, dogBreed: e.target.value })}
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">-- Select --</option>
            <option value="Akita">Akita</option>
            <option value="Border Collie">Border Collie</option>
            <option value="Chinook">Chinook</option>
            <option value="Drever">Drever</option>
            <option value="Terrier">Terrier</option>
          </select>
        </div>

        {/* Weekdays */}
        <div>
          <label className="block font-bold mb-1">Preferred Weekdays:</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day: string) => (
              <label key={day}>
                <input
                  type="checkbox"
                  value={day}
                  checked={selectedWeekdays?.includes(day)}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        {/* Time of Day */}
        <div>
          <label className="block font-bold mb-1">Time of Day:</label>
          <select
            name="dayTime"
            value={user?.availability?.dayTime || ""}
            onChange={(e) =>
              setUser({
                ...user,
                availability: {
                  ...user.availability,
                  dayTime: e.target.value,
                },
              })
            }
            className="w-full border border-gray-300 p-2 rounded"
          >
            <option value="">-- Select --</option>
            <option value="morning">Morning 6-11am</option>
            <option value="noon">Midday 10-13pm</option>
            <option value="in the evening">Afternoon 13-18pm</option>
            <option value="evening">Evening 18-22pm</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block font-bold mb-1">About You:</label>
          <textarea
            name="description"
            value={user?.description || ""}
            onChange={(e) => setUser({ ...user, description: e.target.value })}
            rows={5}
            placeholder="Tell us about your dog and yourself"
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block font-bold mb-1">Profile Image:</label>
          <input
            type="file"
            name="userImage"
            className="text-black"
            onChange={handleImageChange}
          />
        </div>

        {/* Map */}
        <Map height={300} defaultCenter={anchor} defaultZoom={11} center={anchor} >
          <Draggable offset={anchor} anchor={anchor} onDragEnd={setAnchor}>
            <img src={locationpin} width={100} height={95} alt="pin" />
          </Draggable>
        </Map>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
}

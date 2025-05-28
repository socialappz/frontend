import React, { useContext, useEffect, useRef, useState } from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import { uploadImg } from "../../functions/uploadImg";

import type { IUser } from "../../interfaces/user/IUser";
import { useNavigate } from "react-router-dom";
import MapComponent from "../../components/map/Map";

interface IUserProps {
  user: IUser;
  setUser: (value: any) => void;
}

export default function Dashboard() {
  const { user, setUser } = useContext(mainContext) as IUserProps;
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null);
  const [resizedImage, setResizedImage] = useState("");

  const [selectedWeekdays, setSelectedWeekdays] = useState<string[] | any>([]);

  const [bottomLeft, setBottomLeft] = useState<[number,number] | null >(null);
  const [topRight, setTopRight] = useState<[number,number] | null>(null);


  

useEffect(() => {
  const getUser = async () => {
    const resp = await axiosPublic.get("/currentUser", {
      withCredentials: true,
    });

    const fetchedUser: IUser = resp?.data;

    // Fallback: wenn weekDay kein Array ist, setze []
    const weekdays = Array.isArray(fetchedUser?.availability?.weekDay)
      ? fetchedUser.availability.weekDay
      : [];

    setSelectedWeekdays(weekdays);

    const defaultBottomLeft: [number, number] = [52.50, 13.39];
    const defaultTopRight: [number, number] = [52.54, 13.42];

    const lat = fetchedUser?.location?.bottomLeft ?? defaultBottomLeft;
    const lng = fetchedUser?.location?.topRight ?? defaultTopRight;

    setUser(fetchedUser);
    setBottomLeft(lat as [number, number]);
    setTopRight(lng as [number, number]);
  };

  getUser();
}, []);



  function isValidLatLng(coords: [number, number] | null): coords is [number, number] {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number" &&
    !isNaN(coords[0]) &&
    !isNaN(coords[1])
  );
}

  
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
        ...user?.availability,
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
        bottomLeft: bottomLeft,
        topRight: topRight,
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
<div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          Welcome Back, <span className="text-indigo-600">{user?.username}</span>
        </h2>

        <form ref={formRef} onSubmit={userProfilHandler} className="bg-white shadow-xl rounded-2xl p-4 sm:p-8 space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Your Gender</h3>
            <div className="flex flex-wrap gap-4">
              {["female", "male", "other"].map((g) => (
                <label
                  key={g}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={user?.gender === g}
                    onChange={() => setUser({ ...user, gender: g })}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="capitalize text-gray-700">{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-semibold text-gray-900">Spoken Language</label>
              <select
                name="language"
                value={user?.language || ""}
                onChange={(e) => setUser({ ...user, language: e.target.value })}
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Language</option>
                {["Chinese", "English", "French", "German", "Turkish", "Spanish"].map((lang) => (
                  <option key={lang} value={lang.substring(0, 2)}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-semibold text-gray-900">Dog Breed</label>
              <select
                name="dogBreed"
                value={user?.dogBreed || ""}
                onChange={(e) => setUser({ ...user, dogBreed: e.target.value })}
                className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Breed</option>
                {["Akita", "Border Collie", "Chinook", "Drever", "Terrier"].map((breed) => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Preferred Weekdays</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={day}
                    checked={selectedWeekdays.includes(day)}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-indigo-600"
                  />
                  <span className="text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block font-semibold text-gray-900">Preferred Time</label>
            <select
              name="dayTime"
              value={user?.availability?.dayTime || ""}
              onChange={(e) => setUser({
                ...user,
                availability: {
                  ...user.availability,
                  dayTime: e.target.value,
                },
              })}
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Time of Day</option>
              {[
                { value: "morning", label: "Morning 6-11am" },
                { value: "noon", label: "Midday 10-13pm" },
                { value: "in the evening", label: "Afternoon 13-18pm" },
                { value: "evening", label: "Evening 18-22pm" },
              ].map((time) => (
                <option key={time.value} value={time.value}>{time.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            <label className="block font-semibold text-gray-900">About You & Your Dog</label>
            <textarea
              name="description"
              value={user?.description || ""}
              onChange={(e) => setUser({ ...user, description: e.target.value })}
              rows={4}
              placeholder="Tell us about your dog and yourself..."
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-4">
            <label className="block font-semibold text-gray-900">Profile Image</label>
            <label className="flex flex-col items-center px-4 py-4 sm:py-6 bg-white text-indigo-600 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
              <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Click to upload photo</span>
              <input type="file" name="userImage" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Select Your Area</h3>
            <div className="h-64 sm:h-96 w-full rounded-lg overflow-hidden border border-gray-200">
  {isValidLatLng(bottomLeft) && isValidLatLng(topRight) ? (
    <MapComponent
      bottomLeft={bottomLeft}
      topRight={topRight}
      setBottomLeft={(coords) => setBottomLeft(coords)}
      setTopRight={(coords) => setTopRight(coords)}
    />
  ) : (
    <div className="h-full flex items-center justify-center text-gray-500">
      Loading map...
    </div>
  )}
</div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 sm:px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}
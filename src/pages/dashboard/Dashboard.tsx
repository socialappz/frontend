import React, { useContext, useEffect, useRef, useState } from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import { uploadImg } from "../../functions/uploadImg";
import { dogBreeds } from "../../data/dogs";
import { languages } from "../../data/laguages";
import type { IUser } from "../../interfaces/user/IUser";
import { useNavigate } from "react-router-dom";
import MapComponent from "../../components/map/Map";
import { ChevronDown, ChevronUp } from "lucide-react";

interface IUserProps {
  user: IUser;
  setUser: (value: any) => void;
}

export default function Dashboard() {
  const { user, setUser } = useContext(mainContext) as IUserProps;
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [resizedImage, setResizedImage] = useState("");
  const [dogImage, setDogImage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>([]);
  const [bottomLeft, setBottomLeft] = useState<[number, number] | null>(null);
  const [topRight, setTopRight] = useState<[number, number] | null>(null);
  const [showLanguages, setShowLanguages] = useState(false);
  const [editBirthday, setEditBirthday] = useState(false);
  const [birthdayInput, setBirthdayInput] = useState(user?.birthday || "");

  useEffect(() => {
    const getUser = async () => {
      const resp = await axiosPublic.get("/currentUser", {
        withCredentials: true,
      });

      const fetchedUser: IUser = resp?.data;
      const weekdays = Array.isArray(fetchedUser?.availability?.weekDay)
        ? fetchedUser.availability.weekDay
        : typeof fetchedUser?.availability?.weekDay === "string" && fetchedUser.availability.weekDay
        ? [fetchedUser.availability.weekDay]
        : [];

      const languages = Array.isArray(fetchedUser?.languages)
        ? fetchedUser.languages
        : typeof fetchedUser?.languages === "string" && fetchedUser.languages
        ? [fetchedUser.languages]
        : [];

      setSelectedWeekdays(weekdays);
      setSelectedLanguages(languages);
      setBirthdayInput(fetchedUser?.birthday || "");

      const defaultBottomLeft: [number, number] = [52.5, 13.39];
      const defaultTopRight: [number, number] = [52.54, 13.42];

      const lat = fetchedUser?.location?.bottomLeft ?? defaultBottomLeft;
      const lng = fetchedUser?.location?.topRight ?? defaultTopRight;

      setUser(fetchedUser);
      setBottomLeft(lat as [number, number]);
      setTopRight(lng as [number, number]);
    };

    getUser();
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const newLanguages = checked
      ? [...selectedLanguages, value]
      : selectedLanguages.filter((lang) => lang !== value);
    setSelectedLanguages(newLanguages);
    setUser({
      ...user,
      languages: newLanguages,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const newDays = checked
      ? [...selectedWeekdays, value]
      : selectedWeekdays?.filter((day: string) => day !== value);
    setSelectedWeekdays(newDays);
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

  const handleDogImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const base64 = await uploadImg(e);
    setDogImage(base64);
  };

  const handleBirthdaySave = () => {
    setUser({
      ...user,
      birthday: birthdayInput
    });
    setEditBirthday(false);
  };

  const userProfilHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser = {
      ...user,
      userImage: resizedImage || user.userImage,
      dogImage: dogImage || user.dogImage,
      location: {
        bottomLeft: bottomLeft,
        topRight: topRight,
      },
      birthday: birthdayInput || user.birthday,
    };

    setUser(updatedUser);

    try {
      await axiosPublic.post("/userprofil", updatedUser, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      navigate("/matche");
    } catch (error) {
      console.error("Fehler beim Speichern des Profils:", error);
    }
  };

  const nextStep = () => {
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const calculateAge = (birthday: string): number => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDogAge = (age: string | number): string => {
    const ageNum = parseFloat(age as string);
    if (isNaN(ageNum)) return "No age set";
    
    if (ageNum < 1) {
      const months = Math.round(ageNum * 12);
      return `${months} ${months === 1 ? 'Month' : 'Months'}`;
    } else {
      const years = Math.floor(ageNum);
      const months = Math.round((ageNum - years) * 12);
      if (months === 0) {
        return `${years} ${years === 1 ? 'Year' : 'Years'}`;
      } else {
        return `${years} ${years === 1 ? 'Year' : 'Years'} and ${months} ${months === 1 ? 'Month' : 'Months'}`;
      }
    }
  };

  const handleDogAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue >= 0) {
        setUser({ ...user, dogAge: value });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <form
          ref={formRef}
          onSubmit={userProfilHandler}
          className="bg-white shadow-xl rounded-2xl p-4 sm:p-8 space-y-8"
        >
          {currentStep === 1 ? (
            <>
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

              <div className="space-y-4">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowLanguages(!showLanguages)}
                    className="w-full flex items-center justify-between px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <span className="text-white!">
                      {selectedLanguages.length > 0
                        ? selectedLanguages.join(", ")
                        : "Select Languages"}
                    </span>
                    {showLanguages ? (
                      <ChevronUp className="w-5 h-5 text-white!" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-white!" />
                    )}
                  </button>
                  
                  {showLanguages && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto text-white!">
                      <div className="p-2 space-y-1 text-white!">
                        {languages.map((lang) => (
                          <label
                            key={lang}
                            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              value={lang}
                              checked={selectedLanguages.includes(lang)}
                              onChange={handleLanguageChange}
                              className="h-4 w-4 text-white! rounded border-gray-300 focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-black!">{lang}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">Birthday</label>
                {!editBirthday ? (
                  <>
                    <div className="mt-2 text-sm text-gray-600">
                      {user?.birthday
                        ? new Date(user.birthday).toLocaleDateString()
                        : "No birthday set"}
                    </div>
                    <button
                      type="button"
                      className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-white!"
                      onClick={() => setEditBirthday(true)}
                    >
                      Change your Birthday
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="date"
                      value={birthdayInput}
                      onChange={e => setBirthdayInput(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-black text-white"
                    />
                    <button
                      type="button"
                      className="mt-2 px-3 py-1 bg-black! rounded hover:bg-gray-600! text-white!"
                      onClick={handleBirthdaySave}
                    >
                      Save
                    </button>
                  </>
                )}
                {user?.birthday && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Age: {calculateAge(user.birthday)} years</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Preferred Weekdays</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <label
                      key={day}
                      className="flex items-center space-x-2 p-2 rounded-lg border border-gray-200 hover:bg-gray-50 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={day}
                        checked={selectedWeekdays?.includes(day)}
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
                  value={
                    typeof user?.availability?.dayTime === "string"
                      ? user?.availability?.dayTime
                      : ""
                  }
                  onChange={(e) =>
                    setUser({
                      ...user,
                      availability: {
                        ...user.availability,
                        dayTime: e.target.value,
                      },
                    })
                  }
                  className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Time of Day</option>
                  {[
                    { value: "morning", label: "Morning 6-11am" },
                    { value: "noon", label: "Midday 10-13pm" },
                    { value: "in the evening", label: "Afternoon 13-18pm" },
                    { value: "evening", label: "Evening 18-22pm" },
                  ].map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">About You</label>
                <textarea
                  name="description"
                  value={typeof user?.description === "string" ? user.description : ""}
                  onChange={(e) =>
                    setUser({ ...user, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">Profile Image</label>
                <label className="flex flex-col items-center px-4 py-4 sm:py-6 bg-white text-indigo-600 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
                  <svg
                    className="w-10 h-10 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Click to upload photo</span>
                  <input
                    type="file"
                    name="userImage"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {resizedImage && (
                  <p className="text-green-600 text-sm mt-2">Profile image uploaded successfully!</p>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Select Your Area</h3>
                <div className="h-64 sm:h-96 w-full rounded-lg overflow-hidden border border-gray-200">
                  <MapComponent
                    bottomLeft={bottomLeft}
                    topRight={topRight}
                    setBottomLeft={(coords) => setBottomLeft(coords)}
                    setTopRight={(coords) => setTopRight(coords)}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={nextStep}
                className="w-full py-3 px-4 sm:px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Next Step
              </button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">About Your Dog</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block font-semibold text-gray-900">Dog Breed</label>
                    <select
                      name="dogBreed"
                      value={typeof user?.dogBreed === "string" ? user.dogBreed : ""}
                      onChange={(e) =>
                        setUser({ ...user, dogBreed: e.target.value })
                      }
                      className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Breed</option>
                      {dogBreeds.map((breed) => (
                        <option key={breed} value={breed}>
                          {breed}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold text-gray-900">Dog's Age</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="dogAge"
                        value={user?.dogAge || ""}
                        onChange={handleDogAgeChange}
                        className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter age (e.g. 0.4 for 4 months)"
                      />
                      {user?.dogAge && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p>Age: {formatDogAge(user.dogAge)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">Dog's Image</label>
                <label className="flex flex-col items-center px-4 py-4 sm:py-6 bg-white text-indigo-600 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
                  <svg
                    className="w-10 h-10 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Click to upload dog's photo</span>
                  <input
                    type="file"
                    name="dogImage"
                    onChange={handleDogImageChange}
                    className="hidden"
                  />
                </label>
                {dogImage && (
                  <p className="text-green-600 text-sm mt-2">Dog image uploaded successfully!</p>
                )}
              </div>

              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">Favorite Toy</label>
                <input
                  type="text"
                  name="favoriteToy"
                  value={user?.favoriteToy || ""}
                  onChange={(e) => setUser({ ...user, favoriteToy: e.target.value })}
                  className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="What's your dog's favorite toy?"
                />
              </div>

              <div className="space-y-4">
                <label className="block font-semibold text-gray-900">About Your Dog</label>
                <textarea
                  name="dogDescription"
                  value={typeof user?.dogDescription === "string" ? user.dogDescription : ""}
                  onChange={(e) =>
                    setUser({ ...user, dogDescription: e.target.value })
                  }
                  rows={4}
                  placeholder="Tell us about your dog..."
                  className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg placeholder-gray-400 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 sm:px-6 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Previous Step
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 sm:px-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Save Profile
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
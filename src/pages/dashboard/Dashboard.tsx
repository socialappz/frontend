import React, { useContext, useEffect, useRef, useState } from "react";
import { mainContext } from "../../context/MainProvider";
import { axiosPublic } from "../../utils/axiosConfig";
import { uploadImg } from "../../functions/uploadImg";
import { dogBreeds } from "../../data/dogs";
import { languages } from "../../data/laguages";
import type { IUser } from "../../interfaces/user/IUser";
import { NavLink, useNavigate } from "react-router-dom";
// MapComponent entfernt – Koordination erfolgt nun über Header-Popup
import { ChevronDown, ChevronUp } from "lucide-react";
import { calculateAge } from "../../functions/calculateAge";
import { formatDogAge } from "../../functions/formatDogAge";

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
        : typeof fetchedUser?.availability?.weekDay === "string" &&
          fetchedUser.availability.weekDay
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

  const handleDogImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const base64 = await uploadImg(e);
    setDogImage(base64);
  };

  const handleBirthdaySave = () => {
    setUser({
      ...user,
      birthday: birthdayInput,
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleDogAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue >= 0) {
        setUser({ ...user, dogAge: value });
      }
    }
  };

  return (
    <div className="min-vh-100 bg-white py-4 px-3 px-sm-4 px-lg-5">
      <NavLink to="/matche" className="btn btn-outline-dark mb-4">
        Back to Matches
      </NavLink>
      <div className="container max-w-2xl mx-auto">
        <form
          ref={formRef}
          onSubmit={userProfilHandler}
          className="bg-white shadow rounded-4 p-4 p-sm-5 mb-4 border border-light"
        >
          {currentStep === 1 ? (
            <>
              <div className="mb-4">
                <h3 className="h5 fw-semibold text-dark">Your Gender</h3>
                <div className="d-flex flex-wrap gap-2">
                  {["female", "male", "other"].map((g) => (
                    <label
                      key={g}
                      className="d-flex align-items-center gap-2 px-3 py-2 rounded border border-secondary-subtle hover-border-dark user-gender-label"
                      style={{ cursor: "pointer" }}
                    >
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={user?.gender === g}
                        onChange={() => setUser({ ...user, gender: g })}
                        className="form-check-input"
                      />
                      <span className="text-capitalize text-dark">{g}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-4 position-relative">
                <button
                  type="button"
                  onClick={() => setShowLanguages(!showLanguages)}
                  className="w-100 d-flex align-items-center justify-content-between px-3 py-2 text-start bg-white border border-secondary-subtle rounded shadow-sm user-lang-btn"
                >
                  <span className="text-dark">
                    {selectedLanguages.length > 0
                      ? selectedLanguages.join(", ")
                      : "Select Languages"}
                  </span>
                  {showLanguages ? (
                    <ChevronUp className="ms-2" />
                  ) : (
                    <ChevronDown className="ms-2" />
                  )}
                </button>
                {showLanguages && (
                  <div
                    className="position-absolute z-3 w-100 mt-1 bg-white border border-secondary-subtle rounded shadow user-lang-dropdown"
                    style={{ maxHeight: "15rem", overflowY: "auto" }}
                  >
                    <div className="p-2">
                      {languages.map((lang) => (
                        <label
                          key={lang}
                          className="d-flex align-items-center px-2 py-2 rounded hover-bg-light user-lang-label"
                          style={{ cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            value={lang}
                            checked={selectedLanguages.includes(lang)}
                            onChange={handleLanguageChange}
                            className="form-check-input"
                          />
                          <span className="ms-2 text-dark">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Birthday
                </label>
                {!editBirthday ? (
                  <>
                    <div className="mt-2 small text-secondary">
                      {user?.birthday
                        ? new Date(user.birthday).toLocaleDateString()
                        : "No birthday set"}
                    </div>
                    <button
                      type="button"
                      className="mt-2 btn btn-outline-secondary btn-sm"
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
                      onChange={(e) => setBirthdayInput(e.target.value)}
                      className="form-control"
                    />
                    <button
                      type="button"
                      className="mt-2 btn btn-dark btn-sm"
                      onClick={handleBirthdaySave}
                    >
                      Save
                    </button>
                  </>
                )}
                {user?.birthday && (
                  <div className="mt-2 small text-secondary">
                    <p>Age: {calculateAge(user.birthday)} years</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="h5 fw-semibold text-dark">Preferred Weekdays</h3>
                <div className="row g-2">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => (
                    <div className="col-6 col-sm-4 col-md-3" key={day}>
                      <label
                        className="d-flex align-items-center gap-2 p-2 rounded border border-secondary-subtle hover-bg-light user-weekday-label"
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          value={day}
                          checked={selectedWeekdays?.includes(day)}
                          onChange={handleCheckboxChange}
                          className="form-check-input"
                        />
                        <span className="text-dark">{day}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Preferred Time
                </label>
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
                  className="form-select"
                >
                  <option value="">Select Time of Day</option>
                  {[
                    { value: "morning", label: "Morning 6-11am" },
                    { value: "noon", label: "Midday 10-13pm" },
                    { value: "in the evening", label: "Afternoon 13-18pm" },
                    { value: "evening", label: "Evening 18-22pm" },
                  ].map((time) => (
                    <option
                      key={time.value}
                      value={time.value}
                      className="text-dark"
                    >
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  About You
                </label>
                <textarea
                  name="description"
                  value={
                    typeof user?.description === "string"
                      ? user.description
                      : ""
                  }
                  onChange={(e) =>
                    setUser({ ...user, description: e.target.value })
                  }
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="form-control"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Profile Image
                </label>
                <label
                  className="d-flex flex-column align-items-center px-4 py-4 bg-white text-dark rounded border-2 border-dashed border-secondary-subtle user-img-label hover-border-dark hover-bg-light"
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    className="mb-2"
                    width="40"
                    height="40"
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
                  <span className="small fw-medium">Click to upload photo</span>
                  <input
                    type="file"
                    name="userImage"
                    onChange={handleImageChange}
                    className="d-none"
                  />
                </label>
                {resizedImage && (
                  <p className="text-success small mt-2">
                    Profile image uploaded successfully!
                  </p>
                )}
              </div>

              {/* Koordinationsbereich entfernt – bitte Header-Popup nutzen */}

              <button
                type="button"
                onClick={nextStep}
                className="w-100 btn btn-dark fw-semibold rounded mt-3 user-next-btn"
              >
                Next Step
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="h5 fw-semibold text-dark">About Your Dog</h3>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">
                      Dog Breed
                    </label>
                    <select
                      name="dogBreed"
                      value={
                        typeof user?.dogBreed === "string" ? user.dogBreed : ""
                      }
                      onChange={(e) =>
                        setUser({ ...user, dogBreed: e.target.value })
                      }
                      className="form-select"
                    >
                      <option value="">Select Breed</option>
                      {dogBreeds.map((breed) => (
                        <option key={breed} value={breed} className="text-dark">
                          {breed}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-dark">
                      Dog's Age
                    </label>
                    <div className="position-relative">
                      <input
                        type="text"
                        name="dogAge"
                        value={user?.dogAge || ""}
                        onChange={handleDogAgeChange}
                        className="form-control"
                        placeholder="Enter age (e.g. 0.4 for 4 months)"
                      />
                      {user?.dogAge && (
                        <div className="mt-2 small text-secondary">
                          <p>Age: {formatDogAge(user.dogAge)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Dog's Image
                </label>
                <label
                  className="d-flex flex-column align-items-center px-4 py-4 bg-white text-dark rounded border-2 border-dashed border-secondary-subtle user-img-label hover-border-dark hover-bg-light"
                  style={{ cursor: "pointer" }}
                >
                  <svg
                    className="mb-2"
                    width="40"
                    height="40"
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
                  <span className="small fw-medium">
                    Click to upload dog's photo
                  </span>
                  <input
                    type="file"
                    name="dogImage"
                    onChange={handleDogImageChange}
                    className="d-none"
                  />
                </label>
                {dogImage && (
                  <p className="text-success small mt-2">
                    Dog image uploaded successfully!
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Favorite Toy
                </label>
                <input
                  type="text"
                  name="favoriteToy"
                  value={user?.favoriteToy || ""}
                  onChange={(e) =>
                    setUser({ ...user, favoriteToy: e.target.value })
                  }
                  className="form-control"
                  placeholder="What's your dog's favorite toy?"
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  About Your Dog
                </label>
                <textarea
                  name="dogDescription"
                  value={
                    typeof user?.dogDescription === "string"
                      ? user.dogDescription
                      : ""
                  }
                  onChange={(e) =>
                    setUser({ ...user, dogDescription: e.target.value })
                  }
                  rows={4}
                  placeholder="Tell us about your dog..."
                  className="form-control"
                />
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline-dark flex-fill"
                >
                  Previous Step
                </button>
                <button type="submit" className="btn btn-dark flex-fill">
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

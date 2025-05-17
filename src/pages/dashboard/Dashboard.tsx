import React, { useContext, useEffect, useRef, useState } from 'react'
import { mainContext } from '../../context/MainProvider'
import { axiosPublic } from '../../utils/axiosConfig';
import {uploadImg} from "../../functions/uploadImg"


export default function Dashboard() {
    const {user, setUser} = useContext(mainContext) as any
    console.log(user);

      const formRef = useRef<HTMLFormElement>(null);
    
     const [resizedImage, setResizedImage] = useState("");

      const [selectedWeekdays, setSelectedWeekdays] = useState<string[]>(
    user.availability?.weekDay
      ? user.availability.weekDay.split(",").map((w: string) => w.trim())
      : []
  );


     useEffect(()=>{
        const getUser = async () => {
            let resp = await axiosPublic.get("/currentUser", {
          withCredentials: true,
        });
        console.log(resp.data.username);
        setUser({...user,
            username: resp.data.username
         })
        }
        getUser()
     },[])

// !  ------------------


  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedWeekdays((prev) =>
      checked ? [...prev, value] : prev.filter((day) => day !== value)
    );
  };


const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const base64 = await uploadImg(e);
  setResizedImage(base64);
};


    console.log(resizedImage);


  const userProfilHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;

    const formData = new FormData(form);

   const updateUser = {
    ...user,
      username: user?.username,
      email: user?.email,
      gender: formData?.get("gender") as string,
      language: formData?.get("language") as string,
      dogBreed: formData?.get("dogBreed") as string,
      userImage: resizedImage,
      availability: {
        weekDay: selectedWeekdays?.join(", "),
        dayTime: formData?.get("dayTime") as string,
      },
      description: formData?.get("description") as string,
    }


    setUser(updateUser)

    console.log("USER", user);

    try {
      const response = await axiosPublic.post("/userprofil",updateUser , {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("Profil gespeichert:", response.data);
    } catch (error) {
      console.error("Fehler beim Speichern des Profils:", error);
    }
  };


  return (
    <div>
        <h2>Welcome Back {user.username}</h2>
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
                defaultChecked={user.gender === g}
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
          defaultValue={user.language}
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
          defaultValue={user.dogBreed}
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

      {/* Weekdays (Checkboxes) */}
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
          ].map((day) => (
            <label key={day}>
              <input
                type="checkbox"
                value={day}
                checked={selectedWeekdays.includes(day)}
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
          defaultValue={user.availability?.dayTime}
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
          defaultValue={user.description}
          rows={5}
          placeholder="Tell us about your dog and yourself"
          className="w-full border border-gray-300 p-2 rounded"
        />
      </div>

      {/* File Upload (optional) */}
      <div>
        <label className="block font-bold mb-1">Profile Image:</label>
      <input type="file" name="userImage" className="text-black" onChange={handleImageChange} />

      </div>

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Save Profile
      </button>
    </form>
    </div>
  )
}

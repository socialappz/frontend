import React, { createContext, useEffect, useState, type ReactNode } from 'react'
import type { IUser } from '../interfaces/user/IUser'
import { axiosPublic } from '../utils/axiosConfig';

export const mainContext = createContext({})

export default function MainProvider({children}: {children : ReactNode}) {

const [notifications, setNotifications] = useState([]);
const [loading,setLoading] = useState<Boolean>(false)
const [user, setUser] = useState<IUser>({
  email: "",
    username: "",
    gender: "",
    language: "",
    dogBreed: "",
    userImage: "",
    availability: {
      dayTime: "",
      weekDay: "",
    },
    description: "",
    location: {
      bottomLeft: [],
      topRight: [],
    },
    favorite: [],
})


  return (
    <mainContext.Provider value={{user, setUser}}>
        {children}
    </mainContext.Provider>
  )
}

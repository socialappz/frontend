import axios from "axios";
let baseUrl = "http://localhost:2000/";

const axiosPublic = axios.create({
    baseURL: baseUrl,
    withCredentials: true,
});

export { axiosPublic };

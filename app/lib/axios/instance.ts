import axios from "axios";

const header = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "cache-control": "no-cache",
  Experies: 0,
};

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: header,
  timeout: 60 * 1000,
});

instance.interceptors.response.use(
  (config) => config,
  (error) => Promise.reject(error),
);

instance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

export default instance;

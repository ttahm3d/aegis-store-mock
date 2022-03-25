import { createContext, useContext, useReducer } from "react";
import axios from "axios";
import { useLocalStorage } from "../../hooks";
import { authReducer, useState } from "./Reducer";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, authDispatch] = useReducer(authReducer, {
    isLoggedIn: false,
    user: {},
  });

  const [userToken, setUserToken] = useLocalStorage("user-token");

  const handleUserLogin = async (loginForm) => {
    const { data } = await axios.post("/api/auth/login", loginForm);
    setUserToken(data.encodedToken);
    authDispatch({
      type: "LOGIN",
      payload: data?.user,
    });
  };

  const loginWithTestCredentials = async () => {
    const { data } = await axios.post("/api/auth/login", {
      email: "testuser@gmail.com",
      password: "testuser",
    });
    setUserToken(data.encodedToken);
    authDispatch({
      type: "LOGIN",
      payload: data?.user,
    });
  };

  const handleUserLogout = async () => {
    authDispatch({
      type: "LOGOUT",
    });
    try {
      localStorage.removeItem("user-token");
    } catch (e) {
      console.error("Could not logout!!");
    }
  };

  const handleUserSignup = async (signupForm) => {
    try {
      const { status, data } = await axios.post("/api/auth/signup", signupForm);
      if (status === 201) {
        authDispatch({
          type: "SIGNUP",
          payload: data?.user,
        });
        navigate("/");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        authDispatch,
        handleUserLogin,
        loginWithTestCredentials,
        handleUserLogout,
        handleUserSignup,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
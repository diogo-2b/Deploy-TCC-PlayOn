/* eslint-disable react/prop-types */
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthProvider";

export default function PrivateRoute({ children }){
  const { token } = useAuthContext();
  return token ? children : <Navigate to="/login" />;
};

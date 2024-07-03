// AccountPage.jsx
import { useContext } from "react";
import { useState } from "react";
import { UserContext } from "../UserContext";
import { Link, Navigate, useParams } from "react-router-dom"; // Assuming you are using React Router
import axios from "axios";
import PlacesPage from "./PlacesPage";
import React from "react";
import AccountNav from "../AccountNav";
export default function   ProfilePage() {
    const[redirect,setRedirect] = useState(null);
    const {ready, user, setUser } = useContext(UserContext);
    let {subpage}= useParams();
    if(subpage === undefined){
      subpage='profile';
    }

    async function logout () {
        axios.post('/logout');
        
        setRedirect('/');
        setUser(null);
    }




    if(!ready) {
        return 'Loading...';
    }

    if (ready && !user && !redirect) {
        return <Navigate to={'/login'} />
    }
    
 
  
  

  
  if(redirect){
    return <Navigate to ={redirect} />
  }
   
    return (
        <div>
            <AccountNav />
            {subpage === 'profile' && (
                <div className="text-center max-w-lg mx-auto">
                Logged in as {user.name} ({user.email})<br />
                <button onClick={logout} className="primary max-w-sm mt-2">Logout</button>
                </div>
            )}
            {subpage === 'places'&&(
              <div>
              
                <PlacesPage />
              </div>
            )}
        </div>
    );
}

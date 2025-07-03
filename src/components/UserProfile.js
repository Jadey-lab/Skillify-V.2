import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./UserProfile.css";
import "../firebase"; // Ensure firebase is initialized

const UserProfile = () => {
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    firstName: "",
    surname: "",
    email: "",
    education: "",
    mobile: "",
    fieldOfStudy: "",
    profileImage: ""
  });

  // Fetch user profile data from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data()); // Display the fetched profile data
        } else {
          console.log("No such document!");
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), profile, { merge: true });
        alert("Profile saved successfully!");
      } catch (error) {
        console.error("Error saving profile: ", error);
        alert("Error saving profile");
      }
    }
  };

  const handleImageUpload = async (e) => {
    if (user) {
      const file = e.target.files[0];
      if (file) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);
        setProfile((prevProfile) => ({ ...prevProfile, profileImage: imageUrl }));
        await setDoc(doc(db, "users", user.uid), { profileImage: imageUrl }, { merge: true });
      }
    }
  };

  return (
    <div className="container rounded bg-white mt-5 mb-5">
      <div className="row">
        <div className="col-md-3 border-right">
          <div className="d-flex flex-column align-items-center text-center p-3 py-5 position-relative">
            <img
              className="rounded-circle mt-5 profile-image"
              width="150px"
              src={profile.profileImage || "https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"}
              alt="Profile"
            />
            <label className="upload-button" htmlFor="file-upload">+</label>
            <input type="file" id="file-upload" style={{ display: "none" }} accept="image/*" onChange={handleImageUpload} />
            <span className="font-weight-bold">{profile.firstName} {profile.surname}</span>
            <span className="text-black-50">{profile.email}</span>
          </div>
        </div>
        <div className="col-md-5 border-right">
          <div className="p-3 py-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="text-right">Profile Settings</h4>
            </div>
            <div className="row mt-2">
              <div className="col-md-6">
                <label className="labels">Name</label>
                <input type="text" className="form-control" placeholder="first name" name="firstName" value={profile.firstName} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="labels">Surname</label>
                <input type="text" className="form-control" placeholder="surname" name="surname" value={profile.surname} onChange={handleChange} />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col-md-12">
                <label className="labels">Mobile Number</label>
                <input type="text" className="form-control" placeholder="enter phone number" name="mobile" value={profile.mobile} onChange={handleChange} />
              </div>
              <div className="col-md-12">
                <label className="labels">Email ID</label>
                <input type="text" className="form-control" placeholder="enter email id" name="email" value={profile.email} onChange={handleChange} />
              </div>
              <div className="col-md-12">
                <label className="labels">Institution</label>
                <input type="text" className="form-control" placeholder="education" name="education" value={profile.education} onChange={handleChange} />
              </div>
              <div className="col-md-12">
                <label className="labels">Field of Study</label>
                <input type="text" className="form-control" placeholder="field of study" name="fieldOfStudy" value={profile.fieldOfStudy} onChange={handleChange} />
              </div>
            </div>
            <div className="mt-5 text-center">
              <button className="btn btn-primary profile-button" type="button" onClick={saveProfile}>Save Profile</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Chart } from "react-google-charts";
import { API_URL } from "../ApiConfig";
import { NavLink } from 'react-router-dom';
import { Eye, PencilLine } from "lucide-react";
const UserData = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [designeeData, setDesigneeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deathDate, setDeathDate] = useState("");
  const [userId, setUserId] = useState(null);
  const [folderSize, setFolderSize] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [active, setActive] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [planTime, setPlanTime] = useState("");
  const [message, setMessage] = useState("");
  const [showPopup1, setShowPopup1] = useState(false);
  const [showHeritagePopup, setShowHeritagePopup] = useState(false);
  const [customStorage, setCustomStorage] = useState("");
  const [customGoogleDrive, setCustomGoogleDrive] = useState(false);
  const [customVoiceMemo, setCustomVoiceMemo] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [planname, setPlanname] = useState("");
  const [showfeaturesPopup, setshowfeaturesPopup] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  useEffect(() => {
    if (showfeaturesPopup) {
      fetchSubscriptionFeatures();
    }
  }, [showfeaturesPopup]);

  const fetchSubscriptionFeatures = async () => {
    console.log("user_id", userId);
    console.log("membership_id", selectedMembershipId);
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/admin/get-custom-subscription-features`, {
        user_id: userId,
        membership_id: selectedMembershipId,
      });

      if (response.status === 200) {
        setSelectedSubscription(response.data.data);
      }
    } catch (err) {
      setError("Failed to load subscription details");
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionChange = (id, name) => {
    setSubscriptionId(id);
    if (name === "Heritage (Enterprise)") {
      // setShowHeritagePopup(true);
      // setShowPopup(false);

      setSubscriptionId(id);
      setPlanname(name);

      // setPlanTime("");
    } else {
      setPlanname(name);
      setShowPopup(true);
      setShowHeritagePopup(false);
    }
  };

  const clear = () => {
    setSubscriptionId(null);
    setCustomGoogleDrive(null);
    setCustomVoiceMemo(null);
    setCustomStorage(null);
    setCustomStorage(null);
    setCustomStorage(null);
    handleSubscriptionChange(null);
    setShowHeritagePopup(null);
    showPopup(true);
  }









  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/get-subscriptions`);
        setSubscriptions(response.data);
        console.log("Fetched Subscriptions:", response.data); // Log response data instead of state
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    fetchSubscriptions(); // Call the function inside useEffect
  }, []); // Dependency array remains empty to run once on mount




  const handleShowPopup = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };



  const handleCustomSubmit = async () => {
    console.log("User ID:", userId);
    console.log("Membership ID:", selectedMembershipId);
    console.log("Storage:", customStorage);
    console.log("Google Drive/Dropbox:", customGoogleDrive);
    console.log("Voice Memo:", customVoiceMemo);

    if (!userId || !selectedMembershipId || !customStorage) {
      alert("Please enter all required details.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/admin/add-custom-subscription`, {
        user_id: id,
        membership_id: selectedMembershipId,
        storage: customStorage,
        googledrive_dropbox: customGoogleDrive ?? false,
        voice_memo: customVoiceMemo ?? false,
      });

      if (response.status === 201) {
        alert("New Heritage Plan added successfully");
      } else if (response.status === 200) {
        alert("Heritage Plan updated successfully");
      }
      else {
        console.log(response.data.error);
      }

      setShowHeritagePopup(false);
      fetchUserData();

      setCustomStorage("");
      setCustomGoogleDrive(false);
      setCustomVoiceMemo(false);

    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update Heritage Plan");
    }
  };



  const handleSave = async () => {
    if (!deathDate) {
      console.log("Death date is required.");
      return;
    }
    console.log("helloooo death date", deathDate);
    console.log("helloooo email", userData.email);
    setLoading(true);
    setError("");
    try {
      const response = await axios.post(`${API_URL}/admin/update-death-date`, {
        email: userData.email,
        deathDate,
      });
      console.log("Response:", response.data);
      setIsEditing(false);
      fetchUserData();

    } catch (err) {
      console.error("Error updating death date:", err);
      // setError("Failed to update death date.");
    }
    setLoading(false);
  };

  const AddMembership = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/auth/get-folder-size?id=${id}`
      );
      setUserData(response.data.user);

      console.log("all data", response.data.user);
    } catch (err) {
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subscriptionId || !planTime) {
      alert("Please select a subscription and plan time.");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/admin/admin-add-membership`, {
        email: userData.email,
        subscription_id: subscriptionId,
        planTime: planTime === "Monthly" ? "monthly" : "yearly",
      });

      if (response.status === 200) {
        alert("Membership added successfully");
        setShowPopup(false);
        fetchUserData();
      } else {
        console.log(response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to add membership");
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchFolderSize = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/get-folder-size?id=${id}`);
        console.log("API Response:", response.data.totalSizeKB);

        const usedMB = parseFloat((response.data.totalSizeKB || 0) / 1024);
        const totalMB = 20 * 1024; // 20 GB in MB
        const remainingMB = totalMB - usedMB;

        console.log("usedMB", usedMB);
        console.log("totalMB", totalMB);
        console.log("remainingMB", remainingMB);

        setFolderSize({ usedMB, remainingMB });
      } catch (err) {
        console.error("Error fetching folder size:", err);
        setFolderSize({ usedMB: 0, remainingMB: 20 * 1024 }); // Default: 20GB available
      }
    };

    fetchFolderSize();
  }, [id]);

  const data = [
    ["Storage", "Size (MB)"],
    ["Used", folderSize?.usedMB || 0],
    ["Available", folderSize?.remainingMB || 0],
  ];


  const options = {
    title: "Folder Size Distribution",
    is3D: true,
  };

  const fetchUserData = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/admin/get-user-data?id=${id}`
      );
      console.log("response", response);
      setUserData(response.data.user);
      setDesigneeData(response.data.designees);
      console.log("all data both designee and user", response.data);
      console.log("all data", response.data.user);
      console.log("user id ", response.data.user._id);

    } catch (err) {
      console.log("Failed to fetch user data");
      setUserData("");
      setDesigneeData("");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUserData();
  }, [id]);


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-lg">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        {error}
      </div>
    );



  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8); // Generates an 8-character random string
  };

  const handleChangePassword = async () => {
    const newPassword = generateRandomPassword();
    setGeneratedPassword(newPassword);
    console.log("newPassword", newPassword);
    console.log("userData.email", userData.email);
    setShowPopup1(true);

    try {
      const response = await fetch(`${API_URL}/admin/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email, newPassword }), // FIXED: Changed "password" to "newPassword"
      });

      if (!response.ok) {
        throw new Error("Failed to update password");
      }
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <>
      <div className="md:flex hidden flex-col max-h-[95vh] overflow-y-scroll p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900  text-white p-8 rounded-lg shadow-lg mb-6 text-center ">
          <h2 className="text-4xl font-bold">User Profile</h2>
          <p className="text-gray-300">User ID: {id}</p>
        </div>
        {/* User Profile & Main Info */}
        <div className="w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Profile Card */}
          <div className="bg-white shadow-lg rounded-xl p-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mb-4"></div>
            <h3 className="text-2xl font-semibold text-gray-800">{userData.username || "N/A"}</h3>
            <p className="text-gray-500">{userData.email || "N/A"}</p>
            <span className="mt-2 px-4 py-1 text-sm font-medium rounded-full text-white bg-blue-500">
              {userData.roles?.[0]?.roleName || "User"}
            </span>
            <div className="bg-white shadow-lg rounded-xl p-6  w-full">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Personal Info</h3>
              <div className="text-gray-700 space-y-3 mt-10">
                <p><strong>Phone:</strong> {userData.phoneNumber || "N/A"}</p>
                <p><strong>Address:</strong> {userData.homeAddress || "N/A"}</p>
                <p><strong>Death Date:</strong> {isEditing ? (
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="border p-1 rounded"
                  />
                ) : (
                  userData.deathDate ? userData.deathDate.split("T")[0] : "N/A"
                )}</p>
              </div>
              {isEditing ? (
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Change Password
                  </button>
                </div>
              )}
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {showPopup1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Generated Password</h3>
                    <div className="bg-gray-100 p-3 rounded-md text-gray-900 font-mono text-lg">
                      {generatedPassword}
                    </div>
                    <button
                      onClick={() => setShowPopup1(false)}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
          <div className="rounded-xl z-10">
            <div className="flex justify-between items-center p-6  top-0 bg-white shadow-md border-b ">
              <h3 className="text-xl font-semibold text-gray-800">Storage Usage</h3>

            </div>
            <Chart chartType="PieChart" data={data} options={options} width={"100%"} height={"500px"} />
            {/* Personal Details */}
          </div>

          {/* Cloud Storage */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Cloud Storage</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between  p-3 rounded-lg">
                <strong>Dropbox:</strong>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${userData.dropbox?.[0]?.connected
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                    }`}
                >
                  {userData.dropbox?.[0]?.connected ? "Connected" : "Not Connected"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg">
                <strong>Google Drive:</strong>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${userData.googleDrive?.[0]?.connected
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                    }`}
                >
                  {userData.googleDrive?.[0]?.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6">Nominees</h3>
            <div className="bg-white shadow-lg rounded-xl p-4 w-full mt-4">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : designeeData.length > 0 ? (
                <ul className="grid grid-cols-2 gap-4">
                  {designeeData.map((designee, index) => (
                    <li key={index} className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow-md">
                      <p className="font-semibold">{designee.name || "N/A"}</p>
                      <p className="text-sm text-gray-600">{designee.email || "N/A"}</p>
                      <p className="text-sm text-gray-600">{designee.phone_number || "N/A"}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No designees found.</p>
              )}
            </div>
          </div>

          {/* Membership Plans */}
          <div className="bg-white shadow-xl rounded-xl max-h-[80vh]  ">
            {/* Header */}
            <div className="flex justify-between items-center p-6  top-0 bg-white shadow-md border-b ">
              <h3 className="text-xl font-semibold text-gray-800">Membership Statusssssssss</h3>
              <span className={`px-3 py-1  rounded-full text-sm font-semibold text-white ${userData.activeMembership ? "bg-green-500" : "bg-red-500"}`}>
                {userData.activeMembership ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Membership List */}
            {userData.memberships?.length > 0 ? (
  <div className="space-y-4 p-4 h-96 overflow-y-auto">
    {userData.memberships
      .slice()
      .sort((a, b) => new Date(b.buyingDate) - new Date(a.buyingDate)) // Sort in descending order
      .map((membership) => {
        const subscription = membership.subscription_id; // Directly access subscription details
        const buyingDate = membership.buyingDate ? new Date(membership.buyingDate) : null;
        const expiryDate = membership.expiryDate ? new Date(membership.expiryDate) : null;

        return (
          <div key={membership._id} className="bg-gray-50 p-4 rounded-lg shadow-sm border">
            <p className="flex justify-between gap-x-2 w-full">
              <button></button>
              <button></button>
              <button></button>
              {subscription?.subscription_name === "Heritage (Enterprise)" && (
                <>
                  <button
                    className="ml-72 p-2 bg-blue-500 text-white rounded"
                    onClick={() => {
                      setSelectedMembershipId(membership._id);
                      setUserId(userData._id);
                      setShowHeritagePopup(true);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="p-2 bg-blue-500 text-white rounded"
                    onClick={() => {
                      setSelectedMembershipId(membership._id);
                      setUserId(userData._id);
                      setshowfeaturesPopup(true);
                    }}
                  >
                    View Features
                  </button>
                </>
              )}
            </p>
            <p className="text-gray-700">
              <strong>Subscription Name:</strong> {subscription?.subscription_name || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Buying Date:</strong> {buyingDate ? buyingDate.toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Plan Time:</strong> {membership.planTime || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Expiry Date:</strong> {expiryDate ? expiryDate.toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Storage:</strong> {subscription?.features?.storage || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Encryption:</strong> {subscription?.features?.encryption || "N/A"}
            </p>
          </div>
        );
      })}
  </div>
) : (
  <p className="text-center p-4 text-gray-500">No memberships found.</p>
)}




            {/* Edit Button */}
            <div className="flex justify-end p-4  bottom-0 bg-white shadow-md border-t">
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleShowPopup}>
                Edit Membership
              </button>

            </div>

            {showPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-semibold">Select a Subscription</h2>

                  {/* Subscription List */}
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {subscriptions.map((sub) => (
                      <label key={sub._id} className="flex items-center space-x-2 p-2 border rounded">
                        <input
                          type="radio"
                          name="subscription"
                          value={sub._id}
                          checked={subscriptionId === sub._id}
                          onChange={() => handleSubscriptionChange(sub._id, sub.subscription_name)}
                        />
                        <div>
                          <p className="font-semibold">{sub.subscription_name}</p>
                        </div>
                      </label>
                    ))}
                  </div>


                  {/* Plan Time Selection */}
                  <div className="mt-4">
                    <label className="block text-gray-700">Plan Time</label>
                    <select
                      value={planTime}
                      onChange={(e) => setPlanTime(e.target.value)}
                      className="border rounded p-2 w-full"
                    >
                      <option value="">Select Plan</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                      {planname === "Heritage (Enterprise)" && (
                        <option value="Custom">Custom</option>
                      )}
                    </select>
                  </div>


                  {planTime === "Custom" && (
                    <div className="mt-4">
                      <label className="block text-gray-700">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded p-2 w-full"
                      />
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => setShowPopup(false)} className="bg-gray-300 px-4 py-2 rounded">
                      Cancel
                    </button>
                    <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
                      Save
                    </button>

                  </div>
                </div>
              </div>
            )}
            {showHeritagePopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-semibold">Custom Heritage Plan</h2>

                  <div className="mt-4">
                    <label className="block text-gray-700">Storage (GB)</label>
                    <input
                      type="number"
                      value={customStorage}
                      onChange={(e) => setCustomStorage(e.target.value)}
                      className="border rounded p-2 w-full"
                    />
                  </div>

                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={customGoogleDrive}
                      onChange={() => setCustomGoogleDrive(!customGoogleDrive)}
                      className="mr-2"
                    />
                    <label>Include Google Drive / Dropbox</label>
                  </div>

                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={customVoiceMemo}
                      onChange={() => setCustomVoiceMemo(!customVoiceMemo)}
                      className="mr-2"
                    />
                    <label>Include Voice Memo</label>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => {
                      setShowHeritagePopup(false);
                      setCustomStorage("");
                      setCustomGoogleDrive(false);
                      setCustomVoiceMemo(false);
                    }} className="bg-gray-300 px-4 py-2 rounded">
                      Cancel
                    </button>
                    <button onClick={handleCustomSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}




            {showfeaturesPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex z-50 justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-semibold">Custom Heritage Plan</h2>

                  {loading ? (
                    <p className="text-gray-700 mt-4">Loading...</p>
                  ) : error ? (
                    <p className="text-red-500 mt-4">{error}</p>
                  ) : selectedSubscription ? (
                    <>
                      <div className="mt-4">
                        <p className="text-gray-700"><strong>Storage (GB):</strong> {selectedSubscription.storage}</p>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-700">
                          <strong>Google Drive / Dropbox:</strong> {selectedSubscription.googledrive_dropbox ? "Enabled" : "Disabled"}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-700">
                          <strong>Voice Memo:</strong> {selectedSubscription.voice_memo ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-700 mt-4">No subscription found.</p>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setshowfeaturesPopup(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Nominees */}

        </div>





      </div>

      <div className="flex md:hidden  flex-col max-h-[95vh] overflow-y-scroll">
        {/* Header */}
        <div className="bg-gradient-to-r fixed z-30 w-full from-gray-800 to-gray-900  text-white p-2 rounded-lg shadow-lg mb-6 text-center ">
          <h2 className="text-4xl font-bold mb-4">{userData.username || "N/A"}</h2>
          <p className="text-gray-300">User ID: {id}</p>
        </div>
        {/* User Profile & Main Info */}
        <div className="mt-28 w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Profile Card */}
          <div className=" flex flex-col p-2">
            <div className="flex space-x-4 items-center">
              <div className="w-20 h-20 bg-gray-300 rounded-full mb-4"></div>

              <div className="flex flex-col space-y-2 mb-4">
                <h3 className="text-2xl font-semibold text-gray-800">{userData.username || "N/A"}</h3>
                <p className="text-gray-600">{userData.email || "N/A"}</p>
                <div>
                  <span className="mt-2 px-4 py-1 text-sm font-medium rounded-full text-white bg-blue-500">
                    {userData.roles?.[0]?.roleName || "User"}
                  </span>
                </div>
              </div>
            </div>



            <div className="bg-white shadow-lg rounded-xl p-6  w-full">
              <h3 className="text-2xl font-semibold text-gray-800 text-center">Personal Info</h3>
              <div className="text-gray-700 space-y-3 mt-5">
                <p><strong>Phone:</strong> {userData.phoneNumber || "N/A"}</p>
                <p><strong>Address:</strong> {userData.homeAddress || "N/A"}</p>
                <p><strong>Death Date:</strong> {isEditing ? (
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="border p-1 rounded"
                  />
                ) : (
                  userData.deathDate ? userData.deathDate.split("T")[0] : "N/A"
                )}</p>
              </div>
              {isEditing ? (
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 px-4 py-2 rounded"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleChangePassword}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                  >
                    Change Password
                  </button>
                </div>
              )}
              {error && <p className="text-red-500 mt-2">{error}</p>}
              {showPopup1 && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Generated Password</h3>
                    <div className="bg-gray-100 p-3 rounded-md text-gray-900 font-mono text-lg">
                      {generatedPassword}
                    </div>
                    <button
                      onClick={() => setShowPopup1(false)}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
          <div className="rounded-xl z-10">
            <div className="flex justify-between items-center p-3  top-0 bg-white ">
              <span className="text-2xl font-semibold text-gray-800">Storage Usage</span>

            </div>
            <div className="p-2 rounded-lg w-full h-[200px] overflow-hidden">
              <Chart
                chartType="PieChart"
                data={data}
                options={{

                  chartArea: { width: "90%", height: "90%" }, 
                  legend: { position: "none" },  
                }}
                width="100%"
                height="100%"
              />
            </div>

            {/* Personal Details */}
          </div>

          {/* Cloud Storage */}
          <div className="bg-white shadow-lg rounded-xl p-3">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Cloud Storage</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between  p-3 rounded-lg">
                <strong>Dropbox:</strong>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${userData.dropbox?.[0]?.connected
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                    }`}
                >
                  {userData.dropbox?.[0]?.connected ? "Connected" : "Not Connected"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg">
                <strong>Google Drive:</strong>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${userData.googleDrive?.[0]?.connected
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                    }`}
                >
                  {userData.googleDrive?.[0]?.connected ? "Connected" : "Not Connected"}
                </span>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6">Nominees</h3>
            <div className="bg-white  p-2 border-b border-t w-full mt-4">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : designeeData.length > 0 ? (
                <ul className="grid grid-cols-2 gap-4">
                  {designeeData.map((designee, index) => (
                    <li key={index} className="">
                      <p className="font-semibold">{designee.name || "N/A"}</p>
                      <p className="text-sm text-gray-600">{designee.email || "N/A"}</p>
                      <p className="text-sm text-gray-600">{designee.phone_number || "N/A"}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm p-2 text-center">No designees found.</p>
              )}
            </div>
          </div>

          {/* Membership Plans */}
          <div className="bg-white shadow-xl rounded-xl max-h-[80vh]  ">
            {/* Header */}
            <div className="flex justify-between items-center p-6  top-0 bg-white border-b ">
              <h3 className="text-xl font-semibold text-gray-800">Membership Status</h3>
              <span className={`px-3 py-1  rounded-full text-sm font-semibold text-white ${userData.activeMembership ? "bg-green-500" : "bg-red-500"}`}>
                {userData.activeMembership ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Membership List */}
            {userData.memberships?.length > 0 ? (
  <div className="space-y-4 p-4 h-96 overflow-y-auto">
    {userData.memberships
      .slice()
      .sort((a, b) => new Date(b.buyingDate) - new Date(a.buyingDate)) // Sort in descending order
      .map((membership) => {
        const subscription = membership.subscription_id; // Directly access subscription details
        const buyingDate = membership.buyingDate ? new Date(membership.buyingDate) : null;
        const expiryDate = membership.expiryDate ? new Date(membership.expiryDate) : null;

        return (
          <div key={membership._id} className="bg-gray-50 p-4 rounded-lg shadow-sm border">
            <p className="flex justify-between gap-x-2 w-full">
              <div></div>

              {subscription?.subscription_name === "Heritage (Enterprise)" && (
                <>
                  <div className="space-x-2">
                    <button
                      className=""
                      onClick={() => {
                        setSelectedMembershipId(membership._id);
                        setUserId(userData._id);
                        setShowHeritagePopup(true);
                      }}
                    >
                      <PencilLine className="text-gray-500" />
                    </button>
                    <button
                      className=""
                      onClick={() => {
                        setSelectedMembershipId(membership._id);
                        setUserId(userData._id);
                        setshowfeaturesPopup(true);
                      }}
                    >
                      <Eye className="text-blue-600" />
                    </button>
                  </div>
                </>
              )}
            </p>
            <p className="text-gray-700">
              <strong>Subscription Name:</strong> {subscription?.subscription_name || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Buying Date:</strong> {buyingDate ? buyingDate.toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Plan Time:</strong> {membership.planTime || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Expiry Date:</strong> {expiryDate ? expiryDate.toLocaleDateString() : "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Storage:</strong> {subscription?.features?.storage || "N/A"}
            </p>
            <p className="text-gray-700">
              <strong>Encryption:</strong> {subscription?.features?.encryption || "N/A"}
            </p>
          </div>
        );
      })}
  </div>
) : (
  <p className="text-center p-4 text-sm text-gray-500">No memberships found.</p>
)}




            {/* Edit Button */}
            <div className="flex justify-end p-4  bottom-0 bg-white shadow-md border-t">
              <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleShowPopup}>
                Edit Membership
              </button>

            </div>

            {showPopup && (
              <div className="fixed p-2 inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-semibold">Select a Subscription</h2>

                  {/* Subscription List */}
                  <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                    {subscriptions.map((sub) => (
                      <label key={sub._id} className="flex items-center space-x-2 p-2 border rounded">
                        <input
                          type="radio"
                          name="subscription"
                          value={sub._id}
                          checked={subscriptionId === sub._id}
                          onChange={() => handleSubscriptionChange(sub._id, sub.subscription_name)}
                        />
                        <div>
                          <p className="font-semibold">{sub.subscription_name}</p>
                        </div>
                      </label>
                    ))}
                  </div>


                  {/* Plan Time Selection */}
                  <div className="mt-4">
                    <label className="block text-gray-700">Plan Time</label>
                    <select
                      value={planTime}
                      onChange={(e) => setPlanTime(e.target.value)}
                      className="border rounded p-2 w-full"
                    >
                      <option value="">Select Plan</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                      {planname === "Heritage (Enterprise)" && (
                        <option value="Custom">Custom</option>
                      )}
                    </select>
                  </div>


                  {planTime === "Custom" && (
                    <div className="mt-4">
                      <label className="block text-gray-700">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border rounded p-2 w-full"
                      />
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => setShowPopup(false)} className="bg-gray-300 px-4 py-2 rounded">
                      Cancel
                    </button>
                    <button onClick={handleSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
                      Save
                    </button>

                  </div>
                </div>
              </div>
            )}
            {showHeritagePopup && (
              <div className="fixed inset-0 p-2 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-semibold">Custom Heritage Plan</h2>

                  <div className="mt-4">
                    <label className="block text-gray-700">Storage (GB)</label>
                    <input
                      type="number"
                      value={customStorage}
                      onChange={(e) => setCustomStorage(e.target.value)}
                      className="border rounded p-2 w-full"
                    />
                  </div>

                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={customGoogleDrive}
                      onChange={() => setCustomGoogleDrive(!customGoogleDrive)}
                      className="mr-2"
                    />
                    <label>Include Google Drive / Dropbox</label>
                  </div>

                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={customVoiceMemo}
                      onChange={() => setCustomVoiceMemo(!customVoiceMemo)}
                      className="mr-2"
                    />
                    <label>Include Voice Memo</label>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={() => {
                      setShowHeritagePopup(false);
                      setCustomStorage("");
                      setCustomGoogleDrive(false);
                      setCustomVoiceMemo(false);
                    }} className="bg-gray-300 px-4 py-2 rounded">
                      Cancel
                    </button>
                    <button onClick={handleCustomSubmit} className="bg-green-500 text-white px-4 py-2 rounded">
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}




            {showfeaturesPopup && (
              <div className="fixed inset-0 p-2 bg-black bg-opacity-50 flex z-50 justify-center items-center">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-xl font-semibold">Custom Heritage Plan</h2>

                  {loading ? (
                    <p className="text-gray-700 mt-4">Loading...</p>
                  ) : error ? (
                    <p className="text-red-500 mt-4">{error}</p>
                  ) : selectedSubscription ? (
                    <>
                      <div className="mt-4">
                        <p className="text-gray-700"><strong>Storage (GB):</strong> {selectedSubscription.storage}</p>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-700">
                          <strong>Google Drive / Dropbox:</strong> {selectedSubscription.googledrive_dropbox ? "Enabled" : "Disabled"}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="text-gray-700">
                          <strong>Voice Memo:</strong> {selectedSubscription.voice_memo ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-700 mt-4">No subscription found.</p>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setshowfeaturesPopup(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>


          {/* Nominees */}

        </div>





      </div>

    </>
  );
};

export default UserData;

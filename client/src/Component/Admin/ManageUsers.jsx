import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "./utiles/ApiConfig";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/auth/get-all-users-data`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUsers(data.user);
        }
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phoneNumber && user.phoneNumber.includes(search));

    if (!startDate || !endDate) return matchesSearch;

    if (user.memberships.length > 0 && user.memberships[0].expiryDate) {
      const expiryDate = new Date(user.memberships[0].expiryDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return matchesSearch && expiryDate >= start && expiryDate <= end;
    }

    return false;
  });

  return (
    <div className="p-3 w-full">
      <div className="w-full mx-auto rounded-lg p-2 mt-2">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border  border-gray-300 text-sm md:text-normal rounded-md mb-4 outline-none"
        />
        <div className="flex gap-4 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 text-sm md:text-normal rounded-md"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 text-sm md:text-normal rounded-md"
          />
        </div>
        <div className="max-h-[70vh] overflow-y-scroll md:flex hidden">
          <table className="w-full border-collapse bg-white shadow-md rounded-md">
            <thead>
              <tr className="bg-blue-500 text-white sticky top-0">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone Number</th>
                <th className="p-3 text-left">Membership Name</th>
                <th className="p-3 text-left">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-gray-100">
                    <td className="p-3">
                      <Link to={`/admin/ManageUsers/user/${user._id}`} className="text-blue-500 hover:underline">
                        {user.username}
                      </Link>
                    </td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.phoneNumber || "N/A"}</td>
                    <td className="p-3">
                      {user.memberships.length > 0
                        ? user.memberships[0].subscription_id
                        : "No Membership"}
                    </td>
                    <td className="p-3">
                      {user.memberships.length > 0 && user.memberships[0].expiryDate
                        ? new Date(user.memberships[0].expiryDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-3 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>


      </div>
      <div className="md:hidden inline">
        <div className="space-y-2 max-h-[70vh] overflow-y-scroll">
          {filteredUsers.length > 0 ? (
            <>
              {filteredUsers.map((user) => (
                <div key={user._id} className="border rounded p-2 h-24 flex justify-between">
                  <div className="flex flex-col justify-between w-24">
                    <p className="p-2 rounded min-w-10 bg-gray-100">
                      <Link to={`/ManageUsers/user/${user._id}`} className="text-blue-600">
                        {user.username.length > 10 ? user.username.slice(0, 7) + "..." : user.username}
                      </Link>

                    </p>

                    <span className="text-sm text-gray-600">
                      {user.email.length > 10 ? user.email.slice(0, 23) + "..." : user.email}
                    </span>

                  </div>
                  <div className="flex flex-col justify-between">
                    <h1 className="p-2 rounded">
                      {user.memberships.length > 0
                        ? user.memberships[0].subscription_id.length > 10
                          ? user.memberships[0].subscription_id.slice(0, 14) + "..."
                          : user.memberships[0].subscription_id
                        : "No Membership"}
                    </h1>

                    <h1 className="text-sm text-gray-600 text-end">
                      {user.memberships.length > 0 && user.memberships[0].expiryDate
                        ? new Date(user.memberships[0].expiryDate).toLocaleDateString()
                        : "N/A"}
                    </h1>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div>
              <p>No user Found</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ManageUsers;

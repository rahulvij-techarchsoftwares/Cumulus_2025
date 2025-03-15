import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "./utiles/ApiConfig";
import { Check, Eye, FilePenLine, Trash2, X } from "lucide-react";

function CumulusDefault() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingFileId, setEditingFileId] = useState(null);
  const [newFileName, setNewFileName] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/default/default-files`);
      setFiles(response.data.files || []);
    } catch (err) {
      console.error("Error fetching files:", err);
      setError("Failed to fetch files. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    const token = localStorage.getItem("token");
    e.preventDefault();
    if (!file || !fileName.trim()) {
      setError("Both file and file name are required.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("file_name", fileName);

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/api/default/default-file-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        Authorization: `Bearer ${token}`,  
      });
      setFile(null);
      setFileName("");
      e.target.reset(); // Reset the form
      fetchFiles();
    } catch (err) {
      console.error("Error uploading file:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (fileId) => {
    console.log("Your file ID:", fileId);
    console.log("New file name:", newFileName);

    if (!newFileName.trim()) {
        setError("New file name is required.");
        return;
    }

    const renameUrl = `${API_URL}/api/default/rename-default-file/${fileId}`;
    console.log("Renaming API URL:", renameUrl);

    try {
        const response = await axios.put(renameUrl, { new_file_name: newFileName.trim() });
        console.log("Rename success:", response.data);
        setEditingFileId(null);
        fetchFiles(); // Refresh file list
    } catch (err) {
        console.error("Error renaming file:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Rename failed. Please try again.");
    }
};



  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axios.delete(`${API_URL}/api/default/delete-default-file/${fileId}`);
      fetchFiles();
    } catch (err) {
      console.error("Error deleting file:", err);
      setError("Delete failed. Please try again.");
    }
  };

  return (
    <div className="w-full mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4 mt-2">Upload File</h2>
      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Enter file name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          required
        />
        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full px-4 py-2 text-white rounded-md transition ${
            loading || !file ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <h2 className="text-lg font-semibold mt-6">Existing Files</h2>
      {files.length === 0 ? (
        <p className="text-gray-600">No files available</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {files.map((file) => (
            <li key={file._id} className="p-2 bg-white rounded-md shadow-sm flex justify-between items-center">
              <div>
                {editingFileId === file._id ? (
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="border-b-2 border-blue-500 p-1 outline-none"
                  />
                ) : (
                  <a
                    href={file.aws_file_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {file.file_name}
                  </a>
                )}
                <h1 className="text-sm text-gray-600">
                  (Uploaded on: {new Date(file.date_of_upload).toLocaleDateString()})
                </h1>
              </div>
              <div className="flex space-x-2">
                {editingFileId === file._id ? (
                  <>
                    <button
                      onClick={() => handleRename(file._id)}
                      className="px-2 py-1 text-sm bg-green-500 text-white md:inline hidden rounded-md hover:bg-green-600"
                    >
                      Save
                    </button>
                <button 
                 onClick={() => handleRename(file._id)}
                className='inline md:hidden'><Check className='text-green-500'/></button>

                    <button
                      onClick={() => setEditingFileId(null)}
                      className="px-2 py-1 text-sm bg-gray-500 text-white md:inline hidden  rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button 
                     onClick={() => setEditingFileId(null)}
                    className='inline md:hidden'><X className='text-red-500'/></button>
                  </>
                ) : (
                  <>
                  <button
                    onClick={() => { setEditingFileId(file._id); setNewFileName(file.file_name); }}
                    className="px-2 py-1 text-sm bg-yellow-500 text-white md:inline hidden  rounded-md hover:bg-yellow-600"
                  >
                    Rename
                  </button>
                  <button 
                   onClick={() => { setEditingFileId(file._id); setNewFileName(file.file_name); }}
                  className='inline md:hidden'><FilePenLine className='text-blue-500'/></button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(file._id)}
                  className="px-2 py-1 text-sm bg-red-500 text-white md:inline hidden  rounded-md hover:bg-red-600"
                >
                  Delete
                </button>
                <button 
                 onClick={() => handleDelete(file._id)}
                className='inline md:hidden'><Trash2 className='text-red-500'/></button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CumulusDefault;

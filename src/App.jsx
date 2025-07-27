import { useEffect, useState, useCallback } from "react";
import { CloudUpload, Menu } from "lucide-react";

function App() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const fetchFolders = async () => {
    try {
      const response = await fetch("http://localhost:5000/folders");
      const data = await response.json();
      setFolders(data.folders);
    } catch (err) {
      console.error("Failed to load folders");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    if (!/^[a-zA-Z0-9-_]+$/.test(newFolderName.trim())) {
      setError("Invalid folder name. Use only letters, numbers, - or _");
      return;
    }

    setCreatingFolder(true);
    try {
      const response = await fetch("http://localhost:5000/create-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: newFolderName }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewFolderName("");
        setSuccess("Folder created successfully ✅");
        setError("");
        fetchFolders();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Could not create folder");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setCreatingFolder(false);
    }
  };

  const handleUpload = async () => {
    if (!files.length || !selectedFolder) {
      setError("Please select file(s) and a folder.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", selectedFolder);

        await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
      }
    } catch (err) {
      setError("Upload failed");
    } finally {
      setLoading(false);
      setFiles([]);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 sm:px-6 md:px-12">
      <header className="flex justify-between items-center w-full mb-6">
        <h1 className="text-xl font-semibold text-gray-800">📘 Essay Upload</h1>
        <Menu className="w-6 h-6 text-gray-600" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div
          className={`w-full max-w-md p-6 border-2 border-dashed rounded-xl text-center transition-colors ${dragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300"}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudUpload className="w-20 h-20 text-indigo-700 mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Tap or drag files here to upload</p>

          <input
            type="file"
            id="fileUpload"
            accept="image/*,.pdf"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="hidden"
          />

          <label
            htmlFor="fileUpload"
            className="inline-block mt-4 px-4 py-2 border border-indigo-600 rounded-full text-indigo-600 text-sm font-medium cursor-pointer hover:bg-indigo-50"
          >
            Choose Files
          </label>

          {files.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">{files.length} file(s) selected</p>
          )}
        </div>

        {/* Folder Selection */}
        <div className="w-full max-w-md space-y-2">
          <select
            className="w-full border rounded px-4 py-2 text-sm"
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
          >
            <option value="">-- Select Folder --</option>
            {folders.map((folder, idx) => (
              <option key={idx} value={folder}>{folder}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 border rounded px-4 py-2 text-sm"
            />
            <button
              onClick={handleCreateFolder}
              disabled={creatingFolder}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm disabled:opacity-50"
            >
              {creatingFolder ? "Creating..." : "Create"}
            </button>
          </div>
        </div>

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full max-w-md bg-indigo-700 text-white font-bold py-2 rounded-full hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload!"}
        </button>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </main>
    </div>
  );
}

export default App;

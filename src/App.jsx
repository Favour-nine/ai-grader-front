import { useState, useCallback } from "react";
import { CloudUpload, Menu } from "lucide-react";

function App() {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correctedText, setCorrectedText] = useState("");
  const [error, setError] = useState("");

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select or drop a file.");
      return;
    }

    setLoading(true);
    setError("");
    setCorrectedText("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setCorrectedText(data.correctedText);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 sm:px-6 md:px-12">
      {/* Header */}
      <header className="flex justify-between items-center w-full mb-6">
        <h1 className="text-xl font-semibold text-gray-800">📘 Essay Upload</h1>
        <Menu className="w-6 h-6 text-gray-600" />
      </header>

      {/* Upload Section */}
      <main className="flex-1 flex flex-col items-center justify-center space-y-6">
        <div
          className={`w-full max-w-md p-6 border-2 border-dashed rounded-xl text-center transition-colors
            ${dragActive ? "border-indigo-600 bg-indigo-50" : "border-gray-300"}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <CloudUpload className="w-20 h-20 text-indigo-700 mx-auto" />
          <p className="text-sm text-gray-600 mt-2">Tap or drag files here to upload</p>

          {/* File Input + Label */}
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

          {/* Selected Files Feedback */}
          {files.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 text-left">
              <p className="mb-1 font-medium">{files.length} file(s) selected:</p>
              <ul className="list-disc list-inside">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full max-w-md bg-indigo-700 text-white font-bold py-2 rounded-full hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Uploading..." : "Upload!"}
        </button>

        {/* Error */}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {/* Result */}
        {correctedText && (
          <div className="bg-green-50 border border-green-300 rounded-lg p-4 w-full max-w-md mt-6">
            <h2 className="text-lg font-semibold mb-2">Transcribed Essay</h2>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{correctedText}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

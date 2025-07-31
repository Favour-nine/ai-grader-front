import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import GradeAssessment from "./GradeAssessment";

export default function Grading() {
  const [activeTab, setActiveTab] = useState("create");
  const [folders, setFolders] = useState([]);
  const [rubrics, setRubrics] = useState([]);
  const [form, setForm] = useState({
    name: "",
    folder: "",
    rubric: "",
    description: "",
  });
  const [message, setMessage] = useState("");

  const [rubricModalOpen, setRubricModalOpen] = useState(false);
  const [rubricName, setRubricName] = useState("");
  const [criteria, setCriteria] = useState([{ description: "", score: "" }]);

  useEffect(() => {
    fetch("http://localhost:5000/folders")
      .then((res) => res.json())
      .then((data) => setFolders(data.folders || []))
      .catch(() => console.error("Failed to fetch folders"));

    fetch("http://localhost:5000/rubrics")
      .then((res) => res.json())
      .then((data) => setRubrics(data.rubrics || []))
      .catch(() => console.error("Failed to fetch rubrics"));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setMessage("");
    const res = await fetch("http://localhost:5000/create-assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      setMessage("Assessment created successfully");
      setTimeout(() => setMessage(""), 3000);
      setForm({ name: "", folder: "", rubric: "", description: "" });
    } else {
      setMessage(data.error || "Failed to create assessment");
    }
  };

  const handleCreateRubric = async () => {
    const response = await fetch("http://localhost:5000/create-rubric", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: rubricName,
        criteria,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      setRubricName("");
      setCriteria([{ description: "", score: "" }]);
      setRubricModalOpen(false);
      setRubrics((prev) => [...prev, `${rubricName}.json`]);
    } else {
      alert(data.error || "Rubric creation failed");
    }
  };

  const handleCriterionChange = (index, field, value) => {
    const updated = [...criteria];
    updated[index][field] = value;
    setCriteria(updated);
  };

  const addCriterion = () => {
    setCriteria([...criteria, { description: "", score: "" }]);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Grading Page</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {["create", "grade", "review"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {tab} Assessment
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "create" && (
        <div className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Assessment Name"
            className="w-full border px-4 py-2 rounded"
          />

          <select
            name="folder"
            value={form.folder}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded"
          >
            <option value="">Select Essay Folder</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>

          <div className="flex gap-2 items-center">
            <select
              name="rubric"
              value={form.rubric}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded"
            >
              <option value="">Select Rubric</option>
              {rubrics.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <button
              onClick={() => setRubricModalOpen(true)}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              ➕
            </button>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Assessment Description"
            className="w-full border px-4 py-2 rounded"
          />

          <button
            onClick={handleSubmit}
            className="bg-indigo-700 text-white px-6 py-2 rounded hover:bg-indigo-800"
          >
            Create Assessment
          </button>

          {message && <p className="text-sm mt-2 text-indigo-700">{message}</p>}
        </div>
      )}

      {activeTab === "grade" && <GradeAssessment />}

      {activeTab === "review" && (
        <div className="text-gray-600">Review interface will go here.</div>
      )}

      {/* Modal */}
      {rubricModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Create Rubric</h2>

            <input
              type="text"
              placeholder="Rubric Name"
              value={rubricName}
              onChange={(e) => setRubricName(e.target.value)}
              className="w-full border px-4 py-2 mb-4 rounded text-sm"
            />

            <div className="space-y-3">
              {criteria.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item.description}
                    onChange={(e) =>
                      handleCriterionChange(i, "description", e.target.value)
                    }
                    placeholder="Criterion (e.g. Clarity)"
                    className="flex-1 border px-3 py-2 rounded text-sm"
                  />
                  <input
                    value={item.score}
                    onChange={(e) =>
                      handleCriterionChange(i, "score", e.target.value)
                    }
                    placeholder="Score"
                    className="w-24 border px-3 py-2 rounded text-sm"
                  />
                </div>
              ))}
              <button
                onClick={addCriterion}
                className="text-sm text-indigo-600 hover:underline"
              >
                ➕ Add Criterion
              </button>
            </div>

            <div className="flex justify-end mt-6 gap-3">
              <button
                onClick={() => setRubricModalOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRubric}
                className="px-4 py-2 text-sm bg-indigo-700 text-white rounded hover:bg-indigo-800"
              >
                Save Rubric
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
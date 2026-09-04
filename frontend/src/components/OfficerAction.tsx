/* ─── VANTARA — Officer Action (Light Theme / NIC Standard) ─ */

import { useState } from "react";
import { postOfficerAction } from "../api";
import type { OfficerAction as OfficerActionType } from "../types";

interface OfficerActionProps {
  claimId: string;
  existingActions: OfficerActionType[];
  onActionSubmitted: () => void;
}

const ACTION_TYPES = [
  "Field Verification Ordered",
  "SDLC Hearing Scheduled",
  "DLC Hearing Scheduled",
  "Document Re-verification",
  "Revenue Dept Coordination",
  "Forest Dept Coordination",
  "Joint Survey Ordered",
  "Gram Sabha Re-hearing",
  "Escalated to State Level",
  "Case Closed",
];

const RESOLUTION_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "ESCALATED",
  "DEFERRED",
];

export default function OfficerAction({
  claimId,
  existingActions,
  onActionSubmitted,
}: OfficerActionProps) {
  const [actionType, setActionType] = useState(ACTION_TYPES[0]);
  const [note, setNote] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState(RESOLUTION_STATUSES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setSubmitting(true);
    try {
      await postOfficerAction(claimId, {
        action_type: actionType,
        note: note.trim(),
        resolution_status: resolutionStatus,
      });
      setNote("");
      setShowForm(false);
      onActionSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
          Officer Action Log ({existingActions.length})
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            + Add Action
          </button>
        )}
      </div>

      {/* Action Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4 space-y-3"
        >
          <div>
            <label className="block text-xs text-gray-600 mb-1 font-medium">
              Action Taken
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {ACTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1 font-medium">
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Describe the action taken or observation..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1 font-medium">
              Resolution Status
            </label>
            <select
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              {RESOLUTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submitting || !note.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors shadow-sm"
            >
              {submitting ? "Submitting..." : "Submit Action"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Existing Actions */}
      {existingActions.length > 0 ? (
        <div className="space-y-2">
          {[...existingActions].reverse().map((action) => (
            <div
              key={action.action_id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm text-gray-900 font-medium">
                    {action.action_type}
                  </span>
                  <span
                    className={`text-xs ml-2 px-1.5 py-0.5 rounded font-medium ${
                      action.resolution_status === "RESOLVED"
                        ? "bg-green-100 text-green-800"
                        : action.resolution_status === "ESCALATED"
                        ? "bg-red-100 text-red-800"
                        : action.resolution_status === "IN_PROGRESS"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {action.resolution_status.replace("_", " ")}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(action.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                {action.note}
              </p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-sm text-gray-400 italic">
            No officer actions recorded yet.
          </div>
        )
      )}
    </div>
  );
}

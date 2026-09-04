/* ─── VANTARA — Landing / Role Gateway (NIC Standard) ─────── */

export type UserRole = "sdlc_officer" | "dlc_magistrate" | "state_secretary" | null;

interface LandingProps {
  onRoleSelect: (role: UserRole) => void;
}

const ROLES = [
  {
    id: "sdlc_officer" as const,
    title: "SDLC Field Officer",
    subtitle: "Khunti Sub-Division",
    description: "Resolve incomplete records — missing survey numbers and GPS coordinates. Batch-process field verification manifests for Patwaris and Gram Sabhas.",
    icon: "📋",
    focus: "3,348 Incomplete Records",
    focusColor: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    id: "dlc_magistrate" as const,
    title: "District Magistrate",
    subtitle: "DLC Chairperson — Bastar",
    description: "Enforce FRA statutory deadlines and resolve land record conflicts. Generate Rule 12(2) directives and trigger joint cadastral inspections.",
    icon: "⚖️",
    focus: "3,442 Statutory Violations",
    focusColor: "text-red-700 bg-red-50 border-red-200",
  },
  {
    id: "state_secretary" as const,
    title: "State Tribal Secretary",
    subtitle: "Government of Jharkhand",
    description: "Macro-strategy and resource allocation. Identify systemic suppression, calculate SDLC clearance capacity, and mandate special sittings.",
    icon: "🏛️",
    focus: "9 Systemic Districts",
    focusColor: "text-amber-700 bg-amber-50 border-amber-200",
  },
];

export default function Landing({ onRoleSelect }: LandingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Official Header */}
      <header className="bg-[#1e3a5f] text-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1e3a5f] font-bold text-2xl shadow-sm">
              V
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">VANTARA</h1>
              <p className="text-sm text-blue-200">
                Department of Tribal Affairs — Authorized Access
              </p>
            </div>
          </div>
        </div>
      </header>
      <div className="bg-[#2c5282] text-blue-200 px-6 py-2">
        <div className="max-w-4xl mx-auto text-xs tracking-wider">
          Verified Anomaly Navigation & Tracking for Adivasi Rights Administration
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select Your Role
            </h2>
            <p className="text-gray-500 text-sm max-w-lg mx-auto">
              Each role provides a specialized operational dashboard tailored to your jurisdiction and responsibilities under the Forest Rights Act, 2006.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ROLES.map((role) => (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className="bg-white border-2 border-gray-200 hover:border-blue-400 rounded-xl p-6 text-left transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg group"
              >
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {role.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium mt-0.5">
                  {role.subtitle}
                </p>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                  {role.description}
                </p>
                <div className={`mt-4 inline-block text-xs font-semibold px-3 py-1.5 rounded-full border ${role.focusColor}`}>
                  {role.focus}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          © Ministry of Tribal Affairs, Government of India • Forest Rights Act, 2006
        </p>
      </footer>
    </div>
  );
}

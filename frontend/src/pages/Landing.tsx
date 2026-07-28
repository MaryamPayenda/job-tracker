import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-16 sm:py-32 bg-gradient-to-b from-blue-50/50 to-gray-50">
        <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
          ✨ AI-Powered Job Search
        </span>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6 max-w-3xl leading-tight text-gray-900">
          Track your job search.
          <span className="text-blue-600">
            {" "}
            Generate cover letters with AI.
          </span>
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-xl mb-8 sm:mb-10 leading-relaxed">
          Stop losing track of your applications. Trackly helps you organize
          every application, follow up on time, and generate personalized cover
          letters in seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate("/login")}
            className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-sm w-full sm:w-auto"
          >
            Start for Free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="border border-gray-200 hover:border-gray-300 text-gray-700 px-8 py-3.5 rounded-xl font-semibold transition-colors text-sm w-full sm:w-auto"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest text-center mb-3">
            Features
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
            Everything you need to land your next job
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: "📋",
                title: "Track Everything",
                desc: "Add jobs with status, salary, contact info, interview dates and more in one place.",
              },
              {
                icon: "🤖",
                title: "AI Cover Letters",
                desc: "Generate personalized cover letters in English or German in seconds using Groq AI.",
              },
              {
                icon: "📄",
                title: "Download as PDF",
                desc: "Download professional cover letters as PDFs with your contact info and clickable links.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex gap-4 sm:flex-col sm:gap-0"
              >
                <span className="text-3xl sm:mb-4 shrink-0">
                  {feature.icon}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center">
          {[
            { number: "100%", label: "Free to use" },
            { number: "EN/DE", label: "Bilingual AI" },
            { number: "∞", label: "Applications" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
            >
              <p className="text-2xl sm:text-4xl font-bold text-blue-600 mb-1">
                {stat.number}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:py-24 text-center bg-white border-t border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">
          Ready to organize your job search?
        </h2>
        <p className="text-gray-400 mb-8">
          Free to use. No credit card required.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-sm w-full sm:w-auto"
        >
          Get Started for Free
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-8 py-6 bg-white flex items-center justify-between">
        <Logo size={24} showText={true} />
        <span className="text-gray-400 text-sm">© 2026 Maryam Payenda</span>
      </footer>
    </main>
  );
}

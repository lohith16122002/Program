import { Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section id="hero" className="text-center py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-6">
          <span className="inline-block bg-white text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Powered by GPT + ATS Engine
          </span>
          <h1 className="text-5xl font-bold leading-tight">AI Resume Analyzer</h1>
          <p className="mt-6 text-lg text-blue-100">
            Upload your resume, paste the job description — get an ATS score,
            skill gap analysis, and GPT-powered improvement suggestions in seconds.
          </p>
          <div className="mt-8 flex justify-center gap-4 flex-wrap">
            <Link to="/register" className="bg-white text-blue-700 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition">
              Get Started Free
            </Link>
            <a href="#how-it-works" className="border border-white text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: "📄", title: "Upload Resume", desc: "Upload your PDF resume securely." },
            { icon: "🤖", title: "GPT Analysis", desc: "Real AI reads your resume and the job description." },
            { icon: "📊", title: "ATS Score", desc: "See exactly how well your resume matches the role." },
            { icon: "💡", title: "Smart Suggestions", desc: "Get specific, actionable improvements from GPT." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="shadow-lg rounded-xl p-6 text-center hover:shadow-xl transition">
              <div className="text-4xl mb-3">{icon}</div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gray-100 py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          {[
            { step: "1️⃣", text: "Upload Resume" },
            { step: "2️⃣", text: "Paste Job Description" },
            { step: "3️⃣", text: "AI Analysis" },
            { step: "4️⃣", text: "Get Score & Tips" },
          ].map(({ step, text }) => (
            <div key={text}>
              <div className="text-5xl">{step}</div>
              <p className="mt-4 font-medium">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="text-center py-20 px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to land your next job?</h2>
        <p className="text-gray-600 mb-8">Join thousands of job seekers who improved their resumes with AI.</p>
        <Link to="/register" className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition text-lg font-semibold">
          Start Analyzing Now
        </Link>
      </section>

      <Footer />
    </>
  );
}

export default Home;

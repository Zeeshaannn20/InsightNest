"use client";

import Sidebar from "@/components/Sidebar";

export default function CommunityPage() {
  return (
    <div className="bg-surface text-on-surface flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar variant="student" />

      {/* Main Workspace (3-column layout) */}
      <main className="flex-1 md:ml-sidebar-width flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Left: Community Channels */}
        <section className="hidden md:flex w-64 bg-surface-container-low border-r border-outline-variant/30 flex-col h-full flex-shrink-0">
          <div className="p-6 border-b border-outline-variant/20">
            <h2 className="text-xl font-bold text-primary-container">Community</h2>
            <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span> 2.4k Learners Online
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 ml-2">Channels</p>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                  <span className="text-outline-variant text-lg">#</span> General
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-secondary bg-secondary/10 border-r-4 border-secondary text-left transition-colors">
                  <span className="text-secondary/70 text-lg">#</span> SQL
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                  <span className="text-outline-variant text-lg">#</span> Power BI
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                  <span className="text-outline-variant text-lg">#</span> Python
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface hover:bg-surface-container transition-colors text-left">
                  <span className="text-outline-variant text-lg">#</span> Jobs
                </button>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 ml-2">AI Assistants</p>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-secondary text-left group hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-secondary text-lg group-hover:scale-110 transition-transform">psychology</span> AI Mentor
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-outline-variant/20 bg-surface">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm">AL</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></div>
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Alex Rivera</p>
                <p className="text-xs text-on-surface-variant truncate w-32">Learning SQL</p>
              </div>
            </div>
          </div>
        </section>

        {/* Center: Chat Interface */}
        <section className="flex-1 flex flex-col h-full bg-surface-bright relative">
          
          {/* AI Mentor Banner */}
          <div className="bg-gradient-to-r from-secondary to-on-secondary-container p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 flex-shrink-0 shadow-md relative overflow-hidden z-10">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-3xl">psychology</span>
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">AI Mentor Chatbot</h2>
                <p className="text-white/80 text-sm">Available 24/7 for technical queries and code debugging</p>
              </div>
            </div>
            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded-full font-semibold text-sm transition-colors backdrop-blur-sm relative z-10">
              Escalate to Instructor
            </button>
          </div>

          {/* Messages Canvas */}
          <div className="flex-1 overflow-y-auto chat-scroll p-6 space-y-8 pb-32">
            <div className="flex items-center gap-4 py-4">
              <div className="h-px bg-outline-variant/20 flex-1"></div>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Today, October 24</span>
              <div className="h-px bg-outline-variant/20 flex-1"></div>
            </div>

            {/* User Message */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">AL</div>
              <div className="flex-1 max-w-2xl">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-on-surface text-sm">Alex Rivera</span>
                  <span className="text-xs text-on-surface-variant">10:42 AM</span>
                </div>
                <div className="bg-surface-container rounded-2xl rounded-tl-sm p-5 text-on-surface text-sm leading-relaxed shadow-sm">
                  What is a <span className="font-bold text-secondary">LEFT JOIN</span> and when should I use it over an INNER JOIN?
                </div>
              </div>
            </div>

            {/* AI Response */}
            <div className="flex gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary">psychology</span>
              </div>
              <div className="flex-1 max-w-3xl">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-secondary text-sm">AI Mentor</span>
                  <span className="text-xs text-on-surface-variant">10:43 AM</span>
                </div>
                <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl rounded-tl-sm p-6 shadow-sm">
                  <p className="text-sm text-on-surface leading-relaxed mb-4">
                    Great question, Alex! 
                  </p>
                  <p className="text-sm text-on-surface leading-relaxed mb-4">
                    A <strong className="text-secondary">LEFT JOIN</strong> returns all records from the left table, and the matched records from the right table. The result is 0 records from the right side, if there is no match.
                  </p>
                  
                  <div className="bg-[#1e1e1e] rounded-lg p-4 mb-4 border-l-4 border-secondary overflow-x-auto">
                    <pre className="font-mono text-[13px] text-gray-300">
<span className="text-blue-400">SELECT</span> Students.Name, Enrollments.CourseName
<span className="text-blue-400">FROM</span> Students
<span className="text-pink-400">LEFT JOIN</span> Enrollments
<span className="text-blue-400">ON</span> Students.ID = Enrollments.StudentID;
                    </pre>
                  </div>

                  <h4 className="font-bold text-primary-container text-sm mb-2">Key Differences:</h4>
                  <ul className="list-disc list-inside text-sm text-on-surface-variant space-y-2 mb-6">
                    <li><strong className="text-on-surface">INNER JOIN</strong> only returns rows where there is a match in BOTH tables.</li>
                    <li><strong className="text-on-surface">LEFT JOIN</strong> returns ALL rows from the left table even if there are no matches. The missing right side data will be filled with <span className="text-error font-mono bg-error/10 px-1 rounded">NULL</span>.</li>
                  </ul>

                  <div className="flex items-center gap-2 pt-4 border-t border-outline-variant/20">
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-secondary hover:bg-secondary/10 px-3 py-1.5 rounded-md transition-colors">
                      <span className="material-symbols-outlined text-[16px]">thumb_up</span> Helpful
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-error hover:bg-error/10 px-3 py-1.5 rounded-md transition-colors">
                      <span className="material-symbols-outlined text-[16px]">thumb_down</span>
                    </button>
                    <div className="w-px h-4 bg-outline-variant/30 mx-1"></div>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container px-3 py-1.5 rounded-md transition-colors">
                      <span className="material-symbols-outlined text-[16px]">content_copy</span> Copy Code
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Input Box */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface-bright via-surface-bright to-transparent pt-10 pb-6 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2 mb-3 px-2">
                <button className="text-[11px] font-bold bg-surface-container text-on-surface-variant px-3 py-1 rounded-full hover:bg-outline-variant/20 transition-colors">/sql_guide</button>
                <button className="text-[11px] font-bold bg-surface-container text-on-surface-variant px-3 py-1 rounded-full hover:bg-outline-variant/20 transition-colors">/ask_mentor</button>
              </div>
              <div className="bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant/30 p-2 flex items-end gap-2 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                <button className="p-3 text-on-surface-variant hover:text-secondary transition-colors rounded-xl hover:bg-secondary/5 mb-0.5">
                  <span className="material-symbols-outlined">add_circle</span>
                </button>
                <textarea 
                  className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 resize-none py-3 px-2 max-h-32 text-sm text-on-surface placeholder:text-outline"
                  placeholder="Type your question here..."
                  rows={1}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                ></textarea>
                <button className="p-3 text-on-surface-variant hover:text-secondary transition-colors rounded-xl hover:bg-secondary/5 mb-0.5">
                  <span className="material-symbols-outlined">sentiment_satisfied</span>
                </button>
                <button className="w-12 h-12 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-md hover:bg-secondary/90 transition-colors flex-shrink-0 mb-0.5 btn-press">
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right: Online Learners Panel */}
        <section className="hidden xl:flex w-72 bg-surface-container-lowest border-l border-outline-variant/30 flex-col flex-shrink-0">
          <div className="p-6 border-b border-outline-variant/20">
            <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Online Learners — 1,204</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3 ml-2">Instructors</p>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container/50 transition-colors cursor-pointer">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">JW</div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-on-surface">Dr. James Wilson</p>
                  <p className="text-[10px] text-secondary font-semibold">Lead Data Scientist</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-3 ml-2">Students</p>
              <div className="space-y-1">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container/50 transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">MT</div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                  </div>
                  <p className="text-sm font-medium text-on-surface">Mark Thompson</p>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container/50 transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-xs">EZ</div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-container-lowest"></div>
                  </div>
                  <p className="text-sm font-medium text-on-surface">Emily Zhao</p>
                </div>
              </div>
            </div>
            
            {/* Resource Card */}
            <div className="mt-8 bg-primary-container rounded-xl p-5 border border-white/10 shadow-lg relative overflow-hidden">
              <div className="absolute -right-4 -top-4 text-white/5">
                <span className="material-symbols-outlined text-6xl">data_object</span>
              </div>
              <h4 className="font-bold text-on-primary text-sm mb-1 relative z-10">SQL Cheat Sheet</h4>
              <p className="text-xs text-on-primary-container mb-4 relative z-10">Quick reference for joins and advanced queries.</p>
              <button className="w-full bg-secondary text-on-secondary py-2 rounded-lg text-xs font-bold hover:bg-secondary/90 transition-colors shadow-md relative z-10">
                Download PDF
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

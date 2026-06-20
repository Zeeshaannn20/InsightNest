"use client";

import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  sender: "student" | "instructor";
  name: string;
  text: string;
  timestamp: string;
  reply?: string;
}

export default function CourseViewerPage() {
  const [activeTab, setActiveTab] = useState("description");
  const [isModule2Open, setIsModule2Open] = useState(true);
  const [rightTab, setRightTab] = useState("chat");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize and Sync Chat Messages with LocalStorage
  useEffect(() => {
    const defaultMessages: ChatMessage[] = [
      { id: "1", sender: "student", name: "Felix Chen", text: "Can we use pandas to read parquet files directly from OneLake?", timestamp: "17:28", reply: "Yes! You can load ADLS paths directly with pandas using adlfs." },
      { id: "2", sender: "student", name: "Sarah Miller", text: "What is the prompt recipe for schema cleaning we covered yesterday?", timestamp: "17:35" }
    ];

    const stored = localStorage.getItem("lms_chat_messages");
    if (!stored) {
      localStorage.setItem("lms_chat_messages", JSON.stringify(defaultMessages));
      setChatMessages(defaultMessages);
    } else {
      setChatMessages(JSON.parse(stored));
    }

    // Interval to poll for replies from the instructor dashboard
    const timer = setInterval(() => {
      const current = localStorage.getItem("lms_chat_messages");
      if (current) {
        setChatMessages(JSON.parse(current));
      }
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, rightTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: "student",
      name: "Felix Chen (You)",
      text: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updated = [...chatMessages, msg];
    localStorage.setItem("lms_chat_messages", JSON.stringify(updated));
    setChatMessages(updated);
    setNewMessage("");
  };

  return (
    <div className="bg-background text-on-surface flex min-h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar variant="student" />

      {/* Main Content Area */}
      <main className="flex-1 md:ml-sidebar-width h-screen overflow-hidden flex flex-col">
        
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-6 md:px-10 bg-surface shadow-sm z-40 border-b border-outline-variant/20 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2 text-on-surface hover:text-secondary transition-colors font-medium text-sm">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Dashboard
          </Link>
          
          <div className="hidden md:flex items-center gap-4 w-1/3">
            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '75%' }}></div>
            </div>
            <span className="text-sm font-bold text-on-surface-variant">75% Complete</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined">share</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">AL</div>
          </div>
        </header>

        {/* Split View */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left Panel (70%) - Video & Content */}
          <section className="w-full lg:w-[70%] flex flex-col bg-background overflow-y-auto custom-scrollbar">
            
            {/* Video Container */}
            <div className="aspect-video bg-on-background relative group w-full flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary-container to-inverse-surface opacity-80 flex items-center justify-center">
                <button className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform btn-press group-hover:bg-secondary/90">
                  <span className="material-symbols-outlined text-4xl text-on-secondary filled">play_arrow</span>
                </button>
              </div>
              
              {/* Video Controls (Hover Reveal) */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                  <button className="hover:text-secondary"><span className="material-symbols-outlined">pause</span></button>
                  <button className="hover:text-secondary"><span className="material-symbols-outlined">volume_up</span></button>
                  <span className="text-sm font-medium">12:45 / 45:00</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold">1.5x</span>
                  <button className="hover:text-secondary"><span className="material-symbols-outlined">settings</span></button>
                  <button className="hover:text-secondary"><span className="material-symbols-outlined">fullscreen</span></button>
                </div>
              </div>
            </div>

            {/* Video Metadata */}
            <div className="p-6 md:p-10 flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-primary-container mb-2">GenAI Accelerator: Week 2 - Dynamic Visual Synthesis with Plotly</h1>
                  <p className="text-sm text-on-surface-variant flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">person</span> Instructor: Dr. Alex Rivera <span className="mx-2 text-outline-variant">•</span> Released June 2026
                  </p>
                </div>
                <div className="flex gap-3 flex-shrink-0">
                  <button className="border border-outline-variant text-on-surface px-4 py-2 rounded-lg font-bold text-sm hover:bg-surface-container transition-colors">Resume</button>
                  <button className="bg-primary-container text-on-primary px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary-container/90 transition-colors shadow-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Mark Complete
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-8 border-b border-outline-variant/30 mb-8">
                {['Description', 'Recordings', 'Assignments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 font-semibold text-sm transition-colors relative ${
                      activeTab === tab.toLowerCase() 
                        ? 'text-secondary border-b-2 border-secondary' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === "description" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
                  <div className="md:col-span-2 space-y-4 text-on-surface-variant leading-relaxed">
                    <p>
                      In this lesson, we master **Dynamic Visual Synthesis** by bypassing traditional Python syntax memorization. We will use ChatGPT and GitHub Copilot to programmatically construct, refine, and optimize production-grade interactive visualizations using the Plotly and Matplotlib libraries.
                    </p>
                    <p>
                      We will build responsive charts using natural language prompts, compile the results inside Jupyter Notebooks, and structure clean pandas pipelines. This hands-on session prepares you for the **Global Media Ecosystem Simulator** project.
                    </p>
                  </div>
                  <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/20 h-fit">
                    <h3 className="font-bold text-primary-container mb-4">Downloads</h3>
                    <div className="space-y-3">
                      <a href="#" className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-outline-variant/30 hover:border-secondary transition-colors group">
                        <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                        <span className="flex-1 text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">Lesson_Slides.pdf</span>
                        <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[18px]">download</span>
                      </a>
                      <a href="#" className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-outline-variant/30 hover:border-secondary transition-colors group">
                        <span className="material-symbols-outlined text-yellow-600">folder_zip</span>
                        <span className="flex-1 text-sm font-medium text-on-surface group-hover:text-secondary transition-colors">Source_Code.zip</span>
                        <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors text-[18px]">download</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "recordings" && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-primary-container text-lg">Class Recordings</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Access recordings of all previous live stream sessions for this cohort.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 hover:border-secondary transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Week 1, Session 1: Prompt Ingestion & Schemas</h4>
                        <p className="text-xs text-outline mt-1">Duration: 2h 15m • Recorded June 8, 2026</p>
                      </div>
                      <button className="w-10 h-10 bg-secondary/15 text-secondary rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"><span className="material-symbols-outlined">play_arrow</span></button>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 hover:border-secondary transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Week 1, Session 2: AI INDEX MATCH & AB Tests</h4>
                        <p className="text-xs text-outline mt-1">Duration: 2h 40m • Recorded June 11, 2026</p>
                      </div>
                      <button className="w-10 h-10 bg-secondary/15 text-secondary rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"><span className="material-symbols-outlined">play_arrow</span></button>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 hover:border-secondary transition-colors flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Week 2, Session 1: ChatGPT Pair-Programming</h4>
                        <p className="text-xs text-outline mt-1">Duration: 2h 22m • Recorded June 15, 2026</p>
                      </div>
                      <button className="w-10 h-10 bg-secondary/15 text-secondary rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-colors"><span className="material-symbols-outlined">play_arrow</span></button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "assignments" && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="font-bold text-primary-container text-lg">Assignments</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Submit homework assignments to qualify for live certificate generation.</p>
                  <div className="space-y-3">
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-on-surface text-sm">Assignment 1: The Revenue Architecture Engine</h4>
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Graded</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">Build financial dashboard in Excel using prompt-formulated CTE mappings.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-green-700">95/100</span>
                        <button className="border border-outline-variant px-4 py-2 rounded-lg text-xs font-semibold hover:bg-surface transition-colors">View Feedback</button>
                      </div>
                    </div>
                    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-on-surface text-sm">Assignment 2: Global Media Ecosystem Simulator</h4>
                          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Pending Review</span>
                        </div>
                        <p className="text-xs text-on-surface-variant">Write a Python scraping pipeline and cluster content trends.</p>
                      </div>
                      <button className="border border-outline-variant px-4 py-2 rounded-lg text-xs font-semibold hover:bg-surface transition-colors cursor-not-allowed" disabled>Submitted</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Right Panel (30%) - Course Curriculum & Live Chat */}
          <aside className="hidden lg:flex w-[30%] flex-col bg-surface border-l border-outline-variant/30 overflow-hidden flex-shrink-0">
            <div className="p-6 border-b border-outline-variant/20 flex-shrink-0 bg-surface-bright flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-primary-container">Class Portal</h2>
              </div>
              <div className="flex gap-2 bg-surface-container p-1 rounded-lg border border-outline-variant/20">
                <button 
                  onClick={() => setRightTab("curriculum")} 
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${rightTab === "curriculum" ? "bg-secondary text-on-secondary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Syllabus
                </button>
                <button 
                  onClick={() => setRightTab("chat")} 
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${rightTab === "chat" ? "bg-secondary text-on-secondary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  Direct Q&A
                </button>
              </div>
            </div>
            
            {rightTab === "curriculum" ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Module 1 */}
                <div className="border-b border-outline-variant/20 bg-surface-container-low/30">
                  <button className="w-full p-5 flex items-center justify-between hover:bg-surface-container/50 transition-colors text-left group">
                    <div>
                      <h3 className="font-bold text-on-surface-variant group-hover:text-primary-container transition-colors line-through opacity-70">Week 01: AI-Augmented Excel</h3>
                      <p className="text-xs text-on-surface-variant mt-1">4 Lessons • 2h 30m • COMPLETED</p>
                    </div>
                    <span className="material-symbols-outlined text-green-600 text-[20px] filled">check_circle</span>
                  </button>
                </div>

                {/* Module 2 (Expanded) */}
                <div className="border-b border-outline-variant/20 bg-surface-container-lowest">
                  <button 
                    onClick={() => setIsModule2Open(!isModule2Open)}
                    className="w-full p-5 flex items-center justify-between hover:bg-surface-container/50 transition-colors text-left"
                  >
                    <div>
                      <h3 className="font-bold text-secondary">Week 02: Python & LLMs</h3>
                      <p className="text-xs text-on-surface-variant mt-1">6 Lessons • 3h 15m</p>
                    </div>
                    <span className={`material-symbols-outlined text-secondary transition-transform duration-300 ${isModule2Open ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  
                  {isModule2Open && (
                    <div className="pb-2 animate-slide-down">
                      <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-surface-container/30 transition-colors">
                        <span className="material-symbols-outlined text-green-600 text-[20px] filled">check_circle</span>
                        <div className="flex-1">
                          <p className="text-sm text-on-surface line-through opacity-70">Lesson 4: Copilot Pair-Programming</p>
                          <p className="text-xs text-outline">45:00</p>
                        </div>
                      </a>
                      
                      <div className="flex items-center gap-3 px-6 py-3 bg-secondary-container/20 border-r-4 border-secondary">
                        <span className="material-symbols-outlined text-secondary text-[20px] filled">play_circle</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-primary-container">Lesson 5: Dynamic Visual Synthesis</p>
                          <p className="text-xs text-secondary font-medium mt-0.5">Watching Now</p>
                        </div>
                      </div>
                      
                      <a href="#" className="flex items-center gap-3 px-6 py-3 hover:bg-surface-container/30 transition-colors">
                        <span className="material-symbols-outlined text-outline text-[20px]">radio_button_unchecked</span>
                        <div className="flex-1">
                          <p className="text-sm text-on-surface">Lesson 6: Automated Code Review</p>
                          <p className="text-xs text-outline mt-0.5">30:00</p>
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                {/* Module 3 (Locked) */}
                <div className="border-b border-outline-variant/20 opacity-60">
                  <button className="w-full p-5 flex items-center justify-between text-left cursor-not-allowed">
                    <div>
                      <h3 className="font-bold text-on-surface">Week 03: Power BI & DAX</h3>
                      <p className="text-xs text-on-surface-variant mt-1">6 Lessons • 3h 45m</p>
                    </div>
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </button>
                </div>

                {/* Module 4 (Locked) */}
                <div className="border-b border-outline-variant/20 opacity-60">
                  <button className="w-full p-5 flex items-center justify-between text-left cursor-not-allowed">
                    <div>
                      <h3 className="font-bold text-on-surface">Week 04: Microsoft Fabric</h3>
                      <p className="text-xs text-on-surface-variant mt-1">8 Lessons • 4h 30m</p>
                    </div>
                    <span className="material-symbols-outlined text-outline">lock</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col bg-surface-container-lowest overflow-hidden">
                {/* Chat Message Box */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className="space-y-1.5 animate-slide-up">
                      <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === "instructor" ? "bg-secondary-container/20 border border-secondary/20 mr-auto text-on-secondary-container" : "bg-surface border border-outline-variant/30 ml-auto text-on-surface"}`}>
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <span className="font-bold text-xs opacity-75">{msg.name}</span>
                          <span className="text-[10px] text-outline font-medium">{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                      
                      {msg.reply && (
                        <div className="p-3 rounded-2xl max-w-[85%] text-sm bg-secondary-container/20 border border-secondary/20 mr-auto text-on-secondary-container animate-fade-in">
                          <div className="flex items-center gap-2 mb-1 justify-between">
                            <span className="font-bold text-xs text-secondary">Dr. Alex Rivera (Instructor)</span>
                            <span className="text-[10px] text-outline font-medium">Just now</span>
                          </div>
                          <p className="leading-relaxed">{msg.reply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                {/* Chat Input Field */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/30 bg-surface-bright flex gap-2">
                  <input
                    type="text"
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-outline-variant bg-surface focus:outline-none focus:border-secondary transition-all"
                    placeholder="Ask a question..."
                  />
                  <button type="submit" className="w-10 h-10 bg-secondary text-on-secondary rounded-xl flex items-center justify-center hover:bg-secondary/90 transition-colors btn-press flex-shrink-0">
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </form>
              </div>
            )}
          </aside>
        </div>
      </main>


    </div>
  );
}

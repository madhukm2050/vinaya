import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronUp,
  ChevronDown,
  Gift,
  Wallet,
  Volume2,
  Crown,
  CalendarDays,
  Sun,
  Moon,
  Clock,
  Heart,
} from "lucide-react";

// --- Configuration ---
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwPV6civies43A2o7J5-RNwu3M-1aX3hQ1jRsE1koPly4ynJ6T5MwBMeoSc8FDbvtOcQA/exec";

// --- Types ---
interface ChandaData {
  name: string;
  amount: string;
  status: string;
}

type SortConfig = {
  key: keyof ChandaData;
  direction: "asc" | "desc";
} | null;

export default function App() {
  const [data, setData] = useState<ChandaData[]>([]);
  // Fix 1: Initialize isLoading to true to show loader immediately on mount
  const [isLoading, setIsLoading] = useState(true);

  // Main Tabs
  const [activeTab, setActiveTab] = useState<"donors" | "chanda">("donors");

  // Chanda Tab Search & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL);
      const result = await response.json();

      if (result && Array.isArray(result.current)) {
        setData(result.current);
      } else if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const safeData = Array.isArray(data) ? data : [];
  const totalAmount = safeData.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  // --- Sorting Logic ---
  const handleSort = (key: keyof ChandaData) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: keyof ChandaData) => {
    if (!sortConfig || sortConfig.key !== columnName) {
      return (
        <ChevronUp className="inline w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="inline w-4 h-4 text-orange-600" />
    ) : (
      <ChevronDown className="inline w-4 h-4 text-orange-600" />
    );
  };

  const filteredChandaData = useMemo(() => {
    let items = [...safeData];

    if (searchQuery) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      items.sort((a, b) => {
        if (sortConfig.key === "amount") {
          const aNum = parseFloat(a.amount as string) || 0;
          const bNum = parseFloat(b.amount as string) || 0;
          if (aNum < bNum) return sortConfig.direction === "asc" ? -1 : 1;
          if (aNum > bNum) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        } else {
          const aStr = ((a[sortConfig.key] as string) || "").toLowerCase();
          const bStr = ((b[sortConfig.key] as string) || "").toLowerCase();
          if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        }
      });
    } else {
      items.sort(
        (a, b) => (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0)
      );
    }
    return items;
  }, [safeData, searchQuery, sortConfig]);

  const PendingBadge = () => (
    <span className="bg-orange-100 text-orange-700 text-xs font-black px-3 py-1 rounded-lg border border-orange-200 shadow-sm whitespace-nowrap">
      PENDING
    </span>
  );

  return (
    <div className="min-h-screen bg-orange-50 font-sans text-gray-800">
      <header className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white p-4 shadow-lg sticky top-0 z-10 flex justify-center items-center">
        <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          🕉️ SSP Sri Vidhya Ganapathi
        </h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 mt-4">
        {isLoading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 mb-4"></div>
            <p className="text-orange-600 font-bold animate-pulse text-lg">
              Syncing with Google Sheets...
            </p>
          </div>
        )}

        {/* --- Main Navigation Tabs --- */}
        <div className="flex bg-gray-200 rounded-xl p-1 mb-8 shadow-inner">
          <button
            onClick={() => setActiveTab("donors")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-lg font-bold text-sm md:text-base transition-all duration-300 ${
              activeTab === "donors"
                ? "bg-white text-orange-600 shadow-md transform scale-[1.01]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Gift size={20} />
            Donors
          </button>
          <button
            onClick={() => setActiveTab("chanda")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 sm:px-4 rounded-lg font-bold text-sm md:text-base transition-all duration-300 ${
              activeTab === "chanda"
                ? "bg-white text-purple-600 shadow-md transform scale-[1.01]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Wallet size={20} />
            Chanda
          </button>
        </div>

        <div className="animate-fade-in">
          {/* TAB 1: DONOR LIST */}
          {activeTab === "donors" && (
            <div className="space-y-6">
              {/* Sound System */}
              <div className="bg-white rounded-2xl shadow-md border-l-4 border-blue-500 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100 flex items-center gap-2">
                  <Volume2 className="text-blue-600" />
                  <h2 className="text-xl font-bold text-blue-900">
                    Sound System Donations
                  </h2>
                </div>
                <div className="p-4 sm:p-5 space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">
                      500W Speakers System
                    </h3>
                    <ul className="space-y-2 ml-1">
                      <li className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                        <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-sm"></div>
                        <span className="font-bold text-gray-800 text-lg">
                          Bussa Chinnappaiah Gari Thimmareddy Family
                        </span>
                      </li>
                      <li className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                        <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-sm"></div>
                        <span className="font-bold text-gray-800 text-lg">
                          Pedda Reddy Gari Shivareddy Family
                        </span>
                      </li>
                    </ul>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">
                      Amplifier
                    </h3>
                    <ul className="space-y-2 ml-1">
                      <li className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                        <div className="mt-2 w-2 h-2 rounded-full bg-blue-500 shrink-0 shadow-sm"></div>
                        <span className="font-bold text-gray-800 text-lg">
                          V Thimma Reddy And Family
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Major Donations */}
              <div className="bg-white rounded-2xl shadow-md border-l-4 border-yellow-500 overflow-hidden">
                <div className="bg-yellow-50 p-4 border-b border-yellow-100 flex items-center gap-2">
                  <Crown className="text-yellow-600" />
                  <h2 className="text-xl font-bold text-yellow-900">
                    Idol Donations
                  </h2>
                </div>
                <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm gap-3 hover:shadow transition-all hover:border-yellow-200">
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                      <Heart size={18} className="text-yellow-500 shrink-0" />{" "}
                      Vinayaka Idol
                    </span>
                    <PendingBadge />
                  </div>
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center p-4 bg-gray-50 rounded-xl border border-gray-100 shadow-sm gap-3 hover:shadow transition-all hover:border-yellow-200">
                    <span className="font-bold text-gray-800 flex items-center gap-2">
                      <Heart size={18} className="text-yellow-500 shrink-0" />{" "}
                      Silver Idol / Chain + Laddu
                    </span>
                    <span className="text-sm font-black text-green-700 bg-green-100 px-3 py-1.5 rounded-lg border border-green-200 text-right whitespace-nowrap shadow-sm">
                      K. P. Prabhakar Reddy
                    </span>
                  </div>
                </div>
              </div>

              {/* Prasadam Schedule */}
              <div className="bg-white rounded-2xl shadow-md border-l-4 border-green-500 overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-100 flex items-center gap-2">
                  <CalendarDays className="text-green-600" />
                  <h2 className="text-xl font-bold text-green-900">
                    Daily Prasadam Schedule
                  </h2>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="space-y-4">
                    {/* Day 1 */}
                    <div className="flex flex-col md:flex-row md:items-start p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                      <div className="w-32 font-bold text-gray-800 mb-3 md:mb-0 text-lg mt-1">
                        Day 1{" "}
                        <span className="text-gray-400 text-sm font-normal block sm:inline">
                          (Sep 14)
                        </span>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Sun size={20} className="text-orange-400 shrink-0" />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Morning:
                          </span>
                          <PendingBadge />
                        </div>
                        <div className="flex items-center gap-3">
                          <Moon
                            size={20}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Evening:
                          </span>
                          <span className="font-bold text-gray-800 text-lg leading-tight">
                            Lingayyagari Mallappa (Madhu)
                          </span>
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />

                    {/* Day 2 */}
                    <div className="flex flex-col md:flex-row md:items-start p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                      <div className="w-32 font-bold text-gray-800 mb-3 md:mb-0 text-lg mt-1">
                        Day 2
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Moon
                            size={20}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Evening:
                          </span>
                           <span className="font-bold text-gray-800 text-lg leading-tight">
                             K Surya narayana reddy(Manju reddy)
                          </span>
                         
                    
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />

                    {/* Day 3 */}
                    <div className="flex flex-col md:flex-row md:items-start p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                      <div className="w-32 font-bold text-gray-800 mb-3 md:mb-0 text-lg mt-1">
                        Day 3
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Moon
                            size={20}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Evening:
                          </span>
                          <span className="font-bold text-gray-800 text-lg leading-tight">
                            K Mallikarjuna Reddy and Family
                          </span>
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />

                    {/* Day 4 */}
                    <div className="flex flex-col md:flex-row md:items-start p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                      <div className="w-32 font-bold text-gray-800 mb-3 md:mb-0 text-lg mt-1">
                        Day 4
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Moon
                            size={20}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Evening:
                          </span>
                          <PendingBadge />
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />

                    {/* Day 5 */}
                    <div className="flex flex-col md:flex-row md:items-start p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                      <div className="w-32 font-bold text-gray-800 mb-3 md:mb-0 text-lg mt-1">
                        Day 5
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Moon
                            size={20}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Evening:
                          </span>
                          <PendingBadge />
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />

                    {/* Day 6 */}
                    <div className="flex flex-col md:flex-row md:items-start p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                      <div className="w-32 font-bold text-gray-800 mb-3 md:mb-0 text-lg mt-1">
                        Day 6
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Moon
                            size={20}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Evening:
                          </span>
                          <span className="font-bold text-gray-800 text-lg leading-tight">
                            K. Shyamala W/o Nakkalapalli Srinivasa Reddy
                            (Pranay)
                          </span>
                        </div>
                      </div>
                    </div>
                    <hr className="border-gray-100" />

                    {/* Day 7 */}
                    <div className="flex flex-col md:flex-row md:items-start p-3 sm:p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200 shadow-sm hover:shadow">
                      <div className="w-32 font-bold text-gray-800 mb-3 md:mb-0 text-lg mt-1">
                        Day 7
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <Clock
                            size={20}
                            className="text-indigo-400 shrink-0"
                          />
                          <span className="w-20 text-gray-500 font-medium text-sm">
                            Full Day:
                          </span>
                          <span className="font-bold text-gray-800 text-lg leading-tight">
                            C Shabhreesh Reddy AND K H Hari Gopal Reddy AND
                            Kuruba Sreenath and Families
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANDA */}
          {activeTab === "chanda" && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
              <div className="bg-purple-50 p-4 border-b border-purple-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h2 className="text-xl font-bold text-purple-800">
                  Chanda List
                </h2>
                <button
                  onClick={fetchData}
                  className="w-full sm:w-auto text-sm bg-purple-200 px-4 py-2 rounded-lg text-purple-800 hover:bg-purple-300 font-bold shadow-sm transition"
                >
                  Refresh Data
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b border-gray-100 bg-white">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-3.5 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search members by name..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition shadow-sm"
                  />
                </div>
              </div>

              {/* Main Detailed Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider border-b">
                      <th className="p-4">S.No</th>
                      <th
                        className="p-4 cursor-pointer hover:bg-gray-200 transition group"
                        onClick={() => handleSort("name")}
                      >
                        Name {getSortIcon("name")}
                      </th>
                      <th
                        className="p-4 text-right cursor-pointer hover:bg-gray-200 transition group"
                        onClick={() => handleSort("amount")}
                      >
                        Amount {getSortIcon("amount")}
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-gray-200 transition group"
                        onClick={() => handleSort("status")}
                      >
                        Status {getSortIcon("status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredChandaData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-purple-50 transition">
                        <td className="p-4 text-gray-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="p-4 font-bold text-gray-800 whitespace-normal min-w-[150px]">
                          {item.name}
                        </td>
                        <td
                          className={`p-4 text-right font-black ${
                            item.status === "Paid"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          ₹{item.amount}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1.5 text-xs rounded-lg font-bold border ${
                              item.status === "Paid"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredChandaData.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-8 text-center text-gray-400"
                        >
                          {searchQuery
                            ? `No records found for "${searchQuery}".`
                            : `No records found.`}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-purple-100 border-t-2 border-purple-200">
                      <td
                        colSpan={2}
                        className="p-4 text-right font-black text-purple-900 md:text-xl"
                      >
                        Total Amount:
                      </td>
                      <td className="p-4 text-right font-black text-gray-800 md:text-xl">
                        ₹{totalAmount}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

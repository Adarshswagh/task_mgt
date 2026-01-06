import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';

function Calendar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/board' ? 'Board' : location.pathname === '/list' ? 'List' : location.pathname === '/calendar' ? 'Calendar' : location.pathname === '/files' ? 'Files' : 'Calendar';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Date State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);

  const tabs = [
    { id: 'List', path: '/list' },
    { id: 'Board', path: '/board' },
    { id: 'Calendar', path: '/calendar' },
    { id: 'Files', path: '/files' },
  ];

  // Helper to get week days based on currentDate
  useEffect(() => {
    const getWeekDays = (date) => {
      const start = new Date(date);
      const day = start.getDay(); // 0 is Sunday
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
      const monday = new Date(start.setDate(diff));

      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
          day: d.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
          date: d.getDate(),
          fullDate: d,
          current: isSameDate(d, new Date()) // Check if it is literally today
        });
      }
      return days;
    };

    setWeekDays(getWeekDays(currentDate));
  }, [currentDate]);

  const isSameDate = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Mock Data matching the screenshot
  // Note: For demonstration, we just show these events regardless of the week, 
  // or we could loosely map them to the *current displayed week* to keep the UI populated.
  // I will map them to the CURRENTLY VIEWED week's Monday-Sunday so the user always sees them for verification.
  const timeSlots = [
    '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'
  ];

  const events = [
    {
      id: 1,
      title: 'Monday standup',
      time: '9:00 AM',
      dayIndex: 0,
      startRow: 1,
      duration: 1,
      color: 'bg-gray-100 border-l-4 border-gray-400',
      description: 'Weekly team synchronization.'
    },
    {
      id: 2,
      title: 'Deep work',
      time: '9:00 AM',
      dayIndex: 2,
      startRow: 1,
      duration: 2,
      color: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500',
      description: 'Focus time for coding features.'
    },
    {
      id: 3,
      title: 'Friday standup',
      time: '',
      dayIndex: 4,
      startRow: 1,
      duration: 0.8, // Reduced slightly to avoid visual overlap if any
      color: 'bg-gray-100 border-l-4 border-gray-400',
    },
    {
      id: 4,
      title: 'One-on-one with...',
      time: '10:00 AM',
      dayIndex: 1,
      startRow: 2,
      duration: 1,
      color: 'bg-pink-50 text-pink-700 border-l-4 border-pink-400',
      description: 'Monthly performance review.'
    },
    {
      id: 5,
      title: 'Design sync',
      time: '10:30 AM',
      dayIndex: 2,
      startRow: 2.5,
      duration: 1,
      color: 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500',
    },
    {
      id: 6,
      title: 'Olivia x Riley',
      time: '10:00 AM',
      dayIndex: 4,
      startRow: 2,
      duration: 1,
      color: 'bg-purple-50 text-purple-700 border-l-4 border-purple-400',
    },
    {
      id: 7,
      title: 'Content planning',
      time: '11:00 AM',
      dayIndex: 0,
      startRow: 3,
      duration: 1.5,
      color: 'bg-sky-50 text-sky-700 border-l-4 border-sky-500',
    },
    {
      id: 8,
      title: 'House inspection',
      time: '',
      dayIndex: 5,
      startRow: 3,
      duration: 0.8,
      color: 'bg-orange-50 text-orange-700 border-l-4 border-orange-400',
      icon: true
    },
    {
      id: 9,
      title: 'Lunch with Olivia',
      time: '12:00 PM',
      dayIndex: 3,
      startRow: 4,
      duration: 1,
      color: 'bg-green-50 text-green-700 border-l-4 border-green-500',
    },
    {
      id: 10,
      title: 'SEO planning',
      time: '1:30 PM',
      dayIndex: 2,
      startRow: 5.5,
      duration: 1,
      color: 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500',
    },
    {
      id: 11,
      title: 'Product demo',
      time: '1:30 PM',
      dayIndex: 4,
      startRow: 5.5,
      duration: 1.5,
      color: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500',
    },
    {
      id: 12,
      title: "Ava's engagmen...",
      time: '9:00 AM',
      dayIndex: 6,
      startRow: 5.5,
      duration: 1,
      color: 'bg-purple-50 text-purple-700 border-l-4 border-purple-400',
    },
    {
      id: 13,
      title: 'Catch up w/ Alex',
      time: '3:30 PM',
      dayIndex: 1,
      startRow: 7.5,
      duration: 1,
      color: 'bg-purple-50 text-purple-700 border-l-4 border-purple-400',
    },
    {
      id: 14,
      title: 'Meetup event',
      time: '',
      dayIndex: 2,
      startRow: 7,
      duration: 1,
      color: 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-400',
    }
  ];

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-gray-50/50">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-gray-100 pt-2 pb-4 mb-2 -mx-6 px-6">
          <div className="flex items-center justify-between relative">
            {/* Left Side - Tabs */}
            <div className="flex items-center gap-3 bg-white rounded-full p-1 px-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white border-[#88ACFF] border-2'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tab.id}
                </button>
              ))}
            </div>

            {/* Center - Date Controls */}
            <div className="flex items-center gap-3 flex-1 justify-center absolute left-1/2 transform -translate-x-1/2">
              {/* Calendar Title / Date Controls */}
              <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                <button onClick={() => navigateWeek(-1)} className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-sm font-bold text-gray-800 min-w-[120px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={() => navigateWeek(1)} className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
              <button onClick={goToToday} className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-2 bg-white rounded-full transition-colors border border-gray-200 hover:bg-gray-50">
                Today
              </button>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Zeko Dropdown */}
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Zeko</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Add Task Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Task</span>
              </button>

              {/* Filters Dropdown */}
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
                <span className="text-sm font-medium text-gray-900">Filters</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="min-w-[1000px] relative">
            {/* Days Header */}
            <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="p-4 border-r border-gray-50 h-[88px] flex items-center justify-center text-gray-400 text-xs font-medium bg-gray-50/30">
                GMT+05:30
              </div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-2 py-4 text-center border-r border-gray-50 last:border-r-0 relative group flex flex-col items-center justify-center">

                  {/* Date Circle & Text */}
                  <div className="flex flex-col items-center justify-center gap-1 z-10">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${day.current ? 'text-blue-600' : 'text-gray-500'}`}>{day.day}</span>
                    <span className={`flex items-center justify-center w-9 h-9 text-lg font-bold rounded-full transition-all duration-300 ${day.current ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-900 group-hover:bg-gray-100'}`}>
                      {day.date}
                    </span>
                  </div>

                  {/* Current Day styling accents */}
                  {day.current && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600 rounded-t-full mx-auto w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="relative grid grid-cols-8 bg-white min-h-[800px]">
              {/* Background H-Lines & Time Labels */}
              <div className="contents">
                {timeSlots.map((time, timeIndex) => (
                  <div key={time} className="contents group">
                    {/* Time Label */}
                    <div className="h-28 border-r border-b border-gray-50 text-[11px] text-gray-400 font-medium p-2 pr-3 text-right sticky left-0 bg-white z-30">
                      <span className="-top-3 relative">{time}</span>
                    </div>
                    {/* Grid Cells for this hour */}
                    {weekDays.map((_, dayIndex) => (
                      <div key={`${timeIndex}-${dayIndex}`} className="h-28 border-r border-b border-gray-50 last:border-r-0 relative hover:bg-gray-50/40 transition-colors">
                        {/* Half-hour guide line (faint) */}
                        <div className="absolute top-1/2 left-0 w-full border-t border-gray-50 border-dashed opacity-50 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Current Time Line */}
              {/* We could calculate this dynamic position based on current time mod 24h, but keeping static for stability as per requirement */}
              <div className="absolute w-full z-10 pointer-events-none" style={{ top: '640px' }}> {/* Adjusted position */}
                <div className="relative flex items-center">
                  <div className="w-[12.5%] text-right pr-3 text-xs font-bold text-red-500">2:20 PM</div>
                  <div className="flex-1 h-px bg-red-500/80 shadow-[0_0_4px_rgba(239,68,68,0.4)]"></div>
                  <div className="absolute left-[12.5%] w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2 shadow-sm"></div>
                </div>
              </div>

              {/* Events Rendering Layer */}
              <div className="absolute inset-0 top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8">
                <div className="col-span-1"></div> {/* Spacer for time column */}
                {weekDays.map((_, i) => (
                  <div key={i} className="relative h-full border-r border-transparent">
                    {/* Filter events for this day */}
                    {events.filter(e => e.dayIndex === i).map(event => {
                      const rowHeight = 112; // h-28 = 7rem = 112px
                      const top = (event.startRow - 1) * rowHeight;
                      const height = event.duration * rowHeight - 6; // gap
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`absolute w-[92%] left-[4%] rounded-lg p-3 pointer-events-auto ${event.color} flex flex-col justify-start cursor-pointer hover:brightness-95 hover:scale-[1.02] transition-all shadow-sm z-20 border-l-[3px] overflow-hidden`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          <div className="font-bold text-gray-800 line-clamp-1 text-xs md:text-sm">{event.title}</div>
                          {event.time && <div className="text-[10px] mt-0.5 font-medium opacity-75">{event.time}</div>}
                          {event.icon && (<div className="absolute top-2 right-2 text-orange-500 font-bold">*</div>)}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Add Task Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-800">Add New Task</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Task Title</label>
                  <input type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium" placeholder="E.g., Design Review" autoFocus />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Date</label>
                    <input type="date" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Time</label>
                    <input type="time" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none text-sm font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none h-24 resize-none text-sm font-medium" placeholder="Add details..."></textarea>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
                <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button onClick={() => setIsAddModalOpen(false)} className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform active:scale-95">Create Task</button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border-t-8 border-transparent ring-1 ring-black/5" style={{ borderTopColor: selectedEvent.color.includes('blue') ? '#3b82f6' : selectedEvent.color.includes('purple') ? '#a855f7' : selectedEvent.color.includes('green') ? '#22c55e' : selectedEvent.color.includes('orange') ? '#f97316' : '#9ca3af' }}>
              <div className="px-6 py-5 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium bg-gray-100 inline-block px-2 py-0.5 rounded-full">{selectedEvent.time} • {weekDays[selectedEvent.dayIndex].day} {weekDays[selectedEvent.dayIndex].date}</p>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="px-6 py-2 pb-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${selectedEvent.color.split(' ')[0]} ${selectedEvent.color.split(' ')[1]} bg-opacity-50 border border-current`}>
                    Calendar Event
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {selectedEvent.description || "No additional details provided for this event. Click 'Edit' to add more information."}
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                <button className="text-sm text-red-500 font-bold hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">Delete</button>
                <button onClick={() => setSelectedEvent(null)} className="px-4 py-2 text-sm font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 transform active:scale-95">Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Calendar;


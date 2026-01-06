import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../dashboard/DashboardLayout';

function ProjectsCalendar() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname.includes('/projects/list') ? 'List' : 
                    location.pathname.includes('/projects/board') ? 'Board' : 
                    location.pathname.includes('/projects/calendar') ? 'Calendar' : 
                    location.pathname.includes('/projects/files') ? 'Files' : 'Calendar';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekDays, setWeekDays] = useState([]);

  const tabs = [
    { id: 'List', path: '/dashboard/projects/list' },
    { id: 'Board', path: '/dashboard/projects/board' },
    { id: 'Calendar', path: '/dashboard/projects/calendar' },
    { id: 'Files', path: '/dashboard/projects/files' },
  ];

  useEffect(() => {
    const getWeekDays = (date) => {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(start.setDate(diff));

      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
          day: d.toLocaleDateString('en-US', { weekday: 'short' }),
          date: d.getDate(),
          fullDate: d,
          current: isSameDate(d, new Date())
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

  const timeSlots = ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];

  const projectEvents = [
    {
      id: 1,
      title: 'Website Redesign - Sprint Review',
      time: '10:00 AM',
      dayIndex: 1,
      startRow: 2,
      duration: 1.5,
      color: 'bg-purple-50 text-purple-700 border-l-4 border-purple-500',
      type: 'Web Development',
    },
    {
      id: 2,
      title: 'Mobile App - Team Standup',
      time: '9:00 AM',
      dayIndex: 2,
      startRow: 1,
      duration: 1,
      color: 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500',
      type: 'Mobile App',
    },
  ];

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col bg-gray-50/50">
        <div className="sticky top-0 z-50 bg-gray-100 pt-2 pb-4 mb-2 -mx-6 px-6">
          <div className="flex items-center justify-between relative">
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

            <div className="flex items-center gap-3 flex-1 justify-center absolute left-1/2 transform -translate-x-1/2">
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

            <div className="flex items-center gap-3 flex-1 justify-end">
              <button className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Add Event</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <div className="min-w-[1000px] relative">
            <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-40 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="p-4 border-r border-gray-50 h-[88px] flex items-center justify-center text-gray-400 text-xs font-medium bg-gray-50/30">
                GMT+05:30
              </div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-2 py-4 text-center border-r border-gray-50 last:border-r-0 relative group flex flex-col items-center justify-center">
                  <div className="flex flex-col items-center justify-center gap-1 z-10">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${day.current ? 'text-blue-600' : 'text-gray-500'}`}>{day.day}</span>
                    <span className={`flex items-center justify-center w-9 h-9 text-lg font-bold rounded-full transition-all duration-300 ${day.current ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-gray-900 group-hover:bg-gray-100'}`}>
                      {day.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative grid grid-cols-8 bg-white min-h-[800px]">
              <div className="contents">
                {timeSlots.map((time, timeIndex) => (
                  <div key={time} className="contents group">
                    <div className="h-28 border-r border-b border-gray-50 text-[11px] text-gray-400 font-medium p-2 pr-3 text-right sticky left-0 bg-white z-30">
                      <span className="-top-3 relative">{time}</span>
                    </div>
                    {weekDays.map((_, dayIndex) => (
                      <div key={`${timeIndex}-${dayIndex}`} className="h-28 border-r border-b border-gray-50 last:border-r-0 relative hover:bg-gray-50/40 transition-colors">
                        <div className="absolute top-1/2 left-0 w-full border-t border-gray-50 border-dashed opacity-50 pointer-events-none"></div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8">
                <div className="col-span-1"></div>
                {weekDays.map((_, i) => (
                  <div key={i} className="relative h-full border-r border-transparent">
                    {projectEvents.filter(e => e.dayIndex === i).map(event => {
                      const rowHeight = 112;
                      const top = (event.startRow - 1) * rowHeight;
                      const height = event.duration * rowHeight - 6;
                      return (
                        <div
                          key={event.id}
                          className={`absolute w-[92%] left-[4%] rounded-lg p-3 pointer-events-auto ${event.color} flex flex-col justify-start cursor-pointer hover:brightness-95 hover:scale-[1.02] transition-all shadow-sm z-20 border-l-[3px] overflow-hidden`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          <div className="font-bold text-gray-800 line-clamp-1 text-xs md:text-sm">{event.title}</div>
                          {event.time && <div className="text-[10px] mt-0.5 font-medium opacity-75">{event.time}</div>}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProjectsCalendar;


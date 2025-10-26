'use client';

import React, { useState, ChangeEvent } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Plus } from "lucide-react";
import { agendas as initialAgendas, type AgendaData } from "../../data/data";
import AgendaModal from "./AgendaModal";

const ScheduleContent: React.FC = () => {
  const [events, setEvents] = useState<AgendaData[]>(initialAgendas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<AgendaData>({
    title: "",
    date: "",
    time: "",
    type: "",
  });

  const agendaTypes = ["Counseling", "Routine Interview", "Meeting", "Event"];

  // --- UPDATED: Styling to match Figma design's colors ---
  const typeStyling: Record<string, { bgDot: string; border: string; text: string }> = {
    Counseling: { bgDot: "bg-teal-500", border: "border-teal-500", text: "text-teal-700" },
    "Routine Interview": { bgDot: "bg-orange-500", border: "border-orange-500", text: "text-orange-700" },
    Meeting: { bgDot: "bg-amber-500", border: "border-amber-500", text: "text-amber-700" },
    Event: { bgDot: "bg-rose-500", border: "border-rose-500", text: "text-rose-700" },

  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      alert("Please fill in all required fields.");
      return;
    }
    setEvents((prev) => [...prev, formData]);
    setFormData({
    title: "",
    date: "",
    time: "",
    type: "",
    });
    setIsModalOpen(false);
  };

  // --- Agenda Grouping Logic (no changes needed) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeekDate = new Date(today);
  nextWeekDate.setDate(today.getDate() + 7);

  const eventsToday = events.filter(
    (e) => new Date(e.date).setHours(0, 0, 0, 0) === today.getTime()
  );

  const eventsUpcoming = events.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate > today && eventDate < nextWeekDate;
  });

  const eventsNextWeek = events.filter(
    (e) => new Date(e.date).setHours(0, 0, 0, 0) >= nextWeekDate.getTime()
  );

  const renderEventContent = (eventInfo: any) => {
    const eventType = eventInfo.event.extendedProps.type;
    // Note: using bgDot for calendar events for a solid look
    const style = typeStyling[eventType] || typeStyling["Counseling"];
    return (
      <div className={`px-2 py-1 text-xs text-white font-semibold rounded-md ${style.bgDot}`}>
        {eventInfo.event.title}
      </div>
    );
  };

  const AgendaItem: React.FC<{ event: AgendaData }> = ({ event }) => {
    const style = typeStyling[event.type] || typeStyling["Counseling"];
    return (
      <li className={`bg-white shadow-sm rounded-lg border-l-4 ${style.border} flex items-center p-3 gap-4`}>
        <div className="w-20 text-center text-gray-500 text-sm">
            {event.startTime}
        </div>
        <div className="flex-grow">
            <p className={`font-semibold ${style.text}`}>{event.type}</p>
            <p className="text-sm text-gray-800">{event.title}</p>
        </div>
      </li>
    );
  };

  return (
    <>
      <style>{`
        .fc {
          border: none;
        }
        .fc .fc-toolbar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937; /* Darker title */
        }
        .fc .fc-col-header-cell-cushion, .fc .fc-daygrid-day-number {
          color: #4b5563;
        }
        .fc .fc-day-today {
          background-color: #f0fdfa !important; /* Lighter teal */
        }
        .fc .fc-daygrid-day-events {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 2px;
        }
        .fc .fc-event {
          border: none !important;
          background-color: transparent !important;
        }
        .fc .fc-button-primary {
          background-color: #f3f4f6 !important;
          border: none !important;
          color: #1f2937 !important;
        }
        .fc .fc-button-primary:hover {
          background-color: #e5e7eb !important;
        }
        .fc .fc-toolbar.fc-header-toolbar {
          margin-bottom: 2rem !important;
        }
      `}</style>

      <div className=" text-gray-800 space-y-6">
        {/* Header */}
        {/* Calendar + Agenda List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white shadow-md rounded-xl p-6">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events.map((e) => ({
                title: e.title,
                date: e.date,
                extendedProps: { type: e.type },
              }))}
              eventContent={renderEventContent}
              height="auto"
              headerToolbar={{
                left: "prev,next",
                center: "title",
                right: "today",
              }}
              dayHeaderFormat={{ weekday: "short" }}
            />
          </div>

          {/* Agenda Side Panel */}
          <div className="bg-white shadow-md rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Agendas</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-400 hover:text-teal-500"
              >
                <Plus />
              </button>
            </div>

            {/* --- UPDATED: Legend with solid dots --- */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {Object.entries(typeStyling).map(([key, { bgDot }]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${bgDot}`}></span>
                  <span>{key}</span>
                </div>
              ))}
            </div>

            {/* Agenda Items */}
            <div className="space-y-4 h-[calc(100%-6rem)] overflow-y-auto pr-2">
              {eventsToday.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Today</p>
                  <ul className="space-y-3">
                    {eventsToday.map((event, idx) => (
                      <AgendaItem key={idx} event={event} />
                    ))}
                  </ul>
                </div>
              )}
              {eventsUpcoming.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Upcoming</p>
                  <ul className="space-y-3">
                    {eventsUpcoming.map((event, idx) => (
                      <AgendaItem key={idx} event={event} />
                    ))}
                  </ul>
                </div>
              )}
              {eventsNextWeek.length > 0 && (
                <div>
                  <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Next Week</p>
                  <ul className="space-y-3">
                    {eventsNextWeek.map((event, idx) => (
                      <AgendaItem key={idx} event={event} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
          <AgendaModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            size="md"
            title="New Agenda"
            submitText="Save Agenda"
            agendaOptions={agendaTypes}
          />
      </div>
    </>
  );
};

export default ScheduleContent;
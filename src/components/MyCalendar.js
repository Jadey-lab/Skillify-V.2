import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { Tooltip } from "antd";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = ({ events, onSelectEvent, onAddEvent, onSelectSlot, calendarView, tooltips }) => {
  // Initialize view state with calendarView prop or default to "month"
  const [view, setView] = useState(calendarView || "month");
  // Track the current date shown by the calendar.
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update local view state when the parent's calendarView prop changes
  useEffect(() => {
    setView(calendarView || "month");
  }, [calendarView]);

  // Custom date cell wrapper to add tooltip if tooltip data is available for the date
  const MyDateCellWrapper = ({ value, children }) => {
    const dateString = moment(value).format("YYYY-MM-DD");
    const tooltipTexts = tooltips && tooltips[dateString];
    if (tooltipTexts && tooltipTexts.length > 0) {
      const tooltipContent = tooltipTexts.join(" | ");
      return (
        <Tooltip title={tooltipContent}>
          <div>{children}</div>
        </Tooltip>
      );
    }
    return <div>{children}</div>;
  };

  // Handler for view changes (e.g. day, week, month)
  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Handler for calendar navigation (next, previous, or today)
  const handleNavigate = (newDate, view, action) => {
    setCurrentDate(newDate);
    // Optionally, you can add side effects here when the date changes.
  };

  return (
    <div style={{ position: "relative" }}>
      <Calendar
        selectable
        localizer={localizer}
        events={events}
        view={view}
        onView={handleViewChange}
        views={["day", "week", "month"]}
        onSelectEvent={onSelectEvent}
        onSelectSlot={onSelectSlot}
        onNavigate={handleNavigate}
        date={currentDate}
        style={{ height: 500 }}
        components={{
          dateCellWrapper: MyDateCellWrapper,
        }}
      />
      <button
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          fontSize: "24px",
        }}
        onClick={onAddEvent}
      >
        +
      </button>
    </div>
  );
};

export default MyCalendar;

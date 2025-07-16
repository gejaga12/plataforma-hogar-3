'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { AgendaEvent, AgendaView } from '@/utils/types';
import { cn } from '@/lib/utils';

interface AgendaCalendarProps {
  events: AgendaEvent[];
  currentDate: Date;
  viewMode: AgendaView;
  onEventClick: (event: AgendaEvent) => void;
}

export function AgendaCalendar({ events, currentDate, viewMode, onEventClick }: AgendaCalendarProps) {
  // Generate calendar data based on view mode and current date
  const [calendarData, setCalendarData] = useState<{
    days: Date[];
    hours?: string[];
  }>({ days: [] });

  // Update calendar data when view mode or current date changes
  useEffect(() => {
    if (viewMode === 'day') {
      setCalendarData({
        days: [new Date(currentDate)],
        hours: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
      });
    } else if (viewMode === 'week') {
      // Get the start of the week (Sunday)
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay(); // 0 for Sunday, 1 for Monday, etc.
      startOfWeek.setDate(startOfWeek.getDate() - day);
      
      // Generate array of 7 days starting from the start of the week 
      const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        return date;
      });
      
      setCalendarData({
        days,
        hours: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
      });
    } else if (viewMode === 'month') {
      // Get the first day of the month
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      // Get the last day of the month
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Get the day of the week for the first day (0 for Sunday, 1 for Monday, etc.)
      const firstDayOfWeek = firstDayOfMonth.getDay();
      
      // Calculate the number of days to show from the previous month
      const daysFromPrevMonth = firstDayOfWeek;
      
      // Calculate the total number of days to show (including days from previous and next months)
      const totalDays = 42; // 6 weeks * 7 days
      
      // Generate array of dates
      const days: Date[] = [];
      
      // Add days from previous month
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      const prevMonthDays = prevMonth.getDate();
      
      for (let i = prevMonthDays - daysFromPrevMonth + 1; i <= prevMonthDays; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, i);
        days.push(date);
      }
      
      // Add days from current month
      for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        days.push(date);
      }
      
      // Add days from next month
      const remainingDays = totalDays - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i);
        days.push(date);
      }
      
      setCalendarData({ days });
    }
  }, [viewMode, currentDate]);

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      return (
        eventStart.getDate() === day.getDate() &&
        eventStart.getMonth() === day.getMonth() &&
        eventStart.getFullYear() === day.getFullYear()
      );
    });
  };

  // Get events for a specific hour on a specific day
  const getEventsForHour = (day: Date, hour: number) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      return (
        eventStart.getDate() === day.getDate() &&
        eventStart.getMonth() === day.getMonth() &&
        eventStart.getFullYear() === day.getFullYear() &&
        eventStart.getHours() === hour
      );
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: 'numeric' });
  };

  // Format day name for display
  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  };

  // Format month name for display
  const formatMonthName = (date: Date) => {
    return date.toLocaleDateString('es-ES', { month: 'long' });
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is in the current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Render day view
  const renderDayView = () => {
    if (!calendarData.hours) return null;
    
    const day = calendarData.days[0];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {day.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
        </div>
        
        <div className="overflow-y-auto max-h-[600px]">
          {calendarData.hours.map((hour, index) => {
            const hourEvents = getEventsForHour(day, parseInt(hour.split(':')[0]));
            
            return (
              <div 
                key={hour} 
                className={cn(
                  "flex border-b border-gray-200 dark:border-gray-700 min-h-[100px]",
                  index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-750"
                )}
              >
                <div className="w-20 p-2 border-r border-gray-200 dark:border-gray-700 flex items-start justify-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{hour}</span>
                </div>
                <div className="flex-1 p-2 relative">
                  {hourEvents.map(event => (
                    <div 
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        "p-2 rounded-lg mb-2 cursor-pointer",
                        "border-l-4 hover:shadow-md transition-shadow",
                        event.type === 'meeting' ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-600" :
                        event.type === 'task' ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-600" :
                        event.type === 'deadline' ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600" :
                        event.type === 'training' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600" :
                        "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-600"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <MapPin size={12} className="mr-1" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.participants && event.participants.length > 0 && (
                        <div className="flex items-center mt-1">
                          <div className="flex -space-x-2">
                            {event.participants.slice(0, 3).map((participant, i) => (
                              <div key={i} className="w-6 h-6 rounded-full overflow-hidden border-2 border-white dark:border-gray-800">
                                {participant.avatar ? (
                                  <img 
                                    src={participant.avatar} 
                                    alt={participant.name} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                      {participant.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                            {event.participants.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800">
                                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                                  +{event.participants.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    if (!calendarData.hours || !calendarData.days) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days header */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          <div className="p-4 border-r border-gray-200 dark:border-gray-700"></div>
          {calendarData.days.map((day, index) => (
            <div 
              key={index} 
              className={cn(
                "p-4 text-center border-r border-gray-200 dark:border-gray-700",
                isToday(day) && "bg-orange-50 dark:bg-orange-900/20"
              )}
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDayName(day)}
              </div>
              <div className={cn(
                "text-2xl font-bold",
                isToday(day) ? "text-orange-600 dark:text-orange-400" : "text-gray-900 dark:text-gray-100"
              )}>
                {formatDate(day)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Hours and events */}
        <div className="overflow-y-auto max-h-[600px]">
          {calendarData.hours.map((hour, hourIndex) => (
            <div 
              key={hour} 
              className={cn(
                "grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 min-h-[100px]",
                hourIndex % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-750"
              )}
            >
              <div className="p-2 border-r border-gray-200 dark:border-gray-700 flex items-start justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{hour}</span>
              </div>
              
              {calendarData.days.map((day, dayIndex) => {
                const hourEvents = getEventsForHour(day, parseInt(hour.split(':')[0]));
                
                return (
                  <div 
                    key={dayIndex} 
                    className="p-1 border-r border-gray-200 dark:border-gray-700 relative"
                  >
                    {hourEvents.map(event => (
                      <div 
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={cn(
                          "p-1 rounded-lg mb-1 cursor-pointer text-xs",
                          "border-l-2 hover:shadow-md transition-shadow",
                          event.type === 'meeting' ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-600" :
                          event.type === 'task' ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-600" :
                          event.type === 'deadline' ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600" :
                          event.type === 'training' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600" :
                          "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-600"
                        )}
                      >
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {event.title}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {new Date(event.startDate).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render month view
  const renderMonthView = () => {
    if (!calendarData.days) return null;
    
    // Split days into weeks
    const weeks: Date[][] = [];
    for (let i = 0; i < calendarData.days.length; i += 7) {
      weeks.push(calendarData.days.slice(i, i + 7));
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, index) => (
            <div key={index} className="p-2 text-center">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{day}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              {week.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentDay = isToday(day);
                const inCurrentMonth = isCurrentMonth(day);
                
                return (
                  <div 
                    key={dayIndex} 
                    className={cn(
                      "min-h-[120px] p-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                      !inCurrentMonth && "bg-gray-50 dark:bg-gray-750",
                      isCurrentDay && "bg-orange-50 dark:bg-orange-900/20"
                    )}
                  >
                    <div className="text-right p-1">
                      <span className={cn(
                        "inline-flex items-center justify-center w-6 h-6 text-sm",
                        isCurrentDay 
                          ? "bg-orange-500 text-white rounded-full" 
                          : !inCurrentMonth 
                            ? "text-gray-400 dark:text-gray-500" 
                            : "text-gray-900 dark:text-gray-100"
                      )}>
                        {formatDate(day)}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mt-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div 
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className={cn(
                            "px-2 py-1 rounded text-xs cursor-pointer truncate",
                            "border-l-2 hover:shadow-sm transition-shadow",
                            event.type === 'meeting' ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-600" :
                            event.type === 'task' ? "bg-amber-50 dark:bg-amber-900/20 border-amber-500 dark:border-amber-600" :
                            event.type === 'deadline' ? "bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-600" :
                            event.type === 'training' ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-600" :
                            "bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-600"
                          )}
                        >
                          {event.title}
                        </div>
                      ))}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400 py-1">
                          +{dayEvents.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
    </div>
  );
}
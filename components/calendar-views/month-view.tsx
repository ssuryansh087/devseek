import {
  format,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
} from "date-fns";
import { Card } from "@/components/ui/card";

type Task = {
  id: string;
  title: string;
  date: Date;
  time: string;
};

export function MonthView({
  date,
  tasks,
  openDay,
}: {
  date: Date;
  tasks: Task[];
  openDay: (view: string, date: Date) => void;
}) {
  const monthStart = startOfMonth(date);

  const monthEnd = endOfMonth(date);

  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });

  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = [];
  let day = calendarStart;
  while (day <= calendarEnd) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => isSameDay(task.date, date));
  };

  return (
    <div className="grid grid-cols-7 gap-4 p-6">
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="p-2 text-center font-medium">
          {day}
        </div>
      ))}

      {calendarDays.map((day) => {
        const dayTasks = getTasksForDate(day);
        return (
          <Card
            key={day.toString()}
            className={`min-h-[100px] p-2 hover:bg-primary/5 hover:glow hover:cursor-pointer transition-colors ${
              !isSameMonth(day, date) ? "opacity-40 bg-muted/30" : ""
            } ${isSameDay(day, new Date()) ? "bg-primary/20" : ""}`}
            onClick={() => openDay("day", day)}
          >
            <div
              className={`font-medium ${
                isSameDay(day, new Date()) ? "text-primary font-bold" : ""
              }`}
            >
              {format(day, "d")}
            </div>
            <div className="mt-1 space-y-1 max-h-[100px] overflow-auto">
              {dayTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded bg-primary/10 px-2 py-1 text-xs"
                >
                  {task.time} - {task.title}
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

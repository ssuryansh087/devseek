import {
  format,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  startOfMonth,
  endOfMonth,
  isSameMonth,
  addDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Card } from "@/components/ui/card";

export function YearView({ date }: { date: Date }) {
  const yearStart = startOfYear(date);
  const yearEnd = endOfYear(date);
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const renderMiniCalendar = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      calendarDays.push(day);
      day = addDays(day, 1);
    }

    return (
      <div className="mt-2">
        <div className="grid grid-cols-7 gap-1 text-center">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-xs text-muted-foreground">
              {d}
            </div>
          ))}
          {calendarDays.map((day) => (
            <div
              key={day.toString()}
              className={`text-xs ${
                !isSameMonth(day, month) ? "text-muted-foreground/50" : ""
              }`}
            >
              {format(day, "d")}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      {months.map((month) => (
        <Card key={month.toString()} className="p-4">
          <h3 className="text-center font-medium">{format(month, "MMMM")}</h3>
          {renderMiniCalendar(month)}
        </Card>
      ))}
    </div>
  );
}

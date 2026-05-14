import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/core/models/calendar_source.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show TimeOfDay;

class CalendarSeedData {
  static const List<CalendarSource> sources = [
    CalendarSource(id: 'work', name: '工作', color: CupertinoColors.systemRed),
    CalendarSource(
      id: 'personal',
      name: '个人',
      color: CupertinoColors.activeBlue,
    ),
  ];

  static Map<DateTime, List<CalendarEvent>> events(DateTime today) {
    final normalizedToday = DateTime(today.year, today.month, today.day);
    return {
      normalizedToday: [
        CalendarEvent(
          id: 'all-day-focus',
          title: '设计冲刺',
          date: normalizedToday,
          endDate: normalizedToday,
          start: const TimeOfDay(hour: 0, minute: 0),
          end: const TimeOfDay(hour: 23, minute: 59),
          calendarId: 'work',
          color: CupertinoColors.systemBlue,
          allDay: true,
          notes: '全天梳理日历 App 视觉与交互细节。',
        ),
        CalendarEvent(
          id: 'design-review',
          title: '设计评审',
          date: normalizedToday,
          endDate: normalizedToday,
          start: const TimeOfDay(hour: 9, minute: 30),
          end: const TimeOfDay(hour: 10, minute: 30),
          calendarId: 'work',
          color: CupertinoColors.systemRed,
          location: 'M3 会议室',
          notes: '确认首页视觉细节与交互。',
        ),
        CalendarEvent(
          id: 'lunch',
          title: '午餐',
          date: normalizedToday,
          endDate: normalizedToday,
          start: const TimeOfDay(hour: 12, minute: 0),
          end: const TimeOfDay(hour: 13, minute: 0),
          calendarId: 'personal',
          color: CupertinoColors.systemOrange,
          location: '静安办公室',
        ),
      ],
      normalizedToday.add(const Duration(days: 1)): [
        CalendarEvent(
          id: 'sync',
          title: '产品同步会',
          date: normalizedToday.add(const Duration(days: 1)),
          endDate: normalizedToday.add(const Duration(days: 1)),
          start: const TimeOfDay(hour: 10, minute: 0),
          end: const TimeOfDay(hour: 11, minute: 0),
          calendarId: 'work',
          color: CupertinoColors.systemGreen,
          location: '8F 大会议室',
        ),
      ],
    };
  }
}

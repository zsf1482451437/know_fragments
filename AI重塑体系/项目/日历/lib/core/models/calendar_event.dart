import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show TimeOfDay;

enum EventRepeatKind { none, interval, weekdays }

enum EventRepeatUnit { day, week, month, year }

enum EventAlert {
  atTimeOfEvent,
  fiveMinutesBefore,
  fifteenMinutesBefore,
  oneHourBefore,
  oneDayBefore,
}

class EventRepeatRule {
  const EventRepeatRule.none()
    : kind = EventRepeatKind.none,
      unit = EventRepeatUnit.day,
      interval = 1;

  const EventRepeatRule.weekdays()
    : kind = EventRepeatKind.weekdays,
      unit = EventRepeatUnit.week,
      interval = 1;

  const EventRepeatRule.interval({
    required this.unit,
    this.interval = 1,
  }) : kind = EventRepeatKind.interval;

  final EventRepeatKind kind;
  final EventRepeatUnit unit;
  final int interval;

  bool get isNone => kind == EventRepeatKind.none;

  @override
  bool operator ==(Object other) {
    return other is EventRepeatRule &&
        other.kind == kind &&
        other.unit == unit &&
        other.interval == interval;
  }

  @override
  int get hashCode => Object.hash(kind, unit, interval);
}

String eventRepeatLabel(EventRepeatRule rule) {
  switch (rule.kind) {
    case EventRepeatKind.none:
      return '从不';
    case EventRepeatKind.weekdays:
      return '工作日';
    case EventRepeatKind.interval:
      final unitLabel = switch (rule.unit) {
        EventRepeatUnit.day => '天',
        EventRepeatUnit.week => '周',
        EventRepeatUnit.month => '月',
        EventRepeatUnit.year => '年',
      };
      if (rule.interval <= 1) {
        return '每$unitLabel';
      }
      return '每 ${rule.interval} $unitLabel';
  }
}

String eventAlertLabel(EventAlert alert) {
  switch (alert) {
    case EventAlert.atTimeOfEvent:
      return '事件发生时';
    case EventAlert.fiveMinutesBefore:
      return '提前 5 分钟';
    case EventAlert.fifteenMinutesBefore:
      return '提前 15 分钟';
    case EventAlert.oneHourBefore:
      return '提前 1 小时';
    case EventAlert.oneDayBefore:
      return '提前 1 天';
  }
}

String eventAlertsSummary(List<EventAlert> alerts) {
  if (alerts.isEmpty) {
    return '无';
  }
  return alerts.map(eventAlertLabel).join('、');
}

class CalendarEvent {
  static const Object _sentinel = Object();

  const CalendarEvent({
    required this.id,
    required this.title,
    required this.date,
    required this.endDate,
    required this.start,
    required this.end,
    required this.calendarId,
    required this.color,
    this.location,
    this.notes,
    this.allDay = false,
    this.repeat = const EventRepeatRule.none(),
    this.alerts = const <EventAlert>[],
    this.invitees = const <String>[],
    this.url,
  });

  factory CalendarEvent.seed({
    required String title,
    required DateTime date,
    String? location,
  }) {
    return CalendarEvent(
      id: 'seed-${date.toIso8601String()}-$title',
      title: title,
      date: DateTime(date.year, date.month, date.day),
      endDate: DateTime(date.year, date.month, date.day),
      start: const TimeOfDay(hour: 18, minute: 0),
      end: const TimeOfDay(hour: 19, minute: 0),
      calendarId: 'personal',
      color: CupertinoColors.activeBlue,
      location: location,
    );
  }

  final String id;
  final String title;
  final DateTime date;
  final DateTime endDate;
  final TimeOfDay start;
  final TimeOfDay end;
  final String calendarId;
  final CupertinoDynamicColor color;
  final String? location;
  final String? notes;
  final bool allDay;
  final EventRepeatRule repeat;
  final List<EventAlert> alerts;
  final List<String> invitees;
  final String? url;

  CalendarEvent copyWith({
    String? id,
    String? title,
    DateTime? date,
    DateTime? endDate,
    TimeOfDay? start,
    TimeOfDay? end,
    String? calendarId,
    CupertinoDynamicColor? color,
    Object? location = _sentinel,
    Object? notes = _sentinel,
    EventRepeatRule? repeat,
    List<EventAlert>? alerts,
    List<String>? invitees,
    Object? url = _sentinel,
    bool? allDay,
  }) {
    return CalendarEvent(
      id: id ?? this.id,
      title: title ?? this.title,
      date: date ?? this.date,
      endDate: endDate ?? this.endDate,
      start: start ?? this.start,
      end: end ?? this.end,
      calendarId: calendarId ?? this.calendarId,
      color: color ?? this.color,
      location: identical(location, _sentinel)
          ? this.location
          : location as String?,
      notes: identical(notes, _sentinel) ? this.notes : notes as String?,
      repeat: repeat ?? this.repeat,
      alerts: alerts ?? this.alerts,
      invitees: invitees ?? this.invitees,
      url: identical(url, _sentinel) ? this.url : url as String?,
      allDay: allDay ?? this.allDay,
    );
  }
}

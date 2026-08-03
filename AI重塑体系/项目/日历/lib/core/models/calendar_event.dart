import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show TimeOfDay;

enum EventRepeatKind { none, interval, weekdays }

enum EventRepeatUnit { day, week, month, year }

enum EventAlertLeadTime {
  atTimeOfEvent,
  fiveMinutesBefore,
  fifteenMinutesBefore,
  oneHourBefore,
  oneDayBefore,
}

enum EventAlertTrigger {
  beforeEvent,
  timeToLeave,
  arriveAtLocation,
  leaveLocation,
}

class EventAlertSetting {
  const EventAlertSetting.beforeEvent(this.leadTime)
    : trigger = EventAlertTrigger.beforeEvent;

  const EventAlertSetting.timeToLeave()
    : trigger = EventAlertTrigger.timeToLeave,
      leadTime = null;

  const EventAlertSetting.arriveAtLocation()
    : trigger = EventAlertTrigger.arriveAtLocation,
      leadTime = null;

  const EventAlertSetting.leaveLocation()
    : trigger = EventAlertTrigger.leaveLocation,
      leadTime = null;

  final EventAlertTrigger trigger;
  final EventAlertLeadTime? leadTime;

  @override
  bool operator ==(Object other) {
    return other is EventAlertSetting &&
        other.trigger == trigger &&
        other.leadTime == leadTime;
  }

  @override
  int get hashCode => Object.hash(trigger, leadTime);
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

  const EventRepeatRule.interval({required this.unit, this.interval = 1})
    : kind = EventRepeatKind.interval;

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

String eventAlertLeadTimeLabel(EventAlertLeadTime alert) {
  switch (alert) {
    case EventAlertLeadTime.atTimeOfEvent:
      return '事件发生时';
    case EventAlertLeadTime.fiveMinutesBefore:
      return '提前 5 分钟';
    case EventAlertLeadTime.fifteenMinutesBefore:
      return '提前 15 分钟';
    case EventAlertLeadTime.oneHourBefore:
      return '提前 1 小时';
    case EventAlertLeadTime.oneDayBefore:
      return '提前 1 天';
  }
}

String eventAlertSettingLabel(EventAlertSetting setting) {
  switch (setting.trigger) {
    case EventAlertTrigger.beforeEvent:
      return eventAlertLeadTimeLabel(setting.leadTime!);
    case EventAlertTrigger.timeToLeave:
      return '出发时间';
    case EventAlertTrigger.arriveAtLocation:
      return '到达地点时';
    case EventAlertTrigger.leaveLocation:
      return '离开地点时';
  }
}

String eventAlertsSummary(List<EventAlertSetting> alerts) {
  if (alerts.isEmpty) {
    return '无';
  }
  return alerts.map(eventAlertSettingLabel).join('、');
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
    this.alerts = const <EventAlertSetting>[],
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
  final List<EventAlertSetting> alerts;
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
    List<EventAlertSetting>? alerts,
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

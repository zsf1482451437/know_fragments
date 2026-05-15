import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/core/models/calendar_source.dart';
import 'package:calendar_app/core/sample_data/calendar_seed_data.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show DateUtils, TimeOfDay;

enum CalendarView { month, day, list, search, inbox, calendars }

class CalendarStore extends ChangeNotifier {
  CalendarStore({
    required this.selectedDate,
    required this.focusedMonth,
    required this.calendarSources,
    required Map<DateTime, List<CalendarEvent>> seededEvents,
  }) : _events = seededEvents,
       visibleCalendarIds = calendarSources.map((source) => source.id).toSet();

  factory CalendarStore.bootstrap() {
    final today = DateTime(2026, 5, 13);
    return CalendarStore(
      selectedDate: today,
      focusedMonth: DateTime(today.year, today.month),
      calendarSources: CalendarSeedData.sources,
      seededEvents: CalendarSeedData.events(today),
    );
  }

  DateTime selectedDate;
  DateTime focusedMonth;
  CalendarView activeView = CalendarView.month;
  final List<CalendarSource> calendarSources;
  final Map<DateTime, List<CalendarEvent>> _events;
  final Set<String> visibleCalendarIds;

  void selectDate(DateTime value) {
    selectedDate = DateUtils.dateOnly(value);
    focusedMonth = DateTime(value.year, value.month);
    notifyListeners();
  }

  List<CalendarEvent> eventsFor(DateTime value) {
    final key = DateTime(value.year, value.month, value.day);
    return List<CalendarEvent>.unmodifiable(
      (_events[key] ?? const []).where(
        (event) => visibleCalendarIds.contains(event.calendarId),
      ),
    );
  }

  CalendarEvent? eventById(String id) {
    for (final entries in _events.values) {
      for (final event in entries) {
        if (event.id == id) {
          return event;
        }
      }
    }
    return null;
  }

  void createDraftEvent({
    required String title,
    required DateTime date,
    required DateTime endDate,
    required TimeOfDay start,
    required TimeOfDay end,
    required String calendarId,
    String? location,
    String? notes,
    EventRepeatRule repeat = const EventRepeatRule.none(),
    List<EventAlertSetting> alerts = const <EventAlertSetting>[],
    List<String> invitees = const <String>[],
    String? url,
    bool allDay = false,
  }) {
    final key = _eventDateKey(date);
    final items = _events.putIfAbsent(key, () => <CalendarEvent>[]);
    final source = _calendarSourceById(calendarId);
    items.add(
      CalendarEvent(
        id: 'draft-${DateTime.now().microsecondsSinceEpoch}',
        title: title.trim(),
        date: key,
        endDate: _eventDateKey(endDate),
        start: start,
        end: end,
        calendarId: calendarId,
        color: source?.color ?? CupertinoColors.activeBlue,
        location: _normalizedText(location),
        notes: _normalizedText(notes),
        repeat: repeat,
        alerts: _normalizedAlerts(alerts),
        invitees: _normalizedInvitees(invitees),
        url: _normalizedText(url),
        allDay: allDay,
      ),
    );
    selectedDate = key;
    focusedMonth = DateTime(key.year, key.month);
    notifyListeners();
  }

  void updateEvent({
    required String id,
    required String title,
    required DateTime date,
    required DateTime endDate,
    required TimeOfDay start,
    required TimeOfDay end,
    required String calendarId,
    String? location,
    String? notes,
    EventRepeatRule? repeat,
    List<EventAlertSetting>? alerts,
    List<String>? invitees,
    String? url,
    bool? allDay,
  }) {
    for (final entry in _events.entries) {
      final index = entry.value.indexWhere((event) => event.id == id);
      if (index == -1) {
        continue;
      }
      final existing = entry.value.removeAt(index);
      final targetKey = _eventDateKey(date);
      final source = _calendarSourceById(calendarId);
      final updated = existing.copyWith(
        title: title,
        date: targetKey,
        endDate: _eventDateKey(endDate),
        start: start,
        end: end,
        calendarId: calendarId,
        color: source?.color ?? existing.color,
        location: _normalizedText(location),
        notes: _normalizedText(notes),
        repeat: repeat ?? existing.repeat,
        alerts: alerts == null ? existing.alerts : _normalizedAlerts(alerts),
        invitees: invitees == null
            ? existing.invitees
            : _normalizedInvitees(invitees),
        url: url == null ? existing.url : _normalizedText(url),
        allDay: allDay ?? existing.allDay,
      );
      final targetItems = _events.putIfAbsent(
        targetKey,
        () => <CalendarEvent>[],
      );
      targetItems.add(updated);
      if (entry.value.isEmpty) {
        _events.remove(entry.key);
      }
      selectedDate = targetKey;
      focusedMonth = DateTime(targetKey.year, targetKey.month);
      notifyListeners();
      return;
    }
  }

  bool deleteEvent(String id) {
    for (final entry in _events.entries) {
      final index = entry.value.indexWhere((event) => event.id == id);
      if (index == -1) {
        continue;
      }
      entry.value.removeAt(index);
      if (entry.value.isEmpty) {
        _events.remove(entry.key);
      }
      notifyListeners();
      return true;
    }
    return false;
  }

  void setCalendarVisibility(String id, bool visible) {
    if (visible) {
      visibleCalendarIds.add(id);
    } else {
      visibleCalendarIds.remove(id);
    }
    notifyListeners();
  }

  bool isCalendarVisible(String id) {
    return visibleCalendarIds.contains(id);
  }

  bool hasEventsOn(DateTime value) {
    return eventsFor(value).isNotEmpty;
  }

  void setActiveView(CalendarView value) {
    if (activeView == value) {
      return;
    }
    activeView = value;
    notifyListeners();
  }

  void goToToday() {
    selectDate(DateTime(2026, 5, 13));
  }

  void goToPreviousMonth() {
    focusedMonth = DateTime(focusedMonth.year, focusedMonth.month - 1);
    selectedDate = DateTime(focusedMonth.year, focusedMonth.month, 1);
    notifyListeners();
  }

  void goToNextMonth() {
    focusedMonth = DateTime(focusedMonth.year, focusedMonth.month + 1);
    selectedDate = DateTime(focusedMonth.year, focusedMonth.month, 1);
    notifyListeners();
  }

  String? _normalizedText(String? value) {
    final trimmed = value?.trim();
    if (trimmed == null || trimmed.isEmpty) {
      return null;
    }
    return trimmed;
  }

  List<String> _normalizedInvitees(List<String> value) {
    return value
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList(growable: false);
  }

  List<EventAlertSetting> _normalizedAlerts(List<EventAlertSetting> value) {
    return value.toSet().toList(growable: false);
  }

  DateTime _eventDateKey(DateTime value) {
    return DateTime(value.year, value.month, value.day);
  }

  CalendarSource? _calendarSourceById(String id) {
    for (final source in calendarSources) {
      if (source.id == id) {
        return source;
      }
    }
    return null;
  }
}

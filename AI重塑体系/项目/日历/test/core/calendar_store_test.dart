import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:flutter/material.dart' show TimeOfDay;
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('selectDate updates selectedDate and focusedMonth together', () {
    final store = CalendarStore.bootstrap();
    final target = DateTime(2026, 5, 21);

    store.selectDate(target);

    expect(store.selectedDate, DateTime(2026, 5, 21));
    expect(store.focusedMonth, DateTime(2026, 5));
  });

  test('createEvent appends a new event for the selected date', () {
    final store = CalendarStore.bootstrap();
    final initialCount = store.eventsFor(store.selectedDate).length;

    store.createDraftEvent(
      title: '架构评审',
      date: store.selectedDate,
      endDate: store.selectedDate,
      start: const TimeOfDay(hour: 15, minute: 0),
      end: const TimeOfDay(hour: 16, minute: 0),
      calendarId: 'work',
      location: '1A',
      notes: '补充备注',
      repeat: const EventRepeatRule.interval(unit: EventRepeatUnit.week),
      alerts: const [
        EventAlertSetting.beforeEvent(EventAlertLeadTime.fifteenMinutesBefore),
        EventAlertSetting.timeToLeave(),
      ],
      invitees: const ['foo@bytedance.com'],
      url: 'https://calendar.local/arch',
    );

    expect(store.eventsFor(store.selectedDate), hasLength(initialCount + 1));
    expect(store.eventsFor(store.selectedDate).last.title, '架构评审');
    expect(
      store.eventsFor(store.selectedDate).last.repeat,
      const EventRepeatRule.interval(unit: EventRepeatUnit.week),
    );
  });

  test(
    'updateEvent overwrites an existing event instead of duplicating it',
    () {
      final store = CalendarStore.bootstrap();
      final originalDay = store.selectedDate;
      final nextDay = originalDay.add(const Duration(days: 1));

      store.updateEvent(
        id: 'design-review',
        title: '设计评审-更新',
        date: nextDay,
        endDate: nextDay.add(const Duration(days: 1)),
        start: const TimeOfDay(hour: 14, minute: 0),
        end: const TimeOfDay(hour: 15, minute: 0),
        calendarId: 'personal',
        location: 'N5',
        notes: '新的备注',
        repeat: EventRepeatRule.interval(
          unit: EventRepeatUnit.week,
          interval: 2,
        ),
        alerts: const [
          EventAlertSetting.beforeEvent(EventAlertLeadTime.oneHourBefore),
          EventAlertSetting.arriveAtLocation(),
        ],
        invitees: const ['a@bytedance.com', 'b@bytedance.com'],
        url: 'https://calendar.local/review',
        allDay: true,
      );

      final originalDateEvents = store.eventsFor(originalDay);
      final events = store.eventsFor(nextDay);
      final updatedEvent = events.firstWhere(
        (event) => event.id == 'design-review',
      );
      expect(
        originalDateEvents.where((event) => event.id == 'design-review'),
        isEmpty,
      );
      expect(events, hasLength(2));
      expect(updatedEvent.title, '设计评审-更新');
      expect(updatedEvent.location, 'N5');
      expect(updatedEvent.notes, '新的备注');
      expect(updatedEvent.calendarId, 'personal');
      expect(updatedEvent.allDay, isTrue);
      expect(
        updatedEvent.repeat,
        const EventRepeatRule.interval(
          unit: EventRepeatUnit.week,
          interval: 2,
        ),
      );
      expect(updatedEvent.alerts, [
        const EventAlertSetting.beforeEvent(EventAlertLeadTime.oneHourBefore),
        const EventAlertSetting.arriveAtLocation(),
      ]);
      expect(updatedEvent.invitees, ['a@bytedance.com', 'b@bytedance.com']);
      expect(updatedEvent.url, 'https://calendar.local/review');
      expect(updatedEvent.endDate, DateTime(2026, 5, 15));
      expect(store.selectedDate, DateTime(2026, 5, 14));
      expect(store.focusedMonth, DateTime(2026, 5));
      expect(
        store
            .eventsFor(store.selectedDate)
            .where((event) => event.id == 'design-review'),
        isNotEmpty,
      );
    },
  );

  test('deleteEvent removes the target event from its date bucket', () {
    final store = CalendarStore.bootstrap();

    final deleted = store.deleteEvent('design-review');

    expect(deleted, isTrue);
    expect(
      store
          .eventsFor(store.selectedDate)
          .where((event) => event.id == 'design-review'),
      isEmpty,
    );
  });

  test(
    'toggleCalendarVisibility updates visible state for a calendar source',
    () {
      final store = CalendarStore.bootstrap();
      final sourceId = store.calendarSources.first.id;

      store.setCalendarVisibility(sourceId, false);

      expect(store.visibleCalendarIds.contains(sourceId), isFalse);
    },
  );
}

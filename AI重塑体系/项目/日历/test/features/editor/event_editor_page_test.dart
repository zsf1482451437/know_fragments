import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('creating an event from the editor supports full form fields', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('agenda-add-button')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    final addButton = tester.widget<GestureDetector>(
      find.byKey(const ValueKey('agenda-add-button')),
    );
    addButton.onTap!();
    await tester.pumpAndSettle();

    await tester.enterText(
      find.byKey(const ValueKey('event-title-field')),
      '晚餐',
    );
    await tester.enterText(
      find.byKey(const ValueKey('event-location-field')),
      '静安',
    );
    await tester.enterText(
      find.byKey(const ValueKey('event-url-field')),
      'https://calendar.local/dinner',
    );
    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('event-notes-field')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byKey(const ValueKey('event-notes-field')),
      '和产品一起吃饭',
    );
    final startDateButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('event-start-date-row')),
    );
    startDateButton.onPressed!();
    await tester.pumpAndSettle();
    final datePicker = tester.widget<CupertinoDatePicker>(
      find.byKey(const ValueKey('event-start-date-picker')),
    );
    datePicker.onDateTimeChanged(DateTime(2026, 5, 14));
    await tester.tap(find.byKey(const ValueKey('event-picker-done-button')));
    await tester.pumpAndSettle();

    final startTimeButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('event-start-time-row')),
    );
    startTimeButton.onPressed!();
    await tester.pumpAndSettle();
    final startTimePicker = tester.widget<CupertinoDatePicker>(
      find.byKey(const ValueKey('event-start-time-picker')),
    );
    startTimePicker.onDateTimeChanged(DateTime(2026, 5, 14, 20, 0));
    await tester.tap(find.byKey(const ValueKey('event-picker-done-button')));
    await tester.pumpAndSettle();

    final endTimeButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('event-end-time-row')),
    );
    endTimeButton.onPressed!();
    await tester.pumpAndSettle();
    final endTimePicker = tester.widget<CupertinoDatePicker>(
      find.byKey(const ValueKey('event-end-time-picker')),
    );
    endTimePicker.onDateTimeChanged(DateTime(2026, 5, 14, 21, 30));
    await tester.tap(find.byKey(const ValueKey('event-picker-done-button')));
    await tester.pumpAndSettle();

    final calendarButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('event-calendar-row')),
    );
    calendarButton.onPressed!();
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('event-calendar-option-work')));
    await tester.pumpAndSettle();

    final repeatButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('event-repeat-row')),
    );
    repeatButton.onPressed!();
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('repeat-mode-custom')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('repeat-custom-interval-plus')));
    await tester.pumpAndSettle();
    final unitButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('repeat-custom-unit-row')),
    );
    unitButton.onPressed!();
    await tester.pumpAndSettle();
    await tester.tap(
      find.byKey(const ValueKey('repeat-custom-unit-option-week')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('repeat-rule-done-button')));
    await tester.pumpAndSettle();

    final alertButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('event-alert-row')),
    );
    alertButton.onPressed!();
    await tester.pumpAndSettle();
    await tester.tap(
      find.byKey(const ValueKey('alerts-option-fifteenMinutesBefore')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('alerts-option-oneDayBefore')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('alerts-done-button')));
    await tester.pumpAndSettle();

    final inviteesButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('event-invitees-row')),
    );
    inviteesButton.onPressed!();
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('invitee-option-ava')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('invitee-option-leo')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('invitees-done-button')));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('event-editor-save-button')),
      80,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.tap(find.byKey(const ValueKey('event-editor-save-button')));
    await tester.pumpAndSettle();

    expect(find.text('晚餐'), findsOneWidget);
    expect(find.text('和产品一起吃饭'), findsOneWidget);
  });
}

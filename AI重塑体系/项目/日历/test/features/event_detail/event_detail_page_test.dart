import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('tapping a month agenda event opens the event detail page', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('agenda-event-design-review')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    final monthGesture = tester.widget<GestureDetector>(
      find.byKey(const ValueKey('agenda-event-design-review')),
    );
    monthGesture.onTap!();
    await tester.pumpAndSettle();

    expect(find.text('设计评审'), findsWidgets);
    expect(find.text('M3 会议室'), findsOneWidget);
    expect(find.text('确认首页视觉细节与交互。'), findsOneWidget);
  });

  testWidgets('expanded day event can open the event detail page', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());
    await tester.tap(find.byKey(const ValueKey('nav-day')));
    await tester.pumpAndSettle();

    final gesture = tester.widget<GestureDetector>(
      find.byKey(const ValueKey('day-event-design-review')),
    );
    gesture.onTap!();
    await tester.pumpAndSettle();

    await tester.ensureVisible(
      find.byKey(const ValueKey('day-event-detail-design-review')),
    );
    final detailButton = tester.widget<CupertinoButton>(
      find.byKey(const ValueKey('day-event-detail-design-review')),
    );
    detailButton.onPressed!();
    await tester.pumpAndSettle();

    expect(find.text('设计评审'), findsWidgets);
    expect(find.text('09:30 - 10:30'), findsOneWidget);
  });

  testWidgets('event detail page can open editor with prefilled fields', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('agenda-event-design-review')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    final monthGesture = tester.widget<GestureDetector>(
      find.byKey(const ValueKey('agenda-event-design-review')),
    );
    monthGesture.onTap!();
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('event-detail-edit-button')));
    await tester.pumpAndSettle();

    expect(find.text('编辑事件'), findsOneWidget);
    expect(
      tester
          .widget<CupertinoTextField>(
            find.byKey(const ValueKey('event-title-field')),
          )
          .controller
          ?.text,
      '设计评审',
    );
    expect(
      tester
          .widget<CupertinoTextField>(
            find.byKey(const ValueKey('event-location-field')),
          )
          .controller
          ?.text,
      'M3 会议室',
    );
    expect(find.byKey(const ValueKey('event-start-date-row')), findsOneWidget);
    expect(find.byKey(const ValueKey('event-start-time-row')), findsOneWidget);
    expect(find.byKey(const ValueKey('event-calendar-row')), findsOneWidget);
    expect(find.byKey(const ValueKey('event-repeat-row')), findsOneWidget);
    expect(find.byKey(const ValueKey('event-alert-row')), findsOneWidget);
    expect(find.byKey(const ValueKey('event-invitees-row')), findsOneWidget);
  });

  testWidgets(
    'editing from detail page updates time all-day calendar and notes',
    (WidgetTester tester) async {
      await tester.pumpWidget(const CalendarApp());

      await tester.scrollUntilVisible(
        find.byKey(const ValueKey('agenda-event-design-review')),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      final monthGesture = tester.widget<GestureDetector>(
        find.byKey(const ValueKey('agenda-event-design-review')),
      );
      monthGesture.onTap!();
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const ValueKey('event-detail-edit-button')));
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const ValueKey('event-title-field')),
        '设计评审-已更新',
      );
      await tester.enterText(
        find.byKey(const ValueKey('event-location-field')),
        'N5 Focus Room',
      );
      await tester.enterText(
        find.byKey(const ValueKey('event-url-field')),
        'https://calendar.local/design-review',
      );
      await tester.scrollUntilVisible(
        find.byKey(const ValueKey('event-notes-field')),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();
      await tester.enterText(
        find.byKey(const ValueKey('event-notes-field')),
        '已切到全天并更换到个人日历',
      );
      final allDaySwitch = tester.widget<CupertinoSwitch>(
        find.byKey(const ValueKey('event-all-day-switch')),
      );
      allDaySwitch.onChanged!(true);
      await tester.pumpAndSettle();

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

      final endDateButton = tester.widget<CupertinoButton>(
        find.byKey(const ValueKey('event-end-date-row')),
      );
      endDateButton.onPressed!();
      await tester.pumpAndSettle();
      final endDatePicker = tester.widget<CupertinoDatePicker>(
        find.byKey(const ValueKey('event-end-date-picker')),
      );
      endDatePicker.onDateTimeChanged(DateTime(2026, 5, 15));
      await tester.tap(find.byKey(const ValueKey('event-picker-done-button')));
      await tester.pumpAndSettle();

      final calendarButton = tester.widget<CupertinoButton>(
        find.byKey(const ValueKey('event-calendar-row')),
      );
      calendarButton.onPressed!();
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(const ValueKey('event-calendar-option-personal')),
      );
      await tester.pumpAndSettle();

      final repeatButton = tester.widget<CupertinoButton>(
        find.byKey(const ValueKey('event-repeat-row')),
      );
      repeatButton.onPressed!();
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('repeat-mode-weekdays')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('repeat-rule-done-button')));
      await tester.pumpAndSettle();

      final alertButton = tester.widget<CupertinoButton>(
        find.byKey(const ValueKey('event-alert-row')),
      );
      alertButton.onPressed!();
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(const ValueKey('alerts-option-oneHourBefore')),
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(const ValueKey('alerts-advanced-timeToLeave')),
      );
      await tester.pumpAndSettle();
      await tester.tap(
        find.byKey(const ValueKey('alerts-advanced-arriveAtLocation')),
      );
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
      await tester.tap(find.byKey(const ValueKey('invitee-option-zoe')));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('invitees-done-button')));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const ValueKey('event-editor-save-button')));
      await tester.pumpAndSettle();

      expect(find.text('设计评审-已更新'), findsWidgets);
      expect(find.text('N5 Focus Room'), findsOneWidget);
      expect(find.text('5月14日 - 5月15日 · 全天'), findsOneWidget);
      expect(find.text('工作日'), findsOneWidget);
      expect(find.text('提醒'), findsOneWidget);
      expect(find.text('事件提醒'), findsOneWidget);
      expect(find.text('提前 1 小时'), findsOneWidget);
      expect(find.text('地点与出发'), findsOneWidget);
      expect(find.text('出发时间'), findsOneWidget);
      expect(find.text('到达地点时'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('ava@bytedance.com、zoe@bytedance.com'),
        120,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('ava@bytedance.com、zoe@bytedance.com'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('https://calendar.local/design-review'),
        120,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('https://calendar.local/design-review'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('已切到全天并更换到个人日历'),
        120,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('已切到全天并更换到个人日历'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('个人'),
        80,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('个人'), findsOneWidget);

      await tester.pageBack();
      await tester.pumpAndSettle();

      expect(find.text('设计评审-已更新'), findsOneWidget);
      expect(find.text('设计评审'), findsNothing);
      expect(
        find.byKey(const ValueKey('agenda-event-design-review')),
        findsOneWidget,
      );
    },
  );

  testWidgets('deleting from detail page removes the event and returns', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.scrollUntilVisible(
      find.byKey(const ValueKey('agenda-event-design-review')),
      200,
      scrollable: find.byType(Scrollable).first,
    );
    final monthGesture = tester.widget<GestureDetector>(
      find.byKey(const ValueKey('agenda-event-design-review')),
    );
    monthGesture.onTap!();
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const ValueKey('event-detail-delete-button')));
    await tester.pumpAndSettle();

    expect(find.text('删除这个事件？'), findsOneWidget);

    await tester.tap(
      find.byKey(const ValueKey('event-detail-confirm-delete-button')),
    );
    await tester.pumpAndSettle();

    expect(find.text('删除这个事件？'), findsNothing);
    expect(
      find.byKey(const ValueKey('agenda-event-design-review')),
      findsNothing,
    );
    expect(find.text('设计评审'), findsNothing);
  });
}

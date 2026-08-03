import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('calendars page lists visible calendar sources', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.text('Calendars'));
    await tester.pumpAndSettle();

    expect(find.text('工作'), findsOneWidget);
    expect(find.text('个人'), findsOneWidget);
  });

  testWidgets(
    'disabling a calendar hides matching events from the month agenda',
    (WidgetTester tester) async {
      await tester.pumpWidget(const CalendarApp());

      await tester.tap(find.text('Calendars'));
      await tester.pumpAndSettle();
      await tester.tap(find.byKey(const ValueKey('calendar-toggle-work')));
      await tester.pumpAndSettle();
      await tester.tap(find.text('完成'));
      await tester.pumpAndSettle();

      expect(find.text('设计评审'), findsNothing);
    },
  );
}

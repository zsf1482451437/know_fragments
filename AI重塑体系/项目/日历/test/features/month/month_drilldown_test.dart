import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('tapping the selected day again drills down from month to day page', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(
      find.byKey(const ValueKey('month-day-2026-05-13T00:00:00.000')),
    );
    await tester.pumpAndSettle();

    expect(find.byKey(const ValueKey('day-timeline-scroll')), findsOneWidget);
    expect(find.text('5月13日'), findsWidgets);
  });
}

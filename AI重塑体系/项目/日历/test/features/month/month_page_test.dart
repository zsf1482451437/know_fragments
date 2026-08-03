import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('month page shows month header and selected-day agenda', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    expect(find.text('Calendars'), findsOneWidget);
    expect(find.text('今天'), findsOneWidget);
    expect(find.text('2026'), findsOneWidget);
    expect(find.text('5月'), findsWidgets);
    expect(find.text('星期三'), findsOneWidget);
    expect(find.text('设计评审'), findsOneWidget);
  });

  testWidgets('tapping a month cell updates the agenda sheet', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(
      find.byKey(const ValueKey('month-day-2026-05-14T00:00:00.000')),
    );
    await tester.pumpAndSettle();

    expect(find.text('产品同步会'), findsOneWidget);
    expect(find.text('设计评审'), findsNothing);
  });
}

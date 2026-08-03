import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('app shell shows month, list, inbox and search entry points', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    expect(find.text('Calendars'), findsOneWidget);
    expect(find.text('月视图'), findsOneWidget);
    expect(find.text('列表'), findsOneWidget);
    expect(find.text('收件箱'), findsOneWidget);
    expect(find.byIcon(CupertinoIcons.search), findsOneWidget);
  });
}

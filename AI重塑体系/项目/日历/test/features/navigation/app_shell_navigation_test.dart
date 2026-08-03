import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shell can navigate to day, list, search and inbox experiences', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.byKey(const ValueKey('nav-day')));
    await tester.pumpAndSettle();
    expect(find.text('5月13日'), findsWidgets);

    await tester.tap(find.byKey(const ValueKey('nav-list')));
    await tester.pumpAndSettle();
    expect(find.text('已安排'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('nav-month')));
    await tester.pumpAndSettle();
    await tester.tap(find.byIcon(CupertinoIcons.search));
    await tester.pumpAndSettle();
    expect(find.text('搜索事件、地点或备注'), findsOneWidget);

    await tester.tap(find.byKey(const ValueKey('nav-inbox')));
    await tester.pumpAndSettle();
    expect(find.text('没有新邀请'), findsOneWidget);
  });
}

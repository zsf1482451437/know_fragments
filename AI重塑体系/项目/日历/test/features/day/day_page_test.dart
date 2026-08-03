import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('day page uses the date selected on month page', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(
      find.byKey(const ValueKey('month-day-2026-05-14T00:00:00.000')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('nav-day')));
    await tester.pumpAndSettle();

    expect(find.text('5月14日'), findsOneWidget);
    expect(find.text('产品同步会'), findsOneWidget);
    expect(find.text('10:00'), findsOneWidget);
  });

  testWidgets(
    'today day page auto scrolls near current time and header can collapse',
    (WidgetTester tester) async {
      await tester.pumpWidget(const CalendarApp());
      await tester.tap(find.byKey(const ValueKey('nav-day')));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      final scrollable = tester.state<ScrollableState>(
        find.byType(Scrollable).first,
      );
      expect(scrollable.position.pixels, greaterThan(700));

      await tester.drag(
        find.byKey(const ValueKey('day-timeline-scroll')),
        const Offset(0, -240),
      );
      await tester.pumpAndSettle();

      expect(
        find.byKey(const ValueKey('day-header-compact-label')),
        findsOneWidget,
      );
    },
  );

  testWidgets('tapping a timed event expands its details', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());
    await tester.tap(
      find.byKey(const ValueKey('month-day-2026-05-13T00:00:00.000')),
    );
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('nav-day')));
    await tester.pump();
    await tester.pumpAndSettle();

    expect(find.text('确认首页视觉细节与交互。'), findsNothing);

    await tester.ensureVisible(
      find.byKey(const ValueKey('day-event-design-review')),
    );
    final gesture = tester.widget<GestureDetector>(
      find.byKey(const ValueKey('day-event-design-review')),
    );
    gesture.onTap!();
    await tester.pumpAndSettle();

    expect(find.text('确认首页视觉细节与交互。'), findsOneWidget);
  });
}

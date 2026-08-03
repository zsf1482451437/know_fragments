import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  void prepareView(WidgetTester tester) {
    tester.view.physicalSize = const Size(1179, 2556);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  }

  testWidgets(
    'calendar app smoke flow covers month selection and event creation',
    (WidgetTester tester) async {
      prepareView(tester);
      await tester.pumpWidget(const CalendarApp());

      expect(find.text('Calendars'), findsOneWidget);
      expect(
        find.byKey(const ValueKey('month-day-2026-05-14T00:00:00.000')),
        findsOneWidget,
      );

      await tester.tap(
        find.byKey(const ValueKey('month-day-2026-05-14T00:00:00.000')),
      );
      await tester.pumpAndSettle();
      expect(find.text('产品同步会'), findsOneWidget);

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
        '走查',
      );
      await tester.tap(find.text('添加'));
      await tester.pumpAndSettle();

      expect(find.text('走查'), findsOneWidget);
    },
  );
}

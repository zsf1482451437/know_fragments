import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:flutter/widgets.dart';

class CalendarScope extends InheritedNotifier<CalendarStore> {
  const CalendarScope({
    super.key,
    required CalendarStore notifier,
    required super.child,
  }) : super(notifier: notifier);

  static CalendarStore of(BuildContext context) {
    final scope =
        context.dependOnInheritedWidgetOfExactType<CalendarScope>();
    assert(scope != null, 'CalendarScope is missing in the widget tree.');
    return scope!.notifier!;
  }
}

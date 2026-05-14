import 'package:calendar_app/app/calendar_app_shell.dart';
import 'package:calendar_app/core/store/calendar_scope.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:flutter/cupertino.dart';

class CalendarApp extends StatelessWidget {
  const CalendarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return CalendarScope(
      notifier: CalendarStore.bootstrap(),
      child: const CupertinoApp(
        debugShowCheckedModeBanner: false,
        title: '日历',
        home: CalendarAppShell(),
      ),
    );
  }
}

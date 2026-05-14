import 'package:calendar_app/core/store/calendar_scope.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:calendar_app/features/calendars/calendars_page.dart';
import 'package:calendar_app/features/day/day_page.dart';
import 'package:calendar_app/features/inbox/inbox_page.dart';
import 'package:calendar_app/features/list/list_page.dart';
import 'package:calendar_app/features/month/month_page.dart';
import 'package:calendar_app/features/search/search_page.dart';
import 'package:calendar_app/features/shared/app_bottom_bar.dart';
import 'package:flutter/cupertino.dart';

class CalendarAppShell extends StatelessWidget {
  const CalendarAppShell({super.key});

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    final activeChild = switch (store.activeView) {
      CalendarView.month => const MonthPage(),
      CalendarView.list => const ListPage(),
      CalendarView.inbox => const InboxPage(),
      CalendarView.search => const SearchPage(),
      CalendarView.day => const DayPage(),
      CalendarView.calendars => const CalendarsPage(),
    };
    return CupertinoPageScaffold(
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 240),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                transitionBuilder: (child, animation) {
                  final offsetAnimation = Tween<Offset>(
                    begin: const Offset(0.04, 0),
                    end: Offset.zero,
                  ).animate(animation);
                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: offsetAnimation,
                      child: child,
                    ),
                  );
                },
                child: KeyedSubtree(
                  key: ValueKey(store.activeView),
                  child: activeChild,
                ),
              ),
            ),
            AppBottomBar(
              activeView: store.activeView,
              onSelect: store.setActiveView,
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:calendar_app/core/store/calendar_scope.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:calendar_app/features/editor/event_editor_page.dart';
import 'package:calendar_app/features/event_detail/event_detail_route.dart';
import 'package:calendar_app/features/month/widgets/agenda_sheet.dart';
import 'package:calendar_app/features/month/widgets/month_grid.dart';
import 'package:calendar_app/features/month/widgets/month_header.dart';
import 'package:calendar_app/features/month/widgets/week_strip.dart';
import 'package:flutter/cupertino.dart';

class MonthPage extends StatelessWidget {
  const MonthPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    void openEventDetails(event) {
      Navigator.of(context).push(buildEventDetailRoute(event));
    }

    void handleMonthDateTap(DateTime date) {
      final normalizedSelected = DateTime(
        store.selectedDate.year,
        store.selectedDate.month,
        store.selectedDate.day,
      );
      final normalizedTarget = DateTime(date.year, date.month, date.day);
      if (normalizedSelected == normalizedTarget) {
        store.setActiveView(CalendarView.day);
        return;
      }
      store.selectDate(date);
    }

    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Column(
            children: [
              MonthHeader(
                focusedMonth: store.focusedMonth,
                onCalendarsPressed: () {
                  store.setActiveView(CalendarView.calendars);
                },
                onTodayPressed: store.goToToday,
                onPreviousMonth: store.goToPreviousMonth,
                onNextMonth: store.goToNextMonth,
                onSearchPressed: () {
                  store.setActiveView(CalendarView.search);
                },
              ),
              WeekStrip(
                selectedDate: store.selectedDate,
                onDateSelected: store.selectDate,
              ),
              MonthGrid(
                focusedMonth: store.focusedMonth,
                selectedDate: store.selectedDate,
                hasEventsOn: store.hasEventsOn,
                onDateSelected: handleMonthDateTap,
              ),
              AgendaSheet(
                selectedDate: store.selectedDate,
                events: store.eventsFor(store.selectedDate),
                onDayPressed: () {
                  store.setActiveView(CalendarView.day);
                },
                onEventPressed: openEventDetails,
                onAddPressed: () {
                  Navigator.of(context).push(
                    CupertinoPageRoute<void>(
                      builder: (_) => const EventEditorPage(),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

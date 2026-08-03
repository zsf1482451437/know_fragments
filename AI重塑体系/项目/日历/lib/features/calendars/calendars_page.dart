import 'package:calendar_app/core/store/calendar_scope.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:calendar_app/features/shared/empty_state.dart';
import 'package:flutter/cupertino.dart';

class CalendarsPage extends StatelessWidget {
  const CalendarsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
          child: Row(
            children: [
              const Expanded(
                child: Text(
                  'Calendars',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => store.setActiveView(CalendarView.month),
                child: const Text('完成'),
              ),
            ],
          ),
        ),
        Expanded(
          child: store.calendarSources.isEmpty
              ? const EmptyState(message: '没有日历')
              : ListView(
                  children: store.calendarSources.map((source) {
                    final visible = store.isCalendarVisible(source.id);
                    return CupertinoButton(
                      key: ValueKey('calendar-toggle-${source.id}'),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      onPressed: () {
                        store.setCalendarVisibility(source.id, !visible);
                      },
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: source.color.resolveFrom(context),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              source.name,
                              style: const TextStyle(
                                color: CupertinoColors.label,
                                fontSize: 17,
                              ),
                            ),
                          ),
                          Icon(
                            visible
                                ? CupertinoIcons.check_mark_circled_solid
                                : CupertinoIcons.circle,
                            color: visible
                                ? CupertinoColors.activeBlue
                                : CupertinoColors.systemGrey3,
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
        ),
      ],
    );
  }
}

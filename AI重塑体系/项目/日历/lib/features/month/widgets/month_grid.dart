import 'package:calendar_app/core/utils/date_utils.dart' as calendar_date;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show DateUtils;

class MonthGrid extends StatelessWidget {
  const MonthGrid({
    super.key,
    required this.focusedMonth,
    required this.selectedDate,
    required this.hasEventsOn,
    required this.onDateSelected,
  });

  final DateTime focusedMonth;
  final DateTime selectedDate;
  final bool Function(DateTime date) hasEventsOn;
  final ValueChanged<DateTime> onDateSelected;

  @override
  Widget build(BuildContext context) {
    final cells = calendar_date.visibleMonthCells(focusedMonth);
    final secondaryText = CupertinoColors.secondaryLabel.resolveFrom(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: Column(
        children: [
          Row(
            children: '一二三四五六日'
                .split('')
                .map(
                  (weekday) => Expanded(
                    child: Center(
                      child: Text(
                        weekday,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: secondaryText,
                        ),
                      ),
                    ),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 10),
          ...List.generate(cells.length ~/ 7, (rowIndex) {
            final row = cells.skip(rowIndex * 7).take(7).toList();
            return Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: row.map((date) {
                  if (date == null) {
                    return const Expanded(child: SizedBox(height: 50));
                  }
                  final normalized = DateUtils.dateOnly(date);
                  final selected = DateUtils.isSameDay(
                    normalized,
                    selectedDate,
                  );
                  final isToday = DateUtils.isSameDay(
                    normalized,
                    DateTime.now(),
                  );
                  final hasEvents = hasEventsOn(normalized);
                  return Expanded(
                    child: CupertinoButton(
                      key: ValueKey(
                        'month-day-${normalized.toIso8601String()}',
                      ),
                      padding: EdgeInsets.zero,
                      minimumSize: const Size.square(50),
                      onPressed: () => onDateSelected(normalized),
                      child: SizedBox(
                        height: 50,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            AnimatedContainer(
                              duration: const Duration(milliseconds: 220),
                              curve: Curves.easeOutCubic,
                              width: 30,
                              height: 30,
                              decoration: BoxDecoration(
                                color: selected
                                    ? CupertinoColors.systemRed.resolveFrom(
                                        context,
                                      )
                                    : CupertinoColors.transparent,
                                shape: BoxShape.circle,
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                '${normalized.day}',
                                style: TextStyle(
                                  color: selected
                                      ? CupertinoColors.white
                                      : (isToday
                                            ? CupertinoColors.systemRed
                                                  .resolveFrom(context)
                                            : CupertinoColors.label.resolveFrom(
                                                context,
                                              )),
                                  fontWeight: selected || isToday
                                      ? FontWeight.w700
                                      : FontWeight.w500,
                                  fontSize: 17,
                                ),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              width: 5,
                              height: 5,
                              decoration: BoxDecoration(
                                color: hasEvents
                                    ? (selected
                                          ? CupertinoColors.white
                                          : CupertinoColors.systemRed
                                                .resolveFrom(context))
                                    : CupertinoColors.transparent,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            );
          }),
        ],
      ),
    );
  }
}

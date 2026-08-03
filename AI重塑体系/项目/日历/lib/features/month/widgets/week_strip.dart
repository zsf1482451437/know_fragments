import 'package:calendar_app/core/utils/date_utils.dart' as calendar_date;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show DateUtils;

class WeekStrip extends StatelessWidget {
  const WeekStrip({
    super.key,
    required this.selectedDate,
    required this.onDateSelected,
  });

  final DateTime selectedDate;
  final ValueChanged<DateTime> onDateSelected;

  @override
  Widget build(BuildContext context) {
    final week = calendar_date.visibleWeekFor(selectedDate);
    return SizedBox(
      height: 88,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        scrollDirection: Axis.horizontal,
        itemBuilder: (context, index) {
          final date = week[index];
          final selected = DateUtils.isSameDay(date, selectedDate);
          final isToday = DateUtils.isSameDay(date, DateTime.now());
          final cardColor = selected
              ? CupertinoColors.systemRed.resolveFrom(context)
              : CupertinoColors.secondarySystemGroupedBackground.resolveFrom(
                  context,
                );
          return CupertinoButton(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            minimumSize: const Size(60, 78),
            onPressed: () => onDateSelected(date),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(22),
                boxShadow: selected
                    ? [
                        BoxShadow(
                          color: CupertinoColors.systemRed
                              .resolveFrom(context)
                              .withValues(alpha: 0.24),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ]
                    : null,
              ),
              child: SizedBox(
                width: 56,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 220),
                      width: 5,
                      height: 5,
                      decoration: BoxDecoration(
                        color: isToday
                            ? (selected
                                  ? CupertinoColors.white
                                  : CupertinoColors.systemRed)
                            : CupertinoColors.transparent,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '一二三四五六日'[date.weekday - 1],
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: selected
                            ? CupertinoColors.white
                            : (isToday
                                  ? CupertinoColors.systemRed
                                  : CupertinoColors.secondaryLabel.resolveFrom(
                                      context,
                                    )),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${date.day}',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w700,
                        color: selected
                            ? CupertinoColors.white
                            : CupertinoColors.label.resolveFrom(context),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
        separatorBuilder: (_, _) => const SizedBox(width: 2),
        itemCount: week.length,
      ),
    );
  }
}

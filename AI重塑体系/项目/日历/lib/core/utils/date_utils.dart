import 'package:flutter/material.dart' show DateUtils;

List<DateTime?> visibleMonthCells(DateTime month) {
  final firstDay = DateTime(month.year, month.month, 1);
  final leading = firstDay.weekday - 1;
  final daysInMonth = DateTime(month.year, month.month + 1, 0).day;
  final cells = <DateTime?>[
    ...List<DateTime?>.filled(leading, null),
    for (var day = 1; day <= daysInMonth; day++)
      DateTime(month.year, month.month, day),
  ];

  while (cells.length % 7 != 0) {
    cells.add(null);
  }
  return cells;
}

List<DateTime> visibleWeekFor(DateTime date) {
  final normalized = DateUtils.dateOnly(date);
  final monday = normalized.subtract(Duration(days: normalized.weekday - 1));
  return List<DateTime>.generate(
    7,
    (index) => monday.add(Duration(days: index)),
  );
}

String monthLabel(DateTime date) => '${date.month}月';

String weekdayLabel(DateTime date) {
  const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  return weekdays[date.weekday - 1];
}

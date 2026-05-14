import 'package:flutter/cupertino.dart';

class CalendarSource {
  const CalendarSource({
    required this.id,
    required this.name,
    required this.color,
  });

  final String id;
  final String name;
  final CupertinoDynamicColor color;
}

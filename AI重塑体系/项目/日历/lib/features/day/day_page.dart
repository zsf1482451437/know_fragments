import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/core/store/calendar_scope.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:calendar_app/features/event_detail/event_detail_route.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show TimeOfDay;

class DayPage extends StatefulWidget {
  const DayPage({super.key});

  @override
  State<DayPage> createState() => _DayPageState();
}

class _DayPageState extends State<DayPage> {
  static const double _hourRowHeight = 68;
  static const double _timelineLeadingWidth = 62;
  static const double _timelineLeftInset = 74;
  static final DateTime _demoNow = DateTime(2026, 5, 13, 14, 18);

  final ScrollController _scrollController = ScrollController();
  final Set<String> _expandedEventIds = <String>{};

  DateTime? _handledSelectedDate;
  double _scrollOffset = 0;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_handleScroll);
  }

  @override
  void dispose() {
    _scrollController
      ..removeListener(_handleScroll)
      ..dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    final selectedDate = store.selectedDate;
    _syncSelectedDate(selectedDate);

    final events = store.eventsFor(selectedDate);
    final allDayEvents = events.where((event) => event.allDay).toList();
    final timedEvents = events.where((event) => !event.allDay).toList()
      ..sort((a, b) => _compareTimeOfDay(a.start, b.start));
    final collapseProgress = (_scrollOffset / 120).clamp(0.0, 1.0);

    return Column(
      children: [
        _DayHeader(
          selectedDate: selectedDate,
          collapseProgress: collapseProgress,
          onBackPressed: () => store.setActiveView(CalendarView.month),
          onTodayPressed: store.goToToday,
        ),
        _AllDaySection(
          events: allDayEvents,
          collapseProgress: collapseProgress,
        ),
        Expanded(
          child: Container(
            color: CupertinoColors.systemGroupedBackground.resolveFrom(context),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final timelineWidth =
                    constraints.maxWidth - _timelineLeftInset - 16;
                final timelineHeight = 24 * _hourRowHeight;
                return NotificationListener<ScrollNotification>(
                  onNotification: (notification) {
                    if (notification.metrics.axis == Axis.vertical &&
                        notification is ScrollUpdateNotification) {
                      _updateScrollOffset(notification.metrics.pixels);
                    }
                    return false;
                  },
                  child: CustomScrollView(
                    key: const ValueKey('day-timeline-scroll'),
                    controller: _scrollController,
                    slivers: [
                      SliverToBoxAdapter(
                        child: SizedBox(
                          height: timelineHeight,
                          child: Stack(
                            children: [
                              ...List.generate(24, (hour) {
                                final top = hour * _hourRowHeight;
                                return Positioned(
                                  left: 0,
                                  right: 0,
                                  top: top,
                                  height: _hourRowHeight,
                                  child: _HourRow(hour: hour),
                                );
                              }),
                              if (_isToday(selectedDate))
                                Positioned(
                                  top: _positionForTime(_demoNow),
                                  left: _timelineLeadingWidth,
                                  right: 0,
                                  child: _CurrentTimeLine(
                                    label: _formatTime(
                                      const TimeOfDay(hour: 14, minute: 18),
                                    ),
                                  ),
                                ),
                              ...timedEvents.map((event) {
                                final expanded = _expandedEventIds.contains(
                                  event.id,
                                );
                                return Positioned(
                                  top: _positionForTimeOfDay(event.start) + 6,
                                  left: _timelineLeftInset,
                                  width: timelineWidth,
                                  height: _heightForEvent(
                                    event,
                                    expanded: expanded,
                                  ),
                                  child: _TimedEventCard(
                                    cardKey: ValueKey('day-event-${event.id}'),
                                    event: event,
                                    expanded: expanded,
                                    onTap: () => _toggleEvent(event.id),
                                    onOpenDetails: () {
                                      Navigator.of(
                                        context,
                                      ).push(buildEventDetailRoute(event));
                                    },
                                  ),
                                );
                              }),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ],
    );
  }

  void _handleScroll() {
    _updateScrollOffset(
      _scrollController.hasClients ? _scrollController.offset : 0,
    );
  }

  void _updateScrollOffset(double value) {
    if ((_scrollOffset - value).abs() < 1) {
      return;
    }
    setState(() {
      _scrollOffset = value;
    });
  }

  void _toggleEvent(String eventId) {
    setState(() {
      if (_expandedEventIds.contains(eventId)) {
        _expandedEventIds.remove(eventId);
      } else {
        _expandedEventIds.add(eventId);
      }
    });
  }

  void _syncSelectedDate(DateTime selectedDate) {
    if (_handledSelectedDate == selectedDate) {
      return;
    }
    _handledSelectedDate = selectedDate;
    _expandedEventIds.clear();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _restoreScrollForDate(selectedDate);
    });
  }

  void _restoreScrollForDate(DateTime selectedDate) {
    if (!mounted || !_scrollController.hasClients) {
      return;
    }
    final position = _scrollController.position;
    if (!position.hasContentDimensions) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _restoreScrollForDate(selectedDate);
      });
      return;
    }
    final target = _isToday(selectedDate)
        ? (_positionForTime(_demoNow) - 220).clamp(0, position.maxScrollExtent)
        : 0.0;
    _scrollController.jumpTo(target.toDouble());
    _updateScrollOffset(target.toDouble());
  }

  static bool _isToday(DateTime date) =>
      date.year == _demoNow.year &&
      date.month == _demoNow.month &&
      date.day == _demoNow.day;

  static double _positionForTime(DateTime value) {
    return (value.hour + value.minute / 60) * _hourRowHeight;
  }

  static double _positionForTimeOfDay(TimeOfDay value) {
    return (value.hour + value.minute / 60) * _hourRowHeight;
  }

  static double _heightForEvent(CalendarEvent event, {required bool expanded}) {
    final startMinutes = event.start.hour * 60 + event.start.minute;
    final endMinutes = event.end.hour * 60 + event.end.minute;
    final durationMinutes = (endMinutes - startMinutes).clamp(30, 24 * 60);
    var computed = durationMinutes / 60 * _hourRowHeight - 10;
    if (expanded && event.location != null) {
      computed += 18;
    }
    if (expanded && event.notes != null) {
      computed += 24;
    }
    if (expanded) {
      computed += 18;
    }
    final minimum = expanded ? 128.0 : 72.0;
    return computed < minimum ? minimum : computed;
  }

  static int _compareTimeOfDay(TimeOfDay left, TimeOfDay right) {
    final leftMinutes = left.hour * 60 + left.minute;
    final rightMinutes = right.hour * 60 + right.minute;
    return leftMinutes.compareTo(rightMinutes);
  }
}

class _DayHeader extends StatelessWidget {
  const _DayHeader({
    required this.selectedDate,
    required this.collapseProgress,
    required this.onBackPressed,
    required this.onTodayPressed,
  });

  final DateTime selectedDate;
  final double collapseProgress;
  final VoidCallback onBackPressed;
  final VoidCallback onTodayPressed;

  @override
  Widget build(BuildContext context) {
    final secondary = CupertinoColors.secondaryLabel.resolveFrom(context);
    final compactVisible = collapseProgress > 0.55;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CupertinoButton(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                onPressed: onBackPressed,
                child: const Row(
                  children: [
                    Icon(
                      CupertinoIcons.chevron_left,
                      size: 18,
                      color: CupertinoColors.activeBlue,
                    ),
                    SizedBox(width: 2),
                    Text(
                      '月视图',
                      style: TextStyle(
                        color: CupertinoColors.activeBlue,
                        fontSize: 17,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              AnimatedOpacity(
                opacity: compactVisible ? 1 : 0,
                duration: const Duration(milliseconds: 180),
                child: compactVisible
                    ? Container(
                        key: const ValueKey('day-header-compact-label'),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: CupertinoColors.tertiarySystemFill.resolveFrom(
                            context,
                          ),
                          borderRadius: BorderRadius.circular(999),
                        ),
                        child: Text(
                          '${selectedDate.month}月${selectedDate.day}日',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      )
                    : const SizedBox.shrink(),
              ),
              if (compactVisible) const SizedBox(width: 10),
              CupertinoButton(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                onPressed: onTodayPressed,
                child: const Text(
                  '今天',
                  style: TextStyle(
                    fontSize: 17,
                    color: CupertinoColors.activeBlue,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          AnimatedContainer(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeOutCubic,
            height: lerpDouble(72, 14, collapseProgress),
            child: Opacity(
              opacity: 1 - collapseProgress,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${selectedDate.year}',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: secondary,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${selectedDate.month}月${selectedDate.day}日',
                    style: const TextStyle(
                      fontSize: 36,
                      height: 1,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _weekdayLabel(selectedDate),
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w500,
                      color: secondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _AllDaySection extends StatelessWidget {
  const _AllDaySection({required this.events, required this.collapseProgress});

  final List<CalendarEvent> events;
  final double collapseProgress;

  @override
  Widget build(BuildContext context) {
    final background = CupertinoColors.systemBackground.resolveFrom(context);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      curve: Curves.easeOutCubic,
      margin: EdgeInsets.fromLTRB(
        12,
        0,
        12,
        lerpDouble(12, 6, collapseProgress),
      ),
      padding: EdgeInsets.fromLTRB(
        14,
        lerpDouble(12, 8, collapseProgress),
        14,
        lerpDouble(12, 8, collapseProgress),
      ),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: CupertinoColors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 58,
            child: Text(
              '全天',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: CupertinoColors.secondaryLabel.resolveFrom(context),
              ),
            ),
          ),
          Expanded(
            child: events.isEmpty
                ? Text(
                    '没有全天事件',
                    style: TextStyle(
                      fontSize: 15,
                      color: CupertinoColors.tertiaryLabel.resolveFrom(context),
                    ),
                  )
                : Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: events
                        .map((event) => _AllDayChip(event: event))
                        .toList(),
                  ),
          ),
        ],
      ),
    );
  }
}

class _AllDayChip extends StatelessWidget {
  const _AllDayChip({required this.event});

  final CalendarEvent event;

  @override
  Widget build(BuildContext context) {
    final chipBackground = event.color
        .resolveFrom(context)
        .withValues(alpha: 0.12);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: chipBackground,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(
              color: event.color.resolveFrom(context),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            event.title,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}

class _HourRow extends StatelessWidget {
  const _HourRow({required this.hour});

  final int hour;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 62,
          child: Padding(
            padding: const EdgeInsets.only(top: 2, right: 8),
            child: Text(
              _formatHour(hour),
              textAlign: TextAlign.right,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: CupertinoColors.secondaryLabel.resolveFrom(context),
              ),
            ),
          ),
        ),
        Expanded(
          child: Column(
            children: [
              Container(
                height: 0.6,
                color: CupertinoColors.systemGrey5.resolveFrom(context),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _CurrentTimeLine extends StatelessWidget {
  const _CurrentTimeLine({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final red = CupertinoColors.systemRed.resolveFrom(context);
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: red,
            borderRadius: BorderRadius.circular(999),
          ),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: CupertinoColors.white,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(child: Container(height: 2, color: red)),
      ],
    );
  }
}

class _TimedEventCard extends StatelessWidget {
  const _TimedEventCard({
    required this.cardKey,
    required this.event,
    required this.expanded,
    required this.onTap,
    required this.onOpenDetails,
  });

  final Key cardKey;
  final CalendarEvent event;
  final bool expanded;
  final VoidCallback onTap;
  final VoidCallback onOpenDetails;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      key: cardKey,
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 220),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
        decoration: BoxDecoration(
          color: CupertinoColors.systemBackground.resolveFrom(context),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: event.color.resolveFrom(context).withValues(alpha: 0.18),
          ),
          boxShadow: [
            BoxShadow(
              color: CupertinoColors.black.withValues(
                alpha: expanded ? 0.08 : 0.05,
              ),
              blurRadius: expanded ? 20 : 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 4,
              decoration: BoxDecoration(
                color: event.color.resolveFrom(context),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          event.title,
                          maxLines: expanded ? 2 : 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        expanded
                            ? CupertinoIcons.chevron_up
                            : CupertinoIcons.chevron_down,
                        size: 14,
                        color: CupertinoColors.secondaryLabel.resolveFrom(
                          context,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_formatTime(event.start)} - ${_formatTime(event.end)}',
                    style: TextStyle(
                      fontSize: 13,
                      color: CupertinoColors.secondaryLabel.resolveFrom(
                        context,
                      ),
                    ),
                  ),
                  if (expanded && event.location != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      event.location!,
                      style: const TextStyle(
                        fontSize: 13,
                        color: CupertinoColors.systemGrey,
                      ),
                    ),
                  ],
                  if (expanded && event.notes != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      event.notes!,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 13,
                        color: CupertinoColors.tertiaryLabel.resolveFrom(
                          context,
                        ),
                      ),
                    ),
                  ],
                  if (expanded) ...[
                    const SizedBox(height: 8),
                    CupertinoButton(
                      key: ValueKey('day-event-detail-${event.id}'),
                      padding: EdgeInsets.zero,
                      minimumSize: Size.zero,
                      alignment: Alignment.centerLeft,
                      onPressed: onOpenDetails,
                      child: const Text(
                        '查看详情',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: CupertinoColors.activeBlue,
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

String _weekdayLabel(DateTime date) {
  const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  return weekdays[date.weekday - 1];
}

String _formatHour(int hour) {
  final label = hour.toString().padLeft(2, '0');
  return '$label:00';
}

String _formatTime(TimeOfDay time) {
  final hour = time.hour.toString().padLeft(2, '0');
  final minute = time.minute.toString().padLeft(2, '0');
  return '$hour:$minute';
}

double lerpDouble(num a, num b, double t) {
  return a + (b - a) * t;
}

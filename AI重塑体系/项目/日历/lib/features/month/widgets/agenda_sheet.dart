import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/core/utils/date_utils.dart' as calendar_date;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show TimeOfDay;

class AgendaSheet extends StatelessWidget {
  const AgendaSheet({
    super.key,
    required this.selectedDate,
    required this.events,
    required this.onAddPressed,
    required this.onDayPressed,
    required this.onEventPressed,
  });

  final DateTime selectedDate;
  final List<CalendarEvent> events;
  final VoidCallback onAddPressed;
  final VoidCallback onDayPressed;
  final ValueChanged<CalendarEvent> onEventPressed;

  @override
  Widget build(BuildContext context) {
    final background = CupertinoColors.systemBackground.resolveFrom(context);
    final separator = CupertinoColors.systemGrey5.resolveFrom(context);
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: CupertinoColors.black.withValues(alpha: 0.06),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 36,
            height: 5,
            margin: const EdgeInsets.only(top: 10),
            decoration: BoxDecoration(
              color: separator,
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: GestureDetector(
                    key: const ValueKey('agenda-day-header'),
                    behavior: HitTestBehavior.opaque,
                    onTap: onDayPressed,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${selectedDate.month}月',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: CupertinoColors.secondaryLabel.resolveFrom(
                              context,
                            ),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${selectedDate.day}',
                          style: const TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.w700,
                            color: CupertinoColors.systemRed,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          calendar_date.weekdayLabel(selectedDate),
                          style: const TextStyle(
                            fontSize: 15,
                            color: CupertinoColors.systemGrey,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                GestureDetector(
                  key: const ValueKey('agenda-add-button'),
                  behavior: HitTestBehavior.opaque,
                  onTap: onAddPressed,
                  child: Container(
                    width: 44,
                    height: 44,
                    alignment: Alignment.center,
                    child: const DecoratedBox(
                      decoration: BoxDecoration(
                        color: CupertinoColors.activeBlue,
                        shape: BoxShape.circle,
                      ),
                      child: SizedBox(
                        width: 30,
                        height: 30,
                        child: Icon(
                          CupertinoIcons.add,
                          size: 18,
                          color: CupertinoColors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 240),
            switchInCurve: Curves.easeOutCubic,
            switchOutCurve: Curves.easeInCubic,
            child: events.isEmpty
                ? const Padding(
                    key: ValueKey('agenda-empty'),
                    padding: EdgeInsets.fromLTRB(16, 0, 16, 24),
                    child: Align(
                      alignment: Alignment.centerLeft,
                      child: Row(
                        children: [
                          Icon(
                            CupertinoIcons.calendar_today,
                            size: 18,
                            color: CupertinoColors.systemGrey,
                          ),
                          SizedBox(width: 8),
                          Text(
                            '没有日程',
                            style: TextStyle(color: CupertinoColors.systemGrey),
                          ),
                        ],
                      ),
                    ),
                  )
                : Column(
                    key: ValueKey(
                      'agenda-${selectedDate.toIso8601String()}-${events.length}',
                    ),
                    children: events
                        .asMap()
                        .entries
                        .map(
                          (entry) => _AgendaTile(
                            event: entry.value,
                            isLast: entry.key == events.length - 1,
                            onTap: () => onEventPressed(entry.value),
                          ),
                        )
                        .toList(),
                  ),
          ),
        ],
      ),
    );
  }
}

class _AgendaTile extends StatelessWidget {
  const _AgendaTile({
    required this.event,
    required this.isLast,
    required this.onTap,
  });

  final CalendarEvent event;
  final bool isLast;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      key: ValueKey('agenda-event-${event.id}'),
      behavior: HitTestBehavior.opaque,
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: CupertinoColors.systemGrey6.resolveFrom(context),
              width: 0.6,
            ),
            bottom: isLast
                ? BorderSide.none
                : BorderSide(
                    color: CupertinoColors.systemGrey6.resolveFrom(context),
                    width: 0.6,
                  ),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 4,
              height: 58,
              decoration: BoxDecoration(
                color: event.color.resolveFrom(context),
                borderRadius: BorderRadius.circular(999),
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 78,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.allDay ? '全天' : _formatTime(event.start),
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                      color: CupertinoColors.systemGrey,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    event.allDay
                        ? ''
                        : '${_formatTime(event.start)} - ${_formatTime(event.end)}',
                    style: TextStyle(
                      fontSize: 12,
                      color: CupertinoColors.tertiaryLabel.resolveFrom(context),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    event.title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (event.location case final location?) ...[
                    const SizedBox(height: 4),
                    Text(
                      location,
                      style: const TextStyle(
                        fontSize: 14,
                        color: CupertinoColors.systemGrey,
                      ),
                    ),
                  ],
                  if (event.notes case final notes?) ...[
                    const SizedBox(height: 4),
                    Text(
                      notes,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 14,
                        color: CupertinoColors.secondaryLabel.resolveFrom(
                          context,
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

String _formatTime(TimeOfDay time) {
  final hour = time.hour.toString().padLeft(2, '0');
  final minute = time.minute.toString().padLeft(2, '0');
  return '$hour:$minute';
}

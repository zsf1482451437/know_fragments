import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/core/store/calendar_scope.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:calendar_app/features/editor/event_editor_page.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show TimeOfDay;

class EventDetailPage extends StatelessWidget {
  const EventDetailPage({super.key, required this.event});

  final CalendarEvent event;

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    final resolvedEvent = store.eventById(event.id);
    String calendarName() {
      for (final source in store.calendarSources) {
        if (source.id == resolvedEvent?.calendarId) {
          return source.name;
        }
      }
      return resolvedEvent?.calendarId ?? '';
    }

    if (resolvedEvent == null) {
      return const CupertinoPageScaffold(child: SizedBox.expand());
    }

    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        previousPageTitle: '返回',
        middle: const Text('事件'),
        trailing: CupertinoButton(
          key: const ValueKey('event-detail-edit-button'),
          padding: EdgeInsets.zero,
          onPressed: () {
            Navigator.of(context).push(
              CupertinoPageRoute<void>(
                builder: (_) => EventEditorPage(initialEvent: resolvedEvent),
              ),
            );
          },
          child: const Text('编辑'),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
          children: [
            _EventHero(event: resolvedEvent),
            const SizedBox(height: 18),
            _DetailSection(
              title: '时间',
              value: _timeRangeLabel(resolvedEvent),
            ),
            if (resolvedEvent.location != null) ...[
              const SizedBox(height: 12),
              _DetailSection(title: '位置', value: resolvedEvent.location!),
            ],
            if (!resolvedEvent.repeat.isNone) ...[
              const SizedBox(height: 12),
              _DetailSection(
                title: '重复',
                value: eventRepeatLabel(resolvedEvent.repeat),
              ),
            ],
            if (resolvedEvent.alerts.isNotEmpty) ...[
              const SizedBox(height: 12),
              _DetailSection(
                title: '提醒',
                value: eventAlertsSummary(resolvedEvent.alerts),
              ),
            ],
            if (resolvedEvent.invitees.isNotEmpty) ...[
              const SizedBox(height: 12),
              _DetailSection(
                title: '邀请对象',
                value: resolvedEvent.invitees.join('、'),
              ),
            ],
            if (resolvedEvent.url != null) ...[
              const SizedBox(height: 12),
              _DetailSection(title: 'URL', value: resolvedEvent.url!),
            ],
            if (resolvedEvent.notes != null) ...[
              const SizedBox(height: 12),
              _DetailSection(title: '备注', value: resolvedEvent.notes!),
            ],
            const SizedBox(height: 12),
            _DetailSection(
              title: '日历',
              value: calendarName(),
            ),
            const SizedBox(height: 18),
            CupertinoButton(
              key: const ValueKey('event-detail-delete-button'),
              color: CupertinoColors.systemRed.resolveFrom(context),
              borderRadius: BorderRadius.circular(18),
              onPressed: () =>
                  _confirmDelete(context, store: store, event: resolvedEvent),
              child: const Text('删除事件'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _confirmDelete(
    BuildContext context, {
    required CalendarStore store,
    required CalendarEvent event,
  }) async {
    final navigator = Navigator.of(context);
    await showCupertinoDialog<void>(
      context: context,
      builder: (dialogContext) {
        return CupertinoAlertDialog(
          title: const Text('删除这个事件？'),
          content: Text('“${event.title}”将从日历中移除。'),
          actions: [
            CupertinoDialogAction(
              onPressed: () {
                Navigator.of(dialogContext).pop();
              },
              child: const Text('取消'),
            ),
            CupertinoDialogAction(
              key: const ValueKey('event-detail-confirm-delete-button'),
              isDestructiveAction: true,
              onPressed: () {
                store.deleteEvent(event.id);
                Navigator.of(dialogContext).pop();
                if (navigator.canPop()) {
                  navigator.pop();
                }
              },
              child: const Text('删除'),
            ),
          ],
        );
      },
    );
  }
}

class _EventHero extends StatelessWidget {
  const _EventHero({required this.event});

  final CalendarEvent event;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
      decoration: BoxDecoration(
        color: CupertinoColors.systemBackground.resolveFrom(context),
        borderRadius: BorderRadius.circular(22),
        boxShadow: [
          BoxShadow(
            color: CupertinoColors.black.withValues(alpha: 0.06),
            blurRadius: 22,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 5,
            height: 76,
            decoration: BoxDecoration(
              color: event.color.resolveFrom(context),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.title,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  event.allDay
                      ? '全天'
                      : '${_formatTime(event.start)} - ${_formatTime(event.end)}',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: CupertinoColors.secondaryLabel.resolveFrom(context),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _weekdayLabel(event.date),
                  style: TextStyle(
                    fontSize: 15,
                    color: CupertinoColors.tertiaryLabel.resolveFrom(context),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailSection extends StatelessWidget {
  const _DetailSection({required this.title, required this.value});

  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: BoxDecoration(
        color: CupertinoColors.secondarySystemGroupedBackground.resolveFrom(
          context,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: CupertinoColors.secondaryLabel.resolveFrom(context),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

String _formatTime(TimeOfDay time) {
  final hour = time.hour.toString().padLeft(2, '0');
  final minute = time.minute.toString().padLeft(2, '0');
  return '$hour:$minute';
}

String _timeRangeLabel(CalendarEvent event) {
  if (event.allDay) {
    final start = '${event.date.month}月${event.date.day}日';
    final end = '${event.endDate.month}月${event.endDate.day}日';
    if (event.date == event.endDate) {
      return '$start · 全天';
    }
    return '$start - $end · 全天';
  }
  final startDate = '${event.date.month}月${event.date.day}日';
  final endDate = '${event.endDate.month}月${event.endDate.day}日';
  final timeRange = '${_formatTime(event.start)} - ${_formatTime(event.end)}';
  if (event.date == event.endDate) {
    return '$startDate · $timeRange';
  }
  return '$startDate ${_formatTime(event.start)} - $endDate ${_formatTime(event.end)}';
}

String _weekdayLabel(DateTime date) {
  const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];
  return weekdays[date.weekday - 1];
}

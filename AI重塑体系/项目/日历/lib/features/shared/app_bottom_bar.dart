import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:flutter/cupertino.dart';

class AppBottomBar extends StatelessWidget {
  const AppBottomBar({
    super.key,
    required this.activeView,
    required this.onSelect,
  });

  final CalendarView activeView;
  final ValueChanged<CalendarView> onSelect;

  @override
  Widget build(BuildContext context) {
    final background = CupertinoColors.systemBackground.resolveFrom(context);
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 18),
      decoration: BoxDecoration(
        color: background,
        border: Border(
          top: BorderSide(
            color: CupertinoColors.systemGrey5.resolveFrom(context),
            width: 0.6,
          ),
        ),
      ),
      child: Row(
        children: [
          _BottomBarAction(
            actionKey: const ValueKey('nav-month'),
            label: '月视图',
            selected: activeView == CalendarView.month,
            onTap: () => onSelect(CalendarView.month),
          ),
          const SizedBox(width: 16),
          _BottomBarAction(
            actionKey: const ValueKey('nav-day'),
            label: '日',
            selected: activeView == CalendarView.day,
            onTap: () => onSelect(CalendarView.day),
          ),
          const SizedBox(width: 16),
          _BottomBarAction(
            actionKey: const ValueKey('nav-list'),
            label: '列表',
            selected: activeView == CalendarView.list,
            onTap: () => onSelect(CalendarView.list),
          ),
          const SizedBox(width: 16),
          _BottomBarAction(
            actionKey: const ValueKey('nav-inbox'),
            label: '收件箱',
            selected: activeView == CalendarView.inbox,
            onTap: () => onSelect(CalendarView.inbox),
          ),
        ],
      ),
    );
  }
}

class _BottomBarAction extends StatelessWidget {
  const _BottomBarAction({
    required this.actionKey,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final Key actionKey;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return CupertinoButton(
      key: actionKey,
      padding: EdgeInsets.zero,
      minimumSize: Size.zero,
      onPressed: onTap,
      child: Text(
        label,
        style: TextStyle(
          color: selected
              ? CupertinoColors.activeBlue
              : CupertinoColors.systemGrey,
          fontSize: 17,
          fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
        ),
      ),
    );
  }
}

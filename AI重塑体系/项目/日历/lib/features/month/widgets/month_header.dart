import 'package:calendar_app/core/utils/date_utils.dart' as calendar_date;
import 'package:flutter/cupertino.dart';

class MonthHeader extends StatelessWidget {
  const MonthHeader({
    super.key,
    required this.focusedMonth,
    required this.onCalendarsPressed,
    required this.onTodayPressed,
    required this.onPreviousMonth,
    required this.onNextMonth,
    required this.onSearchPressed,
  });

  final DateTime focusedMonth;
  final VoidCallback onCalendarsPressed;
  final VoidCallback onTodayPressed;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;
  final VoidCallback onSearchPressed;

  @override
  Widget build(BuildContext context) {
    final secondaryText = CupertinoColors.secondaryLabel.resolveFrom(context);
    final tertiaryBackground = CupertinoColors.tertiarySystemGroupedBackground
        .resolveFrom(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CupertinoButton(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                onPressed: onCalendarsPressed,
                child: const Text(
                  'Calendars',
                  style: TextStyle(
                    color: CupertinoColors.activeBlue,
                    fontSize: 17,
                  ),
                ),
              ),
              const Spacer(),
              CupertinoButton(
                padding: EdgeInsets.zero,
                minimumSize: const Size.square(28),
                onPressed: onTodayPressed,
                child: const Text(
                  '今天',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w400),
                ),
              ),
              const SizedBox(width: 16),
              _HeaderCircleButton(
                backgroundColor: tertiaryBackground,
                onPressed: onSearchPressed,
                icon: CupertinoIcons.search,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            '${focusedMonth.year}',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: secondaryText,
            ),
          ),
          const SizedBox(height: 2),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                calendar_date.monthLabel(focusedMonth),
                style: const TextStyle(
                  fontSize: 38,
                  height: 1,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              _HeaderCircleButton(
                backgroundColor: tertiaryBackground,
                onPressed: onPreviousMonth,
                icon: CupertinoIcons.chevron_left,
              ),
              const SizedBox(width: 8),
              _HeaderCircleButton(
                backgroundColor: tertiaryBackground,
                onPressed: onNextMonth,
                icon: CupertinoIcons.chevron_right,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeaderCircleButton extends StatelessWidget {
  const _HeaderCircleButton({
    required this.backgroundColor,
    required this.onPressed,
    required this.icon,
  });

  final Color backgroundColor;
  final VoidCallback onPressed;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return CupertinoButton(
      padding: EdgeInsets.zero,
      minimumSize: Size.zero,
      onPressed: onPressed,
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: backgroundColor,
          shape: BoxShape.circle,
        ),
        child: SizedBox(
          width: 30,
          height: 30,
          child: Icon(
            icon,
            size: 17,
            color: CupertinoColors.label.resolveFrom(context),
          ),
        ),
      ),
    );
  }
}

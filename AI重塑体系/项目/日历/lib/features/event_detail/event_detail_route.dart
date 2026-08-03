import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/features/event_detail/event_detail_page.dart';
import 'package:flutter/cupertino.dart';

Route<void> buildEventDetailRoute(CalendarEvent event) {
  return PageRouteBuilder<void>(
    pageBuilder: (_, animation, _) {
      return FadeTransition(
        opacity: CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
        child: EventDetailPage(event: event),
      );
    },
    transitionsBuilder: (_, animation, _, child) {
      final slide = Tween<Offset>(
        begin: const Offset(0, 0.04),
        end: Offset.zero,
      ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic));
      final scale = Tween<double>(
        begin: 0.985,
        end: 1,
      ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic));
      return FadeTransition(
        opacity: animation,
        child: SlideTransition(
          position: slide,
          child: ScaleTransition(scale: scale, child: child),
        ),
      );
    },
    transitionDuration: const Duration(milliseconds: 280),
    reverseTransitionDuration: const Duration(milliseconds: 220),
  );
}

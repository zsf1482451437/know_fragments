# iPhone Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前单页月历原型重构为 iPhone 优先的 Flutter Cupertino 日历应用骨架，并交付可导航的 `Month / Day / List / Search / Inbox / Calendars / Event Editor` 第一阶段版本。

**Architecture:** 采用 `AppShell + CalendarStore + Shared Domain + Feature Modules` 结构。先把当前 `lib/main.dart` 中的原型拆解成共享模型、状态层和模块页面，再围绕月页体验锚点补齐可导航的其他主入口与最小可用编辑流。

**Tech Stack:** Flutter, Cupertino widgets, ChangeNotifier, InheritedNotifier, flutter_test

---

## File Structure

### Modify

- `lib/main.dart`：只保留应用入口，挂载新的 `CalendarApp`
- `pubspec.yaml`：保持零新增依赖，必要时仅补充注释或资源声明
- `test/widget_test.dart`：改为壳层入口 smoke test，避免继续绑定旧单页结构

### Create

- `lib/app/calendar_app.dart`
- `lib/app/calendar_app_shell.dart`
- `lib/core/models/calendar_event.dart`
- `lib/core/models/calendar_source.dart`
- `lib/core/models/event_draft.dart`
- `lib/core/models/inbox_item.dart`
- `lib/core/models/search_result.dart`
- `lib/core/store/calendar_store.dart`
- `lib/core/store/calendar_scope.dart`
- `lib/core/utils/date_utils.dart`
- `lib/core/sample_data/calendar_seed_data.dart`
- `lib/features/month/month_page.dart`
- `lib/features/month/widgets/month_header.dart`
- `lib/features/month/widgets/week_strip.dart`
- `lib/features/month/widgets/month_grid.dart`
- `lib/features/month/widgets/agenda_sheet.dart`
- `lib/features/day/day_page.dart`
- `lib/features/list/list_page.dart`
- `lib/features/search/search_page.dart`
- `lib/features/inbox/inbox_page.dart`
- `lib/features/calendars/calendars_page.dart`
- `lib/features/editor/event_editor_page.dart`
- `lib/features/shared/app_bottom_bar.dart`
- `lib/features/shared/empty_state.dart`
- `test/app/calendar_app_test.dart`
- `test/core/calendar_store_test.dart`
- `test/features/month/month_page_test.dart`
- `test/features/calendars/calendars_page_test.dart`
- `test/features/editor/event_editor_page_test.dart`
- `test/features/navigation/app_shell_navigation_test.dart`

### Responsibilities

- `app/`：只处理应用壳层、路由关系和全局容器
- `core/models/`：只处理日历领域对象，不承载 UI 逻辑
- `core/store/`：只处理全局状态与事件操作
- `features/month/`：只处理首页月视图及其子组件
- `features/day/`, `features/list/`, `features/search/`, `features/inbox/`, `features/calendars/`, `features/editor/`：各自维护单一页面职责
- `features/shared/`：共享但不带业务状态的 UI 组件

### Implementation Constraints

- 不再向 `lib/main.dart` 继续堆 UI 代码
- 不引入第三方状态管理库
- 所有新增行为先写测试再写实现
- 第一阶段只用本地假数据，不接系统日历 API

## Task 1: 建立共享模型与状态骨架

**Files:**
- Modify: `lib/main.dart`, `test/widget_test.dart`
- Create: `lib/app/calendar_app.dart`, `lib/core/models/calendar_event.dart`, `lib/core/models/calendar_source.dart`, `lib/core/models/event_draft.dart`, `lib/core/models/inbox_item.dart`, `lib/core/models/search_result.dart`, `lib/core/store/calendar_store.dart`, `lib/core/store/calendar_scope.dart`, `lib/core/sample_data/calendar_seed_data.dart`, `test/core/calendar_store_test.dart`

- [ ] **Step 1: Write the failing store test**

```dart
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('selectDate updates selectedDate and focusedMonth together', () {
    final store = CalendarStore.bootstrap();
    final target = DateTime(2026, 5, 21);

    store.selectDate(target);

    expect(store.selectedDate, DateTime(2026, 5, 21));
    expect(store.focusedMonth, DateTime(2026, 5));
  });

  test('createEvent appends a new event for the selected date', () {
    final store = CalendarStore.bootstrap();
    final initialCount = store.eventsFor(store.selectedDate).length;

    store.createDraftEvent(
      title: '架构评审',
      location: '1A',
    );

    expect(store.eventsFor(store.selectedDate), hasLength(initialCount + 1));
    expect(
      store.eventsFor(store.selectedDate).last.title,
      '架构评审',
    );
  });

  test('toggleCalendarVisibility filters events by calendar source', () {
    final store = CalendarStore.bootstrap();
    final sourceId = store.calendarSources.first.id;

    store.setCalendarVisibility(sourceId, false);

    expect(store.visibleCalendarIds.contains(sourceId), isFalse);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/core/calendar_store_test.dart`
Expected: FAIL with missing import or undefined `CalendarStore.bootstrap`

- [ ] **Step 3: Write minimal implementation**

```dart
class CalendarStore extends ChangeNotifier {
  CalendarView activeView = CalendarView.month;

  CalendarStore({
    required this.selectedDate,
    required this.focusedMonth,
    required this.calendarSources,
    required Map<DateTime, List<CalendarEvent>> seededEvents,
  }) : _events = seededEvents;

  factory CalendarStore.bootstrap() {
    final today = DateTime(2026, 5, 13);
    return CalendarStore(
      selectedDate: today,
      focusedMonth: DateTime(today.year, today.month),
      calendarSources: CalendarSeedData.sources,
      seededEvents: CalendarSeedData.events(today),
    );
  }

  DateTime selectedDate;
  DateTime focusedMonth;
  final List<CalendarSource> calendarSources;
  final Map<DateTime, List<CalendarEvent>> _events;
  final Set<String> visibleCalendarIds = CalendarSeedData.sources
      .map((source) => source.id)
      .toSet();

  void selectDate(DateTime value) {
    selectedDate = DateTime(value.year, value.month, value.day);
    focusedMonth = DateTime(value.year, value.month);
    notifyListeners();
  }

  void setActiveView(CalendarView view) {
    activeView = view;
    notifyListeners();
  }

  void goToToday() => selectDate(DateTime(2026, 5, 13));

  void goToPreviousMonth() {
    focusedMonth = DateTime(focusedMonth.year, focusedMonth.month - 1);
    selectedDate = DateTime(focusedMonth.year, focusedMonth.month, 1);
    notifyListeners();
  }

  void goToNextMonth() {
    focusedMonth = DateTime(focusedMonth.year, focusedMonth.month + 1);
    selectedDate = DateTime(focusedMonth.year, focusedMonth.month, 1);
    notifyListeners();
  }

  List<CalendarEvent> eventsFor(DateTime value) {
    final key = DateTime(value.year, value.month, value.day);
    final allowedIds = visibleCalendarIds.isEmpty
        ? calendarSources.map((source) => source.id).toSet()
        : visibleCalendarIds;
    return List<CalendarEvent>.unmodifiable(
      (_events[key] ?? const []).where(
        (event) => allowedIds.contains(event.calendarId),
      ),
    );
  }

  void createDraftEvent({
    required String title,
    String? location,
  }) {
    final key = DateTime(selectedDate.year, selectedDate.month, selectedDate.day);
    final items = _events.putIfAbsent(key, () => <CalendarEvent>[]);
    items.add(
      CalendarEvent.seed(
        title: title,
        date: key,
        location: location,
      ),
    );
    notifyListeners();
  }

  void setCalendarVisibility(String id, bool visible) {
    if (visible) {
      visibleCalendarIds.add(id);
    } else {
      visibleCalendarIds.remove(id);
    }
    notifyListeners();
  }

  bool isCalendarVisible(String id) => visibleCalendarIds.contains(id);

  Map<DateTime, List<CalendarEvent>> get visibleEventsByDay => {
    for (final entry in _events.entries)
      entry.key: entry.value
          .where((event) => visibleCalendarIds.contains(event.calendarId))
          .toList(),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test test/core/calendar_store_test.dart`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/main.dart lib/app/calendar_app.dart lib/core/models lib/core/store lib/core/sample_data test/core/calendar_store_test.dart test/widget_test.dart
git commit -m "refactor: add shared calendar domain and store skeleton"
```

## Task 2: 搭建 AppShell 与主入口导航骨架

**Files:**
- Modify: `lib/main.dart`, `test/widget_test.dart`
- Create: `lib/app/calendar_app.dart`, `lib/app/calendar_app_shell.dart`, `lib/features/shared/app_bottom_bar.dart`, `test/app/calendar_app_test.dart`, `test/features/navigation/app_shell_navigation_test.dart`

- [ ] **Step 1: Write the failing app shell tests**

```dart
import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('app shell shows month, list, inbox and search entry points', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    expect(find.text('Calendars'), findsOneWidget);
    expect(find.text('月视图'), findsOneWidget);
    expect(find.text('列表'), findsOneWidget);
    expect(find.text('收件箱'), findsOneWidget);
    expect(find.byIcon(CupertinoIcons.search), findsOneWidget);
  });

  testWidgets('bottom bar switches to list view', (WidgetTester tester) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.text('列表'));
    await tester.pumpAndSettle();

    expect(find.text('已安排'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/app/calendar_app_test.dart test/features/navigation/app_shell_navigation_test.dart`
Expected: FAIL with missing `CalendarApp` shell or navigation labels

- [ ] **Step 3: Write minimal implementation**

```dart
enum CalendarView { month, day, list, search, inbox, calendars }

class CalendarApp extends StatelessWidget {
  const CalendarApp({super.key});

  @override
  Widget build(BuildContext context) {
    return CalendarScope(
      notifier: CalendarStore.bootstrap(),
      child: const CupertinoApp(
        debugShowCheckedModeBanner: false,
        home: CalendarAppShell(),
      ),
    );
  }
}

class CalendarAppShell extends StatelessWidget {
  const CalendarAppShell({super.key});

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    return CupertinoPageScaffold(
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Expanded(
              child: switch (store.activeView) {
                CalendarView.month => const MonthPage(),
                CalendarView.day => const DayPage(),
                CalendarView.list => const ListPage(),
                CalendarView.search => const SearchPage(),
                CalendarView.inbox => const InboxPage(),
                CalendarView.calendars => const CalendarsPage(),
              },
            ),
            AppBottomBar(
              activeView: store.activeView,
              onSelect: store.setActiveView,
              onAddPressed: () => Navigator.of(context).push(
                CupertinoPageRoute<void>(
                  builder: (_) => const EventEditorPage(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test test/app/calendar_app_test.dart test/features/navigation/app_shell_navigation_test.dart`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/main.dart lib/app lib/features/shared test/app/calendar_app_test.dart test/features/navigation/app_shell_navigation_test.dart test/widget_test.dart
git commit -m "feat: add calendar app shell and primary navigation"
```

## Task 3: 抽离并强化月视图模块

**Files:**
- Modify: `lib/app/calendar_app_shell.dart`
- Create: `lib/features/month/month_page.dart`, `lib/features/month/widgets/month_header.dart`, `lib/features/month/widgets/week_strip.dart`, `lib/features/month/widgets/month_grid.dart`, `lib/features/month/widgets/agenda_sheet.dart`, `lib/core/utils/date_utils.dart`, `test/features/month/month_page_test.dart`

- [ ] **Step 1: Write the failing month page tests**

```dart
import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('month page highlights the selected date and agenda title', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    expect(find.text('五月'), findsOneWidget);
    expect(find.text('星期三'), findsOneWidget);
    expect(find.text('设计评审'), findsOneWidget);
  });

  testWidgets('tapping a month cell updates the agenda sheet', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.byKey(const ValueKey('month-day-2026-05-15T00:00:00.000')));
    await tester.pumpAndSettle();

    expect(find.text('15'), findsWidgets);
    expect(find.text('产品同步会'), findsNothing);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/features/month/month_page_test.dart`
Expected: FAIL because `MonthPage` and keyed cells are not wired through the new shell yet

- [ ] **Step 3: Write minimal implementation**

```dart
class MonthPage extends StatelessWidget {
  const MonthPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Column(
            children: [
              MonthHeader(
                focusedMonth: store.focusedMonth,
                selectedDate: store.selectedDate,
                onTodayPressed: store.goToToday,
                onPreviousMonth: store.goToPreviousMonth,
                onNextMonth: store.goToNextMonth,
              ),
              WeekStrip(
                selectedDate: store.selectedDate,
                onDateSelected: store.selectDate,
              ),
              MonthGrid(
                focusedMonth: store.focusedMonth,
                selectedDate: store.selectedDate,
                eventsByDay: store.visibleEventsByDay,
                onDateSelected: store.selectDate,
              ),
              AgendaSheet(
                selectedDate: store.selectedDate,
                events: store.eventsFor(store.selectedDate),
                onAddPressed: () => Navigator.of(context).push(
                  CupertinoPageRoute<void>(
                    builder: (_) => const EventEditorPage(),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test test/features/month/month_page_test.dart`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/features/month lib/core/utils/date_utils.dart lib/app/calendar_app_shell.dart test/features/month/month_page_test.dart
git commit -m "refactor: extract month page into focused feature module"
```

## Task 4: 接入 Calendars 页面与显隐过滤

**Files:**
- Modify: `lib/app/calendar_app_shell.dart`, `lib/core/store/calendar_store.dart`, `lib/features/month/widgets/agenda_sheet.dart`
- Create: `lib/features/calendars/calendars_page.dart`, `lib/features/shared/empty_state.dart`, `test/features/calendars/calendars_page_test.dart`

- [ ] **Step 1: Write the failing calendars tests**

```dart
import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('calendars page lists visible calendar sources', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.text('Calendars'));
    await tester.pumpAndSettle();

    expect(find.text('工作'), findsOneWidget);
    expect(find.text('个人'), findsOneWidget);
  });

  testWidgets('disabling a calendar hides matching events from the month agenda', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.text('Calendars'));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const ValueKey('calendar-toggle-work')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('完成'));
    await tester.pumpAndSettle();

    expect(find.text('设计评审'), findsNothing);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/features/calendars/calendars_page_test.dart`
Expected: FAIL because `CalendarsPage` and source filtering are not yet connected

- [ ] **Step 3: Write minimal implementation**

```dart
class CalendarsPage extends StatelessWidget {
  const CalendarsPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Calendars'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => store.setActiveView(CalendarView.month),
          child: const Text('完成'),
        ),
      ),
      child: ListView(
        children: store.calendarSources.map((source) {
          final visible = store.isCalendarVisible(source.id);
          return CupertinoListTile.notched(
            key: ValueKey('calendar-toggle-${source.id}'),
            title: Text(source.name),
            leading: Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: source.color,
                shape: BoxShape.circle,
              ),
            ),
            trailing: CupertinoSwitch(
              value: visible,
              onChanged: (value) => store.setCalendarVisibility(source.id, value),
            ),
          );
        }).toList(),
      ),
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test test/features/calendars/calendars_page_test.dart`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/features/calendars lib/features/shared/empty_state.dart lib/core/store/calendar_store.dart lib/app/calendar_app_shell.dart test/features/calendars/calendars_page_test.dart
git commit -m "feat: add calendars management and visibility filters"
```

## Task 5: 打通事件编辑流

**Files:**
- Modify: `lib/core/store/calendar_store.dart`, `lib/features/month/widgets/agenda_sheet.dart`, `lib/app/calendar_app_shell.dart`
- Create: `lib/features/editor/event_editor_page.dart`, `test/features/editor/event_editor_page_test.dart`

- [ ] **Step 1: Write the failing editor test**

```dart
import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('creating an event from the editor returns to month page and shows it', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.byIcon(CupertinoIcons.add));
    await tester.pumpAndSettle();

    await tester.enterText(find.byKey(const ValueKey('event-title-field')), '晚餐');
    await tester.enterText(find.byKey(const ValueKey('event-location-field')), '静安');
    await tester.tap(find.text('添加'));
    await tester.pumpAndSettle();

    expect(find.text('晚餐'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/features/editor/event_editor_page_test.dart`
Expected: FAIL because the editor page and save action do not exist

- [ ] **Step 3: Write minimal implementation**

```dart
class EventEditorPage extends StatefulWidget {
  const EventEditorPage({super.key});

  @override
  State<EventEditorPage> createState() => _EventEditorPageState();
}

class _EventEditorPageState extends State<EventEditorPage> {
  final _titleController = TextEditingController();
  final _locationController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: const Text('新建事件'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () {
            store.createDraftEvent(
              title: _titleController.text.trim(),
              location: _locationController.text.trim(),
            );
            Navigator.of(context).pop();
          },
          child: const Text('添加'),
        ),
      ),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            CupertinoTextField(
              key: const ValueKey('event-title-field'),
              controller: _titleController,
              placeholder: '标题',
            ),
            const SizedBox(height: 12),
            CupertinoTextField(
              key: const ValueKey('event-location-field'),
              controller: _locationController,
              placeholder: '位置',
            ),
          ],
        ),
      ),
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test test/features/editor/event_editor_page_test.dart`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/features/editor/event_editor_page.dart lib/core/store/calendar_store.dart lib/features/month/widgets/agenda_sheet.dart lib/app/calendar_app_shell.dart test/features/editor/event_editor_page_test.dart
git commit -m "feat: add first-stage event editor flow"
```

## Task 6: 补齐 Day、List、Search、Inbox 页面骨架

**Files:**
- Modify: `lib/app/calendar_app_shell.dart`, `lib/core/store/calendar_store.dart`
- Create: `lib/features/day/day_page.dart`, `lib/features/list/list_page.dart`, `lib/features/search/search_page.dart`, `lib/features/inbox/inbox_page.dart`, `test/features/navigation/app_shell_navigation_test.dart`

- [ ] **Step 1: Write the failing navigation breadth test**

```dart
import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('shell can navigate to day, list, search and inbox experiences', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.text('列表'));
    await tester.pumpAndSettle();
    expect(find.text('已安排'), findsOneWidget);

    await tester.tap(find.byIcon(CupertinoIcons.search));
    await tester.pumpAndSettle();
    expect(find.text('搜索'), findsOneWidget);

    await tester.tap(find.text('收件箱'));
    await tester.pumpAndSettle();
    expect(find.text('没有新邀请'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/features/navigation/app_shell_navigation_test.dart`
Expected: FAIL because the destination pages are still missing or share old content

- [ ] **Step 3: Write minimal implementation**

```dart
class DayPage extends StatelessWidget {
  const DayPage({super.key});

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(middle: Text('日')),
      child: SafeArea(
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text('${store.selectedDate.month}月${store.selectedDate.day}日'),
            const SizedBox(height: 12),
            ...store.eventsFor(store.selectedDate).map((event) => Text(event.title)),
          ],
        ),
      ),
    );
  }
}

class ListPage extends StatelessWidget {
  const ListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(middle: Text('列表')),
      child: SafeArea(child: Center(child: Text('已安排'))),
    );
  }
}

class SearchPage extends StatelessWidget {
  const SearchPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(middle: Text('搜索')),
      child: SafeArea(child: Center(child: Text('搜索事件、地点或备注'))),
    );
  }
}

class InboxPage extends StatelessWidget {
  const InboxPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(middle: Text('收件箱')),
      child: SafeArea(child: Center(child: Text('没有新邀请'))),
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test test/features/navigation/app_shell_navigation_test.dart`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/features/day/day_page.dart lib/features/list/list_page.dart lib/features/search/search_page.dart lib/features/inbox/inbox_page.dart lib/app/calendar_app_shell.dart lib/core/store/calendar_store.dart test/features/navigation/app_shell_navigation_test.dart
git commit -m "feat: add first-stage day list search and inbox pages"
```

## Task 7: 整体回归与入口测试收口

**Files:**
- Modify: `test/widget_test.dart`, `test/app/calendar_app_test.dart`, `test/features/month/month_page_test.dart`

- [ ] **Step 1: Write the failing end-to-end smoke test**

```dart
import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('app smoke flow covers month selection and event creation', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    await tester.tap(find.byKey(const ValueKey('month-day-2026-05-14T00:00:00.000')));
    await tester.pumpAndSettle();
    expect(find.text('14'), findsWidgets);

    await tester.tap(find.byIcon(CupertinoIcons.add));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const ValueKey('event-title-field')), '走查');
    await tester.tap(find.text('添加'));
    await tester.pumpAndSettle();

    expect(find.text('走查'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/widget_test.dart`
Expected: FAIL until all renamed entry points and keys are aligned

- [ ] **Step 3: Write minimal implementation**

```dart
void main() {
  runApp(const CalendarApp());
}
```

```dart
testWidgets('calendar app smoke flow', (tester) async {
  tester.view.physicalSize = const Size(1179, 2556);
  tester.view.devicePixelRatio = 3.0;
  addTearDown(tester.view.resetPhysicalSize);
  addTearDown(tester.view.resetDevicePixelRatio);

  await tester.pumpWidget(const CalendarApp());

  expect(find.text('Calendars'), findsOneWidget);
  expect(find.text('月视图'), findsOneWidget);
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test`
Expected: PASS

Run: `flutter analyze`
Expected: No issues found

- [ ] **Step 5: Commit**

```bash
git add lib/main.dart test/widget_test.dart test/app/calendar_app_test.dart test/features/month/month_page_test.dart
git commit -m "test: close stage-one regression coverage for calendar shell"
```

## Task 8: 第一阶段视觉收尾与交付检查

**Files:**
- Modify: `lib/features/month/widgets/month_header.dart`, `lib/features/month/widgets/week_strip.dart`, `lib/features/month/widgets/month_grid.dart`, `lib/features/month/widgets/agenda_sheet.dart`, `lib/features/shared/app_bottom_bar.dart`

- [ ] **Step 1: Write the failing polish assertion**

```dart
import 'package:calendar_app/app/calendar_app.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('month page keeps iPhone-like anchors after refactor', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(const CalendarApp());

    expect(find.text('Calendars'), findsOneWidget);
    expect(find.text('今天'), findsOneWidget);
    expect(find.text('星期三'), findsOneWidget);
    expect(find.text('设计评审'), findsOneWidget);
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `flutter test test/features/month/month_page_test.dart`
Expected: FAIL if refactor lost the current month-page anchors or renamed labels incorrectly

- [ ] **Step 3: Write minimal implementation**

```dart
class MonthHeader extends StatelessWidget {
  const MonthHeader({
    super.key,
    required this.focusedMonth,
    required this.selectedDate,
    required this.onTodayPressed,
    required this.onPreviousMonth,
    required this.onNextMonth,
  });

  final DateTime focusedMonth;
  final DateTime selectedDate;
  final VoidCallback onTodayPressed;
  final VoidCallback onPreviousMonth;
  final VoidCallback onNextMonth;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: [
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => CalendarScope.of(context).setActiveView(CalendarView.calendars),
              child: const Text('Calendars'),
            ),
            const Spacer(),
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: onTodayPressed,
              child: const Text('今天'),
            ),
            const SizedBox(width: 12),
            const Icon(CupertinoIcons.search),
          ],
        ),
        Row(
          children: [
            Text('${selectedDate.year}', style: const TextStyle(color: CupertinoColors.systemGrey)),
            const Spacer(),
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: onPreviousMonth,
              child: const Icon(CupertinoIcons.chevron_left),
            ),
            CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: onNextMonth,
              child: const Icon(CupertinoIcons.chevron_right),
            ),
          ],
        ),
      ],
    );
  }
}

AppBottomBar(
  activeView: store.activeView,
  onSelect: store.setActiveView,
  onAddPressed: () => Navigator.of(context).push(
    CupertinoPageRoute<void>(builder: (_) => const EventEditorPage()),
  ),
)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `flutter test test/features/month/month_page_test.dart`
Expected: PASS

Run: `flutter test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/features/month/widgets lib/features/shared/app_bottom_bar.dart test/features/month/month_page_test.dart
git commit -m "style: restore iphone calendar visual anchors after modular refactor"
```

## Self-Review

### Spec Coverage

- `完整 App 框架`：由 Task 1、Task 2、Task 6 覆盖
- `月视图 + 底部日程卡片`：由 Task 3、Task 8 覆盖
- `日历管理`：由 Task 4 覆盖
- `事件编辑流`：由 Task 5 覆盖
- `测试与回归`：由 Task 1、Task 7、Task 8 覆盖

### Placeholder Scan

- 没有 `TODO`、`TBD`、`implement later`
- 每个任务都给出明确文件路径
- 每个测试步骤都给出明确命令

### Type Consistency

- 应用入口统一使用 `CalendarApp`
- 全局状态统一使用 `CalendarStore`
- 主入口枚举统一使用 `CalendarView`
- 日期主状态统一使用 `selectedDate`
- 月页跳转辅助方法统一使用 `goToToday`、`goToPreviousMonth`、`goToNextMonth`

### Notes For Executor

- 如果某个测试因为现有原型残留文本导致意外通过，先收紧断言再继续
- 如果 `CupertinoListTile` 在当前 Flutter 版本不可用，改为 `CupertinoListSection + CupertinoListTile` 的同版本可用写法，但保持页面结构与测试语义不变
- 执行时不要跳过 `flutter test` 的失败校验，必须看到 RED 再写实现

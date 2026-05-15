import 'package:calendar_app/core/models/calendar_event.dart';
import 'package:calendar_app/core/models/calendar_source.dart';
import 'package:calendar_app/core/store/calendar_scope.dart';
import 'package:calendar_app/core/store/calendar_store.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart' show TimeOfDay;

const _inviteeOptions = <_InviteeOption>[
  _InviteeOption(id: 'ava', name: 'Ava Wang', email: 'ava@bytedance.com'),
  _InviteeOption(id: 'leo', name: 'Leo Chen', email: 'leo@bytedance.com'),
  _InviteeOption(id: 'mila', name: 'Mila Xu', email: 'mila@bytedance.com'),
  _InviteeOption(id: 'noah', name: 'Noah Li', email: 'noah@bytedance.com'),
  _InviteeOption(id: 'zoe', name: 'Zoe Sun', email: 'zoe@bytedance.com'),
];

class EventEditorPage extends StatefulWidget {
  const EventEditorPage({super.key, this.initialEvent});

  final CalendarEvent? initialEvent;

  @override
  State<EventEditorPage> createState() => _EventEditorPageState();
}

class _EventEditorPageState extends State<EventEditorPage> {
  final _titleController = TextEditingController();
  final _locationController = TextEditingController();
  final _notesController = TextEditingController();
  final _urlController = TextEditingController();

  var _didInitialize = false;
  late bool _isAllDay;
  late DateTime _startDateTime;
  late DateTime _endDateTime;
  late String _selectedCalendarId;
  late EventRepeatRule _selectedRepeat;
  late List<EventAlertSetting> _selectedAlerts;
  late List<String> _selectedInvitees;

  @override
  void dispose() {
    _titleController.dispose();
    _locationController.dispose();
    _notesController.dispose();
    _urlController.dispose();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_didInitialize) {
      return;
    }
    final store = CalendarScope.of(context);
    final initialEvent = widget.initialEvent;
    final startDate = initialEvent?.date ?? store.selectedDate;
    final endDate = initialEvent?.endDate ?? startDate;
    _titleController.text = initialEvent?.title ?? '';
    _locationController.text = initialEvent?.location ?? '';
    _notesController.text = initialEvent?.notes ?? '';
    _urlController.text = initialEvent?.url ?? '';
    _selectedInvitees = List<String>.from(
      initialEvent?.invitees ?? const <String>[],
    );
    _isAllDay = initialEvent?.allDay ?? false;
    _startDateTime = DateTime(
      startDate.year,
      startDate.month,
      startDate.day,
      initialEvent?.start.hour ?? 18,
      initialEvent?.start.minute ?? 0,
    );
    _endDateTime = DateTime(
      endDate.year,
      endDate.month,
      endDate.day,
      initialEvent?.end.hour ?? 19,
      initialEvent?.end.minute ?? 0,
    );
    _selectedCalendarId = initialEvent?.calendarId ?? _defaultCalendarId(store);
    _selectedRepeat = initialEvent?.repeat ?? const EventRepeatRule.none();
    _selectedAlerts = List<EventAlertSetting>.from(
      initialEvent?.alerts ?? const <EventAlertSetting>[],
    );
    _didInitialize = true;
  }

  @override
  Widget build(BuildContext context) {
    final store = CalendarScope.of(context);
    final isEditing = widget.initialEvent != null;
    final groupedBackground = CupertinoColors.systemGroupedBackground
        .resolveFrom(context);
    final currentCalendar = _calendarSourceFor(store, _selectedCalendarId);

    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text(isEditing ? '编辑事件' : '新建事件'),
        trailing: CupertinoButton(
          key: const ValueKey('event-editor-save-button'),
          padding: EdgeInsets.zero,
          onPressed: _canSave ? () => _save(store, isEditing) : null,
          child: Text(isEditing ? '完成' : '添加'),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Container(
          color: groupedBackground,
          child: ListView(
            padding: const EdgeInsets.only(top: 12, bottom: 32),
            children: [
              CupertinoFormSection.insetGrouped(
                children: [
                  _EditorTextFieldRow(
                    fieldKey: const ValueKey('event-title-field'),
                    controller: _titleController,
                    placeholder: '标题',
                  ),
                  _EditorTextFieldRow(
                    fieldKey: const ValueKey('event-location-field'),
                    controller: _locationController,
                    placeholder: '位置',
                  ),
                  _EditorTextFieldRow(
                    fieldKey: const ValueKey('event-url-field'),
                    controller: _urlController,
                    placeholder: 'URL',
                  ),
                ],
              ),
              CupertinoFormSection.insetGrouped(
                children: [
                  CupertinoFormRow(
                    prefix: const Text('全天'),
                    child: CupertinoSwitch(
                      key: const ValueKey('event-all-day-switch'),
                      value: _isAllDay,
                      onChanged: (value) {
                        setState(() {
                          _isAllDay = value;
                          if (_endDateTime.isBefore(_startDateTime)) {
                            _endDateTime = _startDateTime;
                          }
                          if (!_isAllDay &&
                              !_normalizedTimedEnd().isAfter(_startDateTime)) {
                            _endDateTime = _startDateTime.add(
                              const Duration(hours: 1),
                            );
                          }
                        });
                      },
                    ),
                  ),
                  _EditorValueRow(
                    rowKey: const ValueKey('event-start-date-row'),
                    label: '开始日期',
                    value: _formatDate(_startDateTime),
                    onTap: () => _showDateTimePicker(
                      context,
                      title: '开始日期',
                      pickerKey: const ValueKey('event-start-date-picker'),
                      initialValue: _startDateTime,
                      mode: CupertinoDatePickerMode.date,
                      onConfirmed: (value) {
                        setState(() {
                          _startDateTime = DateTime(
                            value.year,
                            value.month,
                            value.day,
                            _startDateTime.hour,
                            _startDateTime.minute,
                          );
                          if (_endDateTime.isBefore(_startDateTime)) {
                            _endDateTime = _isAllDay
                                ? DateTime(
                                    _startDateTime.year,
                                    _startDateTime.month,
                                    _startDateTime.day,
                                    _endDateTime.hour,
                                    _endDateTime.minute,
                                  )
                                : _startDateTime.add(const Duration(hours: 1));
                          }
                        });
                      },
                    ),
                  ),
                  if (!_isAllDay)
                    _EditorValueRow(
                      rowKey: const ValueKey('event-start-time-row'),
                      label: '开始时间',
                      value: _formatClock(_startDateTime),
                      onTap: () => _showDateTimePicker(
                        context,
                        title: '开始时间',
                        pickerKey: const ValueKey('event-start-time-picker'),
                        initialValue: _startDateTime,
                        mode: CupertinoDatePickerMode.time,
                        onConfirmed: (value) {
                          setState(() {
                            _startDateTime = DateTime(
                              _startDateTime.year,
                              _startDateTime.month,
                              _startDateTime.day,
                              value.hour,
                              value.minute,
                            );
                            if (!_normalizedTimedEnd().isAfter(
                              _startDateTime,
                            )) {
                              _endDateTime = _startDateTime.add(
                                const Duration(hours: 1),
                              );
                            }
                          });
                        },
                      ),
                    ),
                  _EditorValueRow(
                    rowKey: const ValueKey('event-end-date-row'),
                    label: '结束日期',
                    value: _formatDate(_normalizedTimedEnd()),
                    onTap: () => _showDateTimePicker(
                      context,
                      title: '结束日期',
                      pickerKey: const ValueKey('event-end-date-picker'),
                      initialValue: _normalizedTimedEnd(),
                      mode: CupertinoDatePickerMode.date,
                      onConfirmed: (value) {
                        setState(() {
                          final candidate = DateTime(
                            value.year,
                            value.month,
                            value.day,
                            _endDateTime.hour,
                            _endDateTime.minute,
                          );
                          _endDateTime = candidate.isBefore(_startDateTime)
                              ? (_isAllDay
                                    ? DateTime(
                                        _startDateTime.year,
                                        _startDateTime.month,
                                        _startDateTime.day,
                                        _endDateTime.hour,
                                        _endDateTime.minute,
                                      )
                                    : _startDateTime.add(
                                        const Duration(hours: 1),
                                      ))
                              : candidate;
                        });
                      },
                    ),
                  ),
                  if (!_isAllDay)
                    _EditorValueRow(
                      rowKey: const ValueKey('event-end-time-row'),
                      label: '结束时间',
                      value: _formatClock(_normalizedTimedEnd()),
                      onTap: () => _showDateTimePicker(
                        context,
                        title: '结束时间',
                        pickerKey: const ValueKey('event-end-time-picker'),
                        initialValue: _normalizedTimedEnd(),
                        mode: CupertinoDatePickerMode.time,
                        onConfirmed: (value) {
                          setState(() {
                            final candidate = DateTime(
                              _endDateTime.year,
                              _endDateTime.month,
                              _endDateTime.day,
                              value.hour,
                              value.minute,
                            );
                            _endDateTime = candidate.isAfter(_startDateTime)
                                ? candidate
                                : _startDateTime.add(const Duration(hours: 1));
                          });
                        },
                      ),
                    ),
                  _EditorValueRow(
                    rowKey: const ValueKey('event-calendar-row'),
                    label: '日历',
                    value: currentCalendar?.name ?? _selectedCalendarId,
                    leadingDotColor: currentCalendar?.color.resolveFrom(
                      context,
                    ),
                    onTap: () => _showCalendarPicker(context, store),
                  ),
                  _EditorValueRow(
                    rowKey: const ValueKey('event-repeat-row'),
                    label: '重复',
                    value: eventRepeatLabel(_selectedRepeat),
                    onTap: () => _openRepeatRulePage(context),
                  ),
                  _EditorValueRow(
                    rowKey: const ValueKey('event-alert-row'),
                    label: '提醒',
                    value: eventAlertsSummary(_selectedAlerts),
                    onTap: () => _openAlertsPage(context),
                  ),
                  _EditorValueRow(
                    rowKey: const ValueKey('event-invitees-row'),
                    label: '邀请对象',
                    value: _inviteesSummary(),
                    onTap: () => _openInviteesPage(context),
                  ),
                ],
              ),
              CupertinoFormSection.insetGrouped(
                header: const Text('备注'),
                children: [
                  Container(
                    margin: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 10,
                    ),
                    decoration: BoxDecoration(
                      color: CupertinoColors.tertiarySystemGroupedBackground
                          .resolveFrom(context),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: CupertinoTextField(
                      key: const ValueKey('event-notes-field'),
                      controller: _notesController,
                      placeholder: '添加备注',
                      maxLines: 5,
                      minLines: 4,
                      decoration: null,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  bool get _canSave => _titleController.text.trim().isNotEmpty;

  Future<void> _openInviteesPage(BuildContext context) async {
    final result = await Navigator.of(context).push<List<String>>(
      CupertinoPageRoute<List<String>>(
        builder: (_) => InviteesPickerPage(initialEmails: _selectedInvitees),
      ),
    );
    if (result == null) {
      return;
    }
    setState(() {
      _selectedInvitees = result;
    });
  }

  Future<void> _openRepeatRulePage(BuildContext context) async {
    final result = await Navigator.of(context).push<EventRepeatRule>(
      CupertinoPageRoute<EventRepeatRule>(
        builder: (_) => RepeatRulePage(initialRule: _selectedRepeat),
      ),
    );
    if (result == null) {
      return;
    }
    setState(() {
      _selectedRepeat = result;
    });
  }

  Future<void> _openAlertsPage(BuildContext context) async {
    final result = await Navigator.of(context).push<List<EventAlertSetting>>(
      CupertinoPageRoute<List<EventAlertSetting>>(
        builder: (_) => MultiAlertsPage(initialAlerts: _selectedAlerts),
      ),
    );
    if (result == null) {
      return;
    }
    setState(() {
      _selectedAlerts = result;
    });
  }

  void _save(CalendarStore store, bool isEditing) {
    final title = _titleController.text.trim();
    final startDate = DateTime(
      _startDateTime.year,
      _startDateTime.month,
      _startDateTime.day,
    );
    final endDate = DateTime(
      _normalizedTimedEnd().year,
      _normalizedTimedEnd().month,
      _normalizedTimedEnd().day,
    );
    final startTime = _isAllDay
        ? const TimeOfDay(hour: 0, minute: 0)
        : TimeOfDay.fromDateTime(_startDateTime);
    final endTime = _isAllDay
        ? const TimeOfDay(hour: 23, minute: 59)
        : TimeOfDay.fromDateTime(_normalizedTimedEnd());

    if (isEditing) {
      store.updateEvent(
        id: widget.initialEvent!.id,
        title: title,
        date: startDate,
        endDate: endDate,
        start: startTime,
        end: endTime,
        calendarId: _selectedCalendarId,
        location: _locationController.text,
        notes: _notesController.text,
        repeat: _selectedRepeat,
        alerts: _selectedAlerts,
        invitees: _selectedInvitees,
        url: _urlController.text,
        allDay: _isAllDay,
      );
    } else {
      store.createDraftEvent(
        title: title,
        date: startDate,
        endDate: endDate,
        start: startTime,
        end: endTime,
        calendarId: _selectedCalendarId,
        location: _locationController.text,
        notes: _notesController.text,
        repeat: _selectedRepeat,
        alerts: _selectedAlerts,
        invitees: _selectedInvitees,
        url: _urlController.text,
        allDay: _isAllDay,
      );
    }
    Navigator.of(context).pop();
  }

  DateTime _normalizedTimedEnd() {
    return _endDateTime.isAfter(_startDateTime)
        ? _endDateTime
        : _startDateTime.add(const Duration(hours: 1));
  }

  String _inviteesSummary() {
    if (_selectedInvitees.isEmpty) {
      return '无';
    }
    final names = _selectedInvitees
        .map((email) {
          for (final item in _inviteeOptions) {
            if (item.email == email) {
              return item.name;
            }
          }
          return email;
        })
        .toList(growable: false);
    if (names.length == 1) {
      return names.first;
    }
    return '${names.first} 等 ${names.length} 人';
  }

  String _defaultCalendarId(CalendarStore store) {
    for (final source in store.calendarSources) {
      if (source.id == 'personal') {
        return source.id;
      }
    }
    return store.calendarSources.first.id;
  }

  CalendarSource? _calendarSourceFor(CalendarStore store, String id) {
    for (final source in store.calendarSources) {
      if (source.id == id) {
        return source;
      }
    }
    return null;
  }

  Future<void> _showDateTimePicker(
    BuildContext context, {
    required String title,
    required Key pickerKey,
    required DateTime initialValue,
    required CupertinoDatePickerMode mode,
    required ValueChanged<DateTime> onConfirmed,
  }) async {
    var selectedValue = initialValue;
    await showCupertinoModalPopup<void>(
      context: context,
      builder: (sheetContext) {
        return _PickerSheet(
          title: title,
          child: CupertinoDatePicker(
            key: pickerKey,
            mode: mode,
            use24hFormat: true,
            initialDateTime: initialValue,
            minuteInterval: mode == CupertinoDatePickerMode.time ? 5 : 1,
            onDateTimeChanged: (value) {
              selectedValue = value;
            },
          ),
          onDone: () {
            onConfirmed(selectedValue);
            Navigator.of(sheetContext).pop();
          },
          onCancel: () {
            Navigator.of(sheetContext).pop();
          },
        );
      },
    );
  }

  Future<void> _showCalendarPicker(
    BuildContext context,
    CalendarStore store,
  ) async {
    await showCupertinoModalPopup<void>(
      context: context,
      builder: (sheetContext) {
        return _EditorSelectionSheet(
          title: '选择日历',
          children: store.calendarSources
              .map<Widget>((source) {
                return _EditorSelectionTile(
                  key: ValueKey('event-calendar-option-${source.id}'),
                  title: source.name,
                  subtitle: source.id,
                  dotColor: source.color.resolveFrom(sheetContext),
                  selected: _selectedCalendarId == source.id,
                  onTap: () {
                    setState(() {
                      _selectedCalendarId = source.id;
                    });
                    Navigator.of(sheetContext).pop();
                  },
                );
              })
              .toList(growable: false),
        );
      },
    );
  }

  String _formatDate(DateTime value) {
    return '${value.year}年${value.month}月${value.day}日';
  }

  String _formatClock(DateTime value) {
    final hour = value.hour.toString().padLeft(2, '0');
    final minute = value.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}

class InviteesPickerPage extends StatefulWidget {
  const InviteesPickerPage({super.key, required this.initialEmails});

  final List<String> initialEmails;

  @override
  State<InviteesPickerPage> createState() => _InviteesPickerPageState();
}

class _InviteesPickerPageState extends State<InviteesPickerPage> {
  late Set<String> _selectedEmails;

  @override
  void initState() {
    super.initState();
    _selectedEmails = widget.initialEmails.toSet();
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        previousPageTitle: '返回',
        middle: const Text('邀请对象'),
        trailing: CupertinoButton(
          key: const ValueKey('invitees-done-button'),
          padding: EdgeInsets.zero,
          onPressed: () {
            final ordered = _inviteeOptions
                .where((item) => _selectedEmails.contains(item.email))
                .map((item) => item.email)
                .toList(growable: false);
            Navigator.of(context).pop(ordered);
          },
          child: const Text('完成'),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            Container(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
              decoration: BoxDecoration(
                color: CupertinoColors.secondarySystemGroupedBackground
                    .resolveFrom(context),
                borderRadius: BorderRadius.circular(18),
              ),
              child: Text(
                _selectedEmails.isEmpty
                    ? '未选择联系人'
                    : '已选择 ${_selectedEmails.length} 位联系人',
                style: TextStyle(
                  fontSize: 15,
                  color: CupertinoColors.secondaryLabel.resolveFrom(context),
                ),
              ),
            ),
            const SizedBox(height: 12),
            ..._inviteeOptions.map((contact) {
              final selected = _selectedEmails.contains(contact.email);
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: CupertinoButton(
                  key: ValueKey('invitee-option-${contact.id}'),
                  padding: EdgeInsets.zero,
                  onPressed: () {
                    setState(() {
                      if (selected) {
                        _selectedEmails.remove(contact.email);
                      } else {
                        _selectedEmails.add(contact.email);
                      }
                    });
                  },
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                    decoration: BoxDecoration(
                      color: CupertinoColors.systemBackground.resolveFrom(
                        context,
                      ),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: CupertinoColors.activeBlue.resolveFrom(
                              context,
                            ),
                            shape: BoxShape.circle,
                          ),
                          alignment: Alignment.center,
                          child: Text(
                            contact.name.substring(0, 1),
                            style: const TextStyle(
                              color: CupertinoColors.white,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                contact.name,
                                style: const TextStyle(
                                  fontSize: 17,
                                  fontWeight: FontWeight.w600,
                                  color: CupertinoColors.label,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                contact.email,
                                style: TextStyle(
                                  fontSize: 14,
                                  color: CupertinoColors.secondaryLabel
                                      .resolveFrom(context),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Icon(
                          selected
                              ? CupertinoIcons.check_mark_circled_solid
                              : CupertinoIcons.circle,
                          color: selected
                              ? CupertinoColors.activeBlue
                              : CupertinoColors.systemGrey3,
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }),
          ],
        ),
      ),
    );
  }
}

enum _RepeatMode { never, everyDay, everyWeek, weekdays, custom }

class RepeatRulePage extends StatefulWidget {
  const RepeatRulePage({super.key, required this.initialRule});

  final EventRepeatRule initialRule;

  @override
  State<RepeatRulePage> createState() => _RepeatRulePageState();
}

class _RepeatRulePageState extends State<RepeatRulePage> {
  late _RepeatMode _mode;
  late int _customInterval;
  late EventRepeatUnit _customUnit;

  @override
  void initState() {
    super.initState();
    _customInterval = widget.initialRule.interval;
    _customUnit = widget.initialRule.unit;
    _mode = _modeFor(widget.initialRule);
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        previousPageTitle: '返回',
        middle: const Text('重复'),
        trailing: CupertinoButton(
          key: const ValueKey('repeat-rule-done-button'),
          padding: EdgeInsets.zero,
          onPressed: () {
            Navigator.of(context).pop(_buildRule());
          },
          child: const Text('完成'),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            _modeTile(
              context,
              key: const ValueKey('repeat-mode-never'),
              title: '从不',
              mode: _RepeatMode.never,
            ),
            _modeTile(
              context,
              key: const ValueKey('repeat-mode-everyDay'),
              title: '每天',
              mode: _RepeatMode.everyDay,
            ),
            _modeTile(
              context,
              key: const ValueKey('repeat-mode-everyWeek'),
              title: '每周',
              mode: _RepeatMode.everyWeek,
            ),
            _modeTile(
              context,
              key: const ValueKey('repeat-mode-weekdays'),
              title: '工作日',
              mode: _RepeatMode.weekdays,
            ),
            _modeTile(
              context,
              key: const ValueKey('repeat-mode-custom'),
              title: '自定义',
              subtitle: '例如每 2 周、每 3 月',
              mode: _RepeatMode.custom,
            ),
            if (_mode == _RepeatMode.custom) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
                decoration: BoxDecoration(
                  color: CupertinoColors.systemBackground.resolveFrom(context),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Text('间隔', style: TextStyle(fontSize: 17)),
                        const Spacer(),
                        CupertinoButton(
                          key: const ValueKey('repeat-custom-interval-minus'),
                          padding: EdgeInsets.zero,
                          onPressed: _customInterval <= 1
                              ? null
                              : () {
                                  setState(() {
                                    _customInterval -= 1;
                                  });
                                },
                          child: const Icon(CupertinoIcons.minus_circle),
                        ),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          child: Text(
                            '$_customInterval',
                            key: const ValueKey('repeat-custom-interval-value'),
                            style: const TextStyle(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        CupertinoButton(
                          key: const ValueKey('repeat-custom-interval-plus'),
                          padding: EdgeInsets.zero,
                          onPressed: () {
                            setState(() {
                              _customInterval += 1;
                            });
                          },
                          child: const Icon(CupertinoIcons.plus_circle),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    _EditorValueRow(
                      rowKey: const ValueKey('repeat-custom-unit-row'),
                      label: '单位',
                      value: _unitLabel(_customUnit),
                      onTap: () => _showRepeatUnitPicker(context),
                    ),
                    const SizedBox(height: 12),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        '当前规则：${eventRepeatLabel(_buildRule())}',
                        key: const ValueKey('repeat-custom-summary'),
                        style: TextStyle(
                          fontSize: 15,
                          color: CupertinoColors.secondaryLabel.resolveFrom(
                            context,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _modeTile(
    BuildContext context, {
    required Key key,
    required String title,
    String? subtitle,
    required _RepeatMode mode,
  }) {
    final selected = _mode == mode;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: CupertinoButton(
        key: key,
        padding: EdgeInsets.zero,
        onPressed: () {
          setState(() {
            _mode = mode;
          });
        },
        child: Container(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          decoration: BoxDecoration(
            color: CupertinoColors.systemBackground.resolveFrom(context),
            borderRadius: BorderRadius.circular(18),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 17,
                        fontWeight: FontWeight.w600,
                        color: CupertinoColors.label,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: TextStyle(
                          fontSize: 13,
                          color: CupertinoColors.secondaryLabel.resolveFrom(
                            context,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                selected
                    ? CupertinoIcons.check_mark_circled_solid
                    : CupertinoIcons.circle,
                color: selected
                    ? CupertinoColors.activeBlue
                    : CupertinoColors.systemGrey3,
              ),
            ],
          ),
        ),
      ),
    );
  }

  _RepeatMode _modeFor(EventRepeatRule rule) {
    if (rule.kind == EventRepeatKind.none) {
      return _RepeatMode.never;
    }
    if (rule.kind == EventRepeatKind.weekdays) {
      return _RepeatMode.weekdays;
    }
    if (rule.unit == EventRepeatUnit.day && rule.interval == 1) {
      return _RepeatMode.everyDay;
    }
    if (rule.unit == EventRepeatUnit.week && rule.interval == 1) {
      return _RepeatMode.everyWeek;
    }
    return _RepeatMode.custom;
  }

  EventRepeatRule _buildRule() {
    switch (_mode) {
      case _RepeatMode.never:
        return const EventRepeatRule.none();
      case _RepeatMode.everyDay:
        return const EventRepeatRule.interval(unit: EventRepeatUnit.day);
      case _RepeatMode.everyWeek:
        return const EventRepeatRule.interval(unit: EventRepeatUnit.week);
      case _RepeatMode.weekdays:
        return const EventRepeatRule.weekdays();
      case _RepeatMode.custom:
        return EventRepeatRule.interval(
          unit: _customUnit,
          interval: _customInterval,
        );
    }
  }

  Future<void> _showRepeatUnitPicker(BuildContext context) async {
    await showCupertinoModalPopup<void>(
      context: context,
      builder: (sheetContext) {
        return _EditorSelectionSheet(
          title: '重复单位',
          children: EventRepeatUnit.values
              .map((unit) {
                return _EditorSelectionTile(
                  key: ValueKey('repeat-custom-unit-option-${unit.name}'),
                  title: _unitLabel(unit),
                  selected: _customUnit == unit,
                  onTap: () {
                    setState(() {
                      _customUnit = unit;
                    });
                    Navigator.of(sheetContext).pop();
                  },
                );
              })
              .toList(growable: false),
        );
      },
    );
  }

  String _unitLabel(EventRepeatUnit unit) {
    return switch (unit) {
      EventRepeatUnit.day => '天',
      EventRepeatUnit.week => '周',
      EventRepeatUnit.month => '月',
      EventRepeatUnit.year => '年',
    };
  }
}

class MultiAlertsPage extends StatefulWidget {
  const MultiAlertsPage({super.key, required this.initialAlerts});

  final List<EventAlertSetting> initialAlerts;

  @override
  State<MultiAlertsPage> createState() => _MultiAlertsPageState();
}

class _MultiAlertsPageState extends State<MultiAlertsPage> {
  late Set<EventAlertSetting> _selectedAlerts;

  @override
  void initState() {
    super.initState();
    _selectedAlerts = widget.initialAlerts.toSet();
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        previousPageTitle: '返回',
        middle: const Text('提醒'),
        trailing: CupertinoButton(
          key: const ValueKey('alerts-done-button'),
          padding: EdgeInsets.zero,
          onPressed: () {
            Navigator.of(context).pop(_orderedAlerts());
          },
          child: const Text('完成'),
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: [
            CupertinoButton(
              key: const ValueKey('alerts-none-row'),
              padding: EdgeInsets.zero,
              onPressed: () {
                setState(() {
                  _selectedAlerts.clear();
                });
              },
              child: _selectionCard(
                context,
                title: '无',
                selected: _selectedAlerts.isEmpty,
              ),
            ),
            const SizedBox(height: 10),
            ...EventAlertLeadTime.values.map((alert) {
              final setting = EventAlertSetting.beforeEvent(alert);
              final selected = _selectedAlerts.contains(setting);
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: CupertinoButton(
                  key: ValueKey('alerts-option-${alert.name}'),
                  padding: EdgeInsets.zero,
                  onPressed: () {
                    setState(() {
                      if (selected) {
                        _selectedAlerts.remove(setting);
                      } else {
                        _selectedAlerts.add(setting);
                      }
                    });
                  },
                  child: _selectionCard(
                    context,
                    title: eventAlertLeadTimeLabel(alert),
                    selected: selected,
                  ),
                ),
              );
            }),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.fromLTRB(4, 0, 4, 8),
              alignment: Alignment.centerLeft,
              child: Text(
                '高级提醒',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: CupertinoColors.secondaryLabel.resolveFrom(context),
                ),
              ),
            ),
            ..._advancedAlertRows(context),
          ],
        ),
      ),
    );
  }

  Widget _selectionCard(
    BuildContext context, {
    required String title,
    required bool selected,
    String? subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      decoration: BoxDecoration(
        color: CupertinoColors.systemBackground.resolveFrom(context),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 17,
                    fontWeight: FontWeight.w600,
                    color: CupertinoColors.label,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: CupertinoColors.secondaryLabel.resolveFrom(
                        context,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
          Icon(
            selected
                ? CupertinoIcons.check_mark_circled_solid
                : CupertinoIcons.circle,
            color: selected
                ? CupertinoColors.activeBlue
                : CupertinoColors.systemGrey3,
          ),
        ],
      ),
    );
  }

  List<Widget> _advancedAlertRows(BuildContext context) {
    final configs = <_AdvancedAlertOption>[
      const _AdvancedAlertOption(
        setting: EventAlertSetting.timeToLeave(),
        key: 'alerts-advanced-timeToLeave',
        title: '出发时间提醒',
        subtitle: '根据事件时间和路程提前提醒你出发',
      ),
      const _AdvancedAlertOption(
        setting: EventAlertSetting.arriveAtLocation(),
        key: 'alerts-advanced-arriveAtLocation',
        title: '到达地点提醒',
        subtitle: '到达事件位置时提醒',
      ),
      const _AdvancedAlertOption(
        setting: EventAlertSetting.leaveLocation(),
        key: 'alerts-advanced-leaveLocation',
        title: '离开地点提醒',
        subtitle: '离开事件位置时提醒',
      ),
    ];
    return configs
        .map((config) {
          final selected = _selectedAlerts.contains(config.setting);
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: CupertinoButton(
              key: ValueKey(config.key),
              padding: EdgeInsets.zero,
              onPressed: () {
                setState(() {
                  if (selected) {
                    _selectedAlerts.remove(config.setting);
                  } else {
                    _selectedAlerts.add(config.setting);
                  }
                });
              },
              child: _selectionCard(
                context,
                title: config.title,
                subtitle: config.subtitle,
                selected: selected,
              ),
            ),
          );
        })
        .toList(growable: false);
  }

  List<EventAlertSetting> _orderedAlerts() {
    final ordered = <EventAlertSetting>[];
    for (final alert in EventAlertLeadTime.values) {
      final setting = EventAlertSetting.beforeEvent(alert);
      if (_selectedAlerts.contains(setting)) {
        ordered.add(setting);
      }
    }
    const advanced = <EventAlertSetting>[
      EventAlertSetting.timeToLeave(),
      EventAlertSetting.arriveAtLocation(),
      EventAlertSetting.leaveLocation(),
    ];
    for (final setting in advanced) {
      if (_selectedAlerts.contains(setting)) {
        ordered.add(setting);
      }
    }
    return ordered;
  }
}

class _PickerSheet extends StatelessWidget {
  const _PickerSheet({
    required this.title,
    required this.child,
    required this.onDone,
    required this.onCancel,
  });

  final String title;
  final Widget child;
  final VoidCallback onDone;
  final VoidCallback onCancel;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 356,
      decoration: BoxDecoration(
        color: CupertinoColors.systemGroupedBackground.resolveFrom(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Container(
            width: 36,
            height: 5,
            decoration: BoxDecoration(
              color: CupertinoColors.systemGrey4.resolveFrom(context),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          SizedBox(
            height: 48,
            child: Row(
              children: [
                CupertinoButton(
                  key: const ValueKey('event-picker-cancel-button'),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  onPressed: onCancel,
                  child: const Text('取消'),
                ),
                Expanded(
                  child: Text(
                    title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                CupertinoButton(
                  key: const ValueKey('event-picker-done-button'),
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  onPressed: onDone,
                  child: const Text('完成'),
                ),
              ],
            ),
          ),
          Container(
            height: 0.5,
            color: CupertinoColors.separator.resolveFrom(context),
          ),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _EditorSelectionSheet extends StatelessWidget {
  const _EditorSelectionSheet({required this.title, required this.children});

  final String title;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 410,
      decoration: BoxDecoration(
        color: CupertinoColors.systemGroupedBackground.resolveFrom(context),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(18)),
      ),
      child: Column(
        children: [
          const SizedBox(height: 8),
          Container(
            width: 36,
            height: 5,
            decoration: BoxDecoration(
              color: CupertinoColors.systemGrey4.resolveFrom(context),
              borderRadius: BorderRadius.circular(999),
            ),
          ),
          SizedBox(
            height: 52,
            child: Row(
              children: [
                const SizedBox(width: 16),
                Expanded(
                  child: Text(
                    title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                CupertinoButton(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text('关闭'),
                ),
              ],
            ),
          ),
          Container(
            height: 0.5,
            color: CupertinoColors.separator.resolveFrom(context),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 24),
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: CupertinoColors.systemBackground.resolveFrom(
                      context,
                    ),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(children: children),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EditorSelectionTile extends StatelessWidget {
  const _EditorSelectionTile({
    super.key,
    required this.title,
    required this.onTap,
    required this.selected,
    this.subtitle,
    this.dotColor,
  });

  final String title;
  final VoidCallback onTap;
  final bool selected;
  final String? subtitle;
  final Color? dotColor;

  @override
  Widget build(BuildContext context) {
    return CupertinoButton(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      onPressed: onTap,
      child: Row(
        children: [
          if (dotColor != null) ...[
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: dotColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: CupertinoColors.label,
                    fontSize: 17,
                  ),
                ),
                if (subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle!,
                    style: TextStyle(
                      color: CupertinoColors.secondaryLabel.resolveFrom(
                        context,
                      ),
                      fontSize: 13,
                    ),
                  ),
                ],
              ],
            ),
          ),
          Icon(
            selected
                ? CupertinoIcons.check_mark_circled_solid
                : CupertinoIcons.circle,
            color: selected
                ? CupertinoColors.activeBlue
                : CupertinoColors.systemGrey3,
            size: 20,
          ),
        ],
      ),
    );
  }
}

class _EditorTextFieldRow extends StatelessWidget {
  const _EditorTextFieldRow({
    required this.fieldKey,
    required this.controller,
    required this.placeholder,
  });

  final Key fieldKey;
  final TextEditingController controller;
  final String placeholder;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      child: CupertinoTextField(
        key: fieldKey,
        controller: controller,
        placeholder: placeholder,
        decoration: null,
      ),
    );
  }
}

class _EditorValueRow extends StatelessWidget {
  const _EditorValueRow({
    required this.rowKey,
    required this.label,
    required this.value,
    required this.onTap,
    this.leadingDotColor,
  });

  final Key rowKey;
  final String label;
  final String value;
  final VoidCallback onTap;
  final Color? leadingDotColor;

  @override
  Widget build(BuildContext context) {
    return CupertinoButton(
      key: rowKey,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      onPressed: onTap,
      child: Row(
        children: [
          Text(
            label,
            style: const TextStyle(color: CupertinoColors.label, fontSize: 17),
          ),
          const Spacer(),
          if (leadingDotColor != null) ...[
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: leadingDotColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                color: CupertinoColors.secondaryLabel.resolveFrom(context),
                fontSize: 17,
              ),
            ),
          ),
          const SizedBox(width: 6),
          Icon(
            CupertinoIcons.chevron_forward,
            size: 16,
            color: CupertinoColors.tertiaryLabel.resolveFrom(context),
          ),
        ],
      ),
    );
  }
}

class _InviteeOption {
  const _InviteeOption({
    required this.id,
    required this.name,
    required this.email,
  });

  final String id;
  final String name;
  final String email;
}

class _AdvancedAlertOption {
  const _AdvancedAlertOption({
    required this.setting,
    required this.key,
    required this.title,
    required this.subtitle,
  });

  final EventAlertSetting setting;
  final String key;
  final String title;
  final String subtitle;
}
